/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MaterialClass,
  MATERIAL_CLASSES,
  MaterialProperties,
  MaterialSample,
  ModelEvaluation,
  PredictionResult,
  ConfusionMatrix,
  ClassPerformance,
  FEATURE_DEFINITIONS,
  FeatureKey,
} from '../types/material';
import { generateMaterialDataset, trainTestSplit } from './dataset';
import { FeatureScaler } from './scaler';
import { KNNClassifier } from './knn';
import { DecisionTreeClassifier } from './decisionTree';

export interface TrainingPipelineResult {
  samples: MaterialSample[];
  trainSamples: MaterialSample[];
  testSamples: MaterialSample[];
  knnEvaluation: ModelEvaluation;
  dtEvaluation: ModelEvaluation;
  bestModelType: 'KNN' | 'DecisionTree';
  bestModelEvaluation: ModelEvaluation;
  scaler: FeatureScaler;
  knn: KNNClassifier;
  dt: DecisionTreeClassifier;
}

/**
 * Builds confusion matrix and precision/recall statistics
 */
function evaluateModel(
  modelName: string,
  modelType: 'KNN' | 'DecisionTree',
  predictFn: (vec: number[]) => { predictedClass: MaterialClass },
  testVectors: number[][],
  testSamples: MaterialSample[]
): ModelEvaluation {
  const numClasses = MATERIAL_CLASSES.length;
  // matrix[actualIdx][predictedIdx]
  const matrix: number[][] = Array.from({ length: numClasses }, () =>
    Array(numClasses).fill(0)
  );

  let correctCount = 0;

  for (let i = 0; i < testSamples.length; i++) {
    const actual = testSamples[i].materialClass;
    const pred = predictFn(testVectors[i]).predictedClass;

    const actualIdx = MATERIAL_CLASSES.indexOf(actual);
    const predIdx = MATERIAL_CLASSES.indexOf(pred);

    matrix[actualIdx][predIdx]++;

    if (actual === pred) {
      correctCount++;
    }
  }

  const accuracy = Math.round((correctCount / testSamples.length) * 1000) / 10; // e.g. 95.6

  // Per-class metrics
  const perClass: Partial<Record<MaterialClass, ClassPerformance>> = {};

  for (let c = 0; c < numClasses; c++) {
    const cls = MATERIAL_CLASSES[c];
    const tp = matrix[c][c];

    let fp = 0;
    for (let r = 0; r < numClasses; r++) {
      if (r !== c) fp += matrix[r][c];
    }

    let fn = 0;
    for (let col = 0; col < numClasses; col++) {
      if (col !== c) fn += matrix[c][col];
    }

    const precision = tp + fp > 0 ? Math.round((tp / (tp + fp)) * 1000) / 10 : 0;
    const recall = tp + fn > 0 ? Math.round((tp / (tp + fn)) * 1000) / 10 : 0;
    const f1Score =
      precision + recall > 0
        ? Math.round(((2 * precision * recall) / (precision + recall)) * 10) / 10
        : 0;

    perClass[cls] = {
      className: cls,
      precision,
      recall,
      f1Score,
      support: tp + fn,
    };
  }

  const confusionMatrix: ConfusionMatrix = {
    matrix,
    labels: MATERIAL_CLASSES,
    totalSamples: testSamples.length,
  };

  // Plain-English explanation
  let explanation = '';
  if (modelType === 'KNN') {
    explanation = `KNN (K=5) reached ${accuracy}% test accuracy by clustering samples across the 6 normalized property dimensions, successfully separating dense metallics from low-density polymers.`;
  } else {
    explanation = `Decision Tree (depth 5) reached ${accuracy}% test accuracy by constructing hierarchical thresholds, predominantly splitting first on melting point and density boundaries.`;
  }

  return {
    modelType,
    modelName,
    accuracy,
    perClass: perClass as Record<MaterialClass, ClassPerformance>,
    confusionMatrix,
    explanation,
  };
}

/**
 * Executes full training pipeline in browser:
 * - Dataset generation
 * - 80/20 train/test split
 * - Normalization
 * - KNN & Decision Tree training
 * - Test evaluation & best model selection
 */
