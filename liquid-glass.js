/**
 * Liquid Glass - Standalone Reusable WebGL Library & Web Component
 * Ultra-realistic optical 3D spherical lens refraction, Snell's law bending,
 * chromatic dispersion, specular highlight, and procedural silk wave background.
 *
 * @license MIT
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

    vec3 renderSilkBackground(vec2 uv, float t) {
        vec2 sunPos = vec2(0.12, 0.85);
        float sunDist = length(uv - sunPos);
        vec3 goldGlow = u_colorGlow * exp(-sunDist * 3.0) * 0.46;
        vec3 peachWarmth = u_colorWarmth * exp(-sunDist * 1.8) * 0.24;

        vec3 bg = mix(u_colorDeep, u_colorMid, smoothstep(0.0, 0.55, uv.y));
        bg = mix(bg, u_colorSky, smoothstep(0.55, 1.0, uv.y));

        float diag = (uv.x * 0.78 + uv.y * 0.62);
        float wave1 = sin(diag * 7.5 - t * 0.25 + sin(uv.x * 4.0) * 0.5);
        float wave2 = cos(diag * 13.0 + t * 0.18);
        float silkShimmer = smoothstep(-0.6, 0.8, wave1) * 0.24 + smoothstep(0.2, 0.9, wave2) * 0.14;

        float ridgeDist = abs((uv.x * 0.82 + uv.y * 0.68) - 0.78 - 0.04 * sin(uv.y * 5.0 + t * 0.3));
        float ridge = exp(-ridgeDist * 18.0) * 0.22;

        bg = bg + vec3(silkShimmer) * u_colorBright;
        bg += ridge * mix(vec3(0.85), u_colorBright, 0.35);
        bg += goldGlow + peachWarmth;

        return bg;
    }

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

        if (d > 0.003) {
            gl_FragColor = vec4(renderSilkBackground(v_uv, u_time), 1.0);
            return;
        }

        float rad = radians(u_angle);
        vec2 lightDir2D = vec2(cos(rad), sin(rad));

        vec2 normal2D = getSDFNormal(localP, boxHalf, cornerR);
        float normDist = clamp(-d / max(0.001, cornerR), 0.0, 1.0);
        float z = sqrt(max(0.0, 1.0 - pow(1.0 - normDist, 2.0)));
        vec3 normal = normalize(vec3(normal2D * (1.0 - z), z));

        float eta = 1.0 - (1.0 / max(u_ior, 1.01));
        float curvature = (1.0 - z);
        vec2 refractOffset = -normal.xy * (curvature * 1.6 + 0.3) * u_refraction * eta * 3.5;

        float r = sampleSceneDiffused(v_uv + refractOffset * (1.0 + u_dispersion), u_time, u_diffusion).r;
        float g = sampleSceneDiffused(v_uv + refractOffset, u_time, u_diffusion).g;
        float b = sampleSceneDiffused(v_uv + refractOffset * (1.0 - u_dispersion), u_time, u_diffusion).b;

        vec3 glassColor = vec3(r, g, b) * u_brightness;
        glassColor = mix(glassColor, vec3(0.96, 0.98, 1.0) * glassColor, 0.25);

        vec3 lightDir = normalize(vec3(lightDir2D, 0.80));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfVec = normalize(lightDir + viewDir);

        vec2 spotCenter = center + lightDir2D * (baseRadius * 0.60);
        float spotDist = length(p - spotCenter);
        float crispSpot = smoothstep(baseRadius * 0.18, baseRadius * 0.12, spotDist) * 0.50;
        float spotGlow = exp(-spotDist * 16.0 / baseRadius) * 0.22;
        vec3 signatureGlare = vec3(1.0) * (crispSpot + spotGlow);

        float specBase = pow(max(dot(normal, halfVec), 0.0), mix(45.0, 12.0, u_diffusion));
        vec3 domeSpecular = vec3(specBase) * 0.22;

        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.4) * 0.45;
        vec3 rimGlare = vec3(fresnel) * vec3(0.85, 0.92, 1.0);

        float edgeAA = smoothstep(0.003, 0.0, d);
        vec3 finalGlass = glassColor + signatureGlare + domeSpecular + rimGlare;
        vec3 backgroundBehind = renderSilkBackground(v_uv, u_time);

        gl_FragColor = vec4(mix(backgroundBehind, finalGlass, edgeAA), 1.0);
    }
`;

export class LiquidGlass {
    constructor(target, options = {}) {
        this.canvas = typeof target === 'string' ? document.querySelector(target) : target;
        if (!this.canvas) throw new Error('LiquidGlass: target canvas not found');

        this.gl = this.canvas.getContext('webgl', {
            alpha: false,
            antialias: true,
            depth: false,
            powerPreference: 'high-performance'
        });
        if (!this.gl) throw new Error('WebGL not supported');

        const paletteObj = PALETTES.find(p => p.id === options.palette) || PALETTES[0];

        this.options = {
            brightness: options.brightness ?? 1.0,
            diffusion: options.diffusion ?? 0.28,
            refraction: options.refraction ?? 0.10,
            angle: options.angle ?? 135.0,
            borderRadius: options.borderRadius ?? 50,
            ior: options.ior ?? 1.48,
            dispersion: options.dispersion ?? 0.022,
            radius: options.radius ?? 0.26,
            orbX: options.orbX ?? 0.50,
            orbY: options.orbY ?? 0.68,
            interactive: options.interactive ?? true,
        };

        this.currentColors = {
            deep: [...paletteObj.deep],
            mid: [...paletteObj.mid],
            sky: [...paletteObj.sky],
            bright: [...paletteObj.bright],
            glow: [...paletteObj.glow],
            warmth: [...paletteObj.warmth],
        };
        this.targetColors = {
            deep: [...paletteObj.deep],
            mid: [...paletteObj.mid],
            sky: [...paletteObj.sky],
            bright: [...paletteObj.bright],
            glow: [...paletteObj.glow],
            warmth: [...paletteObj.warmth],
        };

        this.program = null;
        this.uniforms = {};
        this.startTime = performance.now();
        this.animId = null;

        this.initGL();
        this.resize();

        if (this.options.interactive) {
            this.initInteraction();
        }

        this._resizeObserver = new ResizeObserver(() => this.resize());
        this._resizeObserver.observe(this.canvas);
    }

    initGL() {
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

        this.quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        this.posAttrib = gl.getAttribLocation(prog, 'a_position');

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
        const tw = Math.floor(this.canvas.clientWidth * dpr);
        const th = Math.floor(this.canvas.clientHeight * dpr);
        if (tw > 0 && th > 0 && (this.canvas.width !== tw || this.canvas.height !== th)) {
            this.canvas.width = tw;
            this.canvas.height = th;
            this.gl.viewport(0, 0, tw, th);
        }
    }

    setPalette(paletteIdOrObject) {
        const p = typeof paletteIdOrObject === 'string'
            ? PALETTES.find(x => x.id === paletteIdOrObject)
            : paletteIdOrObject;
        if (!p) return;
        ['deep', 'mid', 'sky', 'bright', 'glow', 'warmth'].forEach(k => {
            this.targetColors[k] = [...p[k]];
        });
    }

    setOptions(opts = {}) {
        Object.assign(this.options, opts);
        if (opts.palette) this.setPalette(opts.palette);
    }

    render() {
        const gl = this.gl;
        if (!gl) return;

        const lerpSpeed = 0.08;
        ['deep', 'mid', 'sky', 'bright', 'glow', 'warmth'].forEach(k => {
            const cur = this.currentColors[k];
            const tar = this.targetColors[k];
            cur[0] += (tar[0] - cur[0]) * lerpSpeed;
            cur[1] += (tar[1] - cur[1]) * lerpSpeed;
            cur[2] += (tar[2] - cur[2]) * lerpSpeed;
        });

        gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.enableVertexAttribArray(this.posAttrib);
        gl.vertexAttribPointer(this.posAttrib, 2, gl.FLOAT, false, 0, 0);

        const elapsed = (performance.now() - this.startTime) * 0.001;
        const o = this.options;

        gl.uniform2f(this.uniforms['u_resolution'], this.canvas.width, this.canvas.height);
        gl.uniform2f(this.uniforms['u_orbCenter'], o.orbX, o.orbY);
        gl.uniform1f(this.uniforms['u_time'], elapsed);
        gl.uniform1f(this.uniforms['u_brightness'], o.brightness);
        gl.uniform1f(this.uniforms['u_diffusion'], o.diffusion);
        gl.uniform1f(this.uniforms['u_refraction'], o.refraction);
        gl.uniform1f(this.uniforms['u_angle'], o.angle);
        gl.uniform1f(this.uniforms['u_cornerRadius'], o.borderRadius / 100.0);
        gl.uniform1f(this.uniforms['u_ior'], o.ior);
        gl.uniform1f(this.uniforms['u_dispersion'], o.dispersion);
        gl.uniform1f(this.uniforms['u_radius'], o.radius);

        gl.uniform3fv(this.uniforms['u_colorDeep'], this.currentColors.deep);
        gl.uniform3fv(this.uniforms['u_colorMid'], this.currentColors.mid);
        gl.uniform3fv(this.uniforms['u_colorSky'], this.currentColors.sky);
        gl.uniform3fv(this.uniforms['u_colorBright'], this.currentColors.bright);
        gl.uniform3fv(this.uniforms['u_colorGlow'], this.currentColors.glow);
        gl.uniform3fv(this.uniforms['u_colorWarmth'], this.currentColors.warmth);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    start() {
        if (this.animId) return;
        const loop = () => {
            this.render();
            this.animId = requestAnimationFrame(loop);
        };
        this.animId = requestAnimationFrame(loop);
    }

    stop() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    }

    destroy() {
        this.stop();
        if (this._resizeObserver) this._resizeObserver.disconnect();
    }

    initInteraction() {
        let isDragging = false;
        const getUv = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const cx = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
            const cy = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
            return {
                x: (cx - rect.left) / rect.width,
                y: 1.0 - (cy - rect.top) / rect.height
            };
        };

        const onDown = (e) => {
            isDragging = true;
            const uv = getUv(e);
            this.options.orbX = Math.max(0.12, Math.min(0.88, uv.x));
            this.options.orbY = Math.max(0.12, Math.min(0.88, uv.y));
        };
        const onMove = (e) => {
            if (!isDragging) return;
            const uv = getUv(e);
            this.options.orbX = Math.max(0.12, Math.min(0.88, uv.x));
            this.options.orbY = Math.max(0.12, Math.min(0.88, uv.y));
        };
        const onUp = () => { isDragging = false; };

        this.canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        this.canvas.addEventListener('touchstart', onDown, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp);
    }
}

// Optional Custom HTML Web Component: <liquid-glass palette="azure"></liquid-glass>
if (typeof customElements !== 'undefined' && !customElements.get('liquid-glass')) {
    customElements.define('liquid-glass', class extends HTMLElement {
        connectedCallback() {
            const canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block';
            this.appendChild(canvas);
            const palette = this.getAttribute('palette') || 'azure';
            const refraction = parseFloat(this.getAttribute('refraction') || '0.10');
            this._instance = new LiquidGlass(canvas, { palette, refraction });
            this._instance.start();
        }
        disconnectedCallback() {
            if (this._instance) this._instance.destroy();
        }
    });
}

// Global browser bundle
if (typeof window !== 'undefined') {
    window.LiquidGlass = LiquidGlass;
}

export default LiquidGlass;
