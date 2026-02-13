import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { QuestionTable, type Question as UIQuestion } from "@/components/domain/questions/question-table"
import { useState, useEffect } from "react"
import { useCreateContest, useQuestions, useContest, useUpdateContest } from "@/hooks/use-queries"
import { toast } from "sonner"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Pagination } from "@/components/ui/pagination"

export function CreateContest() {
  const navigate = useNavigate()
  const { id } = useParams()

  const createContest = useCreateContest()
  const updateContest = useUpdateContest()
  const [page, setPage] = useState(1)
  const limit = 20

  const {
    data: questionsResponse,
    isLoading: loadingQuestions,
  } = useQuestions(page, limit)

  const questions = questionsResponse?.data || []
  const meta = questionsResponse?.meta
  const { data: existingContest, isLoading: isLoadingContest } = useContest(id || "")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDateTime, setStartDateTime] = useState("")
  const [endDateTime, setEndDateTime] = useState("")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  useEffect(() => {
    if (existingContest) {
      setTitle(existingContest.title)
      setDescription(existingContest.description)
      // Format datetime-local input: YYYY-MM-DDTHH:mm
      const startDate = new Date(existingContest.startDate)
      // Basic formatting, might need adjustments for timezone
      const formatDate = (date: Date) => {
        const pad = (n: number) => n < 10 ? '0' + n : n
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
      }

      setStartDateTime(formatDate(startDate))

      // endTime is string in schema/create, but let's see how it comes back. 
      // If backend stores it as string, we can use it directly if it matches format or parse it.
      // Schema says endTime is string. But in reality it might be ISO date string.
      // Let's assume it attempts to be a date string.
      try {
        const endDate = new Date(existingContest.endTime)
        if (!isNaN(endDate.getTime())) {
          setEndDateTime(formatDate(endDate))
        } else {
          setEndDateTime(existingContest.endTime)
        }
      } catch (e) {
        setEndDateTime(existingContest.endTime)
      }

      if (existingContest.questions) {
        setSelectedQuestions(existingContest.questions.map((q: any) => q.question.id))
      }
    }
  }, [existingContest])

  // Map API questions to UI questions
  const uiQuestions: UIQuestion[] = questions.map((q) => ({
    id: q.id,
    title: q.text?.substring(0, 50) || "Untitled",
    type: q.type.toLowerCase() as any,
    description: q.text,
    points: q.points,
    userId: q.userId
  }))

  const handleSave = () => {
    if (!startDateTime || !endDateTime) {
      toast.error("Please set start and end times")
      return
    }

    const start = new Date(startDateTime)

    // Extract time string HH:mm
    const startTimeStr = start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    const payload = {
      title,
      description,
      startDate: start,
      startTime: startTimeStr,
      endTime: endDateTime,
      questionIds: selectedQuestions
    }

    const mutation = id ? updateContest : createContest
    const mutationArgs = id ? { id, payload } : payload

    mutation.mutate(mutationArgs as any, {
      onSuccess: () => {
        toast.success(id ? "Contest updated successfully" : "Contest created successfully")
        navigate("/contests")
      },
      onError: (error) => {
        toast.error("Failed to save contest: " + error.message)
      }
    })
  }

  const isPending = createContest.isPending || updateContest.isPending

  if (id && isLoadingContest) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{id ? "Edit Contest" : "Create Contest"}</h2>
            <p className="text-muted-foreground">{id ? "Update contest details" : "Setup a new coding battle."}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="cursor-pointer">Cancel</Button>
          <Button className="gap-2 cursor-pointer" onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {id ? "Update Contest" : "Create Contest"}
          </Button>
        </div>
      </div>
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>Contest Details</CardTitle>
          <CardDescription>
            {id ? "Update information about the contest." : "Basic information about the contest."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Contest Name</Label>
            <Input
              placeholder="e.g. Weekly Leetcode Sprint #45"
              className="font-sans"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Rules, prizes, and specific instructions..."
              className="min-h-[200px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                className="font-mono"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="datetime-local"
                className="font-mono"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Questions</h3>
              <Button variant="outline" size="sm" onClick={() => navigate("/questions/new")}>
                Create New Question
              </Button>
            </div>

            {loadingQuestions ? (
              <div>Loading questions...</div>
            ) : (
              <>
                <QuestionTable
                  questions={uiQuestions}
                  isSelectable
                  selectedIds={selectedQuestions}
                  onSelectionChange={setSelectedQuestions}
                />
                {meta && meta.totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={meta.totalPages}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
            {selectedQuestions.length > 0 && (
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm font-medium">
                  Total Points: {uiQuestions.filter(q => selectedQuestions.includes(q.id)).reduce((acc, q) => acc + q.points, 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedQuestions.length} question(s) selected
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
