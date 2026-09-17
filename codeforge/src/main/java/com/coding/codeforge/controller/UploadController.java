package com.coding.codeforge.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final long MAX_UPLOAD_DIRECTORY_BYTES = 100L * 1024 * 1024;
    private static final long MAX_UPLOAD_FILE_COUNT = 200;

    @Value("${codeforge.upload.dir:uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif"
    );

    @PostMapping("/problem-images")
    public synchronized Map<String, Object> uploadProblemImage(
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Image file is required");
        }

        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new RuntimeException("Image cannot exceed 5 MB");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("Only PNG, JPG, JPEG, WEBP, and GIF images are allowed");
        }

        byte[] imageBytes = file.getBytes();
        DetectedImage detectedImage = detectImage(imageBytes);
        if (detectedImage == null) {
            throw new RuntimeException("The uploaded file is not a valid supported image");
        }

        Path imageDir = Paths.get(uploadDir, "problem-images")
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(imageDir);
        enforceStorageQuota(imageDir, imageBytes.length);

        String fileName = UUID.randomUUID() + detectedImage.extension();
        Path targetPath = imageDir.resolve(fileName).normalize();
        if (!targetPath.startsWith(imageDir)) {
            throw new RuntimeException("Invalid upload path");
        }

        Files.write(targetPath, imageBytes, StandardOpenOption.CREATE_NEW);

        String publicUrl = "/uploads/problem-images/" + fileName;

        return Map.of(
                "success", true,
                "url", publicUrl,
                "fileName", fileName,
                "contentType", detectedImage.contentType(),
                "size", imageBytes.length
        );
    }

    private void enforceStorageQuota(Path imageDir, long incomingBytes) throws IOException {
        long fileCount;
        long storedBytes;

        try (Stream<Path> files = Files.list(imageDir)) {
            Path[] regularFiles = files.filter(Files::isRegularFile).toArray(Path[]::new);
            fileCount = regularFiles.length;
            storedBytes = Arrays.stream(regularFiles)
                    .mapToLong(path -> {
                        try {
                            return Files.size(path);
                        } catch (IOException exception) {
                            return 0;
                        }
                    })
                    .sum();
        }

        if (fileCount >= MAX_UPLOAD_FILE_COUNT
                || storedBytes + incomingBytes > MAX_UPLOAD_DIRECTORY_BYTES) {
            throw new RuntimeException("Upload storage quota reached");
        }
    }

    private DetectedImage detectImage(byte[] bytes) {
        if (startsWith(bytes, new byte[]{
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
        })) {
            return new DetectedImage(".png", "image/png");
        }

        if (startsWith(bytes, new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})) {
            return new DetectedImage(".jpg", "image/jpeg");
        }

        if (startsWith(bytes, "GIF87a".getBytes())
                || startsWith(bytes, "GIF89a".getBytes())) {
            return new DetectedImage(".gif", "image/gif");
        }

        if (bytes.length >= 12
                && startsWith(bytes, "RIFF".getBytes())
                && bytes[8] == 'W'
                && bytes[9] == 'E'
                && bytes[10] == 'B'
                && bytes[11] == 'P') {
            return new DetectedImage(".webp", "image/webp");
        }

        return null;
    }

    private boolean startsWith(byte[] bytes, byte[] signature) {
        if (bytes.length < signature.length) return false;

        for (int index = 0; index < signature.length; index++) {
            if (bytes[index] != signature[index]) return false;
        }

        return true;
    }

    private record DetectedImage(String extension, String contentType) {
    }
}
