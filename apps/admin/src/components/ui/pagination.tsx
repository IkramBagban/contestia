import { Button } from "./button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null

    const getPages = () => {
        const pages = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i)
                pages.push("...")
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 3) {
                pages.push(1)
                pages.push("...")
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push("...")
                pages.push(currentPage - 1)
                pages.push(currentPage)
                pages.push(currentPage + 1)
                pages.push("...")
                pages.push(totalPages)
            }
        }
        return pages
    }

    return (
        <div className="flex items-center justify-center gap-2 py-4">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 cursor-pointer"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPages().map((page, i) => (
                typeof page === "number" ? (
                    <Button
                        key={i}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(page)}
                        className="h-8 w-8 cursor-pointer"
                    >
                        {page}
                    </Button>
                ) : (
                    <div key={i} className="flex h-8 w-8 items-center justify-center">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                )
            ))}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 cursor-pointer"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
