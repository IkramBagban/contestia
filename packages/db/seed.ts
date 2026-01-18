import prismaClient from "./index";

const USERS_COUNT = 20;

const REALISTIC_USERS = [
    { email: "alex.dev@example.com" },
    { email: "sarah.coder@example.com" },
    { email: "mike.hacker@example.com" },
    { email: "emily.algo@example.com" },
    { email: "david.systems@example.com" },
    { email: "jessica.js@example.com" },
    { email: "ryan.react@example.com" },
    { email: "kevin.backend@example.com" },
    { email: "laura.ux@example.com" },
    { email: "chris.fullstack@example.com" },
    { email: "tom.testing@example.com" },
    { email: "lisa.logic@example.com" },
    { email: "brian.bytes@example.com" },
    { email: "natalie.node@example.com" },
    { email: "eric.express@example.com" },
];

async function main() {
    console.log("🌱 Starting Realistic Database Seed...");

    // 1. Create Users
    console.log("Creating Users (Upserting)...");
    const users = [];
    for (let i = 0; i < USERS_COUNT; i++) {
        const realistic = REALISTIC_USERS[i];
        const email = realistic ? realistic.email : `user_${i + 1}@example.com`;

        // Schema: User(id, email, password)
        const user = await prismaClient.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: "password123",
            }
        });
        users.push(user);
    }
    console.log(`✅ ${users.length} Users ready.`);
    const adminUser = users[0];

    // 2. Create Questions
    console.log("\nCreating Questions...");

    // -- MCQ Questions --
    const mcqData = [
        {
            text: "<p><strong>React.js:</strong> What is the primary purpose of <code>useEffect</code> hook?</p>",
            options: [
                { text: "To handle side effects in functional components", isCorrect: true },
                { text: "To manage global state", isCorrect: false },
                { text: "To create DOM elements directly", isCorrect: false },
                { text: "To optimize rendering performance only", isCorrect: false }
            ]
        },
        {
            text: "<p><strong>JavaScript:</strong> How do you check if a value is <code>NaN</code> correctly?</p>",
            options: [
                { text: "Number.isNaN(value)", isCorrect: true },
                { text: "value === NaN", isCorrect: false },
                { text: "typeof value === 'NaN'", isCorrect: false },
                { text: "value == NaN", isCorrect: false }
            ]
        },
        {
            text: "<p><strong>CSS:</strong> Which property is used to create a flex container?</p>",
            options: [
                { text: "display: flex;", isCorrect: true },
                { text: "position: flex;", isCorrect: false },
                { text: "flex: 1;", isCorrect: false },
                { text: "display: block-flex;", isCorrect: false }
            ]
        },
        {
            text: "<p><strong>Node.js:</strong> Which module is used to handle file system operations?</p>",
            options: [
                { text: "fs", isCorrect: true },
                { text: "file", isCorrect: false },
                { text: "system", isCorrect: false },
                { text: "path", isCorrect: false }
            ]
        },
        {
            text: "<p><strong>TypeScript:</strong> What implies that a variable can be any type?</p>",
            options: [
                { text: "any", isCorrect: true },
                { text: "unknown", isCorrect: false },
                { text: "void", isCorrect: false },
                { text: "never", isCorrect: false }
            ]
        }
    ];

    const mcqQuestions = [];
    for (const data of mcqData) {
        const q = await prismaClient.question.create({
            data: {
                text: data.text,
                type: "MCQ",
                points: 10,
                userId: adminUser.id,
                options: {
                    create: data.options
                }
            }
        });
        mcqQuestions.push(q);
    }

    // -- DSA Questions --
    const dsaData = [
        {
            text: `
            <h3>Problem: Two Sum</h3>
            <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
            <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
            <h4>Example:</h4>
            <pre class="bg-muted p-2 rounded">Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</pre>
          `,
            cases: [
                { input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), output: "[0,1]" },
                { input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), output: "[1,2]" }
            ]
        },
        {
            text: `
            <h3>Problem: Valid Palindrome</h3>
            <p>A phrase is a <strong>palindrome</strong> if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.</p>
            <p>Given a string <code>s</code>, return <code>true</code> if it is a palindrome, or <code>false</code> otherwise.</p>
            <h4>Example:</h4>
            <pre class="bg-muted p-2 rounded">Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.</pre>
          `,
            cases: [
                { input: '"A man, a plan, a canal: Panama"', output: "true" },
                { input: '"race a car"', output: "false" }
            ]
        }
    ];

    const dsaQuestions = [];
    for (const data of dsaData) {
        const q = await prismaClient.question.create({
            data: {
                text: data.text,
                type: "DSA",
                points: 50,
                userId: adminUser.id,
                testCases: {
                    create: data.cases
                }
            }
        });
        dsaQuestions.push(q);
    }

    const allQuestions = [...mcqQuestions, ...dsaQuestions];

    // 3. Create Contests
    console.log("\nCreating Contests...");
    const now = new Date();

    const hoursFromNow = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000);

    const contests = [
        // -- LAST WEEK (Closed) --
        {
            id: "contest-past-001",
            title: "Weekly Code Bash #45",
            desc: "<p>The 45th edition of our <strong>Weekly Code Bash</strong>. This contest focused on <em>Array Manipulation</em> and basic CSS.</p><p>Winners have been announced!</p>",
            start: hoursFromNow(-48),
            end: hoursFromNow(-46),
            status: "Past"
        },
        {
            id: "contest-past-002",
            title: "Beginner's DSA Sprint",
            desc: "<p>A quick sprint for beginners to test their logic. <ul><li>5 MCQ</li><li>1 Easy DSA</li></ul></p>",
            start: hoursFromNow(-24),
            end: hoursFromNow(-22),
            status: "Past"
        },
        // -- LIVE NOW --
        {
            id: "contest-live-001",
            title: "Grand Arena Championship",
            desc: "<p>Welcome to the <strong>Grand Arena</strong>! 🏆</p><p>Solve 5 MCQs and 2 DSA problems to win exciting badges. This contest is <strong>LIVE</strong> right now.</p><p><strong>Rules:</strong></p><ul><li>No cheating</li><li>Timely submission yields more points.</li></ul>",
            start: hoursFromNow(-1),
            end: hoursFromNow(2), // Ends in 2 hours
            status: "Live"
        },
        {
            id: "contest-live-002",
            title: "Lunchtime Lightning Round",
            desc: "<p>Quick fire questions for your lunch break. ⚡</p>",
            start: hoursFromNow(-0.5),
            end: hoursFromNow(0.5), // Ends in 30 mins
            status: "Live"
        },
        // -- UPCOMING --
        {
            id: "contest-upcoming-001",
            title: "Weekend Warrior",
            desc: "<p>Prepare for the ultimate weekend challenge. 🛡️ sword and shield required (metaphorically).</p>",
            start: hoursFromNow(24),
            end: hoursFromNow(27),
            status: "Upcoming"
        },
        {
            id: "contest-upcoming-002",
            title: "Hackathon Qualifier",
            desc: "<p>Qualifying round for the annual Hackathon. Top 100 move to the onsite final.</p>",
            start: hoursFromNow(48),
            end: hoursFromNow(54),
            status: "Upcoming"
        }
    ];

    for (const c of contests) {
        const startTimeStr = c.start.toTimeString().slice(0, 5);
        const endTimeStr = c.end.toTimeString().slice(0, 5);

        // CREATE Payload (No deleteMany allowed)
        const createData = {
            id: c.id,
            title: c.title,
            description: c.desc,
            startDate: c.start,
            startTime: startTimeStr,
            endTime: endTimeStr,
            userId: adminUser.id,
            questions: {
                create: allQuestions.map((q) => ({
                    questionId: q.id
                }))
            }
        };

        // UPDATE Payload (Delete old relations, add new)
        const updateData = {
            title: c.title,
            description: c.desc,
            startDate: c.start,
            startTime: startTimeStr,
            endTime: endTimeStr,
            userId: adminUser.id,
            questions: {
                deleteMany: {}, // Clear old associations
                create: allQuestions.map((q) => ({
                    questionId: q.id
                }))
            }
        };

        await prismaClient.contest.upsert({
            where: { id: c.id },
            create: createData,
            update: updateData
        });

        console.log(`Upserted [${c.status}] Contest: ${c.title}`);
    }

    // Cleanup old demo IDs
    const oldIds = ["contest-past-simulation", "contest-live-simulation", "contest-upcoming-simulation"];
    await prismaClient.contest.deleteMany({
        where: { id: { in: oldIds } }
    }).catch(() => { });

    console.log("✅ All Data Seeded.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prismaClient.$disconnect();
    });
