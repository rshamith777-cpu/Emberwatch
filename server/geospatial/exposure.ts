import { ExposedAsset, FireCluster } from '../../src/types/emberwatch.js';
import { haversineDistanceKm } from '../ml/clustering.js';
import { GEOSPATIAL_ASSETS } from '../data/snapshot.js';

/**
 * Calculates exposed assets within concentric risk radii (5km, 10km, 25km)
 * of a wildfire cluster center.
 */
export function identifyExposedAssets(
  clusterLat: number,
  clusterLon: number,
  allAssets: ExposedAsset[] = GEOSPATIAL_ASSETS
): ExposedAsset[] {
  const exposed: ExposedAsset[] = [];

  for (const asset of allAssets) {
    const dist = haversineDistanceKm(clusterLat, clusterLon, asset.latitude, asset.longitude);
    if (dist <= 25.0) {
      let zone: ExposedAsset['estimatedRiskZone'] = 'WITHIN_25KM';
      if (dist <= 5.0) zone = 'WITHIN_5KM';
      else if (dist <= 10.0) zone = 'WITHIN_10KM';

      exposed.push({
        ...asset,
        distanceKm: parseFloat(dist.toFixed(1)),
        estimatedRiskZone: zone
      });
    }
  }

  // Sort by closest proximity
  return exposed.sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Generates grounded operational response intelligence recommendations
 * derived strictly from cluster risk score, spread direction, and exposed assets.
 */
export function generateResponseRecommendations(
  cluster: {
    cluster_number: number;
    risk_score: number;
    risk_level: string;
    spread_estimate: { likelyThreatDirection: string; spreadRisk: string };
    exposed_assets: ExposedAsset[];
    max_frp: number;
    weather: { wind_speed_10m: number; wind_direction_10m: number };
  }
): string[] {
  const recommendations: string[] = [];
  const risk = cluster.risk_score;
  const spreadDir = cluster.spread_estimate.likelyThreatDirection;
  const exposedSettlements = cluster.exposed_assets.filter(
    (a) => a.type === 'SETTLEMENT' && (a.estimatedRiskZone === 'WITHIN_5KM' || a.estimatedRiskZone === 'WITHIN_10KM')
  );
  const exposedHighways = cluster.exposed_assets.filter((a) => a.type === 'HIGHWAY');
  const exposedPower = cluster.exposed_assets.filter((a) => a.type === 'POWER_INFRASTRUCTURE');

  if (risk >= 76) {
    recommendations.push(
      `IMMEDIATE VERIFICATION: Dispatch tactical aerial reconnaissance or thermal drone flight to confirm flame front coordinates along the ${spreadDir} flank.`
    );
    if (exposedSettlements.length > 0) {
      const names = exposedSettlements.map((s) => `${s.name} (${s.distanceKm} km)`).join(', ');
      recommendations.push(
        `COMMUNITY ACTION: Issue Red Flag advisory and initiate pre-evacuation notices for downwind settlements: ${names}.`
      );
    }
    if (exposedHighways.length > 0) {
      recommendations.push(
        `TRANSPORT CORRIDOR: Coordinate with highway patrol for traffic control and smoke hazard closures on ${exposedHighways[0].name}.`
      );
    }
    if (exposedPower.length > 0) {
      recommendations.push(
        `INFRASTRUCTURE DEFENSE: Notify utility dispatch regarding potential fire encroachment on ${exposedPower[0].name}.`
      );
    }
    recommendations.push(
      `PERIMETER CONTAINMENT: Anchor suppression lines on windward western edge; establish retardant barriers downwind along the ${spreadDir} corridor.`
    );
  } else if (risk >= 51) {
    recommendations.push(
      `CORRIDOR MONITORING: Intensify observation along the ${spreadDir} propagation corridor with ground scouts.`
    );
    if (exposedSettlements.length > 0) {
      recommendations.push(
        `EVACUATION STANDBY: Place emergency services in ${exposedSettlements[0].name} on high standby readiness.`
      );
    }
    recommendations.push(
      `FUEL BREAK PREPARATION: Pre-treat road margins and clear defensible space around vulnerable structures within 10 km.`
    );
  } else if (risk >= 26) {
    recommendations.push(
      `ROUTINE SURVEILLANCE: Continue automated 10-minute satellite and weather fusion checks for rapid intensification.`
    );
    recommendations.push(
      `RESOURCE POSITIONING: Maintain local fire district alert status; verify nearest water tender fill sites.`
    );
  } else {
    recommendations.push(
      `STANDARD OBSERVATION: Keep event under regular automated monitoring until thermal extinction is verified.`
    );
  }

  recommendations.push(
    `SYNCHRONIZATION: Recalculate operational risk upon receipt of next VIIRS/MODIS satellite overpass or weather update.`
  );

  return recommendations;
}
