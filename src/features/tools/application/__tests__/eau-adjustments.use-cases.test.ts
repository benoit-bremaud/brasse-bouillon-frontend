import {
  calculateHeuristicWaterAdjustments,
  calculateProWaterAdjustments,
} from "@/features/tools/application/eau-adjustments.use-cases";

describe("eau-adjustments use-cases", () => {
  it("returns a feasible adjustment plan for a close-to-target profile", () => {
    const plan = calculateHeuristicWaterAdjustments({
      currentProfile: {
        ca: 65,
        mg: 12,
        na: 20,
        so4: 90,
        cl: 60,
        hco3: 55,
      },
      targetRanges: {
        ca: { min: 50, max: 150 },
        mg: { min: 5, max: 25 },
        na: { min: 0, max: 75 },
        so4: { min: 50, max: 150 },
        cl: { min: 30, max: 100 },
        hco3: { min: 0, max: 100 },
      },
    });

    expect(plan.feasible).toBe(true);
    expect(plan.ionStatuses).toHaveLength(6);
    expect(plan.warnings).toHaveLength(0);
  });

  it("returns warnings and alternatives for a difficult profile", () => {
    const plan = calculateHeuristicWaterAdjustments({
      currentProfile: {
        ca: 450,
        mg: 95,
        na: 150,
        so4: 1300,
        cl: 15,
        hco3: 420,
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

    expect(plan.feasible).toBe(false);
    expect(plan.warnings.length).toBeGreaterThan(0);
    expect(plan.alternatives.length).toBeGreaterThan(0);
  });

  it("returns a valid optimized plan in pro mode", () => {
    const plan = calculateProWaterAdjustments({
      currentProfile: {
        ca: 75,
        mg: 8,
        na: 18,
        so4: 45,
        cl: 40,
        hco3: 140,
      },
      targetRanges: {
        ca: { min: 50, max: 150 },
        mg: { min: 5, max: 25 },
        na: { min: 0, max: 75 },
        so4: { min: 100, max: 300 },
        cl: { min: 50, max: 100 },
        hco3: { min: 0, max: 50 },
      },
    });

    expect(plan.mode).toBe("pro");
    expect(plan.ionStatuses).toHaveLength(6);
  });
});
