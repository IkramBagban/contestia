import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <h1 className="text-9xl font-extrabold tracking-tighter mb-4 text-primary">404</h1>
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link to="/">
                <Button size="lg" className="font-semibold">
                    Back to Home
                </Button>
            </Link>
        </div>
    )
}
