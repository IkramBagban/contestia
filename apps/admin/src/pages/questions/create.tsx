import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export function CreateQuestion() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const type = searchParams.get("type") || "mcq"

  const handleTypeChange = (value: string) => {
    setSearchParams({ type: value })
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              />
              <TypeCard 
                label="Custom Sandbox" 
                value="sandbox" 
                active={type === "sandbox"} 
                onClick={() => handleTypeChange("sandbox")}
              />
            </div>
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
              <Input placeholder="e.g. Find the missing number" />
            </div>

            <div className="space-y-2">
              <Label>Description (Markdown)</Label>
              <Textarea 
                placeholder="## Problem Statement..." 
                className="font-mono text-sm min-h-[200px]" 
              />
              <p className="text-xs text-muted-foreground">Supports Markdown and Notion links.</p>
            </div>

            {type === "mcq" && (
              <div className="space-y-4 pt-4 border-t border-border/50">
                <Label className="text-base">Options & Answer</Label>
                <div className="grid gap-4">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input bg-background font-mono font-medium">
                        {opt}
                      </div>
                      <Input placeholder={`Option ${opt} text...`} />
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`correct-${opt}`} />
                        <label
                          htmlFor={`correct-${opt}`}
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
              <Button onClick={() => navigate(-1)}>Save Question</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TypeCard({ label, value, active, onClick }: { label: string, value: string, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`
        cursor-pointer rounded-lg border p-4 text-center transition-all hover:bg-muted/50
        ${active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}
      `}
    >
      <div className="font-medium">{label}</div>
    </div>
  )
}
