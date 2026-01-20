import { cn } from "@/lib/utils";

interface VantaLoaderProps {
    text?: string;
    className?: string;
    fullScreen?: boolean;
}

export function VantaLoader({ text = "FINALIZING MISSION...", className, fullScreen = false }: VantaLoaderProps) {
    const content = (
        <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
            <style>
                {`
                @keyframes diamond-rotate {
                    0% { transform: rotate(45deg) scale(1); border-radius: 20%; }
                    50% { transform: rotate(225deg) scale(1.1); border-radius: 50%; }
                    100% { transform: rotate(405deg) scale(1); border-radius: 20%; }
                }
                .diamond-spinner {
                    animation: diamond-rotate 3s ease-in-out infinite;
                }
                `}
            </style>
            <div className="w-16 h-16 border-4 border-foreground diamond-spinner shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
            <p className="text-lg font-black italic tracking-tighter text-foreground/80 uppercase animate-pulse">
                {text}
            </p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
                {content}
            </div>
        );
    }

    return content;
}
