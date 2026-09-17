package com.coding.codeforge.config;

import com.coding.codeforge.entity.Problem;
import com.coding.codeforge.entity.TestCaseEntity;
import com.coding.codeforge.repository.ProblemRepository;
import com.coding.codeforge.repository.TestCaseRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@ConditionalOnProperty(
        name = "codeforge.seed-problem-library",
        havingValue = "true",
        matchIfMissing = true
)
public class ProblemLibrarySeeder implements ApplicationRunner {

    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;

    public ProblemLibrarySeeder(
            ProblemRepository problemRepository,
            TestCaseRepository testCaseRepository
    ) {
        this.problemRepository = problemRepository;
        this.testCaseRepository = testCaseRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        library().forEach(this::upsertProblem);
    }

    private void upsertProblem(ProblemSeed seed) {
        Problem problem = problemRepository.findByTitleIgnoreCase(seed.title())
                .orElseGet(Problem::new);

        problem.setTitle(seed.title());
        problem.setDifficulty(seed.difficulty());
        problem.setCategory(seed.category());
        problem.setDescription(seed.description());
        problem.setInputFormat(seed.inputFormat());
        problem.setOutputFormat(seed.outputFormat());
        problem.setConstraintsText(seed.constraints());
        problem.setReusable(true);
        problem = problemRepository.save(problem);

        List<TestCaseEntity> existingTestCases =
                testCaseRepository.findByProblemId(problem.getId());

        for (CaseSeed testCase : seed.testCases()) {
            TestCaseEntity entity = existingTestCases.stream()
                    .filter(existing -> existing.isHidden() == testCase.hidden())
                    .filter(existing -> sameText(existing.getInputData(), testCase.input()))
                    .findFirst()
                    .orElseGet(TestCaseEntity::new);

            entity.setProblem(problem);
            entity.setInputData(testCase.input());
            entity.setExpectedOutput(testCase.output());
            entity.setExplanation(testCase.explanation());
            entity.setHidden(testCase.hidden());
            testCaseRepository.save(entity);
        }
    }

    private boolean sameText(String left, String right) {
        if (left == null || right == null) {
            return left == right;
        }
        return left.replace("\r\n", "\n").trim()
                .equals(right.replace("\r\n", "\n").trim());
    }

