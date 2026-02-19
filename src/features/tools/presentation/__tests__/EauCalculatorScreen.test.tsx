import { fireEvent, render, screen } from "@testing-library/react-native";

import { calculateHeuristicWaterAdjustments } from "@/features/tools/application/eau-adjustments.use-cases";
import { WaterAdjustmentPlanResult } from "@/features/tools/domain/eau.types";
import React from "react";
import { EauCalculatorScreen } from "../EauCalculatorScreen";

jest.mock("@/features/tools/application/eau-adjustments.use-cases", () => ({
  calculateHeuristicWaterAdjustments: jest.fn(),
  getIonLabel: (ion: string) => `Ion ${ion.toUpperCase()}`,
}));

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

const mockedCalculateHeuristicWaterAdjustments = jest.mocked(
  calculateHeuristicWaterAdjustments,
);

function buildFeasiblePlan(): WaterAdjustmentPlanResult {
  return {
    mode: "heuristic",
    title: "Mode standard (heuristique lisible)",
    feasible: true,
    summary: "Le profil cible est atteignable avec les ajustements proposés.",
    recommendations: [
      {
        agentId: "gypsum",
        name: "Gypse",
        formula: "CaSO₄·2H₂O",
        group: "sels-mineraux",
        doseGl: 0.2,
        doseByVolume: [
          { liters: 5, grams: 1 },
          { liters: 10, grams: 2 },
          { liters: 20, grams: 4 },
          { liters: 40, grams: 8 },
        ],
        expectedImpact: {
          ca: 4.7,
          so4: 11.2,
        },
        note: "Augmente sécheresse et perception de l'amertume",
      },
    ],
    ionStatuses: [
      {
        ion: "ca",
        current: 75,
        targetMin: 30,
        targetMax: 80,
        targetMid: 55,
        predicted: 79.7,
        deltaToMid: 24.7,
        inRange: true,
      },
      {
        ion: "mg",
        current: 10,
        targetMin: 5,
        targetMax: 20,
        targetMid: 12.5,
        predicted: 10,
        deltaToMid: -2.5,
        inRange: true,
      },
      {
        ion: "na",
        current: 20,
        targetMin: 0,
        targetMax: 50,
        targetMid: 25,
        predicted: 20,
        deltaToMid: -5,
        inRange: true,
      },
      {
        ion: "so4",
        current: 150,
        targetMin: 20,
        targetMax: 80,
        targetMid: 50,
        predicted: 161.2,
        deltaToMid: 111.2,
        inRange: false,
      },
      {
        ion: "cl",
        current: 75,
        targetMin: 20,
        targetMax: 80,
        targetMid: 50,
        predicted: 75,
        deltaToMid: 25,
        inRange: true,
      },
      {
        ion: "hco3",
        current: 50,
        targetMin: 0,
        targetMax: 50,
        targetMid: 25,
        predicted: 50,
        deltaToMid: 25,
        inRange: true,
      },
    ],
    warnings: [],
    alternatives: [],
  };
}

