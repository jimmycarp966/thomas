> **MANDATORIO: Siempre responde en ESPAÑOL**

# Touch Psychology Reference

> Deep dive into mobile touch interaction, Fitts' Law for touch, thumb zone anatomy, gesture psychology, and haptic feedback.
> **This is the mobile equivalent of ux-psychology.md - CRITICAL for all mobile work.**

---

## 1. Fitts' Law for Touch

### The Fundamental Difference

```
DESKTOP (Mouse/Trackpad):
â”œâ”€â”€ Cursor size: 1 pixel (precision)
â”œâ”€â”€ Visual feedback: Hover states
â”œâ”€â”€ Error cost: Low (easy to retry)
â””â”€â”€ Target acquisition: Fast, precise

MOBILE (Finger):
â”œâ”€â”€ Contact area: ~7mm diameter (imprecise)
â”œâ”€â”€ Visual feedback: No hover, only tap
â”œâ”€â”€ Error cost: High (frustrating retries)
â”œâ”€â”€ Occlusion: Finger covers the target
â””â”€â”€ Target acquisition: Slower, needs larger targets
```

### Fitts' Law Formula Adapted

```
Touch acquisition time = a + b Á— logâ‚‚(1 + D/W)

Where:
â”œâ”€â”€ D = Distance to target
â”œâ”€â”€ W = Width of target
â””â”€â”€ For touch: W must be MUCH larger than desktop
```

### Minimum Touch Target Sizes

| Platform | Minimum | Recommended | Use For |
|----------|---------|-------------|---------|
| **iOS (HIG)** | 44pt Á— 44pt | 48pt+ | All tappable elements |
| **Android (Material)** | 48dp Á— 48dp | 56dp+ | All tappable elements |
| **WCAG 2.2** | 44px Á— 44px | - | Accessibility compliance |
| **Critical Actions** | - | 56-64px | Primary CTAs, destructive actions |

### Visual Size vs Hit Area

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                     â”‚
â”‚    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚
â”‚    â”‚                         â”‚      â”‚
â”‚    â”‚    [  BUTTON  ]         â”‚ â† Visual: 36px
â”‚    â”‚                         â”‚      â”‚
â”‚    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚
â”‚                                     â”‚ â† Hit area: 48px (padding extends)
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

