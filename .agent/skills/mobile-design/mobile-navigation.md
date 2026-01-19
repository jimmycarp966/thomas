> **MANDATORIO: Siempre responde en ESPAÑOL**

# Mobile Navigation Reference

> Navigation patterns, deep linking, back handling, and tab/stack/drawer decisions.
> **Navigation is the skeleton of your appâ€”get it wrong and everything feels broken.**

---

## 1. Navigation Selection Decision Tree

```
WHAT TYPE OF APP?
        â”‚
        â”œâ”€â”€ 3-5 top-level sections (equal importance)
        â”‚   â””â”€â”€ âœ… Tab Bar / Bottom Navigation
        â”‚       Examples: Social, E-commerce, Utility
        â”‚
        â”œâ”€â”€ Deep hierarchical content (drill down)
        â”‚   â””â”€â”€ âœ… Stack Navigation
        â”‚       Examples: Settings, Email folders
        â”‚
        â”œâ”€â”€ Many destinations (>5 top-level)
        â”‚   â””â”€â”€ âœ… Drawer Navigation
        â”‚       Examples: Gmail, complex enterprise
        â”‚
        â”œâ”€â”€ Single linear flow
        â”‚   â””â”€â”€ âœ… Stack only (wizard/onboarding)
        â”‚       Examples: Checkout, Setup flow
        â”‚
        â””â”€â”€ Tablet/Foldable
            â””â”€â”€ âœ… Navigation Rail + List-Detail
                Examples: Mail, Notes on iPad
```

---

## 2. Tab Bar Navigation

### When to Use

```
âœ… USE Tab Bar when:
â”œâ”€â”€ 3-5 top-level destinations
â”œâ”€â”€ Destinations are of equal importance
â”œâ”€â”€ User frequently switches between them
â”œâ”€â”€ Each tab has independent navigation stack
â””â”€â”€ App is used in short sessions

âŒ AVOID Tab Bar when:
â”œâ”€â”€ More than 5 destinations
â”œâ”€â”€ Destinations have clear hierarchy
â”œâ”€â”€ Tabs would be used very unequally
â””â”€â”€ Content flows in a sequence
```

### Tab Bar Best Practices

```
iOS Tab Bar:
â”œâ”€â”€ Height: 49pt (83pt with home indicator)
â”œâ”€â”€ Max items: 5
â”œâ”€â”€ Icons: SF Symbols, 25Á—25pt
â”œâ”€â”€ Labels: Always show (accessibility)
â”œâ”€â”€ Active indicator: Tint color

Android Bottom Navigation:
â”œâ”€â”€ Height: 80dp
â”œâ”€â”€ Max items: 5 (3-5 ideal)
â”œâ”€â”€ Icons: Material Symbols, 24dp
â”œâ”€â”€ Labels: Always show
â”œâ”€â”€ Active indicator: Pill shape + filled icon
```

### Tab State Preservation

```
RULE: Each tab maintains its own navigation stack.

User journey:
1. Home tab â†’ Drill into item â†’ Add to cart
2. Switch to Profile tab
3. Switch back to Home tab
â†’ Should return to "Add to cart" screen, NOT home root

Implementation:
â”œâ”€â”€ React Navigation: Each tab has own navigator
â”œâ”€â”€ Flutter: IndexedStack for state preservation
â””â”€â”€ Never reset tab stack on switch
```

---

## 3. Stack Navigation

### Core Concepts

```
Stack metaphor: Cards stacked on top of each other

Push: Add screen on top
Pop: Remove top screen (back)
Replace: Swap current screen
Reset: Clear stack, set new root

Visual: New screen slides in from right (LTR)
Back: Screen slides out to right
```

### Stack Navigation Patterns

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| **Simple Stack** | Linear flow | Push each step |
| **Nested Stack** | Sections with sub-navigation | Stack inside tab |
| **Modal Stack** | Focused tasks | Present modally |
| **Auth Stack** | Login vs Main | Conditional root |

### Back Button Handling

```
iOS:
â”œâ”€â”€ Edge swipe from left (system)
â”œâ”€â”€ Back button in nav bar (optional)
â”œâ”€â”€ Interactive pop gesture
â””â”€â”€ Never override swipe back without good reason

Android:
â”œâ”€â”€ System back button/gesture
â”œâ”€â”€ Up button in toolbar (optional, for drill-down)
â”œâ”€â”€ Predictive back animation (Android 14+)
â””â”€â”€ Must handle back correctly (Activity/Fragment)

Cross-Platform Rule:
â”œâ”€â”€ Back ALWAYS navigates up the stack
â”œâ”€â”€ Never hijack back for other purposes
â”œâ”€â”€ Confirm before discarding unsaved data
â””â”€â”€ Deep links should allow full back traversal
```

---

## 4. Drawer Navigation

### When to Use

