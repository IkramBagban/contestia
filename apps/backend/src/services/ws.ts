import { WebSocket } from "ws";
import { WebSocketMessageType, type WSResponse } from "../../utils/types";
import { redisManager } from "./redis";

const websocketHandler = (ws: WebSocket) => {
    console.log("[WS] Client connected");

    let leaderboardIntervalId: NodeJS.Timeout | null = null;

    const sendMessage = (response: WSResponse) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(response));
        }
    };

    const handleSubscribeLeaderboard = async (contestId: string) => {
        if (!contestId) {
            sendMessage({
                type: WebSocketMessageType.ERROR,
                error: "Invalid payload: contestId is required"
            });
            return;
        }

        // Clear existing interval if switching contests or re-subscribing
        if (leaderboardIntervalId) {
            clearInterval(leaderboardIntervalId);
        }

        await fetchAndSendLeaderboard(contestId);

        leaderboardIntervalId = setInterval(() => {
            fetchAndSendLeaderboard(contestId);
        }, 2000);
    };

    const fetchAndSendLeaderboard = async (contestId: string) => {
        try {

            const leaderboardRaw = await redisManager.redis.zrevrange(
                `contest:${contestId}:leaderboard`,
                0,
                -1,
                "WITHSCORES" // if i don't add this then this will only retur user idsF
            );

            const leaderboard = [];
            for (let i = 0; i < leaderboardRaw.length; i += 2) {
                const userId = leaderboardRaw[i];
                const score = leaderboardRaw[i + 1];
                if (userId && score) {
                    leaderboard.push({ userId, score: parseInt(score) });
                }
            }

            sendMessage({
                type: WebSocketMessageType.LEADERBOARD_UPDATE,
                payload: { contestId, leaderboard }
            });
        } catch (error) {
            console.error("[WS] Redis Error:", error);
            sendMessage({
                type: WebSocketMessageType.ERROR,
                error: "Failed to fetch leaderboard"
            });
        }
    };

    const handleUnsubscribeLeaderboard = () => {
        if (leaderboardIntervalId) {
            clearInterval(leaderboardIntervalId);
            leaderboardIntervalId = null;
            console.log("[WS] Unsubscribed from leaderboard");
        }
    };

    ws.on("message", async (rawMessage) => {
        try {
            const message = JSON.parse(rawMessage.toString());
            const { type, payload } = message;

            switch (type) {
                case WebSocketMessageType.SUBSCRIBE_LEADERBOARD:
                    await handleSubscribeLeaderboard(payload?.contestId);
                    break;

                case WebSocketMessageType.UNSUBSCRIBE_LEADERBOARD:
                    handleUnsubscribeLeaderboard();
                    break;

                default:
                    sendMessage({
                        type: WebSocketMessageType.ERROR,
                        error: `Unknown message type: ${type}`
                    });
            }
        } catch (error) {
            console.error("[WS] Parse Error:", error);
            sendMessage({
                type: WebSocketMessageType.ERROR,
                error: "Invalid JSON format"
            });
        }
    });

    ws.on("close", () => {
        console.log("[WS] Client disconnected");
        if (leaderboardIntervalId) {
            clearInterval(leaderboardIntervalId);
        }
    });

    ws.on("error", (error) => {
        console.error("[WS] Connection Error:", error);
        if (leaderboardIntervalId) {
            clearInterval(leaderboardIntervalId);
        }
    });
};

export default websocketHandler;