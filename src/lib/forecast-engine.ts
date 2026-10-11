/**
 * Sanvektro ✦ 30-Day Forward Trajectory & Forecast Engine
 * Multi-cone forward projections, recency-weighted burn velocity (50/30/20), and scheduled shock models.
 */
export {
  calculateWeightedBurnVelocity,
  generateTrajectoryPoints,
  calculateDailySpendHeatmap,
  calculateCashPressureRadar
} from '../utils/calculations';

export type { TrajectoryPoint } from '../utils/calculations';