```
âœ… USE Drawer when:
â”œâ”€â”€ More than 5 top-level destinations
â”œâ”€â”€ Less frequently accessed destinations
â”œâ”€â”€ Complex app with many features
â”œâ”€â”€ Need for branding/user info in nav
â””â”€â”€ Tablet/large screen with persistent drawer

âŒ AVOID Drawer when:
â”œâ”€â”€ 5 or fewer destinations (use tabs)
â”œâ”€â”€ All destinations equally important
â”œâ”€â”€ Mobile-first simple app
â””â”€â”€ Discoverability is critical (drawer is hidden)
```

### Drawer Patterns

```
Modal Drawer:
â”œâ”€â”€ Opens over content (scrim behind)
â”œâ”€â”€ Swipe to open from edge
â”œâ”€â”€ Hamburger icon ( â˜° ) triggers
â””â”€â”€ Most common on mobile

Permanent Drawer:
â”œâ”€â”€ Always visible (large screens)
â”œâ”€â”€ Content shifts over
â”œâ”€â”€ Good for productivity apps
â””â”€â”€ Tablets, desktops

Navigation Rail (Android):
â”œâ”€â”€ Narrow vertical strip
â”œâ”€â”€ Icons + optional labels
â”œâ”€â”€ For tablets in portrait
â””â”€â”€ 80dp width
```

---

## 5. Modal Navigation

### Modal vs Push

```
PUSH (Stack):                    MODAL:
â”œâ”€â”€ Horizontal slide             â”œâ”€â”€ Vertical slide up (sheet)
â”œâ”€â”€ Part of hierarchy            â”œâ”€â”€ Separate task
â”œâ”€â”€ Back returns                 â”œâ”€â”€ Dismiss (X) returns
â”œâ”€â”€ Same navigation context      â”œâ”€â”€ Own navigation context
â””â”€â”€ "Drill in"                   â””â”€â”€ "Focus on task"

USE MODAL for:
â”œâ”€â”€ Creating new content
â”œâ”€â”€ Settings/preferences
â”œâ”€â”€ Completing a transaction
â”œâ”€â”€ Self-contained workflows
â”œâ”€â”€ Quick actions
```

### Modal Types

| Type | iOS | Android | Use Case |
|------|-----|---------|----------|
| **Sheet** | `.sheet` | Bottom Sheet | Quick tasks |
| **Full Screen** | `.fullScreenCover` | Full Activity | Complex forms |
| **Alert** | Alert | Dialog | Confirmations |
| **Action Sheet** | Action Sheet | Menu/Bottom Sheet | Choose from options |

### Modal Dismissal

```
Users expect to dismiss modals by:
â”œâ”€â”€ Tapping X / Close button
â”œâ”€â”€ Swiping down (sheet)
â”œâ”€â”€ Tapping scrim (non-critical)
â”œâ”€â”€ System back (Android)
â”œâ”€â”€ Hardware back (old Android)

RULE: Only block dismissal for unsaved data.
```

---

## 6. Deep Linking

### Why Deep Links from Day One

```
Deep links enable:
â”œâ”€â”€ Push notification navigation
â”œâ”€â”€ Sharing content
â”œâ”€â”€ Marketing campaigns
â”œâ”€â”€ Spotlight/Search integration
â”œâ”€â”€ Widget navigation
â”œâ”€â”€ External app integration

Building later is HARD:
â”œâ”€â”€ Requires navigation refactor
â”œâ”€â”€ Screen dependencies unclear
â”œâ”€â”€ Parameter passing complex
â””â”€â”€ Always plan deep links at start
```

### URL Structure

```
Scheme://host/path?params

Examples:
â”œâ”€â”€ myapp://product/123
â”œâ”€â”€ https://myapp.com/product/123 (Universal/App Link)
â”œâ”€â”€ myapp://checkout?promo=SAVE20
â”œâ”€â”€ myapp://tab/profile/settings

Hierarchy should match navigation:
â”œâ”€â”€ myapp://home
â”œâ”€â”€ myapp://home/product/123
â”œâ”€â”€ myapp://home/product/123/reviews
â””â”€â”€ URL path = navigation path
```

### Deep Link Navigation Rules

```
1. FULL STACK CONSTRUCTION
   Deep link to myapp://product/123 should:
   â”œâ”€â”€ Put Home at root of stack
   â”œâ”€â”€ Push Product screen on top
   â””â”€â”€ Back button returns to Home

2. AUTHENTICATION AWARENESS
   If deep link requires auth:
   â”œâ”€â”€ Save intended destination
   â”œâ”€â”€ Redirect to login
   â”œâ”€â”€ After login, navigate to destination

3. INVALID LINKS
   If deep link target doesn't exist:
   â”œâ”€â”€ Navigate to fallback (home)
   â”œâ”€â”€ Show error message
   â””â”€â”€ Never crash or blank screen

4. STATEFUL NAVIGATION
   Deep link during active session:
   â”œâ”€â”€ Don't blow away current stack
   â”œâ”€â”€ Push on top OR
   â”œâ”€â”€ Ask user if should navigate away
```

