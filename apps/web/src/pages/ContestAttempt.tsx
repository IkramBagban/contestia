import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContestForAttempt, useSubmitContest } from "@/hooks/use-queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
    id: string;
    text: string;
    type: 'MCQ' | 'DSA';
    points: number;
    options: Array<{
        id: string;
        text: string;
    }>;
}

export function ContestAttemptPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // Fetch contest data
    const { data: contest, isLoading, isError } = useContestForAttempt(id!);
    const { mutate: submitContest, isPending: isSubmitting } = useSubmitContest();

    // State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Derived state
    const questions = useMemo(() => {
        if (!contest?.questions) return [];
        return contest.questions.map((q: any) => q.question) as Question[];
    }, [contest]);

    const currentQuestion = questions[currentQuestionIndex];

    // Timer Logic
    useEffect(() => {
        if (!contest) return;

        // Construct End Date Time
        // Assuming startDate is a date string/object and endTime is "HH:mm"
        try {
            const startDate = new Date(contest.startDate);
            const [hours, minutes] = contest.endTime.split(':').map(Number);
            
            const endDate = new Date(startDate);
            endDate.setHours(hours, minutes, 0, 0);

            const calculateTimeLeft = () => {
                const now = new Date();
                const diff = endDate.getTime() - now.getTime();
                return Math.max(0, diff);
            };

            setTimeLeft(calculateTimeLeft());

            const timer = setInterval(() => {
                const remaining = calculateTimeLeft();
                setTimeLeft(remaining);
                if (remaining <= 0) {
                    clearInterval(timer);
                    handleSubmit(true); // Auto submit
                }
            }, 1000);

            return () => clearInterval(timer);
        } catch (e) {
            console.error("Error parsing date", e);
        }
    }, [contest]);


    const handleOptionSelect = (value: string) => {
        if (!currentQuestion) return;
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: value
        }));
    };

    const handleSubmit = (auto = false) => {
        if (!id) return;
        
        if (!auto && !window.confirm("Are you sure you want to submit? You cannot change your answers after submission.")) {
            return;
        }

        submitContest({ contestId: id, answers }, {
            onSuccess: () => {
                toast.success(auto ? "Time's up! Contest submitted." : "Contest submitted successfully!");
                navigate(`/dashboard`); // Ideally redirect to a results page if available
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || "Submission failed");
            }
        });
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // --- Loading / Error States ---
    if (isLoading) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>;
    }

    if (isError || !contest) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-bold">Failed to load contest</h2>
                <Button onClick={() => navigate('/dashboard')}>Go Back</Button>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
             <div className="h-screen flex flex-col items-center justify-center gap-4">
                <h2 className="text-xl font-bold">No questions in this contest</h2>
                <Button onClick={() => navigate('/dashboard')}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{contest.title}</h1>
                    <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-mono font-medium border border-indigo-100">
                        <Clock className="h-4 w-4" />
                        {timeLeft !== null ? formatTime(timeLeft) : "--:--:--"}
                    </div>
                    <Button 
                        onClick={() => handleSubmit(false)} 
                        disabled={isSubmitting}
                        variant="default"
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         Submit Contest
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left Column: Question Area */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="p-8 shadow-sm border-gray-200">
                         <div className="flex justify-between items-start mb-6">
                             <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Question {currentQuestionIndex + 1}</span>
                                <h2 className="text-xl font-medium text-gray-900 leading-relaxed">
                                    {currentQuestion.text}
                                </h2>
                             </div>
                             <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                {currentQuestion.points} points
                             </span>
                         </div>

                         <div className="mt-8">
                             {currentQuestion.type === 'MCQ' ? (
                                <RadioGroup 
                                    value={answers[currentQuestion.id] || ""} 
                                    onValueChange={handleOptionSelect}
                                    className="space-y-3"
                                >
                                    {currentQuestion.options.map((option) => (
                                        <div 
                                            key={option.id} 
                                            className={cn(
                                                "flex items-center space-x-3 rounded-lg border p-4 transition-all hover:bg-gray-50 cursor-pointer",
                                                answers[currentQuestion.id] === option.id 
                                                    ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600" 
                                                    : "border-gray-200"
                                            )}
                                            onClick={() => handleOptionSelect(option.id)}
                                        >
                                            <RadioGroupItem value={option.id} id={option.id} />
                                            <Label htmlFor={option.id} className="flex-1 cursor-pointer font-normal text-gray-700">
                                                {option.text}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                             ) : (
                                 <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-200">
                                     DSA questions are not fully supported in this interface yet.
                                 </div>
                             )}
                         </div>
                    </Card>

                    <div className="flex items-center justify-between pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="w-[120px]"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <Button
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            disabled={currentQuestionIndex === questions.length - 1}
                            className="w-[120px]"
                        >
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Right Column: Navigation Palette */}
                <div className="lg:col-span-1">
                    <Card className="p-5 shadow-sm border-gray-200 sticky top-24">
                        <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q, idx) => {
                                const isAnswered = !!answers[q.id];
                                const isCurrent = currentQuestionIndex === idx;
                                
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={cn(
                                            "h-9 w-9 rounded-md text-sm font-medium transition-all flex items-center justify-center border",
                                            isCurrent 
                                                ? "ring-2 ring-indigo-600 ring-offset-2 border-indigo-600 bg-indigo-600 text-white" 
                                                : isAnswered 
                                                    ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 space-y-3 border-t pt-4">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="h-3 w-3 rounded bg-indigo-600"></div>
                                <span>Current</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="h-3 w-3 rounded bg-green-100 border border-green-200"></div>
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="h-3 w-3 rounded bg-white border border-gray-200"></div>
                                <span>Not Visited</span>
                            </div>
                        </div>
                    </Card>
                </div>

            </main>
        </div>
    );
}
