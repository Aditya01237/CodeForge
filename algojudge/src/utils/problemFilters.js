export const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

export function getProblemCategories(problems) {
  return [
    "All",
    ...new Set(problems.map((problem) => problem.category).filter(Boolean)),
  ];
}

export function filterProblems(
  problems,
  { query = "", difficulty = "All", category = "All" } = {},
) {
  const normalizedQuery = query.trim().toLowerCase();

  return problems.filter((problem) => {
    const title = String(problem.title || "").toLowerCase();
    const problemCategory = String(problem.category || "");

    const matchesQuery =
      !normalizedQuery ||
      title.includes(normalizedQuery) ||
      problemCategory.toLowerCase().includes(normalizedQuery);
    const matchesDifficulty =
      difficulty === "All" || problem.difficulty === difficulty;
    const matchesCategory =
      category === "All" || problemCategory === category;

    return matchesQuery && matchesDifficulty && matchesCategory;
  });
}