---

## 7. Navigation State Persistence

### What to Persist

```
SHOULD persist:
â”œâ”€â”€ Current tab selection
â”œâ”€â”€ Scroll position in lists
â”œâ”€â”€ Form draft data
â”œâ”€â”€ Recent navigation stack
â””â”€â”€ User preferences

SHOULD NOT persist:
â”œâ”€â”€ Modal states (dialogs)
â”œâ”€â”€ Temporary UI states
â”œâ”€â”€ Stale data (refresh on return)
â”œâ”€â”€ Authentication state (use secure storage)
```

### Implementation

```javascript
// React Navigation - State Persistence
const [isReady, setIsReady] = useState(false);
const [initialState, setInitialState] = useState();

useEffect(() => {
  const loadState = async () => {
    const savedState = await AsyncStorage.getItem('NAV_STATE');
    if (savedState) setInitialState(JSON.parse(savedState));
    setIsReady(true);
  };
  loadState();
}, []);

const handleStateChange = (state) => {
  AsyncStorage.setItem('NAV_STATE', JSON.stringify(state));
};

<NavigationContainer
  initialState={initialState}
  onStateChange={handleStateChange}
>
```

---

## 8. Transition Animations

### Platform Defaults

```
iOS Transitions:
â”œâ”€â”€ Push: Slide from right
â”œâ”€â”€ Modal: Slide from bottom (sheet) or fade
â”œâ”€â”€ Tab switch: Cross-fade
â”œâ”€â”€ Interactive: Swipe to go back

Android Transitions:
â”œâ”€â”€ Push: Fade + slide from right
â”œâ”€â”€ Modal: Slide from bottom
â”œâ”€â”€ Tab switch: Cross-fade or none
â”œâ”€â”€ Shared element: Hero animations
```

### Custom Transitions

```
When to custom:
â”œâ”€â”€ Brand identity requires it
â”œâ”€â”€ Shared element connections
â”œâ”€â”€ Special reveal effects
â””â”€â”€ Keep it subtle, <300ms

When to use default:
â”œâ”€â”€ Most of the time
â”œâ”€â”€ Standard drill-down
â”œâ”€â”€ Platform consistency
â””â”€â”€ Performance critical paths
```

### Shared Element Transitions

```
Connect elements between screens:

Screen A: Product card with image
            â†“ (tap)
Screen B: Product detail with same image (expanded)

Image animates from card position to detail position.

Implementation:
â”œâ”€â”€ React Navigation: shared element library
â”œâ”€â”€ Flutter: Hero widget
â”œâ”€â”€ SwiftUI: matchedGeometryEffect
â””â”€â”€ Compose: Shared element transitions
```

---

## 9. Navigation Anti-Patterns

### âŒ Navigation Sins

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Inconsistent back** | User confused, can't predict | Always pop stack |
| **Hidden navigation** | Features undiscoverable | Visible tabs/drawer trigger |
| **Deep nesting** | User gets lost | Max 3-4 levels, breadcrumbs |
| **Breaking swipe back** | iOS users frustrated | Never override gesture |
| **No deep links** | Can't share, bad notifications | Plan from start |
| **Tab stack reset** | Work lost on switch | Preserve tab states |
| **Modal for primary flow** | Can't back track | Use stack navigation |

### âŒ AI Navigation Mistakes

```
AI tends to:
â”œâ”€â”€ Use modals for everything (wrong)
â”œâ”€â”€ Forget tab state preservation (wrong)
â”œâ”€â”€ Skip deep linking (wrong)
â”œâ”€â”€ Override platform back behavior (wrong)
â”œâ”€â”€ Reset stack on tab switch (wrong)
â””â”€â”€ Ignore predictive back (Android 14+)

RULE: Use platform navigation patterns.
Don't reinvent navigation.
```

---

## 10. Navigation Checklist

### Before Navigation Architecture

- [ ] App type determined (tabs/drawer/stack)
- [ ] Number of top-level destinations counted
- [ ] Deep link URL scheme planned
- [ ] Auth flow integrated with navigation
- [ ] Tablet/large screen considered

### Before Every Screen

- [ ] Can user navigate back? (not dead end)
- [ ] Deep link to this screen planned
- [ ] State preserved on navigate away/back
- [ ] Transition appropriate for relationship
- [ ] Auth required? Handled?

### Before Release

- [ ] All deep links tested
- [ ] Back button works everywhere
- [ ] Tab states preserved correctly
- [ ] Edge swipe back works (iOS)
- [ ] Predictive back works (Android 14+)
- [ ] Universal/App links configured
- [ ] Push notification deep links work

---

> **Remember:** Navigation is invisible when done right. Users shouldn't think about HOW to get somewhereâ€”they just get there. If they notice navigation, something is wrong.

