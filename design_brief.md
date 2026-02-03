# Design Brief: Massage-Buchungssystem Dashboard

## 1. App Analysis

### What This App Does
This is a massage studio management system for a small wellness business. It tracks appointment requests (Terminanfragen), maintains a catalog of massage services (Leistungskatalog), manages special offers and voucher passes (Leistungskatalog 2), and stores customer data with their appointment history (Kundendaten).

### Who Uses This
A massage therapist or small wellness studio owner who needs to:
- See upcoming appointment requests at a glance
- Track which services are most popular
- Manage their customer base
- Quickly add new bookings

This person is likely not tech-savvy and wants a calm, professional interface that feels like a premium spa experience.

### The ONE Thing Users Care About Most
**Today's and upcoming appointment requests.** When opening the app, they want to immediately see: "Who is coming in next? What service? When?" This is their daily workflow anchor.

### Primary Actions (IMPORTANT!)
1. **Neue Terminanfrage** (New Appointment Request) - Primary Action Button - this is what they do most often
2. View customer details
3. Check service catalog

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design evokes a **premium spa atmosphere** - warm, serene, and grounded. A soft warm cream background with a muted sage green accent creates a natural, calming feeling that mirrors the relaxation of a massage studio. The typography is refined and unhurried, with generous whitespace that lets the content breathe.

### Layout Strategy
- **Hero element**: The next upcoming appointment displayed as a large, prominent card at the top - this dominates the first viewport on mobile and takes the left 2/3 on desktop
- **Asymmetric layout on desktop**: Wide left column (appointments) + narrow right column (quick stats)
- **Visual interest created through**:
  - Size variation: Hero appointment card is 3x larger than stat cards
  - Typography hierarchy: Large 32px appointment time vs 14px labels
  - Card depth variation: Hero card has subtle shadow, stat cards are flat
  - Spacing rhythm: Tight grouping within sections, generous gaps between

### Unique Element
The hero appointment card features a **vertical accent bar** on the left edge in sage green, combined with a subtle gradient background that fades from warm cream to white. This creates a "spa menu" feel - elegant and inviting, like a treatment card at a luxury wellness center.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap`
- **Why this font:** Plus Jakarta Sans has a warm, approachable character with slightly rounded terminals that feels professional yet welcoming - perfect for a wellness business. It's highly readable and works beautifully at both large display sizes and small labels.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(35 30% 97%)` | `--background` |
| Main text | `hsl(150 10% 20%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(150 10% 20%)` | `--card-foreground` |
| Borders | `hsl(35 15% 88%)` | `--border` |
| Primary action | `hsl(150 25% 40%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(150 20% 92%)` | `--accent` |
| Muted background | `hsl(35 15% 94%)` | `--muted` |
| Muted text | `hsl(150 8% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(150 40% 45%)` | (component use) |
| Error/negative | `hsl(0 65% 50%)` | `--destructive` |

### Why These Colors
The warm cream background (`hsl(35 30% 97%)`) creates an inviting, spa-like atmosphere rather than a cold clinical white. The sage green primary (`hsl(150 25% 40%)`) is nature-inspired and calming - perfect for wellness. Together they create a palette that feels organic, professional, and premium without being overly feminine or trendy.

### Background Treatment
The page background is a warm cream (`hsl(35 30% 97%)`) - not pure white. This subtle warmth makes the entire interface feel more inviting and reduces eye strain. Cards use pure white to create subtle contrast and lift off the background.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile is designed as a vertical flow with the hero appointment dominating the first viewport. Visual hierarchy is created through:
- Hero card takes ~50% of initial viewport height
- Secondary stats use a compact horizontal scroll
- Content breathes with generous padding

### What Users See (Top to Bottom)

**Header:**
- Left: App title "Termine" in 24px semibold
- Right: Primary action button "+" icon (sage green, circular)

**Hero Section (The FIRST thing users see):**
- **What**: The next upcoming appointment as a large card
- **Size**: Takes approximately 50% of viewport height (min-height: 200px)
- **Content displayed**:
  - Date and time in large 28px semibold text (e.g., "Heute, 14:30")
  - Customer name in 18px medium
  - Service name in 14px regular, muted color
  - Duration badge (e.g., "60 Min")
- **Styling**:
  - White card with 4px sage green left border
  - Subtle shadow (0 2px 8px rgba(0,0,0,0.06))
  - 24px internal padding
  - Rounded corners (12px)
- **Why this is the hero**: The massage therapist needs to know at a glance who's coming next - this is their most critical daily information

