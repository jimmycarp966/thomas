> **MANDATORIO: Siempre responde en ESPAÑOL**

# Mobile Color System Reference

> OLED optimization, dark mode, battery-aware colors, and outdoor visibility.
> **Color on mobile isn't just aestheticsâ€”it's battery life and usability.**

---

## 1. Mobile Color Fundamentals

### Why Mobile Color is Different

```
DESKTOP:                           MOBILE:
â”œâ”€â”€ LCD screens (backlit)          â”œâ”€â”€ OLED common (self-emissive)
â”œâ”€â”€ Controlled lighting            â”œâ”€â”€ Outdoor, bright sun
â”œâ”€â”€ Stable power                   â”œâ”€â”€ Battery matters
â”œâ”€â”€ Personal preference            â”œâ”€â”€ System-wide dark mode
â””â”€â”€ Static viewing                 â””â”€â”€ Variable angles, motion
```

### Mobile Color Priorities

| Priority | Why |
|----------|-----|
| **1. Readability** | Outdoor, variable lighting |
| **2. Battery efficiency** | OLED = dark mode saves power |
| **3. System integration** | Dark/light mode support |
| **4. Semantics** | Error, success, warning colors |
| **5. Brand** | After functional requirements |

---

## 2. OLED Considerations

### How OLED Differs

```
LCD (Liquid Crystal Display):
â”œâ”€â”€ Backlight always on
â”œâ”€â”€ Black = backlight through dark filter
â”œâ”€â”€ Energy use = constant
â””â”€â”€ Dark mode = no battery savings

OLED (Organic LED):
â”œâ”€â”€ Each pixel emits own light
â”œâ”€â”€ Black = pixel OFF (zero power)
â”œâ”€â”€ Energy use = brighter pixels use more
â””â”€â”€ Dark mode = significant battery savings
```

### Battery Savings with OLED

```
Color energy consumption (relative):

#000000 (True Black)  â–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘  0%
#1A1A1A (Near Black)  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘  ~15%
#333333 (Dark Gray)   â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘  ~30%
#666666 (Medium Gray) â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘  ~50%
#FFFFFF (White)       â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  100%

Saturated colors also use significant power:
â”œâ”€â”€ Blue pixels: Most efficient
â”œâ”€â”€ Green pixels: Medium
â”œâ”€â”€ Red pixels: Least efficient
â””â”€â”€ Desaturated colors save more
```

### True Black vs Near Black

```
#000000 (True Black):
â”œâ”€â”€ Maximum battery savings
â”œâ”€â”€ Can cause "black smear" on scroll
â”œâ”€â”€ Sharp contrast (may be harsh)
â””â”€â”€ Used by Apple in pure dark mode

#121212 or #1A1A1A (Near Black):
â”œâ”€â”€ Still good battery savings
â”œâ”€â”€ Smoother scrolling (no smear)
â”œâ”€â”€ Slightly softer on eyes
â””â”€â”€ Material Design recommendation

RECOMMENDATION: #000000 for backgrounds, #0D0D0D-#1A1A1A for surfaces
```

---

## 3. Dark Mode Design

### Dark Mode Benefits

```
Users enable dark mode for:
â”œâ”€â”€ Battery savings (OLED)
â”œâ”€â”€ Reduced eye strain (low light)
â”œâ”€â”€ Personal preference
â”œâ”€â”€ AMOLED aesthetic
â””â”€â”€ Accessibility (light sensitivity)
```

### Dark Mode Color Strategy

```
LIGHT MODE                      DARK MODE
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                      â”€â”€â”€â”€â”€â”€â”€â”€â”€
Background: #FFFFFF      â†’      #000000 or #121212
Surface:    #F5F5F5      â†’      #1E1E1E
Surface 2:  #EEEEEE      â†’      #2C2C2C

Primary:    #1976D2      â†’      #90CAF9 (lighter)
Text:       #212121      â†’      #E0E0E0 (not pure white)
Secondary:  #757575      â†’      #9E9E9E

Elevation in dark mode:
â”œâ”€â”€ Higher = slightly lighter surface
â”œâ”€â”€ 0dp â†’  0% overlay
â”œâ”€â”€ 4dp â†’  9% overlay
â”œâ”€â”€ 8dp â†’  12% overlay
â””â”€â”€ Creates depth without shadows
```

### Text Colors in Dark Mode

