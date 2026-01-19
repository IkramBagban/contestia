// docs : https://ce.judge0.com/#submissions-submission-post
import axios from "axios"
import type { RunCodeParams, RunResult } from "../../utils/types"

const JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com"

class Judge0Manager {
  JUDGE0_URL: string | undefined;
  constructor() {
    this.JUDGE0_URL = JUDGE0_URL;
  }

  async getLanguages() {
    const response = await axios.get(`${this.JUDGE0_URL}/languages`)
    return response.data
  }

  async runCode(problem: RunCodeParams): Promise<RunResult> {
    const { code, funcName, testCases, languageId } = problem

    if (!code || !funcName || !testCases?.length) {
      return {
        passed: 0,
        failed: 0,
        total: 0,
        results: [],
        compilationError: "Invalid problem input"
      }
    }

    const res = await axios.post(
      `${this.JUDGE0_URL}/submissions/?wait=true&base64_encoded=false`,
      {
        source_code: `
${code}

let stdInput = "";
process.stdin.on("data", chunk => stdInput += chunk);

process.stdin.on("end", () => {
  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;

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

  console.log(JSON.stringify({ results, totalPassed, totalFailed }));
});
        `,
        language_id: languageId,
        stdin: JSON.stringify(testCases)
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    )

    const data = res.data

    if (data.compile_output) {
      return {
        passed: 0,
        failed: testCases.length,
        total: testCases.length,
        results: [],
        compilationError: data.compile_output
      }
    }

    if (data.stderr) {
      return {
        passed: 0,
        failed: testCases.length,
        total: testCases.length,
        results: [],
        compilationError: data.stderr
      }
    }

    if (data.stdout) {
      try {
        const parsed = JSON.parse(data.stdout)

        return {
          passed: parsed.totalPassed,
          failed: parsed.totalFailed,
          total: testCases.length,
          results: parsed.results,
          compilationError: null
        }
      } catch {
        return {
          passed: 0,
          failed: testCases.length,
          total: testCases.length,
          results: [],
          compilationError: "Invalid JSON output from Judge0"
        }
      }
    }

    return {
      passed: 0,
      failed: testCases.length,
      total: testCases.length,
      results: [],
      compilationError: "No output from Judge0"
    }
  }
}

export default Judge0Manager
