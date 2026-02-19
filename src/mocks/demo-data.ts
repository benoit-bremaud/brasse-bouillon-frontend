import {
  Batch,
  BatchStep,
  BatchSummary,
} from "@/features/batches/domain/batch.types";
import { Recipe, RecipeStep } from "@/features/recipes/domain/recipe.types";

import { User } from "@/features/auth/domain/auth.types";
import { Ingredient } from "@/features/ingredients/domain/ingredient.types";
import { EauProfile } from "@/features/tools/domain/eau.types";

export type Equipment = {
  id: string;
  name: string;
  type: "all-in-one" | "kettle" | "fermenter";
  volumeLiters: number;
  efficiencyPercent: number;
  notes?: string;
};

export const demoUsers: User[] = [
  {
    id: "u-demo-1",
    email: "marie.brasseur@example.com",
    username: "marie.brew",
    firstName: "Marie",
    lastName: "Dupont",
    role: "user",
    isActive: true,
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-08T07:00:00.000Z",
  },
  {
    id: "u-demo-2",
    email: "leo.ferment@example.com",
    username: "leo.ferment",
    firstName: "Léo",
    lastName: "Martin",
    role: "moderator",
    isActive: true,
    createdAt: "2026-01-20T09:30:00.000Z",
    updatedAt: "2026-02-05T18:20:00.000Z",
  },
  {
    id: "u-demo-3",
    email: "admin.brasse@example.com",
    username: "admin.brasse",
    firstName: "Camille",
    lastName: "Admin",
    role: "admin",
    isActive: true,
    createdAt: "2026-01-01T12:00:00.000Z",
    updatedAt: "2026-02-07T11:40:00.000Z",
  },
];

export const demoEquipments: Equipment[] = [
  {
    id: "eq-1",
    name: "Braumeister 20L",
    type: "all-in-one",
    volumeLiters: 20,
    efficiencyPercent: 72,
    notes: "Sonde température intégrée",
  },
  {
    id: "eq-2",
    name: "Cuve d’ébullition 35L",
    type: "kettle",
    volumeLiters: 35,
    efficiencyPercent: 68,
  },
  {
    id: "eq-3",
    name: "Fermenteur inox 30L",
    type: "fermenter",
    volumeLiters: 30,
    efficiencyPercent: 0,
    notes: "Thermowell + valve tri-clamp",
  },
];

export const demoIngredients: Ingredient[] = [
  {
    id: "malt-1",
    name: "Pale Ale Malt",
    category: "malt",
    origin: "France",
    supplier: "Malterie du Château",
    maltType: "base",
    ebc: 6,
    potentialSg: 1.037,
    maxPercent: 100,
  },
  {
    id: "malt-2",
    name: "Munich Malt",
    category: "malt",
    origin: "Germany",
    supplier: "Weyermann",
    maltType: "specialty",
    ebc: 20,
    potentialSg: 1.035,
    maxPercent: 60,
  },
  {
    id: "malt-3",
    name: "Caramunich II",
    category: "malt",
    origin: "Germany",
    supplier: "Weyermann",
    maltType: "caramel",
    ebc: 120,
    potentialSg: 1.034,
    maxPercent: 20,
  },
  {
    id: "malt-4",
    name: "Chocolate Malt",
    category: "malt",
    origin: "UK",
    supplier: "Crisp",
    maltType: "roasted",
    ebc: 900,
    potentialSg: 1.028,
    maxPercent: 10,
  },
  {
    id: "hop-1",
    name: "Citra",
    category: "hop",
    origin: "USA",
    supplier: "Yakima Chief",
    form: "pellet",
    hopUse: "dual",
    alphaAcid: 13,
    betaAcid: 4.5,
  },
  {
    id: "hop-2",
    name: "Saaz",
    category: "hop",
    origin: "Czech Republic",
    supplier: "Bohemia Hop",
    form: "whole",
    hopUse: "aroma",
    alphaAcid: 3.8,
    betaAcid: 4.2,
  },
  {
    id: "hop-3",
    name: "Magnum",
    category: "hop",
    origin: "Germany",
    supplier: "Hopsteiner",
    form: "pellet",
    hopUse: "bittering",
    alphaAcid: 12,
    betaAcid: 6.5,
  },
  {
    id: "hop-4",
    name: "Mosaic",
    category: "hop",
    origin: "USA",
    supplier: "Yakima Chief",
    form: "pellet",
    hopUse: "dual",
    alphaAcid: 11.5,
    betaAcid: 3.7,
  },
  {
    id: "yeast-1",
    name: "SafAle US-05",
    category: "yeast",
    origin: "France",
    supplier: "Fermentis",
    yeastType: "ale",
    attenuationMin: 78,
    attenuationMax: 82,
    flocculation: "medium",
    fermentationMinC: 18,
    fermentationMaxC: 26,
  },
  {
    id: "yeast-2",
    name: "WLP001 California Ale",
    category: "yeast",
    origin: "USA",
    supplier: "White Labs",
    yeastType: "ale",
    attenuationMin: 73,
    attenuationMax: 80,
    flocculation: "medium",
    fermentationMinC: 19,
    fermentationMaxC: 22,
  },
  {
    id: "yeast-3",
    name: "W-34/70",
    category: "yeast",
    origin: "Germany",
    supplier: "Fermentis",
    yeastType: "lager",
    attenuationMin: 80,
    attenuationMax: 84,
    flocculation: "high",
    fermentationMinC: 9,
    fermentationMaxC: 15,
  },
  {
    id: "yeast-4",
    name: "BE-256",
    category: "yeast",
    origin: "Belgium",
    supplier: "Fermentis",
    yeastType: "belgian",
    attenuationMin: 82,
    attenuationMax: 86,
    flocculation: "high",
    fermentationMinC: 18,
    fermentationMaxC: 26,
  },
];

