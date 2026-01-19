> **MANDATORIO: Siempre responde en ESPAÑOL**

# Animation Guidelines Reference

> Animation principles and timing psychology - learn to decide, not copy.
> **No fixed durations to memorize - understand what affects timing.**

---

## 1. Duration Principles

### What Affects Timing

```
Factors that determine animation speed:
â”œâ”€â”€ DISTANCE: Further travel = longer duration
â”œâ”€â”€ SIZE: Larger elements = slower animations
â”œâ”€â”€ COMPLEXITY: Complex = slower to process
â”œâ”€â”€ IMPORTANCE: Critical actions = clear feedback
â””â”€â”€ CONTEXT: Urgent = fast, luxurious = slow
```

### Duration Ranges by Purpose

| Purpose | Range | Why |
|---------|-------|-----|
| Instant feedback | 50-100ms | Below perception threshold |
| Micro-interactions | 100-200ms | Quick but noticeable |
| Standard transitions | 200-300ms | Comfortable pace |
| Complex animations | 300-500ms | Time to follow |
| Page transitions | 400-600ms | Smooth handoff |
| **Wow/Premium Effects** | 800ms+ | Dramatic, organic spring-based, layered |

### Choosing Duration

Ask yourself:
1. How far is the element moving?
2. How important is it to notice this change?
3. Is the user waiting, or is this background?

---

## 2. Easing Principles

### What Easing Does

```
Easing = how speed changes over time
â”œâ”€â”€ Linear: constant speed (mechanical, robotic)
â”œâ”€â”€ Ease-out: fast start, slow end (natural entry)
â”œâ”€â”€ Ease-in: slow start, fast end (natural exit)
â””â”€â”€ Ease-in-out: slow both ends (smooth, deliberate)
```

### When to Use Each

| Easing | Best For | Feels Like |
|--------|----------|------------|
| **Ease-out** | Elements entering | Arriving, settling |
| **Ease-in** | Elements leaving | Departing, exiting |
| **Ease-in-out** | Emphasis, loops | Deliberate, smooth |
| **Linear** | Continuous motion | Mechanical, constant |
| **Bounce/Elastic** | Playful UI | Fun, energetic |

### The Pattern

```css
/* Entering view = ease-out (decelerate) */
.enter {
  animation-timing-function: ease-out;
}

/* Leaving view = ease-in (accelerate) */
.exit {
  animation-timing-function: ease-in;
}

/* Continuous = ease-in-out */
.continuous {
  animation-timing-function: ease-in-out;
}
```

---

## 3. Micro-Interaction Principles

### What Makes Good Micro-Interactions

```
Purpose of micro-interactions:
â”œâ”€â”€ FEEDBACK: Confirm the action happened
â”œâ”€â”€ GUIDANCE: Show what's possible
â”œâ”€â”€ STATUS: Indicate current state
â””â”€â”€ DELIGHT: Small moments of joy
```

### Button States

```
Hover â†’ slight visual change (lift, color, scale)
Active â†’ pressed feeling (scale down, shadow change)
Focus â†’ clear indicator (outline, ring)
Loading â†’ progress indicator (spinner, skeleton)
Success â†’ confirmation (check, color)
```

### Principles

1. **Respond immediately** (under 100ms perception)
2. **Match the action** (press = `scale(0.95)`, hover = `translateY(-4px) + glow`)
3. **Be bold but smooth** (Usta iÅŸi hissettir)
4. **Be consistent** (same actions = same feedback)

---

## 4. Loading States Principles

### Types by Context

| Situation | Approach |
|-----------|----------|
| Quick load (<1s) | No indicator needed |
| Medium (1-3s) | Spinner or simple animation |
| Long (3s+) | Progress bar or skeleton |
| Unknown duration | Indeterminate indicator |

### Skeleton Screens

```
Purpose: Reduce perceived wait time
â”œâ”€â”€ Show layout shape immediately
â”œâ”€â”€ Animate subtly (shimmer, pulse)
â”œâ”€â”€ Replace with content when ready
â””â”€â”€ Feels faster than spinner
```

### Progress Indicators

```
When to show progress:
â”œâ”€â”€ User-initiated action
â”œâ”€â”€ File uploads/downloads
â”œâ”€â”€ Multi-step processes
â””â”€â”€ Long operations

When NOT needed:
â”œâ”€â”€ Very quick operations
â”œâ”€â”€ Background tasks
â””â”€â”€ Initial page loads (skeleton better)
```

---

## 5. Page Transitions Principles

### Transition Strategy

