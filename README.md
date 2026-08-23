# LogiLoad 3D — Multi-Modal Cargo Loading & Route Optimizer

LogiLoad 3D is a premium, interactive WebGL-based cargo loading and routing optimizer designed for modern logistics operations across land, sea, and air. Built with React, Three.js, and React Three Fiber, it provides real-time 3D visualizations of cargo loading layouts, physical constraints, and flight balance physics.

## 🚀 Key Features

### 1. ✈️ 3D Air Cargo Loading & Weight & Balance HUD
- **Transmissive pointed-nose fuselage model** with aerodynamic airfoil wings, vertical/horizontal stabilizers, rear engines, and cabin lights.
- **Center of Gravity (CoG) Packing Algorithm**: Automatically packs items from the center of the cabin outward (directly above the wing lift zone) to maintain flight stability.
- **Interactive W&B Trim HUD**: Real-time slider metrics showing center of gravity drift against forward and aft safe operating limits.
- **Aviation-Specific Cargo Models**: Custom rendering of AMJ cargo containers, netted wooden cargo pallets, vehicle chassis, and avionics racks.

### 2. 🚢 3D Sea Cargo Hold Optimizer
- **Semi-transparent vessel cargo holds** displaying loaded containers.
- **Support-Area Solver**: Enforces a minimum 70% floor/under-support contact area to prevent floating boxes.
- **Custom Cargo Visualizers**: Custom cylinders, steel coils, turbines, and machinery structures.

### 3. 🗺️ Multi-Modal Route Planner
- Interactive Leaflet-based map routers for flight paths and sea lanes.
- Estimated Time of Arrival (ETA), fuel consumption indicators, and route point configuration.

### 4. 📸 Camera Dimensions Scanner
- Live camera integration with computer vision mocking to detect crate dimensions dynamically from video feeds.

---

## 🛠️ Technology Stack
- **Framework**: React 19 + TypeScript + Vite
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`
- **Routing Maps**: Leaflet, `react-leaflet`
- **UI Components**: Lucide React Icons, Vanilla CSS utilities with glassmorphism effects.

---

## ⚡ Quick Start

### Installation
Clone the repository and install dependencies:
```bash
npm install
```

### Run Local Development Server
```bash
npm run dev
```

### Build Production Bundle
```bash
npm run build
```
