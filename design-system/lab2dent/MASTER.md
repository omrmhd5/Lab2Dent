# Lab2Dent visual system

Verified from ui-ux-pro-max, then adapted.

**Reading this as:** trust-first clinical service for Egyptian dental students, with inclusive healthcare language, cyan-teal surfaces, and a staff ops console that stays denser.

## Adopted

- Pattern: Trust & Authority + Conversion, plus pricing cards
- Type: Atkinson Hyperlegible (EN) + Noto Sans Arabic (AR)
- Color: calm cyan `#0E7490` + health-green CTA `#059669`
- Motion: stagger 300–450ms, ease-out, skip on reduced motion
- Cards: `rounded-2xl shadow-md p-6`, hover shadow on clickable cards
- Form: visible step `n of 3`, 44px targets, labeled fields

## Rejected

- Neumorphism (dataset default): accessibility risk high, poor contrast
- Fake testimonials / logo walls
- AI purple gradients, neon glow, black text on green CTAs

## Tokens

See `src/app/globals.css`. Dark mode uses deep teal-black surfaces, not OLED neon.
