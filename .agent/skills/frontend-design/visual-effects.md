> **MANDATORIO: Siempre responde en ESPAÑOL**

# Visual Effects Reference

> Modern CSS effect principles and techniques - learn the concepts, create variations.
> **No fixed values to copy - understand the patterns.**

---

## 1. Glassmorphism Principles

### What Makes Glassmorphism Work

```
Key Properties:
â”œâ”€â”€ Semi-transparent background (not solid)
â”œâ”€â”€ Backdrop blur (frosted glass effect)
â”œâ”€â”€ Subtle border (for definition)
â””â”€â”€ Often: light shadow for depth
```

### The Pattern (Customize Values)

```css
.glass {
  /* Transparency: adjust opacity based on content readability */
  background: rgba(R, G, B, OPACITY);
  /* OPACITY: 0.1-0.3 for dark bg, 0.5-0.8 for light bg */
  
  /* Blur: higher = more frosted */
  backdrop-filter: blur(AMOUNT);
  /* AMOUNT: 8-12px subtle, 16-24px strong */
  
  /* Border: defines edges */
  border: 1px solid rgba(255, 255, 255, OPACITY);
  /* OPACITY: 0.1-0.3 typically */
  
  /* Radius: match your design system */
  border-radius: YOUR_RADIUS;
}
```

### When to Use Glassmorphism
- âœ… Over colorful/image backgrounds
- âœ… Modals, overlays, cards
- âœ… Navigation bars with scrolling content behind
- âŒ Text-heavy content (readability issues)
- âŒ Simple solid backgrounds (pointless)

### When NOT to Use
- Low contrast situations
- Accessibility-critical content
- Performance-constrained devices

---

## 2. Neomorphism Principles

### What Makes Neomorphism Work

```
Key Concept: Soft, extruded elements using DUAL shadows
â”œâ”€â”€ Light shadow (from light source direction)
â”œâ”€â”€ Dark shadow (opposite direction)
â””â”€â”€ Background matches surrounding (same color)
```

### The Pattern

```css
.neo-raised {
  /* Background MUST match parent */
  background: SAME_AS_PARENT;
  
  /* Two shadows: light direction + dark direction */
  box-shadow: 
    OFFSET OFFSET BLUR rgba(light-color),
    -OFFSET -OFFSET BLUR rgba(dark-color);
  
  /* OFFSET: typically 6-12px */
  /* BLUR: typically 12-20px */
}

.neo-pressed {
  /* Inset creates "pushed in" effect */
  box-shadow: 
    inset OFFSET OFFSET BLUR rgba(dark-color),
    inset -OFFSET -OFFSET BLUR rgba(light-color);
}
```

### Accessibility Warning
âš ï¸ **Low contrast** - use sparingly, ensure clear boundaries

### When to Use
- Decorative elements
- Subtle interactive states
- Minimalist UI with flat colors

---

## 3. Shadow Hierarchy Principles

### Concept: Shadows Indicate Elevation

```
Higher elevation = larger shadow
â”œâ”€â”€ Level 0: No shadow (flat on surface)
â”œâ”€â”€ Level 1: Subtle shadow (slightly raised)
â”œâ”€â”€ Level 2: Medium shadow (cards, buttons)
â”œâ”€â”€ Level 3: Large shadow (modals, dropdowns)
â””â”€â”€ Level 4: Deep shadow (floating elements)
```

### Shadow Properties to Adjust

```css
box-shadow: OFFSET-X OFFSET-Y BLUR SPREAD COLOR;

/* Offset: direction of shadow */
/* Blur: softness (larger = softer) */
/* Spread: size expansion */
/* Color: typically black with low opacity */
```

### Principles for Natural Shadows

1. **Y-offset larger than X** (light comes from above)
2. **Low opacity** (5-15% for subtle, 15-25% for pronounced)
3. **Multiple layers** for realism (ambient + direct)
4. **Blur scales with offset** (larger offset = larger blur)

### Dark Mode Shadows
- Shadows less visible on dark backgrounds
- May need to increase opacity
- Or use glow/highlight instead

---

## 4. Gradient Principles

### Types and When to Use

| Type | Pattern | Use Case |
|------|---------|----------|
| **Linear** | Color A â†’ Color B along line | Backgrounds, buttons, headers |
| **Radial** | Center â†’ outward | Spotlights, focal points |
| **Conic** | Around center | Pie charts, creative effects |

### Creating Harmonious Gradients

```
Good Gradient Rules:
â”œâ”€â”€ Use ADJACENT colors on wheel (analogous)
â”œâ”€â”€ Or same hue with different lightness
â”œâ”€â”€ Avoid complementary (can look harsh)
â””â”€â”€ Add middle stops for smoother transitions
```

### Gradient Syntax Pattern

