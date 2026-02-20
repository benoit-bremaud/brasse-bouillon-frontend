import * as Haptics from "expo-haptics";

import {
  calculateResidualAlkalinity,
  calculateSulfateChlorideRatio,
} from "@/core/brewing-calculations";
import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import {
  calculateHeuristicWaterAdjustments,
  getIonLabel,
} from "@/features/tools/application/eau-adjustments.use-cases";
import {
  getWaterProfileByLocation,
  listDemoWaterLocationOptions,
} from "@/features/tools/application/eau.use-cases";
import {
  EauProfile,
  EauTargetRanges,
  WaterAdjustmentPlanResult,
  WaterAdjustmentRecommendation,
} from "@/features/tools/domain/eau.types";
import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { dataSource } from "@/core/data/data-source";
import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { useMutation } from "@tanstack/react-query";

type TabName = "profil" | "style" | "sels";

type WaterRating = {
  label: string;
  description: string;
  color: string;
};

type IonRange = { min: number; max: number };

type StylePreset = {
  name: string;
  description: string;
  ca: IonRange;
  mg: IonRange;
  na: IonRange;
  so4: IonRange;
  cl: IonRange;
  hco3: IonRange;
};

type SaltReference = {
  name: string;
  formula: string;
  ca?: number;
  mg?: number;
  na?: number;
  so4?: number;
  cl?: number;
  hco3?: number;
  note: string;
};

const STYLE_PRESETS: StylePreset[] = [
  {
    name: "Pilsner / Lager",
    description: "Eau très douce, bicarbonates très faibles",
    ca: { min: 30, max: 80 },
    mg: { min: 5, max: 20 },
    na: { min: 0, max: 50 },
    so4: { min: 20, max: 80 },
    cl: { min: 20, max: 80 },
    hco3: { min: 0, max: 50 },
  },
  {
    name: "Pale Ale / Blonde",
    description: "Profil équilibré, légèrement houblonné",
    ca: { min: 50, max: 150 },
    mg: { min: 5, max: 25 },
    na: { min: 0, max: 75 },
    so4: { min: 50, max: 150 },
    cl: { min: 30, max: 100 },
    hco3: { min: 0, max: 100 },
  },
  {
    name: "IPA",
    description: "Profil sec, SO₄ élevé, houblon mis en avant",
    ca: { min: 75, max: 150 },
    mg: { min: 5, max: 25 },
    na: { min: 0, max: 50 },
    so4: { min: 100, max: 300 },
    cl: { min: 50, max: 100 },
    hco3: { min: 0, max: 50 },
  },
  {
    name: "Amber / Maltée",
    description: "Cl élevé, profil rond et malté",
    ca: { min: 50, max: 150 },
    mg: { min: 5, max: 20 },
    na: { min: 0, max: 75 },
    so4: { min: 30, max: 100 },
    cl: { min: 50, max: 150 },
    hco3: { min: 50, max: 150 },
  },
  {
    name: "Stout / Porter",
    description: "Bicarbonates élevés, profil foncé et corsé",
    ca: { min: 50, max: 150 },
    mg: { min: 5, max: 25 },
    na: { min: 0, max: 75 },
    so4: { min: 30, max: 100 },
    cl: { min: 50, max: 150 },
    hco3: { min: 100, max: 250 },
  },
];

const SALT_REFERENCES: SaltReference[] = [
  {
    name: "Gypse",
    formula: "CaSO₄·2H₂O",
    ca: 23.3,
    so4: 55.8,
    note: "Augmente sécheresse et perception de l'amertume",
  },
  {
    name: "Chlorure de calcium",
    formula: "CaCl₂ (anhydre)",
    ca: 36.1,
    cl: 63.9,
    note: "Renforce rondeur et expression maltée",
  },
  {
    name: "Sel d'Epsom",
    formula: "MgSO₄·7H₂O",
    mg: 9.9,
    so4: 39.3,
    note: "Nutriment levure, léger goût amer en excès",
  },
  {
    name: "Sel de table",
    formula: "NaCl",
    na: 39.3,
    cl: 60.7,
    note: "Rondeur à petite dose — limiter Na à 75 ppm",
  },
  {
    name: "Bicarbonate de soude",
    formula: "NaHCO₃",
    na: 27.4,
    hco3: 72.6,
    note: "Remonte le pH, utile pour bières foncées",
  },
  {
    name: "Craie",
    formula: "CaCO₃",
    ca: 20.0,
    hco3: 60.0,
    note: "Peu soluble — ajouter directement dans le mash",
  },
];

