---
name: liquid-glass
description: >-
  Provides comprehensive patterns, implementation guides, and reusable code for creating
  liquid glass effects: 3D WebGL optical refraction lenses (Snell's Law + chromatic dispersion),
  SVG displacement liquid filters, and high-gloss CSS glassmorphism with dynamic specular highlights.
  Use when the user asks to implement, customize, or style liquid glass UI components, lenses, cards, or shaders.
---

# Liquid Glass Implementation Guide

This skill provides step-by-step instructions, mathematical formulas, and code templates for building realistic **Liquid Glass** components across three implementation tiers:

1. **Tier 1: 3D WebGL Liquid Glass** (Physical Snell's Law refraction, chromatic dispersion, fluid cloth shaders).
2. **Tier 2: HTML + SVG Optical Refraction** (DOM light bending and fluid distortion without WebGL).
3. **Tier 3: High-Gloss CSS Glassmorphism** (Pure CSS with calibrated specular shining glare spots and bevel shadows).

---

## 1. Choosing the Right Implementation Tier

| Feature | Tier 1: WebGL Shader | Tier 2: HTML + SVG Filter | Tier 3: Pure CSS |
| :--- | :--- | :--- | :--- |
| **Physical Ray Refraction** | Snell's Law per-pixel ray bending | 2D Displacement map distortion | Simulated (No light bending) |
| **Chromatic Aberration** | Yes (RGB wavelength split) | Simulative | No |
| **DOM Element Overlay** | Canvas background or overlay | Direct wrapper on HTML content | Direct styling on HTML elements |
| **Performance** | 60 FPS GPU-accelerated | Very fast, native browser pipeline | Extremely fast, zero JS overhead |
| **Best For** | Hero sections, 3D interactive widgets, showcases | Interactive cards, app modals over content | High-performance buttons, navigation bars, cards |

---

## 2. Tier 1: 3D WebGL Liquid Glass Component

Use the standalone [`liquid-glass.js`](file:///d:/Project/Sophat/labs/libs/liquid-glass/liquid-glass.js) engine to embed interactive 3D liquid lenses.

### Basic Setup
```html
<canvas id="liquid-canvas" style="width: 100vw; height: 100vh; display: block;"></canvas>

<script type="module">
  import { LiquidGlass } from './liquid-glass.js';

  const canvas = document.getElementById('liquid-canvas');
  const glass = new LiquidGlass(canvas, {
    palette: 'azure',       // 'azure' | 'sunset' | 'emerald' | 'violet' | 'rose'
    brightness: 1.00,
    diffusion: 0.28,        // Frost roughness
    refraction: 0.10,       // Optical bending strength
    angle: 135,             // Incident light angle in degrees (0-360)
    borderRadius: 50,       // 0 = square panel, 100 = circular sphere
    interactive: true       // Enable pointer drag & mousewheel rotation
  });
  glass.start();
</script>
```

### Web Component Usage
```html
<script type="module" src="./liquid-glass.js"></script>

<liquid-glass palette="azure" refraction="0.12" style="width: 380px; height: 380px;"></liquid-glass>
```

### Core Shader Physics (GLSL Snell's Law & SDF)
When writing custom shaders for liquid glass:
```glsl
// Signed Distance Field (SDF) for rounded box or sphere
float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + vec2(r);
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// Optical Snell's Law ray bending offset
float eta = 1.0 - (1.0 / max(u_ior, 1.01));
float curvature = (1.0 - z); // Dome height z = sqrt(1 - dist^2)
vec2 refractOffset = -normal.xy * (curvature * 1.6 + 0.3) * u_refraction * eta * 3.5;

// Chromatic dispersion (RGB wavelength split)
float r = sampleScene(uv + refractOffset * (1.0 + u_dispersion)).r;
float g = sampleScene(uv + refractOffset).g;
float b = sampleScene(uv + refractOffset * (1.0 - u_dispersion)).b;
```

---

## 3. Tier 2: HTML + SVG Liquid Refraction (No WebGL)

SVG `<feDisplacementMap>` bends DOM content and background imagery behind the element, achieving true optical distortion without a WebGL canvas.

```html
<!-- Container with textured or colorful background -->
<div class="glass-container">
  <div class="liquid-glass-lens">
    <!-- Optional content inside the glass -->
    <h3>Liquid Glass</h3>
  </div>
</div>

<!-- Invisible SVG optical filter -->
<svg style="position: absolute; width: 0; height: 0; pointer-events: none;">
  <filter id="liquid-refraction">
    <!-- Generates smooth wave distortion noise -->
    <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
    <!-- Warps the pixels underneath based on the noise map -->
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
  </filter>
</svg>

<style>
.glass-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  /* Rich background with high-contrast elements for refraction to bend */
  background: 
    radial-gradient(circle at 20% 20%, #f8c880 0%, transparent 40%),
    linear-gradient(135deg, #0438b8, #1898f8, #f8c880);
}

.liquid-glass-lens {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  position: relative;

  /* SVG Optical Bending + Frost Blur */
  backdrop-filter: url(#liquid-refraction) blur(8px) brightness(1.05);
  -webkit-backdrop-filter: url(#liquid-refraction) blur(8px) brightness(1.05);

  /* Dual-Layer Specular Shining Glare (Incident light at 135° = top-left) */
  background:
    radial-gradient(circle 44px at 32% 32%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.60) 28%, transparent 100%),
    radial-gradient(circle at 32% 32%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.10) 45%, transparent 80%),
    rgba(255, 255, 255, 0.08);

  /* Crystalline Rim & Bevel Inset Shadow */
  border: 1px solid rgba(255, 255, 255, 0.50);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.35),
    inset 0 2px 4px rgba(255, 255, 255, 0.85),
    inset 0 -2px 4px rgba(0, 0, 0, 0.25);
}
</style>
```

---

## 4. Tier 3: Pure High-Gloss CSS Glassmorphism

When pure CSS is required, the key to avoiding a "flat blurry box" is **calibrating the specular light angle and dual-layer glare**.

### Specular Coordinate Math
To place the highlight accurately according to light angle $\theta$ (in degrees):
$$\text{lightX} = \text{round}(50 + 26 \times \cos(\theta_{\text{rad}}))\%$$
$$\text{lightY} = \text{round}(50 - 26 \times \sin(\theta_{\text{rad}}))\%$$

*(Note: $\sin$ is subtracted because in screen space $Y=0$ is top).*

### Production-Ready CSS Template
```css
/* Container: Glass requires a colorful or textured background underneath */
.glass-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0438b8, #1898f8, #f8c880);
}

.liquid-glass-lens {
  width: 280px;
  height: 280px;
  border-radius: 50%;

  /* 1. Optical Frosted Blur & Brightness */
  backdrop-filter: blur(16px) brightness(1.00);
  -webkit-backdrop-filter: blur(16px) brightness(1.00);

  /* 2. Specular Shining Glare (Calibrated for Angle: 135° = Top-Left 32% 32%) */
  background:
    /* Layer A: High-gloss sharp reflection spot (0.98 intensity) */
    radial-gradient(
      circle 44px at 32% 32%,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(255, 255, 255, 0.65) 28%,
      rgba(255, 255, 255, 0.15) 60%,
      transparent 100%
    ),
    /* Layer B: Soft ambient dome light diffusion */
    radial-gradient(
      circle at 32% 32%,
      rgba(255, 255, 255, 0.35) 0%,
      rgba(255, 255, 255, 0.10) 45%,
      transparent 80%
    ),
    /* Layer C: Base translucent crystal tint */
    rgba(255, 255, 255, 0.08);

  /* 3. Crystalline Refractive Rim & Bevel */
  border: 1px solid rgba(255, 255, 255, 0.50);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.35),
    inset 0 2px 4px rgba(255, 255, 255, 0.85),
    inset 0 -2px 4px rgba(0, 0, 0, 0.25);
}
```

---

## 5. Curated Harmonious Color Palettes

Liquid glass requires rich, vibrant backgrounds to shine through. Use these calibrated gradients:

* **Azure Silk**: `linear-gradient(135deg, #0438b8, #1898f8, #f8c880)`
* **Sunset Gold**: `linear-gradient(135deg, #60103c, #d13448, #f8a452)`
* **Emerald Aurora**: `linear-gradient(135deg, #05423d, #0fa07c, #b4f88e)`
* **Cyber Violet**: `linear-gradient(135deg, #290a66, #7a1fbf, #38d6fa)`
* **Obsidian Rose**: `linear-gradient(135deg, #380a1e, #a31e4d, #f9a4bf)`

---

## 6. Critical Gotchas & Troubleshooting

1. **"The glass effect is not visible when I paste it":**
   * Glass relies on `backdrop-filter`. Blurring an empty white/black background looks invisible.
   * **Always** place a gradient, pattern, or imagery behind the glass container.
2. **"The shine is washed out or not visible":**
   * Single-layer diffuse gradients fade into the background.
   * **Always** use a small, concentrated core circle (`circle 44px`) with high opacity (`rgba(255, 255, 255, 0.98)`).
   * Ensure the center offset uses $24\%\text{--}28\%$ radius so it sits prominently on the dome face rather than being clipped at the border edge.
3. **Cross-Browser Support**:
   * Always include both `-webkit-backdrop-filter` and `backdrop-filter`.
   * For SVG displacement filters on Safari, ensure the `<svg>` is placed in the DOM with `width: 0; height: 0;` rather than `display: none`.
