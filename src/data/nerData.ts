import { HazardZone, RoadConnectivity, SensorTelemetry, FieldReport, EarlyWarningAlert, WeatherLinkedRiskForecast, EmergencyResource } from '../types/disaster';

export const INITIAL_HAZARD_ZONES: HazardZone[] = [
  {
    id: 'zone-sik-01',
    name: 'Dikchu-Singtam Valley Slope (NH-10)',
    location: {
      lat: 27.3824,
      lng: 88.5132,
      altitude: 1420,
      district: 'Gangtok',
      state: 'Sikkim'
    },
    slopeAngleDeg: 52,
    soilMoisturePct: 88,
    poreWaterPressureKPa: 42.5,
    rainfall24hMm: 164,
    rainfall72hMm: 312,
    displacementRateMmDay: 18.4,
    geologyType: 'Fractured Phyllite & Gneiss with Colluvial Overburden',
    vegetationCoverPct: 35,
    riskScore: 92,
    riskSeverity: 'critical',
    affectedRoad: 'NH-10 (Siliguri - Gangtok Lifeline)',
    nearbyVillages: ['Dikchu Basti', 'Lower Martam', 'Rakdong'],
    populationAtRisk: 4200,
    lastUpdated: '10 mins ago',
    activeSensorsCount: 4,
    thresholdExceeded: true
  },
  {
    id: 'zone-asm-02',
    name: 'Haflong Hill Section Cut Slope',
    location: {
      lat: 25.1764,
      lng: 93.0238,
      altitude: 960,
      district: 'Dima Hasao',
      state: 'Assam'
    },
    slopeAngleDeg: 46,
    soilMoisturePct: 82,
    poreWaterPressureKPa: 38.1,
    rainfall24hMm: 138,
    rainfall72hMm: 245,
    displacementRateMmDay: 12.1,
    geologyType: 'Soft Tertiary Shale & Weathered Sandstone',
    vegetationCoverPct: 40,
    riskScore: 84,
    riskSeverity: 'critical',
    affectedRoad: 'Lumding - Badarpur Rail Link & Haflong Bypass',
    nearbyVillages: ['Jatinga Village', 'Lower Haflong', 'Mahur'],
    populationAtRisk: 6800,
    lastUpdated: '25 mins ago',
    activeSensorsCount: 5,
    thresholdExceeded: true
  },
  {
    id: 'zone-meg-03',
    name: 'Sohra-Shella Escarpment & Mawkdok Gorge',
    location: {
      lat: 25.2986,
      lng: 91.7342,
      altitude: 1280,
      district: 'East Khasi Hills',
      state: 'Meghalaya'
    },
    slopeAngleDeg: 58,
    soilMoisturePct: 76,
    poreWaterPressureKPa: 29.4,
    rainfall24hMm: 210,
    rainfall72hMm: 410,
    displacementRateMmDay: 9.8,
    geologyType: 'Karst Limestone & Sandstone Cuesta',
    vegetationCoverPct: 55,
    riskScore: 78,
    riskSeverity: 'high',
    affectedRoad: 'Shillong - Sohra Scenic Corridor (SH-5)',
    nearbyVillages: ['Mawkdok', 'Laitryngew', 'Kaithep'],
    populationAtRisk: 2900,
    lastUpdated: '18 mins ago',
    activeSensorsCount: 3,
    thresholdExceeded: true
  },
  {
    id: 'zone-miz-04',
    name: 'Hunthar Ridge Slope (Aizawl West)',
    location: {
      lat: 23.7548,
      lng: 92.7012,
      altitude: 880,
      district: 'Aizawl',
      state: 'Mizoram'
    },
    slopeAngleDeg: 48,
    soilMoisturePct: 74,
    poreWaterPressureKPa: 26.2,
    rainfall24hMm: 95,
    rainfall72hMm: 180,
    displacementRateMmDay: 8.6,
    geologyType: 'Surma Group Siltstone & Clay Bedding',
    vegetationCoverPct: 28,
    riskScore: 76,
    riskSeverity: 'high',
    affectedRoad: 'NH-54 / Aizawl - Lengpui Airport Road',
    nearbyVillages: ['Hunthar Veng', 'Chawnpui', 'Kanan Veng'],
    populationAtRisk: 5400,
    lastUpdated: '32 mins ago',
    activeSensorsCount: 4,
    thresholdExceeded: true
  },
  {
    id: 'zone-nag-05',
    name: 'Phesama-Zubza Slide Zone (NH-29)',
    location: {
      lat: 25.6241,
      lng: 94.0895,
      altitude: 1350,
      district: 'Kohima',
      state: 'Nagaland'
    },
    slopeAngleDeg: 42,
    soilMoisturePct: 69,
    poreWaterPressureKPa: 22.0,
    rainfall24hMm: 72,
    rainfall72hMm: 140,
    displacementRateMmDay: 5.4,
    geologyType: 'Disang Shales with Active Fault Shear Zone',
    vegetationCoverPct: 45,
    riskScore: 68,
    riskSeverity: 'high',
    affectedRoad: 'NH-29 (Dimapur - Kohima - Imphal Highway)',
    nearbyVillages: ['Phesama', 'Kigwema', 'Jakhama'],
    populationAtRisk: 3100,
    lastUpdated: '45 mins ago',
    activeSensorsCount: 3,
    thresholdExceeded: false
  },
  {
    id: 'zone-aru-06',
    name: 'Baisakhi - Sela Pass Access Incline',
    location: {
      lat: 27.4892,
      lng: 92.1264,
      altitude: 3800,
      district: 'Tawang',
      state: 'Arunachal Pradesh'
    },
    slopeAngleDeg: 61,
    soilMoisturePct: 58,
    poreWaterPressureKPa: 18.5,
    rainfall24hMm: 64,
    rainfall72hMm: 110,
    displacementRateMmDay: 4.1,
    geologyType: 'Glacial Moraine & High Altitude Schist',
    vegetationCoverPct: 15,
    riskScore: 62,
    riskSeverity: 'high',
    affectedRoad: 'Balipara - Charduar - Tawang (BCT) Military Road',
    nearbyVillages: ['Baisakhi Camp', 'Jaswantgarh Post'],
    populationAtRisk: 1100,
    lastUpdated: '1 hour ago',
    activeSensorsCount: 2,
    thresholdExceeded: false
  },
  {
    id: 'zone-man-07',
    name: 'Noney-Awangkhul Mountain Cut (NH-37)',
    location: {
      lat: 24.8142,
      lng: 93.6218,
      altitude: 620,
      district: 'Noney',
      state: 'Manipur'
    },
    slopeAngleDeg: 49,
    soilMoisturePct: 71,
    poreWaterPressureKPa: 24.8,
    rainfall24hMm: 82,
    rainfall72hMm: 152,
    displacementRateMmDay: 6.2,
    geologyType: 'Barail Flysch Sediment & Siltstone',
    vegetationCoverPct: 50,
    riskScore: 71,
    riskSeverity: 'high',
    affectedRoad: 'NH-37 (Imphal - Jiribam Expressway)',
    nearbyVillages: ['Marangching', 'Tupul', 'Awangkhul'],
    populationAtRisk: 2400,
    lastUpdated: '50 mins ago',
    activeSensorsCount: 3,
    thresholdExceeded: false
  },
  {
    id: 'zone-tri-08',
    name: 'Baramura Hill Range Pass (NH-08)',
    location: {
      lat: 23.8912,
      lng: 91.5641,
      altitude: 340,
      district: 'Khowai',
      state: 'Tripura'
    },
    slopeAngleDeg: 34,
    soilMoisturePct: 48,
    poreWaterPressureKPa: 14.1,
    rainfall24hMm: 38,
    rainfall72hMm: 72,
    displacementRateMmDay: 1.8,
    geologyType: 'Unconsolidated Sandy Loam & Clay Overburden',
    vegetationCoverPct: 65,
    riskScore: 36,
    riskSeverity: 'low',
    affectedRoad: 'NH-08 (Agartala - Silchar Link)',
    nearbyVillages: ['Teliamura Outskirts', 'Chakmaghat'],
    populationAtRisk: 1800,
    lastUpdated: '2 hours ago',
    activeSensorsCount: 2,
    thresholdExceeded: false
  }
];

