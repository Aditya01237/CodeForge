package com.coding.codeforge.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "http://localhost:5173")
public class UploadController {

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
    public Map<String, Object> uploadProblemImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Image file is required");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("Only PNG, JPG, JPEG, WEBP, and GIF images are allowed");
        }

        String originalName = file.getOriginalFilename();
        String extension = getExtension(originalName, contentType);

        String fileName = UUID.randomUUID() + extension;

        Path imageDir = Paths.get(uploadDir, "problem-images")
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(imageDir);

        Path targetPath = imageDir.resolve(fileName).normalize();

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String publicUrl = "/uploads/problem-images/" + fileName;

        return Map.of(
                "success", true,
                "url", publicUrl,
                "fileName", fileName,
                "contentType", contentType,
                "size", file.getSize()
        );
    }

    private String getExtension(String originalName, String contentType) {
        if (originalName != null && originalName.contains(".")) {
            String ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();

            if (ext.equals(".png") || ext.equals(".jpg") || ext.equals(".jpeg") ||
                    ext.equals(".webp") || ext.equals(".gif")) {
                return ext;
            }
        }

        return switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".png";
        };
    }
}