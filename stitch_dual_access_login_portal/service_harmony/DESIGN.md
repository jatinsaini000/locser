---
name: Service Harmony
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#515659'
  on-tertiary: '#ffffff'
  tertiary-container: '#696e71'
  on-tertiary-container: '#edf1f5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#dfe3e7'
  tertiary-fixed-dim: '#c3c7cb'
  on-tertiary-fixed: '#171c1f'
  on-tertiary-fixed-variant: '#43474b'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
---

## Brand & Style

The design system is built to evoke a sense of **Reliability, Community, and Ease**. As a marketplace for local services, the visual language must bridge the gap between professional expertise and neighborly approachability. 

We utilize a **Modern Corporate** style infused with soft, organic shapes to ensure the platform feels accessible rather than clinical. The aesthetic centers on high-legibility, generous whitespace to reduce cognitive load, and a clear hierarchy that prioritizes action and trust-building signals (like ratings and verified badges).

## Colors

The palette is anchored by a **Vibrant Primary Blue**, which symbolizes trust and technological competence. This is balanced by a high-contrast **Deep Slate** for typography to ensure maximum readability for users of all ages.

- **Primary Blue:** Used for call-to-actions, active navigation states, and brand highlights.
- **Soft Grays:** Utilized for background layering and secondary UI elements to create a calm, non-distracting environment.
- **Success/Warning:** Reserved strictly for status indicators (e.g., "Booking Confirmed" or "Review Needed").

## Typography

We use **Plus Jakarta Sans** across the entire system. Its modern, geometric construction provides a clean "tech" feel, while its slightly rounded terminals maintain an approachable and friendly tone.

- **Headlines:** Use Bold (700) weights with tighter letter spacing to create a strong visual anchor.
- **Body:** Use Regular (400) weight for long-form content to ensure breathability.
- **Interactive Labels:** Use Medium (500) or Semi-Bold (600) to distinguish interactive text from static content.

## Layout & Spacing

This design system employs a **Fluid Grid** model to accommodate the variety of service listings and provider profiles.

- **Desktop:** A 12-column grid with 24px gutters. The sidebar remains fixed at 280px, while the main content area expands.
- **Mobile:** A single-column layout with 16px side margins. 
- **Spacing Rhythm:** All spacing follows a 4px baseline. Components like cards and input groups should primarily use `lg` (24px) padding to feel spacious and premium.

## Elevation & Depth

To maintain a clean and professional look, depth is communicated through **Tonal Layering** and **Subtle Ambient Shadows**.

1.  **Level 0 (Flat):** Main background surfaces (#FFFFFF).
2.  **Level 1 (Subtle):** Inset surfaces like search bars or secondary containers using #F8FAFC.
3.  **Level 2 (Elevated):** Hover states and cards. Use a soft shadow: `0px 4px 20px rgba(15, 23, 42, 0.05)`.
4.  **Level 3 (Floating):** Modals and dropdowns. Use a more pronounced shadow: `0px 12px 32px rgba(15, 23, 42, 0.1)`.

Avoid heavy borders; instead, use 1px strokes in #E2E8F0 for structural definition only when tonal contrast is insufficient.

## Shapes

The shape language is characterized by **Generous Rounding**, which reinforces the approachable brand personality.

- **Standard Elements:** Buttons, input fields, and small cards use the `rounded-lg` (1rem / 16px) tokens.
- **Featured Elements:** Large service cards and hero containers use the `rounded-xl` (1.5rem / 24px) tokens to create a softer, modern container feel.
- **Icons:** Should be housed in circular or highly rounded containers to match the overall UI fluidity.

## Components

### Buttons
- **Primary:** Solid Primary Blue with white text. 2xl roundedness. Heavy padding (12px 24px).
- **Secondary:** Transparent with a Primary Blue border or light blue tint background.
- **Shadow:** Only apply a subtle shadow on hover to simulate "pressing."

### Service Cards
- Must feature a `rounded-xl` image at the top.
- Content padding should be 20px.
- Use a Level 2 shadow to separate the card from the subtle gray background.

### Search Bar
- A prominent, pill-shaped (`rounded-full`) input with a light gray background (#F1F5F9).
- Leading icon in Secondary Gray to keep the focus on the user's typed text.

### Category Chips
- Small, rounded-pill elements with an icon above or to the left of the text.
- Active state: Primary Blue background.
- Inactive state: Soft Gray background with neutral text.

### Input Fields
- Soft gray borders that turn Primary Blue on focus.
- 16px roundedness to match the "friendly" aesthetic.