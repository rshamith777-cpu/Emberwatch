import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { runIntelligencePipeline, getSystemStatus, initializePipelineFast } from './server/pipeline.js';
import { db } from './server/db.js';
import { queryIntelligenceAgent } from './server/agents/intelligenceAgent.js';

dotenv.config();

const PORT = 3000;
const HOST = '0.0.0.0';

async function startServer() {
  const app = express();
  app.use(express.json());

  // Fast synchronous initial database priming so endpoints are ready immediately
  console.log('[EmberWatch] Initializing wildfire intelligence engine...');
  initializePipelineFast();

  // Background refresh scheduler
  const refreshMins = Math.max(1, parseInt(process.env.DATA_REFRESH_MINUTES || '10', 10));
  setInterval(async () => {
    console.log('[EmberWatch] Running scheduled pipeline refresh...');
    await runIntelligencePipeline();
  }, refreshMins * 60 * 1000);

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'EmberWatch Wildfire Intelligence', timestamp: new Date().toISOString() });
  });

  // System status
  app.get('/api/status', (req, res) => {
    res.json(getSystemStatus());
  });

  // Active fire clusters
  app.get('/api/clusters', (req, res) => {
    const clusters = db.getClusters();
    res.json(clusters);
  });

  // Single fire cluster
  app.get('/api/clusters/:id', (req, res) => {
    const cluster = db.getClusterById(req.params.id);
    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }
    res.json(cluster);
  });

  // Raw satellite fire observations
  app.get('/api/hotspots', (req, res) => {
    const observations = db.getAllObservations();
    res.json(observations);
  });

  // Automated alerts
  app.get('/api/alerts', (req, res) => {
    res.json(db.getAlerts());
  });

  // Model validation metrics & metadata
  app.get('/api/model/metrics', (req, res) => {
    res.json(db.getModelMetrics());
  });

  // System event telemetry log
  app.get('/api/events', (req, res) => {
    res.json(db.getSystemEvents(50));
  });

  // Manual pipeline trigger
  app.post('/api/pipeline/refresh', async (req, res) => {
    const result = await runIntelligencePipeline();
    res.json({
      success: result.success,
      status: result.status,
      clusterCount: result.clusters.length,
      message: 'Pipeline executed successfully.'
    });
  });

  // Mode switcher (LIVE vs DEMO_SNAPSHOT)
  app.post('/api/pipeline/mode', async (req, res) => {
    const mode = req.body.mode === 'DEMO_SNAPSHOT' ? 'DEMO_SNAPSHOT' : 'LIVE';
    if (mode === 'DEMO_SNAPSHOT') {
      db.clearAll();
    }
    const result = await runIntelligencePipeline(mode);
    res.json({
      success: result.success,
      mode,
      status: result.status
    });
  });

  // Intelligence Agent with tool execution
  app.post('/api/agent/query', async (req, res) => {
    try {
      const userPrompt = req.body.prompt;
      if (!userPrompt || typeof userPrompt !== 'string') {
        return res.status(400).json({ error: 'Missing prompt parameter' });
      }
      const response = await queryIntelligenceAgent(userPrompt);
      res.json(response);
    } catch (err: any) {
      console.error('[Agent API] Error:', err);
      res.status(500).json({ error: err?.message || 'Agent query failed' });
    }
  });

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[EmberWatch] Server active on http://${HOST}:${PORT}`);
    // Non-blocking background live pipeline refresh
    runIntelligencePipeline().catch((err) => {
      console.warn('[EmberWatch] Background initial pipeline refresh warning:', err);
    });
  });
}

startServer().catch((err) => {
  console.error('[EmberWatch] Fatal startup error:', err);
  process.exit(1);
});