**Section 2: Quick Stats Row**
- Horizontal scrolling row of 3 compact stat cards
- Each card is ~100px wide, inline-flex
- Stats shown:
  1. "Heute" (Today) - count of today's appointments
  2. "Diese Woche" (This Week) - count of week's appointments
  3. "Kunden" (Customers) - total customer count
- Style: Muted background, no shadow, 8px border-radius
- Number in 20px bold, label in 12px muted

**Section 3: Kommende Termine (Upcoming Appointments)**
- Section header: "Kommende Termine" in 16px semibold, with muted subtext "Nächste 7 Tage"
- List of appointment cards (compact version of hero):
  - Each card shows: Time (bold), Customer name, Service name (truncated)
  - 60px height each
  - Subtle divider between items
  - White background, 8px border-radius
- Maximum 5 items shown, then "Alle anzeigen" link

**Section 4: Beliebte Leistungen (Popular Services)**
- Section header: "Beliebte Leistungen" in 16px semibold
- Horizontal scroll of service cards showing:
  - Service name
  - Price
  - Duration
- Card size: 140px x 100px
- Subtle border, no shadow

**Bottom Navigation / Action:**
- Fixed floating action button (FAB) in bottom-right corner
- Sage green background, white "+" icon
- 56px diameter
- Shadow for elevation
- Label: Opens "Neue Terminanfrage" form

### Mobile-Specific Adaptations
- Hero card is full-width with no horizontal margins (edge-to-edge feel)
- Stats row uses horizontal scroll instead of grid
- Appointments list is single-column
- Services use horizontal scroll carousel

### Touch Targets
- All interactive cards minimum 48px touch target
- FAB is 56px for comfortable thumb reach
- Card tap areas extend to full card, not just text

### Interactive Elements
- Tapping hero card opens appointment detail view
- Tapping any appointment card opens that appointment's details
- Tapping customer name navigates to customer profile

---

## 5. Desktop Layout

### Overall Structure
Two-column asymmetric layout:
- **Left column (65%)**: Hero appointment + upcoming appointments list
- **Right column (35%)**: Quick stats stacked vertically + popular services

The eye travels: Hero appointment (top-left) -> Stats (top-right) -> Appointment list (below hero) -> Services (bottom-right)

### Section Layout

**Top area (full width):**
- Header bar with:
  - Left: "Massage-Dashboard" title in 28px semibold
  - Right: Primary action button "Neue Terminanfrage" (text button, not icon)

**Left column content:**
1. **Hero Card** - Next appointment, large format
   - Width: 100% of column
   - Height: ~200px
   - Same content as mobile but with more horizontal space
   - Shows additional info: Customer phone number, notes preview

2. **Upcoming Appointments** - Below hero
   - Section title: "Kommende Termine"
   - Table-like layout with columns: Zeit | Kunde | Leistung | Dauer
   - 10 items visible without scroll
   - Hover: Row highlights with accent background

**Right column content:**
1. **Quick Stats** - Stacked vertically
   - 3 stat cards, each full width of column
   - More detailed than mobile:
     - "Heute": Count + time of first/last appointment
     - "Diese Woche": Count + busiest day
     - "Kunden gesamt": Count + "Neu diesen Monat" substat

2. **Beliebte Leistungen** - Below stats
   - Vertical list of top 5 services
   - Shows: Name, Price, Duration, Booking count (last 30 days)

### What Appears on Hover
- Appointment rows: Background changes to accent color, cursor pointer
- Stat cards: Subtle scale transform (1.02)
- Service items: Show "Details" link on right side

