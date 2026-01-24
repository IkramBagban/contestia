import { useEffect, useState, useRef } from 'react';

// Types (should ideally come from shared types, but defining here for now)
export const WebSocketMessageType = {
    SUBSCRIBE_LEADERBOARD: "SUBSCRIBE_LEADERBOARD",
    UNSUBSCRIBE_LEADERBOARD: "UNSUBSCRIBE_LEADERBOARD",
    LEADERBOARD_UPDATE: "LEADERBOARD_UPDATE",
    ERROR: "ERROR"
} as const;

export type WebSocketMessageType = typeof WebSocketMessageType[keyof typeof WebSocketMessageType];

export interface LeaderboardEntry {
    userId: string;
    email: string;
    score: number;
}

const WS_URL = 'ws://localhost:3000'; // Environment variable in real app

export function useLeaderboard(contestId: string, enabled: boolean = true) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!contestId || !enabled) return;

        // Connect
        ws.current = new WebSocket(WS_URL);

        ws.current.onopen = () => {
            console.log('WS Connected');
            setIsConnected(true);
            setError(null);
            // Subscribe immediately
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({
                    type: WebSocketMessageType.SUBSCRIBE_LEADERBOARD,
                    payload: { contestId }
                }));
            }
        };

        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === WebSocketMessageType.LEADERBOARD_UPDATE) {
                    setLeaderboard(message.payload.leaderboard);
                } else if (message.type === WebSocketMessageType.ERROR) {
                    setError(message.error);
                    console.error("WS Error:", message.error);
                }
            } catch (e) {
                console.error("WS Parse Error", e);
            }
        };

        ws.current.onerror = (e) => {
            console.error("WebSocket error", e);
            setError("Connection error");
            setIsConnected(false);
        };

        ws.current.onclose = () => {
            console.log("WS Disconnected");
            setIsConnected(false);
        };

        return () => {
            // Unsubscribe and close
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({
                    type: WebSocketMessageType.UNSUBSCRIBE_LEADERBOARD
                }));
                ws.current.close();
            }
        };
    }, [contestId, enabled]);

    return { leaderboard, isConnected, error };
}
