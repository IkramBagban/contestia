import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { QuestionTable, Question as UIQuestion } from "@/components/domain/questions/question-table"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useCreateContest, useQuestions } from "@/hooks/use-queries"

export function CreateContest() {
  const navigate = useNavigate()
  const createContest = useCreateContest()
  const { data: questions = [], isLoading: loadingQuestions } = useQuestions()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDateTime, setStartDateTime] = useState("")
  const [endDateTime, setEndDateTime] = useState("")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  // Map API questions to UI questions
  const uiQuestions: UIQuestion[] = questions.map((q, i) => ({
    id: q.id, 
    title: q.text?.substring(0, 50) || "Untitled",
    type: q.type.toLowerCase() as any,
    description: q.text,
    points: q.points
  }))

  const handleSave = () => {
    if (!startDateTime || !endDateTime) {
        alert("Please set start and end times")
        return
    }

    const start = new Date(startDateTime)
    
    // Extract time string HH:mm
    const startTimeStr = start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    createContest.mutate({
        title,
        description,
        startDate: start,
        startTime: startTimeStr,
        endTime: endDateTime, // Sending full ISO string or whatever input gives? Verify schema expectation. Schema says string.
        questionIds: selectedQuestions
    }, {
        onSuccess: () => {
            navigate("/contests")
        },
        onError: (err) => {
            alert("Failed to create contest: " + err.message)
        }
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/contests")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create New Contest</h2>
          <p className="text-muted-foreground">Set up the details for your upcoming battle.</p>
        </div>
      </div>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>Contest Details</CardTitle>
          <CardDescription>
            Basic information about the contest.
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
            <Textarea 
              placeholder="Rules, prizes, and specific instructions..." 
              className="h-32 font-sans" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                <QuestionTable 
                   questions={uiQuestions}
                   isSelectable
                   selectedIds={selectedQuestions}
                   onSelectionChange={setSelectedQuestions}
                />
            )}
            {selectedQuestions.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground text-right">
                    {selectedQuestions.length} question(s) selected
                </p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
             <Link to="/contests">
              <Button variant="outline">Cancel</Button>
             </Link>
            <Button className="gap-2" onClick={handleSave} disabled={createContest.isPending}>
              <Save className="h-4 w-4" />
              {createContest.isPending ? "Saving..." : "Save Contest"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
