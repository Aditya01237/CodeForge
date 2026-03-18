FROM gcc:11

WORKDIR /app

# Create non-root user (security)
RUN useradd -m runner
USER runner

# Default command (will be overridden)
CMD ["bash"]