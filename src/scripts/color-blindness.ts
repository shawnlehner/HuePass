/**
 * Color Vision Deficiency (CVD) Simulation
 *
 * Implements Brettel, Viénot & Mollon (1997) algorithm for accurate
 * simulation of how colors appear to people with color blindness.
 */

export type CVDType =
  | 'protanopia'    // Red-blind
  | 'deuteranopia'  // Green-blind
  | 'tritanopia'    // Blue-blind
  | 'achromatopsia' // Complete color blindness
  | 'none';

export interface CVDInfo {
  id: CVDType;
  name: string;
  description: string;
  prevalence: string;
}

export const CVD_TYPES: CVDInfo[] = [
  {
    id: 'protanopia',
    name: 'Protanopia',
    description: 'Red-blind, difficulty distinguishing red from green',
    prevalence: '~1% of males'
  },
  {
    id: 'deuteranopia',
    name: 'Deuteranopia',
    description: 'Green-blind, most common form of color blindness',
    prevalence: '~5% of males'
  },
  {
    id: 'tritanopia',
    name: 'Tritanopia',
    description: 'Blue-blind, difficulty with blue and yellow',
    prevalence: '~0.01% of population'
  },
  {
    id: 'achromatopsia',
    name: 'Achromatopsia',
    description: 'Complete color blindness, sees only in grayscale',
    prevalence: '~0.003% of population'
  }
];

/**
 * Transformation matrices for CVD simulation
 * Based on Brettel, Viénot & Mollon (1997) and Machado et al. (2009)
 */
const CVD_MATRICES: Record<Exclude<CVDType, 'none' | 'achromatopsia'>, number[][]> = {
  protanopia: [
    [0.567, 0.433, 0.000],
    [0.558, 0.442, 0.000],
    [0.000, 0.242, 0.758]
  ],
  deuteranopia: [
    [0.625, 0.375, 0.000],
    [0.700, 0.300, 0.000],
    [0.000, 0.300, 0.700]
  ],
  tritanopia: [
    [0.950, 0.050, 0.000],
    [0.000, 0.433, 0.567],
    [0.000, 0.475, 0.525]
  ]
};

/**
 * Grayscale weights for achromatopsia (based on luminance)
 */
const GRAYSCALE_WEIGHTS = [0.2126, 0.7152, 0.0722];

/**
 * Convert sRGB to linear RGB
 */
function srgbToLinear(value: number): number {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Convert linear RGB to sRGB
 */
function linearToSrgb(value: number): number {
  const v = value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(255, v * 255)));
}

/**
 * Apply matrix transformation to RGB values
 */
function applyMatrix(rgb: [number, number, number], matrix: number[][]): [number, number, number] {
  return [
    rgb[0] * matrix[0][0] + rgb[1] * matrix[0][1] + rgb[2] * matrix[0][2],
    rgb[0] * matrix[1][0] + rgb[1] * matrix[1][1] + rgb[2] * matrix[1][2],
    rgb[0] * matrix[2][0] + rgb[1] * matrix[2][1] + rgb[2] * matrix[2][2]
  ];
}

/**
 * Simulate how a color appears to someone with a specific CVD type
 */
export function simulateCVD(hex: string, cvdType: CVDType): string {
  if (cvdType === 'none') return hex;

  // Parse hex to RGB
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Convert to linear RGB
  const linearRgb: [number, number, number] = [
    srgbToLinear(r),
    srgbToLinear(g),
    srgbToLinear(b)
  ];

  let simulatedLinear: [number, number, number];

  if (cvdType === 'achromatopsia') {
    // Grayscale conversion
    const gray =
      linearRgb[0] * GRAYSCALE_WEIGHTS[0] +
      linearRgb[1] * GRAYSCALE_WEIGHTS[1] +
      linearRgb[2] * GRAYSCALE_WEIGHTS[2];
    simulatedLinear = [gray, gray, gray];
  } else {
    // Apply CVD transformation matrix
    simulatedLinear = applyMatrix(linearRgb, CVD_MATRICES[cvdType]);
  }

  // Convert back to sRGB
  const newR = linearToSrgb(simulatedLinear[0]);
  const newG = linearToSrgb(simulatedLinear[1]);
  const newB = linearToSrgb(simulatedLinear[2]);

  // Return as hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`.toUpperCase();
}

/**
 * Get SVG filter ID for a CVD type
 */
export function getCVDFilterId(cvdType: CVDType): string {
  return `cvd-filter-${cvdType}`;
}

/**
 * Generate SVG filter definitions for all CVD types
 * These can be applied to the entire page using CSS filter: url(#filter-id)
 */
export function generateCVDFilters(): string {
  return `
    <svg class="cvd-filters" aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;">
      <defs>
        <!-- Protanopia (Red-blind) -->
        <filter id="${getCVDFilterId('protanopia')}">
          <feColorMatrix type="matrix" values="
            0.567, 0.433, 0.000, 0, 0
            0.558, 0.442, 0.000, 0, 0
            0.000, 0.242, 0.758, 0, 0
            0,     0,     0,     1, 0
          "/>
        </filter>

        <!-- Deuteranopia (Green-blind) -->
        <filter id="${getCVDFilterId('deuteranopia')}">
          <feColorMatrix type="matrix" values="
            0.625, 0.375, 0.000, 0, 0
            0.700, 0.300, 0.000, 0, 0
            0.000, 0.300, 0.700, 0, 0
            0,     0,     0,     1, 0
          "/>
        </filter>

        <!-- Tritanopia (Blue-blind) -->
        <filter id="${getCVDFilterId('tritanopia')}">
          <feColorMatrix type="matrix" values="
            0.950, 0.050, 0.000, 0, 0
            0.000, 0.433, 0.567, 0, 0
            0.000, 0.475, 0.525, 0, 0
            0,     0,     0,     1, 0
          "/>
        </filter>

        <!-- Achromatopsia (Complete color blindness) -->
        <filter id="${getCVDFilterId('achromatopsia')}">
          <feColorMatrix type="matrix" values="
            0.2126, 0.7152, 0.0722, 0, 0
            0.2126, 0.7152, 0.0722, 0, 0
            0.2126, 0.7152, 0.0722, 0, 0
            0,      0,      0,      1, 0
          "/>
        </filter>
      </defs>
    </svg>
  `;
}

/**
 * State management for CVD mode
 */
let currentCVDMode: CVDType = 'none';
const CVD_STORAGE_KEY = 'huepass-cvd-mode';

/**
 * Get current CVD mode
 */
export function getCurrentCVDMode(): CVDType {
  return currentCVDMode;
}

/**
 * Set CVD mode and apply to page
 */
export function setCVDMode(mode: CVDType): void {
  currentCVDMode = mode;

  // Save preference
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CVD_STORAGE_KEY, mode);
  }

  // Apply filter to page
  const html = document.documentElement;

  if (mode === 'none') {
    html.style.filter = '';
    html.removeAttribute('data-cvd-mode');
  } else {
    html.style.filter = `url(#${getCVDFilterId(mode)})`;
    html.setAttribute('data-cvd-mode', mode);
  }

  // Dispatch event for components to react
  window.dispatchEvent(new CustomEvent('cvdModeChange', { detail: { mode } }));
}

/**
 * Initialize CVD mode from stored preference
 */
export function initCVDMode(): void {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(CVD_STORAGE_KEY) as CVDType | null;
    if (stored && CVD_TYPES.some(t => t.id === stored)) {
      setCVDMode(stored);
    }
  }
}
