package runner

import (
	"os"
	"os/exec"
	"testing"

	"codeforge-judge/models"
)

func TestRunBatchInOneContainer(t *testing.T) {
	if os.Getenv("CODEFORGE_DOCKER_INTEGRATION") != "1" {
		t.Skip("set CODEFORGE_DOCKER_INTEGRATION=1 to run Docker judge integration tests")
	}
	if _, err := exec.LookPath("docker"); err != nil {
		t.Skip("docker is not installed")
	}

	tests := []struct {
		name      string
		imageName string
		language  string
		code      string
	}{
		{
			name:      "cpp",
			imageName: "cpp-runner",
			language:  "cpp",
			code: `#include <iostream>
int main() {
    long long value;
    std::cin >> value;
    std::cout << value * 2 << '\n';
    return 0;
}`,
		},
		{
			name:      "python",
			imageName: "python-runner",
			language:  "python",
			code: `value = int(input())
print(value * 2)
`,
		},
		{
			name:      "java",
			imageName: "java-runner",
			language:  "java",
			code: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println(scanner.nextLong() * 2);
    }
}`,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if err := exec.Command("docker", "image", "inspect", test.imageName).Run(); err != nil {
				t.Skip(test.imageName + " image is not available")
			}

			response := RunBatch(models.BatchRunRequest{
				Language: test.language,
				Code:     test.code,
				TestCases: []models.TestCase{
					{TestCaseID: 1, Input: "2\n"},
					{TestCaseID: 2, Input: "7\n"},
					{TestCaseID: 3, Input: "-4\n"},
				},
			})

			if response.Status != "OK" {
				t.Fatalf("batch failed: status=%s error=%s", response.Status, response.Error)
			}
			if len(response.Results) != 3 {
				t.Fatalf("expected 3 results, got %d", len(response.Results))
			}

			expected := []string{"4\n", "14\n", "-8\n"}
			for index, result := range response.Results {
				if result.Status != "OK" {
					t.Fatalf(
						"test case %d failed: status=%s error=%s",
						index+1,
						result.Status,
						result.Error,
					)
				}
				if result.Output != expected[index] {
					t.Fatalf(
						"test case %d output=%q expected=%q",
						index+1,
						result.Output,
						expected[index],
					)
				}
			}
		})
	}
}
