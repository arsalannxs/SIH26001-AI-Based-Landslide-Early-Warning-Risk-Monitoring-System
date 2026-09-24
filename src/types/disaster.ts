export type RiskSeverity = 'critical' | 'high' | 'moderate' | 'low';

export type RoadStatus = 'open' | 'blocked' | 'caution' | 'restricted';

export interface GeoLocation {
  lat: number;
  lng: number;
  altitude?: number;
  district: string;
  state: 'Sikkim' | 'Assam' | 'Meghalaya' | 'Arunachal Pradesh' | 'Nagaland' | 'Manipur' | 'Mizoram' | 'Tripura';
}

export interface HazardZone {
  id: string;
  name: string;
  location: GeoLocation;
  slopeAngleDeg: number;
  soilMoisturePct: number;
  poreWaterPressureKPa: number;
  rainfall24hMm: number;
  rainfall72hMm: number;
  displacementRateMmDay: number;
  geologyType: string;
  vegetationCoverPct: number;
  riskScore: number; // 0 - 100
  riskSeverity: RiskSeverity;
  affectedRoad?: string;
  nearbyVillages: string[];
  populationAtRisk: number;
  lastUpdated: string;
  activeSensorsCount: number;
  thresholdExceeded: boolean;
}

export interface RoadConnectivity {
  id: string;
  name: string;
  highwayNumber: string;
  segment: string;
  state: string;
  status: RoadStatus;
  blockageReason?: string;
  alternateRoute?: string;
  clearingCrewAssigned?: string;
  estimatedClearanceHours?: number;
  criticalForSupplies: boolean;
  lengthKm: number;
  lastReported: string;
}

export interface SensorTelemetry {
  id: string;
  zoneId: string;
  zoneName: string;
  type: 'inclinometer' | 'piezometer' | 'rain_gauge' | 'extensometer' | 'soil_moisture';
  unit: string;
  currentValue: number;
  thresholdValue: number;
  batteryPct: number;
  status: 'online' | 'warning' | 'offline';
  history: { timestamp: string; value: number }[];
}

export interface FieldReport {
  id: string;
  reporterName: string;
  reporterRole: 'citizen' | 'field_official' | 'pwd_engineer' | 'bro_personnel';
  phone?: string;
  location: GeoLocation;
  landmark: string;
  hazardType: 'tension_cracks' | 'soil_slumping' | 'rockfall' | 'debris_flow' | 'road_culvert_failure';
  severity: RiskSeverity;
  description: string;
  photoUrl?: string;
  timestamp: string;
  status: 'pending_review' | 'verified_by_ai' | 'crew_dispatched' | 'resolved';
  aiAnalysis?: {
    crackWidthEstMm?: number;
    failureProbabilityPct?: number;
    recommendedAction?: string;
    verified: boolean;
  };
  offlineCreated?: boolean;
}

export interface EarlyWarningAlert {
  id: string;
  title: string;
  severity: RiskSeverity;
  affectedDistricts: string[];
  state: string;
  issuedAt: string;
  validUntil: string;
  headline: string;
  instructions: string[];
  languages: {
    language: string;
    headline: string;
    message: string;
  }[];
  smsSentCount: number;
  evacuationRecommended: boolean;
}

export interface WeatherLinkedRiskForecast {
  district: string;
  state: string;
  day1RainMm: number;
  day2RainMm: number;
  day3RainMm: number;
  imdAlertLevel: 'Red' | 'Orange' | 'Yellow' | 'Green';
  landslideProbabilityPct: number;
  recommendedPrep: string;
}

export interface EmergencyResource {
  id: string;
  unitName: string;
  type: 'NDRF_Battalion' | 'SDRF_Unit' | 'BRO_Task_Force' | 'District_Hospital' | 'Relief_Camp';
  location: string;
  state: string;
  contactNumber: string;
  status: 'deployed' | 'standby' | 'mobilizing';
  assignedZoneId?: string;
}
