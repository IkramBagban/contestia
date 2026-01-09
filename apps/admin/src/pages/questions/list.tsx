import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { MOCK_QUESTIONS, QuestionTable } from "@/components/domain/questions/question-table"

export function QuestionsList() {
  const navigate = useNavigate()

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

      <QuestionTable questions={MOCK_QUESTIONS} />
    </div>
  )
}
