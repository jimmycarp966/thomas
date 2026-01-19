> **MANDATORIO: Siempre responde en ESPAÑOL**

# Mobile Typography Reference

> Type scale, system fonts, Dynamic Type, accessibility, and dark mode typography.
> **Typography failures are the #1 cause of unreadable mobile apps.**

---

## 1. Mobile Typography Fundamentals

### Why Mobile Type is Different

```
DESKTOP:                        MOBILE:
â”œâ”€â”€ 20-30" viewing distance     â”œâ”€â”€ 12-15" viewing distance
â”œâ”€â”€ Large viewport              â”œâ”€â”€ Small viewport, narrow
â”œâ”€â”€ Hover for details           â”œâ”€â”€ Tap/scroll for details
â”œâ”€â”€ Controlled lighting         â”œâ”€â”€ Variable (outdoor, etc.)
â”œâ”€â”€ Fixed font size             â”œâ”€â”€ User-controlled sizing
â””â”€â”€ Long reading sessions       â””â”€â”€ Quick scanning
```

### Mobile Type Rules

| Rule | Desktop | Mobile |
|------|---------|--------|
| **Minimum body size** | 14px | 16px (14pt/14sp) |
| **Maximum line length** | 75 characters | 40-60 characters |
| **Line height** | 1.4-1.5 | 1.4-1.6 (more generous) |
| **Font weight** | Varies | Regular dominant, bold sparingly |
| **Contrast** | AA (4.5:1) | AA minimum, AAA preferred |

---

## 2. System Fonts

### iOS: SF Pro Family

```
San Francisco (SF) Family:
â”œâ”€â”€ SF Pro Display: Large text (â‰¥ 20pt)
â”œâ”€â”€ SF Pro Text: Body text (< 20pt)
â”œâ”€â”€ SF Pro Rounded: Friendly contexts
â”œâ”€â”€ SF Mono: Monospace
â””â”€â”€ SF Compact: Apple Watch, compact UI

Features:
â”œâ”€â”€ Optical sizing (auto-adjusts)
â”œâ”€â”€ Dynamic tracking (spacing)
â”œâ”€â”€ Tabular/proportional figures
â”œâ”€â”€ Excellent legibility
```

### Android: Roboto Family

```
Roboto Family:
â”œâ”€â”€ Roboto: Default sans-serif
â”œâ”€â”€ Roboto Flex: Variable font
â”œâ”€â”€ Roboto Serif: Serif option
â”œâ”€â”€ Roboto Mono: Monospace
â”œâ”€â”€ Roboto Condensed: Narrow spaces

Features:
â”œâ”€â”€ Optimized for screens
â”œâ”€â”€ Wide language support
â”œâ”€â”€ Multiple weights
â”œâ”€â”€ Good at small sizes
```

### When to Use System Fonts

```
âœ… USE system fonts when:
â”œâ”€â”€ Brand doesn't mandate custom font
â”œâ”€â”€ Reading efficiency is priority
â”œâ”€â”€ App feels native/integrated important
â”œâ”€â”€ Performance is critical
â”œâ”€â”€ Wide language support needed

âŒ AVOID system fonts when:
â”œâ”€â”€ Brand identity requires custom
â”œâ”€â”€ Design differentiation needed
â”œâ”€â”€ Editorial/magazine style
â””â”€â”€ (But still support accessibility)
```

### Custom Font Considerations

```
If using custom fonts:
â”œâ”€â”€ Include all weights needed
â”œâ”€â”€ Subset for file size
â”œâ”€â”€ Test at all Dynamic Type sizes
â”œâ”€â”€ Provide fallback to system
â”œâ”€â”€ Test rendering quality
â””â”€â”€ Check language support
```

---

## 3. Type Scale

### iOS Type Scale (Built-in)

| Style | Size | Weight | Line Height |
|-------|------|--------|-------------|
| Large Title | 34pt | Bold | 41pt |
| Title 1 | 28pt | Bold | 34pt |
| Title 2 | 22pt | Bold | 28pt |
| Title 3 | 20pt | Semibold | 25pt |
| Headline | 17pt | Semibold | 22pt |
| Body | 17pt | Regular | 22pt |
| Callout | 16pt | Regular | 21pt |
| Subhead | 15pt | Regular | 20pt |
| Footnote | 13pt | Regular | 18pt |
| Caption 1 | 12pt | Regular | 16pt |
| Caption 2 | 11pt | Regular | 13pt |

