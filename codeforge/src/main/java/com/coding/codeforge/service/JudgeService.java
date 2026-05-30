package com.coding.codeforge.service;

import com.coding.codeforge.entity.TestCaseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JudgeService {

    private final RedisJudgeClientService redisJudgeClientService;

    public JudgeService(RedisJudgeClientService redisJudgeClientService) {
        this.redisJudgeClientService = redisJudgeClientService;
    }

    public List<Map<String, Object>> runTestCases(String language, String code, List<TestCaseEntity> testCases) {

        List<Map<String, Object>> results = new ArrayList<>();
        int index = 1;

        for (TestCaseEntity tc : testCases) {

            ExecutionResultService res = redisJudgeClientService.runCode(
                    language,
                    code,
                    tc.getInputData()
            );

            String verdict = getVerdict(res, tc.getExpectedOutput());

            results.add(Map.of(
                    "testCase", "Test Case " + index,
                    "status", verdict,
                    "output", res.getOutput(),
                    "error", res.getError(),
                    "expected", tc.getExpectedOutput()
            ));

            index++;
        }

        return results;
    }

    public Map<String, Object> submitTestCases(String language, String code, List<TestCaseEntity> testCases) {

        int index = 1;

        for (TestCaseEntity tc : testCases) {

            ExecutionResultService res = redisJudgeClientService.runCode(
                    language,
                    code,
                    tc.getInputData()
            );

            String verdict = getVerdict(res, tc.getExpectedOutput());

            if (!verdict.equals("OK")) {

                return switch (verdict) {
                    case "CE" -> Map.of("status", "Compilation Error", "error", res.getError());
                    case "TLE" -> Map.of("status", "Time Limit Exceeded", "failedTestCase", index);
                    case "RE" -> Map.of("status", "Runtime Error", "failedTestCase", index, "error", res.getError());
                    case "NO_OUTPUT" -> Map.of("status", "No Output", "failedTestCase", index);
                    case "UNSUPPORTED_LANGUAGE" -> Map.of("status", "Unsupported Language", "error", res.getError());
                    default -> Map.of(
                            "status", "Wrong Answer",
                            "failedTestCase", index,
                            "output", res.getOutput(),
                            "expected", tc.getExpectedOutput()
                    );
                };
            }

            index++;
        }

        return Map.of("status", "Accepted");
    }

    private String getVerdict(ExecutionResultService res, String expectedOutput) {

        if (res.getStatus().equals("CE")) return "CE";
        if (res.getStatus().equals("TLE")) return "TLE";
        if (res.getStatus().equals("RE")) return "RE";
        if (res.getStatus().equals("UNSUPPORTED_LANGUAGE")) return "UNSUPPORTED_LANGUAGE";

        String actual = normalize(res.getOutput());
        String expected = normalize(expectedOutput);

        if (actual.isEmpty() && !expected.isEmpty()) return "NO_OUTPUT";
        if (actual.equals(expected)) return "OK";

        return "WA";
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.trim().replaceAll("\\r", "");
    }
}