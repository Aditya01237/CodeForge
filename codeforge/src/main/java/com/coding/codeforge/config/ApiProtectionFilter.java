package com.coding.codeforge.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Semaphore;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiProtectionFilter extends OncePerRequestFilter {

    private static final Duration WINDOW = Duration.ofMinutes(1);
    private static final int GENERAL_MUTATION_LIMIT = 120;
    private static final int JUDGE_LIMIT = 30;
    private static final int UPLOAD_LIMIT = 10;

    private final Map<String, RateWindow> mutationWindows = new ConcurrentHashMap<>();
    private final Map<String, RateWindow> judgeWindows = new ConcurrentHashMap<>();
    private final Map<String, RateWindow> uploadWindows = new ConcurrentHashMap<>();
    private final Semaphore judgeConcurrency = new Semaphore(4, true);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        addSecurityHeaders(response);

        String path = request.getRequestURI();
        String method = request.getMethod();
        String clientKey = getClientKey(request);
        boolean mutation = !"GET".equals(method) && !"HEAD".equals(method) && !"OPTIONS".equals(method);
        boolean judgeRequest = "POST".equals(method)
                && ("/api/run".equals(path) || "/api/submit".equals(path));
        boolean uploadRequest = "POST".equals(method) && path.startsWith("/api/uploads/");

        if (mutation && !allow(mutationWindows, clientKey, GENERAL_MUTATION_LIMIT)) {
            reject(response, "Too many API changes. Please wait before trying again.");
            return;
        }

        if (uploadRequest && !allow(uploadWindows, clientKey, UPLOAD_LIMIT)) {
            reject(response, "Upload rate limit exceeded.");
            return;
        }

        if (judgeRequest && !allow(judgeWindows, clientKey, JUDGE_LIMIT)) {
            reject(response, "Code execution rate limit exceeded.");
            return;
        }

        if (!judgeRequest) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!judgeConcurrency.tryAcquire()) {
            reject(response, "The judge is busy. Please retry shortly.");
            return;
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            judgeConcurrency.release();
        }
    }

    private boolean allow(Map<String, RateWindow> windows, String clientKey, int limit) {
        return windows.computeIfAbsent(clientKey, ignored -> new RateWindow()).tryAcquire(limit);
    }

    private String getClientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",", 2)[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void addSecurityHeaders(HttpServletResponse response) {
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    }

    private void reject(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }

    private static final class RateWindow {
        private Instant startedAt = Instant.now();
        private int count;

        synchronized boolean tryAcquire(int limit) {
            Instant now = Instant.now();
            if (Duration.between(startedAt, now).compareTo(WINDOW) >= 0) {
                startedAt = now;
                count = 0;
            }

            if (count >= limit) {
                return false;
            }

            count++;
            return true;
        }
    }
}