### Android Type Scale (Material 3)

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Display Large | 57sp | 400 | 64sp |
| Display Medium | 45sp | 400 | 52sp |
| Display Small | 36sp | 400 | 44sp |
| Headline Large | 32sp | 400 | 40sp |
| Headline Medium | 28sp | 400 | 36sp |
| Headline Small | 24sp | 400 | 32sp |
| Title Large | 22sp | 400 | 28sp |
| Title Medium | 16sp | 500 | 24sp |
| Title Small | 14sp | 500 | 20sp |
| Body Large | 16sp | 400 | 24sp |
| Body Medium | 14sp | 400 | 20sp |
| Body Small | 12sp | 400 | 16sp |
| Label Large | 14sp | 500 | 20sp |
| Label Medium | 12sp | 500 | 16sp |
| Label Small | 11sp | 500 | 16sp |

### Creating Custom Scale

```
If creating custom scale, use modular ratio:

Recommended ratios:
â”œâ”€â”€ 1.125 (Major second): Dense UI
â”œâ”€â”€ 1.200 (Minor third): Compact
â”œâ”€â”€ 1.250 (Major third): Balanced (common)
â”œâ”€â”€ 1.333 (Perfect fourth): Spacious
â””â”€â”€ 1.500 (Perfect fifth): Dramatic

Example with 1.25 ratio, 16px base:
â”œâ”€â”€ xs: 10px (16 Á· 1.25 Á· 1.25)
â”œâ”€â”€ sm: 13px (16 Á· 1.25)
â”œâ”€â”€ base: 16px
â”œâ”€â”€ lg: 20px (16 Á— 1.25)
â”œâ”€â”€ xl: 25px (16 Á— 1.25 Á— 1.25)
â”œâ”€â”€ 2xl: 31px
â”œâ”€â”€ 3xl: 39px
â””â”€â”€ 4xl: 49px
```

---

## 4. Dynamic Type / Text Scaling

### iOS Dynamic Type (MANDATORY)

```swift
// âŒ WRONG: Fixed size (doesn't scale)
Text("Hello")
    .font(.system(size: 17))

// âœ… CORRECT: Dynamic Type
Text("Hello")
    .font(.body) // Scales with user setting

// Custom font with scaling
Text("Hello")
    .font(.custom("MyFont", size: 17, relativeTo: .body))
```

### Android Text Scaling (MANDATORY)

```
ALWAYS use sp for text:
â”œâ”€â”€ sp = Scale-independent pixels
â”œâ”€â”€ Scales with user font preference
â”œâ”€â”€ dp does NOT scale (don't use for text)

User can scale from 85% to 200%:
â”œâ”€â”€ Default (100%): 14sp = 14dp
â”œâ”€â”€ Largest (200%): 14sp = 28dp

Test at 200%!
```

### Scaling Challenges

```
Problems at large text sizes:
â”œâ”€â”€ Text overflows containers
â”œâ”€â”€ Buttons become too tall
â”œâ”€â”€ Icons look small relative to text
â”œâ”€â”€ Layouts break

Solutions:
â”œâ”€â”€ Use flexible containers (not fixed height)
â”œâ”€â”€ Allow text wrapping
â”œâ”€â”€ Scale icons with text
â”œâ”€â”€ Test at extremes during development
â”œâ”€â”€ Use scrollable containers for long text
```

---

## 5. Typography Accessibility

### Minimum Sizes

| Element | Minimum | Recommended |
|---------|---------|-------------|
| Body text | 14px/pt/sp | 16px/pt/sp |
| Secondary text | 12px/pt/sp | 13-14px/pt/sp |
| Captions | 11px/pt/sp | 12px/pt/sp |
| Buttons | 14px/pt/sp | 14-16px/pt/sp |
| **Nothing smaller** | 11px | - |

### Contrast Requirements (WCAG)

```
Normal text (< 18pt or < 14pt bold):
â”œâ”€â”€ AA: 4.5:1 ratio minimum
â”œâ”€â”€ AAA: 7:1 ratio recommended

Large text (â‰¥ 18pt or â‰¥ 14pt bold):
â”œâ”€â”€ AA: 3:1 ratio minimum
â”œâ”€â”€ AAA: 4.5:1 ratio recommended

Logos/decorative: No requirement
```

### Line Height for Accessibility

```
WCAG Success Criterion 1.4.12:

Line height (line spacing): â‰¥ 1.5Á—
Paragraph spacing: â‰¥ 2Á— font size
Letter spacing: â‰¥ 0.12Á— font size
Word spacing: â‰¥ 0.16Á— font size

Mobile recommendation:
â”œâ”€â”€ Body: 1.4-1.6 line height
â”œâ”€â”€ Headings: 1.2-1.3 line height
â”œâ”€â”€ Never below 1.2
```

---

## 6. Dark Mode Typography

### Color Adjustments

```
Light Mode:               Dark Mode:
â”œâ”€â”€ Black text (#000)     â”œâ”€â”€ White/light gray (#E0E0E0)
â”œâ”€â”€ High contrast         â”œâ”€â”€ Slightly reduced contrast
â”œâ”€â”€ Full saturation       â”œâ”€â”€ Desaturated colors
â””â”€â”€ Dark = emphasis       â””â”€â”€ Light = emphasis

RULE: Don't use pure white (#FFF) on dark.
Use off-white (#E0E0E0 to #F0F0F0) to reduce eye strain.
```

