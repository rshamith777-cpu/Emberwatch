import { FireCluster, EmberAlert, AlertSeverity } from '../../src/types/emberwatch.js';
import { db } from '../db.js';

export function evaluateClusterAlerts(clusters: FireCluster[]): EmberAlert[] {
  const generatedAlerts: EmberAlert[] = [];

  for (const c of clusters) {
    const risk = c.risk_score;
    const windSpeed = c.weather.wind_speed_10m;
    const spreadRisk = c.spread_estimate.spreadRisk;
    const maxFrp = c.max_frp;
    const settlementsNear = c.exposed_assets.filter(
      (a) => a.type === 'SETTLEMENT' && (a.estimatedRiskZone === 'WITHIN_5KM' || a.estimatedRiskZone === 'WITHIN_10KM')
    );

    let severity: AlertSeverity | null = null;
    let title = '';
    let message = '';
    let nearbyPopRisk: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';

    if (settlementsNear.length > 0) {
      nearbyPopRisk = settlementsNear.some((s) => s.estimatedRiskZone === 'WITHIN_5KM') ? 'HIGH' : 'MODERATE';
    }

    if (risk >= 76 || (risk >= 70 && settlementsNear.length > 0 && windSpeed >= 25)) {
      severity = 'CRITICAL';
      title = `CRITICAL THREAT: ${c.name}`;
      message = `Cluster #${c.cluster_number} exhibiting severe risk score (${risk}/100) with peak FRP ${maxFrp} MW. Strong winds (${windSpeed.toFixed(1)} km/h) pushing threat towards ${c.spread_estimate.likelyThreatDirection}. ${settlementsNear.length} populated settlement(s) in immediate risk corridor.`;
    } else if (risk >= 51 || maxFrp >= 150 || (windSpeed >= 25 && risk >= 45)) {
      severity = 'HIGH';
      title = `HIGH RISK ADVISORY: ${c.name}`;
      message = `Elevated wildfire risk (${risk}/100) with ${c.hotspot_count} satellite hotspots. Spread risk evaluated as ${spreadRisk}. Monitor downwind corridor.`;
    } else if (risk >= 35 && maxFrp >= 80) {
      severity = 'WARNING';
      title = `WILDFIRE WATCH: ${c.name}`;
      message = `Active thermal cluster detected with moderate intensity (${maxFrp} MW). Automated surveillance active.`;
    }

    if (severity) {
      const alert: EmberAlert = {
        id: `ALERT-${c.id}-${severity}-${new Date().toISOString().slice(0, 13)}`,
        cluster_id: c.id,
        cluster_name: c.name,
        severity,
        title,
        message,
        risk_score: risk,
        spread_risk: spreadRisk,
        wind_summary: `${windSpeed.toFixed(0)} km/h ${c.spread_estimate.likelyThreatDirection}`,
        nearby_population_risk: nearbyPopRisk,
        created_at: new Date().toISOString()
      };

      const added = db.addAlert(alert);
      if (added) {
        generatedAlerts.push(alert);
      }
    }
  }

  return generatedAlerts;
}
