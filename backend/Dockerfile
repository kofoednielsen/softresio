FROM denoland/deno:latest

WORKDIR /app

# Install dependencies
COPY backend/deno.json backend/deno.lock .
RUN deno install

# Copy app
COPY backend/src/ ./src/
COPY backend/types/ ./types/
COPY backend/instances/ ./instances/

CMD ["deno", "task", "start"]
