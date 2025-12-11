/**
 * Palette Management and Export Utilities
 */

import { hexToRgb, getContrastRatio, formatContrastRatio, checkWCAGCompliance } from './contrast';
import type { ContrastResult } from './contrast';

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
}

export interface ColorPair {
  id: string;
  foreground: PaletteColor;
  background: PaletteColor;
  contrastRatio: number;
}

export interface ContrastMatrixCell {
  foregroundId: string;
  backgroundId: string;
  ratio: number;
  compliance: ContrastResult;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate contrast between two palette colors
 */
export function calculatePairContrast(foreground: PaletteColor, background: PaletteColor): number {
  const fgRgb = hexToRgb(foreground.hex);
  const bgRgb = hexToRgb(background.hex);

  if (!fgRgb || !bgRgb) {
    return 1;
  }

  return getContrastRatio(fgRgb, bgRgb);
}

/**
 * Generate a contrast matrix for all colors in a palette
 */
export function generateContrastMatrix(colors: PaletteColor[]): ContrastMatrixCell[][] {
  const matrix: ContrastMatrixCell[][] = [];

  for (const bgColor of colors) {
    const row: ContrastMatrixCell[] = [];
    for (const fgColor of colors) {
      const ratio = calculatePairContrast(fgColor, bgColor);
      row.push({
        foregroundId: fgColor.id,
        backgroundId: bgColor.id,
        ratio,
        compliance: checkWCAGCompliance(ratio),
      });
    }
    matrix.push(row);
  }

  return matrix;
}

/**
 * Export palette as CSS custom properties
 */
export function exportAsCSS(colors: PaletteColor[]): string {
  const lines = [':root {'];

  for (const color of colors) {
    const varName = color.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    lines.push(`  --color-${varName}: ${color.hex};`);
  }

  lines.push('}');
  return lines.join('\n');
}

/**
 * Export palette as JSON
 */
export function exportAsJSON(colors: PaletteColor[]): string {
  const palette: Record<string, string> = {};

  for (const color of colors) {
    const key = color.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    palette[key] = color.hex;
  }

  return JSON.stringify({ colors: palette }, null, 2);
}

/**
 * Export palette as Tailwind config
 */
export function exportAsTailwind(colors: PaletteColor[]): string {
  const lines = ['module.exports = {', '  theme: {', '    extend: {', '      colors: {'];

  for (const color of colors) {
    const key = color.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    lines.push(`        '${key}': '${color.hex}',`);
  }

  lines.push('      },', '    },', '  },', '};');
  return lines.join('\n');
}

/**
 * Export palette as SCSS variables
 */
export function exportAsSCSS(colors: PaletteColor[]): string {
  const lines: string[] = [];

  for (const color of colors) {
    const varName = color.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    lines.push(`$color-${varName}: ${color.hex};`);
  }

  // Also create a map for easy iteration
  lines.push('');
  lines.push('$colors: (');
  for (const color of colors) {
    const key = color.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    lines.push(`  '${key}': ${color.hex},`);
  }
  lines.push(');');

  return lines.join('\n');
}

/**
 * Export palette as Design Tokens (DTCG format)
 * Compatible with Figma Tokens, Style Dictionary, and other tools
 */
export function exportAsDesignTokens(colors: PaletteColor[]): string {
  const tokens: Record<string, unknown> = {
    color: {}
  };

  for (const color of colors) {
    const key = color.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    (tokens.color as Record<string, unknown>)[key] = {
      $type: 'color',
      $value: color.hex,
      $description: color.name
    };
  }

  return JSON.stringify(tokens, null, 2);
}

/**
 * Export palette as Swift UIColor extensions (iOS)
 */
export function exportAsSwift(colors: PaletteColor[]): string {
  const lines = [
    'import UIKit',
    '',
    'extension UIColor {',
    '    struct Palette {'
  ];

  for (const color of colors) {
    const propertyName = color.name
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^./, (chr) => chr.toLowerCase());

    const hex = color.hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    lines.push(`        static let ${propertyName} = UIColor(red: ${(r / 255).toFixed(3)}, green: ${(g / 255).toFixed(3)}, blue: ${(b / 255).toFixed(3)}, alpha: 1.0)`);
  }

  lines.push('    }', '}');
  return lines.join('\n');
}

/**
 * Export palette as Android XML colors
 */
export function exportAsAndroidXML(colors: PaletteColor[]): string {
  const lines = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<resources>'
  ];

  for (const color of colors) {
    const name = color.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    lines.push(`    <color name="${name}">${color.hex}</color>`);
  }

  lines.push('</resources>');
  return lines.join('\n');
}

/**
 * Export contrast matrix as a formatted report
 */
export function exportContrastReport(colors: PaletteColor[], matrix: ContrastMatrixCell[][]): string {
  const lines = ['# Color Contrast Report', '', '## Palette Colors', ''];

  for (const color of colors) {
    lines.push(`- **${color.name}**: ${color.hex}`);
  }

  lines.push('', '## Contrast Matrix', '');

  // Header row
  const headerCells = ['Background \\ Foreground', ...colors.map((c) => c.name)];
  lines.push('| ' + headerCells.join(' | ') + ' |');
  lines.push('| ' + headerCells.map(() => '---').join(' | ') + ' |');

  // Data rows
  for (let i = 0; i < colors.length; i++) {
    const bgColor = colors[i];
    const rowCells = [bgColor.name];

    for (let j = 0; j < colors.length; j++) {
      const cell = matrix[i][j];
      const ratioStr = formatContrastRatio(cell.ratio);
      const status = cell.compliance.normalTextAA ? 'Pass' : 'Fail';
      rowCells.push(`${ratioStr} (${status})`);
    }

    lines.push('| ' + rowCells.join(' | ') + ' |');
  }

  return lines.join('\n');
}

/**
 * Storage key for localStorage
 */
const STORAGE_KEY = 'huepass-palette';

/**
 * Save palette to localStorage
 */
export function savePalette(colors: PaletteColor[]): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  }
}

/**
 * Load palette from localStorage
 */
export function loadPalette(): PaletteColor[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Clear stored palette
 */
export function clearStoredPalette(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
