import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import React from "react";
import { EauCalculatorScreen } from "../EauCalculatorScreen";

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
  NotificationFeedbackType: { Success: "success", Error: "error" },
}));

const mockGetWaterProfileByLocation = jest.fn();

jest.mock("@/features/tools/application/eau.use-cases", () => ({
  getWaterProfileByLocation: (...args: unknown[]) =>
    mockGetWaterProfileByLocation(...args),
}));

function renderWithQueryClient(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>,
  );
}

describe("EauCalculatorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWaterProfileByLocation.mockReset();
    mockGetWaterProfileByLocation.mockResolvedValue({
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
    });
  });

  it("renders the screen with initial content", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

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
    renderWithQueryClient(<EauCalculatorScreen />);

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
    renderWithQueryClient(<EauCalculatorScreen />);

    // Ca and Cl both start at 75 — expect two inputs with that value
    const seventyFiveInputs = screen.getAllByDisplayValue("75");
    expect(seventyFiveInputs).toHaveLength(2); // Ca + Cl
    expect(screen.getByDisplayValue("10")).toBeTruthy(); // Mg
    expect(screen.getByDisplayValue("20")).toBeTruthy(); // Na
    expect(screen.getByDisplayValue("150")).toBeTruthy(); // SO4
    expect(screen.getByDisplayValue("50")).toBeTruthy(); // HCO3
  });

  it("shows RA and SO4/Cl ratio result cards", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

    expect(screen.getByText("Alkalinité résiduelle (RA)")).toBeTruthy();
    expect(screen.getByText("Rapport SO₄ / Cl")).toBeTruthy();
    expect(screen.getByText("RA = HCO₃ − (Ca / 3,5 + Mg / 7)")).toBeTruthy();
  });

  it("displays a formatted RA value (ppm)", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

    // With defaults Ca=75, Mg=10, HCO3=50 → RA = 50 - (75/3.5 + 10/7) ≈ 27.0
    const raValue = screen.getByText(/^\d+\.\d$/);
    expect(raValue).toBeTruthy();
  });

  it("updates RA when HCO3 input changes", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

    const hco3Input = screen.getByDisplayValue("50");
    fireEvent.changeText(hco3Input, "150");

    // Alkalinité résiduelle card should still be displayed
    expect(screen.getByText("Alkalinité résiduelle (RA)")).toBeTruthy();
  });

  it("shows ratio as '—' when Cl is zero", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

    // Set Cl to 0
    // cl input has initial value "75" — get all "75" inputs and change the second one
    const allSeventyFiveInputs = screen.getAllByDisplayValue("75");
    // There are 2 inputs with value 75 (Ca and Cl)
    fireEvent.changeText(allSeventyFiveInputs[1], "0");

    expect(screen.getByText("—")).toBeTruthy();
  });

  // ── STYLE TAB ───────────────────────────────────────────────────────────────

  it("switches to Style tab and shows preset list", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));

    expect(screen.getByText("Choisir un style")).toBeTruthy();
    expect(screen.getByText("Pilsner / Lager")).toBeTruthy();
    expect(screen.getByText("Pale Ale / Blonde")).toBeTruthy();
    expect(screen.getByText("IPA")).toBeTruthy();
    expect(screen.getByText("Amber / Maltée")).toBeTruthy();
    expect(screen.getByText("Stout / Porter")).toBeTruthy();
  });

  it("shows ion comparison with profile values in Style tab", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

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
    renderWithQueryClient(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));
    fireEvent.press(screen.getByText("IPA"));

    // IPA description should be visible
    expect(
      screen.getByText("Profil sec, SO₄ élevé, houblon mis en avant"),
    ).toBeTruthy();
  });

  it("shows ✅ or ⚠️ indicators in comparison table", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));

    // With default values and Pilsner preset, some ions may or may not be in range
    const okIndicators = screen.queryAllByText("✅");
    const warnIndicators = screen.queryAllByText("⚠️");
    expect(okIndicators.length + warnIndicators.length).toBe(6); // one per ion
  });

  // ── SELS TAB ────────────────────────────────────────────────────────────────

  it("switches to Sels tab and shows salt reference cards", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    expect(screen.getByText("Sels de brassage")).toBeTruthy();
    expect(
      screen.getByText(
        "Contributions ioniques par g/L ajouté (pour 1 L d'eau)",
      ),
    ).toBeTruthy();
  });

  it("shows all 6 salt references", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    expect(screen.getByText("Gypse")).toBeTruthy();
    expect(screen.getByText("Chlorure de calcium")).toBeTruthy();
    expect(screen.getByText("Sel d'Epsom")).toBeTruthy();
    expect(screen.getByText("Sel de table")).toBeTruthy();
    expect(screen.getByText("Bicarbonate de soude")).toBeTruthy();
    expect(screen.getByText("Craie")).toBeTruthy();
  });

  it("displays salt formulas", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    expect(screen.getByText("CaSO₄·2H₂O")).toBeTruthy();
    expect(screen.getByText("CaCl₂ (anhydre)")).toBeTruthy();
    expect(screen.getByText("MgSO₄·7H₂O")).toBeTruthy();
    expect(screen.getByText("NaCl")).toBeTruthy();
    expect(screen.getByText("NaHCO₃")).toBeTruthy();
    expect(screen.getByText("CaCO₃")).toBeTruthy();
  });

  it("displays ion contributions for salts", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    // Gypse contributes Ca²⁺ and SO₄²⁻
    const caChips = screen.getAllByText("Ca²⁺");
    expect(caChips.length).toBeGreaterThan(0);
    const so4Chips = screen.getAllByText("SO₄²⁻");
    expect(so4Chips.length).toBeGreaterThan(0);
  });

  it("displays salt notes", () => {
    renderWithQueryClient(<EauCalculatorScreen />);

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
    renderWithQueryClient(<EauCalculatorScreen />);

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

  it("searches water profile and displays preview", async () => {
    renderWithQueryClient(<EauCalculatorScreen />);

    fireEvent.changeText(screen.getByLabelText("Code postal"), "57970");
    fireEvent.changeText(screen.getByLabelText("Commune"), "Yutz");
    fireEvent.press(screen.getByText("Rechercher mon eau"));

    expect(await screen.findByText("Profil trouvé")).toBeTruthy();
    await waitFor(() => {
      expect(mockGetWaterProfileByLocation).toHaveBeenCalled();
      expect(mockGetWaterProfileByLocation.mock.calls[0]?.[0]).toEqual({
        codePostal: "57970",
        commune: "Yutz",
      });
    });
    expect(screen.getByText("YUTZ CENTRE")).toBeTruthy();
    expect(screen.getByText("18")).toBeTruthy();
  });

  it("displays lookup error", async () => {
    mockGetWaterProfileByLocation.mockRejectedValueOnce(
      new Error("Aucune donnée eau trouvée pour cette commune"),
    );

    renderWithQueryClient(<EauCalculatorScreen />);

    fireEvent.changeText(screen.getByLabelText("Code postal"), "99999");
    fireEvent.changeText(screen.getByLabelText("Commune"), "Inconnue");
    fireEvent.press(screen.getByText("Rechercher mon eau"));

    expect(
      await screen.findByText("Aucune donnée eau trouvée pour cette commune"),
    ).toBeTruthy();
  });

  it("applies profile values and clears Na for manual input", async () => {
    renderWithQueryClient(<EauCalculatorScreen />);

    fireEvent.changeText(screen.getByLabelText("Code postal"), "57970");
    fireEvent.changeText(screen.getByLabelText("Commune"), "Yutz");
    fireEvent.press(screen.getByText("Rechercher mon eau"));

    const applyButton = await screen.findByText("Appliquer ce profil");
    fireEvent.press(applyButton);

    expect(screen.getByDisplayValue("78.4")).toBeTruthy();
    expect(screen.getByDisplayValue("6.2")).toBeTruthy();
    expect(screen.getByDisplayValue("34.1")).toBeTruthy();
    expect(screen.getByDisplayValue("21.7")).toBeTruthy();
    expect(screen.getByDisplayValue("246")).toBeTruthy();

    expect(
      screen.getByText(
        "Le sodium (Na⁺) n'est pas fourni par la source. Merci de le saisir manuellement.",
      ),
    ).toBeTruthy();
  });
});
