/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MaterialClass, MATERIAL_CLASSES } from '../types/material';

export interface Neighbor {
  index: number;
  distance: number;
  materialClass: MaterialClass;
}

export interface KNNPrediction {
  predictedClass: MaterialClass;
  probabilities: Record<MaterialClass, number>;
  confidence: number;
  neighbors: Neighbor[];
}

/**
 * K-Nearest Neighbors Classifier (K=5)
 * Computes Euclidean distances in normalized 6D feature space and applies
 * inverse-distance weighted voting for stable class probabilities.
 */
export class KNNClassifier {
  private k: number;
  private trainVectors: number[][] = [];
  private trainLabels: MaterialClass[] = [];

  constructor(k = 5) {
    this.k = k;
  }

  fit(trainVectors: number[][], trainLabels: MaterialClass[]): void {
    if (trainVectors.length !== trainLabels.length) {
      throw new Error('Vectors and labels count must match');
    }
    this.trainVectors = trainVectors;
    this.trainLabels = trainLabels;
  }

  predict(vector: number[]): KNNPrediction {
    if (this.trainVectors.length === 0) {
      throw new Error('KNN model is not trained yet');
    }

    // 1. Compute Euclidean distance to each training instance
    const distances: Neighbor[] = [];
    for (let i = 0; i < this.trainVectors.length; i++) {
      const trainVec = this.trainVectors[i];
      let sumSq = 0;
      for (let f = 0; f < vector.length; f++) {
        const diff = vector[f] - trainVec[f];
        sumSq += diff * diff;
      }
      distances.push({
        index: i,
        distance: Math.sqrt(sumSq),
        materialClass: this.trainLabels[i],
      });
    }

    // 2. Select top K nearest neighbors
    distances.sort((a, b) => a.distance - b.distance);
    const topK = distances.slice(0, this.k);

    // 3. Inverse-distance weighted voting for continuous probability distribution
    // weight_i = 1 / (distance + 1e-4)
    const weights: Record<MaterialClass, number> = {
      Metal: 0,
      Polymer: 0,
      Ceramic: 0,
      Composite: 0,
    };

    let totalWeight = 0;
    for (const neighbor of topK) {
      const w = 1.0 / (neighbor.distance + 0.05);
      weights[neighbor.materialClass] += w;
      totalWeight += w;
    }

    // Normalize probabilities to sum to 1.0 (with fallback to 0.25 if totalWeight is 0)
    const probabilities: Record<MaterialClass, number> = {
      Metal: 0,
      Polymer: 0,
      Ceramic: 0,
      Composite: 0,
    };

    let maxProb = -1;
    let bestClass: MaterialClass = 'Metal';

    for (const cls of MATERIAL_CLASSES) {
      const prob = totalWeight > 0 ? weights[cls] / totalWeight : 0.25;
      probabilities[cls] = Math.round(prob * 1000) / 1000;
      if (prob > maxProb) {
        maxProb = prob;
        bestClass = cls;
      }
    }

    return {
      predictedClass: bestClass,
      probabilities,
      confidence: Math.round(maxProb * 1000) / 10, // e.g. 96.5%
      neighbors: topK,
    };
  }
}
