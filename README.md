# COLORCRAFT — DaVinci Resolve Color Grading Lab

An interactive educational website for learning DaVinci Resolve color grading from beginner to advanced colorist.

## Features

- **Real-Time WebGL Grading Engine** — Adjust controls and see the image change instantly
- **Before/After Comparison** — Slider, split, and toggle modes
- **Interactive Scopes** — Histogram, Waveform, RGB Parade, Vectorscope
- **Curve Editor** — Interactive Catmull-Rom curve editor
- **Color Wheels** — Draggable Lift/Gamma/Gain/Offset wheels
- **Node System** — Educational node graph with visual flow
- **24 Lessons** — From absolute beginner to advanced colorist
- **Practice Challenges** — Guided grading exercises with reference comparison
- **Glossary** — 20+ color grading terms with simple and technical definitions
- **Shortcuts Reference** — Searchable DaVinci Resolve keyboard shortcuts
- **Cinematic Looks Library** — 12 grade presets with full parameter breakdown
- **Import Your Own Media** — Client-side processing, nothing uploaded to a server
- **Undo/Redo** — Full grade history with Ctrl+Z / Ctrl+Shift+Z
- **Copy Grade** — Export grade as JSON or URL-encoded hash

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Zustand (state management)
- WebGL (real-time image processing)
- Lucide React (icons)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Architecture

```
src/
├── components/     # Reusable UI components (ColorSlider, ColorWheel, CurveEditor, etc.)
├── pages/          # Page components (HomePage, PlaygroundPage, LearnPage, etc.)
├── data/           # Data files (lessons, presets, glossary, shortcuts, samples)
├── lib/            # Core logic (WebGL engine, Zustand store)
├── shaders/        # GLSL shader source
├── types/          # TypeScript types
public/
├── favicon.svg
```

## Media Licensing

All sample images are sourced from Unsplash under the [Unsplash License](https://unsplash.com/license), which permits free use for educational purposes.

No copyrighted film stills or proprietary media are used.

## Technical Notes

- The WebGL grading engine processes images locally in the browser
- No image or video data is uploaded to any server
- Grade state is serializable as JSON for sharing
- LocalStorage is used for progress tracking only
- Falls back gracefully when WebGL is unavailable

## References

- [DaVinci Resolve Reference Manual](https://www.blackmagicdesign.com/support/family/davinci-resolve-and-fusion) — Primary technical reference
- [ITU-R BT.709](https://www.itu.int/rec/R-REC-BT.709/) — HDTV color standard
- [ACES Central](https://acescentral.com) — Academy Color Encoding System

## Disclaimer

COLORCRAFT is an independent educational project. It is not affiliated with, endorsed by, or connected to Blackmagic Design. DaVinci Resolve is a trademark of Blackmagic Design Pty Ltd.