    private List<ProblemSeed> library() {
        return List.of(
                problem(
                        "Sum of Two Numbers",
                        "Easy",
                        "Basic Programming",
                        "Read two integers and print their sum.",
                        "Two space-separated integers a and b.",
                        "Print a + b.",
                        "-10^9 <= a, b <= 10^9",
                        sample("2 3\n", "5\n", "Adding 2 and 3 gives 5."),
                        hidden("-10 25\n", "15\n"),
                        hidden("1000000000 1000000000\n", "2000000000\n")
                ),
                problem(
                        "Find Maximum in Array",
                        "Easy",
                        "Arrays",
                        "Given an array of integers, print its maximum element.",
                        "The first line contains n. The second line contains n space-separated integers.",
                        "Print the maximum array element.",
                        "1 <= n <= 10^5; -10^9 <= a[i] <= 10^9",
                        sample("5\n3 8 2 10 4\n", "10\n", "Among 3, 8, 2, 10 and 4, the largest value is 10."),
                        hidden("4\n-9 -2 -14 -3\n", "-2\n"),
                        hidden("1\n42\n", "42\n")
                ),
                problem(
                        "Reverse an Array",
                        "Easy",
                        "Arrays",
                        "Print the elements of the given array in reverse order.",
                        "The first line contains n. The second line contains n space-separated integers.",
                        "Print the reversed array as space-separated integers.",
                        "1 <= n <= 10^5; -10^9 <= a[i] <= 10^9",
                        sample("5\n1 2 3 4 5\n", "5 4 3 2 1\n", "Reading the array from the last element to the first gives 5 4 3 2 1."),
                        hidden("4\n8 -1 0 7\n", "7 0 -1 8\n"),
                        hidden("1\n99\n", "99\n")
                ),
                problem(
                        "Valid Palindrome",
                        "Easy",
                        "Strings",
                        "Determine whether a lowercase string reads the same forwards and backwards.",
                        "A single lowercase string s.",
                        "Print YES if s is a palindrome; otherwise print NO.",
                        "1 <= |s| <= 10^5",
                        sample("racecar\n", "YES\n", "\"racecar\" is identical when read from left to right and right to left."),
                        hidden("codeforge\n", "NO\n"),
                        hidden("a\n", "YES\n")
                ),
                problem(
                        "Balanced Parentheses",
                        "Easy",
                        "Stack",
                        "Check whether every bracket in the expression is closed in the correct order. The expression contains only (), [] and {}.",
                        "A single bracket string s.",
                        "Print YES if the expression is balanced; otherwise print NO.",
                        "1 <= |s| <= 10^5",
                        sample("{[()]}\n", "YES\n", "Each opening bracket is closed by the matching bracket in the correct nested order."),
                        hidden("([)]\n", "NO\n"),
                        hidden("()[]{}\n", "YES\n")
                ),
                problem(
                        "Binary Search",
                        "Easy",
                        "Binary Search",
                        "Find the zero-based index of a target in a sorted array.",
                        "The first line contains n and target. The second line contains n sorted integers.",
                        "Print the target index, or -1 when the target is absent.",
                        "1 <= n <= 10^5; array values are distinct and sorted",
                        sample("5 7\n1 3 5 7 9\n", "3\n", "The target 7 occurs at zero-based index 3 in the sorted array."),
                        hidden("6 4\n-2 0 3 8 11 19\n", "-1\n"),
                        hidden("1 10\n10\n", "0\n")
                ),
                problem(
                        "Second Largest Distinct Element",
                        "Medium",
                        "Arrays",
                        "Print the second largest distinct value in an array. Print -1 if it does not exist.",
                        "The first line contains n. The second line contains n space-separated integers.",
                        "Print the second largest distinct value, or -1.",
                        "1 <= n <= 10^5; -10^9 <= a[i] <= 10^9",
                        sample("6\n4 9 2 9 7 4\n", "7\n", "The distinct values are 9, 7, 4 and 2, so the second largest is 7."),
                        hidden("4\n5 5 5 5\n", "-1\n"),
                        hidden("5\n-2 -8 -3 -2 -9\n", "-3\n")
                ),
                problem(
                        "Maximum Subarray Sum",
                        "Medium",
                        "Dynamic Programming",
                        "Find the maximum possible sum of a non-empty contiguous subarray.",
                        "The first line contains n. The second line contains n space-separated integers.",
                        "Print the maximum contiguous subarray sum.",
                        "1 <= n <= 2 * 10^5; -10^9 <= a[i] <= 10^9",
                        sample("8\n-2 -3 4 -1 -2 1 5 -3\n", "7\n", "The subarray [4, -1, -2, 1, 5] has the maximum sum, 7."),
                        hidden("4\n-8 -3 -6 -2\n", "-2\n"),
                        hidden("5\n1 2 3 4 5\n", "15\n")
                ),
                problem(
                        "Longest Common Prefix",
                        "Medium",
                        "Strings",
                        "Find the longest prefix shared by every string. Print -1 when no common prefix exists.",
                        "The first line contains n, followed by n lowercase strings on separate lines.",
                        "Print the longest common prefix, or -1.",
                        "1 <= n <= 10^4; total input length <= 2 * 10^5",
                        sample("3\nflower\nflow\nflight\n", "fl\n", "All three strings begin with \"fl\"; the next characters differ."),
                        hidden("3\ndog\nracecar\ncar\n", "-1\n"),
                        hidden("2\ncodeforge\ncodeforces\n", "codefor\n")
                ),
                problem(
                        "Climbing Stairs",
                        "Medium",
                        "Dynamic Programming",
                        "You can climb either one or two steps at a time. Count the distinct ways to reach step n.",
                        "A single integer n.",
                        "Print the number of distinct ways to reach step n.",
                        "1 <= n <= 45",
                        sample("5\n", "8\n", "There are 8 different sequences of one-step and two-step moves that reach step 5."),
                        hidden("1\n", "1\n"),
                        hidden("10\n", "89\n")
                ),
                problem(
                        "Count Connected Components",
                        "Medium",
                        "Graphs",
                        "Count the connected components in an undirected graph with vertices numbered from 0 to n - 1.",
                        "The first line contains n and m. Each of the next m lines contains an undirected edge u v.",
                        "Print the number of connected components.",
                        "1 <= n <= 10^5; 0 <= m <= 2 * 10^5",
                        sample("5 3\n0 1\n1 2\n3 4\n", "2\n", "Vertices {0, 1, 2} form one component and {3, 4} form the second, so the answer is 2."),
                        hidden("4 0\n", "4\n"),
                        hidden("6 5\n0 1\n1 2\n2 3\n3 4\n4 5\n", "1\n")
                ),
                problem(
                        "Merge Two Sorted Arrays",
                        "Medium",
                        "Two Pointers",
                        "Merge two sorted integer arrays into one sorted sequence.",
                        "The first line contains n and m. The second line contains n sorted integers and the third contains m sorted integers.",
                        "Print the merged sorted sequence as space-separated integers.",
                        "0 <= n, m <= 10^5; n + m >= 1",
                        sample("3 4\n1 4 7\n2 3 8 10\n", "1 2 3 4 7 8 10\n", "Taking the smaller front element at each step produces the merged sorted order."),
                        hidden("1 3\n5\n-1 5 9\n", "-1 5 5 9\n"),
                        hidden("3 2\n1 2 3\n4 5\n", "1 2 3 4 5\n")
                ),
                problem(
                        "Longest Increasing Subsequence",
                        "Hard",
                        "Dynamic Programming",
                        "Find the length of the longest strictly increasing subsequence.",
                        "The first line contains n. The second line contains n space-separated integers.",
                        "Print the length of the longest strictly increasing subsequence.",
                        "1 <= n <= 2 * 10^5; -10^9 <= a[i] <= 10^9",
                        sample("8\n10 9 2 5 3 7 101 18\n", "4\n", "One longest increasing subsequence is [2, 3, 7, 101], which has length 4."),
                        hidden("5\n5 4 3 2 1\n", "1\n"),
                        hidden("8\n0 1 0 3 2 3 4 4\n", "5\n")
                ),
                problem(
                        "Dijkstra Shortest Paths",
                        "Hard",
                        "Graphs",
                        "Find the shortest distance from a source to every vertex in an undirected graph with non-negative edge weights.",
                        "The first line contains n, m and source. Each of the next m lines contains u, v and weight.",
                        "Print n distances in vertex order. Print -1 for an unreachable vertex.",
                        "1 <= n <= 10^5; 0 <= m <= 2 * 10^5; 0 <= weight <= 10^9",
                        sample("5 6 0\n0 1 4\n0 2 1\n2 1 2\n1 3 1\n2 3 5\n3 4 3\n", "0 3 1 4 7\n", "From vertex 0, the shortest distances to vertices 0 through 4 are 0, 3, 1, 4 and 7."),
                        hidden("4 1 2\n0 1 7\n", "-1 -1 0 -1\n"),
                        hidden("3 3 0\n0 1 10\n0 2 2\n2 1 3\n", "0 5 2\n")
                ),
                problem(
                        "Zero One Knapsack",
                        "Hard",
                        "Dynamic Programming",
                        "Choose items with maximum total value without exceeding the capacity. Each item may be used at most once.",
                        "The first line contains n and capacity. The second line contains n weights. The third line contains n values.",
                        "Print the maximum achievable value.",
                        "1 <= n <= 200; 0 <= capacity <= 10^5",
                        sample("4 7\n1 3 4 5\n1 4 5 7\n", "9\n", "Choosing items with weights 3 and 4 uses capacity 7 and gives the maximum value 9."),
                        hidden("3 0\n1 2 3\n10 20 30\n", "0\n"),
                        hidden("3 5\n2 3 4\n4 5 7\n", "9\n")
                )
        );
    }

    private ProblemSeed problem(
            String title,
            String difficulty,
            String category,
            String description,
            String inputFormat,
            String outputFormat,
            String constraints,
            CaseSeed... testCases
    ) {
        return new ProblemSeed(
                title,
                difficulty,
                category,
                description,
                inputFormat,
                outputFormat,
                constraints,
                List.of(testCases)
        );
    }

    private CaseSeed sample(String input, String output, String explanation) {
        return new CaseSeed(input, output, explanation, false);
    }

    private CaseSeed hidden(String input, String output) {
        return new CaseSeed(input, output, null, true);
    }

    private record ProblemSeed(
            String title,
            String difficulty,
            String category,
            String description,
            String inputFormat,
            String outputFormat,
            String constraints,
            List<CaseSeed> testCases
    ) {}

    private record CaseSeed(
            String input,
            String output,
            String explanation,
            boolean hidden
    ) {}
}
