import postgres, { Row, RowList, TransactionSql } from "postgres"
import process from "node:process"
import type {
  Attendee,
  CreateRaidRequest,
  CreateRaidResponse,
  CreateSrRequest,
  GenericResponse,
  Instance,
  Raid,
  Sheet,
  SoftReserve,
  User,
} from "../types/types.ts"
import { Hono } from "hono"
import { serveStatic } from "hono/deno"
import type { Context } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import * as fs from "node:fs"
import * as jwt from "hono/jwt"
import { randomUUID } from "node:crypto"

const instances: Instance[] = []

const getEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable ${name}`)
  }
  return value
}

const DATABASE_USER = getEnv("DATABASE_USER")
const DATABASE_PASSWORD = getEnv("DATABASE_PASSWORD")
const DOMAIN = getEnv("DOMAIN")
const JWT_SECRET = getEnv("JWT_SECRET")

fs.glob("./instances/*.json", async (err, matches) => {
  if (err) {
    throw err
  }
  for (const file of matches) {
    const instance: Instance = JSON.parse(await Deno.readTextFile(file))
    instances.push(instance)
  }
})

const sql = postgres({
  host: "database",
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
})

const beginWithTimeout = (
  body: (tx: TransactionSql<{}>) => Promise<RowList<Row[]> | void>,
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

const generateRaidId = (): string => {
  const characterSet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let raidId = ""
  for (let i = 0; i < 5; i++) {
    raidId += characterSet[Math.floor(Math.random() * characterSet.length)]
  }
  return raidId
}

const getOrCreateUser = async (c: Context): Promise<User> => {
  // Try to get user from cookie
  const token = getCookie(c, "auth")
  if (token) {
    const decoded = await jwt.verify(
      token,
      JWT_SECRET,
      "HS256",
    ) as unknown as User
    if (decoded && decoded.userId) {
      return decoded
    }
  }
  // Create new user
  const user = { userId: randomUUID(), issuer: DOMAIN }
  const new_token = await jwt.sign(user, JWT_SECRET, "HS256")
  setCookie(c, "auth", new_token, {
    secure: true,
    domain: DOMAIN,
    httpOnly: true,
    sameSite: "Strict",
  })
  return user
}

app.use("*", serveStatic({ root: "./static" }))

app.get("/api/instances", async (c) => {
  const user = await getOrCreateUser(c)
  const response: GenericResponse<Instance[]> = { data: instances, user }
  return c.json(response)
})

app.post("/api/sr/create", async (c) => {
  const user = await getOrCreateUser(c)
  const { raidId, character, selectedItemIds } = await c.req
    .json() as CreateSrRequest
  const softReserves: SoftReserve[] = selectedItemIds.map((
    itemId,
  ) => ({ itemId, srPlus: null, comment: null }))
  const attendee: Attendee = {
    character,
    softReserves,
    user,
  }
  beginWithTimeout(async (tx) => {
    const [raid] = await tx<
      Raid[]
    >`select raid -> 'sheet' as sheet from raids where raid @> ${{
      sheet: { raidId },
    } as never} for update;`
    if (!raid) return
    raid.sheet.attendees = raid.sheet.attendees.filter((attendee) =>
      attendee.character.name !== character.name &&
      attendee.user.userId !== user.userId
    )
    raid.sheet.attendees = [...raid.sheet.attendees, attendee]
    await tx`update raids set ${sql({ raid: raid } as never)} where raid @> ${{
      sheet: { raidId },
    } as never}`
  })
  const response: GenericResponse<null> = { user, data: null }
  return c.json(response)
})

app.post("/api/raid/create", async (c) => {
  const user = await getOrCreateUser(c)
  const { instanceId, srCount, useSrPlus, time, adminPassword } = await c.req
    .json() as CreateRaidRequest
  const raidId = generateRaidId()
  const raid: Raid = {
    sheet: {
      raidId,
      instanceId,
      time,
      useSrPlus,
      srCount,
      activityLog: [],
      attendees: [],
      admins: [
        user,
      ],
      password: {
        hash: "yes" + adminPassword,
        salt: "yes",
      },
    },
  }
  await sql`insert into raids ${sql({ raid: raid } as never)};`
  const response: GenericResponse<CreateRaidResponse> = {
    data: { raidId },
    user,
  }

  return c.json(response)
})

app.get("/api/raid/:raidId", async (c) => {
  const user = await getOrCreateUser(c)
  const raidId = c.req.param("raidId")
  const [raid] = await sql<
    Raid[]
  >`select raid #- '{sheet,password}' -> 'sheet' as sheet from raids where raid @> ${{
    sheet: { raidId },
  } as never};`
  if (!raid) {
    return c.json({ error: "Raid not found" }, 404)
  }
  const response: GenericResponse<Sheet> = { data: raid.sheet, user }
  return c.json(response)
})

Deno.serve(app.fetch)
