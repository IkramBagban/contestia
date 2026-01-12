import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useCreateQuestion } from "@/hooks/use-queries"

export function CreateQuestion() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const type = (searchParams.get("type") || "mcq") as "mcq" | "dsa" | "sandbox"
  
  const createQuestion = useCreateQuestion()

  // Simple state management for the form
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [points, setPoints] = useState(10)
  const [options, setOptions] = useState([
    { id: 'A', text: '', isCorrect: false },
    { id: 'B', text: '', isCorrect: false },
    { id: 'C', text: '', isCorrect: false },
    { id: 'D', text: '', isCorrect: false },
  ])

  const handleTypeChange = (value: string) => {
    setSearchParams({ type: value })
  }

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean | "indeterminate") => {
    const newOptions = [...options]
    if (field === 'isCorrect') {
        newOptions[index].isCorrect = value === true 
    } else {
        newOptions[index].text = value as string
    }
    setOptions(newOptions)
  }

  const handleSave = () => {
    // Combine title and description for 'text' field
    const text = description ? `${title}\n\n${description}` : title

    const payload = {
        type: type === 'mcq' ? 'MCQ' : 'DSA',
        text,
        points: Number(points),
        options: type === 'mcq' ? options.map(o => ({
            text: o.text,
            isCorrect: o.isCorrect,
        })) : undefined
    }

    createQuestion.mutate(payload as any, {
        onSuccess: () => {
             navigate("/questions")
        },
        onError: (error) => {
            alert("Failed to create question: " + error.message)
        }
    })
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add New Question</h2>
          <p className="text-muted-foreground">Add a challenge to your question bank.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Type Selection */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <TooltipProvider delayDuration={0}>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <TypeCard 
                    label="Multiple Choice" 
                    value="mcq" 
                    active={type === "mcq"} 
                    onClick={() => handleTypeChange("mcq")}
                />
                <TypeCard 
                    label="DSA / Coding" 
                    value="dsa" 
                    active={type === "dsa"} 
                    onClick={() => handleTypeChange("dsa")}
                    // disabled
                    tooltip="Select for coding challenges"
                />
                <TypeCard 
                    label="Custom Sandbox" 
                    value="sandbox" 
                    active={type === "sandbox"} 
                    onClick={() => {}}
                    disabled
                    tooltip="Sandbox environments coming soon!"
                />
                </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Question Form */}
        <Card className="border-border/50 bg-card">
            <CardHeader>
                <CardTitle>Question Details</CardTitle>
                <CardDescription>Define the core problem statement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Question Title</Label>
                    <Input 
                        id="title" 
                        placeholder="e.g. React Hook Rules" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input 
                        id="points" 
                        type="number" 
                        placeholder="10" 
                        value={points}
                        onChange={(e) => setPoints(Number(e.target.value))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description (Markdown supported)</Label>
                    <Textarea 
                        id="description" 
                        placeholder="Detailed question description..." 
                        className="h-32 font-mono text-sm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>

        {/* Options (MCQ Only) */}
        {type === "mcq" && (
            <Card className="border-border/50 bg-card">
                <CardHeader>
                    <CardTitle>Answer Options</CardTitle>
                    <CardDescription>Select the correct answer(s).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {options.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-3">
                           <Checkbox 
                                checked={option.isCorrect}
                                onCheckedChange={(checked) => handleOptionChange(index, 'isCorrect', checked)}
                           />
                           <div className="flex-1">
                                <Input 
                                    placeholder={`Option ${option.id}`} 
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                />
                           </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}

        <div className="flex justify-end gap-3 pt-4">
             <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button className="gap-2" onClick={handleSave} disabled={createQuestion.isPending}>
              {createQuestion.isPending ? "Saving..." : "Save Question"}
            </Button>
        </div>
      </div>
    </div>
  )
}

function TypeCard({ 
    label, 
    value, 
    active, 
    onClick, 
    disabled, 
    tooltip 
}: { 
    label: string, 
    value: string, 
    active: boolean, 
    onClick: () => void,
    disabled?: boolean,
    tooltip?: string
}) {
  const CardContent = (
    <div 
      onClick={disabled ? undefined : onClick}
      className={cn(
        "rounded-lg border p-4 text-center transition-all",
        active 
            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
            : 'border-border',
        !disabled && "cursor-pointer hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed bg-muted/20"
      )}
    >
      <div className="font-medium">{label}</div>
    </div>
  )

  if (tooltip) {
      return (
        <Tooltip>
            <TooltipTrigger asChild>
                {CardContent}
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
      )
  }

  return CardContent
}
