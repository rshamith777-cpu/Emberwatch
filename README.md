# 🔥 EMBERWATCH
### Cinematic 3D Wildfire Intelligence & Autonomous Incident Command Platform

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Gemini 2.0](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![NASA FIRMS](https://img.shields.io/badge/NASA-FIRMS%20Satellite-E03C31?style=for-the-badge&logo=nasa&logoColor=white)](https://firms.modaps.eosdis.nasa.gov/)

<br />

**Real-Time Satellite Anomaly Tracking • Rothermel Topographic Spread Engine • Byram Convective Intensity • Three.js WebGL Graphics • Autonomous Gemini Crisis AI**

![EmberWatch AI Homescreen & Mission HUD](./public/emberwatch-hero.jpg)

</div>

---

## 📖 Overview

**EmberWatch** is a next-generation wildfire intelligence and disaster response platform designed for incident commanders, forestry services, and emergency responders. By bridging orbital Earth-observation data with real-time thermodynamic simulation and cutting-edge generative AI, EmberWatch transforms raw thermal anomalies into actionable, predictive tactical briefings.

Traditional wildfire monitoring relies on static 2D perimeter maps with latency spanning hours. **EmberWatch eliminates this blind spot** by combining:
1. **Sub-pixel orbital thermal detection** (NASA FIRMS MODIS & VIIRS).
2. **Physics-based 3D terrain propagation** (Rothermel Rate of Spread + Byram Fireline Intensity).
3. **Conversational Multi-Agent AI** powered by Google Gemini, capable of synthesizing micro-meteorology, fuel dynamics, and population vulnerability into human-readable strategic action plans.

---

## 📸 Visual Showcase & Interface Tour

<div align="center">
<table>
  <tr>
    <td width="50%">
      <h3 align="center">🌐 Orbital Global 3D Fire Globe</h3>
      <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" alt="Global 3D Fire Globe" />
      <p align="center"><i>Interactive WebGL Earth rendering real-time active wildfire clusters aggregated from NASA FIRMS sub-pixel sensors.</i></p>
    </td>
    <td width="50%">
      <h3 align="center">🏔️ Rothermel 3D Topographic Terrain</h3>
      <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop" alt="3D Topographic Terrain" />
      <p align="center"><i>Digital elevation modeling with dynamic flame perimeter expansion, ash scar propagation, and wind vector coupling.</i></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3 align="center">⚡ Convective Plume & Ember Lift</h3>
      <img src="https://images.unsplash.com/photo-1498084393753-b411b2d26b34?q=80&w=1000&auto=format&fit=crop" alt="Convective Heat Simulation" />
      <p align="center"><i>Thermodynamic particle simulation visualizing Byram convective heat output, flame tilt angle, and atmospheric lofting.</i></p>
    </td>
    <td width="50%">
      <h3 align="center">🤖 Gemini Strategic Crisis AI</h3>
      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop" alt="Tactical Operations HUD" />
      <p align="center"><i>Autonomous incident agent reasoning over live cluster telemetry, population risk corridors, and resource logistics.</i></p>
    </td>
  </tr>
</table>
</div>

---

## 🔄 Application Architecture & Workflow

EmberWatch employs a multi-tiered pipeline connecting satellite ingestion, spatial clustering, thermodynamic physics solvers, generative reasoning, and a 60 FPS WebGL frontend.

### 1. End-to-End System Flowchart

```mermaid
flowchart TB
    subgraph Data_Ingestion["📡 1. DATA INGESTION & SATELLITE TELEMETRY"]
        A1["NASA FIRMS (MODIS / VIIRS)"] -->|Thermal Hotspots Lat/Lng/FRP| B1["Data Pipeline Engine"]
        A2["Open-Meteo API"] -->|Wind Vector, Humidity, Temp| B1
        A3["USGS / Elevation Models"] -->|Digital Elevation & Slope| B1
    end

    subgraph Backend_Processing["⚙️ 2. CLUSTERING & SPATIAL REASONING"]
        B1 --> C1["DBSCAN Spatial Clusterer"]
        C1 -->|Cluster Centroids & Radii| C2["Risk & Threat Vector Model"]
        C2 -->|Cluster Metadata & FRP Index| C3["Express Telemetry Engine"]
    end

    subgraph AI_Intelligence["🧠 3. AUTONOMOUS GEMINI REASONING"]
        C3 --> D1["Gemini 2.0 AI Agent"]
        D1 -->|Strategic Risk Briefing| D2["Evacuation Corridors & Priority Matrix"]
        D1 -->|Live Commander Chat| D3["Human-in-the-Loop Incident Stream"]
    end

    subgraph Simulation_Engine["🔥 4. 3D PHYSICS & WEBGL RENDERING"]
        C3 --> E1["Rothermel Spread Solver"]
        C3 --> E2["Byram Convective Plume Engine"]
        E1 --> F1["Three.js 3D Terrain & Flame Front"]
        E2 --> F2["Thermodynamic Particle Emitters"]
        C3 --> F3["Sun-Synchronous 3D Fire Globe"]
    end

    subgraph Operator_Interface["🎛️ 5. TACTICAL OPERATIONS COMMAND (HUD)"]
        D2 & D3 & F1 & F2 & F3 --> G1["EmberWatch Obsidian Tactical HUD"]
        G1 -->|Interactive Sliders: Fuel / Moisture / Wind| E1
        G1 -->|Direct Incident Queries| D1
    end
```

### 2. Incident Commander Tactical Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Commander as Incident Commander
    participant HUD as Operations HUD (React)
    participant Engine as Physics & Telemetry Engine
    participant Gemini as Gemini AI Agent
    participant WebGL as Three.js Terrain Renderer

    Commander->>HUD: Selects Active Complex (e.g., Dixie Fire, CA)
    HUD->>Engine: Fetch Real-time Thermal Cluster & Environmental Metrics
    Engine-->>HUD: Returns FRP, Spread Velocity, Wind Azimuth & Weather
    HUD->>WebGL: Initialize Digital Elevation Model & Particle Grid
    WebGL-->>HUD: Renders 3D Flame Perimeter & Ash Scar Dynamics
    Commander->>HUD: Adjusts Live Wind (+15 km/h) & Fuel Moisture (-4%)
    HUD->>WebGL: Recalculates Rothermel Front Vector in Real-time
    Commander->>HUD: Requests Tactical Evacuation Strategy
    HUD->>Gemini: Prompts with Incident Telemetry & Vulnerability Map
    Gemini-->>HUD: Streams Actionable Contingency Briefing & Evacuation Corridors
    HUD-->>Commander: Displays Live Strategic Action Plan & Resource Priority
```

---

## ⚡ Core Features & Technical Deep Dive

### 🌐 1. Sun-Synchronous Global 3D Fire Globe (`FireGlobe3D.tsx`)
- **NASA FIRMS Integration**: Ingests Moderate Resolution Imaging Spectroradiometer (MODIS) and Visible Infrared Imaging Radiometer Suite (VIIRS) satellite thermal detections.
- **DBSCAN Spatial Clustering**: Dynamically aggregates dispersed pixel-level fire points into localized macro-complexes with computed centroids, bounding diameters, and aggregate Fire Radiative Power (MW).
- **Sun-Synchronous Day/Night Shader**: WebGL sphere mapping atmospheric scattering, ocean specular reflectivity, and dynamic day-night terminator transitions.

### 🏔️ 2. Topographic Wildfire Rate-of-Spread (`TerrainFire3D.tsx`)
- **Rothermel Spread Physics**: Implements Richard C. Rothermel’s surface fire spread model:
  $$R = \frac{I_R \cdot \xi \cdot (1 + \phi_w + \phi_s)}{\rho_b \cdot \epsilon \cdot Q_{ig}}$$
  Accounting for reaction intensity ($I_R$), wind coefficient ($\phi_w$), topographic slope gradient ($\phi_s$), and effective fuel moisture heating ($Q_{ig}$).
- **Dynamic Terrain Deformation**: Procedural heightfield mesh displaced according to real slope contours with interactive wireframe and contour overlays.
- **Perimeter & Scar Propagation**: Visualizes progressive flame advancing fronts, active combustive crests, and cold carbonized ash scars.

### 🌡️ 3. Convective Plume & Ember Lofting (`FireSimulation3D.tsx`)
- **Byram's Fireline Intensity**: Computes energy release per unit length of fire front ($I = H \cdot w \cdot r$) in kW/m, governing flame height and radiant heat flux.
- **GPU Particle System**: Emits hundreds of dynamic thermodynamic embers subjected to buoyancy, convection lift, gravity, and wind shear turbulence.
- **Flame Geometry Dynamics**: Computes flame tilt angle and scorch height based on wind speed and convective up-drafts.

### 🤖 4. Autonomous Gemini Strategic Crisis Agent (`intelligenceAgent.ts`)
- **Real-Time Context Synthesis**: Ingests active fire coordinates, rate-of-spread, fuel model classifications, and weather metrics directly into Google's Gemini SDK.
- **Human-Understandable Crisis Communication**: Generates clear, compassionate, and tactical situational briefings—avoiding raw jargon when civilian lives are at risk.
- **Dynamic Threat Forecasting**: Proactively evaluates downwind settlements, highway corridor vulnerabilities, and immediate containment priorities.

### 🎛️ 5. Bespoke Obsidian & Ember Tactical Design System
- **Engineered for High-Stress Operations**: High-contrast, zero-eyestrain dark palette (`#050505` Core Obsidian, `#11161D` Panel, `#F5F0E6` Ivory, `#C6A15B` Royal Gold, `#B6402F` Ember).
- **Glassmorphism Panels**: Backdrop-blur tactical telemetry cards displaying live FRP gauges, wind vector dials, and real-time incident logs.
- **Seamless Responsiveness**: Optimized across multi-monitor control room displays down to field tablets.

---

## 💻 Tech Stack & Architecture

| Layer | Technologies | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | `React 19`, `TypeScript` | Component-driven reactive UI architecture |
| **Styling & Design** | `Tailwind CSS v4`, `Lucide React` | Utility-first obsidian tactical design system |
| **3D Graphics & Shaders**| `Three.js`, `WebGL` | GPU-accelerated terrain, globe & particle rendering |
| **Backend Service** | `Node.js`, `Express`, `tsx` | Telemetry aggregation, proxying & simulation API |
| **Generative AI** | Google Gemini SDK (`@google/genai`) | Multimodal LLM reasoning for tactical decision-making |
| **Spatial Clustering** | `DBSCAN Algorithm` | Spatial density-based hotspot clustering |
| **Physics Engines** | Rothermel ROS & Byram Models | Fire science equations adapted for real-time WebGL |
| **Build & Tooling** | `Vite 6`, `ESBuild` | Instant HMR development server and production bundler |

---

## 📁 Repository Structure

```
Emberwatch/
├── 📁 public/                     # Static assets & 3D textures
├── 📁 server/                     # Backend telemetry & intelligence pipeline
│   ├── 📁 agents/                 
│   │   └── intelligenceAgent.ts   # Gemini AI Crisis Reasoning Agent
│   ├── index.ts                   # Express server entrypoint & API routes
│   └── pipeline.ts                # Satellite ingestion & DBSCAN clusterer
├── 📁 src/                        # React Frontend
│   ├── 📁 components/             
│   │   ├── 📁 cinematic/          # Cinematic experience & telemetry stream
│   │   │   ├── CinematicExperience.tsx
│   │   │   └── CinematicVideoBackground.tsx
│   │   ├── 📁 studio/             # 3D Simulation Studios
│   │   │   ├── FireGlobe3D.tsx    # Sun-synchronous 3D Global Earth
│   │   │   ├── FireSimulation3D.tsx # Byram convective plume & ember lift
│   │   │   ├── FireStudio3D.tsx   # Studio viewport wrapper
│   │   │   └── TerrainFire3D.tsx  # Rothermel 3D topographic spread
│   │   ├── AgentChat.tsx          # Real-time Gemini Crisis AI Chatbot
│   │   ├── ClusterList.tsx        # Active wildfire complex selector
│   │   ├── MetricCard.tsx         # Tactical telemetry metric gauges
│   │   ├── OperationsHUD.tsx      # Central command HUD & controls
│   │   └── WeatherPanel.tsx       # Live meteorology & wind compass
│   ├── 📁 data/                   # Simulation datasets & presets
│   ├── 📁 types/                  # TypeScript interfaces & domain models
│   ├── App.tsx                    # Root application component
│   ├── index.css                  # Global design tokens & obsidian theme
│   └── main.tsx                   # Vite DOM mount point
├── .env.example                   # Environment variable template
├── package.json                   # Project dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
└── vite.config.ts                 # Vite bundler configuration
```

---

## 🚀 Getting Started

Follow these steps to run the complete fullstack application locally.

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Google Gemini API Key**: [Get your API key here](https://aistudio.google.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/rshamith777-cpu/Emberwatch.git
cd Emberwatch
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
Open `.env` in your editor and provide your Gemini API key:
```env
# Google Gemini API Key for autonomous intelligence agent
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere..."

# Port configuration (Defaults to 3001)
PORT=3001
```

### 5. Launch the Development Environment
Run the concurrent dev command, which boots both the Express backend and the Vite frontend:
```bash
npm run dev
```

Once running:
- **Frontend Command Center**: `http://localhost:5173`
- **Backend Telemetry API**: `http://localhost:3001/api`

---

## 🧪 Simulation Presets

EmberWatch comes pre-configured with historical and active wildfire benchmarks:
- **Dixie Fire Complex (California, USA)**: Steep mountain canyon topography with extreme timber-brush fuel model and high dry wind coupling.
- **Black Summer (New South Wales, Australia)**: Massive eucalyptus canopy fire with intense convective plume formation and long-distance ember spotting.
- **Pantanal Biome (Brazil)**: Tropical wetland-border drought fire driven by rapid surface grassland spread.
- **Mediterranean Pine Complex (Greece)**: Coastal thermal anomaly with high wind azimuth shifts and immediate urban fringe exposure.

---

## 🤝 Contributing

Contributions are welcome! If you want to enhance the Rothermel physics engine, add new satellite feeds (e.g., Sentinel-2, GOES-16), or improve the 3D WebGL shaders:

1. Fork the Project (`gh repo fork rshamith777-cpu/Emberwatch`)
2. Create your Feature Branch (`git checkout -b feature/AdvancedShader`)
3. Commit your Changes (`git commit -m 'Add custom heat haze distortion shader'`)
4. Push to the Branch (`git push origin feature/AdvancedShader`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**EmberWatch — Transforming Space Telemetry into Life-Saving Wildfire Intelligence.**

Crafted with ❤️ for Crisis Management Teams Worldwide.

</div>
