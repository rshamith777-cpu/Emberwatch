import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { db } from '../db.js';
import { fetchLiveWeather } from '../collectors/weather.js';
import { AgentToolCallLog, AgentMessage } from '../../src/types/emberwatch.js';

// Available tool implementations for the Intelligence Agent
export const agentTools = {
  get_active_fires: async () => {
    const clusters = db.getClusters();
    return clusters.map((c) => ({
      id: c.id,
      name: c.name,
      cluster_number: c.cluster_number,
      risk_score: c.risk_score,
      risk_level: c.risk_level,
      spread_risk: c.spread_estimate.spreadRisk,
      likely_threat_direction: c.spread_estimate.likelyThreatDirection,
      hotspot_count: c.hotspot_count,
      max_frp: c.max_frp,
      exposed_settlements_count: c.exposed_assets.filter((a) => a.type === 'SETTLEMENT').length,
      center: [c.center_lat, c.center_lon]
    }));
  },

  get_fire_cluster: async (args: { cluster_id: string }) => {
    let id = args.cluster_id;
    if (id.startsWith('#')) id = id.substring(1);
    if (!isNaN(parseInt(id)) && !id.startsWith('CLUSTER-')) {
      id = `CLUSTER-${id.padStart(3, '0')}`;
    }
    const cluster = db.getClusterById(id) || db.getClusters().find((c) => c.id.toLowerCase() === id.toLowerCase() || c.name.toLowerCase().includes(id.toLowerCase()));
    if (!cluster) {
      return { error: `Cluster ${args.cluster_id} not found.` };
    }
    return {
      id: cluster.id,
      name: cluster.name,
      risk_score: cluster.risk_score,
      risk_level: cluster.risk_level,
      hotspot_count: cluster.hotspot_count,
      max_frp: cluster.max_frp,
      weather: cluster.weather,
      spread_estimate: cluster.spread_estimate,
      top_factors: cluster.factor_contributions.slice(0, 3)
    };
  },

  get_weather: async (args: { latitude: number; longitude: number }) => {
    return await fetchLiveWeather(args.latitude, args.longitude);
  },

  get_risk_prediction: async (args: { cluster_id: string }) => {
    const cluster = db.getClusterById(args.cluster_id) || db.getClusters()[0];
    if (!cluster) return { error: 'Cluster not found' };
    return {
      cluster_id: cluster.id,
      risk_score: cluster.risk_score,
      risk_level: cluster.risk_level,
      spread_risk: cluster.spread_estimate.spreadRisk,
      forward_velocity: cluster.spread_estimate.forwardVelocityKmh,
      likely_threat_direction: cluster.spread_estimate.likelyThreatDirection
    };
  },

  get_exposed_assets: async (args: { cluster_id: string }) => {
    const cluster = db.getClusterById(args.cluster_id) || db.getClusters()[0];
    if (!cluster) return { error: 'Cluster not found' };
    return {
      cluster_id: cluster.id,
      exposed_assets_count: cluster.exposed_assets.length,
      critical_assets: cluster.exposed_assets.slice(0, 6)
    };
  },

  get_model_explanation: async (args: { cluster_id: string }) => {
    const cluster = db.getClusterById(args.cluster_id) || db.getClusters()[0];
    if (!cluster) return { error: 'Cluster not found' };
    return {
      cluster_id: cluster.id,
      risk_score: cluster.risk_score,
      contributions: cluster.factor_contributions
    };
  },

  generate_response_summary: async (args: { cluster_id: string }) => {
    const cluster = db.getClusterById(args.cluster_id) || db.getClusters()[0];
    if (!cluster) return { error: 'Cluster not found' };
    return {
      cluster_id: cluster.id,
      name: cluster.name,
      recommendations: cluster.recommendations
    };
  }
};

const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'get_active_fires',
    description: 'Retrieve all current active wildfire clusters sorted by risk score with coordinates and stats.'
  },
  {
    name: 'get_fire_cluster',
    description: 'Retrieve full detailed information for a specific wildfire cluster by ID.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        cluster_id: { type: Type.STRING, description: 'Cluster ID, e.g. "CLUSTER-001"' }
      },
      required: ['cluster_id']
    }
  },
  {
    name: 'get_weather',
    description: 'Get current meteorological observations for latitude and longitude.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        latitude: { type: Type.NUMBER, description: 'Latitude coordinate' },
        longitude: { type: Type.NUMBER, description: 'Longitude coordinate' }
      },
      required: ['latitude', 'longitude']
    }
  },
  {
    name: 'get_risk_prediction',
    description: 'Get ML-derived risk score, risk level, and spread vector for a cluster.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        cluster_id: { type: Type.STRING, description: 'Cluster ID' }
      },
      required: ['cluster_id']
    }
  },
  {
    name: 'get_exposed_assets',
    description: 'Get vulnerable populated places, hospitals, schools, and highways near a fire cluster.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        cluster_id: { type: Type.STRING, description: 'Cluster ID' }
      },
      required: ['cluster_id']
    }
  },
  {
    name: 'get_model_explanation',
    description: 'Get SHAP-style feature importance explanation showing why a fire is classified as high or critical risk.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        cluster_id: { type: Type.STRING, description: 'Cluster ID' }
      },
      required: ['cluster_id']
    }
  },
  {
    name: 'generate_response_summary',
    description: 'Generate operational emergency response tactical recommendations for a cluster.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        cluster_id: { type: Type.STRING, description: 'Cluster ID' }
      },
      required: ['cluster_id']
    }
  }
];

