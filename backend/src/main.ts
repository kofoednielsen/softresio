import postgres, { RowList, Row, TransactionSql, ParameterOrJSON } from "postgres"
import process from "node:process"
import type { Sheet, Raid, CreateRaidRequest, GenericResponse } from "../types/types.ts"
import { Hono } from "hono"
import { getCookie, setCookie, } from 'hono/cookie'
import * as fs from 'node:fs';
import * as jwt from 'hono/jwt'
import { randomUUID, randomBytes } from 'node:crypto'


var instances = {}

const getenv = (name: string): string => {
  const value = process.env[name] 
  if (!value) {
    throw new Error(`Missing environment variable ${name}`)
  }
  return value
}

const DATABASE_USER = getenv("DATABASE_USER")
const DATABASE_PASSWORD = getenv("DATABASE_PASSWORD")
const DOMAIN = getenv("DOMAIN")
const JWT_SECRET = getenv("JWT_SECRET")

const instance_files = fs.glob("./instances/*.json", async (err, matches) => {
  if (err) {
      throw err
  }
  for (const file of matches) {
    const instance = JSON.parse(await Deno.readTextFile(file))
    instances[instance.id] = instance
  }
})

const sql = postgres({
  host: "database",
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
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

const get_or_create_user = async (c): User => {
  // Try to get user from cookie
  const token = getCookie(c, 'auth')
  if (token) {
    const decoded = await jwt.verify(token, JWT_SECRET, "HS256")
    if (decoded && decoded.user_id) {
      return decoded
    }
  }

  // Create new user
  const user_id = randomUUID()
  const user = { user_id, issuer: DOMAIN }
  const new_token = await jwt.sign(user, JWT_SECRET, "HS256")
  setCookie(c, 'auth', new_token, {
    secure: true,
    domain: DOMAIN,
    httpOnly: true,
    sameSite: 'Strict'
  })
  return user
}

app.get("/api/instances", async (c) => {
  console.log(await get_or_create_user(c))
  return c.json(Object.values(instances).map((e) => {return { id: e.id, name: e.name }}))
})

app.post("/api/new", async (c) => {
  const user = await get_or_create_user(c)
  const body = await c.req.json() as CreateRaidRequest
  const raid_id = randomBytes(4).toString('base64').substring(0, 5)
  const raid: Raid  = {
    sheet: {
      id: raid_id,
      time: (new Date()).toISOString(),
      sr_plus_enabled: body.use_sr_plus,
      activity_log: [],
      attendees: [],
      admins: [ 
        user
      ],
      password: {
        hash: "yes" + body.admin_password,
        salt: "yes"
      }
    }
  }
  await sql`insert into raids ${sql({ raid: raid })};`
  const response: GenericResponse<Raid> = { data: raid, user }
  return c.json(response)
})

// const [user]: [User?] = await sql`SELECT * FROM users WHERE id = ${id}`
// if (!user) // => User | undefined
//   throw new Error('Not found')
// return user // => User

app.get("/api/:sheet_id", async (c) => {
  const sheet_id = c.req.param('sheet_id')
  const [raid] = await sql<{sheet: Sheet}[]>`select raid->'sheet' as sheet from raids where raid @> '{ "sheet": { "id": "${sheet_id}" } }';`
  if (!raid) {
   return c.json({ error: 'Raid not found' }, 404)
  }
  console.log(raid)
  return c.json(raid.sheet)
})

Deno.serve(app.fetch)
