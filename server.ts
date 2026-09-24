import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbManager } from './server/db.ts';
import { 
  predictLandslideRisk, 
  analyzeFieldPhotoReport, 
  generateMultilingualBulletin 
} from './server/aiService.ts';
import { 
  INITIAL_WEATHER_FORECASTS, 
  INITIAL_EMERGENCY_RESOURCES 
} from './src/data/nerData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware for parsing JSON with generous payload limit for field photos
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// --- API Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'NER Drishti - AI Landslide Early Warning System',
    timestamp: new Date().toISOString()
  });
});

// Database status & Atlas connection
app.get('/api/db/status', async (req, res) => {
  try {
    const status = await dbManager.getStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/db/connect', async (req, res) => {
  const { uri } = req.body;
  if (!uri || typeof uri !== 'string') {
    return res.status(400).json({ error: 'MongoDB Atlas URI string is required.' });
  }
  const result = await dbManager.connectToMongo(uri);
  res.json(result);
});

app.post('/api/db/seed', async (req, res) => {
  try {
    await dbManager.forceSeedAtlas();
    const status = await dbManager.getStatus();
    res.json({ success: true, message: 'Database refreshed with NER disaster seed data.', state: status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Hazard Zones
app.get('/api/zones', async (req, res) => {
  try {
    const zones = await dbManager.getZones();
    res.json(zones);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/zones/:id', async (req, res) => {
  try {
    const updated = await dbManager.updateZone(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Zone not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Road Connectivity
app.get('/api/roads', async (req, res) => {
  try {
    const roads = await dbManager.getRoads();
    res.json(roads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/roads/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    const updated = await dbManager.updateRoadStatus(req.params.id, status, reason);
    if (!updated) return res.status(404).json({ error: 'Road not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sensors Telemetry
app.get('/api/sensors', async (req, res) => {
  try {
    const sensors = await dbManager.getSensors();
    res.json(sensors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Field Reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await dbManager.getFieldReports();
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const reportData = req.body;
    const newReport = {
      ...reportData,
      id: reportData.id || `rep-${Date.now().toString(36)}`,
      timestamp: reportData.timestamp || 'Just now',
      status: reportData.status || 'verified_by_ai'
    };
    const saved = await dbManager.addFieldReport(newReport);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await dbManager.getAlerts();
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/alerts/broadcast', async (req, res) => {
  try {
    const alertData = req.body;
    const newAlert = {
      ...alertData,
      id: alertData.id || `alert-${Date.now().toString(36)}`,
      issuedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      smsSentCount: alertData.smsSentCount || 15400
    };
    const saved = await dbManager.addAlert(newAlert);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Weather Linked Risk Forecasts
app.get('/api/weather-forecasts', (req, res) => {
  res.json(INITIAL_WEATHER_FORECASTS);
});

// Emergency Resources
app.get('/api/emergency-resources', (req, res) => {
  res.json(INITIAL_EMERGENCY_RESOURCES);
});

// AI Risk Prediction Endpoint
app.post('/api/ai/predict', async (req, res) => {
  try {
    const zoneData = req.body;
    const prediction = await predictLandslideRisk(zoneData);
    res.json(prediction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI Field Photo Analysis
app.post('/api/ai/analyze-photo', async (req, res) => {
  try {
    const { imageBase64, mimeType, userNotes, landmark } = req.body;
    const result = await analyzeFieldPhotoReport(imageBase64, mimeType || 'image/jpeg', userNotes || '', landmark || '');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI Multilingual Bulletin Synthesizer
app.post('/api/ai/multilingual-bulletin', async (req, res) => {
  try {
    const { zoneName, state, district, severity, instructions } = req.body;
    const bulletins = await generateMultilingualBulletin(
      zoneName || 'Monitored Hill Slope',
      state || 'NER',
      district || 'District Centre',
      severity || 'critical',
      instructions || []
    );
    res.json(bulletins);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Frontend Mounting (Vite in Dev / Static in Prod) ---

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NER Drishti] Server running at http://localhost:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer();
