import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContestForAttempt, useSubmitContest } from "../hooks/use-queries";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Menu,
  Check,
  Code2,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ContestAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contestData, isLoading, error } = useContestForAttempt(id || "");
  const submitContest = useSubmitContest();

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Load saved answers from local storage on mount
  useEffect(() => {
    if (id) {
      const saved = localStorage.getItem(`contest_${id}_answers`);
      if (saved) {
        setAnswers(JSON.parse(saved));
      }
    }
  }, [id]);

  // Save answers to local storage whenever they change
  useEffect(() => {
    if (id && Object.keys(answers).length > 0) {
      localStorage.setItem(`contest_${id}_answers`, JSON.stringify(answers));
    }
  }, [id, answers]);

  // Timer Logic
  useEffect(() => {
    if (!contestData) return;

    try {
      const startDate = new Date(contestData.startDate);
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

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (contestData && currentQuestionIndex < contestData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

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

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground transition-colors duration-300">
      
      {/* 1. Header Section */}
      <header className="sticky top-0 z-20 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          
          <div className="flex items-center gap-4">
             {/* Icon removed based on feedback */}
             <div>
                <h1 className="font-display text-base font-bold text-foreground sm:text-lg">{contestData.title}</h1>
                <p className="text-xs text-muted-foreground font-mono">Question {currentQuestionIndex + 1} / {totalQuestions}</p>
             </div>
          </div>

          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-card px-5 py-2 shadow-sm sm:block">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className={`font-mono text-xl font-bold tracking-widest ${timeLeft && timeLeft < 300000 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                    {timeLeft !== null ? formatTime(timeLeft) : "--:--:--"}
                </span>
            </div>
          </div>
          
          <div>
            <Button 
                onClick={handleSubmit} 
                variant="outline"
                className="border-border font-semibold text-muted-foreground hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20"
            >
              Submit Contest
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Timer */}
      <div className="bg-card border-b border-border py-2 text-center text-foreground sm:hidden">
          <span className="font-mono text-lg font-bold">
            {timeLeft !== null ? formatTime(timeLeft) : "--:--:--"}
          </span>
      </div>

      <main className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-12 lg:p-8">
        
        {/* 2. Left Panel: Question Area */}
        <div className="flex flex-col gap-6 lg:col-span-9">
          <div className="flex flex-1 flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
            
            <div className="mb-8">
              <span className="mb-6 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                Problem {currentQuestionIndex + 1}
              </span>
              <div className="mb-8">
                 <h2 className="whitespace-pre-wrap font-sans text-lg font-medium leading-relaxed text-foreground/90 sm:text-xl md:text-2xl">
                    {currentQuestion.text}
                 </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {currentQuestion.options.map((option: any, idx: number) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                
                return (
                  <div
                    key={option.id}
                    onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                    className={cn(
                      "group relative flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition-all duration-200 ease-in-out hover:border-primary/30 hover:bg-primary/5",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(var(--primary),1)]" 
                        : "border-border bg-card"
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

            <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
               <Button
                 variant="ghost"
                 onClick={handlePrev}
                 disabled={currentQuestionIndex === 0}
                 className="gap-2 text-muted-foreground hover:text-foreground"
               >
                 <ChevronLeft className="h-4 w-4" />
                 Previous
               </Button>

               <Button
                  onClick={isLastQuestion ? handleSubmit : handleNext}
                  className={cn(
                    "h-12 min-w-[160px] rounded-full px-8 text-base shadow-lg transition-all active:scale-95",
                    isLastQuestion 
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20" 
                        : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25"
                  )}
               >
                 {isLastQuestion ? "Finish Contest" : "Next Question"}
                 {!isLastQuestion && <ChevronRight className="h-4 w-4 ml-2" />}
               </Button>
            </div>
          </div>
        </div>

        {/* 3. Right Panel: Progress Tracker */}
        <div className="lg:col-span-3">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-sm">
             <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display font-bold text-foreground">Progress</h3>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {Object.keys(answers).length}/{totalQuestions}
                </span>
             </div>
             
             <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 lg:grid-cols-4">
                {contestData.questions.map((q: any, idx: number) => {
                    const questionId = q.question.id;
                    const isAnswered = !!answers[questionId]; 
                    const isCurrent = currentQuestionIndex === idx;
                    
                    return (
                        <button
                            key={questionId}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={cn(
                                "flex aspect-square items-center justify-center rounded-xl text-sm font-bold transition-all",
                                isCurrent 
                                   ? "border-2 border-primary bg-primary/10 text-primary scale-110 shadow-lg shadow-primary/10 z-10" 
                                   : isAnswered
                                      ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20"
                                      : "bg-muted text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border"
                            )}
                        >
                            {isAnswered && !isCurrent ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                idx + 1
                            )}
                        </button>
                    )
                })}
             </div>

             <div className="mt-8 space-y-3 rounded-2xl bg-muted/30 p-4">
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                    <div className="h-3 w-3 rounded-full border-2 border-primary bg-primary/20"></div>
                    <span>Current Problem</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                    <div className="h-3 w-3 rounded-full bg-green-500/20 text-green-500"></div>
                    <span>Solved</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                    <div className="h-3 w-3 rounded-full bg-muted border border-border"></div>
                    <span>Unsolved</span>
                </div>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
}
