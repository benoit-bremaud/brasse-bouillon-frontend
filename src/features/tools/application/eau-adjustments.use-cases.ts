import {
  EauIonKey,
  EauIonsProfile,
  EauTargetRanges,
  WaterAdjustmentAgent,
  WaterAdjustmentPlanResult,
  WaterAdjustmentRecommendation,
  WaterAlternativeRecommendation,
} from "../domain/eau.types";

const ION_KEYS: EauIonKey[] = ["ca", "mg", "na", "so4", "cl", "hco3"];

const ION_LABELS: Record<EauIonKey, string> = {
  ca: "Ca²⁺",
  mg: "Mg²⁺",
  na: "Na⁺",
  so4: "SO₄²⁻",
  cl: "Cl⁻",
  hco3: "HCO₃⁻",
};

export const WATER_ADJUSTMENT_VOLUME_PRESETS = [5, 10, 20, 40] as const;

export type WaterAdjustmentContext = {
  currentProfile: EauIonsProfile;
  targetRanges: EauTargetRanges;
};

type WaterAdjustmentMode = "heuristic" | "pro";

type AdjustmentVector = Record<string, number>;

const WATER_ADJUSTMENT_AGENTS: WaterAdjustmentAgent[] = [
  {
    id: "gypsum",
    name: "Gypse",
    formula: "CaSO₄·2H₂O",
    group: "sels-mineraux",
    doseUnit: "g/L",
    maxDoseGl: 0.9,
    contributions: { ca: 23.3, so4: 55.8 },
    note: "Augmente sécheresse et perception de l'amertume",
  },
  {
    id: "calcium-chloride",
    name: "Chlorure de calcium",
    formula: "CaCl₂ (anhydre)",
    group: "sels-mineraux",
    doseUnit: "g/L",
    maxDoseGl: 0.7,
    contributions: { ca: 36.1, cl: 63.9 },
    note: "Renforce rondeur et expression maltée",
  },
  {
    id: "epsom",
    name: "Sel d'Epsom",
    formula: "MgSO₄·7H₂O",
    group: "sels-mineraux",
    doseUnit: "g/L",
    maxDoseGl: 0.6,
    contributions: { mg: 9.9, so4: 39.3 },
    note: "Nutriment levure, léger goût amer en excès",
  },
  {
    id: "table-salt",
    name: "Sel de table",
    formula: "NaCl",
    group: "sels-mineraux",
    doseUnit: "g/L",
    maxDoseGl: 0.3,
    contributions: { na: 39.3, cl: 60.7 },
    note: "Rondeur à petite dose — limiter Na à 75 ppm",
  },
  {
    id: "magnesium-chloride",
    name: "Chlorure de magnésium",
    formula: "MgCl₂·6H₂O",
    group: "sels-mineraux",
    doseUnit: "g/L",
    maxDoseGl: 0.45,
    contributions: { mg: 12.0, cl: 34.7 },
    note: "Corrige Mg avec un impact chlorure plus doux.",
  },
  {
    id: "sodium-bicarbonate",
    name: "Bicarbonate de soude",
    formula: "NaHCO₃",
    group: "alcalinisants",
    doseUnit: "g/L",
    maxDoseGl: 0.45,
    contributions: { na: 27.4, hco3: 72.6 },
    note: "Remonte le pH, utile pour bières foncées",
  },
  {
    id: "chalk",
    name: "Craie",
    formula: "CaCO₃",
    group: "alcalinisants",
    doseUnit: "g/L",
    maxDoseGl: 0.65,
    contributions: { ca: 20, hco3: 60 },
    note: "Peu soluble — ajouter directement dans le mash",
  },
  {
    id: "pickling-lime",
    name: "Chaux éteinte",
    formula: "Ca(OH)₂",
    group: "alcalinisants",
    doseUnit: "g/L",
    maxDoseGl: 0.2,
    contributions: { ca: 54, hco3: 78 },
    note: "Très puissante: dosage prudent et contrôle pH recommandé.",
  },
  {
    id: "lactic-acid",
    name: "Acide lactique",
    formula: "C₃H₆O₃ (88%)",
    group: "acidifiants",
    doseUnit: "g/L",
    maxDoseGl: 0.4,
    contributions: { hco3: -85 },
    note: "Réduit l'alcalinité, peut marquer le goût en surdosage.",
  },
  {
    id: "phosphoric-acid",
    name: "Acide phosphorique",
    formula: "H₃PO₄ (10%)",
    group: "acidifiants",
    doseUnit: "g/L",
    maxDoseGl: 0.8,
    contributions: { hco3: -42 },
    note: "Alternative neutre en goût pour baisser HCO₃⁻.",
  },
];

