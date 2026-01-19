> **MANDATORIO: Siempre responde en ESPAÑOL**

# Motion Graphics Reference

> Advanced animation techniques for premium web experiences - Lottie, GSAP, SVG, 3D, Particles.
> **Learn the principles, create WOW effects.**

---

## 1. Lottie Animations

### What is Lottie?

```
JSON-based vector animations:
â”œâ”€â”€ Exported from After Effects via Bodymovin
â”œâ”€â”€ Lightweight (smaller than GIF/video)
â”œâ”€â”€ Scalable (vector-based, no pixelation)
â”œâ”€â”€ Interactive (control playback, segments)
â””â”€â”€ Cross-platform (web, iOS, Android, React Native)
```

### When to Use Lottie

| Use Case | Why Lottie? |
|----------|-------------|
| **Loading animations** | Branded, smooth, lightweight |
| **Empty states** | Engaging illustrations |
| **Onboarding flows** | Complex multi-step animations |
| **Success/Error feedback** | Delightful micro-interactions |
| **Animated icons** | Consistent cross-platform |

### Principles

- Keep file size under 100KB for performance
- Use loop sparingly (avoid distraction)
- Provide static fallback for reduced-motion
- Lazy load animation files when possible

### Sources

- LottieFiles.com (free library)
- After Effects + Bodymovin (custom)
- Figma plugins (export from design)

---

## 2. GSAP (GreenSock)

### What Makes GSAP Different

```
Professional timeline-based animation:
â”œâ”€â”€ Precise control over sequences
â”œâ”€â”€ ScrollTrigger for scroll-driven animations
â”œâ”€â”€ MorphSVG for shape transitions
â”œâ”€â”€ Physics-based easing
â””â”€â”€ Works with any DOM element
```

### Core Concepts

| Concept | Purpose |
|---------|---------|
| **Tween** | Single Aâ†’B animation |
| **Timeline** | Sequenced/overlapping animations |
| **ScrollTrigger** | Scroll position controls playback |
| **Stagger** | Cascade effect across elements |

### When to Use GSAP

- âœ… Complex sequenced animations
- âœ… Scroll-triggered reveals
- âœ… Precise timing control needed
- âœ… SVG morphing effects
- âŒ Simple hover/focus effects (use CSS)
- âŒ Performance-critical mobile (heavier)

### Principles

- Use timeline for orchestration (not individual tweens)
- Stagger delay: 0.05-0.15s between items
- ScrollTrigger: start at 70-80% viewport entry
- Kill animations on unmount (prevent memory leaks)

---

## 3. SVG Animations

### Types of SVG Animation

| Type | Technique | Use Case |
|------|-----------|----------|
| **Line Drawing** | stroke-dashoffset | Logo reveals, signatures |
| **Morph** | Path interpolation | Icon transitions |
| **Transform** | rotate, scale, translate | Interactive icons |
| **Color** | fill/stroke transition | State changes |

### Line Drawing Principles

```
How stroke-dashoffset drawing works:
â”œâ”€â”€ Set dasharray to path length
â”œâ”€â”€ Set dashoffset equal to dasharray (hidden)
â”œâ”€â”€ Animate dashoffset to 0 (revealed)
â””â”€â”€ Create "drawing" effect
```

### When to Use SVG Animations

- âœ… Logo reveals, brand moments
- âœ… Icon state transitions (hamburger â†” X)
- âœ… Infographics, data visualization
- âœ… Interactive illustrations
- âŒ Photo-realistic content (use video)
- âŒ Very complex scenes (performance)

### Principles

- Get path length dynamically for accuracy
- Duration: 1-3s for full drawings
- Easing: ease-out for natural feel
- Simple fills complement, don't compete

---

## 4. 3D CSS Transforms

### Core Properties

```
CSS 3D Space:
â”œâ”€â”€ perspective: depth of 3D field (500-1500px typical)
â”œâ”€â”€ transform-style: preserve-3d (enable children 3D)
â”œâ”€â”€ rotateX/Y/Z: rotation per axis
â”œâ”€â”€ translateZ: move toward/away from viewer
â””â”€â”€ backface-visibility: show/hide back side
```

### Common 3D Patterns

| Pattern | Use Case |
|---------|----------|
| **Card flip** | Reveals, flashcards, product views |
| **Tilt on hover** | Interactive cards, 3D depth |
| **Parallax layers** | Hero sections, immersive scrolling |
| **3D carousel** | Image galleries, sliders |

### Principles

- Perspective: 800-1200px for subtle, 400-600px for dramatic
- Keep transforms simple (rotate + translate)
- Ensure backface-visibility: hidden for flips
- Test on Safari (different rendering)

---

