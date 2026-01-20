import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Info } from "lucide-react"
import { useNavigate, useSearchParams, useParams } from "react-router-dom"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useCreateQuestion, useQuestion, useUpdateQuestion } from "@/hooks/use-queries"
import { toast } from "sonner"

import { RichTextEditor } from "@/components/ui/rich-text-editor"

export function CreateQuestion() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const typeParam = searchParams.get("type")

  const createQuestion = useCreateQuestion()
  const updateQuestion = useUpdateQuestion()
  const { data: existingQuestion, isLoading: isLoadingQuestion } = useQuestion(id || "")

  const [questionText, setQuestionText] = useState("")
  // const [description, setDescription] = useState("")
  const [points, setPoints] = useState(10)
  const [funcName, setFuncName] = useState("")
  const [options, setOptions] = useState([
    { id: 'A', text: '', isCorrect: false },
    { id: 'B', text: '', isCorrect: false },
    { id: 'C', text: '', isCorrect: false },
    { id: 'D', text: '', isCorrect: false },
  ])
  const [testCases, setTestCases] = useState<{ input: string, expectedOutput: string, isHidden: boolean }[]>([
    { input: '', expectedOutput: '', isHidden: false }
  ])

  const [type, setType] = useState<"mcq" | "dsa" | "sandbox">("mcq")

  useEffect(() => {
    if (typeParam) {
      setType(typeParam as any)
    } else if (existingQuestion) {
      setType(existingQuestion.type === "MCQ" ? "mcq" : "dsa")
    }
  }, [typeParam, existingQuestion])


  useEffect(() => {
    if (existingQuestion) {
      // Use full text for the rich text editor
      setQuestionText(existingQuestion.text)
      setPoints(existingQuestion.points)
      setFuncName(existingQuestion.funcName || "")

      if (existingQuestion.type === 'MCQ' && existingQuestion.options) { // Assuming options are returned
        // Map existing options or pad with empty ones if less than 4
        // Or just use existing options. For simplicity, let's try to map to 4 slots if possible
        const newOpts = existingQuestion.options.map((o: any, i: number) => ({
          id: String.fromCharCode(65 + i),
          text: o.text,
          isCorrect: o.isCorrect
        }))
        // Ensure at least 4 for UI consistency if that's desired, or just use dynamic list
        setOptions(newOpts.length > 0 ? newOpts : options)
      }

      if (existingQuestion.type === 'DSA' && existingQuestion.testCases) {
        setTestCases(existingQuestion.testCases.map((tc: any) => ({
          input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
          expectedOutput: typeof tc.expectedOutput === 'string' ? tc.expectedOutput : JSON.stringify(tc.expectedOutput),
          isHidden: tc.isHidden || false
        })))
      }
    }
  }, [existingQuestion])

  const handleTypeChange = (value: string) => {
    setSearchParams({ type: value })
    setType(value as any)
  }

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean | "indeterminate") => {
    const newOptions = [...options]
    if (field === 'isCorrect') {
      newOptions[index].isCorrect = value === true
    } else {
      newOptions[index].text = value as string
    }
    setOptions(newOptions)
  }

  const handleSave = () => {
    // const text = description ? `${title}\n\n${description}` : title
    const text = questionText

    // Validate and Parse Test Cases if DSA
    let processedTestCases = undefined
    if (type === 'dsa') {
      try {
        processedTestCases = testCases.map(tc => {
          let parsedInput;
          try {
            parsedInput = JSON.parse(tc.input);
          } catch (e) {
            // If it's not valid JSON, treat it as a string if it's simple, 
            // but for arguments we really want an array.
            // Let's be strict for now to avoid weird bugs.
            throw new Error(`Invalid JSON in test case input: ${tc.input}`);
          }

          if (!Array.isArray(parsedInput)) {
            throw new Error(`Test case input must be a JSON array (arguments list). Got: ${tc.input}`);
          }

          let parsedOutput;
          try {
            parsedOutput = JSON.parse(tc.expectedOutput);
          } catch (e) {
            // For output, if it's not valid JSON, it might just be a string.
            // But structuredClone/Judge0 might expect actual JSON values.
            parsedOutput = tc.expectedOutput;
          }

          return {
            input: parsedInput,
            expectedOutput: parsedOutput,
            isHidden: tc.isHidden
          }
        });
      } catch (err: any) {
        toast.error(err.message);
        return;
      }

      if (!funcName || funcName.trim() === "") {
        toast.error("Function name is required for DSA questions");
        return;
      }
    }

    const payload = {
      type: type === 'mcq' ? 'MCQ' : 'DSA',
      text,
      points: Number(points),
      funcName: type === 'dsa' ? funcName : undefined,
      options: type === 'mcq' ? options.map(o => ({
        text: o.text,
        isCorrect: o.isCorrect,
      })) : undefined,
      testCases: type === 'dsa' ? processedTestCases : undefined
    }

    const mutation = id ? updateQuestion : createQuestion
    const mutationArgs = id ? { id, payload } : payload

    mutation.mutate(mutationArgs as any, {
      onSuccess: () => {
        toast.success(id ? "Question updated successfully" : "Question created successfully")
        navigate("/questions")
      },
      onError: (error: any) => {
        toast.error("Failed to save question: " + error.message)
      }
    })
  }

  if (id && isLoadingQuestion) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isPending = createQuestion.isPending || updateQuestion.isPending

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{id ? "Edit Question" : "Add New Question"}</h2>
          <p className="text-muted-foreground">{id ? "Update existing challenge." : "Add a challenge to your question bank."}</p>
        </div>
      </div>


      <div className="grid gap-6">
        {/* Type Selection */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <TooltipProvider delayDuration={0}>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <TypeCard
                  label="Multiple Choice"
                  value="mcq"
                  active={type === "mcq"}
                  onClick={() => handleTypeChange("mcq")}
                />
                <TypeCard
                  label="DSA / Coding"
                  value="dsa"
                  active={type === "dsa"}
                  onClick={() => handleTypeChange("dsa")}
                  // disabled
                  tooltip="Select for coding challenges"
                />
                <TypeCard
                  label="Custom Sandbox"
                  value="sandbox"
                  active={type === "sandbox"}
                  onClick={() => { }}
                  disabled
                  tooltip="Sandbox environments coming soon!"
                />
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Question Form */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
            <CardDescription>Define the core problem statement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question Text</Label>
              <RichTextEditor
                value={questionText}
                onChange={setQuestionText}
                placeholder="Describe the question..."
                className="min-h-[200px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                placeholder="10"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
              />
            </div>
            {/* 
                <div className="space-y-2">
                    <Label htmlFor="description">Description (Markdown supported)</Label>
                    <Textarea 
                        id="description" 
                        placeholder="Detailed question description..." 
                        className="h-32 font-mono text-sm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                */}
            {type === "dsa" && (
              <div className="space-y-2">
                <Label htmlFor="funcName">Function Name</Label>
                <Input
                  id="funcName"
                  placeholder="e.g. twoSum"
                  value={funcName}
                  onChange={(e) => setFuncName(e.target.value)}
                  className="font-mono"
                />
                <p className="text-[10px] text-muted-foreground italic">Must match the function name required in the solution.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options (MCQ Only) */}
        {type === "mcq" && (
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle>Answer Options</CardTitle>
              <CardDescription>Select the correct answer(s).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-3">
                  <Checkbox
                    checked={option.isCorrect}
                    onCheckedChange={(checked) => handleOptionChange(index, 'isCorrect', checked)}
                  />
                  <div className="flex-1">
                    <Input
                      placeholder={`Option ${option.id}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Test Cases (DSA Only) */}
        {type === "dsa" && (
          <Card className="border-border/50 bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Test Cases</CardTitle>
                <CardDescription>Define input/output cases for checking correctness.</CardDescription>
              </div>
              <Button
                onClick={() => setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }])}
                variant="outline"
                size="sm"
                className="cursor-pointer"
              >
                + Add Case
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-sm text-blue-200/80">
                <Info className="h-5 w-5 shrink-0 text-blue-400" />
                <div className="space-y-1">
                  <p className="font-bold text-blue-400">DSA Input Guide</p>
                  <ul className="list-disc list-inside space-y-1 opacity-90">
                    <li><b>Function Name</b>: Must match the function students will write (e.g. <code>twoSum</code>).</li>
                    <li><b>Input (JSON Array)</b>: Each element in the array is treated as one <b>argument</b> to your function.
                      <br /><i>Example: <code>[[2,7,11,15], 9]</code> calls <code>twoSum([2,7,11,15], 9)</code>.</i>
                    </li>
                    <li><b>Expected Output (JSON)</b>: The literal value the function should return.
                      <br /><i>Example: <code>[0, 1]</code> for the indices.</i>
                    </li>
                  </ul>
                </div>
              </div>

              {testCases.map((tc, index) => (
                <div key={index} className="relative grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-1">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Input (JSON Array)
                        <Tooltip>
                          <TooltipTrigger><Info className="h-3 w-3 opacity-50" /></TooltipTrigger>
                          <TooltipContent>An array where each item is a function argument.</TooltipContent>
                        </Tooltip>
                      </Label>
                      <Textarea
                        placeholder='e.g. [[2,7,11,15], 9]'
                        value={tc.input}
                        onChange={(e) => {
                          const newCases = [...testCases];
                          newCases[index].input = e.target.value;
                          setTestCases(newCases);
                        }}
                        className="font-mono text-sm h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Expected Output (JSON)
                        <Tooltip>
                          <TooltipTrigger><Info className="h-3 w-3 opacity-50" /></TooltipTrigger>
                          <TooltipContent>The exact JSON value returned by the function.</TooltipContent>
                        </Tooltip>
                      </Label>
                      <Textarea
                        placeholder='e.g. [0, 1]'
                        value={tc.expectedOutput}
                        onChange={(e) => {
                          const newCases = [...testCases];
                          newCases[index].expectedOutput = e.target.value;
                          setTestCases(newCases);
                        }}
                        className="font-mono text-sm h-24"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`hidden-${index}`}
                      checked={tc.isHidden}
                      onCheckedChange={(checked) => {
                        const newCases = [...testCases];
                        newCases[index].isHidden = checked === true;
                        setTestCases(newCases);
                      }}
                    />
                    <Label htmlFor={`hidden-${index}`} className="text-sm font-medium leading-none cursor-pointer">
                      Hidden Test Case
                    </Label>
                    <span className="text-[10px] text-muted-foreground">(Hidden cases are used for final grading only)</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full shadow-sm cursor-pointer"
                    onClick={() => {
                      const newCases = testCases.filter((_, i) => i !== index);
                      setTestCases(newCases);
                    }}
                  >
                    <span className="sr-only">Remove</span>
                    <span className="text-xs">X</span>
                  </Button>
                </div>
              ))}
              {testCases.length === 0 && (
                <div className="flex h-20 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  No test cases added.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => navigate(-1)} className="cursor-pointer">Cancel</Button>
          <Button className="gap-2 cursor-pointer" onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {id ? "Update Question" : "Save Question"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function TypeCard({
  label,
  active,
  onClick,
  disabled,
  tooltip
}: {
  label: string,
  value: string,
  active: boolean,
  onClick: () => void,
  disabled?: boolean,
  tooltip?: string
}) {
  const CardContent = (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        "rounded-lg border p-4 text-center transition-all",
        active
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border',
        !disabled && "cursor-pointer hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed bg-muted/20"
      )}
    >
      <div className="font-medium">{label}</div>
    </div>
  )

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {CardContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return CardContent
}
