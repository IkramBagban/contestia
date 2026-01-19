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
    { email: "sophie.sql@example.com" },
    { email: "greg.golang@example.com" },
    { email: "anna.angular@example.com" },
    { email: "victor.vue@example.com" },
    { email: "olivia.ops@example.com" },
];

async function main() {
    console.log("🌱 Starting Contestia Seed...");

    // ---------------- USERS ----------------
    const users = [];
    for (let i = 0; i < USERS_COUNT; i++) {
        const email = REALISTIC_USERS[i]!.email;

        const user = await prismaClient.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: "password123"
            }
        });
        users.push(user);
    }

    const adminUser: any = users[0];
    console.log(`✅ ${users.length} users ready`);

    // ---------------- MCQ QUESTIONS ----------------
    const mcqData = [
        {
            text: "In React, what is the **primary purpose** of the `useEffect` hook?",
            options: [
                { text: "To perform side effects in function components", isCorrect: true },
                { text: "To manage local component state", isCorrect: false },
                { text: "To directly manipulate the DOM during render", isCorrect: false },
                { text: "To handle navigation between routes", isCorrect: false }
            ]
        },
        {
            text: "Which of the following is the **correct and most reliable** way to check for `NaN` in JavaScript?",
            options: [
                { text: "`Number.isNaN(value)`", isCorrect: true },
                { text: "`value === NaN`", isCorrect: false },
                { text: "`isNaN(value)`", isCorrect: false },
                { text: "`typeof value === 'NaN'`", isCorrect: false }
            ]
        },
        {
            text: "To create a **flex container** in CSS, which property must be applied to the parent element?",
            options: [
                { text: "`display: flex;`", isCorrect: true },
                { text: "`flex-direction: row;`", isCorrect: false },
                { text: "`display: flexbox;`", isCorrect: false },
                { text: "`flex: container;`", isCorrect: false }
            ]
        },
        {
            text: "In Node.js, which built-in module is primarily used for **file system operations** (reading, writing, deleting files, etc.)?",
            options: [
                { text: "`fs`", isCorrect: true },
                { text: "`path`", isCorrect: false },
                { text: "`file`", isCorrect: false },
                { text: "`stream`", isCorrect: false }
            ]
        },
        {
            text: "In TypeScript, what does the **`any`** type actually mean?",
            options: [
                { text: "Disables type checking for that value — it can be anything", isCorrect: true },
                { text: "The value will be type-checked at runtime", isCorrect: false },
                { text: "Equivalent to the `unknown` type but more strict", isCorrect: false },
                { text: "Represents a value that can never exist", isCorrect: false }
            ]
        },
        {
            text: "**Promise.all()** in JavaScript will reject as soon as:",
            options: [
                { text: "Any one of the promises rejects", isCorrect: true },
                { text: "All promises have resolved", isCorrect: false },
                { text: "The first promise resolves", isCorrect: false },
                { text: "Half of the promises reject", isCorrect: false }
            ]
        },
        {
            text: "Which of the following CSS properties **does NOT** trigger layout (reflow)?",
            options: [
                { text: "`transform: translateX(10px);`", isCorrect: true },
                { text: "`width: 100px;`", isCorrect: false },
                { text: "`margin-top: 20px;`", isCorrect: false },
                { text: "`top: 50px;`", isCorrect: false }
            ]
        },
        {
            text: "In modern JavaScript, what is the correct way to create a **private field** in a class?",
            options: [
                { text: "Using the `#` prefix (e.g. `#secret`)", isCorrect: true },
                { text: "Using the `private` keyword", isCorrect: false },
                { text: "Using double underscore `__secret`", isCorrect: false },
                { text: "Using the `protected` keyword", isCorrect: false }
            ]
        },
        {
            text: "What will be the output of this code?\n\n```js\nconsole.log(1 + \"2\" + \"2\");\n```",
            options: [
                { text: "\"122\"", isCorrect: true },
                { text: "5", isCorrect: false },
                { text: "\"32\"", isCorrect: false },
                { text: "NaN", isCorrect: false }
            ]
        },
        {
            text: "Which array method **creates a new array** with all elements that pass the test implemented by the provided function?",
            options: [
                { text: "`filter()`", isCorrect: true },
                { text: "`map()`", isCorrect: false },
                { text: "`forEach()`", isCorrect: false },
                { text: "`reduce()`", isCorrect: false }
            ]
        },
        {
            text: "In Git, what does the command **`git rebase -i HEAD~3`** allow you to do?",
            options: [
                { text: "Interactively rebase and edit the last 3 commits", isCorrect: true },
                { text: "Merge the last 3 commits into one", isCorrect: false },
                { text: "Delete the last 3 commits permanently", isCorrect: false },
                { text: "Create a new branch from 3 commits ago", isCorrect: false }
            ]
        },
        {
            text: "What is the time complexity of accessing an element in an array by index in JavaScript?",
            options: [
                { text: "O(1)", isCorrect: true },
                { text: "O(n)", isCorrect: false },
                { text: "O(log n)", isCorrect: false },
                { text: "O(n²)", isCorrect: false }
            ]
        },
        {
            text: "Which HTTP method is **idempotent** and **safe** (should not change server state)?",
            options: [
                { text: "GET", isCorrect: true },
                { text: "POST", isCorrect: false },
                { text: "PUT", isCorrect: false },
                { text: "DELETE", isCorrect: false }
            ]
        },
        {
            text: "In TypeScript, **`unknown`** is considered **safer** than `any` because:",
            options: [
                { text: "You must perform some type checking/narrowing before using it", isCorrect: true },
                { text: "It automatically converts to any other type", isCorrect: false },
                { text: "It can only hold primitive values", isCorrect: false },
                { text: "It is the default type for all variables", isCorrect: false }
            ]
        },
        {
            text: "What does the **`async`** keyword do when placed before a function?",
            options: [
                { text: "Makes the function always return a Promise", isCorrect: true },
                { text: "Makes the function run in parallel with other code", isCorrect: false },
                { text: "Allows the use of `yield` inside the function", isCorrect: false },
                { text: "Prevents the function from throwing errors", isCorrect: false }
            ]
        },
        {
            text: "Which of these CSS values for `position` removes the element from the normal document flow?",
            options: [
                { text: "`absolute` and `fixed`", isCorrect: true },
                { text: "`relative`", isCorrect: false },
                { text: "`static`", isCorrect: false },
                { text: "`sticky`", isCorrect: false }
            ]
        },
        {
            text: "In Node.js, which of the following is **true** about the `process.nextTick()` function?",
            options: [
                { text: "It runs before any other I/O or timer callbacks in the current event loop phase", isCorrect: true },
                { text: "It is exactly the same as `setImmediate()`", isCorrect: false },
                { text: "It is slower than `setTimeout(fn, 0)`", isCorrect: false },
                { text: "It is executed in the next event loop iteration only", isCorrect: false }
            ]
        },
        {
            text: "What is the correct way to **deep clone** an object in JavaScript (simple modern approach)?",
            options: [
                { text: "`structuredClone(obj)`", isCorrect: true },
                { text: "`JSON.parse(JSON.stringify(obj))`", isCorrect: false },
                { text: "`Object.assign({}, obj)`", isCorrect: false },
                { text: "`[...obj]`", isCorrect: false }
            ]
        },
        {
            text: "Which operator is used for **optional chaining** in JavaScript?",
            options: [
                { text: "`?.`", isCorrect: true },
                { text: "`??`", isCorrect: false },
                { text: "`||=`", isCorrect: false },
                { text: "`?.?`", isCorrect: false }
            ]
        },
        {
            text: "In REST API design, which HTTP status code should be returned when a **resource is successfully created**?",
            options: [
                { text: "201 Created", isCorrect: true },
                { text: "200 OK", isCorrect: false },
                { text: "204 No Content", isCorrect: false },
                { text: "202 Accepted", isCorrect: false }
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
                funcName: "",
                options: { create: data.options }
            }
        });
        mcqQuestions.push(q);
    }
    console.log(`✅ ${mcqQuestions.length} MCQ questions ready`);

    // ---------------- DSA QUESTIONS ----------------
    const dsaData = [
        {
            text: `# Valid Palindrome

A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.

## Function Signature

\`\`\`typescript
function isPalindrome(s: string): boolean;
\`\`\`

## Examples

**Example 1:**

Input: s = "madam"  
Output: true  
Explanation: "madam" reads the same forward and backward.

**Example 2:**

Input: s = "racecar"  
Output: true  
Explanation: "racecar" is a palindrome.

## Constraints

- 1 <= s.length <= 2 * 10^5  
- s consists of printable ASCII characters.

## Additional Test Cases

There are hidden test cases to validate edge cases and larger inputs.`,
            funcName: "isPalindrome",
            points: 20,
            cases: [
                { input: ["madam"], expectedOutput: true },
                { input: ["racecar"], expectedOutput: true },
                { input: ["hello"], expectedOutput: false, isHidden: true },
                { input: [""], expectedOutput: true, isHidden: true },
                { input: ["A man, a plan, a canal: Panama"], expectedOutput: true, isHidden: true }
            ]
        },
        {
            text: `# Find Maximum Element in an Array

Given an array of integers \`nums\`, find and return the largest element in the array.

## Function Signature

\`\`\`typescript
function findMax(nums: number[]): number;
\`\`\`

## Examples

**Example 1:**

Input: nums = [1, 5, 3]  
Output: 5  

**Example 2:**

Input: nums = [-1, -5, -3]  
Output: -1  

## Constraints

- 1 <= nums.length <= 10^4  
- -10^9 <= nums[i] <= 10^9

## Additional Test Cases

There are hidden test cases to validate edge cases and larger inputs.`,
            funcName: "findMax",
            points: 20,
            cases: [
                { input: [[1, 5, 3]], expectedOutput: 5 },
                { input: [[-1, -5, -3]], expectedOutput: -1 },
                { input: [[100]], expectedOutput: 100, isHidden: true },
                { input: [[0, 0, 0]], expectedOutput: 0, isHidden: true },
                { input: [[9, 2, 8, 4]], expectedOutput: 9, isHidden: true }
            ]
        },
        {
            text: `# Reverse String

Write a function that reverses a string \`s\` and returns the reversed string.

## Function Signature

\`\`\`typescript
function reverseString(s: string): string;
\`\`\`

## Examples

**Example 1:**

Input: s = "abc"  
Output: "cba"  

**Example 2:**

Input: s = "hello"  
Output: "olleh"  

## Constraints

- 0 <= s.length <= 10^5  
- s consists of printable ASCII characters.

## Additional Test Cases

There are hidden test cases to validate edge cases and larger inputs.`,
            funcName: "reverseString",
            points: 20,
            cases: [
                { input: ["abc"], expectedOutput: "cba" },
                { input: ["hello"], expectedOutput: "olleh" },
                { input: [""], expectedOutput: "", isHidden: true },
                { input: ["a"], expectedOutput: "a", isHidden: true },
                { input: ["racecar"], expectedOutput: "racecar", isHidden: true }
            ]
        },
        {
            text: `# Count Vowels in a String

Given a string \`s\`, count and return the total number of vowels (a, e, i, o, u) in it. Consider both lowercase and uppercase vowels.

## Function Signature

\`\`\`typescript
function countVowels(s: string): number;
\`\`\`

## Examples

**Example 1:**

Input: s = "hello"  
Output: 2  
Explanation: The vowels are 'e' and 'o'.

**Example 2:**

Input: s = "aeiou"  
Output: 5  
Explanation: All characters are vowels.

## Constraints

- 0 <= s.length <= 10^5  
- s consists of printable ASCII characters.

## Additional Test Cases

There are hidden test cases to validate edge cases and larger inputs.`,
            funcName: "countVowels",
            points: 20,
            cases: [
                { input: ["hello"], expectedOutput: 2 },
                { input: ["aeiou"], expectedOutput: 5 },
                { input: ["xyz"], expectedOutput: 0, isHidden: true },
                { input: ["Programming"], expectedOutput: 3, isHidden: true },
                { input: [""], expectedOutput: 0, isHidden: true }
            ]
        },
        {
            text: `# Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

## Function Signature

\`\`\`typescript
function twoSum(nums: number[], target: number): number[];
\`\`\`

## Examples

**Example 1:**

Input: nums = [2,7,11,15], target = 9  
Output: [0,1]  
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

**Example 2:**

Input: nums = [3,2,4], target = 6  
Output: [1,2]  

## Constraints

- 2 <= nums.length <= 10^4  
- -10^9 <= nums[i] <= 10^9  
- -10^9 <= target <= 10^9  
- Only one valid answer exists.

## Additional Test Cases

There are hidden test cases to validate edge cases and larger inputs.`,
            funcName: "twoSum",
            points: 40,
            cases: [
                { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
                { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
                { input: [[3, 3], 6], expectedOutput: [0, 1], isHidden: true },
                { input: [[1, 5, 7, 9], 14], expectedOutput: [2, 3], isHidden: true },
                { input: [[0, 4, 3, 0], 0], expectedOutput: [0, 3], isHidden: true }
            ]
        },
        {
            text: `# Merge Two Sorted Arrays

Given two sorted integer arrays \`nums1\` and \`nums2\`, merge them into a single array sorted in non-decreasing order and return the merged array.

## Function Signature

\`\`\`typescript
function mergeSorted(nums1: number[], nums2: number[]): number[];
\`\`\`

## Examples

**Example 1:**

Input: nums1 = [1,3,5], nums2 = [2,4,6]  
Output: [1,2,3,4,5,6]  

**Example 2:**

Input: nums1 = [1], nums2 = [2]  
Output: [1,2]  

## Constraints

- 0 <= nums1.length, nums2.length <= 10^4  
- -10^9 <= nums1[i], nums2[j] <= 10^9  
- nums1 and nums2 are sorted in non-decreasing order.

## Additional Test Cases

There are hidden test cases to validate edge cases and larger inputs.`,
            funcName: "mergeSorted",
            points: 40,
            cases: [
                { input: [[1, 3, 5], [2, 4, 6]], expectedOutput: [1, 2, 3, 4, 5, 6] },
                { input: [[1], [2]], expectedOutput: [1, 2] },
                { input: [[], [1]], expectedOutput: [1], isHidden: true },
                { input: [[5, 10], [1, 2]], expectedOutput: [1, 2, 5, 10], isHidden: true },
                { input: [[-1, 0], [3, 4]], expectedOutput: [-1, 0, 3, 4], isHidden: true }
            ]
        }
    ];

    const dsaQuestions = [];
    for (const data of dsaData) {
        const q = await prismaClient.question.create({
            data: {
                text: data.text,
                type: "DSA",
                points: data.points,
                userId: adminUser.id,
                funcName: data.funcName,
                testCases: {
                    create: data.cases.map(tc => ({
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        isHidden: tc.isHidden ?? false
                    }))
                }
            }
        });
        dsaQuestions.push(q);
    }
    console.log(`✅ ${dsaQuestions.length} DSA questions ready`);

    // ---------------- CONTESTS ----------------
    const start = new Date();
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    await prismaClient.contest.upsert({
        where: { id: "contest-dsa-master" },
        create: {
            id: "contest-dsa-master",
            title: "DSA Master Contest",
            description: "6 DSA problems with hidden testcases.",
            startDate: start,
            startTime: start.toTimeString().slice(0, 5),
            endTime: end.toTimeString().slice(0, 5),
            userId: adminUser.id,
            questions: {
                create: dsaQuestions.map(q => ({
                    questionId: q.id
                }))
            }
        },
        update: {
            title: "DSA Master Contest",
            description: "6 DSA problems with hidden testcases.",
            startDate: start,
            startTime: start.toTimeString().slice(0, 5),
            endTime: end.toTimeString().slice(0, 5),
            userId: adminUser.id,
            questions: {
                deleteMany: {},
                create: dsaQuestions.map(q => ({
                    questionId: q.id
                }))
            }
        }
    });

    await prismaClient.contest.upsert({
        where: { id: "contest-mcq-basic" },
        create: {
            id: "contest-mcq-basic",
            title: "MCQ Basic Contest",
            description: "5 MCQ questions on programming basics.",
            startDate: start,
            startTime: start.toTimeString().slice(0, 5),
            endTime: end.toTimeString().slice(0, 5),
            userId: adminUser.id,
            questions: {
                create: mcqQuestions.map(q => ({
                    questionId: q.id
                }))
            }
        },
        update: {
            title: "MCQ Basic Contest",
            description: "5 MCQ questions on programming basics.",
            startDate: start,
            startTime: start.toTimeString().slice(0, 5),
            endTime: end.toTimeString().slice(0, 5),
            userId: adminUser.id,
            questions: {
                deleteMany: {},
                create: mcqQuestions.map(q => ({
                    questionId: q.id
                }))
            }
        }
    });

    const hybridQuestions = [...mcqQuestions.slice(0, 3), ...dsaQuestions.slice(0, 3)];
    await prismaClient.contest.upsert({
        where: { id: "contest-hybrid-challenge" },
        create: {
            id: "contest-hybrid-challenge",
            title: "Hybrid Challenge Contest",
            description: "3 MCQ and 3 DSA questions.",
            startDate: start,
            startTime: start.toTimeString().slice(0, 5),
            endTime: end.toTimeString().slice(0, 5),
            userId: adminUser.id,
            questions: {
                create: hybridQuestions.map(q => ({
                    questionId: q.id
                }))
            }
        },
        update: {
            title: "Hybrid Challenge Contest",
            description: "3 MCQ and 3 DSA questions.",
            startDate: start,
            startTime: start.toTimeString().slice(0, 5),
            endTime: end.toTimeString().slice(0, 5),
            userId: adminUser.id,
            questions: {
                deleteMany: {},
                create: hybridQuestions.map(q => ({
                    questionId: q.id
                }))
            }
        }
    });

    console.log("✅ 3 contests ready");
    console.log("✅ Seed Completed Successfully");
}

main()
    .catch(console.error)
    .finally(() => prismaClient.$disconnect());