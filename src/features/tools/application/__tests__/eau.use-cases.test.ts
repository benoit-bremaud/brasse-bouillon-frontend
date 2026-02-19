import { getWaterProfileByLocation } from "@/features/tools/application/eau.use-cases";
import { getWaterProfileByLocationApi } from "@/features/tools/data/eau.api";

let mockUseDemoData = true;

jest.mock("@/features/tools/data/eau.api", () => ({
  getWaterProfileByLocationApi: jest.fn(),
}));

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    get useDemoData() {
      return mockUseDemoData;
    },
  },
}));

describe("eau use-cases", () => {
  beforeEach(() => {
    mockUseDemoData = true;
    jest.clearAllMocks();
  });

  it("returns demo profile when demo mode is enabled", async () => {
    const profile = await getWaterProfileByLocation({
      codePostal: "57970",
      commune: "Yutz",
    });

    expect(profile.codeInsee).toBe("57770");
    expect(profile.provider).toBe("hubeau");
    expect(getWaterProfileByLocationApi).not.toHaveBeenCalled();
  });

  it("returns another demo profile for a different department", async () => {
    const profile = await getWaterProfileByLocation({
      codePostal: "69001",
      commune: "Lyon",
    });

    expect(profile.codeInsee).toBe("69123");
    expect(profile.nomReseau).toBe("LYON RHONE CENTRE");
    expect(profile.minerauxMgL.ca).toBe(73.8);
    expect(getWaterProfileByLocationApi).not.toHaveBeenCalled();
  });

  it("throws when required fields are missing", async () => {
    await expect(
      getWaterProfileByLocation({ codePostal: "", commune: "" }),
    ).rejects.toThrow("Code postal et commune sont requis.");
  });

  it("calls API mode when demo mode is disabled", async () => {
    mockUseDemoData = false;

    const apiProfile = {
      provider: "hubeau",
      codeInsee: "67482",
      annee: 2025,
      nomReseau: "STRASBOURG NORD",
      nbPrelevements: 14,
      conformite: "C" as const,
      minerauxMgL: {
        ca: 62.1,
        mg: 4.4,
        cl: 18.2,
        so4: 27.5,
        hco3: 188,
      },
      dureteFrancais: 17.3,
    };

    jest.mocked(getWaterProfileByLocationApi).mockResolvedValue(apiProfile);

    const result = await getWaterProfileByLocation({
      codePostal: "67000",
      commune: " Strasbourg ",
    });

    expect(getWaterProfileByLocationApi).toHaveBeenCalledWith(
      expect.objectContaining({
        codePostal: "67000",
        commune: "Strasbourg",
        annee: expect.any(Number),
      }),
    );
    expect(result).toEqual(apiProfile);
  });

  it("throws not found in demo mode when lookup does not exist", async () => {
    await expect(
      getWaterProfileByLocation({
        codePostal: "99999",
        commune: "Inconnue",
      }),
    ).rejects.toThrow("Aucune donnée eau trouvée pour cette commune");
  });
});
