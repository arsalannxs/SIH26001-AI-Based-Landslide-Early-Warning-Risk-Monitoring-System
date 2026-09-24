import { MongoClient, Db, Collection } from 'mongodb';
import { 
  HazardZone, 
  RoadConnectivity, 
  SensorTelemetry, 
  FieldReport, 
  EarlyWarningAlert 
} from '../src/types/disaster';
import { 
  INITIAL_HAZARD_ZONES, 
  INITIAL_ROADS, 
  INITIAL_SENSORS, 
  INITIAL_FIELD_REPORTS, 
  INITIAL_ALERTS 
} from '../src/data/nerData';

export interface DatabaseState {
  connected: boolean;
  type: 'mongodb_atlas' | 'local_fallback';
  databaseName: string;
  clusterHost?: string;
  lastConnectedAt?: string;
  error?: string;
  counts: {
    zones: number;
    roads: number;
    sensors: number;
    reports: number;
    alerts: number;
  };
}

class DisasterDatabaseManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private currentUri: string = '';
  private isAtlasConnected: boolean = false;
  private connectionError: string | null = null;

  // Local fallback storage
  private localZones: HazardZone[] = [...INITIAL_HAZARD_ZONES];
  private localRoads: RoadConnectivity[] = [...INITIAL_ROADS];
  private localSensors: SensorTelemetry[] = [...INITIAL_SENSORS];
  private localReports: FieldReport[] = [...INITIAL_FIELD_REPORTS];
  private localAlerts: EarlyWarningAlert[] = [...INITIAL_ALERTS];

  constructor() {
    const envUri = process.env.MONGODB_URI;
    if (envUri && envUri.trim() !== '') {
      this.connectToMongo(envUri).catch(err => {
        console.warn('Initial MongoDB Atlas connect warning:', err.message);
      });
    }
  }

  public async connectToMongo(uri: string): Promise<{ success: boolean; message: string; state: DatabaseState }> {
    try {
      if (this.client) {
        await this.client.close().catch(() => {});
        this.client = null;
        this.db = null;
        this.isAtlasConnected = false;
      }

      this.currentUri = uri;
      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 8000,
      });

      await this.client.connect();
      // Use database name from URI or default to 'ner_disaster_db'
      this.db = this.client.db('ner_disaster_db');
      await this.db.command({ ping: 1 });
      this.isAtlasConnected = true;
      this.connectionError = null;

      // Seed if collections are empty
      await this.seedAtlasIfEmpty();

      return {
        success: true,
        message: 'Successfully connected to MongoDB Atlas cluster and verified ping.',
        state: await this.getStatus()
      };
    } catch (err: any) {
      this.isAtlasConnected = false;
      this.connectionError = err.message || 'Failed to connect to MongoDB Atlas';
      console.warn('MongoDB Atlas connection failed, using local resilient store:', this.connectionError);
      return {
        success: false,
        message: `Atlas connection error: ${this.connectionError}. Using local resilient repository.`,
        state: await this.getStatus()
      };
    }
  }

  private async seedAtlasIfEmpty() {
    if (!this.db || !this.isAtlasConnected) return;

    try {
      const zonesCol = this.db.collection<HazardZone>('hazard_zones');
      const count = await zonesCol.countDocuments();
      if (count === 0) {
        await zonesCol.insertMany(INITIAL_HAZARD_ZONES as any[]);
        await this.db.collection('roads').insertMany(INITIAL_ROADS as any[]);
        await this.db.collection('sensors').insertMany(INITIAL_SENSORS as any[]);
        await this.db.collection('field_reports').insertMany(INITIAL_FIELD_REPORTS as any[]);
        await this.db.collection('alerts').insertMany(INITIAL_ALERTS as any[]);
        console.log('Seeded initial NER disaster datasets into MongoDB Atlas.');
      }
    } catch (e) {
      console.error('Error seeding Atlas:', e);
    }
  }

  public async forceSeedAtlas(): Promise<void> {
    if (!this.db || !this.isAtlasConnected) {
      this.localZones = [...INITIAL_HAZARD_ZONES];
      this.localRoads = [...INITIAL_ROADS];
      this.localSensors = [...INITIAL_SENSORS];
      this.localReports = [...INITIAL_FIELD_REPORTS];
      this.localAlerts = [...INITIAL_ALERTS];
      return;
    }

    try {
      await this.db.collection('hazard_zones').deleteMany({});
      await this.db.collection('hazard_zones').insertMany(INITIAL_HAZARD_ZONES as any[]);
      
      await this.db.collection('roads').deleteMany({});
      await this.db.collection('roads').insertMany(INITIAL_ROADS as any[]);

      await this.db.collection('sensors').deleteMany({});
      await this.db.collection('sensors').insertMany(INITIAL_SENSORS as any[]);

      await this.db.collection('field_reports').deleteMany({});
      await this.db.collection('field_reports').insertMany(INITIAL_FIELD_REPORTS as any[]);

      await this.db.collection('alerts').deleteMany({});
      await this.db.collection('alerts').insertMany(INITIAL_ALERTS as any[]);
    } catch (e) {
      console.error('Error force seeding Atlas:', e);
    }
  }

  public async getStatus(): Promise<DatabaseState> {
    if (this.isAtlasConnected && this.db) {
      try {
        const [z, r, s, rep, a] = await Promise.all([
          this.db.collection('hazard_zones').countDocuments().catch(() => 0),
          this.db.collection('roads').countDocuments().catch(() => 0),
          this.db.collection('sensors').countDocuments().catch(() => 0),
          this.db.collection('field_reports').countDocuments().catch(() => 0),
          this.db.collection('alerts').countDocuments().catch(() => 0),
        ]);

        let clusterHost = 'Atlas Cloud Cluster';
        if (this.currentUri.includes('@')) {
          clusterHost = this.currentUri.split('@')[1].split('/')[0].split('?')[0];
        }

        return {
          connected: true,
          type: 'mongodb_atlas',
          databaseName: this.db.databaseName,
          clusterHost,
          lastConnectedAt: new Date().toISOString(),
          counts: {
            zones: z,
            roads: r,
            sensors: s,
            reports: rep,
            alerts: a
          }
        };
      } catch (err: any) {
        this.isAtlasConnected = false;
        this.connectionError = err.message;
      }
    }

    return {
      connected: false,
      type: 'local_fallback',
      databaseName: 'ner_disaster_db (local-resilient)',
      clusterHost: 'In-Memory / Persistent JSON Adapter',
      error: this.connectionError || undefined,
      counts: {
        zones: this.localZones.length,
        roads: this.localRoads.length,
        sensors: this.localSensors.length,
        reports: this.localReports.length,
        alerts: this.localAlerts.length,
      }
    };
  }

  // --- Collection Queries ---

  public async getZones(): Promise<HazardZone[]> {
    if (this.isAtlasConnected && this.db) {
      try {
        const list = await this.db.collection<HazardZone>('hazard_zones').find().toArray();
        if (list.length > 0) return list;
      } catch (e) {
        console.error('Atlas getZones error:', e);
      }
    }
    return this.localZones;
  }

  public async updateZone(zoneId: string, updates: Partial<HazardZone>): Promise<HazardZone | null> {
    if (this.isAtlasConnected && this.db) {
      try {
        await this.db.collection('hazard_zones').updateOne({ id: zoneId }, { $set: updates });
        const updated = await this.db.collection<HazardZone>('hazard_zones').findOne({ id: zoneId });
        if (updated) return updated;
      } catch (e) {
        console.error('Atlas updateZone error:', e);
      }
    }
    const idx = this.localZones.findIndex(z => z.id === zoneId);
    if (idx !== -1) {
      this.localZones[idx] = { ...this.localZones[idx], ...updates };
      return this.localZones[idx];
    }
    return null;
  }

  public async getRoads(): Promise<RoadConnectivity[]> {
    if (this.isAtlasConnected && this.db) {
      try {
        const list = await this.db.collection<RoadConnectivity>('roads').find().toArray();
        if (list.length > 0) return list;
      } catch (e) {
        console.error('Atlas getRoads error:', e);
      }
    }
    return this.localRoads;
  }

  public async updateRoadStatus(roadId: string, status: RoadConnectivity['status'], reason?: string): Promise<RoadConnectivity | null> {
    const updatePayload: Partial<RoadConnectivity> = { status, blockageReason: reason, lastReported: 'Just now' };
    if (this.isAtlasConnected && this.db) {
      try {
        await this.db.collection('roads').updateOne({ id: roadId }, { $set: updatePayload });
        const updated = await this.db.collection<RoadConnectivity>('roads').findOne({ id: roadId });
        if (updated) return updated;
      } catch (e) {
        console.error('Atlas updateRoadStatus error:', e);
      }
    }
    const idx = this.localRoads.findIndex(r => r.id === roadId);
    if (idx !== -1) {
      this.localRoads[idx] = { ...this.localRoads[idx], ...updatePayload };
      return this.localRoads[idx];
    }
    return null;
  }

  public async getSensors(): Promise<SensorTelemetry[]> {
    if (this.isAtlasConnected && this.db) {
      try {
        const list = await this.db.collection<SensorTelemetry>('sensors').find().toArray();
        if (list.length > 0) return list;
      } catch (e) {
        console.error('Atlas getSensors error:', e);
      }
    }
    return this.localSensors;
  }

  public async getFieldReports(): Promise<FieldReport[]> {
    if (this.isAtlasConnected && this.db) {
      try {
        const list = await this.db.collection<FieldReport>('field_reports').find().sort({ timestamp: -1 }).toArray();
        if (list.length > 0) return list;
      } catch (e) {
        console.error('Atlas getFieldReports error:', e);
      }
    }
    return this.localReports;
  }

  public async addFieldReport(report: FieldReport): Promise<FieldReport> {
    if (this.isAtlasConnected && this.db) {
      try {
        await this.db.collection('field_reports').insertOne(report as any);
      } catch (e) {
        console.error('Atlas addFieldReport error:', e);
      }
    }
    this.localReports.unshift(report);
    return report;
  }

  public async getAlerts(): Promise<EarlyWarningAlert[]> {
    if (this.isAtlasConnected && this.db) {
      try {
        const list = await this.db.collection<EarlyWarningAlert>('alerts').find().sort({ issuedAt: -1 }).toArray();
        if (list.length > 0) return list;
      } catch (e) {
        console.error('Atlas getAlerts error:', e);
      }
    }
    return this.localAlerts;
  }

  public async addAlert(alert: EarlyWarningAlert): Promise<EarlyWarningAlert> {
    if (this.isAtlasConnected && this.db) {
      try {
        await this.db.collection('alerts').insertOne(alert as any);
      } catch (e) {
        console.error('Atlas addAlert error:', e);
      }
    }
    this.localAlerts.unshift(alert);
    return alert;
  }
}

export const dbManager = new DisasterDatabaseManager();
