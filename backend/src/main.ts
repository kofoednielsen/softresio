import postgres, { RowList, Row, TransactionSql, ParameterOrJSON } from "postgres"
import process from "node:process"
import { Sheet, Raid } from "../types/types.ts"
import { Hono } from "hono"

const sql = postgres({
  host: "database",
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
})

const begin_with_timeout = (
  body: (tx: TransactionSql<{}>) => Promise<RowList<Row[]>>,
) => {
  return sql.begin(async (tx) => {
    await tx`set local transaction_timeout = '1s';`
    return await body(tx)
  })
}

await sql`
  create table if not exists "raids" ( raid jsonb );
`

await sql`
  create index if not exists idxraids ON raids using gin ( raid );
`

const app = new Hono()

app.get("/", async (c) => {
  const res = await begin_with_timeout(async (tx: TransactionSql<{}>) => {
    const res = await tx`select 6 as foo;`
    return res
  })
  console.log(res)
  return c.text(res.foo)
})

app.get("/make_sample", async (c) => {
  const raid: Raid  = {
    sheet: {
      id: 'kxXhe',
      time: '2026-01-17T22:15:27.369Z',
      sr_plus_enabled: true,
      attendees: [
        {
          character: {
            name: "Aborn",
            class: "Warrior",
            spec: "Protection"
          },
          soft_reserves: [
            {
              item_id: 1933,
              sr_plus: 50,
              comment: null,
              user_id: "auto:01923-123123-123123-123123"
            }
          ]
        }
      ]
    },
    secrets: {
      password_hash: "1234",
      access_token: "123"
    }
  }
  await sql`insert into raids ${sql({ raid: raid })};`
  return c.json(raid.sheet)
})

// const [user]: [User?] = await sql`SELECT * FROM users WHERE id = ${id}`
// if (!user) // => User | undefined
//   throw new Error('Not found')
// return user // => User

app.get("/:sheet_id", async (c) => {
  const sheet_id = c.req.param('sheet_id')
  const [raid] = await sql<{sheet: Sheet}[]>`select raid->'sheet' as sheet from raids where raid @> '{ "sheet": { "id": "${sheet_id}" } }';`
  if (!raid) {
   return c.json({ error: 'Raid not found' }, 404)
  }
  console.log(raid)
  return c.json(raid.sheet)
})

Deno.serve(app.fetch)
