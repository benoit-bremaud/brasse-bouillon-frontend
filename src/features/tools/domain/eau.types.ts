export type EauConformite = "C" | "N" | "D" | "S" | "INCONNU";

export interface EauMinerauxMgL {
  ca: number | null;
  mg: number | null;
  cl: number | null;
  so4: number | null;
  hco3: number | null;
}

export interface EauProfile {
  provider: string;
  codeInsee: string;
  annee: number;
  nomReseau: string | null;
  nbPrelevements: number;
  conformite: EauConformite;
  minerauxMgL: EauMinerauxMgL;
  dureteFrancais: number | null;
}

export interface WaterProfileLookupInput {
  codePostal: string;
  commune: string;
  annee?: number;
  provider?: string;
}

export interface DemoWaterLocationOption {
  id: string;
  departmentCode: string;
  codePostal: string;
  commune: string;
  label: string;
}
