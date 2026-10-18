/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FeatureKey,
  FEATURE_KEYS,
  MaterialProperties,
  MaterialSample,
  ScalerStats,
} from '../types/material';

/**
 * Standard Scaler: Fits mean and standard deviation on training data,
 * and scales properties to zero mean and unit variance: z = (x - mean) / std.
 */
export class FeatureScaler {
  private stats: ScalerStats | null = null;

  fit(trainSamples: MaterialSample[]): ScalerStats {
    const mean: Partial<Record<FeatureKey, number>> = {};
    const std: Partial<Record<FeatureKey, number>> = {};
    const count = trainSamples.length;

    // 1. Calculate Mean
    for (const key of FEATURE_KEYS) {
      let sum = 0;
      for (const sample of trainSamples) {
        sum += sample[key];
      }
      mean[key] = sum / count;
    }

    // 2. Calculate Standard Deviation
    for (const key of FEATURE_KEYS) {
      const avg = mean[key]!;
      let varianceSum = 0;
      for (const sample of trainSamples) {
        varianceSum += Math.pow(sample[key] - avg, 2);
      }
      const variance = varianceSum / count;
      // Prevent division by zero with small epsilon
      std[key] = Math.max(Math.sqrt(variance), 1e-6);
    }

    this.stats = {
      mean: mean as Record<FeatureKey, number>,
      std: std as Record<FeatureKey, number>,
    };

    return this.stats;
  }

  getStats(): ScalerStats {
    if (!this.stats) {
      throw new Error('Scaler has not been fitted to training data yet');
    }
    return this.stats;
  }

  /**
   * Transforms properties into a normalized numerical vector [z0, z1, ..., z5]
   */
  transform(properties: MaterialProperties): number[] {
    if (!this.stats) {
      throw new Error('Scaler has not been fitted to training data yet');
    }

    return FEATURE_KEYS.map((key) => {
      const val = properties[key];
      const m = this.stats!.mean[key];
      const s = this.stats!.std[key];
      return (val - m) / s;
    });
  }

  /**
   * Transforms array of MaterialSample objects into feature vectors
   */
  transformSamples(samples: MaterialSample[]): number[][] {
    return samples.map((sample) => this.transform(sample));
  }
}
