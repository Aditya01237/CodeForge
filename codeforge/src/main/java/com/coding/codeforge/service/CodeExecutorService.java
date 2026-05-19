package com.coding.codeforge.service;

import java.io.*;
import java.nio.file.*;
import java.util.Comparator;
import java.util.UUID;

public class CodeExecutorService {

    public static ExecutionResultService runCppCode(String code, String input) {

        String folder = "/tmp/" + UUID.randomUUID();

        try {
            Files.createDirectories(Paths.get(folder));

            Path codeFile = Paths.get(folder, "code.cpp");
            Path inputFile = Paths.get(folder, "input.txt");

            Files.writeString(codeFile, code);
            Files.writeString(inputFile, input);

            ProcessBuilder pb = new ProcessBuilder(
                    "docker", "run", "--rm",
                    "--memory=200m",
                    "--cpus=0.5",
                    "--network=none",
                    "-v", folder + ":/app",
                    "cpp-runner",
                    "bash", "-c",
                    "g++ /app/code.cpp -o /app/code 2> /app/compile_error.txt && timeout 2s /app/code < /app/input.txt"
            );

            Process process = pb.start();

            // ✅ CAPTURE STDOUT
            BufferedReader output = new BufferedReader(
                    new InputStreamReader(process.getInputStream())
            );

            // ✅ CAPTURE STDERR (IMPORTANT)
            BufferedReader error = new BufferedReader(
                    new InputStreamReader(process.getErrorStream())
            );

            StringBuilder out = new StringBuilder();
            StringBuilder err = new StringBuilder();

            String line;

            // stdout
            while ((line = output.readLine()) != null) {
                out.append(line).append("\n");
            }

            // stderr
            while ((line = error.readLine()) != null) {
                err.append(line).append("\n");
            }

            int exitCode = process.waitFor();

            // 🔥 DEBUG (remove later if needed)
            System.out.println("EXIT CODE: " + exitCode);
            System.out.println("STDOUT: " + out);
            System.out.println("STDERR: " + err);

            // 🔥 READ COMPILE ERRORS
            Path compileErrorPath = Paths.get(folder, "compile_error.txt");
            if (Files.exists(compileErrorPath)) {
                String compileError = Files.readString(compileErrorPath);
                if (!compileError.isEmpty()) {
                    cleanup(folder);
                    return new ExecutionResultService("CE", "", compileError);
                }
            }

            // 🔥 TLE
            if (exitCode == 124) {
                cleanup(folder);
                return new ExecutionResultService("TLE", "", "Time Limit Exceeded");
            }

            // 🔥 RUNTIME ERROR (NOW SHOW REAL ERROR)
            if (exitCode != 0) {
                cleanup(folder);
                return new ExecutionResultService("RE", out.toString(), err.toString());
            }

            cleanup(folder);
            return new ExecutionResultService("OK", out.toString(), "");

        } catch (Exception e) {
            return new ExecutionResultService("RE", "", e.getMessage());
        }
    }

    private static void cleanup(String folder) {
        try {
            Files.walk(Paths.get(folder))
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (Exception ignored) {}
    }
}