export const INITIAL_ROADS: RoadConnectivity[] = [
  {
    id: 'road-nh10',
    name: 'Siliguri - Sevoke - Gangtok Highway',
    highwayNumber: 'NH-10',
    segment: '29th Mile to Teesta Bridge (km 42-49)',
    state: 'Sikkim / West Bengal Border',
    status: 'blocked',
    blockageReason: 'Massive debris flow & 80m road subsidence near 29th Mile',
    alternateRoute: 'Via Lava - Algarah - Gorubathan route (Light vehicles only)',
    clearingCrewAssigned: 'BRO Project Swastik 758 BRTF',
    estimatedClearanceHours: 14,
    criticalForSupplies: true,
    lengthKm: 114,
    lastReported: '20 mins ago'
  },
  {
    id: 'road-nh29',
    name: 'Dimapur - Kohima Bypass Road',
    highwayNumber: 'NH-29',
    segment: 'Chumukedima - Phesama Corridor',
    state: 'Nagaland',
    status: 'caution',
    blockageReason: 'Single-lane active rockfall clearing and tension cracks',
    alternateRoute: 'Via Jotsoma old bypass',
    clearingCrewAssigned: 'BRO Project Sewak & Nagaland PWD',
    estimatedClearanceHours: 4,
    criticalForSupplies: true,
    lengthKm: 74,
    lastReported: '40 mins ago'
  },
  {
    id: 'road-nh37',
    name: 'Imphal - Jiribam Highway',
    highwayNumber: 'NH-37',
    segment: 'Makru - Tupul Rail Bridge Section',
    state: 'Manipur',
    status: 'restricted',
    blockageReason: 'Night travel barred due to high mudslide risk after continuous rain',
    alternateRoute: 'None (Essential convoy movements with police pilot only)',
    clearingCrewAssigned: 'NHIDCL Emergency Maintenance Unit',
    estimatedClearanceHours: 0,
    criticalForSupplies: true,
    lengthKm: 222,
    lastReported: '1 hour ago'
  },
  {
    id: 'road-nh06',
    name: 'Guwahati - Shillong - Silchar Highway',
    highwayNumber: 'NH-06',
    segment: 'Sonapur - Ratacherra Tunnel Approach',
    state: 'Meghalaya / Assam',
    status: 'open',
    blockageReason: 'Heavy rainfall with wet pavement; sensors showing moderate risk',
    alternateRoute: 'Normal transit operational',
    clearingCrewAssigned: 'Meghalaya PWD Mobile Patrol',
    estimatedClearanceHours: 0,
    criticalForSupplies: true,
    lengthKm: 185,
    lastReported: '15 mins ago'
  },
  {
    id: 'road-bct',
    name: 'Balipara - Charduar - Tawang Axis',
    highwayNumber: 'NH-13 / BCT',
    segment: 'Baisakhi to Sela Tunnel West Portal',
    state: 'Arunachal Pradesh',
    status: 'caution',
    blockageReason: 'Sub-zero freezing soil expansion and mild slope slumping',
    alternateRoute: 'Sela Tunnel main tube clear, approach roads require slow convoy',
    clearingCrewAssigned: 'BRO Project Vartak',
    estimatedClearanceHours: 2,
    criticalForSupplies: true,
    lengthKm: 310,
    lastReported: '30 mins ago'
  }
];