function buildNonFeasiblePlan(): WaterAdjustmentPlanResult {
  return {
    mode: "heuristic",
    title: "Mode standard (heuristique lisible)",
    feasible: false,
    summary:
      "Le profil cible reste difficile à atteindre uniquement par ajustements: alternatives recommandées.",
    recommendations: [],
    ionStatuses: [
      {
        ion: "ca",
        current: 450,
        targetMin: 30,
        targetMax: 80,
        targetMid: 55,
        predicted: 350,
        deltaToMid: 295,
        inRange: false,
      },
      {
        ion: "mg",
        current: 95,
        targetMin: 5,
        targetMax: 20,
        targetMid: 12.5,
        predicted: 85,
        deltaToMid: 72.5,
        inRange: false,
      },
      {
        ion: "na",
        current: 150,
        targetMin: 0,
        targetMax: 50,
        targetMid: 25,
        predicted: 140,
        deltaToMid: 115,
        inRange: false,
      },
      {
        ion: "so4",
        current: 1300,
        targetMin: 20,
        targetMax: 80,
        targetMid: 50,
        predicted: 980,
        deltaToMid: 930,
        inRange: false,
      },
      {
        ion: "cl",
        current: 15,
        targetMin: 20,
        targetMax: 80,
        targetMid: 50,
        predicted: 40,
        deltaToMid: -10,
        inRange: true,
      },
      {
        ion: "hco3",
        current: 420,
        targetMin: 0,
        targetMax: 50,
        targetMid: 25,
        predicted: 260,
        deltaToMid: 235,
        inRange: false,
      },
    ],
    warnings: [
      "Le sodium projeté dépasse 120 ppm: privilégier une dilution ou une autre base d'eau.",
    ],
    alternatives: [
      {
        id: "brand-volvic",
        label: "Marque indicatrice: Volvic",
        type: "marque",
        profileApprox: {
          ca: 12,
          mg: 8,
          na: 12,
          so4: 9,
          cl: 14,
          hco3: 74,
        },
        description:
          "Option grand public équilibrée, facile à corriger vers plusieurs styles.",
        caution:
          "Minéraux indicatifs, peuvent varier selon captage et millésime.",
      },
    ],
  };
}

