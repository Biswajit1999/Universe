# UNIVERSE visual system

## Design read

Private scientific cockpit for one technically curious owner. The interface should feel like a
calm, high-resolution instrument rather than a marketing site or a decorative movie prop.

- Design variance: **7/10** — asymmetric subsystem geometry without sacrificing navigation.
- Motion intensity: **8/10** — cinematic core motion; functional surfaces remain stable.
- Visual density: **9/10** — cockpit density with strict hierarchy and readable breathing room.

These dials and the anti-generic audit discipline were informed by the MIT-licensed
[`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill) reference. UNIVERSE does not copy
its example pages and intentionally overrides its marketing-page assumptions for a real product UI.

## Rules

- One dominant accent: cyan. Indigo/violet indicates secondary intelligence; amber means approval;
  rose means blocked/destructive; emerald means verified/active.
- Use glow only to communicate energy, focus or state. Static text does not need neon.
- Outer instrument panels use one clipped/sharp geometry. Inputs use 8px rounding; action pills are
  reserved for mode toggles and compact status.
- Cards exist only where a boundary or elevation is meaningful. Dense lists use dividers and open
  layout rather than a card for every row.
- Motion uses `transform` and `opacity`, stops under reduced-motion preferences, and never blocks text.
- Every interactive surface includes hover, active, focus, disabled, loading, empty and error states.
- No invented CPU, memory, security or network measurements. Decorative telemetry must not masquerade
  as measured data.
- System actions use plain, specific language: what will change, where, and whether approval is needed.
- Desktop and 390px layouts must avoid horizontal overflow.

## Review checklist

1. Is the current agent/state obvious without reading a paragraph?
2. Does motion explain activity rather than compete with it?
3. Is every high-risk action amber or rose and paired with exact scope?
4. Are empty/error/loading states composed rather than blank?
5. Is one visual hierarchy stronger than the background grid and glow?
6. Does the screen still work with WebGL or animation disabled?
