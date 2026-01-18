FROM denoland/deno:latest

WORKDIR /app

# Install dependencies
COPY frontend/package.json frontend/deno.lock frontend/vite.config.ts frontend/index.html .
RUN deno install

# Copy app
COPY frontend/src/ ./src/
COPY frontend/types/ ./types/
COPY frontend/public/ ./public/

CMD ["deno", "run", "dev", "--host", "0.0.0.0"]
