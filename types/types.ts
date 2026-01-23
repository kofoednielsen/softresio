export interface OnChangeEvent {
    currentTarget: {
        value: string
    }
}
export type Class = 
    | "Warrior"
    | "Mage"
    | "Paladin"
    | "Priest"
    | "Druid"
    | "Warlock"
    | "Rogue"
    | "Shaman";
export interface Character {
  name: string;
  class: Class;
  spec: string;
}

export interface User {
  userId: string; // uuidv4
  issuer: string;
}

export interface SoftReserve {
  itemId: number;
  srPlus: number | null;
  comment: string | null;
}

export interface Attendee {
  character: Character;
  softReserves: SoftReserve[];
  user: User;
}

export interface Password {
  salt: string;
  hash: string;
}

export interface Activiy {
  time: string; // rfc3339
  user: User;
  action:
    | "SRDeleted"
    | "SRCreated"
    | "SRUpdated"
    | "RaidCreated"
    | "RaidUpdated";
  softReserve: SoftReserve;
}

export interface Sheet {
  raidId: string;
  useSrPlus: boolean;
  instanceId: number;
  time: string; // rfc 3339
  attendees: Attendee[];
  admins: User[];
  password: Password;
  activityLog: Activiy[];
  srCount: number;
}

export interface Raid {
  sheet: Sheet;
}

interface GenericResponse<T> {
  data?: T;
  error?: string;
  user: User;
}

export interface CreateRaidRequest {
  instanceId: number;
  description: string;
  useSrPlus: boolean;
  adminPassword: string;
  time: string; //rfc 3339
  srCount: number;
}

export type GetInstancesResponse = GenericResponse<Instance[]>

export type CreateRaidResponse = GenericResponse<{ raidId: string }>

export type CreateSrResponse = GenericResponse<Sheet>
    
export type GetRaidResponse = GenericResponse<Sheet>

export interface CreateSrRequest {
  raidId: string;
  character: Character;
  selectedItemIds: number[];
}

export interface Item {
  id: number;
  tooltip: string;
  icon: string;
  name: string;
  slot: string;
  type: string;
  classes: Class[];
  quality: 1 | 2 | 3 | 4 | 5;
}

export interface Instance {
  id: number;
  name: string;
  shortname: string;
  items: Item[];
}

