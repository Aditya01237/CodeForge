import test from "node:test";
import assert from "node:assert/strict";

import { getCodeStorageKey } from "../src/utils/editorStorage.js";

test("isolates persisted code by problem and language", () => {
  assert.equal(
    getCodeStorageKey({ problemId: 7, language: "C++" }),
    "cf_code_practice_problem-7_C%2B%2B",
  );
  assert.equal(
    getCodeStorageKey({ problemId: 7, language: "Python" }),
    "cf_code_practice_problem-7_Python",
  );
});

test("isolates contest code from practice code", () => {
  assert.equal(
    getCodeStorageKey({
      problemId: 7,
      language: "Java",
      mode: "test",
      testId: 42,
    }),
    "cf_code_test-42_problem-7_Java",
  );
});
