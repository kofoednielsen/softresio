import postgres from "postgres";
import process from "node:process";
import { Hono } from "hono";

const sql = postgres({
  host: "database",
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
});

const begin_with_timeout = (body) => {
  return sql.begin(async (sql) => {
    await sql`set local transaction_timeout '1s';`
    await body()
  })
}

await sql`
  create table if not exists "sheets" ( sheet jsonb );
`;
await sql`
  create index idxsheets ON sheets using gin ( sheet );
`;

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
