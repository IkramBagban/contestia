// Mock data handling
export interface Question {
  id: string
  title: string
  type: 'mcq' | 'dsa' | 'sandbox'
  description: string
  points: number
  userId?: string
}

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "1",
    title: "Two Sum",
    type: "dsa",
    description: "Find two numbers that add up to target",
    points: 10
  },
  {
    id: "2",
    title: "React hook rules",
    type: "mcq",
    description: "Which of the following is true about hooks?",
    points: 5
  },
  {
    id: "3",
    title: "Redux Challenge",
    type: "sandbox",
    description: "Implement a counter with Redux",
    points: 20
  },
  {
    id: "4",
    title: "Time Complexity of QuickSort",
    type: "mcq",
    description: "What is the average case time complexity?",
    points: 5
  }
]

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"

interface QuestionTableProps {
  questions: Question[]
  isSelectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  currentUserId?: string
}

export function QuestionTable({
  questions,
  isSelectable = false,
  selectedIds = [],
  onSelectionChange,
  onEdit,
  onDelete,
  currentUserId
}: QuestionTableProps) {

  const toggleSelection = (id: string) => {
    if (!onSelectionChange) return
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const toggleAll = () => {
    if (!onSelectionChange) return
    if (selectedIds.length === questions.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(questions.map(q => q.id))
    }
  }

  return (
    <div className="rounded-md border border-border/50 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-muted/50">
            {isSelectable && (
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={questions.length > 0 && selectedIds.length === questions.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
            )}
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Points</TableHead>
            {!isSelectable && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isSelectable ? 5 : 4} className="h-24 text-center text-muted-foreground">
                No questions found.
              </TableCell>
            </TableRow>
          ) : (
            questions.map((question) => (
              <TableRow key={question.id} className="border-border/50 hover:bg-muted/50">
                {isSelectable && (
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.includes(question.id)}
                      onCheckedChange={() => toggleSelection(question.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium font-sans">{question.title}</TableCell>
                <TableCell>
                  <TypeBadge type={question.type} />
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">{question.points}</TableCell>
                {!isSelectable && (
                  <TableCell className="text-right space-x-2">
                    {(!currentUserId || question.userId === currentUserId) ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 cursor-pointer"
                          onClick={() => onEdit?.(question.id)}
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 cursor-pointer hover:text-destructive"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this question?")) {
                              onDelete?.(question.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] opacity-70">Read Only</Badge>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {
  switch (type) {
    case 'mcq':
      return <Badge variant="outline" className="border-blue-500/20 text-blue-500">MCQ</Badge>
    case 'dsa':
      return <Badge variant="outline" className="border-orange-500/20 text-orange-500">DSA</Badge>
    case 'sandbox':
      return <Badge variant="outline" className="border-purple-500/20 text-purple-500">Sandbox</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}