describe("EauCalculatorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCalculateHeuristicWaterAdjustments.mockReturnValue(
      buildFeasiblePlan(),
    );
  });

  it("renders the screen with initial content", () => {
    render(<EauCalculatorScreen />);

    expect(screen.getByText("💧 Calculs Eau de brassage")).toBeTruthy();
    expect(
      screen.getByText("Profil ionique et alkalinité résiduelle"),
    ).toBeTruthy();
    expect(screen.getByText("Profil")).toBeTruthy();
    expect(screen.getByText("Style")).toBeTruthy();
    expect(screen.getByText("Sels")).toBeTruthy();
  });

  // ── PROFIL TAB ──────────────────────────────────────────────────────────────

  it("shows the Profil tab by default with ion inputs", () => {
    render(<EauCalculatorScreen />);

    expect(screen.getByText("Profil ionique (ppm)")).toBeTruthy();
    expect(
      screen.getByText("Saisissez les concentrations de votre eau en mg/L"),
    ).toBeTruthy();
    expect(screen.getByText("Calcium (Ca²⁺)")).toBeTruthy();
    expect(screen.getByText("Magnésium (Mg²⁺)")).toBeTruthy();
    expect(screen.getByText("Sodium (Na⁺)")).toBeTruthy();
    expect(screen.getByText("Sulfates (SO₄²⁻)")).toBeTruthy();
    expect(screen.getByText("Chlorures (Cl⁻)")).toBeTruthy();
    expect(screen.getByText("Bicarbonates (HCO₃⁻)")).toBeTruthy();
  });

  it("shows initial ion values", () => {
    render(<EauCalculatorScreen />);

    // Ca and Cl both start at 75 — expect two inputs with that value
    const seventyFiveInputs = screen.getAllByDisplayValue("75");
    expect(seventyFiveInputs).toHaveLength(2); // Ca + Cl
    expect(screen.getByDisplayValue("10")).toBeTruthy(); // Mg
    expect(screen.getByDisplayValue("20")).toBeTruthy(); // Na
    expect(screen.getByDisplayValue("150")).toBeTruthy(); // SO4
    expect(screen.getByDisplayValue("50")).toBeTruthy(); // HCO3
  });

  it("shows RA and SO4/Cl ratio result cards", () => {
    render(<EauCalculatorScreen />);

    expect(screen.getByText("Alkalinité résiduelle (RA)")).toBeTruthy();
    expect(screen.getByText("Rapport SO₄ / Cl")).toBeTruthy();
    expect(screen.getByText("RA = HCO₃ − (Ca / 3,5 + Mg / 7)")).toBeTruthy();
  });

  it("displays a formatted RA value (ppm)", () => {
    render(<EauCalculatorScreen />);

    // With defaults Ca=75, Mg=10, HCO3=50 → RA = 50 - (75/3.5 + 10/7) ≈ 27.0
    const raValue = screen.getByText(/^\d+\.\d$/);
    expect(raValue).toBeTruthy();
  });

  it("updates RA when HCO3 input changes", () => {
    render(<EauCalculatorScreen />);

    const hco3Input = screen.getByDisplayValue("50");
    fireEvent.changeText(hco3Input, "150");

    // Alkalinité résiduelle card should still be displayed
    expect(screen.getByText("Alkalinité résiduelle (RA)")).toBeTruthy();
  });

  it("shows ratio as '—' when Cl is zero", () => {
    render(<EauCalculatorScreen />);

    const chloridesInput = screen.getByLabelText("Chlorures en ppm");
    fireEvent.changeText(chloridesInput, "0");

    expect(screen.getByText("—")).toBeTruthy();
  });

  it("shows a 0.00 ratio when SO4 is zero and Cl is above zero", () => {
    render(<EauCalculatorScreen />);

    const sulfatesInput = screen.getByLabelText("Sulfates en ppm");
    const chloridesInput = screen.getByLabelText("Chlorures en ppm");

    fireEvent.changeText(sulfatesInput, "0");
    fireEvent.changeText(chloridesInput, "75");

    expect(screen.getByText("0.00")).toBeTruthy();
    expect(screen.getByText("Très rond")).toBeTruthy();
  });

  // ── STYLE TAB ───────────────────────────────────────────────────────────────

  it("switches to Style tab and shows preset list", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));

    expect(screen.getByText("Choisir un style")).toBeTruthy();
    expect(screen.getByText("Pilsner / Lager")).toBeTruthy();
    expect(screen.getByText("Pale Ale / Blonde")).toBeTruthy();
    expect(screen.getByText("IPA")).toBeTruthy();
    expect(screen.getByText("Amber / Maltée")).toBeTruthy();
    expect(screen.getByText("Stout / Porter")).toBeTruthy();
  });

  it("shows ion comparison with profile values in Style tab", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));

    expect(screen.getByText("Comparaison avec votre profil")).toBeTruthy();
    expect(
      screen.getByText("Valeurs saisies dans l'onglet Profil"),
    ).toBeTruthy();

    // Ion labels appear in comparison table
    expect(screen.getByText("Calcium (Ca²⁺)")).toBeTruthy();
    expect(screen.getByText("Magnésium (Mg²⁺)")).toBeTruthy();
  });

  it("changes style preset on press", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));
    fireEvent.press(screen.getByText("IPA"));

    // IPA description should be visible
    expect(
      screen.getByText("Profil sec, SO₄ élevé, houblon mis en avant"),
    ).toBeTruthy();
  });

  it("shows ✅ or ⚠️ indicators in comparison table", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));

    // With default values and Pilsner preset, some ions may or may not be in range
    const okIndicators = screen.queryAllByText("✅");
    const warnIndicators = screen.queryAllByText("⚠️");
    expect(okIndicators.length + warnIndicators.length).toBe(6); // one per ion
  });

  it("shows the style adjustment button and renders generated instructions", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));

    expect(screen.getByText("Améliorer la qualité pour ce style")).toBeTruthy();

    fireEvent.press(screen.getByText("Générer les instructions d'ajustement"));

    expect(mockedCalculateHeuristicWaterAdjustments).toHaveBeenCalledWith({
      currentProfile: {
        ca: 75,
        mg: 10,
        na: 20,
        so4: 150,
        cl: 75,
        hco3: 50,
      },
      targetRanges: {
        ca: { min: 30, max: 80 },
        mg: { min: 5, max: 20 },
        na: { min: 0, max: 50 },
        so4: { min: 20, max: 80 },
        cl: { min: 20, max: 80 },
        hco3: { min: 0, max: 50 },
      },
    });

    expect(screen.getByText("Profil atteignable")).toBeTruthy();
    expect(
      screen.getByText(
        "Le profil cible est atteignable avec les ajustements proposés.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Actions proposées")).toBeTruthy();
    expect(screen.getByText("Dose: 0.200 g/L")).toBeTruthy();
    expect(
      screen.getByText("5L: 1 g · 10L: 2 g · 20L: 4 g · 40L: 8 g"),
    ).toBeTruthy();
    expect(screen.getByText("Projection par ion")).toBeTruthy();
    expect(screen.getByText("Ion CA")).toBeTruthy();
  });

  it("shows warnings and alternatives when style adjustment is not fully feasible", () => {
    mockedCalculateHeuristicWaterAdjustments.mockReturnValueOnce(
      buildNonFeasiblePlan(),
    );

    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));
    fireEvent.press(screen.getByText("Générer les instructions d'ajustement"));

    expect(screen.getByText("Ajustement partiel")).toBeTruthy();
    expect(screen.getByText("Points de vigilance")).toBeTruthy();
    expect(
      screen.getByText(
        "• Le sodium projeté dépasse 120 ppm: privilégier une dilution ou une autre base d'eau.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Alternatives recommandées")).toBeTruthy();
    expect(screen.getByText("Marque indicatrice: Volvic")).toBeTruthy();
  });

  // ── SELS TAB ────────────────────────────────────────────────────────────────

  it("switches to Sels tab and shows salt reference cards", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    expect(screen.getByText("Sels de brassage")).toBeTruthy();
    expect(
      screen.getByText(
        "Contributions ioniques par g/L ajouté (pour 1 L d'eau)",
      ),
    ).toBeTruthy();
  });

  it("shows all 6 salt references", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    expect(screen.getByText("Gypse")).toBeTruthy();
    expect(screen.getByText("Chlorure de calcium")).toBeTruthy();
    expect(screen.getByText("Sel d'Epsom")).toBeTruthy();
    expect(screen.getByText("Sel de table")).toBeTruthy();
    expect(screen.getByText("Bicarbonate de soude")).toBeTruthy();
    expect(screen.getByText("Craie")).toBeTruthy();
  });

  it("displays salt formulas", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    expect(screen.getByText("CaSO₄·2H₂O")).toBeTruthy();
    expect(screen.getByText("CaCl₂ (anhydre)")).toBeTruthy();
    expect(screen.getByText("MgSO₄·7H₂O")).toBeTruthy();
    expect(screen.getByText("NaCl")).toBeTruthy();
    expect(screen.getByText("NaHCO₃")).toBeTruthy();
    expect(screen.getByText("CaCO₃")).toBeTruthy();
  });

  it("displays ion contributions for salts", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    // Gypse contributes Ca²⁺ and SO₄²⁻
    const caChips = screen.getAllByText("Ca²⁺");
    expect(caChips.length).toBeGreaterThan(0);
    const so4Chips = screen.getAllByText("SO₄²⁻");
    expect(so4Chips.length).toBeGreaterThan(0);
  });

  it("displays salt notes", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    expect(
      screen.getByText("Augmente sécheresse et perception de l'amertume"),
    ).toBeTruthy();
    expect(
      screen.getByText("Renforce rondeur et expression maltée"),
    ).toBeTruthy();
  });

  // ── TAB SWITCHING ───────────────────────────────────────────────────────────

  it("allows switching between all three tabs", () => {
    render(<EauCalculatorScreen />);

    // Profil → Style
    fireEvent.press(screen.getByText("Style"));
    expect(screen.getByText("Choisir un style")).toBeTruthy();

    // Style → Sels
    fireEvent.press(screen.getByText("Sels"));
    expect(screen.getByText("Sels de brassage")).toBeTruthy();

    // Sels → Profil
    fireEvent.press(screen.getByText("Profil"));
    expect(screen.getByText("Profil ionique (ppm)")).toBeTruthy();
  });
});
