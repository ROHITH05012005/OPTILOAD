export const MOCK_INDIA_CITIES = [
  "Mumbai, Maharashtra",
  "Delhi, Delhi",
  "Bangalore, Karnataka",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Pune, Maharashtra",
  "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan",
  "Lucknow, Uttar Pradesh"
];

// Default Truck: Tata LPT 1613 inspired dimensions (approx internal)
export const DEFAULT_TRUCK = {
  id: 'default-truck-1',
  name: 'Tata LPT 1613 Container',
  dimensions: {
    length: 600, // cm
    width: 240,  // cm
    height: 240  // cm
  },
  maxWeight: 16000 // kg
};

// Additional truck options commonly used in India
export const TRUCK_OPTIONS = [
  DEFAULT_TRUCK,
  {
    id: 'tata-1109',
    name: 'Tata 1109 Cabin Chassis',
    dimensions: {
      length: 450, // cm
      width: 220,  // cm
      height: 220  // cm
    },
    maxWeight: 11000 // kg
  },
  {
    id: 'eicher-12ft',
    name: 'Eicher 12 Ft Single Axle',
    dimensions: {
      length: 360, // cm
      width: 180,  // cm
      height: 180  // cm
    },
    maxWeight: 7500 // kg
  },
  {
    id: 'bharatbenz-1623r',
    name: 'BharatBenz 1623R Tipper',
    dimensions: {
      length: 550, // cm
      width: 230,  // cm
      height: 150  // cm
    },
    maxWeight: 16000 // kg
  },
  {
    id: 'ashok-1616',
    name: 'Ashok Leyland 1616 HD',
    dimensions: {
      length: 650, // cm
      width: 240,  // cm
      height: 240  // cm
    },
    maxWeight: 16000 // kg
  },
  {
    id: 'mahindra-blazo',
    name: 'Mahindra Blazo 25 HP Tipper',
    dimensions: {
      length: 480, // cm
      width: 210,  // cm
      height: 160  // cm
    },
    maxWeight: 25000 // kg
  },
  {
    id: 'tata-407',
    name: 'Tata 407 Gold SFC',
    dimensions: {
      length: 320, // cm
      width: 170,  // cm
      height: 170  // cm
    },
    maxWeight: 4000 // kg
  },
  {
    id: 'eicher-pro-2049',
    name: 'Eicher Pro 2049',
    dimensions: {
      length: 580, // cm
      width: 230,  // cm
      height: 230  // cm
    },
    maxWeight: 20000 // kg
  },
  {
    id: 'ashok-leyland-dost',
    name: 'Ashok Leyland Dost+',
    dimensions: {
      length: 280, // cm
      width: 160,  // cm
      height: 160  // cm
    },
    maxWeight: 1900 // kg
  },
  {
    id: 'mahindra-furio',
    name: 'Mahindra Furio 17',
    dimensions: {
      length: 520, // cm
      width: 220,  // cm
      height: 220  // cm
    },
    maxWeight: 17000 // kg
  },
  {
    id: 'tata-signa-4825',
    name: 'Tata Signa 4825.TK',
    dimensions: {
      length: 700, // cm
      width: 250,  // cm
      height: 250  // cm
    },
    maxWeight: 48000 // kg
  }
];

export const ITEM_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
];

export const AIRCRAFT_OPTIONS = [
  {
    id: 'boeing-777f',
    name: 'Boeing 777F Freighter',
    dimensions: {
      length: 4800, // cm
      width: 550,   // cm
      height: 300   // cm
    },
    maxWeight: 102000 // kg
  },
  {
    id: 'airbus-a350f',
    name: 'Airbus A350F (NextGen)',
    dimensions: {
      length: 5000, // cm
      width: 560,   // cm
      height: 310   // cm
    },
    maxWeight: 109000 // kg
  },
  {
    id: 'md-11f',
    name: 'MD-11F Tri-Jet',
    dimensions: {
      length: 4200, // cm
      width: 520,   // cm
      height: 280   // cm
    },
    maxWeight: 91000 // kg
  },
  {
    id: 'boeing-767-300f',
    name: 'Boeing 767-300F',
    dimensions: {
      length: 3800, // cm
      width: 470,   // cm
      height: 260   // cm
    },
    maxWeight: 52000 // kg
  },
  {
    id: 'atr-72-600f',
    name: 'ATR 72-600F (Regional)',
    dimensions: {
      length: 1500, // cm
      width: 250,   // cm
      height: 180   // cm
    },
    maxWeight: 8900 // kg
  }
];

export const VESSEL_OPTIONS = [
  {
    id: 'coastal-feeder',
    name: 'Coastal Feeder Class',
    dimensions: {
      length: 1200, // cm
      width: 400,   // cm
      height: 350   // cm
    },
    maxWeight: 80000 // kg (80 MT)
  },
  {
    id: 'panamax-carrier',
    name: 'Panamax Carrier Class',
    dimensions: {
      length: 2400, // cm
      width: 600,   // cm
      height: 500   // cm
    },
    maxWeight: 250000 // kg (250 MT)
  },
  {
    id: 'capesize-freighter',
    name: 'Capesize Heavy Freighter',
    dimensions: {
      length: 4800, // cm
      width: 1000,  // cm
      height: 800   // cm
    },
    maxWeight: 1000000 // kg (1000 MT)
  }
];