/**
 * WCAG Color Contrast Calculation Utilities
 * Based on WCAG 2.1 guidelines for contrast ratio calculation
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ContrastResult {
  ratio: number;
  ratioString: string;
  normalTextAA: boolean;
  normalTextAAA: boolean;
  largeTextAA: boolean;
  largeTextAAA: boolean;
  uiComponents: boolean;
}

export interface WCAGLevel {
  level: 'AAA' | 'AA' | 'Fail';
  label: string;
}

// WCAG Thresholds
export const WCAG_THRESHOLDS = {
  normalTextAAA: 7,
  normalTextAA: 4.5,
  largeTextAAA: 4.5,
  largeTextAA: 3,
  uiComponents: 3,
} as const;

/**
 * Parse a hex color string to RGB values
 */
export function hexToRgb(hex: string): RGB | null {
  const sanitized = hex.replace(/^#/, '');

  let fullHex = sanitized;
  if (sanitized.length === 3) {
    fullHex = sanitized
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (fullHex.length !== 6) {
    return null;
  }

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) {
    return null;
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
export function getRelativeLuminance(rgb: RGB): number {
  const sRGB = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: RGB, color2: RGB): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Format contrast ratio for display
 */
export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

/**
 * Check all WCAG compliance levels for a contrast ratio
 */
export function checkWCAGCompliance(ratio: number): ContrastResult {
  return {
    ratio,
    ratioString: formatContrastRatio(ratio),
    normalTextAA: ratio >= WCAG_THRESHOLDS.normalTextAA,
    normalTextAAA: ratio >= WCAG_THRESHOLDS.normalTextAAA,
    largeTextAA: ratio >= WCAG_THRESHOLDS.largeTextAA,
    largeTextAAA: ratio >= WCAG_THRESHOLDS.largeTextAAA,
    uiComponents: ratio >= WCAG_THRESHOLDS.uiComponents,
  };
}

/**
 * Get the WCAG level for normal text
 */
export function getNormalTextLevel(ratio: number): WCAGLevel {
  if (ratio >= WCAG_THRESHOLDS.normalTextAAA) {
    return { level: 'AAA', label: 'AAA Pass' };
  }
  if (ratio >= WCAG_THRESHOLDS.normalTextAA) {
    return { level: 'AA', label: 'AA Pass' };
  }
  return { level: 'Fail', label: 'Fail' };
}

/**
 * Get the WCAG level for large text
 */
export function getLargeTextLevel(ratio: number): WCAGLevel {
  if (ratio >= WCAG_THRESHOLDS.largeTextAAA) {
    return { level: 'AAA', label: 'AAA Pass' };
  }
  if (ratio >= WCAG_THRESHOLDS.largeTextAA) {
    return { level: 'AA', label: 'AA Pass' };
  }
  return { level: 'Fail', label: 'Fail' };
}

/**
 * Find a suggested color that passes a target contrast ratio
 * Adjusts lightness while preserving hue and saturation
 */
export function findPassingColor(
  colorToAdjust: RGB,
  referenceColor: RGB,
  targetRatio: number = WCAG_THRESHOLDS.normalTextAA
): RGB | null {
  const hsl = rgbToHsl(colorToAdjust);
  const refLuminance = getRelativeLuminance(referenceColor);

  // Try adjusting lightness in both directions
  const tryLightness = (targetL: number): RGB | null => {
    const testHsl = { ...hsl, l: Math.max(0, Math.min(100, targetL)) };
    const testRgb = hslToRgb(testHsl);
    const ratio = getContrastRatio(testRgb, referenceColor);

    if (ratio >= targetRatio) {
      return testRgb;
    }
    return null;
  };

  // Determine if we should go lighter or darker based on reference color luminance
  const goLighter = refLuminance < 0.5;
  const step = 1;

  // Try primary direction first
  for (let i = 0; i <= 100; i += step) {
    const targetL = goLighter ? Math.min(100, hsl.l + i) : Math.max(0, hsl.l - i);
    const result = tryLightness(targetL);
    if (result) return result;
  }

  // Try opposite direction if primary failed
  for (let i = 0; i <= 100; i += step) {
    const targetL = goLighter ? Math.max(0, hsl.l - i) : Math.min(100, hsl.l + i);
    const result = tryLightness(targetL);
    if (result) return result;
  }

  return null;
}

/**
 * Generate a random accessible color pair
 */
export function generateAccessiblePair(): { foreground: string; background: string } {
  const backgrounds = [
    '#0a0a0b', '#111113', '#18181b', '#1f1f23', // Dark backgrounds
    '#fafafa', '#f4f4f5', '#e4e4e7', '#ffffff', // Light backgrounds
  ];

  const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  const bgRgb = hexToRgb(background)!;

  // Generate random hue
  const hue = Math.floor(Math.random() * 360);
  const saturation = 50 + Math.floor(Math.random() * 40); // 50-90%

  // Determine lightness based on background
  const bgLuminance = getRelativeLuminance(bgRgb);
  const targetLightness = bgLuminance < 0.5 ? 70 + Math.floor(Math.random() * 25) : 15 + Math.floor(Math.random() * 30);

  const foregroundHsl: HSL = { h: hue, s: saturation, l: targetLightness };
  let foregroundRgb = hslToRgb(foregroundHsl);

  // Ensure it passes AA
  const ratio = getContrastRatio(foregroundRgb, bgRgb);
  if (ratio < WCAG_THRESHOLDS.normalTextAA) {
    const passing = findPassingColor(foregroundRgb, bgRgb);
    if (passing) {
      foregroundRgb = passing;
    }
  }

  return {
    foreground: rgbToHex(foregroundRgb),
    background,
  };
}

/**
 * Validate a hex color string
 */
export function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Normalize hex color (add # prefix, expand shorthand)
 */
export function normalizeHex(hex: string): string {
  let sanitized = hex.replace(/^#/, '').toUpperCase();

  if (sanitized.length === 3) {
    sanitized = sanitized
      .split('')
      .map((c) => c + c)
      .join('');
  }

  return `#${sanitized}`;
}