export const INITIAL_SENSORS: SensorTelemetry[] = [
  {
    id: 'sens-dik-01',
    zoneId: 'zone-sik-01',
    zoneName: 'Dikchu Valley Inclinometer-A',
    type: 'inclinometer',
    unit: 'mm/day',
    currentValue: 18.4,
    thresholdValue: 10.0,
    batteryPct: 91,
    status: 'warning',
    history: [
      { timestamp: '06:00', value: 4.2 },
      { timestamp: '08:00', value: 7.1 },
      { timestamp: '10:00', value: 11.5 },
      { timestamp: '12:00', value: 14.8 },
      { timestamp: '14:00', value: 18.4 }
    ]
  },
  {
    id: 'sens-dik-02',
    zoneId: 'zone-sik-01',
    zoneName: 'Dikchu Vibrating Wire Piezometer',
    type: 'piezometer',
    unit: 'kPa',
    currentValue: 42.5,
    thresholdValue: 35.0,
    batteryPct: 88,
    status: 'warning',
    history: [
      { timestamp: '06:00', value: 22.0 },
      { timestamp: '08:00', value: 28.5 },
      { timestamp: '10:00', value: 36.1 },
      { timestamp: '12:00', value: 39.8 },
      { timestamp: '14:00', value: 42.5 }
    ]
  },
  {
    id: 'sens-haf-01',
    zoneId: 'zone-asm-02',
    zoneName: 'Haflong Optical Crack Wire Meter',
    type: 'extensometer',
    unit: 'mm',
    currentValue: 34.2,
    thresholdValue: 20.0,
    batteryPct: 94,
    status: 'warning',
    history: [
      { timestamp: '06:00', value: 14.0 },
      { timestamp: '08:00', value: 19.5 },
      { timestamp: '10:00', value: 26.2 },
      { timestamp: '12:00', value: 31.0 },
      { timestamp: '14:00', value: 34.2 }
    ]
  },
  {
    id: 'sens-soh-01',
    zoneId: 'zone-meg-03',
    zoneName: 'Sohra Automatic Rain Gauge (ARG-4)',
    type: 'rain_gauge',
    unit: 'mm/h',
    currentValue: 28.6,
    thresholdValue: 25.0,
    batteryPct: 97,
    status: 'warning',
    history: [
      { timestamp: '06:00', value: 12.0 },
      { timestamp: '08:00', value: 18.2 },
      { timestamp: '10:00', value: 24.0 },
      { timestamp: '12:00', value: 31.4 },
      { timestamp: '14:00', value: 28.6 }
    ]
  },
  {
    id: 'sens-hun-01',
    zoneId: 'zone-miz-04',
    zoneName: 'Hunthar Capacitive Soil Moisture Sensor',
    type: 'soil_moisture',
    unit: '%',
    currentValue: 74.0,
    thresholdValue: 70.0,
    batteryPct: 89,
    status: 'warning',
    history: [
      { timestamp: '06:00', value: 55.0 },
      { timestamp: '08:00', value: 62.0 },
      { timestamp: '10:00', value: 68.5 },
      { timestamp: '12:00', value: 72.0 },
      { timestamp: '14:00', value: 74.0 }
    ]
  }
];

