import {
  DemoWaterLocationOption,
  EauProfile,
  WaterProfileLookupInput,
} from "../domain/eau.types";

import { dataSource } from "@/core/data/data-source";
import { demoWaterProfiles } from "@/mocks/demo-data";
import { getWaterProfileByLocationApi } from "../data/eau.api";

function normalizeInput(
  input: WaterProfileLookupInput,
): WaterProfileLookupInput {
  return {
    codePostal: input.codePostal.trim(),
    commune: input.commune.trim(),
    annee: input.annee,
    provider: input.provider,
  };
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function findDemoProfile(input: WaterProfileLookupInput): EauProfile | null {
  const normalizedCodePostal = input.codePostal.trim();
  const normalizedCommune = input.commune.trim().toLocaleLowerCase();

  const match = demoWaterProfiles.find(
    (item) =>
      item.lookup.codePostal === normalizedCodePostal &&
      item.lookup.commune.toLocaleLowerCase() === normalizedCommune,
  );

  if (!match) {
    return null;
  }

  return {
    ...match.profile,
    annee: input.annee ?? getCurrentYear(),
  };
}

function toDemoLocationOption(
  input: WaterProfileLookupInput,
): DemoWaterLocationOption {
  const codePostal = input.codePostal.trim();
  const commune = input.commune.trim();
  const departmentCode = codePostal.slice(0, 2);

  return {
    id: `${codePostal}-${commune.toLocaleLowerCase()}`,
    departmentCode,
    codePostal,
    commune,
    label: `${departmentCode} · ${commune} (${codePostal})`,
  };
}

export function listDemoWaterLocationOptions(): DemoWaterLocationOption[] {
  if (!dataSource.useDemoData) {
    return [];
  }

  return demoWaterProfiles
    .map((item) => toDemoLocationOption(item.lookup))
    .sort((a, b) => {
      if (a.departmentCode !== b.departmentCode) {
        return a.departmentCode.localeCompare(b.departmentCode);
      }

      return a.commune.localeCompare(b.commune, "fr-FR");
    });
}

export async function getWaterProfileByLocation(
  input: WaterProfileLookupInput,
): Promise<EauProfile> {
  const normalizedInput = normalizeInput(input);

  if (!normalizedInput.codePostal || !normalizedInput.commune) {
    throw new Error("Code postal et commune sont requis.");
  }

  if (dataSource.useDemoData) {
    const profile = findDemoProfile(normalizedInput);
    if (!profile) {
      throw new Error("Aucune donnée eau trouvée pour cette commune");
    }
    return profile;
  }

  return getWaterProfileByLocationApi({
    ...normalizedInput,
    annee: normalizedInput.annee ?? getCurrentYear(),
  });
}
