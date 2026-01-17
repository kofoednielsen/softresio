import postgres from "postgres";
import process from "node:process";
import { Application, Router } from "@oak/oak";

const sql = postgres({
  host: "database",
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
});

await sql`
  create table if not exists "sheets" ( sheet jsonb );
`;
await sql`
  create index idxsheets ON sheets using gin ( sheet );
`;

const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = "Hello world";
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.listen();
