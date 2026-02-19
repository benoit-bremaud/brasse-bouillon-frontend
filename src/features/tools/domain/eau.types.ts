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

export type EauIonKey = "ca" | "mg" | "na" | "so4" | "cl" | "hco3";

export interface EauIonsProfile {
  ca: number;
  mg: number;
  na: number;
  so4: number;
  cl: number;
  hco3: number;
}

export interface EauIonRange {
  min: number;
  max: number;
}

export type EauTargetRanges = Record<EauIonKey, EauIonRange>;

export type WaterAdjustmentAgentGroup =
  | "sels-mineraux"
  | "alcalinisants"
  | "acidifiants";

export interface WaterAdjustmentAgent {
  id: string;
  name: string;
  formula: string;
  group: WaterAdjustmentAgentGroup;
  doseUnit: "g/L";
  maxDoseGl: number;
  contributions: Partial<Record<EauIonKey, number>>;
  note: string;
}

export interface WaterAdjustmentDoseForVolume {
  liters: number;
  grams: number;
}

export interface WaterAdjustmentRecommendation {
  agentId: string;
  name: string;
  formula: string;
  group: WaterAdjustmentAgentGroup;
  doseGl: number;
  doseByVolume: WaterAdjustmentDoseForVolume[];
  expectedImpact: Partial<Record<EauIonKey, number>>;
  note: string;
}

export interface WaterAdjustmentIonStatus {
  ion: EauIonKey;
  current: number;
  targetMin: number;
  targetMax: number;
  targetMid: number;
  predicted: number;
  deltaToMid: number;
  inRange: boolean;
}

export interface WaterAlternativeRecommendation {
  id: string;
  label: string;
  type: "profil-type" | "marque";
  profileApprox: EauIonsProfile;
  description: string;
  caution: string;
}

export interface WaterAdjustmentPlanResult {
  mode: "heuristic" | "pro";
  title: string;
  feasible: boolean;
  summary: string;
  ionStatuses: WaterAdjustmentIonStatus[];
  recommendations: WaterAdjustmentRecommendation[];
  warnings: string[];
  alternatives: WaterAlternativeRecommendation[];
}
