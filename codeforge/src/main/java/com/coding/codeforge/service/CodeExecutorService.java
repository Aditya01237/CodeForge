package com.coding.codeforge.service;

import java.io.*;
        import java.nio.file.*;
        import java.util.UUID;

public class CodeExecutorService {

    public static String runCppCode(String code, String input) throws Exception {

        String folder = "/tmp/" + UUID.randomUUID();
        Files.createDirectories(Paths.get(folder));

        Path codeFile = Paths.get(folder, "code.cpp");
        Path inputFile = Paths.get(folder, "input.txt");

        Files.writeString(codeFile, code);
        Files.writeString(inputFile, input);

        String command = String.format(
                "docker run --rm " +
                        "--memory=100m --cpus=0.5 --network=none " +
                        "-v %s:/app cpp-runner " +
                        "bash -c \"g++ /app/code.cpp -o /app/code && timeout 2s /app/code < /app/input.txt\"",
                folder
        );

        ProcessBuilder pb = new ProcessBuilder(
                "docker", "run", "--rm",
                "--memory=200m",
                "--cpus=0.5",
                "--network=none",
                "-v", folder + ":/app",
                "cpp-runner",
                "bash", "-c",
                "g++ /app/code.cpp -o /app/code && timeout 2s /app/code < /app/input.txt"
        );

        Process process = pb.start();

        BufferedReader output = new BufferedReader(
                new InputStreamReader(process.getInputStream())
        );

        BufferedReader error = new BufferedReader(
                new InputStreamReader(process.getErrorStream())
        );

        StringBuilder result = new StringBuilder();
        String line;

        while ((line = output.readLine()) != null) {
            result.append(line).append("\n");
        }

        StringBuilder err = new StringBuilder();
        while ((line = error.readLine()) != null) {
            err.append(line).append("\n");
        }

        process.waitFor();

        if (err.length() > 0) return err.toString();
        return result.toString();
    }
}