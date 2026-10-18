/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MaterialClass, MATERIAL_CLASSES } from '../types/material';

export interface DecisionTreeNode {
  isLeaf: boolean;
  featureIndex?: number;
  threshold?: number;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
  predictedClass?: MaterialClass;
  probabilities: Record<MaterialClass, number>;
  samplesCount: number;
  gini: number;
}

export interface DTPrediction {
  predictedClass: MaterialClass;
  probabilities: Record<MaterialClass, number>;
  confidence: number;
}

/**
 * CART Decision Tree Classifier (Max Depth: 5)
 * Uses Gini Impurity to greedily determine optimal binary decision thresholds
 * across physical property features.
 */
export class DecisionTreeClassifier {
  private maxDepth: number;
  private minSamplesSplit: number;
  private root: DecisionTreeNode | null = null;

  constructor(maxDepth = 5, minSamplesSplit = 6) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  fit(trainVectors: number[][], trainLabels: MaterialClass[]): void {
    if (trainVectors.length === 0 || trainVectors.length !== trainLabels.length) {
      throw new Error('Invalid training data provided for Decision Tree');
    }
    const sampleIndices = trainVectors.map((_, i) => i);
    this.root = this.buildTree(trainVectors, trainLabels, sampleIndices, 0);
  }

  private calculateGini(labels: MaterialClass[], indices: number[]): { gini: number; counts: Record<MaterialClass, number> } {
    const counts: Record<MaterialClass, number> = {
      Metal: 0,
      Polymer: 0,
      Ceramic: 0,
      Composite: 0,
    };

    if (indices.length === 0) {
      return { gini: 0, counts };
    }

    for (const idx of indices) {
      counts[labels[idx]]++;
    }

    const total = indices.length;
    let sumSqProb = 0;
    for (const cls of MATERIAL_CLASSES) {
      const p = counts[cls] / total;
      sumSqProb += p * p;
    }

    return {
      gini: 1 - sumSqProb,
      counts,
    };
  }

  private buildTree(
    vectors: number[][],
    labels: MaterialClass[],
    indices: number[],
    currentDepth: number
  ): DecisionTreeNode {
    const { gini, counts } = this.calculateGini(labels, indices);
    const totalSamples = indices.length;

    // Determine majority class & probabilities for this node
    let bestClass: MaterialClass = 'Metal';
    let maxCount = -1;
    const probabilities: Record<MaterialClass, number> = {
      Metal: 0,
      Polymer: 0,
      Ceramic: 0,
      Composite: 0,
    };

    for (const cls of MATERIAL_CLASSES) {
      const p = totalSamples > 0 ? counts[cls] / totalSamples : 0.25;
      probabilities[cls] = Math.round(p * 1000) / 1000;
      if (counts[cls] > maxCount) {
        maxCount = counts[cls];
        bestClass = cls;
      }
    }

    // Stopping criteria: max depth reached, pure node, or too few samples to split
    if (
      currentDepth >= this.maxDepth ||
      totalSamples < this.minSamplesSplit ||
      gini <= 1e-6
    ) {
      return {
        isLeaf: true,
        predictedClass: bestClass,
        probabilities,
        samplesCount: totalSamples,
        gini,
      };
    }

    // Find best split across all features
    const numFeatures = vectors[0].length;
    let bestGain = 0;
    let bestFeatureIndex = -1;
    let bestThreshold = 0;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];

    for (let f = 0; f < numFeatures; f++) {
      // Gather values for feature f
      const vals = indices.map((i) => vectors[i][f]);
      vals.sort((a, b) => a - b);

      // Evaluate up to 12 candidate split thresholds uniformly distributed
      const step = Math.max(1, Math.floor(vals.length / 12));
      const thresholds: number[] = [];
      for (let k = step; k < vals.length; k += step) {
        const mid = (vals[k - 1] + vals[k]) / 2;
        thresholds.push(mid);
      }

      for (const thresh of thresholds) {
        const left: number[] = [];
        const right: number[] = [];

        for (const idx of indices) {
          if (vectors[idx][f] <= thresh) {
            left.push(idx);
          } else {
            right.push(idx);
          }
        }

        if (left.length === 0 || right.length === 0) continue;

        const leftGini = this.calculateGini(labels, left).gini;
        const rightGini = this.calculateGini(labels, right).gini;
        const weightedGini = (left.length / totalSamples) * leftGini + (right.length / totalSamples) * rightGini;
        const gain = gini - weightedGini;

        if (gain > bestGain) {
          bestGain = gain;
          bestFeatureIndex = f;
          bestThreshold = thresh;
          bestLeftIndices = left;
          bestRightIndices = right;
        }
      }
    }

    // If no meaningful split was found, produce leaf
    if (bestGain <= 1e-5 || bestFeatureIndex === -1) {
      return {
        isLeaf: true,
        predictedClass: bestClass,
        probabilities,
        samplesCount: totalSamples,
        gini,
      };
    }

    // Recurse on children
    const leftChild = this.buildTree(vectors, labels, bestLeftIndices, currentDepth + 1);
    const rightChild = this.buildTree(vectors, labels, bestRightIndices, currentDepth + 1);

    return {
      isLeaf: false,
      featureIndex: bestFeatureIndex,
      threshold: bestThreshold,
      left: leftChild,
      right: rightChild,
      predictedClass: bestClass,
      probabilities,
      samplesCount: totalSamples,
      gini,
    };
  }

  predict(vector: number[]): DTPrediction {
    if (!this.root) {
      throw new Error('Decision tree model has not been trained yet');
    }

    let node: DecisionTreeNode = this.root;
    while (!node.isLeaf) {
      if (
        node.featureIndex !== undefined &&
        node.threshold !== undefined &&
        vector[node.featureIndex] <= node.threshold
      ) {
        if (!node.left) break;
        node = node.left;
      } else {
        if (!node.right) break;
        node = node.right;
      }
    }

    let maxProb = -1;
    let bestCls: MaterialClass = 'Metal';
    for (const cls of MATERIAL_CLASSES) {
      if (node.probabilities[cls] > maxProb) {
        maxProb = node.probabilities[cls];
        bestCls = cls;
      }
    }

    return {
      predictedClass: bestCls,
      probabilities: node.probabilities,
      confidence: Math.round(maxProb * 1000) / 10,
    };
  }
}
