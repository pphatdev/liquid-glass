/**
 * Liquid Glass - Type definitions
 * @license MIT
 */

export type RGB = [number, number, number];

export interface LiquidGlassPalette {
    id: string;
    name: string;
    deep: RGB;
    mid: RGB;
    sky: RGB;
    bright: RGB;
    glow: RGB;
    warmth: RGB;
    /** CSS gradient used for UI previews of the palette. */
    preview: string;
}

export interface LiquidGlassOptions {
    /** Palette id: 'azure' | 'sunset' | 'emerald' | 'violet' | 'rose'. Default 'azure'. */
    palette?: string;
    /** Optical brightness multiplier (0.50 - 2.00). Default 1.00. */
    brightness?: number;
    /** Frosted glass roughness blur (0.00 - 1.00). Default 0.28. */
    diffusion?: number;
    /** Snell's Law ray bending strength (0.00 - 0.35). Default 0.10. */
    refraction?: number;
    /** Incident light / specular glare angle in degrees (0 - 360). Default 135. */
    angle?: number;
    /** Geometry shape: 0 (square panel) to 100 (circular sphere). Default 50. */
    borderRadius?: number;
    /** Index of refraction. Default 1.48. */
    ior?: number;
    /** Chromatic dispersion wavelength split factor. Default 0.022. */
    dispersion?: number;
    /** Lens radius relative to the canvas (0.0 - 0.5). Default 0.26. */
    radius?: number;
    /** Lens center horizontal position in UV space (0.0 - 1.0). Default 0.50. */
    orbX?: number;
    /** Lens center vertical position in UV space (0.0 - 1.0). Default 0.68. */
    orbY?: number;
    /** Enables pointer dragging to move the lens. Default true. */
    interactive?: boolean;
    /** Freeze the animated background and render only on demand. Defaults to the user's prefers-reduced-motion setting. */
    reducedMotion?: boolean;
}

export declare class LiquidGlass {
    constructor(target: HTMLCanvasElement | string, options?: LiquidGlassOptions);

    readonly canvas: HTMLCanvasElement;
    readonly options: Required<Omit<LiquidGlassOptions, 'palette'>> & { palette: string };

    /** Starts the requestAnimationFrame render loop. */
    start(): void;
    /** Pauses the render loop. */
    stop(): void;
    /** Renders a single frame (also called automatically by the loop). */
    render(): void;
    /** Recalculates canvas dimensions and viewport from devicePixelRatio. */
    resize(): void;
    /** Smoothly transitions colors to a new palette (id or palette object). */
    setPalette(palette: string | LiquidGlassPalette): void;
    /** Updates configuration parameters at runtime. */
    setOptions(options: LiquidGlassOptions): void;
    /** Stops rendering, removes all listeners, and frees WebGL resources. */
    destroy(): void;
}

export const PALETTES: LiquidGlassPalette[];

export default LiquidGlass;
