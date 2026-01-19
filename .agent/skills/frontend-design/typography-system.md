> **MANDATORIO: Siempre responde en ESPAÑOL**

# Typography System Reference

> Typography principles and decision-making - learn to think, not memorize.
> **No fixed font names or sizes - understand the system.**

---

## 1. Modular Scale Principles

### What is a Modular Scale?

```
A mathematical relationship between font sizes:
â”œâ”€â”€ Pick a BASE size (usually body text)
â”œâ”€â”€ Pick a RATIO (multiplier)
â””â”€â”€ Generate all sizes using: base Á— ratio^n
```

### Common Ratios and When to Use

| Ratio | Value | Feeling | Best For |
|-------|-------|---------|----------|
| Minor Second | 1.067 | Very subtle | Dense UI, small screens |
| Major Second | 1.125 | Subtle | Compact interfaces |
| Minor Third | 1.2 | Comfortable | Mobile apps, cards |
| Major Third | 1.25 | Balanced | General web (most common) |
| Perfect Fourth | 1.333 | Noticeable | Editorial, blogs |
| Perfect Fifth | 1.5 | Dramatic | Headlines, marketing |
| Golden Ratio | 1.618 | Maximum impact | Hero sections, display |

### Generate Your Scale

```
Given: base = YOUR_BASE_SIZE, ratio = YOUR_RATIO

Scale:
â”œâ”€â”€ xs:  base Á· ratioÂ²
â”œâ”€â”€ sm:  base Á· ratio
â”œâ”€â”€ base: YOUR_BASE_SIZE
â”œâ”€â”€ lg:  base Á— ratio
â”œâ”€â”€ xl:  base Á— ratioÂ²
â”œâ”€â”€ 2xl: base Á— ratioÂ³
â”œâ”€â”€ 3xl: base Á— ratioâ´
â””â”€â”€ ... continue as needed
```

### Choosing Base Size

| Context | Base Size Range | Why |
|---------|-----------------|-----|
| Mobile-first | 16-18px | Readability on small screens |
| Desktop app | 14-16px | Information density |
| Editorial | 18-21px | Long-form reading comfort |
| Accessibility focus | 18px+ | Easier to read |

---

## 2. Font Pairing Principles

### What Makes Fonts Work Together

```
Contrast + Harmony:
â”œâ”€â”€ Different ENOUGH to create hierarchy
â”œâ”€â”€ Similar ENOUGH to feel cohesive
â””â”€â”€ Usually: serif + sans, or display + neutral
```

### Pairing Strategies

| Strategy | How | Result |
|----------|-----|--------|
| **Contrast** | Serif heading + Sans body | Classic, editorial feel |
| **Same Family** | One variable font, different weights | Cohesive, modern |
| **Same Designer** | Fonts by same foundry | Often harmonious proportions |
| **Era Match** | Fonts from same time period | Historical consistency |

### What to Look For

```
When pairing, compare:
â”œâ”€â”€ x-height (height of lowercase letters)
â”œâ”€â”€ Letter width (narrow vs wide)
â”œâ”€â”€ Stroke contrast (thin/thick variation)
â””â”€â”€ Overall mood (formal vs casual)
```

### Safe Pairing Patterns

| Heading Style | Body Style | Mood |
|---------------|------------|------|
| Geometric sans | Humanist sans | Modern, friendly |
| Display serif | Clean sans | Editorial, sophisticated |
| Neutral sans | Same sans | Minimal, tech |
| Bold geometric | Light geometric | Contemporary |

### Avoid

- âŒ Two decorative fonts together
- âŒ Similar fonts that conflict
- âŒ More than 2-3 font families
- âŒ Fonts with very different x-heights

---

## 3. Line Height Principles

### The Relationship

```
Line height depends on:
â”œâ”€â”€ Font size (larger text = less line height needed)
â”œâ”€â”€ Line length (longer lines = more line height)
â”œâ”€â”€ Font design (some fonts need more space)
â””â”€â”€ Content type (headings vs body)
```

### Guidelines by Context

| Content Type | Line Height Range | Why |
|--------------|-------------------|-----|
| **Headings** | 1.1 - 1.3 | Short lines, want compact |
| **Body text** | 1.4 - 1.6 | Comfortable reading |
| **Long-form** | 1.6 - 1.8 | Maximum readability |
| **UI elements** | 1.2 - 1.4 | Space efficiency |

### Adjustment Factors

- **Longer line length** â†’ Increase line height
- **Larger font size** â†’ Decrease line height ratio
- **All caps** â†’ May need more line height
- **Tight tracking** â†’ May need more line height

---

## 4. Line Length Principles

### Optimal Reading Width

```
The sweet spot: 45-75 characters per line
â”œâ”€â”€ < 45: Too choppy, breaks flow
â”œâ”€â”€ 45-75: Comfortable reading
â”œâ”€â”€ > 75: Eye tracking strain
```

### How to Measure

```css
/* Character-based (recommended) */
max-width: 65ch; /* ch = width of "0" character */

/* This adapts to font size automatically */
```

