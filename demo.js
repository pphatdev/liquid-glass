/**
 * Liquid Glass - Reference UI Interactive Controller (ESM Module)
 * Features physical 3D spherical lens refraction, specular glare highlight,
 * silk wave background shader, interactive dragging, and live slider reactivity.
 */

export const PALETTES = [
    {
        id: 'azure',
        name: 'Azure Silk',
        deep: [0.04, 0.22, 0.72],
        mid: [0.08, 0.48, 0.96],
        sky: [0.38, 0.72, 0.98],
        bright: [0.18, 0.64, 0.98],
        glow: [0.98, 0.82, 0.60],
        warmth: [0.95, 0.68, 0.48],
        preview: 'linear-gradient(135deg, #0438b8, #1898f8, #f8c880)',
    },
    {
        id: 'sunset',
        name: 'Sunset Gold',
        deep: [0.38, 0.06, 0.24],
        mid: [0.82, 0.20, 0.28],
        sky: [0.98, 0.64, 0.32],
        bright: [1.0, 0.42, 0.20],
        glow: [1.0, 0.92, 0.65],
        warmth: [0.98, 0.52, 0.30],
        preview: 'linear-gradient(135deg, #60103c, #d13448, #f8a452)',
    },
    {
        id: 'emerald',
        name: 'Emerald Aurora',
        deep: [0.02, 0.26, 0.24],
        mid: [0.06, 0.56, 0.44],
        sky: [0.22, 0.82, 0.68],
        bright: [0.32, 0.98, 0.74],
        glow: [0.86, 0.98, 0.62],
        warmth: [0.38, 0.86, 0.58],
        preview: 'linear-gradient(135deg, #05423d, #0fa07c, #b4f88e)',
    },
    {
        id: 'violet',
        name: 'Cyber Violet',
        deep: [0.16, 0.04, 0.40],
        mid: [0.48, 0.12, 0.75],
        sky: [0.80, 0.42, 0.95],
        bright: [0.22, 0.84, 0.98],
        glow: [0.95, 0.65, 1.0],
        warmth: [0.65, 0.22, 0.85],
        preview: 'linear-gradient(135deg, #290a66, #7a1fbf, #38d6fa)',
    },
    {
        id: 'rose',
        name: 'Obsidian Rose',
        deep: [0.22, 0.04, 0.12],
        mid: [0.64, 0.12, 0.30],
        sky: [0.92, 0.46, 0.60],
        bright: [0.98, 0.58, 0.74],
        glow: [1.0, 0.82, 0.80],
        warmth: [0.85, 0.32, 0.48],
        preview: 'linear-gradient(135deg, #380a1e, #a31e4d, #f9a4bf)',
    }
];

// Helper: HSL to RGB [0..1]
export function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            let tVal = t;
            if (tVal < 0) tVal += 1;
            if (tVal > 1) tVal -= 1;
            if (tVal < 1 / 6) return p + (q - p) * 6 * tVal;
            if (tVal < 1 / 2) return q;
            if (tVal < 2 / 3) return p + (q - p) * (2 / 3 - tVal) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [
        Math.max(0, Math.min(1, r)),
        Math.max(0, Math.min(1, g)),
        Math.max(0, Math.min(1, b))
    ];
}

// Generate aesthetically pleasing harmonious random palette
export function generateRandomPalette() {
    const baseHue = Math.random(); // 0..1
    const accentHue = (baseHue + 0.08 + Math.random() * 0.14) % 1.0;
    const glowHue = (baseHue + 0.35 + Math.random() * 0.2) % 1.0;

    const deep = hslToRgb(baseHue, 0.82, 0.16);
    const mid = hslToRgb(baseHue, 0.78, 0.42);
    const sky = hslToRgb(accentHue, 0.75, 0.68);
    const bright = hslToRgb(accentHue, 0.92, 0.64);
    const glow = hslToRgb(glowHue, 0.88, 0.78);
    const warmth = hslToRgb((glowHue + 0.06) % 1.0, 0.82, 0.56);

    const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
    const preview = `linear-gradient(135deg, ${rgbToHex(deep)}, ${rgbToHex(mid)}, ${rgbToHex(glow)})`;

    return { id: 'custom-' + Date.now(), name: 'Harmonic ' + Math.round(baseHue * 360) + '°', deep, mid, sky, bright, glow, warmth, preview };
}

export const DEFAULTS = {
    brightness: 1.00,
    diffusion: 0.28,
    refraction: 0.10,
    angle: 135.0, // incident light / glare angle in degrees
    borderRadius: 50, // 0 = sharp square panel, 100 = circular orb
    ior: 1.48,
    dispersion: 0.022,
    radius: 0.26, // normalized relative to aspect
};

