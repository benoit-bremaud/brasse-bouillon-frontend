import {
  EauConformite,
  EauProfile,
  WaterProfileLookupInput,
} from "../domain/eau.types";

import { request } from "@/core/http/http-client";

type EauProfileDto = {
  provider: string;
  codeInsee: string;
  annee: number;
  nomReseau: string | null;
  nbPrelevements: number;
  conformite: EauConformite;
  minerauxMgL: {
    ca: number | null;
    mg: number | null;
    cl: number | null;
    so4: number | null;
    hco3: number | null;
  };
  dureteFrancais: number | null;
};

function mapEauProfile(dto: EauProfileDto): EauProfile {
  return {
    provider: dto.provider,
    codeInsee: dto.codeInsee,
    annee: dto.annee,
    nomReseau: dto.nomReseau,
    nbPrelevements: dto.nbPrelevements,
    conformite: dto.conformite,
    minerauxMgL: {
      ca: dto.minerauxMgL.ca,
      mg: dto.minerauxMgL.mg,
      cl: dto.minerauxMgL.cl,
      so4: dto.minerauxMgL.so4,
      hco3: dto.minerauxMgL.hco3,
    },
    dureteFrancais: dto.dureteFrancais,
  };
}

function toQueryString(params: WaterProfileLookupInput): string {
  const searchParams = new URLSearchParams();
  searchParams.set("codePostal", params.codePostal);
  searchParams.set("commune", params.commune);

  if (params.annee !== undefined) {
    searchParams.set("annee", String(params.annee));
  }

  if (params.provider) {
    searchParams.set("provider", params.provider);
  }

  return searchParams.toString();
}

export async function getWaterProfileByLocationApi(
  input: WaterProfileLookupInput,
): Promise<EauProfile> {
  const query = toQueryString(input);
  const payload = await request<EauProfileDto>(`/eau?${query}`);
  return mapEauProfile(payload);
}
