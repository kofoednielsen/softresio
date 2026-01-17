FROM denoland/deno:latest

# Create working directory
WORKDIR /app

# Copy source
COPY ./deno.json deno.json
COPY ./deno.lock deno.lock

# Install dependencies (use just `deno install` if deno.json has imports)
RUN deno install

copy ./src ./

# Run the app
CMD ["deno", "run", "--allow-net", "server.ts"]
