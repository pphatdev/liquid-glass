---
name: liquid-glass-design
description: Liquid Glass design system for modern Web & JavaScript applications — dynamic optical glass materials, WebGL Snell's Law refraction, SVG displacement filters, CSS glassmorphism, and interactive morphing UI components for Vanilla JS, React, Vue, and Web Components.
---

# Liquid Glass Design System (Web & JavaScript)

Comprehensive patterns and design system guidelines for implementing **Liquid Glass** in modern JavaScript and web applications. Liquid Glass is a dynamic, tactile visual material that physically bends and blurs background graphics (Snell's Law refraction), refracts spectral color along rims (chromatic dispersion), casts directional specular glare arcs, and interactively morphs across UI states.

## When to Activate

- Designing and implementing modern Web UI with dynamic glassmorphism and optical liquid glass
- Creating glass-style buttons, floating action capsules, navigation toolbars, modal sheets, and cards
- Implementing WebGL liquid lenses, SVG displacement distortion, or high-gloss CSS glass materials
- Building component wrappers in React, Vue, Svelte, or native Web Components (`<liquid-glass>`)
- Implementing interactive gestures (pointer tracking, dynamic refraction depth, fluid morphing transitions)
- Enforcing accessibility, contrast ratios, and `prefers-reduced-motion` compliance on glass surfaces

---

## Architecture & Implementation Tiers

Liquid Glass is implemented across 3 complementary web tiers depending on visual fidelity and performance requirements:

| Dimension | Tier 1: WebGL Liquid Shader | Tier 2: HTML + SVG Displacement | Tier 3: High-Gloss CSS Glass |
| :--- | :--- | :--- | :--- |
| **Optics** | Snell's Law ray bending + chromatic dispersion | 2D noise displacement light warping | Multi-stop specular glare + dual bevel |
| **Background** | Real-time procedural silk cloth / GPU scene | Direct DOM elements and background graphics | Direct DOM elements and CSS gradients |
| **Interactivity** | Physics-driven pointer drag, rotation, inertia | Pointer-reactive scale, tilt, noise turbulence | CSS hover/active transitions, cursor lighting |
| **Tech Stack** | Canvas + WebGL 1.0/2.0 (`LiquidGlass` engine) | HTML + SVG `<filter>` + `backdrop-filter` | Pure Vanilla CSS / Tailwind / CSS Modules |
| **Best Suited** | Hero visualizers, interactive lenses, 3D widgets | Floating modal sheets, refracted cards, overlays | Navigation bars, action buttons, list items |

---

## Core Pattern 1: Vanilla JavaScript & ESM

### Initializing the Standalone WebGL Engine

Use the zero-dependency [`LiquidGlass`](file:///d:/Project/Sophat/labs/libs/liquid-glass/liquid-glass.js) engine to mount an optical lens onto any canvas:

```javascript
import { LiquidGlass } from './liquid-glass.js';

const canvas = document.querySelector('#glass-canvas');
const glass = new LiquidGlass(canvas, {
  palette: 'azure',       // 'azure' | 'sunset' | 'emerald' | 'violet' | 'rose'
  brightness: 1.00,       // 0.50 - 2.00
  diffusion: 0.28,        // Frost roughness (0.00 - 1.00)
  refraction: 0.10,       // Snell's Law ray bending (0.00 - 0.35)
  angle: 135,             // Specular highlight incident light angle (0° - 360°)
  borderRadius: 50,       // 0 = square slab, 100 = circular orb
  ior: 1.48,              // Index of refraction (crown glass ~1.5)
  dispersion: 0.022,      // Chromatic dispersion (RGB split)
  interactive: true       // Pointer drag & mousewheel rotation
});

glass.start();

// Dynamically update options in response to UI events
glass.setOptions({ refraction: 0.16, angle: 180 });
glass.setPalette('sunset');

// Clean up WebGL buffers and listeners on unmount
// glass.destroy();
```

### Native Web Component (`<liquid-glass>`)

No framework required. Custom attributes are reactive to live DOM attribute updates:

```html
<script type="module" src="./liquid-glass.js"></script>

<liquid-glass
  palette="azure"
  refraction="0.12"
  diffusion="0.25"
  angle="135"
  border-radius="48"
  interactive="true"
  aria-label="Liquid glass visualizer"
  style="width: 380px; height: 520px; border-radius: 36px; overflow: hidden; display: block;">
</liquid-glass>
```

---

## Core Pattern 2: Component Frameworks (React, Vue, Svelte)

### React Component Pattern

```tsx
import React, { useEffect, useRef } from 'react';
import { LiquidGlass, LiquidGlassOptions } from './liquid-glass.js';

interface LiquidGlassCardProps extends LiquidGlassOptions {
  className?: string;
  children?: React.ReactNode;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  palette = 'azure',
  brightness = 1.0,
  diffusion = 0.28,
  refraction = 0.10,
  angle = 135,
  borderRadius = 50,
  interactive = true,
  className = '',
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glassRef = useRef<LiquidGlass | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    glassRef.current = new LiquidGlass(canvasRef.current, {
      palette,
      brightness,
      diffusion,
      refraction,
      angle,
      borderRadius,
      interactive
    });
    glassRef.current.start();

    return () => {
      glassRef.current?.destroy();
      glassRef.current = null;
    };
  }, []);

  useEffect(() => {
    glassRef.current?.setOptions({
      palette,
      brightness,
      diffusion,
      refraction,
      angle,
      borderRadius,
      interactive
    });
  }, [palette, brightness, diffusion, refraction, angle, borderRadius, interactive]);

  return (
    <div className={`liquid-glass-container ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      {children && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
          {children}
        </div>
      )}
    </div>
  );
};
```

---

## Core Pattern 3: DOM Overlay with SVG Optical Refraction

When glass elements must refract existing HTML elements (typography, buttons, media) underneath without a WebGL canvas, combine SVG `<feDisplacementMap>` with CSS `backdrop-filter`:

```html
<div class="glass-backdrop-scene">
  <div class="background-content">
    <h2>Dynamic Background Behind Glass</h2>
  </div>

  <!-- Refractive Glass Capsule -->
  <div class="liquid-glass-refractor">
    <span class="glass-label">Fluid Glass UI</span>
  </div>