## 5. Particle Effects

### Types of Particle Systems

| Type | Feel | Use Case |
|------|------|----------|
| **Geometric** | Tech, network | SaaS, tech sites |
| **Confetti** | Celebration | Success moments |
| **Snow/Rain** | Atmospheric | Seasonal, mood |
| **Dust/Bokeh** | Dreamy | Photography, luxury |
| **Fireflies** | Magical | Games, fantasy |

### Libraries

| Library | Best For |
|---------|----------|
| **tsParticles** | Configurable, lightweight |
| **particles.js** | Simple backgrounds |
| **Canvas API** | Custom, maximum control |
| **Three.js** | Complex 3D particles |

### Principles

- Default: 30-50 particles (not overwhelming)
- Movement: slow, organic (speed 0.5-2)
- Opacity: 0.3-0.6 (don't compete with content)
- Connections: subtle lines for "network" feel
- âš ï¸ Disable or reduce on mobile

### When to Use

- âœ… Hero backgrounds (atmospheric)
- âœ… Success celebrations (confetti burst)
- âœ… Tech visualization (connected nodes)
- âŒ Content-heavy pages (distraction)
- âŒ Low-powered devices (battery drain)

---

## 6. Scroll-Driven Animations

### Native CSS (Modern)

```
CSS Scroll Timelines:
â”œâ”€â”€ animation-timeline: scroll() - document scroll
â”œâ”€â”€ animation-timeline: view() - element in viewport
â”œâ”€â”€ animation-range: entry/exit thresholds
â””â”€â”€ No JavaScript required
```

### Principles

| Trigger Point | Use Case |
|---------------|----------|
| **Entry 0%** | When element starts entering |
| **Entry 50%** | When half visible |
| **Cover 50%** | When centered in viewport |
| **Exit 100%** | When fully exited |

### Best Practices

- Reveal animations: start at ~25% entry
- Parallax: continuous scroll progress
- Sticky elements: use cover range
- Always test scroll performance

---

## 7. Performance Principles

### GPU vs CPU Animation

```
CHEAP (GPU-accelerated):
â”œâ”€â”€ transform (translate, scale, rotate)
â”œâ”€â”€ opacity
â””â”€â”€ filter (use sparingly)

EXPENSIVE (triggers reflow):
â”œâ”€â”€ width, height
â”œâ”€â”€ top, left, right, bottom
â”œâ”€â”€ padding, margin
â””â”€â”€ complex box-shadow
```

### Optimization Checklist

- [ ] Animate only transform/opacity
- [ ] Use `will-change` before heavy animations (remove after)
- [ ] Test on low-end devices
- [ ] Implement `prefers-reduced-motion`
- [ ] Lazy load animation libraries
- [ ] Throttle scroll-based calculations

---

## 8. Motion Graphics Decision Tree

```
What animation do you need?
â”‚
â”œâ”€â”€ Complex branded animation?
â”‚   â””â”€â”€ Lottie (After Effects export)
â”‚
â”œâ”€â”€ Sequenced scroll-triggered?
â”‚   â””â”€â”€ GSAP + ScrollTrigger
â”‚
â”œâ”€â”€ Logo/icon animation?
â”‚   â””â”€â”€ SVG animation (stroke or morph)
â”‚
â”œâ”€â”€ Interactive 3D effect?
â”‚   â””â”€â”€ CSS 3D Transforms (simple) or Three.js (complex)
â”‚
â”œâ”€â”€ Atmospheric background?
â”‚   â””â”€â”€ tsParticles or Canvas
â”‚
â””â”€â”€ Simple entrance/hover?
    â””â”€â”€ CSS @keyframes or Framer Motion
```

---

## 9. Anti-Patterns

| âŒ Don't | âœ… Do |
|----------|-------|
| Animate everything at once | Stagger and sequence |
| Use heavy libraries for simple effects | Start with CSS |
| Ignore reduced-motion | Always provide fallback |
| Block main thread | Optimize for 60fps |
| Same particles every project | Match brand/context |
| Complex effects on mobile | Feature detection |

---

## 10. Quick Reference

| Effect | Tool | Performance |
|--------|------|-------------|
| Loading spinner | CSS/Lottie | Light |
| Staggered reveal | GSAP/Framer | Medium |
| SVG path draw | CSS stroke | Light |
| 3D card flip | CSS transforms | Light |
| Particle background | tsParticles | Heavy |
| Scroll parallax | GSAP ScrollTrigger | Medium |
| Shape morphing | GSAP MorphSVG | Medium |

---

> **Remember**: Motion graphics should enhance, not distract. Every animation must serve a PURPOSEâ€”feedback, guidance, delight, or storytelling.