### Context Adjustments

| Context | Character Range |
|---------|-----------------|
| Desktop article | 60-75 characters |
| Mobile | 35-50 characters |
| Sidebar text | 30-45 characters |
| Wide monitors | Still cap at ~75ch |

---

## 5. Responsive Typography Principles

### The Problem

```
Fixed sizes don't scale well:
â”œâ”€â”€ Desktop size too big on mobile
â”œâ”€â”€ Mobile size too small on desktop
â””â”€â”€ Breakpoint jumps feel jarring
```

### Fluid Typography (clamp)

```css
/* Syntax: clamp(MIN, PREFERRED, MAX) */
font-size: clamp(
  MINIMUM_SIZE,
  FLUID_CALCULATION,
  MAXIMUM_SIZE
);

/* FLUID_CALCULATION typically: 
   base + viewport-relative-unit */
```

### Scaling Strategy

| Element | Scaling Behavior |
|---------|-----------------|
| Body text | Slight scaling (1rem â†’ 1.125rem) |
| Subheadings | Moderate scaling |
| Headings | More dramatic scaling |
| Display text | Most dramatic scaling |

---

## 6. Weight and Emphasis Principles

### Semantic Weight Usage

| Weight Range | Name | Use For |
|--------------|------|---------|
| 300-400 | Light/Normal | Body text, paragraphs |
| 500 | Medium | Subtle emphasis |
| 600 | Semibold | Subheadings, labels |
| 700 | Bold | Headings, strong emphasis |
| 800-900 | Heavy/Black | Display, hero text |

### Creating Contrast

```
Good contrast = skip at least 2 weight levels
â”œâ”€â”€ 400 body + 700 heading = good
â”œâ”€â”€ 400 body + 500 emphasis = subtle
â”œâ”€â”€ 600 heading + 700 subheading = too similar
```

### Avoid

- âŒ Too many weights (max 3-4 per page)
- âŒ Adjacent weights for hierarchy (400/500)
- âŒ Heavy weights for long text

---

## 7. Letter Spacing (Tracking)

### Principles

```
Large text (headings): tighter tracking
â”œâ”€â”€ Letters are big, gaps feel larger
â””â”€â”€ Slight negative tracking looks better

Small text (body): normal or slightly wider
â”œâ”€â”€ Improves readability at small sizes
â””â”€â”€ Never negative for body text

ALL CAPS: always wider tracking
â”œâ”€â”€ Uppercase lacks ascenders/descenders
â””â”€â”€ Needs more space to feel right
```

### Adjustment Guidelines

| Context | Tracking Adjustment |
|---------|---------------------|
| Display/Hero | -2% to -4% |
| Headings | -1% to -2% |
| Body text | 0% (normal) |
| Small text | +1% to +2% |
| ALL CAPS | +5% to +10% |

---

## 8. Hierarchy Principles

### Visual Hierarchy Through Type

```
Ways to create hierarchy:
â”œâ”€â”€ SIZE (most obvious)
â”œâ”€â”€ WEIGHT (bold stands out)
â”œâ”€â”€ COLOR (contrast levels)
â”œâ”€â”€ SPACING (margins separate sections)
â””â”€â”€ POSITION (top = important)
```

### Typical Hierarchy

| Level | Characteristics |
|-------|-----------------|
| Primary (H1) | Largest, boldest, most distinct |
| Secondary (H2) | Noticeably smaller but still bold |
| Tertiary (H3) | Medium size, may use weight only |
| Body | Standard size and weight |
| Caption/Meta | Smaller, often lighter color |

### Testing Hierarchy

Ask: "Can I tell what's most important at a glance?"

If squinting at the page, the hierarchy should still be clear.

---

## 9. Readability Psychology

### F-Pattern Reading

```
Users scan in F-pattern:
â”œâ”€â”€ Across the top (first line)
â”œâ”€â”€ Down the left side
â”œâ”€â”€ Across again (subheading)
â””â”€â”€ Continue down left
```

**Implication**: Key info on left and in headings

### Chunking for Comprehension

- Short paragraphs (3-4 lines max)
- Clear subheadings
- Bullet points for lists
- White space between sections

### Cognitive Ease

- Familiar fonts = easier reading
- High contrast = less strain
- Consistent patterns = predictable

---

## 10. Typography Selection Checklist

Before finalizing typography:

- [ ] **Asked user for font preferences?**
- [ ] **Considered brand/context?**
- [ ] **Selected appropriate scale ratio?**
- [ ] **Limited to 2-3 font families?**
- [ ] **Tested readability at all sizes?**
- [ ] **Checked line length (45-75ch)?**
- [ ] **Verified contrast for accessibility?**
- [ ] **Different from your last project?**

### Anti-Patterns

- âŒ Same fonts every project
- âŒ Too many font families
- âŒ Ignoring readability for style
- âŒ Fixed sizes without responsiveness
- âŒ Decorative fonts for body text

---

> **Remember**: Typography is about communication clarity. Choose based on content needs and audience, not personal preference.