export const state = {
    brightness: DEFAULTS.brightness,
    diffusion: DEFAULTS.diffusion,
    refraction: DEFAULTS.refraction,
    angle: DEFAULTS.angle,
    borderRadius: DEFAULTS.borderRadius,
    ior: DEFAULTS.ior,
    dispersion: DEFAULTS.dispersion,
    radius: DEFAULTS.radius,

    // Background color palette state (with smooth transition lerp)
    currentPaletteId: 'azure',
    paletteName: 'Azure Silk',
    currentColorDeep: [...PALETTES[0].deep],
    targetColorDeep: [...PALETTES[0].deep],
    currentColorMid: [...PALETTES[0].mid],
    targetColorMid: [...PALETTES[0].mid],
    currentColorSky: [...PALETTES[0].sky],
    targetColorSky: [...PALETTES[0].sky],
    currentColorBright: [...PALETTES[0].bright],
    targetColorBright: [...PALETTES[0].bright],
    currentColorGlow: [...PALETTES[0].glow],
    targetColorGlow: [...PALETTES[0].glow],
    currentColorWarmth: [...PALETTES[0].warmth],
    targetColorWarmth: [...PALETTES[0].warmth],

    // Orb center in UV space [0..1]
    orbX: 0.50,
    orbY: 0.68, // upper half of the card
    targetOrbX: 0.50,
    targetOrbY: 0.68,
    isDragging: false,
    dragStartPointerX: 0,
    dragStartPointerY: 0,
    dragStartOrbX: 0.50,
    dragStartOrbY: 0.68,
};

