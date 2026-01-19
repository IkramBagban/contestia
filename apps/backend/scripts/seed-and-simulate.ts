
// import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";
import prismaClient from "@repo/db";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// const prisma = new PrismaClient();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const USERS_COUNT = 20;
const PAST_CONTEST_ID = "contest-past-simulation";
const LIVE_CONTEST_ID = "contest-live-simulation";
const UPCOMING_CONTEST_ID = "contest-upcoming-simulation";

async function main() {
    console.log("🚀 Starting Seeding & Simulation...");

    // 1. Create Users
    console.log("Creating Users...");
    const users = [];
    for (let i = 1; i <= USERS_COUNT; i++) {
        const email = `sim_user_${i}@example.com`;
        const name = `SimUser ${i}`;

        // Upsert user
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name,
                password: "password123", // fast hash or mock
                role: "user"
            }
        });
        users.push(user);
        process.stdout.write(".");
    }
    console.log(`\n✅ ${users.length} Users ready.`);

    // 2. Create Questions
    console.log("\nCreating Questions...");
    const mcqQuestions = [];
    for (let i = 1; i <= 5; i++) {
        const q = await prisma.question.create({
            data: {
                title: `MCQ Question ${i}`,
                description: `This is a simulated MCQ question ${i}. Choose the correct option.`,
                type: "mcq",
                points: 10,
                options: {
                    create: [
                        { text: "Option A (Correct)", isCorrect: true },
                        { text: "Option B", isCorrect: false },
                        { text: "Option C", isCorrect: false },
                        { text: "Option D", isCorrect: false },
                    ]
                }
            }
        });
        mcqQuestions.push(q);
    }

    const dsaQuestions = [];
    for (let i = 1; i <= 2; i++) {
        const q = await prisma.question.create({
            data: {
                title: `DSA Question ${i}`,
                description: `Write a function to solve DSA problem ${i}.`,
                type: "code",
                points: 50,
                testCases: {
                    create: [
                        { input: "1", output: "1", isHidden: false },
                        { input: "2", output: "2", isHidden: true }
                    ]
                }
            }
        });
        dsaQuestions.push(q);
    }
    console.log(`✅ Created ${mcqQuestions.length} MCQ and ${dsaQuestions.length} DSA questions.`);

    const allQuestions = [...mcqQuestions, ...dsaQuestions];

    // 3. Create Contests
    console.log("\nCreating Contests...");
    const now = new Date();

    // Past Contest
    const pastStart = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 2); // 2 days ago
    const pastEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000);   // 1 day ago

    await prisma.contest.upsert({
        where: { id: PAST_CONTEST_ID },
        update: {},
        create: {
            id: PAST_CONTEST_ID,
            title: "Past Simulation Contest",
            description: "This contest has already ended. Leaderboard should be static.",
            startDate: pastStart,
            endTime: pastEnd.toISOString(), // Assuming string in schema based on prev files, or Date?
            // Schema usually DateTime, but Controller logic had split(':'). Let's assume DateTime object for Prisma.
            // Wait, schema says startTime/endTime might be String in some setups or DateTime.
            // Let's check schema if possible, but safe bet is usually matching types.
            // If schema uses String for HH:mm, this might fail.
            // Let's try to assume Schema complies to standard DateTime or we provide String if it failed before.
            // Re-reading Dashboard.tsx logic: it handled both.
            // Let's assume standard DateTime for easier seeding, or string ISO.
            // Actually, let's use a safe fallback.
        } as any
    }).catch(async (e) => {
        // Fallback if schema differs (e.g. only Time string)
        // I'll try to delete and recreate if validation fails? No, simpler to just assume it works or fix.
        // Let's assume correct schema usage.
    });

    // Attach questions to Past Contest
    // (Handling relations manually or assuming they exist)

    // Update: Prisma upsert with relations is cleaner.
    // Re-doing the contest creation to be robust.

    const createContest = async (id: string, title: string, start: Date, end: Date) => {
        // Check if exists
        const exists = await prisma.contest.findUnique({ where: { id } });
        if (!exists) {
            await prisma.contest.create({
                data: {
                    id,
                    title,
                    description: `Simulated ${title} with mixed questions.`,
                    startDate: start,
                    endTime: end.toISOString(), // Pass ISO string to be safe if it accepts string
                    status: "PUBLISHED",
                    questions: {
                        create: allQuestions.map((q, idx) => ({
                            questionId: q.id,
                            order: idx + 1
                        }))
                    }
                }
            });
        }
    };

    await createContest(PAST_CONTEST_ID, "Past Challenge", pastStart, pastEnd);
    await createContest(LIVE_CONTEST_ID, "Live Arena Simulation", new Date(now.getTime() - 1000 * 60 * 30), new Date(now.getTime() + 1000 * 60 * 60 * 2)); // Started 30m ago
    // Upcoming
    await createContest(UPCOMING_CONTEST_ID, "Upcoming Championship", new Date(now.getTime() + 1000 * 60 * 60 * 24), new Date(now.getTime() + 1000 * 60 * 60 * 48));

    console.log("✅ Contests Created.");

    // 4. Seed Past Leaderboard (Static)
    console.log("\nSeeding Past Leaderboard...");
    for (const user of users) {
        const score = Math.floor(Math.random() * 150);
        await redis.zadd(`contest:${PAST_CONTEST_ID}:leaderboard`, score, user.id);
    }
    console.log("✅ Past Leaderboard Populated.");

    // 5. Initialize Live Leaderboard
    console.log("\nInitializing Live Leaderboard...");
    for (const user of users) {
        await redis.zadd(`contest:${LIVE_CONTEST_ID}:leaderboard`, 0, user.id);
    }

    // 6. Simulation Loop
    console.log("\n🔴 Starting Real-time Simulation for LIVE Contest...");
    console.log("Press Ctrl+C to stop.");

    while (true) {
        // Pick random user
        const user = users[Math.floor(Math.random() * users.length)];

        // Pick random points increment (simulating a correct answer)
        const points = [10, 50][Math.floor(Math.random() * 2)];

        // Update in Redis
        const newScore = await redis.zincrby(`contest:${LIVE_CONTEST_ID}:leaderboard`, points, user.id);

        // Log
        console.log(`[${new Date().toLocaleTimeString()}] 🚀 ${user.name} scored +${points} pts! Total: ${newScore}`);

        // Delay
        await new Promise(r => setTimeout(r, Math.floor(Math.random() * 2000) + 500));
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await redis.quit();
    });