export const INITIAL_FIELD_REPORTS: FieldReport[] = [
  {
    id: 'rep-001',
    reporterName: 'Tenzing Lepcha',
    reporterRole: 'field_official',
    phone: '+91 98451 22310',
    location: {
      lat: 27.3820,
      lng: 88.5140,
      district: 'Gangtok',
      state: 'Sikkim'
    },
    landmark: 'Near Dikchu Steel Suspension Bridge cut slope',
    hazardType: 'tension_cracks',
    severity: 'critical',
    description: 'Noticed multiple longitudinal tension fissures extending 25 meters along the upper road embankment. Width expanded from 2cm to 8cm in 3 hours after torrential morning rain.',
    timestamp: '42 mins ago',
    status: 'verified_by_ai',
    aiAnalysis: {
      crackWidthEstMm: 82,
      failureProbabilityPct: 94,
      recommendedAction: 'Immediate road closure. Evacuate 15 hillside households downstream of culvert.',
      verified: true
    }
  },
  {
    id: 'rep-002',
    reporterName: 'Rongsen Ao',
    reporterRole: 'citizen',
    phone: '+91 94360 88129',
    location: {
      lat: 25.6235,
      lng: 94.0901,
      district: 'Kohima',
      state: 'Nagaland'
    },
    landmark: 'Phesama village bypass near stream bed',
    hazardType: 'soil_slumping',
    severity: 'high',
    description: 'Mud and loose gravel sliding onto side drain. Trees tilting at 20 degree angle downhill. Retaining wall showing visible bulge.',
    timestamp: '1 hour ago',
    status: 'verified_by_ai',
    aiAnalysis: {
      crackWidthEstMm: 45,
      failureProbabilityPct: 78,
      recommendedAction: 'Dispatch PWD excavator. Restrict heavy commercial trucks to single file.',
      verified: true
    }
  },
  {
    id: 'rep-003',
    reporterName: 'Lalthanpuia Sailo',
    reporterRole: 'pwd_engineer',
    phone: '+91 98623 54109',
    location: {
      lat: 23.7550,
      lng: 92.7018,
      district: 'Aizawl',
      state: 'Mizoram'
    },
    landmark: 'Hunthar Veng sector 4 curve',
    hazardType: 'debris_flow',
    severity: 'high',
    description: 'Unplanned excavation behind residential building causing active slope toe erosion. Drainage choked with debris.',
    timestamp: '2 hours ago',
    status: 'crew_dispatched',
    aiAnalysis: {
      crackWidthEstMm: 30,
      failureProbabilityPct: 72,
      recommendedAction: 'Clear drain channel with backhoe loader. Issue temporary shelter relocation for 4 buildings.',
      verified: true
    }
  }
];

