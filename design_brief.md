# Design Brief: Massage-Buchungssystem Dashboard

## 1. App Analysis

### What This App Does
This is an appointment management dashboard for a massage therapy business. It tracks appointment requests (Terminanfragen), manages customer data (Kundendaten), and organizes a service catalog (Leistungskatalog) with pricing, durations, and promotional coupons. The owner needs to see incoming appointment requests at a glance, understand business performance, and quickly add new bookings.

### Who Uses This
A massage therapist or small wellness business owner. They're typically busy between appointments, checking their phone/tablet between clients. They need quick information without complexity - "How many appointments today? Who's next? What's my week looking like?"

### The ONE Thing Users Care About Most
**Today's appointments and upcoming bookings.** When opening the app, they want to immediately see: "Who is coming today and when?" This is the heartbeat of their daily work.

### Primary Actions (IMPORTANT!)
1. **Neue Terminanfrage** → Primary Action Button (add new appointment request)
2. View appointment details
3. Check customer history

---

## 2. What Makes This Design Distinctive

### Visual Identity
A **warm, earthy spa aesthetic** using muted sage greens and warm cream tones. The color palette evokes the calming, nurturing nature of massage therapy - natural, organic, and professional without being clinical. The overall feeling should be like stepping into a well-designed wellness studio: serene, intentional, and welcoming.

### Layout Strategy
**Asymmetric layout with a dominant hero section.** The hero is today's appointments - shown as a prominent timeline/list that takes visual priority. This answers the user's first question: "Who's coming today?"

- **Hero (left 60%)**: Today's appointments timeline - large, visual, immediate
- **Supporting (right 40%)**: Quick stats and upcoming week preview
- **Size variation**: The hero section is significantly larger than secondary elements
- **Typography hierarchy**: Extreme contrast between primary numbers (32px) and labels (12px)
- **Breathing room**: Generous padding around the hero section creates focus

