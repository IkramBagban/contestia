import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useContestForAttempt, useSubmitContest, useSaveProgress, useRunCode, useSubmitCode, type RunCodeResult } from "../hooks/use-queries";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm"; // Imported for GFM support
import Editor, { loader } from "@monaco-editor/react"; // Imported Monaco Editor

// Configure Monaco to load from CDN to avoid Vite bundling issues (t.create is not a function)
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' } });

import {
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Check,
  Play,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RealtimeLeaderboard } from "@/components/domain/leaderboard/realtime-leaderboard";

export function ContestAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contestData, isLoading, error } = useContestForAttempt(id || "");
  const submitContest = useSubmitContest();
  const saveProgress = useSaveProgress();

  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q");

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const val = parseInt(qParam || "0", 10);
    return isNaN(val) ? 0 : val;
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(63); // JavaScript default
  const [runResult, setRunResult] = useState<RunCodeResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);



  // Load saved answers from backend or local storage on mount
  useEffect(() => {
    if (contestData?.submission?.answers) {
      setAnswers(contestData.submission.answers as Record<string, string>);
      // Initialize score from backend
      if (contestData.submission.score !== undefined) {
        setCurrentScore(contestData.submission.score);
      }

      // Only jump to first unanswered if there's no URL param
      if (!qParam) {
        const ansKeys = Object.keys(contestData.submission.answers);
        if (ansKeys.length > 0) {
          const nextIdx = Math.min(ansKeys.length, contestData.questions.length - 1);
          setCurrentQuestionIndex(nextIdx);
        }
      }
    } else if (id) {
      const saved = localStorage.getItem(`contest_${id}_answers`);
      if (saved) {
        setAnswers(JSON.parse(saved));
      }
    }
  }, [contestData, id, qParam]);

  // Sync state to URL
  useEffect(() => {
    setSearchParams({ q: currentQuestionIndex.toString() }, { replace: true });
  }, [currentQuestionIndex, setSearchParams]);

  // Timer Logic
  useEffect(() => {
    if (!contestData) return;

    try {
      const startDate = new Date(contestData.startDate);
      // Assuming endTime is "HH:mm" on the same day as startDate as per current logic
      // If contestData has duration, that would be better, but sticking to previous working logic
      const [hours, minutes] = contestData.endTime.split(":").map(Number);

      const endDate = new Date(startDate);
      endDate.setHours(hours, minutes, 0, 0);

      const calculateTimeLeft = () => {
        const now = new Date();
        const diff = endDate.getTime() - now.getTime();
        return diff > 0 ? diff : 0;
      };

      setTimeLeft(calculateTimeLeft());

      const timerIdx = setInterval(() => {
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(timerIdx);
          handleAutoSubmit();
        }
      }, 1000);

      return () => clearInterval(timerIdx);
    } catch (e) {
      console.error("Timer error", e);
    }
  }, [contestData]);

  const saveCurrentAnswer = () => {
    if (!contestData || !id) return;
    const currentQ = contestData.questions[currentQuestionIndex].question;
    const answer = answers[currentQ.id];

    // Only save if we have an answer. 
    // Optimization: Check if answer differs from saved? 
    // For now, save if exists to be safe and simple.
    if (answer !== undefined) {
      saveProgress.mutate(
        { contestId: id, questionId: currentQ.id, answer },
        {
          onSuccess: (data: any) => {
            if (data?.data?.score !== undefined) {
              setCurrentScore(data.data.score);
            }
          }
        }
      );
    }
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    const newAnswers = { ...answers };
    if (newAnswers[questionId] === optionId) {
      delete newAnswers[questionId];
    } else {
      newAnswers[questionId] = optionId;
    }
    setAnswers(newAnswers);

    // Immediately save and update score for MCQ
    if (id && newAnswers[questionId]) {
      saveProgress.mutate(
        { contestId: id, questionId, answer: newAnswers[questionId] },
        {
          onSuccess: (data: any) => {
            if (data?.data?.score !== undefined) {
              setCurrentScore(data.data.score);
            }
          }
        }
      );
    }
  };

  const getLanguage = (langId: number) => {
    switch (langId) {
      case 71: return "python";
      case 62: return "java";
      case 54: return "cpp";
      case 74: return "typescript";
      case 60: return "go";
      case 73: return "rust";
      default: return "javascript";
    }
  };

  const handleCodeChange = (questionId: string, code: string | undefined) => {
    if (code === undefined) return;
    const newAnswers = { ...answers, [questionId]: code };
    setAnswers(newAnswers);
  };

  const runCode = useRunCode();
  const submitCode = useSubmitCode();

  const handleRunCode = () => {
    const code = answers[currentQuestion.id];
    if (!code || !currentQuestion.id) {
      toast.error("Please write some code first");
      return;
    }
    setIsRunning(true);
    setRunResult(null);
    runCode.mutate(
      { languageId: selectedLanguage, code, questionId: currentQuestion.id },
      {
        onSuccess: (data: any) => {
          setRunResult(data);
          setIsRunning(false);
          if (data.passed === data.total && data.total > 0) {
            toast.success(`All ${data.total} test cases passed!`);
          } else {
            toast.error(`${data.failed} of ${data.total} test cases failed`);
          }
        },
        onError: (error: any) => {
          setIsRunning(false);
          toast.error(error.response?.data?.message || "Failed to run code");
        }
      }
    );
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitDSA = () => {
    const code = answers[currentQuestion.id];
    if (!code || !currentQuestion.id || !id) {
      toast.error("Please write some code first");
      return;
    }
    setIsSubmitting(true);
    setRunResult(null);
    submitCode.mutate(
      { languageId: selectedLanguage, code, questionId: currentQuestion.id, contestId: id },
      {
        onSuccess: (data: any) => {
          setRunResult(data);
          setIsSubmitting(false);
          if (data.passed === data.total && data.total > 0) {
            toast.success(`✅ Submitted! All ${data.total} test cases passed! +${data.pointsEarned} points`);
            if (data.score !== undefined) {
              setCurrentScore(data.score);
            }
          } else {
            toast.error(`Submission failed: ${data.failed} of ${data.total} test cases failed`);
          }
        },
        onError: (error: any) => {
          setIsSubmitting(false);
          toast.error(error.response?.data?.message || "Failed to submit code");
        }
      }
    );
  };

  const handleNext = () => {
    saveCurrentAnswer();
    if (contestData && currentQuestionIndex < contestData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    saveCurrentAnswer();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    if (index === currentQuestionIndex) return;
    saveCurrentAnswer();
    setCurrentQuestionIndex(index);
  }

  const handleSubmit = () => {
    if (!id) return;
    if (confirm("Are you sure you want to finish the contest?")) {
      submitContest.mutate(
        { contestId: id, answers },
        {
          onSuccess: () => {
            localStorage.removeItem(`contest_${id}_answers`);
            toast.success("Contest submitted successfully!");
            navigate("/dashboard");
          },
          onError: () => {
            toast.error("Failed to submit contest. Please try again.");
          }
        }
      );
    }
  };

  const handleAutoSubmit = () => {
    if (!id) return;
    submitContest.mutate(
      { contestId: id, answers },
      {
        onSuccess: () => {
          localStorage.removeItem(`contest_${id}_answers`);
          toast.info("Time over! Contest submitted.");
          navigate("/dashboard");
        },
      }
    );
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-background"><span className="animate-pulse text-xl font-display font-medium text-foreground">Loading Arena...</span></div>;
  if (error || !contestData) return <div className="flex h-screen items-center justify-center text-destructive bg-background">Error loading contest.</div>;

  const currentQuestion = contestData.questions[currentQuestionIndex].question;
  const totalQuestions = contestData.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  const rank = contestData.submission?.rank ?? "N/A";

  const isDSA = currentQuestion.type === "DSA"; // Assuming implicit type check or field availability
  // Sometimes naming is 'MCQ' or 'DSA' in DB. Let's assume 'DSA' or Check if options exist?
  // User said "if the question is dsa". 

  // Calculate status for Leaderboard
  const now = new Date();
  const startDate = new Date(contestData.startDate);
  const [endH, endM] = contestData.endTime.split(":").map(Number);
  const endDate = new Date(startDate);
  endDate.setHours(endH, endM, 0, 0);

  let contestStatus: "UPCOMING" | "LIVE" | "PAST" = "LIVE"; // Default to LIVE if attempting
  if (now > endDate) contestStatus = "PAST";
  if (now < startDate) contestStatus = "UPCOMING";

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground transition-colors duration-300">

      {/* 1. Sketch-Style Header Section */}
      <header className="sticky top-0 z-20 w-full border-b-2 border-foreground bg-background px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">

          {/* Left: Title & Rank */}
          <div className="flex items-center gap-4 sm:gap-6">
            <h1 className="hidden font-display text-lg font-bold text-foreground sm:block">{contestData.title}</h1>
          </div>

          {/* Center: Timer */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center rounded-lg border-2 border-foreground bg-card px-4 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              <span className={cn(
                "font-mono text-2xl font-bold tracking-widest",
                timeLeft && timeLeft < 300000 ? 'text-destructive animate-pulse' : 'text-foreground'
              )}>
                {timeLeft !== null ? formatTime(timeLeft) : "--:--:--"}
              </span>
            </div>
          </div>

          {/* Right: Score & Submit */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <div className="hidden items-center gap-2 sm:flex cursor-pointer hover:scale-105 active:scale-95 transition-transform rounded-md p-1 hover:bg-muted/50" title="Click to view Leaderboard">
                  <span className="font-display text-sm font-bold text-muted-foreground">Score:</span>
                  <span className="font-mono text-lg font-bold text-primary">{currentScore}</span>
                </div>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[600px] sm:max-w-xl p-0">
                <div className="h-full flex flex-col pt-10 px-6">
                  <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Live Leaderboard
                  </h2>
                  <div className="flex-1 overflow-hidden">
                    <RealtimeLeaderboard contestId={id || ""} compact={true} contestStatus={contestStatus} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              onClick={handleSubmit}
              className="h-10 rounded-lg border-2 border-foreground bg-background px-4 font-bold text-foreground transition-all hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:bg-accent"
            >
              Submit Contest
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Info Bar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2 sm:hidden">
        <span className="truncate text-xs font-bold">{contestData.title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Score:</span>
          <span className="font-mono text-sm font-bold text-primary">{currentScore}</span>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-12 lg:p-8">

        {/* 2. Left Panel: Question Area */}
        <div className="flex flex-col gap-6 lg:col-span-9">
          <div className="flex flex-1 flex-col justify-between rounded-xl border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] sm:p-10">

            <div className="mb-8">
              <div className="mb-6 flex items-center justify-between border-b-2 border-dashed border-border pb-4">
                <span className="font-display text-xl font-bold text-foreground">
                  Problem {currentQuestionIndex + 1}
                </span>
                <div className="flex gap-3">
                  {isDSA && (
                    <div className="rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      CODING
                    </div>
                  )}
                  <div className="rounded-md bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {currentQuestion.points || 10} Points
                  </div>
                </div>
              </div>

              <div className="mb-8 overflow-hidden">
                <div className="prose prose-sm dark:prose-invert max-w-none font-sans text-foreground/90 sm:prose-base md:prose-lg leading-relaxed [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_code]:bg-muted [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-primary [&_h3]:text-xl [&_h3]:font-bold [&_h4]:text-lg [&_h4]:font-semibold [&_strong]:font-bold">
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {currentQuestion.text || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Content Area: MCQ Options OR Code Editor */}
            {isDSA ? (
              <div className="space-y-4">
                {/* Language Selector */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Language:</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(Number(e.target.value))}
                    className="h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={63}>JavaScript (Node.js)</option>
                    <option value={71}>Python (3.8)</option>
                    <option value={62}>Java (OpenJDK 13)</option>
                    <option value={54}>C++ (GCC 9.2)</option>
                    <option value={74}>TypeScript (3.7)</option>
                    <option value={60}>Go (1.13)</option>
                    <option value={73}>Rust (1.40)</option>
                  </select>
                </div>

                {/* Code Editor */}
                <div className="h-[350px] overflow-hidden rounded-xl border-2 border-border shadow-sm">
                  <Editor
                    key={`${currentQuestion.id}-${selectedLanguage}`}
                    height="100%"
                    language={getLanguage(selectedLanguage)}
                    theme="vs-dark"
                    value={answers[currentQuestion.id] || "// Write your code here"}
                    onChange={(val) => handleCodeChange(currentQuestion.id, val)}
                    path={`question-${currentQuestion.id}`}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button
                    onClick={handleRunCode}
                    disabled={isRunning || isSubmitting}
                    variant="outline"
                    className="gap-2 border-green-600 text-green-600 hover:bg-green-600/10 disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Run Code
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSubmitDSA}
                    disabled={isRunning || isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>

                {/* Test Results Panel */}
                {runResult && (
                  <div className="rounded-xl border-2 border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">Test Results</h4>
                      <span className={cn(
                        "text-sm font-mono font-bold",
                        runResult.passed === runResult.total ? "text-green-500" : "text-red-500"
                      )}>
                        {runResult.passed}/{runResult.total} Passed
                      </span>
                    </div>

                    {runResult.compilationError && (
                      <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                        <p className="text-xs font-bold text-red-500 mb-1">Compilation Error</p>
                        <pre className="text-xs text-red-400 overflow-x-auto whitespace-pre-wrap">{runResult.compilationError}</pre>
                      </div>
                    )}

                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {runResult.results?.map((result, idx) => (
                        <div
                          key={result.testCaseId}
                          className={cn(
                            "rounded-lg border p-3 text-sm",
                            result.passed
                              ? "border-green-500/30 bg-green-500/5"
                              : "border-red-500/30 bg-red-500/5"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Test Case {idx + 1}</span>
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded-full",
                              result.passed ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                            )}>
                              {result.passed ? "PASSED" : "FAILED"}
                            </span>
                          </div>
                          {!result.passed && (
                            <div className="space-y-1 text-xs font-mono">
                              <div><span className="text-muted-foreground">Input:</span> {typeof result.input === 'object' ? JSON.stringify(result.input) : result.input}</div>
                              <div><span className="text-muted-foreground">Expected:</span> {typeof result.expectedOutput === 'object' ? JSON.stringify(result.expectedOutput) : result.expectedOutput}</div>
                              <div><span className="text-muted-foreground">Got:</span> {typeof result.actualOutput === 'object' ? JSON.stringify(result.actualOutput) : (result.actualOutput || "(empty)")}</div>
                              {result.error && <div className="text-red-400">Error: {result.error}</div>}
                            </div>
                          )}
                          {result.executionTime && (
                            <div className="text-xs text-muted-foreground mt-1">Time: {result.executionTime}s</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {currentQuestion.options?.map((option: any, idx: number) => {
                  const isSelected = answers[currentQuestion.id] === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                      className={cn(
                        "group relative flex cursor-pointer items-start gap-4 rounded-xl border-2 p-5 transition-all duration-200 ease-in-out",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(var(--primary),1)]"
                          : "border-border bg-card hover:border-primary/50 hover:bg-accent"
                      )}
                    >
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                      )}>
                        {optionLabels[idx]}
                      </div>

                      <div className="flex-1 pt-1">
                        <span className={cn(
                          "text-base font-medium leading-relaxed",
                          isSelected ? "text-foreground" : "text-card-foreground"
                        )}>
                          {option.text}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute right-5 top-5 text-primary">
                          <CheckCircle2 className="h-6 w-6 fill-primary/10" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-12 flex items-center justify-between border-t-2 border-dashed border-border pt-8">
              {/* Previous Button is Disabled/Hidden as per requirement */}
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className={cn(
                  "gap-2 border-2",
                  currentQuestionIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                onClick={isLastQuestion ? handleSubmit : handleNext}
                className={cn(
                  "h-12 min-w-[160px] rounded-xl border-2 border-foreground px-8 text-base font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all active:translate-y-[3px] active:shadow-none",
                  isLastQuestion
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                )}
              >
                {isLastQuestion ? "Finish Contest" : "Next Question"}
                {!isLastQuestion && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        </div>

        {/* 3. Right Panel: Progress Tracker - Sketch Style */}
        <div className="lg:col-span-3 order-first lg:order-last mb-6 lg:mb-0">
          <div className="sticky top-24 rounded-xl border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <div className="mb-6 flex items-center justify-between border-b-2 border-border pb-4">
              <h3 className="font-display font-bold text-foreground">Progress</h3>
              <span className="font-mono text-sm font-bold text-muted-foreground">
                {Object.keys(answers).length}/{totalQuestions}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-3 xl:grid-cols-4">
              {contestData.questions.map((q: any, idx: number) => {
                const questionId = q.question.id;
                const isAnswered = !!answers[questionId];
                const isCurrent = currentQuestionIndex === idx;

                return (
                  <button
                    key={questionId}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-lg border-2 text-sm font-bold transition-all hover:scale-105 active:scale-95",
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] -translate-y-1"
                        : isAnswered
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500/50 dark:bg-blue-900/20 dark:text-blue-400 opacity-100"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {isAnswered ? (
                      <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      idx + 1
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-8 space-y-3 rounded-lg border-2 border-dashed border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                <div className="h-3 w-3 rounded-sm border-2 border-primary bg-primary"></div>
                <span>Current Problem</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                <div className="h-3 w-3 rounded-sm border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20"></div>
                <span>Answered</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