export const INITIAL_ALERTS: EarlyWarningAlert[] = [
  {
    id: 'alert-red-01',
    title: 'RED ALERT: Imminent Slope Failure Threat in Teesta & Dikchu Corridors',
    severity: 'critical',
    affectedDistricts: ['Gangtok', 'Mangan', 'Pakyong'],
    state: 'Sikkim',
    issuedAt: 'Today, 14:15 IST',
    validUntil: 'Tomorrow, 14:00 IST',
    headline: 'Extremely high probability of catastrophic translational slope failure on NH-10 and Dikchu valley.',
    instructions: [
      'Suspend all non-emergency vehicular movement on NH-10 between Sevoke and Singtam.',
      'Mandatory preventive evacuation for residents in Dikchu Basti and Lower Martam low-lying zones.',
      'BRO Project Swastik heavy earthmovers placed on immediate red alert at 5th Mile & Rangpo depots.'
    ],
    languages: [
      {
        language: 'English',
        headline: 'RED ALERT: Severe Landslide Threat along NH-10 & Dikchu corridor',
        message: 'Continuous rainfall exceeding 160mm has saturated hill slopes. NH-10 traffic suspended. Follow SDMA evacuation directives immediately.'
      },
      {
        language: 'Hindi',
        headline: 'लाल चेतावनी: सिक्किम में एनएच-10 और दिक्चू घाटी में भारी भूस्खलन का गंभीर खतरा',
        message: 'लगातार 160 मिमी से अधिक वर्षा के कारण पहाड़ी ढलानों पर भारी भूस्खलन की आशंका है। एनएच-10 पर आवागमन तत्काल रोक दिया गया है। प्रभावित ग्रामीण सुरक्षित शिविरों में जाएं।'
      },
      {
        language: 'Assamese',
        headline: 'ৰঙা সতৰ্কবাৰ্তা: ছিকিমৰ এনএইচ-১০ আৰু ডিকচু উপত্যকাত ভয়াৱহ ভূমিস্খলনৰ সম্ভাৱনা',
        message: 'অবিৰাম বৰষুণৰ ফলত পাহাৰৰ মাটি সম্পূৰ্ণ তিতি খহি পৰাৰ পথত। যান-বাহন চলাচল বন্ধ কৰা হৈছে। প্ৰশাসনৰ নিৰ্দেশনা পালন কৰক।'
      },
      {
        language: 'Bengali',
        headline: 'লাল সতর্কতা: সিকিমে এনএইচ-১০ এবং দিকচু করিডরে তীব্র ভূমিধসের ঝুঁকি',
        message: 'টানা অতিভারী বৃষ্টির কারণে পাহাড়ি ঢালে ধস নামার চরম আশঙ্কা তৈরি হয়েছে। সংশ্লিষ্ট সড়ক বন্ধ রয়েছে। বাসিন্দাদের সতর্ক আশ্রয়ে সরানোর কাজ শুরু হয়েছে।'
      },
      {
        language: 'Mizo',
        headline: 'FIMKHURNA SEN: Sikkim NH-10 leh Dikchu kawngah leimin hlauhawm tak thleng thei',
        message: 'Ruahtui tlak nasat lutuk avangin tlangpang a tawlh mek. Motor kalphung tihtawp a ni, tualchhung mite himna hmun pan rawh u.'
      }
    ],
    smsSentCount: 18450,
    evacuationRecommended: true
  },
  {
    id: 'alert-ora-02',
    title: 'ORANGE ALERT: Dima Hasao & Haflong Cut Slopes High Vulnerability',
    severity: 'high',
    affectedDistricts: ['Dima Hasao', 'Cachar'],
    state: 'Assam',
    issuedAt: 'Today, 12:30 IST',
    validUntil: 'Tomorrow, 18:00 IST',
    headline: 'Soil moisture saturation at 82% with 24h rainfall exceeding critical safety threshold.',
    instructions: [
      'Rail authorities to operate slow-speed cautionary pilots on Lumding-Badarpur hill track.',
      'SDRF quick response teams prepositioned at Haflong and Maibang.',
      'Citizens urged to avoid travel through Jatinga valley post 18:00 hrs.'
    ],
    languages: [
      {
        language: 'English',
        headline: 'ORANGE ALERT: High Landslide Vulnerability in Dima Hasao',
        message: 'Hill slopes around Haflong experiencing continuous rain and soil saturation. Avoid non-essential road travel through Jatinga.'
      },
      {
        language: 'Assamese',
        headline: 'কমলা সতৰ্কবাৰ্তা: ডিমা হাছাও আৰু হাফলঙত ভূমিস্খলনৰ উচ্চ আশংকা',
        message: 'হাফলং আৰু জাতিংগা অঞ্চলত অবিৰাম বৰষুণৰ বাবে পাহাৰীয়া ঢাল বিপজ্জনক হৈ পৰিছে। যাত্ৰীসকলক সতৰ্ক থাকিবলৈ অনুৰোধ জনোৱা হ’ল।'
      }
    ],
    smsSentCount: 12200,
    evacuationRecommended: false
  }
];

