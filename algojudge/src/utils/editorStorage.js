export function getCodeStorageKey({
  problemId,
  language,
  mode = "practice",
  testId,
}) {
  const scope = mode === "test" && testId ? `test-${testId}` : "practice";
  return `cf_code_${scope}_problem-${problemId}_${encodeURIComponent(language)}`;
}