export async function queryIntelligenceAgent(userPrompt: string): Promise<AgentMessage> {
  const toolLogs: AgentToolCallLog[] = [];
  const apiKey = process.env.GEMINI_API_KEY;

  // Check if Gemini API can be used
  if (apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: `You are the EmberWatch Tactical Wildfire Intelligence Agent. You are a helpful, empathetic, and friendly AI assistant speaking to humans.
While you use structured data from EmberWatch tools, you must explain things in a natural, easy-to-understand, and nice conversational tone. Avoid overly robotic jargon.
You still MUST call tools to inspect active fires, weather, and predictions.
Never fabricate data. When giving risk scores, wind speeds, or exposed settlements, weave them naturally into a friendly conversation.
Frame outputs as helpful decision-support advice, not cold emergency declarations. Be warm and supportive!`,
          tools: [{ functionDeclarations }]
        }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          const fnName = call.name as keyof typeof agentTools;
          let result = {};
          if (agentTools[fnName]) {
            result = await (agentTools[fnName] as any)(call.args || {});
          }

          toolLogs.push({
            toolName: fnName,
            args: (call.args as Record<string, any>) || {},
            resultSummary: JSON.stringify(result).slice(0, 160) + '...',
            timestamp: new Date().toISOString()
          });
        }

        // Secondary synthesis call with tool results
        const clusters = await agentTools.get_active_fires();
        const topCluster = clusters[0];
        const assets = topCluster ? await agentTools.get_exposed_assets({ cluster_id: topCluster.id }) : null;
        const explanation = topCluster ? await agentTools.get_model_explanation({ cluster_id: topCluster.id }) : null;

        const followUp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `User question: "${userPrompt}".
Tool executions retrieved:
Active fires: ${JSON.stringify(clusters)}
Top Priority Cluster: ${JSON.stringify(topCluster)}
Exposed Assets: ${JSON.stringify(assets)}
Model Explanation: ${JSON.stringify(explanation)}

Write a very friendly, human-like response explaining which event to prioritize. Use an empathetic and conversational tone. Include the necessary details (risk scores, wind speeds, spread vectors, settlements) but make it easy to understand and nice to read. Avoid robotic formatting.`
        });

        return {
          id: `AGENT-MSG-${Date.now()}`,
          role: 'assistant',
          content: followUp.text || 'Analysis complete.',
          toolCalls: toolLogs,
          timestamp: new Date().toISOString()
        };
      } else if (response.text) {
        return {
          id: `AGENT-MSG-${Date.now()}`,
          role: 'assistant',
          content: response.text,
          toolCalls: toolLogs,
          timestamp: new Date().toISOString()
        };
      }
    } catch (err: any) {
      console.warn('[Intelligence Agent] Gemini API call encountered error, falling back to deterministic tool engine:', err?.message || err);
    }
  }

  // Deterministic Grounded Tool Execution (Runs without external API key dependency)
  const lower = userPrompt.toLowerCase();
  const clusters = await agentTools.get_active_fires();
  toolLogs.push({
    toolName: 'get_active_fires',
    args: {},
    resultSummary: `Retrieved ${clusters.length} active clusters. Top risk: ${clusters[0]?.name || 'None'} (${clusters[0]?.risk_score}/100)`,
    timestamp: new Date().toISOString()
  });

  const topCluster = clusters[0];
  let answer = '';

  if (lower.includes('priorit') || lower.includes('highest') || lower.includes('which fire') || lower.includes('threat')) {
    if (!topCluster) {
      answer = 'No active wildfire clusters currently detected in the monitoring boundary.';
    } else {
      const clusterDetail = await agentTools.get_fire_cluster({ cluster_id: topCluster.id });
      const assets = await agentTools.get_exposed_assets({ cluster_id: topCluster.id });
      const explanation = await agentTools.get_model_explanation({ cluster_id: topCluster.id });

      toolLogs.push({
        toolName: 'get_fire_cluster',
        args: { cluster_id: topCluster.id },
        resultSummary: `Detail for ${topCluster.name}: Max FRP ${topCluster.max_frp} MW, Hotspots ${topCluster.hotspot_count}`,
        timestamp: new Date().toISOString()
      });
      toolLogs.push({
        toolName: 'get_exposed_assets',
        args: { cluster_id: topCluster.id },
        resultSummary: `Found ${assets.exposed_assets_count} exposed assets within 25 km risk zone`,
        timestamp: new Date().toISOString()
      });
      toolLogs.push({
        toolName: 'get_model_explanation',
        args: { cluster_id: topCluster.id },
        resultSummary: `Top contributing features: ${(explanation.contributions || []).slice(0, 3).map((c: any) => c.displayName).join(', ')}`,
        timestamp: new Date().toISOString()
      });

      const topContributing = (explanation.contributions || [])
        .slice(0, 3)
        .map((c: any) => `${c.displayName} (${c.value})`)
        .join(', ');

      const settlements = (assets.critical_assets || [])
        .filter((a: any) => a.type === 'SETTLEMENT')
        .map((a: any) => `${a.name} (${a.distanceKm} km)`)
        .join(', ') || 'Rural interface';

      answer = `### Let's look at ${topCluster.name} (Cluster #${topCluster.cluster_number}) 🌲🔥

Hi there! Based on the current data, I highly recommend focusing our attention on **${topCluster.name}**. Here's a quick, easy-to-read summary of why it's our top priority:

- **Current Risk Level**: It's currently at **${topCluster.risk_score} / 100 (${topCluster.risk_level})**, which is the highest of all ${clusters.length} active fires we're tracking.
- **Where It's Headed**: The fire is likely moving **${topCluster.likely_threat_direction}** with a **${topCluster.spread_risk}** chance of spreading quickly.
- **Main Factors**: It looks like ${topContributing} are the main things driving this fire right now.
- **What's at Risk**: There are ${assets.exposed_assets_count} important locations within 25 km, mostly around **${settlements}**. We really need to keep an eye on these communities!

**My Recommendation**: It would be a great idea to issue some early readiness advisories for folks downwind, especially towards the ${topCluster.likely_threat_direction}. Sending out some aerial scouts could also give us a better view of the situation. Stay safe out there!`;
    }
  } else if (lower.includes('weather') || lower.includes('wind')) {
    const targetCluster = clusters[0];
    const weather = targetCluster ? await agentTools.get_weather({ latitude: targetCluster.center[0], longitude: targetCluster.center[1] }) : null;
    toolLogs.push({
      toolName: 'get_weather',
      args: targetCluster ? { latitude: targetCluster.center[0], longitude: targetCluster.center[1] } : {},
      resultSummary: weather ? `${weather.temperature_2m}°C, RH ${weather.relative_humidity_2m}%, wind ${weather.wind_speed_10m} km/h` : 'No data',
      timestamp: new Date().toISOString()
    });

    answer = weather
      ? `### Weather Update for the Area 🌤️
Here's what the weather is looking like right now around the active fire:

- **Temperature**: It's currently ${weather.temperature_2m}°C, which is warming things up.
- **Humidity**: The air is at ${weather.relative_humidity_2m}% humidity. (${weather.relative_humidity_2m < 15 ? 'It is quite dry out there, so we need to be careful!' : 'It is moderately dry.'})
- **Wind Speed**: Winds are blowing at a sustained ${weather.wind_speed_10m} km/h.
- **Wind Direction**: The wind is pushing towards the ${Math.round((weather.wind_direction_10m + 180) % 360)}° mark.

Because of these conditions, the fire might spread a bit faster than usual. Please make sure teams are aware of the wind direction! Let me know if you need anything else.`
      : "I am so sorry, but I couldn't grab the latest weather updates right now.";
  } else {
    answer = `### 👋 Welcome to EmberWatch Intelligence!
I'm here to help you keep track of things. Right now, I'm keeping a close eye on **${clusters.length} active wildfires** (which includes **${clusters.reduce((acc, c) => acc + c.hotspot_count, 0)} hotspots**).

Here is a quick snapshot of the most pressing situation:
- **Top Priority**: ${topCluster ? `${topCluster.name} (Risk score of ${topCluster.risk_score} - ${topCluster.risk_level})` : 'Everything is calm right now!'}
- **Headed Towards**: ${topCluster ? topCluster.likely_threat_direction : 'N/A'}
- **Nearby Communities**: ${topCluster ? `We have ${topCluster.exposed_settlements_count} settlement(s) close by.` : 'None'}

Feel free to ask me anything! You can ask me to prioritize fires, check the weather, look into a specific fire (like *Cluster #1*), or see what communities might be at risk. I'm always happy to help!`;
  }

  return {
    id: `AGENT-MSG-${Date.now()}`,
    role: 'assistant',
    content: answer,
    toolCalls: toolLogs,
    timestamp: new Date().toISOString()
  };
}
