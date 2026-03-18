# Use lightweight base
FROM debian:bullseye-slim

WORKDIR /app

# Install ONLY required tools
RUN apt-get update && apt-get install -y \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m runner
USER runner

CMD ["bash"]