### Dark Mode Hierarchy

| Level | Light Mode | Dark Mode |
|-------|------------|-----------|
| Primary text | #000000 | #E8E8E8 |
| Secondary text | #666666 | #A0A0A0 |
| Tertiary text | #999999 | #707070 |
| Disabled text | #CCCCCC | #505050 |

### Weight in Dark Mode

```
Dark mode text appears thinner due to halation
(light bleeding into dark background)

Consider:
â”œâ”€â”€ Using medium weight for body (instead of regular)
â”œâ”€â”€ Increasing letter-spacing slightly
â”œâ”€â”€ Testing on actual OLED displays
â””â”€â”€ Using slightly bolder weight than light mode
```

---

## 7. Typography Anti-Patterns

### âŒ Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| **Fixed font sizes** | Ignores accessibility | Use dynamic sizing |
| **Too small text** | Unreadable | Min 14pt/sp |
| **Low contrast** | Invisible in sunlight | Min 4.5:1 |
| **Long lines** | Hard to track | Max 60 chars |
| **Tight line height** | Cramped, hard to read | Min 1.4Á— |
| **Too many sizes** | Visual chaos | Max 5-7 sizes |
| **All caps body** | Hard to read | Headlines only |
| **Light gray on white** | Impossible in bright light | Higher contrast |

### âŒ AI Typography Mistakes

```
AI tends to:
â”œâ”€â”€ Use fixed px values instead of pt/sp
â”œâ”€â”€ Skip Dynamic Type support
â”œâ”€â”€ Use too small text (12-14px body)
â”œâ”€â”€ Ignore line height settings
â”œâ”€â”€ Use low contrast "aesthetic" grays
â”œâ”€â”€ Apply same scale to mobile as desktop
â””â”€â”€ Skip testing at large text sizes

RULE: Typography must SCALE.
Test at smallest and largest settings.
```

---

## 8. Font Loading & Performance

### Font File Optimization

```
Font file sizes matter on mobile:
â”œâ”€â”€ Full font: 100-300KB per weight
â”œâ”€â”€ Subset (Latin): 15-40KB per weight
â”œâ”€â”€ Variable font: 100-200KB (all weights)

Recommendations:
â”œâ”€â”€ Subset to needed characters
â”œâ”€â”€ Use WOFF2 format
â”œâ”€â”€ Max 2-3 font files
â”œâ”€â”€ Consider variable fonts
â”œâ”€â”€ Cache fonts appropriately
```

### Loading Strategy

```
1. SYSTEM FONT FALLBACK
   Show system font â†’ swap when custom loads
   
2. FONT DISPLAY SWAP
   font-display: swap (CSS)
   
3. PRELOAD CRITICAL FONTS
   Preload fonts needed above the fold
   
4. DON'T BLOCK RENDER
   Don't wait for fonts to show content
```

---

## 9. Typography Checklist

### Before Any Text Design

- [ ] Body text â‰¥ 16px/pt/sp?
- [ ] Line height â‰¥ 1.4?
- [ ] Line length â‰¤ 60 chars?
- [ ] Type scale defined (max 5-7 sizes)?
- [ ] Using pt (iOS) or sp (Android)?

### Before Release

- [ ] Dynamic Type tested (iOS)?
- [ ] Font scaling tested at 200% (Android)?
- [ ] Dark mode contrast checked?
- [ ] Sunlight readability tested?
- [ ] All text has proper hierarchy?
- [ ] Custom fonts have fallbacks?
- [ ] Long text scrolls properly?

---

## 10. Quick Reference

### Typography Tokens

```
// iOS
.largeTitle  // 34pt, Bold
.title       // 28pt, Bold
.title2      // 22pt, Bold
.title3      // 20pt, Semibold
.headline    // 17pt, Semibold
.body        // 17pt, Regular
.subheadline // 15pt, Regular
.footnote    // 13pt, Regular
.caption     // 12pt, Regular

// Android (Material 3)
displayLarge   // 57sp
headlineLarge  // 32sp
titleLarge     // 22sp
bodyLarge      // 16sp
labelLarge     // 14sp
```

### Minimum Sizes

```
Body:       14-16pt/sp (16 preferred)
Secondary:  12-13pt/sp
Caption:    11-12pt/sp
Nothing:    < 11pt/sp
```

### Line Height

```
Headings:  1.1-1.3
Body:      1.4-1.6
Long text: 1.5-1.75
```

---

> **Remember:** If users can't read your text, your app is broken. Typography isn't decorationâ€”it's the primary interface. Test on real devices, in real conditions, with accessibility settings enabled.

