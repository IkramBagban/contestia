import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { QuestionTable, Question as UIQuestion } from "@/components/domain/questions/question-table"
import { useQuestions } from "@/hooks/use-queries"

export function QuestionsList() {
  const navigate = useNavigate()
  const { data: questions = [], isLoading } = useQuestions()

  if (isLoading) return <div>Loading questions...</div>

  // Map API questions to UI questions
  const uiQuestions: UIQuestion[] = questions.map((q, i) => ({
    id: q.id,
    title: q.text?.substring(0, 50) || "Untitled", // Truncate text for title
    type: q.type.toLowerCase() as any,
    description: q.text,
    points: q.points
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Question Bank</h2>
          <p className="text-muted-foreground">Manage your questions and challenges.</p>
        </div>
        <Button onClick={() => navigate("/questions/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Question
        </Button>
      </div>

      <QuestionTable 
        questions={uiQuestions} 
        onEdit={(id) => navigate(`/questions/edit/${id}`)}
      />
    </div>
  )
}
