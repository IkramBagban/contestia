import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { QuestionTable, type Question as UIQuestion } from "@/components/domain/questions/question-table"
import { useQuestions } from "@/hooks/use-queries"
import { Pagination } from "@/components/ui/pagination"

export function QuestionsList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const limit = 20

  const {
    data: questionsResponse,
    isLoading,
  } = useQuestions(page, limit)

  const questions = questionsResponse?.data || []
  const meta = questionsResponse?.meta

  // Map API questions to UI questions
  const uiQuestions: UIQuestion[] = questions.map((q) => ({
    id: q.id,
    title: q.text?.substring(0, 50) || "Untitled",
    type: q.type.toLowerCase() as any,
    description: q.text,
    points: q.points
  }))

  if (isLoading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Question Bank</h2>
          <p className="text-muted-foreground">Manage your questions and challenges.</p>
        </div>
        <Button onClick={() => navigate("/questions/new")} className="gap-2 focus-visible:ring-0">
          <Plus className="h-4 w-4" />
          Create Question
        </Button>
      </div>

      <QuestionTable
        questions={uiQuestions}
        onEdit={(id) => navigate(`/questions/edit/${id}`)}
      />

      {meta && meta.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
