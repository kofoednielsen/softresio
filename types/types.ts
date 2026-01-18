export interface Character {
  name: string
  class: string
  spec: "Warrior" | "Mage" | "Paladin" | "Priest" | "Druid" | "Warlock" | "Rogue" | "Shaman"
}

export interface User {
  user_id: string // uuidv4
  issuer: string
}

export interface SoftReserve {
  item_id: number
  sr_plus: number | null
  comment: string | null
}

export interface Attendee {
  character: Character
  soft_reserves: SoftReserve[]
  user: User
}

export interface Password {
  salt: string
  hash: string
}

export interface Activiy {
  time: string // rfc3339
  user: User
  action: "SRDeleted" | "SRCreated" | "SRUpdated" | "RaidCreated" | "RaidUpdated"
  soft_reserve: SoftReserve
}

export interface Sheet {
  id: string
  sr_plus_enabled: boolean
  time: string // rfc 3339
  attendees: Attendee[]
  admins: User[]
  password: Password
  activity_log: Activiy[]
}

export interface Raid {
  sheet: Sheet
}

export interface GenericResponse<T> {
  data?: T
  error?: string
  user: User
}

export interface CreateRaidRequest {
  instance_id: number,
  description: string,
  use_sr_plus: boolean,
  admin_password: string
}
