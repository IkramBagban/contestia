// docs : https://ce.judge0.com/#submissions-submission-post
import axios from "axios";
import type { RunCodeParams, RunResult } from "../../utils/types";

const JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com";

class Judge0Manager {
  JUDGE0_URL: string | undefined;
  constructor() {
    this.JUDGE0_URL = JUDGE0_URL;
  }

  async getLanguages() {
    const response = await axios.get(`${this.JUDGE0_URL}/languages`);
    return response.data;
  }

  async runCode(problem: RunCodeParams): Promise<RunResult> {
    const { code, funcName, testCases, languageId } = problem;

    if (!code || !funcName || !testCases?.length) {
      return {
        passed: 0,
        failed: 0,
        total: 0,
        results: [],
        compilationError: "Invalid problem input",
      };
    }

    const sourceCode = this.getLanguageHarness(
      languageId,
      code,
      funcName,
      testCases,
    );

    if (!sourceCode) {
      return {
        passed: 0,
        failed: 0,
        total: 0,
        results: [],
        compilationError: `Language ID ${languageId} not supported for execution. Please choose another.`,
      };
    }

    try {
      const res = await axios.post(
        `${this.JUDGE0_URL}/submissions/?wait=true&base64_encoded=false`,
        {
          source_code: sourceCode,
          language_id: languageId,
          stdin: JSON.stringify(testCases),
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = res.data;

      if (data.compile_output || data.stderr) {
        return {
          passed: 0,
          failed: testCases.length,
          total: testCases.length,
          results: [],
          compilationError: data.compile_output || data.stderr,
        };
      }

      if (data.stdout) {
        try {
          const parsed = JSON.parse(data.stdout);

          return {
            passed: parsed.totalPassed,
            failed: parsed.totalFailed,
            total: testCases.length,
            results: parsed.results,
            compilationError: null,
          };
        } catch {
          return {
            passed: 0,
            failed: testCases.length,
            total: testCases.length,
            results: [],
            compilationError:
              "Invalid JSON output from Judge0. The code executed but did not return the expected test format.",
          };
        }
      }

      return {
        passed: 0,
        failed: testCases.length,
        total: testCases.length,
        results: [],
        compilationError: "No output from Judge0",
      };
    } catch (error: any) {
      console.error("Judge0 API Error:", error);
      return {
        passed: 0,
        failed: 0,
        total: 0,
        results: [],
        compilationError: error.message || "Judge0 Connection Error",
      };
    }
  }

  private getLanguageHarness(
    languageId: number | string,
    code: string,
    funcName: string,
    testCases: any[] = [],
  ): string | null {
    const langId = Number(languageId);

    switch (langId) {
      case 63: // JavaScript (Node.js)
        return `
${code}

let stdInput = "";
process.stdin.on("data", chunk => stdInput += chunk);

process.stdin.on("end", () => {
  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;

try {
  const testCases = JSON.parse(stdInput);

  for (let i =0; i< testCases.length; i++) {
    const tc = testCases[i];
    try {
      const output = ${funcName}(...tc.input);

      const passed = JSON.stringify(output) === JSON.stringify(tc.expectedOutput);

      if (passed) totalPassed++;
      else totalFailed++;

      results.push({
        testCaseId: tc.id,
        input:tc.input,
        actualOutput: output,
        expectedOutput: tc.expectedOutput,
        passed
      });
    } catch (err) {
      totalFailed++;
      results.push({
        testCaseId: tc.id,
        input: tc.input,
        actualOutput: String(err),
        expectedOutput: tc.expectedOutput,
        passed: false,
        error: String(err)
      });
    }
  }
} catch (e) {
  console.error("Harness Error:", e);
}

console.log(JSON.stringify({ results, totalPassed, totalFailed }));
});`;

      case 71: // Python (3.8.1)
        return `
import json
import sys

# User Code
${code}

def run_tests():
  try:
      input_data = sys.stdin.read()
      if not input_data:
          return

      test_cases = json.loads(input_data)
      results = []
      total_passed = 0
      total_failed = 0

      for tc in test_cases:
          try:
              args = tc.get('input', [])
              if '${funcName}' in globals():
                  user_func = globals()['${funcName}']
                  actual_output = user_func(*args)
                  is_passed = (actual_output == tc.get('expectedOutput'))
                  
                  if is_passed:
                      total_passed += 1
                  else:
                      total_failed += 1
                      
                  results.append({
                      "testCaseId": tc.get("id"),
                      "input": args,
                      "actualOutput": actual_output,
                      "expectedOutput": tc.get("expectedOutput"),
                      "passed": is_passed
                  })
              else:
                  raise Exception(f"Function '${funcName}' not found")
          except Exception as e:
              total_failed += 1
              results.append({
                  "testCaseId": tc.get("id"),
                  "input": tc.get("input"),
                  "actualOutput": str(e),
                  "expectedOutput": tc.get("expectedOutput"),
                  "passed": False,
                  "error": str(e)
              })

      print(json.dumps({
          "results": results, 
          "totalPassed": total_passed, 
          "totalFailed": total_failed
      }))
  except Exception as e:
      print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
  run_tests()`;

      case 54: // C++ (GCC 9.2.0)
        return this.generateCppHarness(code, funcName, testCases);

      default:
        return null;
    }
  }

  private generateCppHarness(
    code: string,
    funcName: string,
    testCases: any[],
  ): string {
    if (!testCases || testCases.length === 0) return code;

    // Type inference helper
    const getCppType = (val: any): string => {
      if (Array.isArray(val)) {
        if (val.length === 0) return "std::vector<int>"; // Fallback assumption
        return `std::vector<${getCppType(val[0])}>`;
      }
      if (typeof val === "number") {
        return Number.isInteger(val) ? "int" : "double";
      }
      if (typeof val === "boolean") return "bool";
      return "std::string";
    };

    const formatCppValue = (val: any, type: string): string => {
      if (type.startsWith("std::vector")) {
        const elemType = type.substring(12, type.lastIndexOf(">"));
        const elems: string = (val as any[])
          .map((v) => formatCppValue(v, elemType))
          .join(", ");
        return `{${elems}}`;
      }
      if (type === "std::string") return `"${val}"`;
      if (type === "bool") return val ? "true" : "false";
      return String(val);
    };

    const firstCase = testCases[0];
    const inputs: any[] = firstCase.input || [];
    const output = firstCase.expectedOutput;

    const argTypes = inputs.map(getCppType);
    const returnType = getCppType(output);

    let harness = `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>

using namespace std;

// --- User Code Start ---
${code}
// --- User Code End ---

// Serialization Helpers
template <typename T>
string _toJson(T val) { return to_string(val); }
string _toJson(string val) { return "\\"" + val + "\\""; }
string _toJson(bool val) { return val ? "true" : "false"; }
string _toJson(const char* val) { return "\\"" + string(val) + "\\""; }

template<typename T>
string _toJson(const vector<T>& vec) {
  string s = "[";
  for(size_t i=0; i<vec.size(); ++i) {
      s += _toJson(vec[i]);
      if(i < vec.size()-1) s += ",";
  }
  s += "]";
  return s;
}

int main() {
  int totalPassed = 0;
  int totalFailed = 0;
  
  cout << "{ \\"results\\": [";
`;

    // Loop Generation
    testCases.forEach((tc, idx) => {
      const inputArgs = (tc.input as any[])
        .map((arg, i) => formatCppValue(arg, argTypes[i] || "int"))
        .join(", ");
      const expectedVal = formatCppValue(
        tc.expectedOutput,
        returnType || "int",
      );

      const inputJson = JSON.stringify(tc.input).replace(/"/g, '\\"');
      const expectedJson = JSON.stringify(tc.expectedOutput).replace(
        /"/g,
        '\\"',
      );

      harness += `
  {
      try {
          auto result = ${funcName}(${inputArgs});
          auto expected = ${expectedVal};
          
          bool passed = (result == expected);
          if (passed) totalPassed++; else totalFailed++;
          
          if (${idx} > 0) cout << ",";
          cout << "{ \\"testCaseId\\": ${tc.id}, ";
          cout << "\\"input\\": \\"${inputJson}\\", ";
          cout << "\\"expectedOutput\\": \\"${expectedJson}\\", ";
          cout << "\\"actualOutput\\": " << _toJson(result) << ", ";
          cout << "\\"passed\\": " << (passed ? "true" : "false") << " }";
      } catch (...) {
          totalFailed++;
          if (${idx} > 0) cout << ",";
          cout << "{ \\"testCaseId\\": ${tc.id}, \\"error\\": \\"Runtime Error\\", \\"passed\\": false }";
      }
  }
`;
    });

    harness += `
  ],
  \\"totalPassed\\": " << totalPassed << ",
  \\"totalFailed\\": " << totalFailed << "
  }" << endl;

  return 0;
}`;

    return harness;
  }
}

export default Judge0Manager;