```css
.gradient {
  background: linear-gradient(
    DIRECTION,           /* angle or to-keyword */
    COLOR-STOP-1,        /* color + optional position */
    COLOR-STOP-2,
    /* ... more stops */
  );
}

/* DIRECTION examples: */
/* 90deg, 135deg, to right, to bottom right */
```

### Mesh Gradients

```
Multiple radial gradients overlapped:
â”œâ”€â”€ Each at different position
â”œâ”€â”€ Each with transparent falloff
â”œâ”€â”€ **Mandatory for "Wow" factor in Hero sections**
â””â”€â”€ Creates organic, colorful effect (Search: "Aurora Gradient CSS")
```

---

## 5. Border Effects Principles

### Gradient Borders

```
Technique: Pseudo-element with gradient background
â”œâ”€â”€ Element has padding = border width
â”œâ”€â”€ Pseudo-element fills with gradient
â””â”€â”€ Mask or clip creates border effect
```

### Animated Borders

```
Technique: Rotating gradient or conic sweep
â”œâ”€â”€ Pseudo-element larger than content
â”œâ”€â”€ Animation rotates the gradient
â””â”€â”€ Overflow hidden clips to shape
```

### Glow Borders

```css
/* Multiple box-shadows create glow */
box-shadow:
  0 0 SMALL-BLUR COLOR,
  0 0 MEDIUM-BLUR COLOR,
  0 0 LARGE-BLUR COLOR;

/* Each layer adds to the glow */
```

---

## 6. Glow Effects Principles

### Text Glow

```css
text-shadow: 
  0 0 BLUR-1 COLOR,
  0 0 BLUR-2 COLOR,
  0 0 BLUR-3 COLOR;

/* Multiple layers = stronger glow */
/* Larger blur = softer spread */
```

### Element Glow

```css
box-shadow:
  0 0 BLUR-1 COLOR,
  0 0 BLUR-2 COLOR;

/* Use color matching element for realistic glow */
/* Lower opacity for subtle, higher for neon */
```

### Pulsing Glow Animation

```css
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 SMALL-BLUR COLOR; }
  50% { box-shadow: 0 0 LARGE-BLUR COLOR; }
}

/* Easing and duration affect feel */
```

---

## 7. Overlay Techniques

### Gradient Overlay on Images

```
Purpose: Improve text readability over images
Pattern: Gradient from transparent to opaque
Position: Where text will appear
```

```css
.overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    DIRECTION,
    transparent PERCENTAGE,
    rgba(0,0,0,OPACITY) 100%
  );
}
```

### Colored Overlay

```css
/* Blend mode or layered gradient */
background: 
  linear-gradient(YOUR-COLOR-WITH-OPACITY),
  url('image.jpg');
```

---

## 8. Modern CSS Techniques

### Container Queries (Concept)

```
Instead of viewport breakpoints:
â”œâ”€â”€ Component responds to ITS container
â”œâ”€â”€ Truly modular, reusable components
â””â”€â”€ Syntax: @container (condition) { }
```

### :has() Selector (Concept)

```
Parent styling based on children:
â”œâ”€â”€ "Parent that has X child"
â”œâ”€â”€ Enables previously impossible patterns
â””â”€â”€ Progressive enhancement approach
```

### Scroll-Driven Animations (Concept)

```
Animation progress tied to scroll:
â”œâ”€â”€ Entry/exit animations on scroll
â”œâ”€â”€ Parallax effects
â”œâ”€â”€ Progress indicators
â””â”€â”€ View-based or scroll-based timeline
```

---

## 9. Performance Principles

### GPU-Accelerated Properties

```
CHEAP to animate (GPU):
â”œâ”€â”€ transform (translate, scale, rotate)
â””â”€â”€ opacity

EXPENSIVE to animate (CPU):
â”œâ”€â”€ width, height
â”œâ”€â”€ top, left, right, bottom
â”œâ”€â”€ margin, padding
â””â”€â”€ box-shadow (recalculates)
```

### will-change Usage

```css
/* Use sparingly, only for heavy animations */
.heavy-animation {
  will-change: transform;
}

/* Remove after animation if possible */
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable or minimize animations */
  /* Respect user preference */
}
```

---

## 10. Effect Selection Checklist

Before applying any effect:

- [ ] **Does it serve a purpose?** (not just decoration)
- [ ] **Is it appropriate for the context?** (brand, audience)
- [ ] **Have you varied from previous projects?** (avoid repetition)
- [ ] **Is it accessible?** (contrast, motion sensitivity)
- [ ] **Is it performant?** (especially on mobile)
- [ ] **Did you ask user preference?** (if style open-ended)

### Anti-Patterns

- âŒ Glassmorphism on every element (kitsch)
- âŒ Dark + neon as default (lazy AI look)
- âŒ **Static/Flat designs with no depth (FAILED)**
- âŒ Effects that hurt readability
- âŒ Animations without purpose

---

> **Remember**: Effects enhance meaning. Choose based on purpose and context, not because it "looks cool."