function getRaRating(ra: number): WaterRating {
  if (ra < -25) {
    return {
      label: "Très douce",
      description: "Idéale pour Pilsner / Lager",
      color: colors.semantic.info,
    };
  }
  if (ra < 25) {
    return {
      label: "Douce",
      description: "Idéale pour styles pâles",
      color: colors.semantic.success,
    };
  }
  if (ra < 75) {
    return {
      label: "Modérée",
      description: "Bières ambrées / équilibrées",
      color: colors.semantic.warning,
    };
  }
  if (ra < 150) {
    return {
      label: "Élevée",
      description: "Bières foncées (Stout, Porter)",
      color: colors.brand.secondary,
    };
  }
  return {
    label: "Très élevée",
    description: "À réduire par dilution/osmose",
    color: colors.semantic.error,
  };
}

function getRatioRating(ratio: number, hasNoChloride: boolean): WaterRating {
  if (hasNoChloride) {
    return {
      label: "Indéfini",
      description: "Chlorures nuls",
      color: colors.neutral.muted,
    };
  }
  if (ratio < 0.5) {
    return {
      label: "Très rond",
      description: "Profil très malté (Stout, Porter)",
      color: colors.brand.primary,
    };
  }
  if (ratio < 1.5) {
    return {
      label: "Rond / Équilibré",
      description: "Profil malté (Amber, Lager)",
      color: colors.semantic.success,
    };
  }
  if (ratio < 3) {
    return {
      label: "Équilibré",
      description: "Profil intermédiaire (Pale Ale)",
      color: colors.semantic.warning,
    };
  }
  if (ratio < 8) {
    return {
      label: "Sec / Houblonné",
      description: "Profil IPA (sec, amer)",
      color: colors.brand.secondary,
    };
  }
  return {
    label: "Très sec",
    description: "Très hop-forward (DIPA, Bitter)",
    color: colors.semantic.error,
  };
}

function isInRange(value: number, range: IonRange): boolean {
  return value >= range.min && value <= range.max;
}

