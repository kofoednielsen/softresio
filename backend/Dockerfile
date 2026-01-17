FROM oven/bun:latest

WORKDIR /app

COPY package.json ./
COPY bun.lock ./

RUN bun install

COPY src ./

CMD ["bun", "run", "dev"]