export const demoRecipeSteps: RecipeStep[] = [
  {
    recipeId: "r-demo-1",
    stepOrder: 0,
    type: "mash",
    label: "Empâtage 67°C",
    description: "60 min à 67°C",
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-01T10:00:00.000Z",
  },
  {
    recipeId: "r-demo-1",
    stepOrder: 1,
    type: "boil",
    label: "Ébullition 60 min",
    description: "Ajout houblons à 60/15/0",
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-01T10:00:00.000Z",
  },
  {
    recipeId: "r-demo-1",
    stepOrder: 2,
    type: "fermentation",
    label: "Fermentation primaire",
    description: "10 jours à 19°C",
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-01T10:00:00.000Z",
  },
];

export const demoRecipes: Recipe[] = [
  {
    id: "r-demo-1",
    ownerId: demoUsers[0].id,
    name: "Session IPA Citra",
    description: "Houblonnée, sèche et fruitée",
    stats: {
      ibu: 42,
      abv: 5.1,
      og: 1.048,
      fg: 1.01,
      volumeLiters: 20,
      colorEbc: 11,
    },
    ingredients: [
      {
        ingredientId: "malt-1",
        amount: 4.2,
        unit: "kg",
        timing: "mash",
      },
      {
        ingredientId: "malt-2",
        amount: 0.5,
        unit: "kg",
        timing: "mash",
      },
      {
        ingredientId: "hop-3",
        amount: 18,
        unit: "g",
        timing: "boil - 60 min",
      },
      {
        ingredientId: "hop-1",
        amount: 35,
        unit: "g",
        timing: "boil - 10 min",
      },
      {
        ingredientId: "hop-4",
        amount: 40,
        unit: "g",
        timing: "whirlpool",
      },
      {
        ingredientId: "yeast-1",
        amount: 1,
        unit: "unit",
        timing: "fermentation",
        notes: "Dry pitch at 18°C",
      },
    ],
    equipment: [
      {
        equipmentId: "eq-1",
        role: "Mash & boil",
      },
      {
        equipmentId: "eq-3",
        role: "Fermentation",
      },
    ],
    visibility: "private",
    version: 1,
    rootRecipeId: "r-demo-1",
    parentRecipeId: null,
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-08T10:00:00.000Z",
  },
  {
    id: "r-demo-2",
    ownerId: demoUsers[1].id,
    name: "Witbier Orange",
    description: "Blanche légère aux agrumes",
    stats: {
      ibu: 18,
      abv: 4.8,
      og: 1.046,
      fg: 1.009,
      volumeLiters: 23,
      colorEbc: 8,
    },
    ingredients: [
      {
        ingredientId: "malt-1",
        amount: 3.6,
        unit: "kg",
        timing: "mash",
      },
      {
        ingredientId: "malt-2",
        amount: 0.8,
        unit: "kg",
        timing: "mash",
      },
      {
        ingredientId: "hop-2",
        amount: 28,
        unit: "g",
        timing: "boil - 15 min",
      },
      {
        ingredientId: "yeast-2",
        amount: 1,
        unit: "unit",
        timing: "fermentation",
      },
    ],
    equipment: [
      {
        equipmentId: "eq-2",
        role: "Boil kettle",
      },
      {
        equipmentId: "eq-3",
        role: "Fermentation",
      },
    ],
    visibility: "public",
    version: 2,
    rootRecipeId: "r-demo-2",
    parentRecipeId: null,
    createdAt: "2026-01-28T10:00:00.000Z",
    updatedAt: "2026-02-02T09:30:00.000Z",
  },
  {
    id: "r-demo-3",
    ownerId: demoUsers[2].id,
    name: "Amber Ale Maison",
    description: "Caramel + touche toastée",
    stats: {
      ibu: 29,
      abv: 5.6,
      og: 1.054,
      fg: 1.012,
      volumeLiters: 20,
      colorEbc: 26,
    },
    ingredients: [
      {
        ingredientId: "malt-1",
        amount: 3.9,
        unit: "kg",
        timing: "mash",
      },
      {
        ingredientId: "malt-3",
        amount: 0.45,
        unit: "kg",
        timing: "mash",
      },
      {
        ingredientId: "malt-4",
        amount: 0.15,
        unit: "kg",
        timing: "mash",
      },
      {
        ingredientId: "hop-3",
        amount: 20,
        unit: "g",
        timing: "boil - 60 min",
      },
      {
        ingredientId: "hop-4",
        amount: 18,
        unit: "g",
        timing: "boil - 5 min",
      },
      {
        ingredientId: "yeast-4",
        amount: 1,
        unit: "unit",
        timing: "fermentation",
      },
    ],
    equipment: [
      {
        equipmentId: "eq-1",
        role: "Mash & boil",
      },
      {
        equipmentId: "eq-3",
        role: "Fermentation",
      },
    ],
    visibility: "unlisted",
    version: 3,
    rootRecipeId: "r-demo-3",
    parentRecipeId: null,
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-02-07T08:00:00.000Z",
  },
];

