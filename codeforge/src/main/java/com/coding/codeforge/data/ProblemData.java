package com.coding.codeforge.data;

import com.coding.codeforge.data.TestCase;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProblemData {

    public static Map<Integer, List<TestCase>> sampleTestCases = new HashMap<>();
    public static Map<Integer, List<TestCase>> hiddenTestCases = new HashMap<>();

    static {

        // 🔥 SAMPLE (for RUN)
        sampleTestCases.put(1, List.of(
                new TestCase(
                        "2\n4\n2 7 11 15\n9\n3\n3 2 4\n6",
                        "0 1\n1 2"
                )
        ));

        // 🔥 HIDDEN (for SUBMIT)
        hiddenTestCases.put(1, List.of(
                new TestCase(
                        "1\n5\n1 2 3 4 5\n9",
                        "3 4"
                ),
                new TestCase(
                        "1\n3\n1 2 3\n5",
                        "1 2"
                )
        ));
    }

    public static List<TestCase> getSample(int problemId) {
        return sampleTestCases.getOrDefault(problemId, new ArrayList<>());
    }

    public static List<TestCase> getHidden(int problemId) {
        return hiddenTestCases.getOrDefault(problemId, new ArrayList<>());
    }
}