âœ… CORRECT: Visual can be smaller if hit area is minimum 44-48px
âŒ WRONG: Making hit area same as small visual element
```

### Application Rules

| Element | Visual Size | Hit Area |
|---------|-------------|----------|
| Icon buttons | 24-32px | 44-48px (padding) |
| Text links | Any | 44px height minimum |
| List items | Full width | 48-56px height |
| Checkboxes/Radio | 20-24px | 44-48px tap area |
| Close/X buttons | 24px | 44px minimum |
| Tab bar items | Icon 24-28px | Full tab width, 49px height (iOS) |

---

## 2. Thumb Zone Anatomy

### One-Handed Phone Usage

```
Research shows: 49% of users hold phone one-handed.

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚       HARD TO REACH         â”‚    â”‚ â† Status bar, top nav
â”‚  â”‚      (requires stretch)     â”‚    â”‚    Put: Back, menu, settings
â”‚  â”‚                             â”‚    â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤    â”‚
â”‚  â”‚                             â”‚    â”‚
â”‚  â”‚       OK TO REACH           â”‚    â”‚ â† Content area
â”‚  â”‚      (comfortable)          â”‚    â”‚    Put: Secondary actions, content
â”‚  â”‚                             â”‚    â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤    â”‚
â”‚  â”‚                             â”‚    â”‚
â”‚  â”‚       EASY TO REACH         â”‚    â”‚ â† Tab bar, FAB zone
â”‚  â”‚      (thumb's arc)          â”‚    â”‚    Put: PRIMARY CTAs!
â”‚  â”‚                             â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                     â”‚
â”‚          [    HOME    ]             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Thumb Arc (Right-Handed User)

```
Right hand holding phone:

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  STRETCH      STRETCH    OK   â”‚
â”‚                               â”‚
â”‚  STRETCH        OK       EASY â”‚
â”‚                               â”‚
â”‚    OK          EASY      EASY â”‚
â”‚                               â”‚
â”‚   EASY         EASY      EASY â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

Left hand is mirrored.
â†’ Design for BOTH hands or assume right-dominant
```

### Placement Guidelines

| Element Type | Ideal Position | Reason |
|--------------|----------------|--------|
| **Primary CTA** | Bottom center/right | Easy thumb reach |
| **Tab bar** | Bottom | Natural thumb position |
| **FAB** | Bottom right | Easy for right hand |
| **Navigation** | Top (stretch) | Less frequent use |
| **Destructive actions** | Top left | Hard to reach = harder to accidentally tap |
| **Dismiss/Cancel** | Top left | Convention + safety |
| **Confirm/Done** | Top right or bottom | Convention |

### Large Phone Considerations (>6")

```
On large phones, top 40% becomes "dead zone" for one-handed use.

Solutions:
â”œâ”€â”€ Reachability features (iOS)
â”œâ”€â”€ Pull-down interfaces (drawer pulls content down)
â”œâ”€â”€ Bottom sheet navigation
â”œâ”€â”€ Floating action buttons
â””â”€â”€ Gesture-based alternatives to top actions
```

---

## 3. Touch vs Click Psychology

### Expectation Differences

| Aspect | Click (Desktop) | Touch (Mobile) |
|--------|-----------------|----------------|
| **Feedback timing** | Can wait 100ms | Expect instant (<50ms) |
| **Visual feedback** | Hover â†’ Click | Immediate tap response |
| **Error tolerance** | Easy retry | Frustrating, feels broken |
| **Precision** | High | Low |
| **Context menu** | Right-click | Long press |
| **Cancel action** | ESC key | Swipe away, outside tap |

### Touch Feedback Requirements

```
Tap â†’ Immediate visual change (< 50ms)
â”œâ”€â”€ Highlight state (background color change)
â”œâ”€â”€ Scale down slightly (0.95-0.98)
â”œâ”€â”€ Ripple effect (Android Material)
â”œâ”€â”€ Haptic feedback for confirmation
â””â”€â”€ Never nothing!

Loading â†’ Show within 100ms
â”œâ”€â”€ If action takes > 100ms
â”œâ”€â”€ Show spinner/progress
â”œâ”€â”€ Disable button (prevent double tap)
â””â”€â”€ Optimistic UI when possible
```

### The "Fat Finger" Problem

```
Problem: Finger occludes target during tap
â”œâ”€â”€ User can't see exactly where they're tapping
â”œâ”€â”€ Visual feedback appears UNDER finger
â””â”€â”€ Increases error rate

Solutions:
â”œâ”€â”€ Show feedback ABOVE touch point (tooltips)
â”œâ”€â”€ Use cursor-like offset for precision tasks
â”œâ”€â”€ Magnification loupe for text selection
â””â”€â”€ Large enough targets that precision doesn't matter
```

---

## 4. Gesture Psychology

### Gesture Discoverability Problem

```
Problem: Gestures are INVISIBLE.
â”œâ”€â”€ User must discover/remember them
â”œâ”€â”€ No hover/visual hint
â”œâ”€â”€ Different mental model than tap
â””â”€â”€ Many users never discover gestures

Solution: Always provide visible alternative
â”œâ”€â”€ Swipe to delete â†’ Also show delete button or menu
â”œâ”€â”€ Pull to refresh â†’ Also show refresh button
â”œâ”€â”€ Pinch to zoom â†’ Also show zoom controls
â””â”€â”€ Gestures as shortcuts, not only way
```

### Common Gesture Conventions

| Gesture | Universal Meaning | Usage |
|---------|-------------------|-------|
| **Tap** | Select, activate | Primary action |
| **Double tap** | Zoom in, like/favorite | Quick action |
| **Long press** | Context menu, selection mode | Secondary options |
| **Swipe horizontal** | Navigation, delete, actions | List actions |
| **Swipe down** | Refresh, dismiss | Pull to refresh |
| **Pinch** | Zoom in/out | Maps, images |
| **Two-finger scroll** | Scroll within scroll | Nested scrolls |

### Gesture Affordance Design

```
Swipe actions need visual hints:

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  â”Œâ”€â”€â”€â”                                  â”‚
â”‚  â”‚ â‰¡ â”‚  Item with hidden actions...   â†’ â”‚ â† Edge hint (partial color)
â”‚  â””â”€â”€â”€â”˜                                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

âœ… Good: Slight color peek at edge suggesting swipe
âœ… Good: Drag handle icon ( â‰¡ ) suggesting reorder
âœ… Good: Onboarding tooltip explaining gesture
âŒ Bad: Hidden gestures with no visual affordance
```

### Platform Gesture Differences

| Gesture | iOS | Android |
|---------|-----|---------|
| **Back** | Edge swipe from left | System back button/gesture |
| **Share** | Action sheet | Share sheet |
| **Context menu** | Long press / Force touch | Long press |
| **Dismiss modal** | Swipe down | Back button or swipe |
| **Delete in list** | Swipe left, tap delete | Swipe left, immediate or undo |

---

## 5. Haptic Feedback Patterns

### Why Haptics Matter

```
Haptics provide:
â”œâ”€â”€ Confirmation without looking
â”œâ”€â”€ Richer, more premium feel
â”œâ”€â”€ Accessibility (blind users)
â”œâ”€â”€ Reduced error rate
â””â”€â”€ Emotional satisfaction

Without haptics:
â”œâ”€â”€ Feels "cheap" or web-like
â”œâ”€â”€ User unsure if action registered
â””â”€â”€ Missed opportunity for delight
```

### iOS Haptic Types

| Type | Intensity | Use Case |
|------|-----------|----------|
| `selection` | Light | Picker scroll, toggle, selection |
| `light` | Light | Minor actions, hover equivalent |
| `medium` | Medium | Standard tap confirmation |
| `heavy` | Strong | Important completed, drop |
| `success` | Pattern | Task completed successfully |
| `warning` | Pattern | Warning, attention needed |
| `error` | Pattern | Error occurred |

### Android Haptic Types

| Type | Use Case |
|------|----------|
| `CLICK` | Standard tap feedback |
| `HEAVY_CLICK` | Important actions |
| `DOUBLE_CLICK` | Confirm actions |
| `TICK` | Scroll/scrub feedback |
| `LONG_PRESS` | Long press activation |
| `REJECT` | Error/invalid action |

### Haptic Usage Guidelines

```
âœ… DO use haptics for:
â”œâ”€â”€ Button taps
â”œâ”€â”€ Toggle switches
â”œâ”€â”€ Picker/slider values
â”œâ”€â”€ Pull to refresh trigger
â”œâ”€â”€ Successful action completion
â”œâ”€â”€ Errors and warnings
â”œâ”€â”€ Swipe action thresholds
â””â”€â”€ Important state changes

âŒ DON'T use haptics for:
â”œâ”€â”€ Every scroll position
â”œâ”€â”€ Every list item
â”œâ”€â”€ Background events
â”œâ”€â”€ Passive displays
â””â”€â”€ Too frequently (haptic fatigue)
```

### Haptic Intensity Mapping

| Action Importance | Haptic Level | Example |
|-------------------|--------------|---------|
| Minor/Browsing | Light / None | Scrolling, hovering |
| Standard Action | Medium / Selection | Tap, toggle |
| Significant Action | Heavy / Success | Complete, confirm |
| Critical/Destructive | Heavy / Warning | Delete, payment |
| Error | Error pattern | Failed action |

---

## 6. Mobile Cognitive Load

### How Mobile Differs from Desktop

| Factor | Desktop | Mobile | Implication |
|--------|---------|--------|-------------|
| **Attention** | Focused sessions | Interrupted constantly | Design for micro-sessions |
| **Context** | Controlled environment | Anywhere, any condition | Handle bad lighting, noise |
| **Multitasking** | Multiple windows | One app visible | Complete task in-app |
| **Input speed** | Fast (keyboard) | Slow (touch typing) | Minimize input, smart defaults |
| **Error recovery** | Easy (undo, back) | Harder (no keyboard shortcuts) | Prevent errors, easy recovery |

### Reducing Mobile Cognitive Load

```
1. ONE PRIMARY ACTION per screen
   â””â”€â”€ Clear what to do next
   
2. PROGRESSIVE DISCLOSURE
   â””â”€â”€ Show only what's needed now
   
3. SMART DEFAULTS
   â””â”€â”€ Pre-fill what you can
   
4. CHUNKING
   â””â”€â”€ Break long forms into steps
   
5. RECOGNITION over RECALL
   â””â”€â”€ Show options, don't make user remember
   
6. CONTEXT PERSISTENCE
   â””â”€â”€ Save state on interrupt/background
```

### Miller's Law for Mobile

```
Desktop: 7Â±2 items in working memory
Mobile: Reduce to 5Â±1 (more distractions)

Navigation: Max 5 tab bar items
Options: Max 5 per menu level
Steps: Max 5 visible steps in progress
```

### Hick's Law for Mobile

```
More choices = slower decisions

Mobile impact: Even worse than desktop
â”œâ”€â”€ Smaller screen = less overview
â”œâ”€â”€ Scrolling required = items forgotten
â”œâ”€â”€ Interruptions = lost context
â””â”€â”€ Decision fatigue faster

Solution: Progressive disclosure
â”œâ”€â”€ Start with 3-5 options
â”œâ”€â”€ "More" for additional
â”œâ”€â”€ Smart ordering (most used first)
â””â”€â”€ Previous selections remembered
```

---

## 7. Touch Accessibility

### Motor Impairment Considerations

```
Users with motor impairments may:
â”œâ”€â”€ Have tremors (need larger targets)
â”œâ”€â”€ Use assistive devices (different input method)
â”œâ”€â”€ Have limited reach (one-handed necessity)
â”œâ”€â”€ Need more time (avoid timeouts)
â””â”€â”€ Make accidental touches (need confirmation)

Design responses:
â”œâ”€â”€ Generous touch targets (48dp+)
â”œâ”€â”€ Adjustable timing for gestures
â”œâ”€â”€ Undo for destructive actions
â”œâ”€â”€ Switch control support
â””â”€â”€ Voice control support
```

### Touch Target Spacing (A11y)

```
WCAG 2.2 Success Criterion 2.5.8:

Touch targets MUST have:
â”œâ”€â”€ Width: â‰¥ 44px
â”œâ”€â”€ Height: â‰¥ 44px
â”œâ”€â”€ Spacing: â‰¥ 8px from adjacent targets

OR the target is:
â”œâ”€â”€ Inline (within text)
â”œâ”€â”€ User-controlled (user can resize)
â”œâ”€â”€ Essential (no alternative design)
```

### Accessible Touch Patterns

| Pattern | Accessible Implementation |
|---------|---------------------------|
| Swipe actions | Provide menu alternative |
| Drag and drop | Provide select + move option |
| Pinch zoom | Provide zoom buttons |
| Force touch | Provide long press alternative |
| Shake gesture | Provide button alternative |

---

## 8. Emotion in Touch

### The Premium Feel

```
What makes touch feel "premium":
â”œâ”€â”€ Instant response (< 50ms)
â”œâ”€â”€ Appropriate haptic feedback
â”œâ”€â”€ Smooth 60fps animations
â”œâ”€â”€ Correct resistance/physics
â”œâ”€â”€ Sound feedback (when appropriate)
â””â”€â”€ Attention to spring physics
```

### Emotional Touch Feedback

| Emotion | Touch Response |
|---------|----------------|
| Success | Haptic success + confetti/check |
| Error | Haptic error + shake animation |
| Warning | Haptic warning + attention color |
| Delight | Unexpected smooth animation |
| Power | Heavy haptic on significant action |

### Trust Building Through Touch

```
Trust signals in touch interactions:
â”œâ”€â”€ Consistent behavior (same action = same response)
â”œâ”€â”€ Reliable feedback (never fails silently)
â”œâ”€â”€ Secure feel for sensitive actions
â”œâ”€â”€ Professional animations (not janky)
â””â”€â”€ No accidental actions (confirmation for destructive)
```

---

## 9. Touch Psychology Checklist

### Before Every Screen

- [ ] **All touch targets â‰¥ 44-48px?**
- [ ] **Primary CTA in thumb zone?**
- [ ] **Destructive actions require confirmation?**
- [ ] **Gesture alternatives exist (visible buttons)?**
- [ ] **Haptic feedback on important actions?**
- [ ] **Immediate visual feedback on tap?**
- [ ] **Loading states for actions > 100ms?**

### Before Release

- [ ] **Tested on smallest supported device?**
- [ ] **Tested one-handed on large phone?**
- [ ] **All gestures have visible alternatives?**
- [ ] **Haptics work correctly (test on device)?**
- [ ] **Touch targets tested with accessibility settings?**
- [ ] **No tiny close buttons or icons?**

---

## 10. Quick Reference Card

### Touch Target Sizes

```
                     iOS        Android     WCAG
Minimum:           44pt       48dp       44px
Recommended:       48pt+      56dp+      -
Spacing:           8pt+       8dp+       8px+
```

### Thumb Zone Actions

```
TOP:      Navigation, settings, back (infrequent)
MIDDLE:   Content, secondary actions
BOTTOM:   Primary CTA, tab bar, FAB (frequent)
```

### Haptic Selection

```
Light:    Selection, toggle, minor
Medium:   Tap, standard action
Heavy:    Confirm, complete, drop
Success:  Task done
Error:    Failed action
Warning:  Attention needed
```

---

> **Remember:** Every touch is a conversation between user and device. Make it feel natural, responsive, and respectful of human fingersâ€”not precise cursor points.

