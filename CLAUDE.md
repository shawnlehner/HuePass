# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HuePass is a WCAG color contrast checker and accessible palette builder built with Astro. It helps users verify AA/AAA compliance, get suggested alternatives, and export accessible color palettes.

## Commands

```bash
npm run dev      # Start dev server at localhost:4321
npm run build    # Build for production to ./dist/
npm run preview  # Preview production build locally
```

## Architecture

### Tech Stack
- **Framework**: Astro 5.x with TypeScript (strict mode)
- **Styling**: CSS custom properties defined in `src/styles/global.css`
- **No external CSS framework** - uses a custom design system with CSS variables

### Key Directories
- `src/components/` - Astro components (ContrastChecker, PaletteBuilder, etc.)
- `src/scripts/` - TypeScript utilities for color calculations
- `src/layouts/` - Page layouts (BaseLayout)
- `src/pages/` - Route pages
- `src/styles/` - Global CSS with design tokens

### Core Modules

**`src/scripts/contrast.ts`** - WCAG color contrast calculations:
- `hexToRgb`, `rgbToHex`, `rgbToHsl`, `hslToRgb` - Color conversions
- `getContrastRatio` - Calculate contrast ratio between two RGB colors
- `checkWCAGCompliance` - Check all WCAG levels (AA/AAA for normal/large text)
- `findPassingColor` - Find accessible alternative by adjusting lightness

**`src/scripts/palette.ts`** - Palette management:
- `generateContrastMatrix` - Create matrix showing all color pair contrasts
- `exportAsCSS`, `exportAsJSON`, `exportAsTailwind` - Export formats
- `savePalette`, `loadPalette` - localStorage persistence

### Component Communication
Components communicate via custom DOM events:
- `addToPalette` - Fired by ContrastChecker to add colors to palette
- `contrastUpdate` - Fired when contrast values change

### Design System
All styling uses CSS custom properties from `global.css`:
- Colors: `--color-bg-*`, `--color-text-*`, `--color-accent`, `--color-success/warning/error`
- Spacing: `--space-1` through `--space-24`
- Typography: `--text-xs` through `--text-5xl`
- Effects: `--radius-*`, `--shadow-*`, `--transition-*`
- Our goal for this project is as follows: Designers need to verify WCAG color contrast compliance constantly. Build a tool where they can input colors, see real-time contrast ratios, and get suggested accessible alternatives. Bonus: let them build and export full palettes that pass AA/AAA standards.