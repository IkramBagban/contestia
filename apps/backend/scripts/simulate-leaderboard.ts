import { redisManager } from '../src/services/redis';
// import dotenv from 'dotenv';
// import path from 'path';

// Load env vars from the backend root
// dotenv.config({ path: path.join(__dirname, '../.env') });


console.log("process.env.REDIS_URL=> ", process.env.REDIS_URL)

const CONTEST_ID = "contest-1"; // Static ID for testing
const USERS = [
    "user-1", "user-2", "user-3", "user-4", "user-5",
    "user-6", "user-7", "user-8", "user-9", "user-10"
];

async function simulateRealTimeUpdates() {
    console.log(`Starting simulation for Contest: ${CONTEST_ID}`);

    // Initial scores
    for (const user of USERS) {
        await redisManager.redis.zadd(`contest:contest-1:leaderboard`, 0, user);
    }

    while (true) {
        // Pick a random user
        const randomUser = USERS[Math.floor(Math.random() * USERS.length)];

        // Add random points (10, 20, or 50)
        const points = [10, 20, 50][Math.floor(Math.random() * 3)];

        // Update score (using zincrby to simulate adding points)
        // Note: Our backend controller uses ZADD (recalc total), but for simulation 
        // incrementing is fine to show movement.
        const newScore = await redisManager.redis.zincrby(`contest:contest-1:leaderboard`, points!, randomUser!);

        console.log(`[${new Date().toISOString()}] Updated ${randomUser}: +${points} pts -> Total: ${newScore}`);

        // Random delay between 200ms and 1000ms
        const delay = Math.floor(Math.random() * 800) + 200;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

// simulateRealTimeUpdates().catch(console.error);


export default simulateRealTimeUpdates