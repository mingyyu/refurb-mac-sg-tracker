FROM oven/bun:latest
WORKDIR /app

# Copy package files if they exist
COPY package.json ./
# Install dependencies (none currently, but ready for future)
RUN bun install || true

# Copy source code
COPY . .

# Run the check script by default
CMD ["bun", "run", "check.ts"]