export const INITIAL_WEATHER_FORECASTS: WeatherLinkedRiskForecast[] = [
  {
    district: 'Gangtok & Mangan',
    state: 'Sikkim',
    day1RainMm: 164,
    day2RainMm: 140,
    day3RainMm: 95,
    imdAlertLevel: 'Red',
    landslideProbabilityPct: 92,
    recommendedPrep: 'Stage NDRF pre-deployment at Singtam, restrict heavy freight, activate 6 community cyclone/landslide shelters.'
  },
  {
    district: 'Dima Hasao',
    state: 'Assam',
    day1RainMm: 138,
    day2RainMm: 110,
    day3RainMm: 75,
    imdAlertLevel: 'Red',
    landslideProbabilityPct: 84,
    recommendedPrep: 'Night inspection patrols along railway culverts, pre-position JCB loaders at Jatinga junction.'
  },
  {
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    day1RainMm: 210,
    day2RainMm: 185,
    day3RainMm: 120,
    imdAlertLevel: 'Red',
    landslideProbabilityPct: 78,
    recommendedPrep: 'Issue public warning for Sohra waterfalls & gorges, halt zipline and tourism activities, maintain Shillong bypass.'
  },
  {
    district: 'Aizawl',
    state: 'Mizoram',
    day1RainMm: 95,
    day2RainMm: 80,
    day3RainMm: 60,
    imdAlertLevel: 'Orange',
    landslideProbabilityPct: 76,
    recommendedPrep: 'Monitor Hunthar and Ramhlun slopes, verify stormwater drop-structures to prevent toe erosion.'
  },
  {
    district: 'Kohima & Phek',
    state: 'Nagaland',
    day1RainMm: 72,
    day2RainMm: 65,
    day3RainMm: 45,
    imdAlertLevel: 'Orange',
    landslideProbabilityPct: 68,
    recommendedPrep: 'BRO 24h rock clearing vigil at Phesama bypass; divert light vehicles to old Kohima artery if cracks widen.'
  },
  {
    district: 'Noney & Tamenglong',
    state: 'Manipur',
    day1RainMm: 82,
    day2RainMm: 70,
    day3RainMm: 50,
    imdAlertLevel: 'Orange',
    landslideProbabilityPct: 71,
    recommendedPrep: 'Monitor Makru bridge approach cutting; night heavy vehicles escorted in convoys.'
  }
];

export const INITIAL_EMERGENCY_RESOURCES: EmergencyResource[] = [
  {
    id: 'res-ndrf-01',
    unitName: '12th Battalion NDRF (Search & Rescue)',
    type: 'NDRF_Battalion',
    location: 'Doimukh Base & Forward Team at Rangpo',
    state: 'Sikkim / Arunachal',
    contactNumber: '1070 / 0360-2277107',
    status: 'deployed',
    assignedZoneId: 'zone-sik-01'
  },
  {
    id: 'res-bro-01',
    unitName: 'BRO Project Swastik 758 Border Roads Task Force',
    type: 'BRO_Task_Force',
    location: 'Sevoke - Singtam Section Headquarter',
    state: 'Sikkim',
    contactNumber: '03592-202350',
    status: 'deployed',
    assignedZoneId: 'zone-sik-01'
  },
  {
    id: 'res-sdrf-02',
    unitName: 'Assam SDRF Hill Section Unit',
    type: 'SDRF_Unit',
    location: 'Haflong District Emergency Operations Centre (DEOC)',
    state: 'Assam',
    contactNumber: '1077 / 03673-236324',
    status: 'deployed',
    assignedZoneId: 'zone-asm-02'
  },
  {
    id: 'res-hosp-01',
    unitName: 'STNM Multi-Specialty Hospital Emergency Trauma Center',
    type: 'District_Hospital',
    location: 'Sochyagang, Gangtok',
    state: 'Sikkim',
    contactNumber: '03592-202944',
    status: 'standby'
  },
  {
    id: 'res-camp-01',
    unitName: 'Singtam Community Hall Emergency Relief Shelter',
    type: 'Relief_Camp',
    location: 'Singtam Bazaar Higher Secondary School Compound',
    state: 'Sikkim',
    contactNumber: '03592-234120',
    status: 'standby',
    assignedZoneId: 'zone-sik-01'
  }
];