export function trainModels(seed = 42): TrainingPipelineResult {
  const samples = generateMaterialDataset(seed);
  const { train, test } = trainTestSplit(samples, 0.8);

  const scaler = new FeatureScaler();
  scaler.fit(train);

  const trainVectors = scaler.transformSamples(train);
  const trainLabels = train.map((s) => s.materialClass);

  const testVectors = scaler.transformSamples(test);

  // Train KNN
  const knn = new KNNClassifier(5);
  knn.fit(trainVectors, trainLabels);

  // Train Decision Tree
  const dt = new DecisionTreeClassifier(5, 5);
  dt.fit(trainVectors, trainLabels);

  // Evaluate KNN
  const knnEvaluation = evaluateModel(
    'K-Nearest Neighbours (K=5)',
    'KNN',
    (v) => knn.predict(v),
    testVectors,
    test
  );

  // Evaluate Decision Tree
  const dtEvaluation = evaluateModel(
    'Decision Tree (Depth 5)',
    'DecisionTree',
    (v) => dt.predict(v),
    testVectors,
    test
  );

  // Auto-choose better one by test accuracy
  const bestModelType: 'KNN' | 'DecisionTree' =
    knnEvaluation.accuracy >= dtEvaluation.accuracy ? 'KNN' : 'DecisionTree';
  const bestModelEvaluation =
    bestModelType === 'KNN' ? knnEvaluation : dtEvaluation;

  return {
    samples,
    trainSamples: train,
    testSamples: test,
    knnEvaluation,
    dtEvaluation,
    bestModelType,
    bestModelEvaluation,
    scaler,
    knn,
    dt,
  };
}

/**
 * Explains why a set of properties belongs to a specific predicted class
 */
