import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

export function CreateContest() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
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
            />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              placeholder="Rules, prizes, and specific instructions..." 
              className="h-32 font-sans" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="datetime-local" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="datetime-local" className="font-mono" />
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <h3 className="text-lg font-medium mb-4">Questions</h3>
            <div className="flex flex-col gap-4 items-center justify-center p-8 border-2 border-dashed border-muted rounded-lg bg-muted/20">
              <p className="text-muted-foreground text-sm text-center">
                This contest has no questions yet.
              </p>
              <Button variant="secondary" onClick={() => navigate("/questions/new")}>
                Add Questions
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
             <Link to="/contests">
              <Button variant="outline">Cancel</Button>
             </Link>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
