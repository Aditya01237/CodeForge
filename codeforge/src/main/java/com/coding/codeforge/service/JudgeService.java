package com.coding.codeforge.service;

import com.coding.codeforge.data.TestCase;

import java.util.*;

public class JudgeService {

    public static List<Map<String, Object>> runTestCases(String code, List<TestCase> testCases) {

        List<Map<String, Object>> results = new ArrayList<>();
        int index = 1;

        for (TestCase tc : testCases) {

            ExecutionResultService res = CodeExecutorService.runCppCode(code, tc.getInput());

            String verdict = getVerdict(res, tc.getOutput());

            results.add(Map.of(
                    "testCase", "Test Case " + index,
                    "status", verdict,
                    "output", res.getOutput(),
                    "error", res.getError(),
                    "expected", tc.getOutput()
            ));

            index++;
        }

        return results;
    }

    public static Map<String, Object> submitTestCases(String code, List<TestCase> testCases) {

        int index = 1;

        for (TestCase tc : testCases) {

            ExecutionResultService res = CodeExecutorService.runCppCode(code, tc.getInput());

            String verdict = getVerdict(res, tc.getOutput());

            if (!verdict.equals("OK")) {

                return switch (verdict) {
                    case "CE" -> Map.of("status", "Compilation Error", "error", res.getError());
                    case "TLE" -> Map.of("status", "Time Limit Exceeded", "failedTestCase", index);
                    case "RE" -> Map.of("status", "Runtime Error", "failedTestCase", index);
                    case "NO_OUTPUT" -> Map.of("status", "No Output", "failedTestCase", index);
                    default -> Map.of(
                            "status", "Wrong Answer",
                            "failedTestCase", index,
                            "output", res.getOutput(),
                            "expected", tc.getOutput()
                    );
                };
            }

            index++;
        }

        return Map.of("status", "Accepted");
    }

    // 🔥 CENTRALIZED VERDICT LOGIC
    private static String getVerdict(ExecutionResultService res, String expectedOutput) {

        if (res.getStatus().equals("CE")) return "CE";
        if (res.getStatus().equals("TLE")) return "TLE";
        if (res.getStatus().equals("RE")) return "RE";

        String actual = normalize(res.getOutput());
        String expected = normalize(expectedOutput);

        if (actual.isEmpty() && !expected.isEmpty()) return "NO_OUTPUT";
        if (actual.equals(expected)) return "OK";

        return "WA";
    }

    private static String normalize(String s) {
        if (s == null) return "";
        return s.trim().replaceAll("\\r", "");
    }
}