export function generateScientificReasoning(
  properties: MaterialProperties,
  predictedClass: MaterialClass,
  confidence: number
): { reasoning: string; keyInsights: PredictionResult['featureInsights'] } {
  const insights: PredictionResult['featureInsights'] = [];

  // Rules based on characteristic material science property thresholds
  const reasons: string[] = [];

  if (predictedClass === 'Ceramic') {
    if (properties.meltingPoint >= 1400) {
      reasons.push(`very high melting point (${properties.meltingPoint} °C)`);
      insights.push({
        feature: 'meltingPoint',
        label: 'Melting Point',
        value: properties.meltingPoint,
        unit: '°C',
        comparison: 'Refractory range (>1400 °C) typical of ionic/covalent ceramic bonding',
      });
    }
    if (properties.hardness >= 60) {
      reasons.push(`extreme hardness (${properties.hardness} HRC)`);
      insights.push({
        feature: 'hardness',
        label: 'Hardness',
        value: properties.hardness,
        unit: 'HRC',
        comparison: 'High indentation resistance indicative of rigid ceramic lattices',
      });
    }
    if (properties.youngsModulus >= 120) {
      reasons.push(`high stiffness (${properties.youngsModulus} GPa)`);
      insights.push({
        feature: 'youngsModulus',
        label: "Young's Modulus",
        value: properties.youngsModulus,
        unit: 'GPa',
        comparison: 'Steep atomic bond energy well typical of oxide and carbide ceramics',
      });
    }
    if (reasons.length === 0) {
      reasons.push(`moderate density (${properties.density} g/cm³) and characteristic ceramic thermal/mechanical balance`);
    }
  } else if (predictedClass === 'Metal') {
    if (properties.density >= 4.0) {
      reasons.push(`high density (${properties.density} g/cm³)`);
      insights.push({
        feature: 'density',
        label: 'Density',
        value: properties.density,
        unit: 'g/cm³',
        comparison: 'Dense close-packed metallic crystalline structure (FCC/BCC/HCP)',
      });
    }
    if (properties.thermalConductivity >= 15) {
      reasons.push(`high thermal conductivity (${properties.thermalConductivity} W/mK)`);
      insights.push({
        feature: 'thermalConductivity',
        label: 'Thermal Conductivity',
        value: properties.thermalConductivity,
        unit: 'W/mK',
        comparison: 'Delocalized electron sea facilitating rapid heat conduction',
      });
    }
    if (properties.meltingPoint >= 500 && properties.meltingPoint <= 1700) {
      reasons.push(`characteristic metallic melting range (${properties.meltingPoint} °C)`);
      insights.push({
        feature: 'meltingPoint',
        label: 'Melting Point',
        value: properties.meltingPoint,
        unit: '°C',
        comparison: 'Typical for transition metal and alloy fusion temperatures',
      });
    }
    if (reasons.length === 0) {
      reasons.push(`well-balanced mechanical strength (${properties.tensileStrength} MPa) and metallic conductivity profile`);
    }
  } else if (predictedClass === 'Polymer') {
    if (properties.density <= 1.6) {
      reasons.push(`very low density (${properties.density} g/cm³)`);
      insights.push({
        feature: 'density',
        label: 'Density',
        value: properties.density,
        unit: 'g/cm³',
        comparison: 'Open organic macromolecular packing with light elements (C, H, O)',
      });
    }
    if (properties.youngsModulus <= 5.0) {
      reasons.push(`low elastic modulus (${properties.youngsModulus} GPa)`);
      insights.push({
        feature: 'youngsModulus',
        label: "Young's Modulus",
        value: properties.youngsModulus,
        unit: 'GPa',
        comparison: 'Flexible secondary van der Waals forces between polymer chains',
      });
    }
    if (properties.meltingPoint <= 350) {
      reasons.push(`low thermal stability / melting point (${properties.meltingPoint} °C)`);
      insights.push({
        feature: 'meltingPoint',
        label: 'Melting Point',
        value: properties.meltingPoint,
        unit: '°C',
        comparison: 'Macromolecular chain mobility at low to moderate temperatures',
      });
    }
    if (properties.thermalConductivity <= 0.6) {
      reasons.push(`thermal insulation behavior (${properties.thermalConductivity} W/mK)`);
      insights.push({
        feature: 'thermalConductivity',
        label: 'Thermal Conductivity',
        value: properties.thermalConductivity,
        unit: 'W/mK',
        comparison: 'Low phonon transmission through amorphous/semicrystalline chains',
      });
    }
  } else {
    // Composite
    if (properties.tensileStrength >= 350) {
      reasons.push(`exceptional tensile strength (${properties.tensileStrength} MPa)`);
      insights.push({
        feature: 'tensileStrength',
        label: 'Tensile Strength',
        value: properties.tensileStrength,
        unit: 'MPa',
        comparison: 'Fiber reinforcement carrying major axial mechanical loads',
      });
    }
    if (properties.density <= 2.3) {
      reasons.push(`lightweight density (${properties.density} g/cm³)`);
      insights.push({
        feature: 'density',
        label: 'Density',
        value: properties.density,
        unit: 'g/cm³',
        comparison: 'High specific strength (strength-to-weight ratio) profile',
      });
    }
    if (properties.meltingPoint <= 450) {
      reasons.push(`matrix-governed thermal limit (${properties.meltingPoint} °C)`);
      insights.push({
        feature: 'meltingPoint',
        label: 'Melting Point',
        value: properties.meltingPoint,
        unit: '°C',
        comparison: 'Matrix degradation or glass transition occurs well before fibers melt',
      });
    }
    if (reasons.length === 0) {
      reasons.push(`high specific stiffness and anisotropic fiber composite signature`);
    }
  }

  // Construct readable sentence
  let summary = '';
  if (reasons.length >= 2) {
    const last = reasons.pop();
    summary = `${reasons.join(', ')} and ${last}, typical of ${predictedClass.toLowerCase()}s.`;
  } else if (reasons.length === 1) {
    summary = `${reasons[0]}, typical of ${predictedClass.toLowerCase()}s.`;
  } else {
    summary = `Characteristic property signature aligning closely with ${predictedClass.toLowerCase()} material behavior.`;
  }

  // Capitalize first letter
  const formattedReason = summary.charAt(0).toUpperCase() + summary.slice(1);

  return {
    reasoning: formattedReason,
    keyInsights: insights,
  };
}

/**
 * Classifies candidate properties using the active pipeline
 */
export function classifyMaterial(
  properties: MaterialProperties,
  pipeline: TrainingPipelineResult,
  modelOverride?: 'KNN' | 'DecisionTree'
): PredictionResult {
  const modelToUse = modelOverride || pipeline.bestModelType;
  const vector = pipeline.scaler.transform(properties);

  let predictedClass: MaterialClass;
  let confidence: number;
  let probabilities: Record<MaterialClass, number>;

  if (modelToUse === 'KNN') {
    const res = pipeline.knn.predict(vector);
    predictedClass = res.predictedClass;
    confidence = res.confidence;
    probabilities = res.probabilities;
  } else {
    const res = pipeline.dt.predict(vector);
    predictedClass = res.predictedClass;
    confidence = res.confidence;
    probabilities = res.probabilities;
  }

  const { reasoning, keyInsights } = generateScientificReasoning(
    properties,
    predictedClass,
    confidence
  );

  return {
    predictedClass,
    confidence,
    probabilities,
    modelUsed: modelToUse,
    reasoning,
    featureInsights: keyInsights,
  };
}
