/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MaterialClass,
  MaterialProperties,
  MaterialSample,
  PresetMaterial,
  MATERIAL_CLASSES,
} from '../types/material';

// Standard baseline presets requested by user
export const PRESET_MATERIALS: PresetMaterial[] = [
  {
    name: 'Steel',
    description: 'Structural low-alloy carbon steel (AISI 1045)',
    expectedClass: 'Metal',
    properties: {
      density: 7.85,
      tensileStrength: 600,
      hardness: 50,
      meltingPoint: 1450,
      youngsModulus: 200,
      thermalConductivity: 50,
    },
  },
  {
    name: 'Nylon',
    description: 'Polyamide-66 semicrystalline engineering thermoplastic',
    expectedClass: 'Polymer',
    properties: {
      density: 1.14,
      tensileStrength: 75,
      hardness: 15,
      meltingPoint: 220,
      youngsModulus: 2.8,
      thermalConductivity: 0.25,
    },
  },
  {
    name: 'Alumina',
    description: 'Aluminum oxide (Al₂O₃ 99.5%) technical ceramic',
    expectedClass: 'Ceramic',
    properties: {
      density: 3.95,
      tensileStrength: 300,
      hardness: 85,
      meltingPoint: 2050,
      youngsModulus: 370,
      thermalConductivity: 30,
    },
  },
  {
    name: 'Carbon fibre epoxy',
    description: 'High-modulus carbon-fiber reinforced polymer (CFRP)',
    expectedClass: 'Composite',
    properties: {
      density: 1.55,
      tensileStrength: 1600,
      hardness: 45,
      meltingPoint: 250,
      youngsModulus: 140,
      thermalConductivity: 5.0,
    },
  },
  // Extra bonus presets for educational exploration
  {
    name: 'Titanium (Ti-6Al-4V)',
    description: 'Aerospace grade-5 alpha-beta titanium alloy',
    expectedClass: 'Metal',
    properties: {
      density: 4.43,
      tensileStrength: 950,
      hardness: 36,
      meltingPoint: 1660,
      youngsModulus: 114,
      thermalConductivity: 6.7,
    },
  },
  {
    name: 'Silicon Carbide',
    description: 'Sintered SiC structural ceramic with high thermal shock resistance',
    expectedClass: 'Ceramic',
    properties: {
      density: 3.1,
      tensileStrength: 420,
      hardness: 92,
      meltingPoint: 2730,
      youngsModulus: 410,
      thermalConductivity: 120,
    },
  },
];

interface RangeBounds {
  min: number;
  max: number;
}

interface MaterialClassProfile {
  density: RangeBounds;
  tensileStrength: RangeBounds;
  hardness: RangeBounds;
  meltingPoint: RangeBounds;
  youngsModulus: RangeBounds;
  thermalConductivity: RangeBounds;
}

// User-specified ranges for each material class
const CLASS_PROFILES: Record<MaterialClass, MaterialClassProfile> = {
  Metal: {
    density: { min: 2.7, max: 8.9 },
    tensileStrength: { min: 200, max: 1500 },
    hardness: { min: 30, max: 70 },
    meltingPoint: { min: 600, max: 1600 },
    youngsModulus: { min: 45, max: 210 },
    thermalConductivity: { min: 15, max: 400 },
  },
  Polymer: {
    density: { min: 0.9, max: 1.5 },
    tensileStrength: { min: 20, max: 100 },
    hardness: { min: 5, max: 25 },
    meltingPoint: { min: 100, max: 300 },
    youngsModulus: { min: 0.1, max: 4.0 },
    thermalConductivity: { min: 0.1, max: 0.5 },
  },
  Ceramic: {
    density: { min: 2.2, max: 6.0 },
    tensileStrength: { min: 100, max: 500 },
    hardness: { min: 60, max: 95 },
    meltingPoint: { min: 1500, max: 3000 },
    youngsModulus: { min: 150, max: 450 },
    thermalConductivity: { min: 2, max: 120 },
  },
  Composite: {
    density: { min: 1.2, max: 2.2 },
    tensileStrength: { min: 400, max: 3000 },
    hardness: { min: 20, max: 60 },
    meltingPoint: { min: 200, max: 400 },
    youngsModulus: { min: 20, max: 230 },
    thermalConductivity: { min: 0.5, max: 10.0 },
  },
};

