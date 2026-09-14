# 🔥 EmberWatch
### Cinematic 3D Wildfire Intelligence Platform

![EmberWatch Banner](https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=2000&auto=format&fit=crop)

EmberWatch is an AI-powered 3D wildfire intelligence platform. It tracks real-time satellite thermal anomalies, runs predictive thermodynamic simulations, and integrates Gemini AI for live crisis communication, empowering emergency operations with cinematic, data-driven situation awareness.

---

## ✨ Key Features

- **🌐 Live 3D Fire Globe** - Track active fire clusters globally using live-synced NASA FIRMS and VIIRS sub-pixel thermal anomalies on an interactive, sun-synchronous 3D globe.
- **🔥 Topographic Wildfire Spread** - 3D terrain modeling utilizing the Rothermel rate-of-spread equation. Visualize active flame perimeters, ash scars, and wind-coupled spread across digital elevation contours.
- **🌡️ Convective Heat Simulation** - Analyze Byram fireline intensity, convective ember lift, and thermodynamic flame column modeling in real-time.
- **🤖 Gemini Intelligence Agent** - Chat directly with a highly empathetic, conversational AI agent that actively reads live cluster metadata and provides strategic crisis communication and priority assessments.
- **🎬 Cinematic Experience** - A striking, deeply immersive UI (using our bespoke Obsidian & Ember design system) complete with cinematic scrolling, automated telemetry logs, and full responsive design.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|-------|------------------|
| **Frontend UI** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion |
| **3D Rendering** | Three.js, WebGL |
| **Backend API** | Node.js, Express, `tsx` for execution |
| **AI Integration** | Google Gemini SDK (`@google/genai`) |
| **Tooling** | Vite 6, ESBuild |

---

## 🔄 System Architecture & Workflow

1. **Data Ingestion (Backend)**: An Express backend pipeline (`server/pipeline.ts`) securely pulls real-time environmental data and constructs active "clusters" representing macro-fire complexes.
2. **AI Analysis**: The `@google/genai` API is used natively to process environmental metrics and calculate dynamic risk factors, threat directions, and exposed settlements. 
3. **Telemetry Streaming**: Real-time HTTP endpoints (`/api/clusters`, `/api/status`, `/api/agent/query`) serve structured data to the frontend React layer.
4. **3D Visualization**: The React frontend uses modular Three.js components (`TerrainFire3D`, `FireSimulation3D`, `FireGlobe3D`) to map arrays of thermodynamic anomalies into visually stunning, interactive 3D spaces.
5. **Human Interface**: Operators interact with the data through the Operations HUD, adjusting live wind headings and fuel moisture sliders to see immediate simulated consequences.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rshamith777-cpu/Emberwatch.git
   cd Emberwatch
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the example environment file and add your Google Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Add your key inside `.env`:
   ```env
   GEMINI_API_KEY="your-api-key-here"
   ```

4. **Start the Development Server:**
   This command concurrently boots the Vite frontend and the Express backend using `tsx`.
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

### Production Build
To create a minimized, bundled version of the application:
```bash
npm run build
```
This produces a `dist/` folder for the frontend and a compiled `server.cjs` bundle for the backend. Run the production build using:
```bash
npm run start
```

---

## 🛡️ License
EmberWatch is a proprietary platform developed for crisis management innovation. All rights reserved.