const WATER_ALTERNATIVES: WaterAlternativeRecommendation[] = [
  {
    id: "type-soft",
    label: "Profil type: eau très faiblement minéralisée",
    type: "profil-type",
    profileApprox: { ca: 12, mg: 3, na: 3, so4: 8, cl: 8, hco3: 30 },
    description:
      "Base souple pour Pils/Lager et styles délicats, facile à reminéraliser.",
    caution:
      "Les analyses varient selon source/lot: vérifier l'étiquette locale.",
  },
  {
    id: "type-balanced",
    label: "Profil type: eau équilibrée modérée",
    type: "profil-type",
    profileApprox: { ca: 45, mg: 8, na: 10, so4: 25, cl: 22, hco3: 130 },
    description:
      "Point de départ polyvalent pour blondes, ambrées et bières de table.",
    caution: "Ajuster ensuite Ca/Cl/SO₄ selon style et levure utilisés.",
  },
  {
    id: "brand-mont-roucous",
    label: "Marque indicatrice: Mont Roucous",
    type: "marque",
    profileApprox: { ca: 3, mg: 2, na: 2, so4: 3, cl: 3, hco3: 15 },
    description:
      "Très basse minéralisation, proche d'une base osmosée simplifiée.",
    caution: "Profil indicatif: toujours contrôler les données de l'étiquette.",
  },
  {
    id: "brand-volvic",
    label: "Marque indicatrice: Volvic",
    type: "marque",
    profileApprox: { ca: 12, mg: 8, na: 12, so4: 9, cl: 14, hco3: 74 },
    description:
      "Option grand public équilibrée, facile à corriger vers plusieurs styles.",
    caution: "Minéraux indicatifs, peuvent varier selon captage et millésime.",
  },
  {
    id: "brand-evian",
    label: "Marque indicatrice: Evian",
    type: "marque",
    profileApprox: { ca: 80, mg: 26, na: 7, so4: 14, cl: 10, hco3: 360 },
    description:
      "Riche en minéraux et bicarbonates, plutôt adaptée aux styles foncés.",
    caution: "Souvent trop alcaline pour styles pâles sans dilution préalable.",
  },
  {
    id: "brand-contrex",
    label: "Marque indicatrice: Contrex",
    type: "marque",
    profileApprox: { ca: 468, mg: 84, na: 9, so4: 1121, cl: 11, hco3: 403 },
    description:
      "Extrêmement minéralisée, utile uniquement en mélange très dilué.",
    caution: "Peut rapidement déséquilibrer le profil si utilisée pure.",
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function toTargetMid(targetRanges: EauTargetRanges): EauIonsProfile {
  return {
    ca: (targetRanges.ca.min + targetRanges.ca.max) / 2,
    mg: (targetRanges.mg.min + targetRanges.mg.max) / 2,
    na: (targetRanges.na.min + targetRanges.na.max) / 2,
    so4: (targetRanges.so4.min + targetRanges.so4.max) / 2,
    cl: (targetRanges.cl.min + targetRanges.cl.max) / 2,
    hco3: (targetRanges.hco3.min + targetRanges.hco3.max) / 2,
  };
}

function cloneProfile(input: EauIonsProfile): EauIonsProfile {
  return {
    ca: input.ca,
    mg: input.mg,
    na: input.na,
    so4: input.so4,
    cl: input.cl,
    hco3: input.hco3,
  };
}

function applyDose(
  profile: EauIonsProfile,
  agent: WaterAdjustmentAgent,
  doseGl: number,
): EauIonsProfile {
  const next = cloneProfile(profile);

  ION_KEYS.forEach((ion) => {
    const contribution = agent.contributions[ion] ?? 0;
    next[ion] = Math.max(0, next[ion] + contribution * doseGl);
  });

  return next;
}

function computePredictedProfile(
  currentProfile: EauIonsProfile,
  doses: AdjustmentVector,
): EauIonsProfile {
  return WATER_ADJUSTMENT_AGENTS.reduce((accumulator, agent) => {
    const dose = doses[agent.id] ?? 0;
    if (!dose) {
      return accumulator;
    }

    return applyDose(accumulator, agent, dose);
  }, cloneProfile(currentProfile));
}

function toDoseByVolume(doseGl: number) {
  return WATER_ADJUSTMENT_VOLUME_PRESETS.map((liters) => ({
    liters,
    grams: round(doseGl * liters, 2),
  }));
}

function toRecommendations(
  doses: AdjustmentVector,
): WaterAdjustmentRecommendation[] {
  return WATER_ADJUSTMENT_AGENTS.map((agent) => {
    const doseGl = round(doses[agent.id] ?? 0, 3);
    return {
      agentId: agent.id,
      name: agent.name,
      formula: agent.formula,
      group: agent.group,
      doseGl,
      doseByVolume: toDoseByVolume(doseGl),
      expectedImpact: Object.fromEntries(
        ION_KEYS.map((ion) => [
          ion,
          round((agent.contributions[ion] ?? 0) * doseGl, 1),
        ]),
      ),
      note: agent.note,
    } as WaterAdjustmentRecommendation;
  }).filter((recommendation) => recommendation.doseGl > 0);
}

function toIonStatuses(
  currentProfile: EauIonsProfile,
  targetRanges: EauTargetRanges,
  predictedProfile: EauIonsProfile,
) {
  return ION_KEYS.map((ion) => {
    const target = targetRanges[ion];
    const targetMid = (target.min + target.max) / 2;
    const predicted = round(predictedProfile[ion], 1);

    return {
      ion,
      current: round(currentProfile[ion], 1),
      targetMin: target.min,
      targetMax: target.max,
      targetMid: round(targetMid, 1),
      predicted,
      deltaToMid: round(predicted - targetMid, 1),
      inRange: predicted >= target.min && predicted <= target.max,
    };
  });
}

function computeRangeScore(
  profile: EauIonsProfile,
  targetRanges: EauTargetRanges,
): number {
  const targetMid = toTargetMid(targetRanges);

  return ION_KEYS.reduce((score, ion) => {
    const range = targetRanges[ion];
    const width = Math.max(range.max - range.min, 1);
    const delta = Math.abs(profile[ion] - targetMid[ion]);
    const outOfRange = profile[ion] < range.min || profile[ion] > range.max;
    const outsidePenalty = outOfRange ? 1.5 : 0;

    const weightMap: Record<EauIonKey, number> = {
      ca: 1,
      mg: 0.8,
      na: 0.7,
      so4: 1.2,
      cl: 1.2,
      hco3: 1.1,
    };

    return score + (delta / width + outsidePenalty) * weightMap[ion];
  }, 0);
}

function chooseBestAlternatives(targetRanges: EauTargetRanges) {
  const targetMid = toTargetMid(targetRanges);

  return [...WATER_ALTERNATIVES]
    .sort((a, b) => {
      const scoreA = ION_KEYS.reduce((sum, ion) => {
        const width = Math.max(
          targetRanges[ion].max - targetRanges[ion].min,
          1,
        );
        return sum + Math.abs(a.profileApprox[ion] - targetMid[ion]) / width;
      }, 0);
      const scoreB = ION_KEYS.reduce((sum, ion) => {
        const width = Math.max(
          targetRanges[ion].max - targetRanges[ion].min,
          1,
        );
        return sum + Math.abs(b.profileApprox[ion] - targetMid[ion]) / width;
      }, 0);

      return scoreA - scoreB;
    })
    .slice(0, 4);
}

function evaluateFeasibility(
  predictedProfile: EauIonsProfile,
  targetRanges: EauTargetRanges,
): { feasible: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const statuses = toIonStatuses(
    predictedProfile,
    targetRanges,
    predictedProfile,
  );
  const outOfRange = statuses.filter((status) => !status.inRange);

  if (predictedProfile.na > 120) {
    warnings.push(
      "Le sodium projeté dépasse 120 ppm: privilégier une dilution ou une autre base d'eau.",
    );
  }

  if (predictedProfile.hco3 > 220 && targetRanges.hco3.max <= 80) {
    warnings.push(
      "Le bicarbonate reste trop élevé pour un style pâle: dilution/osmose recommandée.",
    );
  }

  if (outOfRange.length > 2) {
    warnings.push(
      "Plusieurs ions restent hors plage cible après ajustement: profil potentiellement non atteignable uniquement par sels.",
    );
  }

  const severeDeviation = outOfRange.some((status) => {
    const width = Math.max(status.targetMax - status.targetMin, 1);
    return Math.abs(status.predicted - status.targetMid) > width;
  });

  if (severeDeviation) {
    warnings.push(
      "Écart ionique important détecté: une eau alternative est fortement conseillée.",
    );
  }

  return {
    feasible: warnings.length === 0,
    warnings,
  };
}

function addDose(
  doses: AdjustmentVector,
  agentId: string,
  requestedDose: number,
): number {
  const agent = WATER_ADJUSTMENT_AGENTS.find((entry) => entry.id === agentId);
  if (!agent || requestedDose <= 0) {
    return 0;
  }

  const current = doses[agentId] ?? 0;
  const allowed = clamp(
    requestedDose,
    0,
    Math.max(0, agent.maxDoseGl - current),
  );
  doses[agentId] = round(current + allowed, 3);
  return allowed;
}

function buildHeuristicDoses(
  context: WaterAdjustmentContext,
): AdjustmentVector {
  const doses: AdjustmentVector = {};
  const predicted = cloneProfile(context.currentProfile);
  const targetMid = toTargetMid(context.targetRanges);

  const updatePredicted = () => {
    const next = computePredictedProfile(context.currentProfile, doses);
    predicted.ca = next.ca;
    predicted.mg = next.mg;
    predicted.na = next.na;
    predicted.so4 = next.so4;
    predicted.cl = next.cl;
    predicted.hco3 = next.hco3;
  };

  if (predicted.hco3 > context.targetRanges.hco3.max + 5) {
    const hco3ToRemove = predicted.hco3 - targetMid.hco3;
    const lacticDose = addDose(doses, "lactic-acid", (hco3ToRemove * 0.6) / 85);
    const phosphoricDose = addDose(
      doses,
      "phosphoric-acid",
      (hco3ToRemove * 0.4) / 42,
    );
    if (lacticDose > 0 || phosphoricDose > 0) {
      updatePredicted();
    }
  }

  if (predicted.hco3 < context.targetRanges.hco3.min - 5) {
    const needed = targetMid.hco3 - predicted.hco3;
    const bicarbonateShare =
      predicted.na < context.targetRanges.na.max - 10 ? 0.6 : 0.2;
    const bicarbonateDose = addDose(
      doses,
      "sodium-bicarbonate",
      (needed * bicarbonateShare) / 72.6,
    );
    const chalkDose = addDose(
      doses,
      "chalk",
      (needed * (1 - bicarbonateShare)) / 60,
    );
    if (bicarbonateDose > 0 || chalkDose > 0) {
      updatePredicted();
    }
  }

  if (predicted.so4 < context.targetRanges.so4.min - 5) {
    const needed = targetMid.so4 - predicted.so4;
    const gypsumDose = addDose(doses, "gypsum", needed / 55.8);
    if (gypsumDose > 0) {
      updatePredicted();
    }
  }

  if (predicted.cl < context.targetRanges.cl.min - 5) {
    const needed = targetMid.cl - predicted.cl;
    const chlorideDose = addDose(doses, "calcium-chloride", needed / 63.9);
    if (chlorideDose > 0) {
      updatePredicted();
    }
  }

  if (predicted.mg < context.targetRanges.mg.min - 2) {
    const needed = targetMid.mg - predicted.mg;
    const useEpsom = predicted.so4 <= targetMid.so4;
    const agentId = useEpsom ? "epsom" : "magnesium-chloride";
    const contribution = useEpsom ? 9.9 : 12;
    const mgDose = addDose(doses, agentId, needed / contribution);
    if (mgDose > 0) {
      updatePredicted();
    }
  }

  if (predicted.ca < context.targetRanges.ca.min - 5) {
    const needed = targetMid.ca - predicted.ca;
    let caDose = 0;

    if (predicted.cl < targetMid.cl) {
      caDose = addDose(doses, "calcium-chloride", needed / 36.1);
    }

    if (!caDose && predicted.so4 < targetMid.so4) {
      caDose = addDose(doses, "gypsum", needed / 23.3);
    }

    if (!caDose) {
      caDose = addDose(doses, "chalk", needed / 20);
    }

    if (caDose > 0) {
      updatePredicted();
    }
  }

  return doses;
}

function buildProDoses(context: WaterAdjustmentContext): AdjustmentVector {
  const doses: AdjustmentVector = {};
  const stepGl = 0.02;
  const maxIterations = 320;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const currentProfile = computePredictedProfile(
      context.currentProfile,
      doses,
    );
    const currentScore = computeRangeScore(
      currentProfile,
      context.targetRanges,
    );

    let bestAgent: WaterAdjustmentAgent | null = null;
    let bestImprovement = 0;

    for (const agent of WATER_ADJUSTMENT_AGENTS) {
      const currentDose = doses[agent.id] ?? 0;
      if (currentDose + stepGl > agent.maxDoseGl) {
        continue;
      }

      const nextDoses: AdjustmentVector = {
        ...doses,
        [agent.id]: currentDose + stepGl,
      };
      const nextProfile = computePredictedProfile(
        context.currentProfile,
        nextDoses,
      );
      const nextScore = computeRangeScore(nextProfile, context.targetRanges);
      const improvement = currentScore - nextScore;

      if (improvement > bestImprovement) {
        bestImprovement = improvement;
        bestAgent = agent;
      }
    }

    if (!bestAgent || bestImprovement <= 0.0005) {
      break;
    }

    doses[bestAgent.id] = round((doses[bestAgent.id] ?? 0) + stepGl, 3);
  }

  return doses;
}

function buildPlanResult(
  mode: WaterAdjustmentMode,
  context: WaterAdjustmentContext,
  doses: AdjustmentVector,
): WaterAdjustmentPlanResult {
  const predictedProfile = computePredictedProfile(
    context.currentProfile,
    doses,
  );
  const recommendations = toRecommendations(doses);
  const ionStatuses = toIonStatuses(
    context.currentProfile,
    context.targetRanges,
    predictedProfile,
  );

  const feasibility = evaluateFeasibility(
    predictedProfile,
    context.targetRanges,
  );
  const alternatives = feasibility.feasible
    ? []
    : chooseBestAlternatives(context.targetRanges);

  const summary = feasibility.feasible
    ? "Le profil cible est atteignable avec les ajustements proposés."
    : "Le profil cible reste difficile à atteindre uniquement par ajustements: alternatives recommandées.";

  return {
    mode,
    title:
      mode === "heuristic"
        ? "Mode standard (heuristique lisible)"
        : "Mode pro (solveur d'optimisation)",
    feasible: feasibility.feasible,
    summary,
    ionStatuses,
    recommendations,
    warnings: feasibility.warnings,
    alternatives,
  };
}

export function listWaterAdjustmentAgents(): WaterAdjustmentAgent[] {
  return WATER_ADJUSTMENT_AGENTS.map((agent) => ({ ...agent }));
}

export function getIonLabel(ion: EauIonKey): string {
  return ION_LABELS[ion];
}

export function calculateHeuristicWaterAdjustments(
  context: WaterAdjustmentContext,
): WaterAdjustmentPlanResult {
  return buildPlanResult("heuristic", context, buildHeuristicDoses(context));
}

export function calculateProWaterAdjustments(
  context: WaterAdjustmentContext,
): WaterAdjustmentPlanResult {
  return buildPlanResult("pro", context, buildProDoses(context));
}
