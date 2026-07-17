import test from "node:test";
import assert from "node:assert/strict";

import {
  filterProblems,
  getProblemCategories,
} from "../src/utils/problemFilters.js";

const problems = [
  { id: 1, title: "Two Sum", category: "Arrays", difficulty: "Easy" },
  {
    id: 2,
    title: "Longest Substring",
    category: "Sliding Window",
    difficulty: "Medium",
  },
  { id: 3, title: "Merge K Lists", category: "Heap", difficulty: "Hard" },
];

test("filters problems by case-insensitive title or category search", () => {
  assert.deepEqual(
    filterProblems(problems, { query: "sliding" }).map(({ id }) => id),
    [2],
  );
  assert.deepEqual(
    filterProblems(problems, { query: "TWO SUM" }).map(({ id }) => id),
    [1],
  );
});

test("combines category and difficulty filters", () => {
  assert.deepEqual(
    filterProblems(problems, {
      category: "Heap",
      difficulty: "Hard",
    }).map(({ id }) => id),
    [3],
  );
});

test("returns unique problem categories with All first", () => {
  assert.deepEqual(getProblemCategories([...problems, problems[0]]), [
    "All",
    "Arrays",
    "Sliding Window",
    "Heap",
  ]);
});