export const demoBatchSteps: BatchStep[] = [
  {
    batchId: "b-demo-1",
    stepOrder: 0,
    type: "mash",
    label: "Empâtage 67°C",
    description: "Rincer doucement",
    status: "completed",
    startedAt: "2026-02-06T09:00:00.000Z",
    completedAt: "2026-02-06T10:00:00.000Z",
    createdAt: "2026-02-06T09:00:00.000Z",
    updatedAt: "2026-02-06T10:00:00.000Z",
  },
  {
    batchId: "b-demo-1",
    stepOrder: 1,
    type: "boil",
    label: "Ébullition 60 min",
    description: "Ajout houblon Citra",
    status: "in_progress",
    startedAt: "2026-02-06T10:05:00.000Z",
    completedAt: null,
    createdAt: "2026-02-06T10:05:00.000Z",
    updatedAt: "2026-02-06T10:20:00.000Z",
  },
  {
    batchId: "b-demo-1",
    stepOrder: 2,
    type: "fermentation",
    label: "Fermentation primaire",
    description: "19°C",
    status: "pending",
    startedAt: null,
    completedAt: null,
    createdAt: "2026-02-06T10:05:00.000Z",
    updatedAt: "2026-02-06T10:05:00.000Z",
  },
];

export const demoBatchSummaries: BatchSummary[] = [
  {
    id: "b-demo-1",
    ownerId: demoUsers[0].id,
    recipeId: demoRecipes[0].id,
    status: "in_progress",
    currentStepOrder: 1,
    startedAt: "2026-02-06T09:00:00.000Z",
    fermentationStartedAt: null,
    fermentationCompletedAt: null,
    completedAt: null,
    createdAt: "2026-02-06T09:00:00.000Z",
    updatedAt: "2026-02-06T10:20:00.000Z",
  },
  {
    id: "b-demo-2",
    ownerId: demoUsers[1].id,
    recipeId: demoRecipes[1].id,
    status: "completed",
    currentStepOrder: 2,
    startedAt: "2026-01-20T09:00:00.000Z",
    fermentationStartedAt: "2026-01-21T09:00:00.000Z",
    fermentationCompletedAt: "2026-01-30T09:00:00.000Z",
    completedAt: "2026-02-02T09:00:00.000Z",
    createdAt: "2026-01-20T09:00:00.000Z",
    updatedAt: "2026-02-02T09:00:00.000Z",
  },
];

export const demoBatches: Batch[] = [
  {
    ...demoBatchSummaries[0],
    steps: demoBatchSteps,
  },
  {
    ...demoBatchSummaries[1],
    steps: demoBatchSteps.map((step) => ({
      ...step,
      batchId: "b-demo-2",
      status: "completed",
    })),
  },
];

type DemoWaterProfile = {
  lookup: {
    codePostal: string;
    commune: string;
  };
  profile: EauProfile;
};