| Role | Light Mode | Dark Mode |
|------|------------|-----------|
| Primary | #000000 (Black) | #E8E8E8 (Not pure white) |
| Secondary | #666666 | #B0B0B0 |
| Disabled | #9E9E9E | #6E6E6E |
| Links | #1976D2 | #8AB4F8 |

### Color Inversion Rules

```
DON'T just invert colors:
â”œâ”€â”€ Saturated colors become eye-burning
â”œâ”€â”€ Semantic colors lose meaning
â”œâ”€â”€ Brand colors may break
â””â”€â”€ Contrast ratios change unpredictably

DO create intentional dark palette:
â”œâ”€â”€ Desaturate primary colors
â”œâ”€â”€ Use lighter tints for emphasis
â”œâ”€â”€ Maintain semantic color meanings
â”œâ”€â”€ Check contrast ratios independently
```

---

## 4. Outdoor Visibility

### The Sunlight Problem

```
Screen visibility outdoors:
â”œâ”€â”€ Bright sun washes out low contrast
â”œâ”€â”€ Glare reduces readability
â”œâ”€â”€ Polarized sunglasses affect
â””â”€â”€ Users shield screen with hand

Affected elements:
â”œâ”€â”€ Light gray text on white
â”œâ”€â”€ Subtle color differences
â”œâ”€â”€ Low opacity overlays
â””â”€â”€ Pastel colors
```

### High Contrast Strategies

```
For outdoor visibility:

MINIMUM CONTRAST RATIOS:
â”œâ”€â”€ Normal text: 4.5:1 (WCAG AA)
â”œâ”€â”€ Large text: 3:1 (WCAG AA)
â”œâ”€â”€ Recommended: 7:1+ (AAA)

AVOID:
â”œâ”€â”€ #999 on #FFF (fails AA)
â”œâ”€â”€ #BBB on #FFF (fails)
â”œâ”€â”€ Pale colors on light backgrounds
â””â”€â”€ Subtle gradients for critical info

DO:
â”œâ”€â”€ Use system semantic colors
â”œâ”€â”€ Test in bright environment
â”œâ”€â”€ Provide high contrast mode
â””â”€â”€ Use solid colors for critical UI
```

---

## 5. Semantic Colors

### Consistent Meaning

| Semantic | Meaning | iOS Default | Android Default |
|----------|---------|-------------|-----------------|
| Error | Problems, destruction | #FF3B30 | #B3261E |
| Success | Completion, positive | #34C759 | #4CAF50 |
| Warning | Attention, caution | #FF9500 | #FFC107 |
| Info | Information | #007AFF | #2196F3 |

### Semantic Color Rules

```
NEVER use semantic colors for:
â”œâ”€â”€ Branding (confuses meaning)
â”œâ”€â”€ Decoration (reduces impact)
â”œâ”€â”€ Arbitrary styling
â””â”€â”€ Status indicators (use icons too)

ALWAYS:
â”œâ”€â”€ Pair with icons (colorblind users)
â”œâ”€â”€ Maintain across light/dark modes
â”œâ”€â”€ Keep consistent throughout app
â””â”€â”€ Follow platform conventions
```

### Error State Colors

```
Error states need:
â”œâ”€â”€ Red-ish color (semantic)
â”œâ”€â”€ High contrast against background
â”œâ”€â”€ Icon reinforcement
â”œâ”€â”€ Clear text explanation

iOS:
â”œâ”€â”€ Light: #FF3B30
â”œâ”€â”€ Dark: #FF453A

Android:
â”œâ”€â”€ Light: #B3261E
â”œâ”€â”€ Dark: #F2B8B5 (on error container)
```

---

## 6. Dynamic Color (Android)

### Material You

```
Android 12+ Dynamic Color:

User's wallpaper â†’ Color extraction â†’ App theme

Your app automatically gets:
â”œâ”€â”€ Primary (from wallpaper dominant)
â”œâ”€â”€ Secondary (complementary)
â”œâ”€â”€ Tertiary (accent)
â”œâ”€â”€ Surface colors (neutral, derived)
â”œâ”€â”€ On-colors (text on each)
```

### Supporting Dynamic Color

```kotlin
// Jetpack Compose
MaterialTheme(
    colorScheme = dynamicColorScheme()
        ?: staticColorScheme() // Fallback for older Android
)

// React Native
// Limited support - consider react-native-material-you
```