const VERTEX_SHADER = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const FRAGMENT_SHADER = `
    precision highp float;
    varying vec2 v_uv;

    uniform vec2 u_resolution;
    uniform vec2 u_orbCenter;
    uniform float u_time;
    uniform float u_brightness;
    uniform float u_diffusion;
    uniform float u_refraction;
    uniform float u_angle;
    uniform float u_cornerRadius;
    uniform float u_ior;
    uniform float u_dispersion;
    uniform float u_radius;

    // Dynamic background palette uniforms
    uniform vec3 u_colorDeep;
    uniform vec3 u_colorMid;
    uniform vec3 u_colorSky;
    uniform vec3 u_colorBright;
    uniform vec3 u_colorGlow;
    uniform vec3 u_colorWarmth;

    float sdRoundedBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + vec2(r);
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
    }

    vec2 getSDFNormal(vec2 p, vec2 b, float r) {
        vec2 eps = vec2(1.0 / u_resolution.x, 0.0);
        float d1 = sdRoundedBox(p + eps.xy, b, r);
        float d2 = sdRoundedBox(p - eps.xy, b, r);
        float d3 = sdRoundedBox(p + eps.yx, b, r);
        float d4 = sdRoundedBox(p - eps.yx, b, r);
        return normalize(vec2(d1 - d2, d3 - d4));
    }

    // Procedural Silk Ribbon Background with dynamic color palette (fixed background lighting)
    vec3 renderSilkBackground(vec2 uv, float t) {
        // Golden sunlight / morning peach glow fixed at top-left (gentle, soft ambient illumination)
        vec2 sunPos = vec2(0.12, 0.85);
        float sunDist = length(uv - sunPos);
        vec3 goldGlow = u_colorGlow * exp(-sunDist * 3.0) * 0.46;
        vec3 peachWarmth = u_colorWarmth * exp(-sunDist * 1.8) * 0.24;

        // Base vertical sky gradient
        vec3 bg = mix(u_colorDeep, u_colorMid, smoothstep(0.0, 0.55, uv.y));
        bg = mix(bg, u_colorSky, smoothstep(0.55, 1.0, uv.y));

        // Diagonal fluid silk cloth wave creases (flowing bottom-left to top-right)
        float diag = (uv.x * 0.78 + uv.y * 0.62);
        float wave1 = sin(diag * 7.5 - t * 0.25 + sin(uv.x * 4.0) * 0.5);
        float wave2 = cos(diag * 13.0 + t * 0.18);
        float silkShimmer = smoothstep(-0.6, 0.8, wave1) * 0.24 + smoothstep(0.2, 0.9, wave2) * 0.14;

        // Diagonal ridge highlight line (visible passing through the sphere in reference)
        float ridgeDist = abs((uv.x * 0.82 + uv.y * 0.68) - 0.78 - 0.04 * sin(uv.y * 5.0 + t * 0.3));
        float ridge = exp(-ridgeDist * 18.0) * 0.22;

        bg = bg + vec3(silkShimmer) * u_colorBright;
        bg += ridge * mix(vec3(0.85), u_colorBright, 0.35);
        bg += goldGlow + peachWarmth;

        return bg;
    }

    // Blurred scene sampling for glass diffusion / frost roughness
    vec3 sampleSceneDiffused(vec2 uv, float t, float diff) {
        if (diff <= 0.005) return renderSilkBackground(uv, t);
        float r = diff * 0.022;
        float diag = r * 0.7071;

        vec3 col = renderSilkBackground(uv, t) * 0.26;
        col += (renderSilkBackground(uv + vec2(r, 0.0), t) + renderSilkBackground(uv - vec2(r, 0.0), t) +
                renderSilkBackground(uv + vec2(0.0, r), t) + renderSilkBackground(uv - vec2(0.0, r), t)) * 0.12;
        col += (renderSilkBackground(uv + vec2(diag, diag), t) + renderSilkBackground(uv + vec2(-diag, diag), t) +
                renderSilkBackground(uv + vec2(diag, -diag), t) + renderSilkBackground(uv - vec2(diag, -diag), t)) * 0.065;
        return col;
    }

    void main() {
        vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
        vec2 p = (v_uv - 0.5) * aspect;
        vec2 center = (u_orbCenter - 0.5) * aspect;
        vec2 localP = p - center;

        float minDim = min(aspect.x, aspect.y);
        float baseRadius = u_radius * minDim * 1.12;
        vec2 boxHalf = vec2(baseRadius, baseRadius);
        float cornerR = clamp(u_cornerRadius, 0.001, 1.0) * baseRadius;

        float d = sdRoundedBox(localP, boxHalf, cornerR);

        // Outside the glass panel
        if (d > 0.003) {
            gl_FragColor = vec4(renderSilkBackground(v_uv, u_time), 1.0);
            return;
        }

        float rad = radians(u_angle);
        vec2 lightDir2D = vec2(cos(rad), sin(rad));

        // Inside spherical / rounded 3D glass panel
        vec2 normal2D = getSDFNormal(localP, boxHalf, cornerR);
        float normDist = clamp(-d / max(0.001, cornerR), 0.0, 1.0);
        float z = sqrt(max(0.0, 1.0 - pow(1.0 - normDist, 2.0)));
        vec3 normal = normalize(vec3(normal2D * (1.0 - z), z));

        // Physical Snell's Law Refraction Ray Offset
        float eta = 1.0 - (1.0 / max(u_ior, 1.01));
        float curvature = (1.0 - z); // bends more strongly towards the bevel edge
        vec2 refractOffset = -normal.xy * (curvature * 1.6 + 0.3) * u_refraction * eta * 3.5;

        // Chromatic dispersion (RGB wavelength split)
        float r = sampleSceneDiffused(v_uv + refractOffset * (1.0 + u_dispersion), u_time, u_diffusion).r;
        float g = sampleSceneDiffused(v_uv + refractOffset, u_time, u_diffusion).g;
        float b = sampleSceneDiffused(v_uv + refractOffset * (1.0 - u_dispersion), u_time, u_diffusion).b;

        vec3 glassColor = vec3(r, g, b) * u_brightness;

        // Internal frosted absorption / soft crystalline tint
        glassColor = mix(glassColor, vec3(0.96, 0.98, 1.0) * glassColor, 0.25);

        // 3D Lighting Setup (Directional key light rotating with u_angle)
        vec3 lightDir = normalize(vec3(lightDir2D, 0.80));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfVec = normalize(lightDir + viewDir);

        // Signature specular circular light spot rotates around perimeter with u_angle (soft, realistic glass reflection)
        vec2 spotCenter = center + lightDir2D * (baseRadius * 0.60);
        float spotDist = length(p - spotCenter);
        float crispSpot = smoothstep(baseRadius * 0.18, baseRadius * 0.12, spotDist) * 0.50;
        float spotGlow = exp(-spotDist * 16.0 / baseRadius) * 0.22;
        vec3 signatureGlare = vec3(1.0) * (crispSpot + spotGlow);

        // Smooth Blinn-Phong specular highlight across glass dome
        float specBase = pow(max(dot(normal, halfVec), 0.0), mix(45.0, 12.0, u_diffusion));
        vec3 domeSpecular = vec3(specBase) * 0.22;

        // Fresnel edge reflection (Schlick approximation)
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.4) * 0.45;
        vec3 rimGlare = vec3(fresnel) * vec3(0.85, 0.92, 1.0);

        // Smooth anti-aliased edge blending
        float edgeAA = smoothstep(0.003, 0.0, d);

        vec3 finalGlass = glassColor + signatureGlare + domeSpecular + rimGlare;
        vec3 backgroundBehind = renderSilkBackground(v_uv, u_time);

        gl_FragColor = vec4(mix(backgroundBehind, finalGlass, edgeAA), 1.0);
    }
`;

