/**
 * The eight desks the newsroom runs. A desk is both an editorial beat and a
 * classification target, so the copy here is written to do double duty: the
 * `brief` is what the reader sees on the desk page, the `signal` is what the
 * classifier is told to look for.
 */

export const DESK_IDS = [
  'rescue',
  'revival',
  'healing',
  'provision',
  'reunion',
  'kindness',
  'justice',
  'renewal',
  'underground',
] as const;

export type DeskId = (typeof DESK_IDS)[number];

export interface Desk {
  id: DeskId;
  name: string;
  brief: string;
  signal: string;
  color: string;
  tint: string;
}

export const DESKS: Record<DeskId, Desk> = {
  rescue: {
    id: 'rescue',
    name: 'Rescue',
    brief: 'People pulled out alive. Search teams that did not stop digging.',
    signal:
      'someone found alive, rescued, or saved from a disaster, collapse, flood, fire, mine, avalanche, sea, or wreck; survivors located; evacuations that worked',
    color: '#33614A',
    tint: '#E7F0EA',
  },
  revival: {
    id: 'revival',
    name: 'Revival',
    brief:
      'Salvations, baptisms and revival. Faith moving in public, and rooms that will not empty.',
    signal:
      'people coming to faith, professions of faith, conversions, a mass baptism or a season of baptisms, a revival or an outpouring, a prayer or worship movement, a congregation growing far beyond its building, a church planted or rebuilt, a campus or stadium gathering',
    color: '#B4471B',
    tint: '#FBE7DA',
  },
  healing: {
    id: 'healing',
    name: 'Healing',
    brief: 'Bodies mending. Cures approved. Patients who went home.',
    signal:
      'a recovery against the odds, remission, a patient waking or walking again, an approved treatment or vaccine, a transplant first, a disease pushed back',
    color: '#2A5A85',
    tint: '#E3EDF5',
  },
  provision: {
    id: 'provision',
    name: 'Provision',
    brief: 'Need met. Money raised, debts cleared, tables filled.',
    signal:
      'a need met by giving, funds raised, debts forgiven or paid off, food or shelter provided, an anonymous donation, famine or hunger relieved',
    color: '#8A6212',
    tint: '#F6EDD9',
  },
  reunion: {
    id: 'reunion',
    name: 'Reunion',
    brief: 'The missing found. Families put back together.',
    signal:
      'a missing person found, a family reunited after separation, an adoption completed, a lost child returned, siblings or parents found after years',
    color: '#6A3358',
    tint: '#F2E6EE',
  },
  kindness: {
    id: 'kindness',
    name: 'Kindness',
    brief: 'Ordinary people doing something the rest of us will remember.',
    signal:
      'an act of generosity, courage, or neighbourliness by an ordinary person, a stranger helping a stranger, a community rallying around one of its own',
    color: '#A2384F',
    tint: '#F7E5E9',
  },
  justice: {
    id: 'justice',
    name: 'Justice',
    brief: 'The wrongly held walking free. The trafficked coming home.',
    signal:
      'an exoneration or wrongful conviction overturned, a hostage or prisoner released, trafficking victims freed, a long-denied right restored, peace agreed',
    color: '#3B4A8C',
    tint: '#E5E8F4',
  },
  underground: {
    id: 'underground',
    name: 'Underground',
    brief:
      'Where the church meets in secret and grows anyway. Locations withheld on purpose.',
    signal:
      'a house church or underground congregation growing, believers meeting in secret, converts in a country where conversion is illegal, Bibles reaching a closed nation, a church that keeps meeting under a ban or after a raid, faith persisting under a hostile state',
    color: '#5A5140',
    tint: '#EFEADF',
  },
  renewal: {
    id: 'renewal',
    name: 'Renewal',
    brief: 'Land, water and creatures coming back from the edge.',
    signal:
      'a species recovering or rediscovered, a river or forest restored, a habitat protected, pollution reversed, a town or neighbourhood rebuilt',
    color: '#4A6A2B',
    tint: '#EBF1E1',
  },
};

export const DESK_LIST: Desk[] = DESK_IDS.map((id) => DESKS[id]);

export function isDeskId(value: string): value is DeskId {
  return (DESK_IDS as readonly string[]).includes(value);
}

export function desk(id: DeskId): Desk {
  return DESKS[id];
}
