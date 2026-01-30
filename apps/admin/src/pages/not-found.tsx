import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
            <div className="space-y-4">
                <h1 className="text-9xl font-extrabold tracking-tighter text-primary">404</h1>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Something's missing.</h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Sorry, we can't find that page. You'll find lots to explore on the dashboard.
                </p>
                <Link to="/dashboard" className="inline-block mt-6">
                    <Button size="lg" className="px-8 font-semibold">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    )
}
