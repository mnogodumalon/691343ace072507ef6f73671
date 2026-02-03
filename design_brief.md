# Design Brief: Massage-Buchungssystem Dashboard

## 1. App Analysis

### What This App Does
This is a massage booking system for a wellness/massage practice. It manages customer data (Kundendaten), service catalogs with pricing (Leistungskatalog), special packages/promotions (Leistungskatalog 2), and appointment requests (Terminanfrage). The dashboard gives the practice owner a quick overview of their business - upcoming appointments, customer activity, and revenue metrics.

### Who Uses This
A massage therapist or small wellness practice owner. They're not tech-savvy - they want to see at a glance what's happening today, who's coming in, and how business is going. They check this between appointments on their phone or at the front desk on desktop.

### The ONE Thing Users Care About Most
**Today's appointments and upcoming bookings.** When they open the dashboard, they need to immediately see: "Who's coming today? What treatments? When?" This is the heartbeat of their business.

### Primary Actions (IMPORTANT!)
1. **Neuen Termin erstellen** (Create new appointment) → Primary Action Button
   - Most common action: A client calls and wants to book
2. View appointment details
3. Check customer history

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design evokes a **spa atmosphere** - calm, warm, and professional. Instead of clinical whites and blues, we use a warm cream base with a refined sage green accent that feels natural and healing. The typography is elegant yet readable, creating a sense of sophistication without being stuffy. This feels like opening the door to a premium wellness space, not a generic booking system.

### Layout Strategy
- **Hero: Today's Schedule** - A clean timeline/list of today's appointments dominates the view
- **Asymmetric desktop layout** - Wide left column (70%) for appointments, narrow right column (30%) for quick stats and recent activity
- **Visual interest through typography** - The hero section uses large, bold appointment times with lighter customer names creating clear rhythm
- **Card variation** - Hero appointments use full-width cards, while KPIs use compact inline badges

