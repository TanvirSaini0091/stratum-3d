# Stratum 3D

Stratum 3D is a scroll-driven landing page that transitions from a 3D Earth model to an interactive 3D city map. 

It is built using React, TypeScript, Vite, React Three Fiber, and MapLibre.

## Features

- **3D Scene**: A 3D rendering of Earth, the Moon, and the Sun using `react-three-fiber` and `three.js` (note: models are for visualization and do not reflect live real-world positions or data).
- **Descent Sequence**: Custom shaders and speed lines that simulate a descent from orbit.
- **Interactive Map**: A dark-themed MapLibre map featuring 3D building extrusions, vector tiles, and a custom camera pitch and bearing.
- **Scroll Navigation**: The transition from space to the surface is controlled by user scroll.
- **UI Components**: Interface elements built with Tailwind CSS and GSAP animations.

## Prerequisites

To run this project locally, you need the following:

- **Node.js** (v18 or higher recommended)
- **MapTiler API Key**: An active MapTiler API key is **required** to load the vector map tiles, styles, and 3D terrain/building data correctly. You can get one for free at [MapTiler](https://www.maptiler.com/).

## Getting Started

1. **Clone the repository** (if you haven't already).

2. **Install dependencies**:
   ```bash
   npm install
   ```
   *(or use `yarn install` / `pnpm install` depending on your package manager)*

3. **Configure Environment Variables**:
   Create a `.env` or `.env.local` file in the root directory of the project and add your MapTiler API key:
   ```env
   VITE_MAPTILER_KEY=your_maptiler_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

## Tech Stack

- **Framework**: React + TypeScript + Vite
- **3D Rendering**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Mapping**: MapLibre GL JS (`maplibre-gl`), React Map GL (`react-map-gl`)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Animation**: GSAP