export const demoWaterProfiles: DemoWaterProfile[] = [
  {
    lookup: {
      codePostal: "13001",
      commune: "Marseille",
    },
    profile: {
      provider: "hubeau",
      codeInsee: "13055",
      annee: 2025,
      nomReseau: "MARSEILLE CENTRE",
      nbPrelevements: 16,
      conformite: "C",
      minerauxMgL: {
        ca: 86.2,
        mg: 12.7,
        cl: 47.8,
        so4: 52.4,
        hco3: 265,
      },
      dureteFrancais: 28.9,
    },
  },
  {
    lookup: {
      codePostal: "31000",
      commune: "Toulouse",
    },
    profile: {
      provider: "hubeau",
      codeInsee: "31555",
      annee: 2025,
      nomReseau: "TOULOUSE CENTRE",
      nbPrelevements: 15,
      conformite: "C",
      minerauxMgL: {
        ca: 69.2,
        mg: 5.8,
        cl: 22.6,
        so4: 29.4,
        hco3: 205,
      },
      dureteFrancais: 20.1,
    },
  },
  {
    lookup: {
      codePostal: "33000",
      commune: "Bordeaux",
    },
    profile: {
      provider: "hubeau",
      codeInsee: "33063",
      annee: 2025,
      nomReseau: "BORDEAUX METROPOLE CENTRE",
      nbPrelevements: 20,
      conformite: "C",
      minerauxMgL: {
        ca: 64.5,
        mg: 7.1,
        cl: 24.3,
        so4: 31.8,
        hco3: 198,
      },
      dureteFrancais: 19.4,
    },
  },
  {
    lookup: {
      codePostal: "35000",
      commune: "Rennes",
    },
    profile: {
      provider: "hubeau",
      codeInsee: "35238",
      annee: 2025,
      nomReseau: "RENNES METROPOLE",
      nbPrelevements: 13,
      conformite: "C",
      minerauxMgL: {
        ca: 36.4,
        mg: 4.9,
        cl: 14.2,
        so4: 18.6,
        hco3: 118,
      },
      dureteFrancais: 12.6,
    },
  },
  {
    lookup: {
      codePostal: "44000",
      commune: "Nantes",
    },
    profile: {
      provider: "hubeau",
      codeInsee: "44109",
      annee: 2025,
      nomReseau: "NANTES LOIRE",
      nbPrelevements: 17,
      conformite: "C",
      minerauxMgL: {
        ca: 41.3,
        mg: 5.2,
        cl: 17.9,
        so4: 22.4,
        hco3: 132,
      },
      dureteFrancais: 14.1,
    },
  },
  {
    lookup: {
      codePostal: "57970",
      commune: "Yutz",
    },
    profile: {
      provider: "hubeau",
      codeInsee: "57770",
      annee: 2025,
      nomReseau: "YUTZ CENTRE",
      nbPrelevements: 18,
      conformite: "C",
      minerauxMgL: {
        ca: 78.4,
        mg: 6.2,
        cl: 21.7,
        so4: 34.1,
        hco3: 246,
      },
      dureteFrancais: 22.1,
    },
  },
  {
    lookup: {
      codePostal: "67000",
      commune: "Strasbourg",
    },
    profile: {
      provider: "hubeau",
      codeInsee: "67482",
      annee: 2025,
      nomReseau: "STRASBOURG NORD",
      nbPrelevements: 14,
      conformite: "C",
      minerauxMgL: {
        ca: 62.1,
        mg: 4.4,
        cl: 18.2,
        so4: 27.5,
        hco3: 188,
      },
      dureteFrancais: 17.3,
    },
  },
  {
    lookup: {
      codePostal: "69001",
      commune: "Lyon",
    },
    profile: {
      provider: "hubeau",
      codeInsee: "69123",
      annee: 2025,
      nomReseau: "LYON RHONE CENTRE",
      nbPrelevements: 19,
      conformite: "C",
      minerauxMgL: {
        ca: 73.8,
        mg: 6.6,
        cl: 19.8,
        so4: 38.6,
        hco3: 214,
      },
      dureteFrancais: 21.7,
    },
  },
  {
    lookup: {
      codePostal: "75001",
      commune: "Paris",
    },
    profile: {
      provider: "hubeau",
      codeInsee: "75056",
      annee: 2025,
      nomReseau: "PARIS CENTRE",
      nbPrelevements: 21,
      conformite: "C",
      minerauxMgL: {
        ca: 78.9,
        mg: 6.4,
        cl: 29.1,
        so4: 35.2,
        hco3: 238,
      },
      dureteFrancais: 23.4,
    },
  },
  {
    lookup: {
      codePostal: "59000",
      commune: "Lille",
    },
    profile: {
      provider: "hubeau",
      codeInsee: "59350",
      annee: 2025,
      nomReseau: "LILLE FLANDRES",
      nbPrelevements: 18,
      conformite: "C",
      minerauxMgL: {
        ca: 92.6,
        mg: 8.9,
        cl: 36.2,
        so4: 61.7,
        hco3: 284,
      },
      dureteFrancais: 31.6,
    },
  },
];
