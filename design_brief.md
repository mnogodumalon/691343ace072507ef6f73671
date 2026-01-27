# Design Brief: Massage-Buchungssystem Dashboard

## 1. App Analysis

### What This App Does
This is a booking management system for a massage studio in Germany. It tracks customer data (Kundendaten), manages a service catalog with prices and durations (Leistungskatalog), offers special wellness packages and promotions (Leistungskatalog 2), and handles appointment requests (Terminanfrage) from clients. The studio owner needs to see incoming bookings, track revenue, and manage their daily schedule.

### Who Uses This
A massage therapist or small wellness studio owner who wants a quick overview of their business. They're busy with hands-on work all day, so they need information at a glance - upcoming appointments, how business is doing, and the ability to quickly add new bookings when clients call.

### The ONE Thing Users Care About Most
**Today's appointments and upcoming schedule.** When they open the dashboard, they need to immediately see who's coming in today and what services are booked. This is their working calendar.

### Primary Actions (IMPORTANT!)
1. **Termin hinzufügen** → Primary Action Button (adding a new appointment when a client calls or walks in)
2. View appointment details
3. Check daily/weekly revenue

---

## 2. What Makes This Design Distinctive

### Visual Identity
A warm, calming aesthetic that mirrors the wellness and relaxation industry. The design uses a soft cream-warm base with a refined sage green accent - earthy and grounding, evoking natural spa environments. The overall feel is professional yet inviting, like walking into a well-designed wellness studio. Typography is elegant but readable, creating a sense of premium service without being cold or clinical.

### Layout Strategy
The layout uses an **asymmetric approach** with a dominant hero section showing today's schedule:
- **Hero (60% visual weight)**: Today's appointments displayed as a timeline/list - this is what users need first and most
- **Supporting KPIs (compact row)**: Revenue, total appointments, and customer count shown in a horizontal strip - important but secondary
- **Chart area**: Weekly booking trends to show business health over time
- **Service quick-view**: Recently booked services for context

The hierarchy is clear: Schedule → Numbers → Trends. Size variation is achieved through the hero appointment list being significantly larger than the compact KPI badges.

### Unique Element
**Appointment cards with duration bars**: Each upcoming appointment shows a horizontal progress-style bar indicating the service duration (30/45/60 min), colored in the sage accent. This creates a visual "timeline feel" and helps the therapist quickly gauge how long each session is without reading numbers. The bars use a soft gradient from sage to transparent, creating depth.

---

## 3. Theme & Colors

### Font
- **Family:** Outfit
- **URL:** `https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap`
- **Why this font:** Outfit has a friendly, rounded quality that feels approachable and warm - perfect for wellness. It's modern without being cold, and the weight variations allow for strong hierarchy. The slightly geometric shapes give it a clean, professional edge.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(45 30% 97%)` | `--background` |
| Main text | `hsl(30 10% 20%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(30 10% 20%)` | `--card-foreground` |
| Borders | `hsl(40 20% 88%)` | `--border` |
| Primary action (sage green) | `hsl(152 35% 45%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(152 25% 92%)` | `--accent` |
| Muted background | `hsl(45 20% 94%)` | `--muted` |
| Muted text | `hsl(30 5% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(152 45% 40%)` | (component use) |
| Error/negative | `hsl(0 65% 55%)` | `--destructive` |

### Why These Colors
The warm cream background (`hsl(45 30% 97%)`) creates an inviting, spa-like atmosphere rather than the cold clinical feel of pure white. The sage green primary (`hsl(152 35% 45%)`) is calming and associated with nature, health, and wellness - it's the color of healing herbs and peaceful gardens. The dark brown-gray text (`hsl(30 10% 20%)`) is softer than pure black, maintaining the warm feel throughout.

