import Redis from "ioredis";

class RedisManager {
    redis: Redis;
    static instance: RedisManager;

    private constructor() {

        this.redis = new Redis(process.env.REDIS_URL!);

        this.redis.on("connect", () => {
            console.log("Redis connected successfully");
        });

        this.redis.on("error", (err) => {
            console.log("Redis connection error:", err);
        });
    }



    static getInstance(): RedisManager {
        if (!this.instance) {
            this.instance = new RedisManager();
        }
        return this.instance
    }
}

export const redisManager = RedisManager.getInstance();
export default RedisManager