function parseIon(text: string): number {
  const parsed = parseFloat(text);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function formatNullableNumber(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  return value.toFixed(1);
}

function sanitizeNumericInput(text: string): string {
  return text.replace(/[^0-9]/g, "");
}

function sanitizeCommuneInput(text: string): string {
  return text.replace(/\s+/g, " ").trimStart();
}

function toTargetRanges(preset: StylePreset): EauTargetRanges {
  return {
    ca: preset.ca,
    mg: preset.mg,
    na: preset.na,
    so4: preset.so4,
    cl: preset.cl,
    hco3: preset.hco3,
  };
}

function formatDoseByVolume(
  recommendation: WaterAdjustmentRecommendation,
): string {
  return recommendation.doseByVolume
    .map((dose) => `${dose.liters}L: ${dose.grams} g`)
    .join(" · ");
}

export function EauCalculatorScreen() {
  const [activeTab, setActiveTab] = useState<TabName>("profil");

  // Water lookup
  const [postalCodeText, setPostalCodeText] = useState("");
  const [communeText, setCommuneText] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<EauProfile | null>(null);
  const [naNeedsManualInput, setNaNeedsManualInput] = useState(false);

  // Ion values (in ppm)
  const [caText, setCaText] = useState("75");
  const [mgText, setMgText] = useState("10");
  const [naText, setNaText] = useState("20");
  const [so4Text, setSo4Text] = useState("150");
  const [clText, setClText] = useState("75");
  const [hco3Text, setHco3Text] = useState("50");

  // Style tab
  const [styleIndex, setStyleIndex] = useState(0);
  const [adjustmentPlan, setAdjustmentPlan] =
    useState<WaterAdjustmentPlanResult | null>(null);

  const handleTabChange = useCallback((tab: TabName) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleStyleChange = useCallback((index: number) => {
    setStyleIndex(index);
    setAdjustmentPlan(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const waterLookupMutation = useMutation({
    mutationFn: getWaterProfileByLocation,
    onMutate: () => {
      setLookupError(null);
      setLookupResult(null);
    },
    onSuccess: (profile) => {
      setLookupResult(profile);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      setLookupError(
        getErrorMessage(error, "Impossible de récupérer le profil eau."),
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const canSearchWater =
    postalCodeText.trim().length === 5 && communeText.trim().length > 1;

  const isDemoDataMode = dataSource.useDemoData;
  const demoWaterLocations = isDemoDataMode
    ? listDemoWaterLocationOptions()
    : [];

  const handleSelectDemoLocation = useCallback(
    (codePostal: string, commune: string) => {
      setPostalCodeText(codePostal);
      setCommuneText(commune);
      setLookupError(null);
      setLookupResult(null);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [],
  );

  const handleSearchWater = useCallback(() => {
    const payload = {
      codePostal: postalCodeText.trim(),
      commune: communeText.trim(),
    };

    waterLookupMutation.mutate(payload);
  }, [communeText, postalCodeText, waterLookupMutation]);

  const handleApplyWaterProfile = useCallback(() => {
    if (!lookupResult) {
      return;
    }

    setCaText(
      lookupResult.minerauxMgL.ca === null
        ? ""
        : String(lookupResult.minerauxMgL.ca),
    );
    setMgText(
      lookupResult.minerauxMgL.mg === null
        ? ""
        : String(lookupResult.minerauxMgL.mg),
    );
    setSo4Text(
      lookupResult.minerauxMgL.so4 === null
        ? ""
        : String(lookupResult.minerauxMgL.so4),
    );
    setClText(
      lookupResult.minerauxMgL.cl === null
        ? ""
        : String(lookupResult.minerauxMgL.cl),
    );
    setHco3Text(
      lookupResult.minerauxMgL.hco3 === null
        ? ""
        : String(lookupResult.minerauxMgL.hco3),
    );

    setNaText("");
    setNaNeedsManualInput(true);
    setActiveTab("profil");

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [lookupResult]);

  // Live calculations
  const ca = parseIon(caText);
  const mg = parseIon(mgText);
  const na = parseIon(naText);
  const so4 = parseIon(so4Text);
  const cl = parseIon(clText);
  const hco3 = parseIon(hco3Text);
  const hasNoChloride = cl === 0;

  const ra = calculateResidualAlkalinity(hco3, ca, mg);
  const ratio = calculateSulfateChlorideRatio(so4, cl);
  const raRating = getRaRating(ra);
  const ratioRating = getRatioRating(ratio, hasNoChloride);

  const currentPreset = STYLE_PRESETS[styleIndex];
  const ionRows = [
    {
      label: "Calcium (Ca²⁺)",
      unit: "ppm",
      value: ca,
      range: currentPreset.ca,
    },
    {
      label: "Magnésium (Mg²⁺)",
      unit: "ppm",
      value: mg,
      range: currentPreset.mg,
    },
    { label: "Sodium (Na⁺)", unit: "ppm", value: na, range: currentPreset.na },
    {
      label: "Sulfates (SO₄²⁻)",
      unit: "ppm",
      value: so4,
      range: currentPreset.so4,
    },
    {
      label: "Chlorures (Cl⁻)",
      unit: "ppm",
      value: cl,
      range: currentPreset.cl,
    },
    {
      label: "Bicarbonates (HCO₃⁻)",
      unit: "ppm",
      value: hco3,
      range: currentPreset.hco3,
    },
  ];

  const handleGenerateAdjustments = useCallback(() => {
    const plan = calculateHeuristicWaterAdjustments({
      currentProfile: { ca, mg, na, so4, cl, hco3 },
      targetRanges: toTargetRanges(currentPreset),
    });

    setAdjustmentPlan(plan);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [ca, cl, currentPreset, hco3, mg, na, so4]);

  return (
    <Screen>
      <ListHeader
        title="💧 Calculs Eau de brassage"
        subtitle="Profil ionique et alkalinité résiduelle"
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === "profil" && styles.tabActive]}
          onPress={() => handleTabChange("profil")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "profil" && styles.tabTextActive,
            ]}
          >
            Profil
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "style" && styles.tabActive]}
          onPress={() => handleTabChange("style")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "style" && styles.tabTextActive,
            ]}
          >
            Style
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "sels" && styles.tabActive]}
          onPress={() => handleTabChange("sels")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sels" && styles.tabTextActive,
            ]}
          >
            Sels
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ── TAB PROFIL ── */}
        {activeTab === "profil" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Trouver mon eau</Text>
              <Text style={styles.cardSubtitle}>
                Recherchez les caractéristiques de l'eau via code postal et
                commune
              </Text>

              {isDemoDataMode ? (
                <View style={styles.demoLocationContainer}>
                  <Text style={styles.inputLabel}>Zones démo disponibles</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.demoLocationList}
                  >
                    {demoWaterLocations.map((location) => (
                      <Pressable
                        key={location.id}
                        style={styles.demoLocationChip}
                        onPress={() =>
                          handleSelectDemoLocation(
                            location.codePostal,
                            location.commune,
                          )
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Zone démo ${location.label}`}
                      >
                        <Text style={styles.demoLocationChipText}>
                          {location.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              <View style={styles.lookupRow}>
                <View style={styles.lookupFieldPostal}>
                  <Text style={styles.inputLabel}>Code postal</Text>
                  <TextInput
                    style={styles.textInput}
                    value={postalCodeText}
                    onChangeText={(text) =>
                      setPostalCodeText(sanitizeNumericInput(text).slice(0, 5))
                    }
                    keyboardType="number-pad"
                    placeholder="57970"
                    maxLength={5}
                    accessibilityLabel="Code postal"
                  />
                </View>

                <View style={styles.lookupFieldCommune}>
                  <Text style={styles.inputLabel}>Commune</Text>
                  <TextInput
                    style={styles.textInput}
                    value={communeText}
                    onChangeText={(text) =>
                      setCommuneText(sanitizeCommuneInput(text))
                    }
                    placeholder="Yutz"
                    accessibilityLabel="Commune"
                  />
                </View>
              </View>

              <PrimaryButton
                label={
                  waterLookupMutation.isPending
                    ? "Recherche en cours..."
                    : "Rechercher mon eau"
                }
                onPress={handleSearchWater}
                disabled={!canSearchWater || waterLookupMutation.isPending}
              />

              {lookupError ? (
                <Text style={styles.lookupErrorText}>{lookupError}</Text>
              ) : null}
            </Card>

            {lookupResult ? (
              <Card style={styles.card}>
                <Text style={styles.cardTitle}>Profil trouvé</Text>

                <View style={styles.lookupMetaRow}>
                  <Text style={styles.lookupMetaLabel}>Réseau</Text>
                  <Text style={styles.lookupMetaValue}>
                    {lookupResult.nomReseau || "—"}
                  </Text>
                </View>
                <View style={styles.lookupMetaRow}>
                  <Text style={styles.lookupMetaLabel}>Conformité</Text>
                  <Text style={styles.lookupMetaValue}>
                    {lookupResult.conformite}
                  </Text>
                </View>
                <View style={styles.lookupMetaRow}>
                  <Text style={styles.lookupMetaLabel}>Prélèvements</Text>
                  <Text style={styles.lookupMetaValue}>
                    {lookupResult.nbPrelevements}
                  </Text>
                </View>
                <View style={styles.lookupMetaRow}>
                  <Text style={styles.lookupMetaLabel}>Dureté (°f)</Text>
                  <Text style={styles.lookupMetaValue}>
                    {formatNullableNumber(lookupResult.dureteFrancais)}
                  </Text>
                </View>

                <View style={styles.lookupMineralsGrid}>
                  <View style={styles.lookupMineralItem}>
                    <Text style={styles.lookupMineralLabel}>Ca</Text>
                    <Text style={styles.lookupMineralValue}>
                      {formatNullableNumber(lookupResult.minerauxMgL.ca)}
                    </Text>
                  </View>
                  <View style={styles.lookupMineralItem}>
                    <Text style={styles.lookupMineralLabel}>Mg</Text>
                    <Text style={styles.lookupMineralValue}>
                      {formatNullableNumber(lookupResult.minerauxMgL.mg)}
                    </Text>
                  </View>
                  <View style={styles.lookupMineralItem}>
                    <Text style={styles.lookupMineralLabel}>SO₄</Text>
                    <Text style={styles.lookupMineralValue}>
                      {formatNullableNumber(lookupResult.minerauxMgL.so4)}
                    </Text>
                  </View>
                  <View style={styles.lookupMineralItem}>
                    <Text style={styles.lookupMineralLabel}>Cl</Text>
                    <Text style={styles.lookupMineralValue}>
                      {formatNullableNumber(lookupResult.minerauxMgL.cl)}
                    </Text>
                  </View>
                  <View style={styles.lookupMineralItem}>
                    <Text style={styles.lookupMineralLabel}>HCO₃</Text>
                    <Text style={styles.lookupMineralValue}>
                      {formatNullableNumber(lookupResult.minerauxMgL.hco3)}
                    </Text>
                  </View>
                </View>

                <PrimaryButton
                  label="Appliquer ce profil"
                  onPress={handleApplyWaterProfile}
                  style={styles.applyButton}
                />
              </Card>
            ) : null}

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Profil ionique (ppm)</Text>
              <Text style={styles.cardSubtitle}>
                Saisissez les concentrations de votre eau en mg/L
              </Text>

              {naNeedsManualInput ? (
                <Text style={styles.naHintText}>
                  Le sodium (Na⁺) n'est pas fourni par la source. Merci de le
                  saisir manuellement.
                </Text>
              ) : null}

              <View style={styles.ionGrid}>
                <View style={styles.ionField}>
                  <Text style={styles.ionLabel}>Calcium (Ca²⁺)</Text>
                  <TextInput
                    style={styles.ionInput}
                    value={caText}
                    onChangeText={setCaText}
                    keyboardType="numeric"
                    placeholder="75"
                    accessibilityLabel="Calcium en ppm"
                  />
                  <Text style={styles.ionUnit}>ppm</Text>
                </View>

                <View style={styles.ionField}>
                  <Text style={styles.ionLabel}>Magnésium (Mg²⁺)</Text>
                  <TextInput
                    style={styles.ionInput}
                    value={mgText}
                    onChangeText={setMgText}
                    keyboardType="numeric"
                    placeholder="10"
                    accessibilityLabel="Magnésium en ppm"
                  />
                  <Text style={styles.ionUnit}>ppm</Text>
                </View>

                <View style={styles.ionField}>
                  <Text style={styles.ionLabel}>Sodium (Na⁺)</Text>
                  <TextInput
                    style={styles.ionInput}
                    value={naText}
                    onChangeText={setNaText}
                    keyboardType="numeric"
                    placeholder="20"
                    accessibilityLabel="Sodium en ppm"
                  />
                  <Text style={styles.ionUnit}>ppm</Text>
                </View>

                <View style={styles.ionField}>
                  <Text style={styles.ionLabel}>Sulfates (SO₄²⁻)</Text>
                  <TextInput
                    style={styles.ionInput}
                    value={so4Text}
                    onChangeText={setSo4Text}
                    keyboardType="numeric"
                    placeholder="150"
                    accessibilityLabel="Sulfates en ppm"
                  />
                  <Text style={styles.ionUnit}>ppm</Text>
                </View>

                <View style={styles.ionField}>
                  <Text style={styles.ionLabel}>Chlorures (Cl⁻)</Text>
                  <TextInput
                    style={styles.ionInput}
                    value={clText}
                    onChangeText={setClText}
                    keyboardType="numeric"
                    placeholder="75"
                    accessibilityLabel="Chlorures en ppm"
                  />
                  <Text style={styles.ionUnit}>ppm</Text>
                </View>

                <View style={styles.ionField}>
                  <Text style={styles.ionLabel}>Bicarbonates (HCO₃⁻)</Text>
                  <TextInput
                    style={styles.ionInput}
                    value={hco3Text}
                    onChangeText={setHco3Text}
                    keyboardType="numeric"
                    placeholder="50"
                    accessibilityLabel="Bicarbonates en ppm"
                  />
                  <Text style={styles.ionUnit}>ppm</Text>
                </View>
              </View>
            </Card>

            {/* RA Result */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Alkalinité résiduelle (RA)</Text>
              <View
                style={[
                  styles.ratingBadge,
                  { backgroundColor: raRating.color },
                ]}
              >
                <Text style={styles.ratingValue}>{ra.toFixed(1)}</Text>
                <Text style={styles.ratingUnit}>ppm</Text>
              </View>
              <View style={styles.ratingInfo}>
                <Text style={styles.ratingLabel}>{raRating.label}</Text>
                <Text style={styles.ratingDescription}>
                  {raRating.description}
                </Text>
              </View>
              <Text style={styles.formulaHint}>
                RA = HCO₃ − (Ca / 3,5 + Mg / 7)
              </Text>
            </Card>

            {/* SO4/Cl Ratio Result */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Rapport SO₄ / Cl</Text>
              <View
                style={[
                  styles.ratingBadge,
                  { backgroundColor: ratioRating.color },
                ]}
              >
                <Text style={styles.ratingValue}>
                  {hasNoChloride ? "—" : ratio.toFixed(2)}
                </Text>
              </View>
              <View style={styles.ratingInfo}>
                <Text style={styles.ratingLabel}>{ratioRating.label}</Text>
                <Text style={styles.ratingDescription}>
                  {ratioRating.description}
                </Text>
              </View>
              <Text style={styles.formulaHint}>
                Ratio &gt; 1 → Houblonné · Ratio &lt; 1 → Malté
              </Text>
            </Card>
          </>
        )}

        {/* ── TAB STYLE ── */}
        {activeTab === "style" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Choisir un style</Text>
              <View style={styles.presetList}>
                {STYLE_PRESETS.map((preset, index) => (
                  <Pressable
                    key={preset.name}
                    style={[
                      styles.presetItem,
                      styleIndex === index && styles.presetItemActive,
                    ]}
                    onPress={() => handleStyleChange(index)}
                  >
                    <Text
                      style={[
                        styles.presetName,
                        styleIndex === index && styles.presetNameActive,
                      ]}
                    >
                      {preset.name}
                    </Text>
                    <Text
                      style={[
                        styles.presetDescription,
                        styleIndex === index && styles.presetDescriptionActive,
                      ]}
                    >
                      {preset.description}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>
                Comparaison avec votre profil
              </Text>
              <Text style={styles.cardSubtitle}>
                Valeurs saisies dans l'onglet Profil
              </Text>

              {ionRows.map((row) => {
                const inRange = isInRange(row.value, row.range);
                return (
                  <View key={row.label} style={styles.ionCompareRow}>
                    <View style={styles.ionCompareLabelCol}>
                      <Text style={styles.ionCompareLabel}>{row.label}</Text>
                      <Text style={styles.ionCompareRange}>
                        {row.range.min}–{row.range.max} {row.unit}
                      </Text>
                    </View>
                    <View style={styles.ionCompareValueCol}>
                      <Text
                        style={[
                          styles.ionCompareValue,
                          inRange
                            ? styles.ionCompareValueOk
                            : styles.ionCompareValueOut,
                        ]}
                      >
                        {row.value} {row.unit}
                      </Text>
                      <Text style={styles.ionCompareIndicator}>
                        {inRange ? "✅" : "⚠️"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>
                Améliorer la qualité pour ce style
              </Text>
              <Text style={styles.cardSubtitle}>
                Générez des instructions d'ajustement selon votre profil actuel
              </Text>

              <PrimaryButton
                label="Générer les instructions d'ajustement"
                onPress={handleGenerateAdjustments}
              />

              {adjustmentPlan ? (
                <View style={styles.adjustmentsContainer}>
                  <View
                    style={[
                      styles.adjustmentStatusBadge,
                      adjustmentPlan.feasible
                        ? styles.adjustmentStatusFeasible
                        : styles.adjustmentStatusNotFeasible,
                    ]}
                  >
                    <Text style={styles.adjustmentStatusText}>
                      {adjustmentPlan.feasible
                        ? "Profil atteignable"
                        : "Ajustement partiel"}
                    </Text>
                  </View>

                  <Text style={styles.adjustmentSummary}>
                    {adjustmentPlan.summary}
                  </Text>

                  {adjustmentPlan.recommendations.length > 0 ? (
                    <View style={styles.adjustmentSection}>
                      <Text style={styles.adjustmentSectionTitle}>
                        Actions proposées
                      </Text>

                      {adjustmentPlan.recommendations.map((recommendation) => (
                        <View
                          key={recommendation.agentId}
                          style={styles.adjustmentItem}
                        >
                          <Text style={styles.adjustmentItemTitle}>
                            {recommendation.name} ({recommendation.formula})
                          </Text>
                          <Text style={styles.adjustmentItemText}>
                            Dose: {recommendation.doseGl.toFixed(3)} g/L
                          </Text>
                          <Text style={styles.adjustmentItemText}>
                            {formatDoseByVolume(recommendation)}
                          </Text>
                          <Text style={styles.adjustmentItemNote}>
                            {recommendation.note}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.adjustmentNeutralText}>
                      Aucun ajout recommandé pour ce profil.
                    </Text>
                  )}

                  {adjustmentPlan.warnings.length > 0 ? (
                    <View style={styles.adjustmentSection}>
                      <Text style={styles.adjustmentSectionTitle}>
                        Points de vigilance
                      </Text>

                      {adjustmentPlan.warnings.map((warning, index) => (
                        <Text
                          key={`${warning}-${index}`}
                          style={styles.adjustmentWarningText}
                        >
                          • {warning}
                        </Text>
                      ))}
                    </View>
                  ) : null}

                  {adjustmentPlan.alternatives.length > 0 ? (
                    <View style={styles.adjustmentSection}>
                      <Text style={styles.adjustmentSectionTitle}>
                        Alternatives recommandées
                      </Text>

                      {adjustmentPlan.alternatives.map((alternative) => (
                        <View
                          key={alternative.id}
                          style={styles.adjustmentItem}
                        >
                          <Text style={styles.adjustmentItemTitle}>
                            {alternative.label}
                          </Text>
                          <Text style={styles.adjustmentItemText}>
                            {alternative.description}
                          </Text>
                          <Text style={styles.adjustmentItemNote}>
                            {alternative.caution}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.adjustmentSection}>
                    <Text style={styles.adjustmentSectionTitle}>
                      Projection par ion
                    </Text>

                    {adjustmentPlan.ionStatuses.map((status) => (
                      <View key={status.ion} style={styles.ionProjectionRow}>
                        <Text style={styles.ionProjectionLabel}>
                          {getIonLabel(status.ion)}
                        </Text>
                        <Text
                          style={[
                            styles.ionProjectionValue,
                            status.inRange
                              ? styles.ionProjectionValueOk
                              : styles.ionProjectionValueOut,
                          ]}
                        >
                          {status.current} → {status.predicted} ppm
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </Card>
          </>
        )}

        {/* ── TAB SELS ── */}
        {activeTab === "sels" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Sels de brassage</Text>
              <Text style={styles.cardSubtitle}>
                Contributions ioniques par g/L ajouté (pour 1 L d'eau)
              </Text>
            </Card>

            {SALT_REFERENCES.map((salt) => (
              <Card key={salt.name} style={styles.saltCard}>
                <View style={styles.saltHeader}>
                  <Text style={styles.saltName}>{salt.name}</Text>
                  <Text style={styles.saltFormula}>{salt.formula}</Text>
                </View>

                <View style={styles.saltContributions}>
                  {salt.ca !== undefined && (
                    <View style={styles.saltIonChip}>
                      <Text style={styles.saltIonLabel}>Ca²⁺</Text>
                      <Text style={styles.saltIonValue}>+{salt.ca}</Text>
                    </View>
                  )}
                  {salt.mg !== undefined && (
                    <View style={styles.saltIonChip}>
                      <Text style={styles.saltIonLabel}>Mg²⁺</Text>
                      <Text style={styles.saltIonValue}>+{salt.mg}</Text>
                    </View>
                  )}
                  {salt.na !== undefined && (
                    <View style={styles.saltIonChip}>
                      <Text style={styles.saltIonLabel}>Na⁺</Text>
                      <Text style={styles.saltIonValue}>+{salt.na}</Text>
                    </View>
                  )}
                  {salt.so4 !== undefined && (
                    <View style={styles.saltIonChip}>
                      <Text style={styles.saltIonLabel}>SO₄²⁻</Text>
                      <Text style={styles.saltIonValue}>+{salt.so4}</Text>
                    </View>
                  )}
                  {salt.cl !== undefined && (
                    <View style={styles.saltIonChip}>
                      <Text style={styles.saltIonLabel}>Cl⁻</Text>
                      <Text style={styles.saltIonValue}>+{salt.cl}</Text>
                    </View>
                  )}
                  {salt.hco3 !== undefined && (
                    <View style={styles.saltIonChip}>
                      <Text style={styles.saltIonLabel}>HCO₃⁻</Text>
                      <Text style={styles.saltIonValue}>+{salt.hco3}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.saltNote}>{salt.note}</Text>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: spacing.xxs,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.brand.primary,
  },
  tabText: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textSecondary,
  },
  tabTextActive: {
    color: colors.neutral.white,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.size.body,
    color: colors.neutral.textPrimary,
    backgroundColor: colors.neutral.white,
  },
  lookupRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  demoLocationContainer: {
    marginBottom: spacing.sm,
  },
  demoLocationList: {
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  demoLocationChip: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    backgroundColor: colors.brand.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  demoLocationChipText: {
    fontSize: typography.size.caption,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
  },
  lookupFieldPostal: {
    flex: 2,
  },
  lookupFieldCommune: {
    flex: 3,
  },
  lookupErrorText: {
    marginTop: spacing.xs,
    color: colors.semantic.error,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },
  lookupMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  lookupMetaLabel: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
  },
  lookupMetaValue: {
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
  },
  lookupMineralsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  lookupMineralItem: {
    backgroundColor: colors.semantic.info,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 82,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  lookupMineralLabel: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  lookupMineralValue: {
    marginTop: 2,
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.bold,
  },
  applyButton: {
    marginTop: spacing.xs,
  },
  naHintText: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.semantic.warning,
    backgroundColor: colors.brand.background,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  // Ion grid (Profil tab)
  ionGrid: {
    gap: spacing.sm,
  },
  ionField: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  ionLabel: {
    flex: 1,
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  ionInput: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    width: 72,
    textAlign: "center",
    fontSize: typography.size.body,
    color: colors.neutral.textPrimary,
  },
  ionUnit: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    width: 28,
  },
  // Rating badge
  ratingBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
    alignSelf: "flex-start",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  ratingValue: {
    fontSize: 28,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },
  ratingUnit: {
    fontSize: typography.size.label,
    color: colors.neutral.white,
  },
  ratingInfo: {
    marginBottom: spacing.xs,
  },
  ratingLabel: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  ratingDescription: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  formulaHint: {
    fontSize: typography.size.caption,
    color: colors.neutral.muted,
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
  adjustmentsContainer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  adjustmentStatusBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    alignSelf: "flex-start",
  },
  adjustmentStatusFeasible: {
    backgroundColor: colors.semantic.success,
  },
  adjustmentStatusNotFeasible: {
    backgroundColor: colors.semantic.warning,
  },
  adjustmentStatusText: {
    color: colors.neutral.white,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.caption,
  },
  adjustmentSummary: {
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
  },
  adjustmentSection: {
    gap: spacing.xs,
  },
  adjustmentSectionTitle: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  adjustmentItem: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: spacing.xxs,
    backgroundColor: colors.neutral.white,
  },
  adjustmentItemTitle: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  adjustmentItemText: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  adjustmentItemNote: {
    fontSize: typography.size.caption,
    color: colors.neutral.muted,
    fontStyle: "italic",
  },
  adjustmentNeutralText: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontStyle: "italic",
  },
  adjustmentWarningText: {
    fontSize: typography.size.caption,
    color: colors.semantic.error,
  },
  ionProjectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    paddingVertical: spacing.xs,
  },
  ionProjectionLabel: {
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
  },
  ionProjectionValue: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },
  ionProjectionValueOk: {
    color: colors.semantic.success,
  },
  ionProjectionValueOut: {
    color: colors.semantic.error,
  },
  // Style presets
  presetList: {
    gap: spacing.xs,
  },
  presetItem: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
  },
  presetItemActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  presetName: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  presetNameActive: {
    color: colors.neutral.white,
  },
  presetDescription: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  presetDescriptionActive: {
    color: colors.neutral.white,
  },
  // Ion comparison rows (Style tab)
  ionCompareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  ionCompareLabelCol: {
    flex: 1,
  },
  ionCompareLabel: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  ionCompareRange: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  ionCompareValueCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  ionCompareValue: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },
  ionCompareValueOk: {
    color: colors.semantic.success,
  },
  ionCompareValueOut: {
    color: colors.semantic.error,
  },
  ionCompareIndicator: {
    fontSize: typography.size.body,
  },
  // Salt cards (Sels tab)
  saltCard: {
    marginBottom: spacing.sm,
  },
  saltHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: spacing.sm,
  },
  saltName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  saltFormula: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontStyle: "italic",
  },
  saltContributions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  saltIonChip: {
    backgroundColor: colors.brand.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  saltIonLabel: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontWeight: typography.weight.medium,
  },
  saltIonValue: {
    fontSize: typography.size.caption,
    color: colors.brand.secondary,
    fontWeight: typography.weight.bold,
  },
  saltNote: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontStyle: "italic",
  },
});
