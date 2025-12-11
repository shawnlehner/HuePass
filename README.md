# HuePass

**Free WCAG Color Contrast Checker & Accessible Palette Builder**

HuePass is a web-based tool that helps designers and developers create accessible color combinations. Instantly verify WCAG compliance, simulate color blindness, and build export-ready palettes for your design system.

[Live Site](https://www.huepass.com) | [Report an Issue](https://github.com/shawnlehner/HuePass/issues)

---

## Why HuePass?

Color accessibility is often discovered too late in the design process. Designers find contrast issues during development audits, leading to rushed fixes, compromised aesthetics, or worse—inaccessible products that exclude millions of users.

HuePass brings accessibility testing into the earliest stages of design. With real-time feedback, automatic suggestions, and seamless palette management, you can make informed color decisions from the very first sketch.

### The Problem

- **1.3 billion people** worldwide live with some form of visual impairment
- **1 in 12 men** (8%) have color blindness
- **WCAG compliance** is legally required in many jurisdictions (ADA, Section 508, EAA)
- Poor contrast makes content unreadable in bright sunlight, for aging users, or on low-quality displays

### The Solution

HuePass provides instant, visual feedback on color contrast with:
- Real-time WCAG AA/AAA compliance checking
- Automatic suggestions for accessible alternatives
- Color blindness simulation for all major types
- Palette building with contrast matrix visualization
- Export to 7 different formats for any workflow

---

## Features

### Contrast Checker
- **Real-time contrast ratio calculation** — See results as you type or pick colors
- **WCAG 2.1 compliance badges** — Instant pass/fail for AA and AAA levels (normal text, large text, UI components)
- **Smart suggestions** — Automatic accessible alternatives when colors don't pass
- **Live preview** — See exactly how your text will look on your background

### Color Blindness Simulation
- **Page-wide simulation** — View the entire tool as someone with color blindness would see it
- **Four vision types** — Protanopia (red-blind), Deuteranopia (green-blind), Tritanopia (blue-blind), Achromatopsia (total color blindness)
- **Preview swatches** — See all simulations at once without enabling page filter
- **Scientifically accurate** — Based on Brettel, Vienot & Mollon (1997) algorithms

### Palette Builder
- **Build accessible palettes** — Add colors and see how they work together
- **Contrast matrix** — Visual grid showing every color combination's contrast ratio
- **Custom naming** — Name your colors for meaningful exports
- **Persistent storage** — Your palette saves automatically to localStorage

### Export Options
Export your accessible palette in 7 formats:
- **CSS** — Custom properties (variables)
- **SCSS** — Sass variables with color map
- **JSON** — Simple key-value object
- **Tailwind** — Ready-to-use config extension
- **Design Tokens** — DTCG format for Figma/Style Dictionary
- **Swift** — iOS UIColor extension
- **Android** — XML color resources

---

## Privacy & Philosophy

- **100% client-side** — Your colors never leave your browser
- **No accounts** — Just open and use
- **Always free** — No premium tiers, no subscriptions
- **Open source** — Inspect, modify, and contribute

---

## WCAG Quick Reference

| Level | Normal Text | Large Text | UI Components |
|-------|-------------|------------|---------------|
| **AA** (Minimum) | 4.5:1 | 3:1 | 3:1 |
| **AAA** (Enhanced) | 7:1 | 4.5:1 | 3:1 |

**Large text** = 18pt (24px) or larger, OR 14pt (18.67px) bold or larger

---

## Technical Details

### Tech Stack

- **Framework**: [Astro](https://astro.build) 5.x
- **Language**: TypeScript (strict mode)
- **Styling**: CSS custom properties (no external framework)
- **Build**: Vite

### Project Structure

```
src/
├── components/          # Astro components
│   ├── ContrastChecker.astro
│   ├── PaletteBuilder.astro
│   ├── CVDToolbar.astro
│   └── ...
├── layouts/             # Page layouts
│   └── BaseLayout.astro
├── pages/               # Route pages
│   ├── index.astro
│   ├── about.astro
│   └── resources.astro
├── scripts/             # TypeScript utilities
│   ├── contrast.ts          # WCAG calculations
│   ├── palette.ts           # Palette management & export
│   └── color-blindness.ts   # CVD simulation
└── styles/
    └── global.css       # Design tokens & base styles
```

### Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The dev server runs at `http://localhost:4321` by default.

All color calculations happen client-side using standard Web APIs. The contrast ratio algorithm follows WCAG 2.1 specifications for relative luminance calculation.

### Building for Production

```bash
npm run build
```

This generates a static site in the `./dist` directory. The output is pure HTML, CSS, and JavaScript with no server requirements—deploy anywhere that serves static files.

### Key Algorithms

**Contrast Ratio Calculation**
```
L1 = relative luminance of lighter color
L2 = relative luminance of darker color
Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)
```

**Relative Luminance**
```
For each RGB channel:
  if value <= 0.03928: value / 12.92
  else: ((value + 0.055) / 1.055) ^ 2.4

L = 0.2126 * R + 0.7152 * G + 0.0722 * B
```

---

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

## License

MIT License - feel free to use this in your own projects.

---

Built with care for the web accessibility community.
