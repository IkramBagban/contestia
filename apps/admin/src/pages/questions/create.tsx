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

export function CreateQuestion() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const type = searchParams.get("type") || "mcq"

  // Simple state management for the form
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
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
        // Just for safety with checkbox type
        newOptions[index].isCorrect = value === true 
    } else {
        newOptions[index].text = value as string
    }
    setOptions(newOptions)
  }

  const handleSave = () => {
    const questionData = {
        type,
        title,
        description,
        options: type === 'mcq' ? options : undefined
    }
    console.log("Saving Question Data:", questionData)
    // In a real app, this would be an API call
    navigate("/questions") 
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
                    onClick={() => {}}
                    disabled
                    tooltip="Coding challenges coming soon!"
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
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>{type.toUpperCase()} Details</CardTitle>
            <CardDescription>Fill in the content for the question.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Question Title</Label>
              <Input 
                placeholder="e.g. Find the missing number" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Markdown)</Label>
              <Textarea 
                placeholder="## Problem Statement..." 
                className="font-mono text-sm min-h-[200px]" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Supports Markdown and Notion links.</p>
            </div>

            {type === "mcq" && (
              <div className="space-y-4 pt-4 border-t border-border/50">
                <Label className="text-base">Options & Answer</Label>
                <div className="grid gap-4">
                  {options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input bg-background font-mono font-medium">
                        {opt.id}
                      </div>
                      <Input 
                        placeholder={`Option ${opt.id} text...`} 
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                            id={`correct-${opt.id}`} 
                            checked={opt.isCorrect}
                            onCheckedChange={(checked) => handleOptionChange(idx, 'isCorrect', checked)}
                        />
                        <label
                          htmlFor={`correct-${opt.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Correct
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button onClick={handleSave}>Save Question</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TypeCard({ 
    label, 
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