// Simple pseudo-random number generator for reproducible seed
function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate a random float within [min, max] with subtle boundary noise / expansion for overlap
function sampleFeature(
  rnd: () => number,
  bounds: RangeBounds,
  noiseFactor = 0.06,
  overlapRate = 0.05
): number {
  const span = bounds.max - bounds.min;
  let val = bounds.min + rnd() * span;

  // Add small Gaussian-like noise (sum of 3 uniforms)
  const gaussianNoise = (rnd() + rnd() + rnd() - 1.5) * (span * noiseFactor);
  val += gaussianNoise;

  // With a small probability (5%), simulate crossover/overlap (e.g. low melting alloy or high-perf composite)
  if (rnd() < overlapRate) {
    const crossoverShift = (rnd() - 0.5) * span * 0.3;
    val += crossoverShift;
  }

  // Ensure physically non-negative
  return Math.max(0.01, val);
}

function roundTo(val: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

/**
 * Generates 800 synthetic rows, 200 per class, with realistic random values
 * and a small degree of realistic overlap as required.
 */
export function generateMaterialDataset(seed = 42): MaterialSample[] {
  const rnd = createSeededRandom(seed);
  const samples: MaterialSample[] = [];
  let idCounter = 1;

  for (const materialClass of MATERIAL_CLASSES) {
    const profile = CLASS_PROFILES[materialClass];

    for (let i = 0; i < 200; i++) {
      const density = roundTo(sampleFeature(rnd, profile.density, 0.05, 0.04), 2);
      const tensileStrength = roundTo(sampleFeature(rnd, profile.tensileStrength, 0.06, 0.04), 1);
      const hardness = roundTo(Math.min(99.5, Math.max(1, sampleFeature(rnd, profile.hardness, 0.05, 0.03))), 1);
      const meltingPoint = roundTo(sampleFeature(rnd, profile.meltingPoint, 0.05, 0.04), 1);
      const youngsModulus = roundTo(sampleFeature(rnd, profile.youngsModulus, 0.06, 0.04), 2);
      const thermalConductivity = roundTo(sampleFeature(rnd, profile.thermalConductivity, 0.08, 0.05), 2);

      samples.push({
        id: idCounter++,
        materialClass,
        density,
        tensileStrength,
        hardness,
        meltingPoint,
        youngsModulus,
        thermalConductivity,
      });
    }
  }

  // Deterministically shuffle samples so they are well-mixed
  for (let i = samples.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [samples[i], samples[j]] = [samples[j], samples[i]];
  }

  // Re-index IDs neatly
  return samples.map((s, idx) => ({ ...s, id: idx + 1 }));
}

/**
 * Splits dataset 80% train (640) and 20% test (160), maintaining class stratification
 */
export function trainTestSplit(
  samples: MaterialSample[],
  trainRatio = 0.8
): { train: MaterialSample[]; test: MaterialSample[] } {
  const train: MaterialSample[] = [];
  const test: MaterialSample[] = [];

  for (const cls of MATERIAL_CLASSES) {
    const classSamples = samples.filter((s) => s.materialClass === cls);
    const splitIndex = Math.floor(classSamples.length * trainRatio);
    train.push(...classSamples.slice(0, splitIndex));
    test.push(...classSamples.slice(splitIndex));
  }

  return { train, test };
}

/**
 * Converts sample array to standard CSV text
 */
export function convertToCSV(samples: MaterialSample[]): string {
  const headers = [
    'Sample_ID',
    'Material_Class',
    'Density_g_cm3',
    'Tensile_Strength_MPa',
    'Hardness_HRC',
    'Melting_Point_C',
    'Youngs_Modulus_GPa',
    'Thermal_Conductivity_W_mK',
  ];

  const rows = samples.map((s) => [
    s.id,
    s.materialClass,
    s.density,
    s.tensileStrength,
    s.hardness,
    s.meltingPoint,
    s.youngsModulus,
    s.thermalConductivity,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