```
Simple rule: exit fast, enter slower
â”œâ”€â”€ Outgoing content fades quickly
â”œâ”€â”€ Incoming content animates in
â””â”€â”€ Avoids "everything moving at once"
```

### Common Patterns

| Pattern | When to Use |
|---------|-------------|
| **Fade** | Safe default, works everywhere |
| **Slide** | Sequential navigation (prev/next) |
| **Scale** | Opening/closing modals |
| **Shared element** | Maintaining visual continuity |

### Direction Matching

```
Navigation direction = animation direction
â”œâ”€â”€ Forward â†’ slide from right
â”œâ”€â”€ Backward â†’ slide from left
â”œâ”€â”€ Deeper â†’ scale up from center
â”œâ”€â”€ Back up â†’ scale down
```

---

## 6. Scroll Animation Principles

### Progressive Reveal

```
Content appears as user scrolls:
â”œâ”€â”€ Reduces initial cognitive load
â”œâ”€â”€ Rewards exploration
â”œâ”€â”€ Must not feel sluggish
â””â”€â”€ Option to disable (accessibility)
```

### Trigger Points

| When to Trigger | Effect |
|-----------------|--------|
| Just entering viewport | Standard reveal |
| Centered in viewport | For emphasis |
| Partially visible | Earlier reveal |
| Fully visible | Late trigger |

### Animation Properties

- Fade in (opacity)
- Slide up (transform)
- Scale (transform)
- Combination of above

### Performance

- Use Intersection Observer
- Animate only transform/opacity
- Reduce on mobile if needed

---

## 7. Hover Effects Principles

### Matching Effect to Action

| Element | Effect | Intent |
|---------|--------|--------|
| **Clickable card** | Lift + shadow | "This is interactive" |
| **Button** | Color/brightness change | "Press me" |
| **Image** | Zoom/scale | "View closer" |
| **Link** | Underline/color | "Navigate here" |

### Principles

1. **Signal interactivity** - hover shows it's clickable
2. **Don't overdo it** - subtle changes work
3. **Match importance** - bigger change = more important
4. **Touch alternatives** - hover doesn't work on mobile

---

## 8. Feedback Animation Principles

### Success States

```
Celebrate appropriately:
â”œâ”€â”€ Minor action â†’ subtle check/color
â”œâ”€â”€ Major action â†’ more pronounced animation
â”œâ”€â”€ Completion â†’ satisfying animation
â””â”€â”€ Match brand personality
```

### Error States

```
Draw attention without panic:
â”œâ”€â”€ Color change (semantic red)
â”œâ”€â”€ Shake animation (brief!)
â”œâ”€â”€ Focus on error field
â””â”€â”€ Clear messaging
```

### Timing

- Success: slightly longer (enjoy the moment)
- Error: quick (don't delay action)
- Loading: continuous until complete

---

## 9. Performance Principles

### What's Cheap to Animate

```
GPU-accelerated (FAST):
â”œâ”€â”€ transform: translate, scale, rotate
â””â”€â”€ opacity: 0 to 1

CPU-intensive (SLOW):
â”œâ”€â”€ width, height
â”œâ”€â”€ top, left, right, bottom
â”œâ”€â”€ margin, padding
â”œâ”€â”€ border-radius changes
â””â”€â”€ box-shadow changes
```

### Optimization Strategies

1. **Animate transform/opacity** whenever possible
2. **Avoid layout triggers** (size/position changes)
3. **Use will-change sparingly** (hints to browser)
4. **Test on low-end devices** (not just dev machine)

### Respecting User Preferences

```css
@media (prefers-reduced-motion: reduce) {
  /* Honor this preference */
  /* Essential animations only */
  /* Reduce or remove decorative motion */
}
```

---

## 10. Animation Decision Checklist

Before adding animation:

- [ ] **Is there a purpose?** (feedback/guidance/delight)
- [ ] **Is timing appropriate?** (not too fast/slow)
- [ ] **Did you pick correct easing?** (enter/exit/emphasis)
- [ ] **Is it performant?** (transform/opacity only)
- [ ] **Tested reduced motion?** (accessibility)
- [ ] **Consistent with other animations?** (same timing feel)
- [ ] **Not your default settings?** (variety check)
- [ ] **Asked user about style if unclear?**

### Anti-Patterns

- âŒ Same timing values every project
- âŒ Animation for animation's sake
- âŒ Ignoring reduced-motion preference
- âŒ Animating expensive properties
- âŒ Too many things animating at once
- âŒ Delays that frustrate users

---

> **Remember**: Animation is communication. Every motion should have meaning and serve the user experience.