### Unique Element
**The time indicator line** - A subtle horizontal sage line moves through today's appointments showing current time, making it immediately clear which appointments are coming up next. This small detail transforms a static list into a living, breathing schedule.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap`
- **Why this font:** Professional yet warm, with excellent readability. The slightly rounded letterforms feel welcoming and approachable - perfect for a wellness business. Not as cold as Inter, not as playful as Nunito.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 25% 97%)` | `--background` |
| Main text | `hsl(150 10% 20%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(150 10% 20%)` | `--card-foreground` |
| Borders | `hsl(40 15% 88%)` | `--border` |
| Primary action | `hsl(152 35% 45%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(152 25% 92%)` | `--accent` |
| Muted background | `hsl(40 15% 94%)` | `--muted` |
| Muted text | `hsl(150 5% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(152 45% 42%)` | (component use) |
| Error/negative | `hsl(0 65% 55%)` | `--destructive` |

### Why These Colors
The warm cream background (`hsl(40 25% 97%)`) creates an inviting, spa-like base that's softer than pure white. The sage green primary (`hsl(152 35% 45%)`) is calming and associated with health/wellness without being clinical. Together they evoke natural materials like bamboo and eucalyptus - the sensory world of massage therapy.

### Background Treatment
The page background uses a very subtle warm cream tone. Cards are pure white, creating gentle depth without harsh shadows. This layering gives the interface a soft, tactile quality.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
- Hero (today's schedule) takes the entire first viewport
- Single-column vertical flow for everything
- Large touch targets for appointment cards (min 72px height)
- KPIs condensed into a horizontal scrollable row below hero

### What Users See (Top to Bottom)

**Header:**
- App title "Termine" in 24px semibold, left-aligned
- Today's date below in muted text (14px)
- No navigation clutter

**Hero Section (The FIRST thing users see):**
- Full-width section titled "Heute" with appointment count badge
- Takes approximately 70% of viewport height
- Each appointment is a card showing:
  - Time (18px bold, sage green)
  - Customer name (16px semibold)
  - Treatment name (14px regular, muted)
  - Duration badge (e.g., "60 Min")
- If no appointments today, show a calming illustration with "Keine Termine heute"
- Current time indicator line (2px sage) shows progress through the day

**Section 2: Quick Stats Row**
- Horizontal scroll of 3 compact stat cards (fit 2.5 on screen to indicate scroll)
- Stats: "Diese Woche" (appointments this week), "Kunden gesamt", "Anfragen offen"
- Each card: Icon + number (24px bold) + label (12px muted)
- Background: white cards with subtle shadow

**Section 3: Kommende Termine**
- "Nächste 7 Tage" section
- Grouped by day with date headers
- Same card style as hero but slightly smaller
- Maximum 10 appointments shown, then "Alle anzeigen" link

**Bottom Navigation / Action:**
- Fixed bottom action button: "Termin erstellen" (sage green, full-width with 16px margin)
- 56px height, rounded corners (12px)
- White text, subtle shadow

### Mobile-Specific Adaptations
- Appointments are full-width cards (no multi-column)
- Stats become horizontal scroll instead of grid
- Larger touch targets (min 44px for interactive elements)

### Touch Targets
- All appointment cards: min 72px height
- Action button: 56px height
- Stat cards: min 80px width

### Interactive Elements
- Tap appointment card → Slide-up sheet with full details (customer info, treatment description, price)
- Long-press appointment → Quick actions menu (call customer, cancel, reschedule)

---

## 5. Desktop Layout

### Overall Structure
- Max-width container: 1400px, centered
- Two-column asymmetric layout: 70% left / 30% right
- Left column: Today's schedule + upcoming appointments
- Right column: Stats cards + recent activity feed
- Generous whitespace (32px gap between columns, 24px internal padding)

### Section Layout

**Top Area (Header):**
- Left: "Termine" title (32px semibold) + today's date
- Right: Primary action button "Neuen Termin erstellen"
- Full-width, 80px height with bottom border

**Left Column (Main Content - 70%):**

*Today's Schedule (Hero):*
- Section header: "Heute, [Date]" with appointment count badge
- Timeline view with time markers on left (08:00, 09:00, etc.)
- Appointment blocks positioned by time, showing:
  - Customer name (18px semibold)
  - Treatment (14px regular)
  - Duration & price (14px muted)
- Current time indicator line spans full width
- Empty slots shown as subtle dashed outlines

*Upcoming Section:*
- "Kommende Termine" header
- List of next 14 days' appointments
- Grouped by date with sticky date headers
- More compact cards than today's hero section

**Right Column (Supporting - 30%):**

*Stats Cards (Top):*
- 2x2 grid of metric cards:
  - "Termine diese Woche" (count)
  - "Offene Anfragen" (count, with warning color if >0)
  - "Kunden gesamt" (count)
  - "Umsatz (Monat)" (calculated from appointments × prices)
- Each card: 120px height, icon top-left, number large, label small

*Recent Activity (Below stats):*
- "Letzte Aktivitäten" header
- Timeline of recent bookings/changes
- Shows: Time ago + Customer name + Action (e.g., "Neue Anfrage", "Termin bestätigt")
- Max 5 items, then "Alle anzeigen" link

### What Appears on Hover
- Appointment cards: Slight elevation increase + "Details anzeigen" text appears
- Stat cards: Subtle scale (1.02) + pointer cursor
- Action button: Darker shade of primary color

### Clickable/Interactive Areas
- Click appointment → Right panel slides in with full details
- Click stat card → Filter view to show related data (e.g., click "Offene Anfragen" to show only pending requests)

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Heute (with date)
- **Data source:** Terminanfrage app, filtered by wunschtermin = today
- **Calculation:** Count of today's appointments, displayed as appointment list
- **Display:** Timeline view with appointment cards showing time, customer name, treatment
- **Context shown:** Current time indicator, remaining appointments count
- **Why this is the hero:** The massage therapist needs to know who's coming TODAY - this is what drives their entire day

### Secondary KPIs

**Termine diese Woche**
- Source: Terminanfrage
- Calculation: Count where wunschtermin is within current week
- Format: number
- Display: Stat card with calendar icon

**Offene Anfragen**
- Source: Terminanfrage (could also track status if available, otherwise show recent unconfirmed)
- Calculation: Count of recent requests (last 7 days)
- Format: number with warning styling if > 5
- Display: Stat card with inbox icon

**Kunden gesamt**
- Source: Kundendaten
- Calculation: Total count
- Format: number
- Display: Stat card with users icon

**Umsatz (Monat)**
- Source: Terminanfrage joined with Leistungskatalog
- Calculation: Sum of prices for this month's appointments
- Format: currency (EUR)
- Display: Stat card with euro icon

### Chart (if applicable)
- **Type:** None for initial version - the timeline view is more valuable than charts for this use case
- **Rationale:** A massage therapist doesn't need trend analysis on their phone - they need to see appointments. Charts would add complexity without clear value.

### Lists/Tables

**Today's Appointments (Hero)**
- Purpose: Show exactly who's coming today and when
- Source: Terminanfrage filtered by today
- Fields shown: wunschtermin (time), kunde_vorname + kunde_nachname, massageleistung (resolved to name), gesamtdauer
- Mobile style: Full-width cards in vertical list
- Desktop style: Timeline blocks
- Sort: By wunschtermin ascending
- Limit: All of today's (typically <15)

**Upcoming Appointments**
- Purpose: Plan ahead for the next week
- Source: Terminanfrage filtered by next 7 days
- Fields shown: Date header + same as above
- Mobile style: Grouped list with date headers
- Desktop style: Same, in left column below hero
- Sort: By wunschtermin ascending
- Limit: 20 appointments

**Recent Activity (Desktop only)**
- Purpose: See latest booking activity
- Source: Terminanfrage sorted by createdat
- Fields shown: Time ago, customer name, action type
- Desktop style: Compact timeline in right column
- Sort: By createdat descending
- Limit: 5 items

### Primary Action Button (REQUIRED!)

- **Label:** "Termin erstellen" (mobile) / "Neuen Termin erstellen" (desktop)
- **Action:** Opens a modal/sheet to create new Terminanfrage
- **Target app:** Terminanfrage
- **What data:**
  - kunde_vorname (text)
  - kunde_nachname (text)
  - kunde_telefon (tel)
  - e_mail_adresse (email)
  - wunschtermin (datetime picker)
  - massageleistung (select from Leistungskatalog)
  - gesamtdauer (select: 30/45/60 min)
  - anmerkungen (textarea, optional)
- **Mobile position:** bottom_fixed
- **Desktop position:** header (top right)
- **Why this action:** When a client calls to book, the therapist needs to capture this immediately. This is the most frequent action in their workflow.

---

## 7. Visual Details

### Border Radius
- rounded (8px) for cards
- pill (24px) for badges and buttons

### Shadows
- subtle - Cards have `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)`
- elevated on hover - `0 4px 12px rgba(0,0,0,0.08)`

### Spacing
- spacious - 24px padding inside cards, 16px gap between cards, 32px section margins

### Animations
- **Page load:** Subtle fade-in (200ms) for content, stagger for appointment cards (50ms delay each)
- **Hover effects:** Scale 1.01 + elevated shadow for cards (150ms ease)
- **Tap feedback:** Scale 0.98 on press (100ms)

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(40 25% 97%);
  --foreground: hsl(150 10% 20%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(150 10% 20%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(150 10% 20%);
  --primary: hsl(152 35% 45%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(40 15% 94%);
  --secondary-foreground: hsl(150 10% 25%);
  --muted: hsl(40 15% 94%);
  --muted-foreground: hsl(150 5% 45%);
  --accent: hsl(152 25% 92%);
  --accent-foreground: hsl(152 35% 30%);
  --destructive: hsl(0 65% 55%);
  --border: hsl(40 15% 88%);
  --input: hsl(40 15% 88%);
  --ring: hsl(152 35% 45%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4 (hero schedule, stats row, upcoming list, fixed bottom button)
- [ ] Desktop layout matches Section 5 (70/30 split, timeline view, stats sidebar)
- [ ] Hero element is prominent as described (today's appointments dominate)
- [ ] Colors create the spa-like mood described in Section 2 (warm cream + sage green)
- [ ] Primary action button is visible and accessible (bottom fixed on mobile, header on desktop)
- [ ] Current time indicator line appears in today's schedule
- [ ] Appointment cards show time, customer name, treatment, duration
- [ ] Data fetched from Terminanfrage, Leistungskatalog, and Kundendaten
