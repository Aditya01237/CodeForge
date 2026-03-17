export const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",

    description: [
      "Given an array nums and a target, find indices such that they add up to target.",
    ],

    inputFormat: [
      "First line contains integer t (number of test cases)",
      "For each test case:",
      "First line contains n",
      "Second line contains n integers",
      "Third line contains target",
    ],

    outputFormat: ["For each test case, print indices of two numbers"],

    sampleInput: `2
4
2 7 11 15
9
3
3 2 4
6`,

    sampleOutput: `0 1
1 2`,

    // 🔥 NEW
    exampleExplanation: [
      "In first test case, nums = [2,7,11,15] and target = 9. Indices 0 and 1 satisfy condition.",
      "In second test case, nums = [3,2,4] and target = 6. Indices 1 and 2 satisfy condition.",
    ],

    constraints: ["1 <= t <= 10", "2 <= n <= 10^4"],
  },
];
