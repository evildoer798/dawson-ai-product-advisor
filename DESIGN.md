# Design System

## Direction

Midnight intelligence room under low ambient light: near-black neutral architecture, atmospheric cobalt for active decisions, and precise semantic colors reserved for status. The product is dense but never cramped.

## Color strategy

Restrained. Neutral surfaces carry the application; cobalt appears only on primary actions, current navigation, charts, and focus states.

## Tokens

- Background: `oklch(0.105 0 0)`
- Raised surface: `oklch(0.155 0.012 230)`
- Quiet surface: `oklch(0.19 0.014 230)`
- Primary: `oklch(0.65 0.10 230)`
- Accent: `oklch(0.79 0.13 176)`
- Ink: `oklch(0.96 0.008 230)`
- Muted: `oklch(0.72 0.018 230)`
- Positive: `oklch(0.76 0.15 152)`
- Warning: `oklch(0.78 0.14 78)`
- Critical: `oklch(0.66 0.20 25)`

## Typography

Use Inter/system sans for interface labels and data. Chinese falls back to Microsoft YaHei and PingFang SC. Use tabular numerals for scores and measurements. Product headings use a tight fixed scale, never display-sized marketing typography.

## Components

Controls use 10px radii, panels use 14px, and pills are fully rounded. Prefer separators and grouped regions over nested cards. Buttons and inputs expose hover, focus, active, disabled, loading, and error states.

## Motion

Use 160–220ms ease-out transitions for state changes. Progress stages may crossfade or fill; all motion becomes effectively instant under `prefers-reduced-motion`.

## Layout

Desktop uses a 248px navigation rail and a maximum 1440px content area. Tablet collapses navigation to a top bar. Report content uses a 12-column grid with the score summary occupying four columns and evidence content eight columns.