### Unique Element
The **appointment timeline cards** feature a subtle left border in sage green, with the appointment time displayed in a large, bold format (24px), making it easy to scan the day's schedule at a glance. Each card has a gentle hover lift effect that creates a sense of interactivity.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap`
- **Why this font:** Professional yet warm, with excellent readability. The slightly rounded terminals create a friendly, approachable feel perfect for a wellness business. Not as sterile as geometric sans-serifs, not as informal as rounded fonts.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 25% 97%)` | `--background` |
| Main text | `hsl(150 10% 20%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(150 10% 20%)` | `--card-foreground` |
| Borders | `hsl(40 15% 88%)` | `--border` |
| Primary action | `hsl(150 25% 45%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(150 20% 92%)` | `--accent` |
| Muted background | `hsl(40 15% 94%)` | `--muted` |
| Muted text | `hsl(150 5% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(150 40% 45%)` | (component use) |
| Error/negative | `hsl(0 60% 50%)` | `--destructive` |

### Why These Colors
The **warm cream background** (slight yellow undertone) creates a cozy, spa-like atmosphere rather than the coldness of pure white. The **sage green primary** is calming and associated with wellness, nature, and healing. The muted tones avoid visual stress - this is a tool for someone who works in a calming environment.

### Background Treatment
A subtle warm cream (`hsl(40 25% 97%)`) - not pure white. This warmth makes the interface feel welcoming and matches the wellness/spa atmosphere. Cards are pure white to create gentle lift and hierarchy.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile focuses on the immediate: today's appointments dominate the viewport. The hero section (today's schedule) takes the entire first fold, creating urgency and focus. Secondary stats are compact and scrollable below. Visual interest comes from the large time displays and the timeline-style card layout.

### What Users See (Top to Bottom)

**Header:**
- App title "Massage-Buchungssystem" left-aligned, 18px semibold
- Today's date displayed below in muted text (e.g., "Montag, 3. Februar")
- No icons or complex navigation - clean and simple

**Hero Section (The FIRST thing users see):**
- **Section title:** "Heute" in 14px semibold with a small sage dot indicator
- **Today's appointments** as vertical timeline cards
- Each card shows: Time (24px bold), Customer name (16px medium), Service type (14px muted)
- Cards have 4px left border in sage green
- Takes approximately 60% of viewport height
- If no appointments: friendly empty state "Keine Termine heute" with illustration
- **Why this is the hero:** The user's immediate question is always "Who's coming today?"

**Section 2: Quick Stats**
- Horizontal scroll row of 3 compact stat badges (not full cards)
- "Diese Woche: X Termine" | "Offene Anfragen: X" | "Kunden: X"
- Each badge: muted background, small icon, number, label
- Compact: 80px wide each, 48px tall

**Section 3: Kommende Termine**
- "Nächste 7 Tage" section header
- Grouped by day (e.g., "Morgen", "Mittwoch, 5. Feb")
- Compact list format: time + name + service on single line per appointment
- Maximum 10 entries, then "Alle anzeigen" link

**Bottom Navigation / Action:**
- Fixed bottom button: "Neue Terminanfrage" in primary green
- Full width minus padding, 56px height
- Prominent but not overwhelming

### Mobile-Specific Adaptations
- All stats condensed into horizontal scrollable badges
- Chart removed on mobile (not useful on small screens for quick checks)
- Appointment cards are full-width and stack vertically
- Touch targets minimum 44px

### Touch Targets
- Appointment cards: entire card tappable (minimum 64px height)
- Bottom action button: 56px height, full width
- Stat badges: 48px height

### Interactive Elements
- Tapping an appointment card could show customer details in a bottom sheet (future enhancement)
- For now, cards are visual only

---

## 5. Desktop Layout

### Overall Structure
**Two-column asymmetric layout:**
- **Left column (60%)**: Hero section - Today's appointments as a larger, more detailed view
- **Right column (40%)**: Stacked sections - Stats cards, upcoming week, recent requests

The eye flows: Hero appointments (left) → Stats (top right) → Upcoming (bottom right)

Visual interest created through:
- Column width asymmetry (60/40 split)
- Card size variation (hero appointments are larger than stat cards)
- Whitespace separation between left and right columns

### Section Layout

**Top area (full width):**
- Header with title "Massage-Buchungssystem" and date
- Primary action button "Neue Terminanfrage" in header, right-aligned

**Left column (60%):**
- "Heute" section header with sage dot
- Large appointment cards (120px height each)
- Each card shows: Time (28px bold), Customer name (18px), Service (14px), Duration badge
- Maximum 6 visible, then scroll within section
- Empty state if no appointments

**Right column (40%):**
- **Stats row**: 3 cards in a row
  - "Diese Woche" - appointment count
  - "Offene Anfragen" - pending requests
  - "Umsatz (Woche)" - weekly revenue estimate
- **Upcoming section**: "Nächste 7 Tage" with day groupings
- **Recent requests**: "Neue Anfragen" - last 5 appointment requests awaiting confirmation

### What Appears on Hover
- Appointment cards: subtle lift (translateY -2px) and shadow increase
- Stats cards: slight scale (1.02) with transition
- Action button: darker green shade

### Clickable/Interactive Areas
- Appointment cards: show customer contact info on click (modal or side panel - future)
- Stats cards: visual feedback only, no drill-down in v1
- Upcoming appointments: same behavior as today's appointments

---

## 6. Components

### Hero KPI
The hero is **not a number** but a **visual list** - Today's Appointments timeline.

- **Title:** "Heute"
- **Data source:** Terminanfrage app (filtered by wunschtermin = today)
- **Calculation:** Filter records where wunschtermin date = current date
- **Display:** Timeline of cards with appointment details
- **Context shown:** Count badge next to title showing total for today
- **Why this is the hero:** The immediate, practical question every massage therapist asks when opening their dashboard

### Secondary KPIs

**Termine diese Woche**
- Source: Terminanfrage
- Calculation: Count records where wunschtermin is within current week
- Format: number
- Display: Small card with icon, 32px number, label below

**Offene Anfragen**
- Source: Terminanfrage
- Calculation: Count of all records (representing pending/open requests)
- Format: number
- Display: Small card, 32px number, accent color if > 0

**Kunden gesamt**
- Source: Kundendaten
- Calculation: Count of all customer records
- Format: number
- Display: Small card with person icon

### Chart
No chart for this dashboard. The timeline view of appointments IS the primary visualization. A chart would add complexity without value for this use case - the user needs to see WHO and WHEN, not trend lines.

### Lists/Tables

**Heute's Termine (Hero List)**
- Purpose: Show today's schedule at a glance
- Source: Terminanfrage
- Fields shown: wunschtermin (time only), kunde_vorname + kunde_nachname, massageleistung (looked up name), gesamtdauer
- Mobile style: Full-width cards with left border accent
- Desktop style: Larger cards with more padding
- Sort: By wunschtermin ascending (earliest first)
- Limit: All for today (typically 4-8)

**Kommende Termine**
- Purpose: See the upcoming week at a glance
- Source: Terminanfrage
- Fields shown: wunschtermin (date + time), kunde_vorname + kunde_nachname, massageleistung
- Mobile style: Compact list, grouped by day
- Desktop style: Grouped list with day headers
- Sort: By wunschtermin ascending
- Limit: Next 7 days, max 15 entries

**Neue Anfragen (Desktop only)**
- Purpose: Quick view of recent appointment requests
- Source: Terminanfrage
- Fields shown: kunde_vorname + kunde_nachname, wunschtermin, massageleistung
- Desktop style: Compact card list
- Sort: By creation date descending (newest first)
- Limit: 5 entries

### Primary Action Button (REQUIRED!)

- **Label:** "Neue Terminanfrage"
- **Action:** add_record
- **Target app:** Terminanfrage (app_id: 691343895f81839bc1f243fe)
- **What data:** Form with fields:
  - kunde_vorname (Vorname)
  - kunde_nachname (Nachname)
  - kunde_telefon (Telefon)
  - e_mail_adresse (E-Mail)
  - massageleistung (Massageleistung - select from Leistungskatalog)
  - gesamtdauer (Dauer - 30/45/60 min)
  - wunschtermin (Gewünschter Termin - datetime picker)
  - anmerkungen (Anmerkungen - optional textarea)
- **Mobile position:** bottom_fixed
- **Desktop position:** header (right-aligned)
- **Why this action:** The most frequent task is booking a new appointment - either when a customer calls or walks in. One tap to start the booking process.

---

## 7. Visual Details

### Border Radius
Rounded (8px) - soft and welcoming, matching the spa/wellness aesthetic. Not too sharp (clinical) or too pill-shaped (playful).

### Shadows
Subtle - `0 1px 3px rgba(0,0,0,0.08)` for cards at rest, `0 4px 12px rgba(0,0,0,0.1)` on hover. The shadows should feel like gentle elevation, not dramatic depth.

### Spacing
Spacious - generous padding (24px in cards, 32px between sections). Breathing room creates calm, which matches the wellness theme. Don't crowd elements.

### Animations
- **Page load:** Subtle fade-in (200ms) for the entire dashboard
- **Hover effects:** Cards lift slightly (translateY: -2px) with shadow increase, 150ms transition
- **Tap feedback:** Quick scale pulse (0.98) on mobile touch, 100ms

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

:root {
  --background: hsl(40 25% 97%);
  --foreground: hsl(150 10% 20%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(150 10% 20%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(150 10% 20%);
  --primary: hsl(150 25% 45%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(40 15% 94%);
  --secondary-foreground: hsl(150 10% 30%);
  --muted: hsl(40 15% 94%);
  --muted-foreground: hsl(150 5% 50%);
  --accent: hsl(150 20% 92%);
  --accent-foreground: hsl(150 25% 35%);
  --destructive: hsl(0 60% 50%);
  --border: hsl(40 15% 88%);
  --input: hsl(40 15% 88%);
  --ring: hsl(150 25% 45%);
  --radius: 0.5rem;
}

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4 - single column, hero appointments first, fixed bottom button
- [ ] Desktop layout matches Section 5 - 60/40 split, header action button
- [ ] Hero element (Today's appointments) is prominent as described
- [ ] Colors create the warm, spa-like mood described in Section 2
- [ ] Appointment cards have left border accent in sage green
- [ ] Empty states are friendly and helpful
- [ ] Primary action button is always accessible (fixed bottom on mobile, header on desktop)
- [ ] Stats are compact badges on mobile, cards on desktop
- [ ] Upcoming appointments grouped by day
- [ ] Hover effects are subtle and smooth