### Clickable/Interactive Areas
- Appointment rows open appointment detail modal
- Customer names in appointments navigate to customer profile
- Stat cards are clickable to filter view (e.g., "Today" shows only today's appointments)
- Services open service detail/edit modal

---

## 6. Components

### Hero KPI
The MOST important element is NOT a number - it's the **next appointment card**.

- **Title:** Nächster Termin
- **Data source:** `terminanfrage` app
- **Calculation:** Filter appointments with `wunschtermin` >= now, sort ascending, take first
- **Display:** Large card with date/time, customer name, service, duration
- **Context shown:** How soon it is ("In 2 Stunden", "Morgen um 10:00")
- **Why this is the hero:** A massage therapist's day revolves around their next client

### Secondary KPIs

**Termine Heute (Appointments Today)**
- Source: `terminanfrage`
- Calculation: Count where `wunschtermin` date = today
- Format: number
- Display: Stat card with count prominently, "Termine" label below

**Termine Diese Woche (Appointments This Week)**
- Source: `terminanfrage`
- Calculation: Count where `wunschtermin` date is within current week
- Format: number
- Display: Stat card

**Kunden Gesamt (Total Customers)**
- Source: `kundendaten`
- Calculation: Total record count
- Format: number
- Display: Stat card

### Chart (if applicable)
No chart in initial view - this is a booking management dashboard, not an analytics dashboard. Keep it simple and action-oriented.

### Lists/Tables

**Kommende Termine (Upcoming Appointments)**
- Purpose: See what's coming up to prepare
- Source: `terminanfrage`
- Fields shown: `wunschtermin` (formatted as date/time), `kunde_vorname` + `kunde_nachname`, `massageleistung` (resolved to name), `gesamtdauer`
- Mobile style: Compact cards in vertical list
- Desktop style: Table with hover states
- Sort: `wunschtermin` ascending
- Limit: 5 on mobile, 10 on desktop

**Beliebte Leistungen (Popular Services)**
- Purpose: Quick reference for available services
- Source: `leistungskatalog`
- Fields shown: `leistungsname`, `preis`, `dauer_minuten`
- Mobile style: Horizontal scroll cards
- Desktop style: Vertical list
- Sort: By name alphabetically
- Limit: 5

### Primary Action Button (REQUIRED!)

- **Label:** "Neue Terminanfrage" (desktop) / "+" icon (mobile FAB)
- **Action:** add_record
- **Target app:** `terminanfrage` (app_id: 691343895f81839bc1f243fe)
- **What data:** Form with fields:
  - `kunde_vorname` (Vorname)
  - `kunde_nachname` (Nachname)
  - `kunde_telefon` (Telefon)
  - `e_mail_adresse` (E-Mail)
  - `wunschtermin` (date/time picker)
  - `massageleistung` (select from Leistungskatalog)
  - `gesamtdauer` (select: 30/45/60 min)
  - `anmerkungen` (optional textarea)
- **Mobile position:** FAB (bottom-right fixed)
- **Desktop position:** Header (right side, prominent button)
- **Why this action:** Adding new bookings is the most frequent task - clients call or message, and the therapist needs to quickly log the appointment

---

## 7. Visual Details

### Border Radius
- Cards: 12px (rounded, soft, spa-like)
- Buttons: 8px (slightly less rounded)
- Badges: 6px (subtle rounding)
- FAB: 50% (full circle)

### Shadows
- Hero card: `0 2px 8px rgba(0,0,0,0.06)` (subtle elevation)
- Regular cards: `0 1px 3px rgba(0,0,0,0.04)` (barely visible lift)
- FAB: `0 4px 12px rgba(0,0,0,0.15)` (prominent elevation)
- Modals: `0 8px 30px rgba(0,0,0,0.12)` (floating feel)

### Spacing
- Spacious - this is a wellness app, it should feel calm
- Page padding: 16px mobile, 32px desktop
- Card padding: 20px mobile, 24px desktop
- Section gaps: 24px mobile, 32px desktop
- Element spacing within cards: 12px

### Animations
- **Page load:** Fade in (200ms ease-out), cards stagger in from bottom (50ms delay each)
- **Hover effects:**
  - Cards: translateY(-2px) + shadow increase
  - Buttons: Background color darken 10%
  - List items: Background change to accent
- **Tap feedback:** Scale down to 0.98 on press, spring back

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

:root {
  --background: hsl(35 30% 97%);
  --foreground: hsl(150 10% 20%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(150 10% 20%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(150 10% 20%);
  --primary: hsl(150 25% 40%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(35 15% 94%);
  --secondary-foreground: hsl(150 10% 20%);
  --muted: hsl(35 15% 94%);
  --muted-foreground: hsl(150 8% 45%);
  --accent: hsl(150 20% 92%);
  --accent-foreground: hsl(150 10% 20%);
  --destructive: hsl(0 65% 50%);
  --border: hsl(35 15% 88%);
  --input: hsl(35 15% 88%);
  --ring: hsl(150 25% 40%);
  --radius: 0.75rem;
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
- [ ] Mobile layout matches Section 4 (single column, hero dominant, FAB)
- [ ] Desktop layout matches Section 5 (two-column asymmetric)
- [ ] Hero element (next appointment card) is prominent with left accent bar
- [ ] Colors create the warm, spa-like mood described in Section 2
- [ ] Warm cream background, not pure white
- [ ] Sage green accents used sparingly but effectively
- [ ] Spacing feels spacious and calm
- [ ] FAB present on mobile for adding new appointments
- [ ] Desktop has text button "Neue Terminanfrage" in header