export class LiquidGlassViewer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl', {
            alpha: false,
            antialias: true,
            depth: false,
            powerPreference: 'high-performance',
        });

        if (!this.gl) throw new Error('WebGL not supported');

        this.program = null;
        this.quadBuffer = null;
        this.uniforms = {};
        this.startTime = performance.now();
        this.animId = null;

        this.init();
        this.resize();
    }

    init() {
        const gl = this.gl;
        const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(prog));
        }
        this.program = prog;

        // Quad buffer (fullscreen triangle)
        this.quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]),
            gl.STATIC_DRAW
        );
        this.posAttrib = gl.getAttribLocation(prog, 'a_position');

        // Cache Uniform Locations
        const names = [
            'u_resolution', 'u_orbCenter', 'u_time', 'u_brightness',
            'u_diffusion', 'u_refraction', 'u_angle', 'u_cornerRadius', 'u_ior', 'u_dispersion', 'u_radius',
            'u_colorDeep', 'u_colorMid', 'u_colorSky', 'u_colorBright', 'u_colorGlow', 'u_colorWarmth'
        ];
        for (const n of names) {
            this.uniforms[n] = gl.getUniformLocation(prog, n);
        }
    }

    compileShader(type, src) {
        const gl = this.gl;
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(s));
        }
        return s;
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        const tw = Math.floor(width * dpr);
        const th = Math.floor(height * dpr);

        if (this.canvas.width !== tw || this.canvas.height !== th) {
            this.canvas.width = tw;
            this.canvas.height = th;
            this.gl.viewport(0, 0, tw, th);
        }
    }

    render() {
        const gl = this.gl;
        if (!gl) return;

        // Smooth lerp tracking for orb center
        state.orbX += (state.targetOrbX - state.orbX) * 0.12;
        state.orbY += (state.targetOrbY - state.orbY) * 0.12;

        // Smooth color palette transition lerp
        const lerpSpeed = 0.08;
        const lerpVec3 = (cur, tar) => {
            cur[0] += (tar[0] - cur[0]) * lerpSpeed;
            cur[1] += (tar[1] - cur[1]) * lerpSpeed;
            cur[2] += (tar[2] - cur[2]) * lerpSpeed;
        };
        lerpVec3(state.currentColorDeep, state.targetColorDeep);
        lerpVec3(state.currentColorMid, state.targetColorMid);
        lerpVec3(state.currentColorSky, state.targetColorSky);
        lerpVec3(state.currentColorBright, state.targetColorBright);
        lerpVec3(state.currentColorGlow, state.targetColorGlow);
        lerpVec3(state.currentColorWarmth, state.targetColorWarmth);

        gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.enableVertexAttribArray(this.posAttrib);
        gl.vertexAttribPointer(this.posAttrib, 2, gl.FLOAT, false, 0, 0);

        const elapsed = (performance.now() - this.startTime) * 0.001;

        gl.uniform2f(this.uniforms['u_resolution'], this.canvas.width, this.canvas.height);
        gl.uniform2f(this.uniforms['u_orbCenter'], state.orbX, state.orbY);
        gl.uniform1f(this.uniforms['u_time'], elapsed);
        gl.uniform1f(this.uniforms['u_brightness'], state.brightness);
        gl.uniform1f(this.uniforms['u_diffusion'], state.diffusion);
        gl.uniform1f(this.uniforms['u_refraction'], state.refraction);
        gl.uniform1f(this.uniforms['u_angle'], state.angle);
        gl.uniform1f(this.uniforms['u_cornerRadius'], state.borderRadius / 100.0);
        gl.uniform1f(this.uniforms['u_ior'], state.ior);
        gl.uniform1f(this.uniforms['u_dispersion'], state.dispersion);
        gl.uniform1f(this.uniforms['u_radius'], state.radius);

        // Upload dynamic background colors
        gl.uniform3fv(this.uniforms['u_colorDeep'], state.currentColorDeep);
        gl.uniform3fv(this.uniforms['u_colorMid'], state.currentColorMid);
        gl.uniform3fv(this.uniforms['u_colorSky'], state.currentColorSky);
        gl.uniform3fv(this.uniforms['u_colorBright'], state.currentColorBright);
        gl.uniform3fv(this.uniforms['u_colorGlow'], state.currentColorGlow);
        gl.uniform3fv(this.uniforms['u_colorWarmth'], state.currentColorWarmth);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    start() {
        const loop = () => {
            this.render();
            this.animId = requestAnimationFrame(loop);
        };
        this.animId = requestAnimationFrame(loop);
    }
}

