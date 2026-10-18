/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MaterialClass = 'Metal' | 'Polymer' | 'Ceramic' | 'Composite';

export const MATERIAL_CLASSES: MaterialClass[] = ['Metal', 'Polymer', 'Ceramic', 'Composite'];

export interface MaterialProperties {
  density: number;             // g/cm³
  tensileStrength: number;     // MPa
  hardness: number;            // HRC
  meltingPoint: number;        // °C
  youngsModulus: number;       // GPa
  thermalConductivity: number; // W/mK
}

export type FeatureKey = keyof MaterialProperties;

export const FEATURE_KEYS: FeatureKey[] = [
  'density',
  'tensileStrength',
  'hardness',
  'meltingPoint',
  'youngsModulus',
  'thermalConductivity',
];

export interface FeatureDefinition {
  key: FeatureKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  description: string;
}

export const FEATURE_DEFINITIONS: Record<FeatureKey, FeatureDefinition> = {
  density: {
    key: 'density',
    label: 'Density',
    unit: 'g/cm³',
    min: 0.5,
    max: 12.0,
    step: 0.05,
    description: 'Mass per unit volume (Archimedes method)',
  },
  tensileStrength: {
    key: 'tensileStrength',
    label: 'Tensile Strength',
    unit: 'MPa',
    min: 10,
    max: 3500,
    step: 5,
    description: 'Ultimate engineering tensile failure stress',
  },
  hardness: {
    key: 'hardness',
    label: 'Hardness',
    unit: 'HRC',
    min: 0,
    max: 100,
    step: 0.5,
    description: 'Rockwell C indentation resistance scale',
  },
  meltingPoint: {
    key: 'meltingPoint',
    label: 'Melting Point',
    unit: '°C',
    min: 50,
    max: 3500,
    step: 10,
    description: 'Solidus / liquidus phase change temperature',
  },
  youngsModulus: {
    key: 'youngsModulus',
    label: "Young's Modulus",
    unit: 'GPa',
    min: 0.05,
    max: 500,
    step: 0.5,
    description: 'Elastic stiffness along longitudinal axis',
  },
  thermalConductivity: {
    key: 'thermalConductivity',
    label: 'Thermal Conductivity',
    unit: 'W/mK',
    min: 0.05,
    max: 450,
    step: 0.5,
    description: 'Rate of heat transfer per unit temperature gradient',
  },
};

export interface MaterialSample extends MaterialProperties {
  id: number;
  materialClass: MaterialClass;
}

export interface ScalerStats {
  mean: Record<FeatureKey, number>;
  std: Record<FeatureKey, number>;
}

export interface ConfusionMatrix {
  matrix: number[][]; // [actualIdx][predictedIdx]
  labels: MaterialClass[];
  totalSamples: number;
}

export interface ClassPerformance {
  className: MaterialClass;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

export interface ModelEvaluation {
  modelType: 'KNN' | 'DecisionTree';
  modelName: string;
  accuracy: number;
  perClass: Record<MaterialClass, ClassPerformance>;
  confusionMatrix: ConfusionMatrix;
  explanation: string;
}

export interface PredictionResult {
  predictedClass: MaterialClass;
  confidence: number;
  probabilities: Record<MaterialClass, number>;
  modelUsed: 'KNN' | 'DecisionTree';
  reasoning: string;
  featureInsights: {
    feature: FeatureKey;
    label: string;
    value: number;
    unit: string;
    comparison: string;
  }[];
}

export interface PresetMaterial {
  name: string;
  description: string;
  expectedClass: MaterialClass;
  properties: MaterialProperties;
}
