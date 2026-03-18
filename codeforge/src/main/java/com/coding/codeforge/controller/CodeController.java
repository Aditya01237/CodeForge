package com.coding.codeforge.controller;
import com.coding.codeforge.DTO.CodeRequest;
import com.coding.codeforge.service.CodeExecutorService;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.coding.codeforge.data.*;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class CodeController {

    @PostMapping("/run")
    public Map<String, Object> runCode(@RequestBody CodeRequest request) {
        try {

            List<TestCase> testCases = ProblemData.getSample(request.getProblemId());
            List<Map<String, String>> results = new ArrayList<>();

            int index = 1;

            for (TestCase tc : testCases) {

                String output = CodeExecutorService.runCppCode(
                        request.getCode(),
                        tc.getInput()
                );

                results.add(Map.of(
                        "testCase", "Test Case " + index,
                        "output", output,
                        "expected", tc.getOutput()
                ));

                index++;
            }

            return Map.of(
                    "status", "Run Success",
                    "results", results
            );

        } catch (Exception e) {
            return Map.of(
                    "status", "Error",
                    "message", e.getMessage()
            );
        }
    }

    @PostMapping("/submit")
    public Map<String, Serializable> submitCode(@RequestBody CodeRequest request) {
        try {

            List<TestCase> testCases = ProblemData.getHidden(request.getProblemId());

            int index = 1;

            for (TestCase tc : testCases) {

                String output = CodeExecutorService.runCppCode(
                        request.getCode(),
                        tc.getInput()
                );

                if (!normalize(output).equals(normalize(tc.getOutput()))) {
                    return Map.of(
                            "status", "Wrong Answer",
                            "failedTestCase", index   // 🔥 ADD THIS
                    );
                }

                index++;
            }

            return Map.of(
                    "status", "Accepted"
            );

        } catch (Exception e) {
            return Map.of(
                    "status", "Error"
            );
        }
    }

    private String normalize(String s) {
        return s.trim().replaceAll("\\s+", " ");
    }

}