export function initLiquidGlassApp() {
    const canvas = document.getElementById('gl-canvas');
    const viewport = document.getElementById('canvas-viewport');

    // Sliders & Fills
    const slBrightness = document.getElementById('sl-brightness');
    const slDiffusion = document.getElementById('sl-diffusion');
    const slRefraction = document.getElementById('sl-refraction');
    const slAngle = document.getElementById('sl-angle');
    const slRadius = document.getElementById('sl-radius');
    const fillBrightness = document.getElementById('fill-brightness');
    const fillDiffusion = document.getElementById('fill-diffusion');
    const fillRefraction = document.getElementById('fill-refraction');
    const fillAngle = document.getElementById('fill-angle');
    const fillRadius = document.getElementById('fill-radius');

    // Buttons
    const btnApply = document.getElementById('btn-apply');
    const btnReset = document.getElementById('btn-reset');
    const btnCode = document.getElementById('btn-code');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // Palette Controls
    const paletteSwatchesContainer = document.getElementById('palette-swatches');
    const paletteNameBadge = document.getElementById('palette-name');
    const btnRandomColor = document.getElementById('btn-random-color');
    const btnTopRandom = document.getElementById('btn-top-random');

    // Code Modal
    const codeModal = document.getElementById('code-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const tabCss = document.getElementById('tab-css');
    const tabSvg = document.getElementById('tab-svg');
    const tabWebgl = document.getElementById('tab-webgl');
    const copyLabel = document.getElementById('btn-copy-label');
    const codeBox = document.getElementById('code-box');
    const btnCopy = document.getElementById('btn-copy');
    const btnQuickCopy = document.getElementById('btn-quick-copy');

    let activeLang = 'css';
    let engine = null;

    function setTab(lang) {
        activeLang = lang;
        if (tabCss) tabCss.classList.toggle('active', lang === 'css');
        if (tabSvg) tabSvg.classList.toggle('active', lang === 'svg');
        if (tabWebgl) tabWebgl.classList.toggle('active', lang === 'webgl');
        if (copyLabel) {
            copyLabel.textContent = lang === 'css' ? 'Copy CSS' : (lang === 'svg' ? 'Copy HTML+SVG' : 'Copy WebGL');
        }
        updateLiveCode();
    }

    if (tabCss) tabCss.addEventListener('click', () => setTab('css'));
    if (tabSvg) tabSvg.addEventListener('click', () => setTab('svg'));
    if (tabWebgl) tabWebgl.addEventListener('click', () => setTab('webgl'));

    // Helper: update live code box in real-time when sliders move
    function updateLiveCode() {
        if (codeModal && codeModal.classList.contains('open')) {
            codeBox.textContent = generateCode();
        }
    }

    /***
    * Background Palette Management
    */
    function applyPalette(palette, isRandom = false) {
        state.currentPaletteId = palette.id;
        state.paletteName = palette.name;
        if (paletteNameBadge) paletteNameBadge.textContent = palette.name;

        state.targetColorDeep = [...palette.deep];
        state.targetColorMid = [...palette.mid];
        state.targetColorSky = [...palette.sky];
        state.targetColorBright = [...palette.bright];
        state.targetColorGlow = [...palette.glow];
        state.targetColorWarmth = [...palette.warmth];

        // Update swatch active outline state
        if (paletteSwatchesContainer) {
            const swatches = paletteSwatchesContainer.querySelectorAll('.palette-swatch');
            swatches.forEach(s => {
                if (!isRandom && s.dataset.paletteId === palette.id) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        }

        showToast(isRandom ? `Generated: ${palette.name}` : `Theme: ${palette.name}`);
        updateLiveCode();
    }

    function randomizeBackground() {
        const p = generateRandomPalette();
        applyPalette(p, true);
    }

    // Populate preset palette swatches
    if (paletteSwatchesContainer) {
        paletteSwatchesContainer.innerHTML = '';
        PALETTES.forEach(p => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `palette-swatch ${p.id === state.currentPaletteId ? 'active' : ''}`;
            btn.style.background = p.preview;
            btn.title = p.name;
            btn.dataset.paletteId = p.id;
            btn.addEventListener('click', () => applyPalette(p));
            paletteSwatchesContainer.appendChild(btn);
        });
    }

    if (btnRandomColor) {
        btnRandomColor.addEventListener('click', randomizeBackground);
    }
    if (btnTopRandom) {
        btnTopRandom.addEventListener('click', randomizeBackground);
    }

    try {
        engine = new LiquidGlassViewer(canvas);
        engine.start();
    } catch (e) {
        console.error('WebGL Initialization error:', e);
    }

    window.addEventListener('resize', () => {
        if (engine) engine.resize();
    });

    // Helper: Update slider fill bar visually
    function updateSliderFill(slider, fillElem) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const val = parseFloat(slider.value);
        const percent = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
        fillElem.style.width = percent + '%';
    }

    function syncAllSlidersFromState() {
        slBrightness.value = state.brightness;
        slDiffusion.value = state.diffusion;
        slRefraction.value = state.refraction;
        slAngle.value = state.angle;
        slRadius.value = state.borderRadius;

        updateSliderFill(slBrightness, fillBrightness);
        updateSliderFill(slDiffusion, fillDiffusion);
        updateSliderFill(slRefraction, fillRefraction);
        updateSliderFill(slAngle, fillAngle);
        updateSliderFill(slRadius, fillRadius);
    }

    // Slider Event Listeners (sync WebGL shader and live code modal in realtime)
    slBrightness.addEventListener('input', (e) => {
        state.brightness = parseFloat(e.target.value);
        updateSliderFill(slBrightness, fillBrightness);
        updateLiveCode();
    });

    slDiffusion.addEventListener('input', (e) => {
        state.diffusion = parseFloat(e.target.value);
        updateSliderFill(slDiffusion, fillDiffusion);
        updateLiveCode();
    });

    slRefraction.addEventListener('input', (e) => {
        state.refraction = parseFloat(e.target.value);
        updateSliderFill(slRefraction, fillRefraction);
        updateLiveCode();
    });

    slAngle.addEventListener('input', (e) => {
        state.angle = parseFloat(e.target.value);
        updateSliderFill(slAngle, fillAngle);
        updateLiveCode();
    });

    slRadius.addEventListener('input', (e) => {
        state.borderRadius = parseFloat(e.target.value);
        updateSliderFill(slRadius, fillRadius);
        updateLiveCode();
    });

    /***
    * Interactive Dragging: Drag on circle to change light angle, or drag outside to move orb
    */
    function getEffectiveRadius(rect) {
        const aspectX = rect.width / rect.height;
        const minDim = Math.min(aspectX, 1.0);
        return state.radius * minDim * 1.12;
    }

    function updateAngleFromPointer(pointerUvX, pointerUvY, rect) {
        const aspectX = rect.width / rect.height;
        const dx = (pointerUvX - state.orbX) * aspectX;
        const dy = (pointerUvY - state.orbY) * 1.0;

        const angleRad = Math.atan2(dy, dx);
        let deg = Math.round((angleRad * 180 / Math.PI + 360) % 360);
        state.angle = deg;
        slAngle.value = deg;
        updateSliderFill(slAngle, fillAngle);
        updateLiveCode();
    }

    function onPointerDown(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

        const pointerUvX = (clientX - rect.left) / rect.width;
        const pointerUvY = 1.0 - (clientY - rect.top) / rect.height;

        const aspectX = rect.width / rect.height;
        const dx = (pointerUvX - state.orbX) * aspectX;
        const dy = (pointerUvY - state.orbY) * 1.0;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const effR = getEffectiveRadius(rect);

        // If clicked on or near the circle: drag to rotate light angle
        if (dist <= effR * 1.35) {
            state.isDragging = true;
            state.dragMode = 'angle';
            updateAngleFromPointer(pointerUvX, pointerUvY, rect);
        } else if (pointerUvY > 0.40) {
            // If clicked in the canvas area outside the circle: move the orb position
            state.isDragging = true;
            state.dragMode = 'position';
            state.dragStartPointerX = pointerUvX;
            state.dragStartPointerY = pointerUvY;
            state.dragStartOrbX = state.orbX;
            state.dragStartOrbY = state.orbY;
            state.targetOrbX = Math.max(0.14, Math.min(0.86, pointerUvX));
            state.targetOrbY = Math.max(0.48, Math.min(0.82, pointerUvY));
        }
    }

    function onPointerMove(e) {
        if (!state.isDragging) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

        const pointerUvX = (clientX - rect.left) / rect.width;
        const pointerUvY = 1.0 - (clientY - rect.top) / rect.height;

        if (state.dragMode === 'angle') {
            updateAngleFromPointer(pointerUvX, pointerUvY, rect);
        } else if (state.dragMode === 'position') {
            const deltaX = pointerUvX - state.dragStartPointerX;
            const deltaY = pointerUvY - state.dragStartPointerY;

            state.targetOrbX = Math.max(0.14, Math.min(0.86, state.dragStartOrbX + deltaX));
            state.targetOrbY = Math.max(0.48, Math.min(0.82, state.dragStartOrbY + deltaY));
        }
    }

    function onPointerUp() {
        state.isDragging = false;
        state.dragMode = null;
    }

    viewport.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    viewport.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    // Mouse wheel on canvas rotates angle dynamically
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        state.angle = (state.angle + (e.deltaY > 0 ? 4 : -4) + 360) % 360;
        slAngle.value = state.angle;
        updateSliderFill(slAngle, fillAngle);
        updateLiveCode();
    }, { passive: false });

    /***
    * Toast Notification
    */
    let toastTimeout = null;
    function showToast(text) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toastMessage.textContent = text;
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2400);
    }

    /***
    * Copy Button Action (replaces Apply)
    */
    btnApply.addEventListener('click', () => {
        const cssSnippet = generateCode();
        navigator.clipboard.writeText(cssSnippet).then(() => {
            showToast('✓ Realtime Glass CSS copied!');
        }).catch(() => {
            showToast('CSS copied to clipboard');
        });
    });

    /***
    * Reset Button Action
    */
    btnReset.addEventListener('click', () => {
        state.brightness = DEFAULTS.brightness;
        state.diffusion = DEFAULTS.diffusion;
        state.refraction = DEFAULTS.refraction;
        state.angle = DEFAULTS.angle;
        state.borderRadius = DEFAULTS.borderRadius;
        state.targetOrbX = 0.50;
        state.targetOrbY = 0.68;

        applyPalette(PALETTES[0]);
        syncAllSlidersFromState();
        updateLiveCode();
        showToast('Settings reset to defaults');
    });

    /***
     * Helper: get current background gradient
     */
    function getActiveBackgroundGradient() {
        const found = PALETTES.find(p => p.id === state.currentPaletteId);
        if (found) return found.preview;
        const toHex = ([r, g, b]) => '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
        return `linear-gradient(135deg, ${toHex(state.currentColorDeep)}, ${toHex(state.currentColorMid)}, ${toHex(state.currentColorGlow)})`;
    }

    /***
     * Realtime Reactive Style Generator (CSS Glass, SVG Liquid, WebGL)
     */
    function generateCode() {
        const rad = (state.angle * Math.PI) / 180;
        // Accurate glass specular spot offset within the 3D dome (radius ~ 26%)
        const lightX = Math.round(50 + 26 * Math.cos(rad));
        const lightY = Math.round(50 - 26 * Math.sin(rad));
        const blurPx = Math.round(state.diffusion * 35 + 6);
        const radiusValue = state.borderRadius === 100 ? '50%' : `${Math.round(state.borderRadius * 0.48)}px`;
        const bgGradient = getActiveBackgroundGradient();

        if (activeLang === 'webgl') {
            return `<!-- 1:1 Exact Liquid Glass WebGL Component -->
<canvas id="liquid-glass" style="width: 100vw; height: 100vh; display: block;"></canvas>

<script type="module">
  import { LiquidGlass } from './liquid-glass.js';

  const canvas = document.getElementById('liquid-glass');
  const glass = new LiquidGlass(canvas, {
    palette: '${state.currentPaletteId}',
    brightness: ${state.brightness.toFixed(2)},
    diffusion: ${state.diffusion.toFixed(2)},
    refraction: ${state.refraction.toFixed(2)},
    angle: ${Math.round(state.angle)},
    borderRadius: ${Math.round(state.borderRadius)},
    interactive: true
  });
  glass.start();
</script>`;
        }

        if (activeLang === 'svg') {
            return `<!-- HTML + SVG Optical Liquid Refraction Lens -->
<div class="glass-container">
  <div class="liquid-glass-lens"></div>
</div>

<svg style="position: absolute; width: 0; height: 0;">
  <filter id="liquid-refract">
    <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${Math.round(state.refraction * 250)}" xChannelSelector="R" yChannelSelector="G" />
  </filter>
</svg>

<style>
.glass-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: ${bgGradient};
}

.liquid-glass-lens {
    width: 280px;
    height: 280px;
    border-radius: ${radiusValue};

    /* Optical SVG Liquid Bending + Blur */
    backdrop-filter: url(#liquid-refract) blur(${blurPx}px) brightness(${state.brightness.toFixed(2)});
    -webkit-backdrop-filter: url(#liquid-refract) blur(${blurPx}px) brightness(${state.brightness.toFixed(2)});

    /* Specular Shining Glare Spot at ${Math.round(state.angle)}° */
    background:
        radial-gradient(
            circle 44px at ${lightX}% ${lightY}%,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(255, 255, 255, 0.65) 28%,
            rgba(255, 255, 255, 0.15) 60%,
            transparent 100%
        ),
        radial-gradient(
            circle at ${lightX}% ${lightY}%,
            rgba(255, 255, 255, 0.35) 0%,
            rgba(255, 255, 255, 0.10) 45%,
            transparent 80%
        ),
        rgba(255, 255, 255, 0.08);

    /* Crystalline Rim & Bevel */
    border: 1px solid rgba(255, 255, 255, 0.50);
    box-shadow:
        0 24px 60px rgba(0, 0, 0, 0.35),
        inset 0 2px 4px rgba(255, 255, 255, 0.85),
        inset 0 -2px 4px rgba(0, 0, 0, 0.25);
}
</style>`;
        }

        // CSS Only mode
        return `/* Realtime Liquid Glass Style (${state.paletteName}) */

/* 1. Background Container */
.glass-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: ${bgGradient};
}

/* 2. Liquid Glass Lens Element */
.liquid-glass-lens {
    width: 280px;
    height: 280px;
    border-radius: ${radiusValue};

    /* Optical Frosted Blur & Dynamic Brightness */
    backdrop-filter: blur(${blurPx}px) brightness(${state.brightness.toFixed(2)});
    -webkit-backdrop-filter: blur(${blurPx}px) brightness(${state.brightness.toFixed(2)});

    /* Specular Shining Glare Spot (Intense glossy highlight at ${Math.round(state.angle)}°) */
    background:
        /* Crisp high-gloss shining spot at light coordinates */
        radial-gradient(
            circle 44px at ${lightX}% ${lightY}%,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(255, 255, 255, 0.65) 28%,
            rgba(255, 255, 255, 0.15) 60%,
            transparent 100%
        ),
        /* Soft glass dome specular reflection */
        radial-gradient(
            circle at ${lightX}% ${lightY}%,
            rgba(255, 255, 255, 0.35) 0%,
            rgba(255, 255, 255, 0.10) 45%,
            transparent 80%
        ),
        /* Base translucent glass tint */
        rgba(255, 255, 255, 0.08);

    /* Crystalline Refractive Rim & Bevel */
    border: 1px solid rgba(255, 255, 255, 0.50);
    box-shadow:
        0 24px 60px rgba(0, 0, 0, 0.35),
        inset 0 2px 4px rgba(255, 255, 255, 0.85),
        inset 0 -2px 4px rgba(0, 0, 0, 0.25);
}`;
    }

    function openModal() {
        codeBox.textContent = generateCode();
        codeModal.classList.add('open');
    }

    function closeModal() {
        codeModal.classList.remove('open');
    }

    if (btnCode) btnCode.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (codeModal) {
        codeModal.addEventListener('click', (e) => {
            if (e.target === codeModal) closeModal();
        });
    }

    // Quick copy button in top nav
    if (btnQuickCopy) {
        btnQuickCopy.addEventListener('click', () => {
            const cssSnippet = generateCode();
            navigator.clipboard.writeText(cssSnippet).then(() => {
                showToast('✓ Realtime glass CSS copied!');
            }).catch(() => {
                showToast('CSS copied to clipboard');
            });
        });
    }

    // Modal copy button
    if (btnCopy) {
        btnCopy.addEventListener('click', () => {
            navigator.clipboard.writeText(codeBox.textContent).then(() => {
                showToast('✓ Copied CSS glass style!');
                closeModal();
            }).catch(() => {
                showToast('CSS copied to clipboard');
                closeModal();
            });
        });
    }

    // Card Size Switcher (Mobile / Tablet / Full)
    const sizeButtons = document.querySelectorAll('.btn-size-chip');
    const widgetCard = document.getElementById('widget-card');
    const demoWrapper = document.querySelector('.demo-wrapper');

    if (sizeButtons.length > 0 && widgetCard && demoWrapper) {
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const size = btn.dataset.size;
                sizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                widgetCard.classList.remove('size-tablet', 'size-full');
                demoWrapper.classList.remove('is-fullscreen');

                if (size === 'tablet') {
                    widgetCard.classList.add('size-tablet');
                } else if (size === 'full') {
                    widgetCard.classList.add('size-full');
                    demoWrapper.classList.add('is-fullscreen');
                }

                if (engine) {
                    engine.resize();
                    setTimeout(() => engine.resize(), 80);
                    setTimeout(() => engine.resize(), 320);
                }
            });
        });
    }

    // Auto-adapt canvas resolution on container resize
    if (typeof window !== 'undefined' && window.ResizeObserver && viewport) {
        const ro = new ResizeObserver(() => {
            if (engine) engine.resize();
        });
        ro.observe(viewport);
    }

    // Initialize slider visual fills
    syncAllSlidersFromState();

    return {
        engine,
        state,
        PALETTES,
        generateCode
    };
}

// Auto-initialize when loaded as module in browser
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLiquidGlassApp);
    } else {
        initLiquidGlassApp();
    }
}

export default LiquidGlassViewer;