</div>

<!-- Reusable Optical SVG Filter -->
<svg style="position: absolute; width: 0; height: 0; pointer-events: none;" aria-hidden="true">
  <filter id="liquid-warp" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="24" xChannelSelector="R" yChannelSelector="G" />
  </filter>
</svg>

<style>
.liquid-glass-refractor {
  position: relative;
  padding: 16px 32px;
  border-radius: 9999px;
  backdrop-filter: url(#liquid-warp) blur(12px) brightness(1.05);
  -webkit-backdrop-filter: url(#liquid-warp) blur(12px) brightness(1.05);

  /* Dual-layer specular glare */
  background:
    radial-gradient(circle 36px at 30% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.50) 30%, transparent 100%),
    rgba(255, 255, 255, 0.08);

  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.35),
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2);
}
</style>
```

---

## Core Pattern 4: High-Gloss CSS Glassmorphism

For high-frequency UI elements (navigation bars, buttons, tab bars) that require zero CPU/GPU overhead:

### Specular Coordinate Math
Calculate highlight origin coordinates based on incident light angle $\theta$ (in degrees):
```javascript
function getSpecularPosition(angleDegrees) {
  const rad = (angleDegrees * Math.PI) / 180;
  // Radius of highlight circle on the dome is calibrated to 26%
  const x = Math.round(50 + 26 * Math.cos(rad));
  const y = Math.round(50 - 26 * Math.sin(rad)); // Inverted Y screen space
  return { x: `${x}%`, y: `${y}%` };
}
```

### Calibrated CSS Class Template
```css
.liquid-glass-card {
  --glare-x: 32%;
  --glare-y: 32%;
  position: relative;
  border-radius: 28px;

  /* Frosted substrate */
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);

  /* Dual-layer specular reflection */
  background:
    /* Layer 1: Core sharp glare pin */
    radial-gradient(
      circle 48px at var(--glare-x) var(--glare-y),
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 255, 255, 0.60) 25%,
      rgba(255, 255, 255, 0.10) 55%,
      transparent 100%
    ),
    /* Layer 2: Ambient dome light bloom */
    radial-gradient(
      circle at var(--glare-x) var(--glare-y),
      rgba(255, 255, 255, 0.30) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 80%
    ),
    /* Layer 3: Crystalline base tint */
    rgba(255, 255, 255, 0.07);

  /* Optical bevel rim */
  border: 1px solid rgba(255, 255, 255, 0.40);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.40),
    inset 0 2px 4px rgba(255, 255, 255, 0.80),
    inset 0 -2px 4px rgba(0, 0, 0, 0.25);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
}

.liquid-glass-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow:
    0 32px 72px rgba(0, 0, 0, 0.50),
    inset 0 2px 5px rgba(255, 255, 255, 0.95),
    inset 0 -2px 4px rgba(0, 0, 0, 0.30);
}
```

---

## Interactive Pointer Tracking Pattern

Make the liquid glass specular arc and optical refraction follow cursor or touch movements in real time:

```javascript
export function attachGlassPointerTracking(cardElement) {
  const handlePointer = (e) => {
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized [-1, 1] relative to center
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;
    
    // Angle in degrees from center
    const angle = Math.atan2(-normY, normX) * (180 / Math.PI);
    const positiveAngle = (angle + 360) % 360;
    
    // Specular coordinates
    const glareX = Math.round(50 + 26 * Math.cos(positiveAngle * Math.PI / 180));
    const glareY = Math.round(50 - 26 * Math.sin(positiveAngle * Math.PI / 180));
    
    cardElement.style.setProperty('--glare-x', `${glareX}%`);
    cardElement.style.setProperty('--glare-y', `${glareY}%`);
  };

  cardElement.addEventListener('pointermove', handlePointer);
  return () => cardElement.removeEventListener('pointermove', handlePointer);
}
```

---

## Best Practices & Performance Checklist

- **Underlying Color Contrast**: Liquid glass is invisible over flat white or flat black. Always place rich, vibrant gradients (e.g. Azure, Sunset, Aurora) or textured imagery underneath.
- **Dispose Resources**: Always call `glass.destroy()` in React cleanup hooks, Vue `onUnmounted`, or Svelte `onDestroy` to prevent WebGL context leaks.
- **Respect `prefers-reduced-motion`**: Read `window.matchMedia('(prefers-reduced-motion: reduce)')` to freeze animated cloth shaders and keep optical refraction static.
- **Keep Specular Highlights Concentrated**: Avoid spreading highlights over the entire element. Keep the core glare radius tight (`32px`–`48px`) with high opacity (`0.95`–`0.98`).
- **GPU Viewport Culling**: In multi-card feeds, use `IntersectionObserver` to pause render loops on cards that scroll offscreen (`glass.stop()`), resuming when visible (`glass.start()`).
- **Semantic Accessibility**: Set `aria-label` or `role="img"` on decorative canvas/glass elements to ensure screen readers provide descriptive labels or ignore non-text visuals.