### Background Treatment
The page background uses a solid warm cream color. Cards float above with pure white backgrounds, creating subtle layering. The warmth of the page background peeks through in gaps and margins, giving the interface a cozy, cohesive feel.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile is designed as a vertical timeline experience. The hero section (today's appointments) dominates the first viewport fold, immediately answering "who's coming in today?" Secondary information is accessed by scrolling. The layout creates visual interest through:
- Large appointment cards with duration indicator bars
- Compact horizontal KPI strip (not full cards)
- Typography-driven hierarchy rather than card-heavy design

### What Users See (Top to Bottom)

**Header:**
- Left: "Massage Dashboard" in Outfit 600 weight, 20px
- Right: Current date formatted as "Mo, 27. Jan" in muted text
- Clean, minimal - no unnecessary icons

**Hero Section (Today's Appointments - 70% of first viewport):**
- Section label: "Heute" in 14px, 500 weight, muted color, uppercase tracking
- If appointments exist: List of appointment cards (max 3-4 visible without scroll)
- Each card shows:
  - Time (left, bold 18px): "14:30"
  - Customer name (16px medium): "Maria Schmidt"
  - Service name (14px muted): "Rückenmassage"
  - Duration bar: Horizontal bar below content, 4px height, rounded, sage green with opacity gradient
  - Duration label: "60 Min" right-aligned, small muted text
- If no appointments: Friendly empty state "Keine Termine heute" with subtle illustration placeholder
- This is the hero because the therapist needs to know their schedule immediately upon opening

**Section 2: KPI Strip (Compact horizontal scroll)**
- Horizontal scrollable row of 3 compact stat badges (not full cards)
- Each badge: Icon + Number + Label stacked vertically
- Badge 1: Calendar icon + "12" + "Diese Woche" (appointments this week)
- Badge 2: Euro icon + "€1.240" + "Umsatz" (revenue this month)
- Badge 3: Users icon + "48" + "Kunden" (total customers)
- Badges are 80px wide, lightly bordered, no heavy shadows

**Section 3: Kommende Termine (Upcoming)**
- Shows next 5 appointments beyond today
- Simpler list format: Date + Time + Name + Service in rows
- Each row is tappable for details

**Bottom Navigation / Action:**
- Fixed bottom button: "Termin hinzufügen" - full width, sage green, 56px height
- Sits in thumb zone for easy one-handed use
- Uses Plus icon + text

### Mobile-Specific Adaptations
- KPIs become horizontal scroll badges instead of grid
- Appointment cards stack vertically with full width
- Chart is hidden on mobile (too complex for small screen, not critical for quick checks)
- Service catalog is accessible via tap on appointment card

### Touch Targets
- All appointment cards: minimum 64px height for comfortable tapping
- Bottom action button: 56px height, full width
- KPI badges: 80px x 80px minimum

### Interactive Elements
- Tap appointment card → expands to show full details (address, notes, contact)
- Tap KPI badge → could navigate to detailed view (future enhancement)

---

## 5. Desktop Layout

### Overall Structure
Two-column asymmetric layout:
- **Left column (65%)**: Hero appointments list + Weekly chart below
- **Right column (35%)**: KPI cards stacked + Recent services list

The eye flows: Left hero (schedule) → Right KPIs (quick stats) → Left chart (trends) → Right services (context)

This creates visual interest through the asymmetry and size contrast between the large schedule area and the narrower stats column.

### Section Layout

**Top Area (Header):**
- Left: "Massage Dashboard" title (Outfit 700, 28px)
- Center: Empty (breathing room)
- Right: "Termin hinzufügen" button (sage green, medium size) + Current date

**Left Column - Main Content:**
1. **Today's Appointments (Hero)**
   - "Heute" section header with count badge "3 Termine"
   - Larger appointment cards than mobile (more horizontal space)
   - Each card: Time block (left), Customer + Service (center), Duration bar + Price (right)
   - Cards have subtle hover effect (slight lift, border color change)

2. **Weekly Overview Chart (Below appointments)**
   - "Diese Woche" header
   - Area chart showing appointments per day (Mon-Sun)
   - Sage green fill with darker stroke
   - Height: ~200px
   - Shows clear trend of busy vs slow days

**Right Column - Supporting Info:**
1. **KPI Cards (Stacked vertically)**
   - 3 cards, full column width
   - Card 1: "Termine diese Woche" - Large number (32px), small label, calendar icon
   - Card 2: "Umsatz (Monat)" - Euro amount, trending indicator if applicable
   - Card 3: "Kunden gesamt" - Total customer count
   - Each card ~100px height, subtle shadow

2. **Beliebte Leistungen (Below KPIs)**
   - "Top Leistungen" header
   - Simple list of most-booked services
   - Shows: Service name + Price + Duration
   - 5 items max, compact rows

### What Appears on Hover
- Appointment cards: Subtle elevation increase, border becomes primary color, shows "Details" text hint
- KPI cards: Light background color shift
- Chart: Tooltip with exact values on hover

### Clickable/Interactive Areas
- Appointment cards → Click to expand inline with full details
- Chart data points → Tooltip with day details

---

## 6. Components

### Hero KPI
The MOST important element: **Today's Appointment List**

- **Title:** Heute
- **Data source:** terminanfrage app
- **Calculation:** Filter records where wunschtermin date equals today, sorted by time ascending
- **Display:** List of appointment cards with time, customer name, service, and duration bar
- **Context shown:** Count badge showing total appointments today
- **Why this is the hero:** A massage therapist starts their day asking "who am I seeing today?" - this immediately answers that question with visual time blocks

### Secondary KPIs

**Termine diese Woche**
- Source: terminanfrage
- Calculation: Count records where wunschtermin is within current week (Monday-Sunday)
- Format: number
- Display: Card with large number, calendar icon

**Monatsumsatz**
- Source: terminanfrage joined with leistungskatalog (via massageleistung lookup)
- Calculation: Sum of preis from linked leistungskatalog records for appointments in current month
- Format: currency (€)
- Display: Card with Euro amount, subtle trend indicator

**Kunden gesamt**
- Source: kundendaten
- Calculation: Count of all records
- Format: number
- Display: Card with number, users icon

### Chart
- **Type:** Area chart - smooth, filled area shows volume at a glance; less clinical than bar charts, fits the wellness theme
- **Title:** Diese Woche
- **What question it answers:** "Are there busy or slow days this week I should know about?"
- **Data source:** terminanfrage
- **X-axis:** Days of current week (Mo, Di, Mi, Do, Fr, Sa, So)
- **Y-axis:** Number of appointments per day
- **Mobile simplification:** Hidden on mobile - schedule list provides enough context

### Lists/Tables

**Heute's Termine (Appointment List - Hero)**
- Purpose: Show today's schedule at a glance
- Source: terminanfrage
- Fields shown: wunschtermin (time), kunde_vorname + kunde_nachname, linked service name from leistungskatalog, duration
- Mobile style: Full-width cards with duration bars
- Desktop style: Horizontal cards with more info visible
- Sort: By wunschtermin ascending (earliest first)
- Limit: All of today's appointments

**Kommende Termine (Upcoming)**
- Purpose: See what's coming up after today
- Source: terminanfrage
- Fields shown: wunschtermin (date + time), customer name, service
- Mobile style: Compact list rows
- Desktop style: Not shown separately (included in main list with date grouping)
- Sort: By wunschtermin ascending
- Limit: Next 7 days

**Top Leistungen (Desktop only)**
- Purpose: Quick reference for popular services
- Source: leistungskatalog
- Fields shown: leistungsname, preis, dauer_minuten
- Desktop style: Simple list with name, price, duration
- Sort: Could be by booking frequency (if tracked) or alphabetical
- Limit: 5 items

### Primary Action Button (REQUIRED!)

- **Label:** "Termin hinzufügen"
- **Action:** add_record
- **Target app:** terminanfrage
- **What data:** Form with fields:
  - kunde_vorname (Vorname)
  - kunde_nachname (Nachname)
  - kunde_telefon (Telefon)
  - e_mail_adresse (E-Mail)
  - wunschtermin (Datum & Uhrzeit)
  - massageleistung (Service dropdown from leistungskatalog)
  - gesamtdauer (Duration selection)
  - anmerkungen (Notizen)
- **Mobile position:** bottom_fixed - always accessible in thumb zone
- **Desktop position:** header - visible at top, prominent but not blocking content
- **Why this action:** When a client calls to book, the therapist needs to quickly add the appointment. This is the most common action taken from the dashboard.

---

## 7. Visual Details

### Border Radius
**Rounded (12px)** - Soft, approachable corners that echo the wellness/comfort theme. Not sharp/clinical, not overly pill-shaped. Cards and buttons both use this radius.

### Shadows
**Subtle** - `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` - Just enough to lift cards off the warm background, creating gentle layering without heavy drop shadows. The effect is "floating" rather than "popping".

### Spacing
**Spacious** - Generous padding inside cards (20px mobile, 24px desktop). Clear gaps between sections (32px). The breathing room supports the calming aesthetic - nothing feels cramped.

### Animations
- **Page load:** Subtle fade-in (200ms) with slight upward movement for cards (staggered 50ms between elements)
- **Hover effects:** Cards lift slightly (translateY -2px) with shadow increase; border color shifts to primary
- **Tap feedback:** Quick scale down (0.98) and back on mobile touches

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  --background: hsl(45 30% 97%);
  --foreground: hsl(30 10% 20%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(30 10% 20%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(30 10% 20%);
  --primary: hsl(152 35% 45%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(45 20% 94%);
  --secondary-foreground: hsl(30 10% 30%);
  --muted: hsl(45 20% 94%);
  --muted-foreground: hsl(30 5% 50%);
  --accent: hsl(152 25% 92%);
  --accent-foreground: hsl(152 35% 30%);
  --destructive: hsl(0 65% 55%);
  --border: hsl(40 20% 88%);
  --input: hsl(40 20% 88%);
  --ring: hsl(152 35% 45%);
  --radius: 0.75rem;

  --font-family: 'Outfit', sans-serif;
}

body {
  font-family: var(--font-family);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Outfit with weights 300-700)
- [ ] All CSS variables copied exactly to index.css
- [ ] Mobile layout matches Section 4 (hero appointments, KPI strip, bottom fixed button)
- [ ] Desktop layout matches Section 5 (two-column asymmetric, chart on left, KPIs on right)
- [ ] Hero element (Today's appointments) is prominent as described
- [ ] Duration bars appear on appointment cards with sage green gradient
- [ ] Colors create the warm, wellness mood described in Section 2
- [ ] Primary action button is fixed at bottom on mobile, in header on desktop
- [ ] Appointment cards have hover effects on desktop
- [ ] Spacing is generous throughout (spacious feel)
- [ ] Border radius is 12px on cards and buttons