### Fallback Colors

```
When dynamic color unavailable:
â”œâ”€â”€ Android < 12
â”œâ”€â”€ User disabled
â”œâ”€â”€ Non-supporting launchers

Provide static color scheme:
â”œâ”€â”€ Define your brand colors
â”œâ”€â”€ Test in both modes
â”œâ”€â”€ Match dynamic color roles
â””â”€â”€ Support light + dark
```

---

## 7. Color Accessibility

### Colorblind Considerations

```
~8% of men, ~0.5% of women are colorblind

Types:
â”œâ”€â”€ Protanopia (red weakness)
â”œâ”€â”€ Deuteranopia (green weakness)
â”œâ”€â”€ Tritanopia (blue weakness)
â”œâ”€â”€ Monochromacy (rare, no color)

Design rules:
â”œâ”€â”€ Never rely on color alone
â”œâ”€â”€ Use patterns, icons, text
â”œâ”€â”€ Test with simulation tools
â”œâ”€â”€ Avoid red/green distinctions only
```

### Contrast Testing Tools

```
Use these to verify:
â”œâ”€â”€ Built-in accessibility inspector (Xcode)
â”œâ”€â”€ Accessibility Scanner (Android)
â”œâ”€â”€ Contrast ratio calculators
â”œâ”€â”€ Colorblind simulation
â””â”€â”€ Test on actual devices in sunlight
```

### Sufficient Contrast

```
WCAG Guidelines:

AA (Minimum)
â”œâ”€â”€ Normal text: 4.5:1
â”œâ”€â”€ Large text (18pt+): 3:1
â”œâ”€â”€ UI components: 3:1

AAA (Enhanced)
â”œâ”€â”€ Normal text: 7:1
â”œâ”€â”€ Large text: 4.5:1

Mobile recommendation: Meet AA, aim for AAA
```

---

## 8. Color Anti-Patterns

### âŒ Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| **Light gray on white** | Invisible outdoors | Min 4.5:1 contrast |
| **Pure white in dark mode** | Eye strain | Use #E0E0E0-#F0F0F0 |
| **Same saturation dark mode** | Garish, glowing | Desaturate colors |
| **Red/green only indicator** | Colorblind users can't see | Add icons |
| **Semantic colors for brand** | Confusing meaning | Use neutral for brand |
| **Ignoring system dark mode** | Jarring experience | Support both modes |

### âŒ AI Color Mistakes

```
AI tends to:
â”œâ”€â”€ Use same colors for light/dark
â”œâ”€â”€ Ignore OLED battery implications
â”œâ”€â”€ Skip contrast calculations
â”œâ”€â”€ Default to purple/violet (BANNED)
â”œâ”€â”€ Use low contrast "aesthetic" grays
â”œâ”€â”€ Not test in outdoor conditions
â””â”€â”€ Forget colorblind users

RULE: Design for the worst case.
Test in bright sunlight, with colorblindness simulation.
```

---

## 9. Color System Checklist

### Before Choosing Colors

- [ ] Light and dark mode variants defined?
- [ ] Contrast ratios checked (4.5:1+)?
- [ ] OLED battery considered (dark mode)?
- [ ] Semantic colors follow conventions?
- [ ] Colorblind-safe (not color-only indicators)?

### Before Release

- [ ] Tested in bright sunlight?
- [ ] Tested dark mode on OLED device?
- [ ] System dark mode respected?
- [ ] Dynamic color supported (Android)?
- [ ] Error/success/warning consistent?
- [ ] All text meets contrast requirements?

---

## 10. Quick Reference

### Dark Mode Backgrounds

```
True black (OLED max savings): #000000
Near black (Material):         #121212
Surface 1:                     #1E1E1E
Surface 2:                     #2C2C2C
Surface 3:                     #3C3C3C
```

### Text on Dark

```
Primary:   #E0E0E0 to #ECECEC
Secondary: #A0A0A0 to #B0B0B0
Disabled:  #606060 to #707070
```

### Contrast Ratios

```
Small text:  4.5:1 (minimum)
Large text:  3:1 (minimum)
UI elements: 3:1 (minimum)
Ideal:       7:1 (AAA)
```

---

> **Remember:** Color on mobile must work in the worst conditionsâ€”bright sun, tired eyes, colorblindness, low battery. Pretty colors that fail these tests are useless colors.

