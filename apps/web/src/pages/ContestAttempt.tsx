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
  CheckCircle2,
  Check,
  X,
  Play,
  Trophy,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RealtimeLeaderboard } from "@/components/domain/leaderboard/realtime-leaderboard";
import { VantaLoader } from "@/components/ui/vanta-loader";

export function ContestAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contestData, isLoading, isFetching, error } = useContestForAttempt(id || "");
  const submitContest = useSubmitContest();
  const saveProgress = useSaveProgress();

  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q");

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const val = parseInt(qParam || "0", 10);
    return isNaN(val) ? 0 : val;
  });
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(63); // JavaScript default
  const [runResult, setRunResult] = useState<RunCodeResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);



  // Load saved answers from backend or local storage on mount
  useEffect(() => {
    if (contestData?.submission?.answers) {
      // Normalize answers: extract 'value' if it's an object (from DSA submission)
      const rawAnswers = contestData.submission.answers as Record<string, any>;
      const normalizedAnswers: Record<string, string> = {};

      Object.entries(rawAnswers).forEach(([qId, val]) => {
        if (val && typeof val === 'object' && val.value !== undefined) {
          normalizedAnswers[qId] = val.value;
        } else if (typeof val === 'string') {
          normalizedAnswers[qId] = val;
        } else {
          normalizedAnswers[qId] = String(val);
        }
      });

      setAnswers(normalizedAnswers);

      // Initialize score from backend
      if (contestData.submission.score !== undefined) {
        setCurrentScore(contestData.submission.score);
      }

      // Initialize language from current question's saved state if it exists
      const currentQId = contestData.questions?.[currentQuestionIndex]?.question?.id;
      if (rawAnswers[currentQId]?.languageId) {
        setSelectedLanguage(rawAnswers[currentQId].languageId);
      }

      // Only jump to first unanswered if there's no URL param
      if (!qParam) {
        const nextIdx = Math.min(Object.keys(normalizedAnswers).length, contestData.questions?.length - 1);
        setCurrentQuestionIndex(nextIdx);
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

  // Redirect if already submitted or if no submission exists
  useEffect(() => {
    if (!contestData) return;

    if (contestData.submission?.status === "COMPLETED") {
      navigate(`/contest/${id}/result`);
      return;
    }

    if (!contestData.submission && !isLoading && !isFetching) {
      toast.error("Please start the contest first");
      navigate(`/contest/${id}`);
    }
  }, [contestData, id, navigate, isLoading, isFetching]);

  // Timer Logic
  useEffect(() => {
    if (!contestData) return;

    try {
      const getContestEndDate = (c: any) => {
        const start = new Date(c.startDate);
        let realStartDate = new Date(start);

        if (c.startTime && c.startTime.includes(':') && c.startTime.length <= 5) {
          const [startHours, startMinutes] = c.startTime.split(":").map(Number);
          if (!isNaN(startHours) && !isNaN(startMinutes)) {
            realStartDate.setHours(startHours, startMinutes, 0, 0);
          }
        }

        if (c.endTime) {
          if (c.endTime.includes('T') || c.endTime.length > 5) {
            const possibleEndDate = new Date(c.endTime);
            if (!isNaN(possibleEndDate.getTime())) return possibleEndDate;
          } else if (c.endTime.includes(':')) {
            const [endHours, endMinutes] = c.endTime.split(":").map(Number);
            if (!isNaN(endHours) && !isNaN(endMinutes)) {
              const endDate = new Date(realStartDate);
              endDate.setHours(endHours, endMinutes, 0, 0);
              if (endDate < realStartDate) endDate.setDate(endDate.getDate() + 1);
              return endDate;
            }
          }
        }
        // Fallback
        const fallback = new Date(realStartDate);
        fallback.setHours(23, 59, 59, 999);
        return fallback;
      };

      const endDate = getContestEndDate(contestData);

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

  const handleOptionSelect = (questionId: string, optionId: string) => {
    // If already submitted, don't allow changes
    if (contestData?.submission?.answers?.[questionId]) return;

    const newAnswers = { ...answers };
    if (newAnswers[questionId] === optionId) {
      delete newAnswers[questionId];
    } else {
      newAnswers[questionId] = optionId;
    }
    setAnswers(newAnswers);
  };

  const handleSubmitMCQ = () => {
    if (!id || !currentQuestion.id) return;
    const answer = answers[currentQuestion.id];
    if (!answer) {
      toast.error("Please select an option first");
      return;
    }

    saveProgress.mutate(
      { contestId: id, questionId: currentQuestion.id, answer },
      {
        onSuccess: () => {
          toast.success("Answer submitted and locked!", {
            description: "Your points have been added to the leaderboard."
          });
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to submit answer");
        }
      }
    );
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
            toast.success(`Submitted! All ${data.total} test cases passed! +${data.pointsEarned} points`);
            // Score will refresh automatically via invalidateQueries in useSubmitCode hook
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

  const handleJumpToQuestion = (index: number) => {
    if (index === currentQuestionIndex) return;
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
            navigate(`/contest/${id}/result`);
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

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-background"><VantaLoader text="PREPARING CONTEST..." /></div>;
  if (error || !contestData) return <div className="flex h-screen items-center justify-center text-destructive bg-background font-black italic tracking-tighter uppercase p-10 border-4 border-destructive m-10">ERROR: CONTEST DATA CORRUPTED</div>;

  const currentQuestion = contestData.questions?.[currentQuestionIndex]?.question;
  const totalQuestions = contestData.questions?.length;
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  const rank = contestData.submission?.rank ?? "N/A";

  const isDSA = currentQuestion?.type === "DSA"; // Assuming implicit type check or field availability
  // Sometimes naming is 'MCQ' or 'DSA' in DB. Let's assume 'DSA' or Check if options exist?
  // User said "if the question is dsa". 

  // Calculate status for Leaderboard
  const getContestStatus = (c: any) => {
    const start = new Date(c.startDate);
    let realStart = new Date(start);
    if (c.startTime && c.startTime.includes(':') && c.startTime.length <= 5) {
      const [h, m] = c.startTime.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) realStart.setHours(h, m, 0, 0);
    }

    let realEnd = new Date(realStart);
    if (c.endTime) {
      if (c.endTime.includes('T') || c.endTime.length > 5) {
        const d = new Date(c.endTime);
        if (!isNaN(d.getTime())) realEnd = d;
      } else if (c.endTime.includes(':')) {
        const [h, m] = c.endTime.split(":").map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          realEnd.setHours(h, m, 0, 0);
          if (realEnd < realStart) realEnd.setDate(realEnd.getDate() + 1);
        }
      }
    } else {
      realEnd.setHours(23, 59, 59, 999);
    }

    const now = new Date();
    if (now < realStart) return "UPCOMING";
    if (now > realEnd) return "PAST";
    return "LIVE";
  };

  const contestStatus = getContestStatus(contestData);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground transition-colors duration-300 selection:bg-primary selection:text-white">

      {/* 1. Soft Neo-Brutalism Header Section */}
      <header className="sticky top-0 z-20 w-full border-b border-foreground/10 bg-background/95 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">

          {/* Left: Title */}
          <div className="flex items-center gap-4 sm:gap-6">
            <h1 className="hidden font-display text-lg font-bold text-foreground sm:block tracking-tight">{contestData.title}</h1>
          </div>

          {/* Center: Timer */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center rounded-lg border border-foreground bg-card px-4 py-1.5 shadow-sm">
              <span className={cn(
                "font-mono text-xl font-bold tracking-widest",
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
                <div className="hidden items-center gap-2 sm:flex cursor-pointer hover:bg-muted/50 transition-colors rounded-md px-3 py-1" title="Click to view Leaderboard">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Score</span>
                  <span className="font-mono text-lg font-bold text-primary">{contestData.submission?.score ?? 0}</span>
                </div>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[600px] sm:max-w-xl p-0">
                <div className="h-full flex flex-col pt-10 px-6">
                  <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2 tracking-tight">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Leaderboard
                  </h2>
                  <div className="flex-1 overflow-hidden">
                    <RealtimeLeaderboard contestId={id || ""} compact={true} contestStatus={contestStatus} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              onClick={handleSubmit}
              className="h-10 rounded-lg border border-foreground bg-primary px-4 font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] active:translate-y-[1px] active:shadow-none"
            >
              Submit Contest
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Info Bar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2 sm:hidden">
        <span className="truncate text-xs font-bold tracking-tight">{contestData.title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase font-bold">Score</span>
          <span className="font-mono text-sm font-bold text-primary">{contestData.submission?.score ?? 0}</span>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-12 lg:p-8">

        {/* 2. Left Panel: Question Area */}
        <div className="flex flex-col gap-6 lg:col-span-9">
          <div className="flex flex-1 flex-col justify-between rounded-2xl border border-foreground bg-card p-6 shadow-sm sm:p-10">

            <div className="mb-8">
              <div className="mb-6 flex items-center justify-between border-b border-foreground/10 pb-4">
                <span className="font-display text-xl font-bold text-foreground tracking-tight">
                  Problem {currentQuestionIndex + 1}
                </span>
                <div className="flex gap-3">
                  {isDSA && (
                    <div className="rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-800">
                      CODING
                    </div>
                  )}
                  <div className="rounded-md bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border">
                    {currentQuestion?.points || 10} Points
                  </div>
                </div>
              </div>

              <div className="mb-8 overflow-hidden">
                <div className="prose prose-sm dark:prose-invert max-w-none font-sans text-foreground/90 sm:prose-base leading-relaxed [&_pre]:bg-muted/50 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_code]:bg-muted [&_code]:rounded-md [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-primary [&_h3]:text-xl [&_h3]:font-bold [&_h3]:tracking-tight [&_h4]:text-lg [&_h4]:font-semibold [&_strong]:font-bold">
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {currentQuestion?.text || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Content Area: MCQ Options OR Code Editor */}
            {isDSA ? (
              <div className="space-y-4">
                {/* Language Selector */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Language Selection</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(Number(e.target.value))}
                    className="h-9 rounded-md border border-foreground/20 bg-background px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
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
                <div className="h-[400px] overflow-hidden rounded-xl border border-foreground/20 shadow-sm bg-[#1e1e1e]">
                  <Editor
                    key={`${currentQuestion?.id}-${selectedLanguage}`}
                    height="100%"
                    language={getLanguage(selectedLanguage)}
                    theme="vs-dark"
                    value={(typeof answers[currentQuestion?.id] === 'object' ? answers[currentQuestion?.id].value : answers[currentQuestion?.id]) || "// Write your code here"}
                    onChange={(val) => handleCodeChange(currentQuestion?.id, val)}
                    path={`question-${currentQuestion?.id}`}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 16, bottom: 16 }
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    onClick={handleRunCode}
                    disabled={isRunning || isSubmitting}
                    variant="outline"
                    className="gap-2 border-green-600 text-green-600 hover:bg-green-600/5 font-bold uppercase tracking-tight text-xs h-10 px-6 rounded-lg transition-all"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        Run Local
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSubmitDSA}
                    disabled={isRunning || isSubmitting}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold uppercase tracking-tight text-xs h-10 px-8 rounded-lg gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Final Submit
                      </>
                    )}
                  </Button>
                </div>

                {/* Test Results Panel */}
                {runResult && (
                  <div className="rounded-xl border border-foreground bg-muted/50 p-6 space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Test Report</h4>
                      <span className={cn(
                        "text-sm font-mono font-bold px-3 py-1 rounded-full border",
                        runResult.passed === (runResult.total || 0)
                          ? "text-green-600 bg-green-50 border-green-200"
                          : "text-red-600 bg-red-50 border-red-200"
                      )}>
                        {runResult.passed}/{runResult.total} PASSED
                      </span>
                    </div>

                    {runResult.compilationError && (
                      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                        <p className="text-xs font-bold text-destructive uppercase tracking-wider mb-2">Internal Error / Compilation Failed</p>
                        <pre className="text-xs font-mono text-destructive/80 overflow-x-auto whitespace-pre-wrap leading-relaxed">{runResult.compilationError}</pre>
                      </div>
                    )}

                    <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2">
                      {runResult.results?.map((result: any, idx: number) => (
                        <div
                          key={result.testCaseId}
                          className={cn(
                            "rounded-lg border p-4 text-sm transition-all",
                            result.passed
                              ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                              : "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                          )}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold uppercase tracking-tight text-xs">Test Case {idx + 1}</span>
                            <span className={cn(
                              "text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest",
                              result.passed ? "border-green-500/30 text-green-600 bg-green-50" : "border-red-500/30 text-red-600 bg-red-50"
                            )}>
                              {result.passed ? "OK" : "ERR"}
                            </span>
                          </div>
                          {!result.passed && (
                            <div className="space-y-2 text-xs font-mono bg-background/50 p-3 rounded-md border border-foreground/5 mt-2">
                              <div><span className="text-muted-foreground uppercase opacity-50 block mb-0.5">Input</span> {typeof result.input === 'object' ? JSON.stringify(result.input) : result.input}</div>
                              <div><span className="text-muted-foreground uppercase opacity-50 block mb-0.5">Expected</span> {typeof result.expectedOutput === 'object' ? JSON.stringify(result.expectedOutput) : result.expectedOutput}</div>
                              <div><span className="text-muted-foreground uppercase opacity-50 block mb-0.5">Observed</span> {typeof result.actualOutput === 'object' ? JSON.stringify(result.actualOutput) : (result.actualOutput || "(nil)")}</div>
                              {result.error && <div className="text-red-500 pt-1">Error: {result.error}</div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {currentQuestion?.options?.map((option: any, idx: number) => {
                    const isSelected = answers[currentQuestion?.id] === option.id;
                    const isSubmitted = !!contestData.submission?.answers?.[currentQuestion?.id];

                    return (
                      <div
                        key={option.id}
                        onClick={() => !isSubmitted && handleOptionSelect(currentQuestion?.id, option.id)}
                        className={cn(
                          "group relative flex cursor-pointer items-start gap-4 rounded-xl border border-foreground/10 p-5 transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "bg-muted/30 hover:border-foreground/20 hover:bg-muted/50",
                          isSubmitted && "cursor-not-allowed opacity-80"
                        )}
                      >
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all",
                          isSelected ? "bg-primary text-primary-foreground border border-foreground shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" : "bg-background text-muted-foreground border border-foreground/10"
                        )}>
                          {optionLabels[idx]}
                        </div>

                        <div className="flex-1 pt-1">
                          <span className={cn(
                            "text-sm font-bold leading-relaxed tracking-tight",
                            isSelected ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {option.text}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute right-4 top-4 text-primary opacity-50">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!contestData.submission?.answers?.[currentQuestion?.id] && (
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSubmitMCQ}
                      disabled={!answers[currentQuestion?.id] || saveProgress.isPending}
                      className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-11 px-10 rounded-xl border border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] transition-all active:translate-y-[1px] active:shadow-none min-w-[180px] uppercase text-xs tracking-wider"
                    >
                      {saveProgress.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </div>
                      ) : (
                        "Submit Answer"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-12 border-t border-foreground/5 pt-8" />
          </div>
        </div>

        {/* 3. Right Panel: Progress Tracker */}
        <div className="lg:col-span-3 order-first lg:order-last mb-6 lg:mb-0">
          <div className="sticky top-24 rounded-2xl border border-foreground bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-foreground/10 pb-4">
              <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Questions</h3>
              <span className="font-mono text-sm font-bold text-primary">
                {Object.keys(answers).length}/{totalQuestions}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-8 lg:grid-cols-2 xl:grid-cols-3">
              {contestData.questions?.map((q: any, idx: number) => {
                const questionId = q.question.id;
                const isCurrent = currentQuestionIndex === idx;
                const submissionEntry = contestData.submission?.answers?.[questionId];
                const isCorrect = submissionEntry && typeof submissionEntry === 'object' && submissionEntry.isCorrect === true;
                const isFailed = submissionEntry && typeof submissionEntry === 'object' && submissionEntry.isCorrect === false;

                return (
                  <button
                    key={questionId}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-lg border text-xs font-bold transition-all",
                      // Background logic
                      isCorrect
                        ? "bg-green-500 text-white border-green-600 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        : isFailed
                          ? "bg-red-500 text-white border-red-600 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-muted/30 text-muted-foreground border-foreground/5 hover:border-foreground/20",

                      // Current indicator logic
                      isCurrent && "ring-2 ring-primary ring-offset-2 scale-105 border-foreground shadow-sm"
                    )}
                  >
                    {isCorrect ? (
                      <Check className="h-4 w-4" />
                    ) : isFailed ? (
                      <X className="h-4 w-4" />
                    ) : (
                      idx + 1
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 space-y-3 rounded-xl border border-foreground/10 bg-muted/20 p-4">
              <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <div className="h-2.5 w-2.5 rounded-sm border border-primary bg-primary"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <div className="h-2.5 w-2.5 rounded-sm border border-green-500 bg-green-500"></div>
                <span>Solved</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <div className="h-2.5 w-2.5 rounded-sm border border-red-500 bg-red-500"></div>
                <span>Incorrect</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
