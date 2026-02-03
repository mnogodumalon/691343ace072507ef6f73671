# Design Brief: Massage-Buchungssystem Dashboard

## 1. App Analysis

### What This App Does
This is a massage studio management system that handles appointment bookings, customer data, and service catalog management. The owner uses it to track incoming appointment requests, manage their customer base, and maintain their service offerings including special wellness passes and voucher promotions.

### Who Uses This
A massage therapist or small wellness studio owner who needs a quick overview of their business: pending bookings, upcoming appointments, customer activity, and revenue from their services. They check this dashboard multiple times daily, especially in the morning to plan their day.

### The ONE Thing Users Care About Most
**Today's and upcoming appointment requests** - they need to see which bookings are coming in and need confirmation. This is their daily workflow: check requests, confirm appointments, serve clients.

### Primary Actions (IMPORTANT!)
1. **Neue Terminanfrage ansehen** (View new appointment request) - Primary Action Button - opens the booking request details
2. **Kunden kontaktieren** (Contact customer) - quick access to customer phone/email
3. **Termin bestätigen** (Confirm appointment) - mark a request as confirmed

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design evokes a **spa/wellness atmosphere** with warm, earthy tones. A soft sage green accent combined with warm cream backgrounds creates a calm, professional feeling that reflects the relaxation services offered. The design feels like stepping into a peaceful wellness space - not clinical, not overly playful, but serene and trustworthy.

### Layout Strategy
- **Asymmetric layout** with a dominant left column showcasing today's key metrics and upcoming appointments
- The **hero element** is a large "Offene Anfragen" (Open Requests) counter with subtle animation, immediately telling the owner "you have X requests to handle"
- **Size variation is key**: The hero KPI is 3x larger than secondary metrics
- Secondary KPIs arranged horizontally in a compact row, not stealing attention
- Recent appointment requests list takes most space as it's the working area
- Desktop uses sidebar for quick stats, main area for actionable content

### Unique Element
The **appointment request cards** feature a subtle left border accent in sage green, with the customer name and service type displayed prominently. Each card has a delicate time indicator showing "vor X Stunden" (X hours ago) to create urgency for new requests. The cards have a hover state that slightly lifts them with a soft shadow, inviting interaction.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap`
- **Why this font:** Plus Jakarta Sans has a warm, humanist quality that feels approachable and professional. Its slightly rounded terminals soften the interface without being childish - perfect for a wellness business.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 30% 97%)` | `--background` |
| Main text | `hsl(30 10% 20%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(30 10% 20%)` | `--card-foreground` |
| Borders | `hsl(40 20% 88%)` | `--border` |
| Primary action | `hsl(152 35% 45%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(152 25% 92%)` | `--accent` |
| Muted background | `hsl(40 20% 95%)` | `--muted` |
| Muted text | `hsl(30 10% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(152 45% 40%)` | (component use) |
| Error/negative | `hsl(0 65% 50%)` | `--destructive` |

### Why These Colors
The warm cream background (slight yellow undertone) creates a welcoming, spa-like atmosphere. The sage green primary color represents nature, healing, and relaxation - core values of massage therapy. It's distinctive without being aggressive. The muted text colors ensure readability while maintaining the calm aesthetic.

### Background Treatment
The page background uses a subtle warm cream (`hsl(40 30% 97%)`) - not pure white. Cards are pure white to create gentle layering. This creates depth without harsh contrasts, maintaining the peaceful atmosphere.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
Mobile prioritizes the hero KPI at the top, followed by a horizontally scrollable row of secondary metrics, then the full-height appointment list. The hero takes significant visual space to immediately communicate status.

### What Users See (Top to Bottom)

**Header:**
- App name "Mein Massage-Studio" left-aligned, medium weight
- Small profile icon right (decorative)
- Clean, minimal - just 48px height

**Hero Section (The FIRST thing users see):**
- Large rounded card taking ~35% of viewport
- Central large number (64px, weight 700) showing open appointment requests count
- Label below: "Offene Anfragen"
- Subtle pulsing dot animation if count > 0 to draw attention
- Background uses the accent color (`--accent`) for visual pop
- WHY: This immediately answers "Do I have work to do?" which is the first question every morning

**Section 2: Quick Stats Row**
- Horizontal scroll row with 3 compact stat pills
- "Heute: X Termine" (Today's appointments)
- "Diese Woche: X" (This week total)
- "Kunden: X" (Total customers)
- Each pill: icon + number + label, ~100px wide
- Light border, white background
- Designed to be glanceable, not tap targets

**Section 3: Terminanfragen (Appointment Requests)**
- Section header "Neue Anfragen" with count badge
- Vertically scrollable card list
- Each card shows:
  - Customer name (bold, 16px)
  - Service name (muted, 14px)
  - Requested datetime (muted, 14px)
  - Time since request badge ("vor 2 Std.")
- Left accent border on each card (sage green)
- Tap to expand details

**Bottom Navigation / Action:**
- Fixed bottom button: "Neue Buchung" (sage green, full width minus padding)
- This allows manual booking entry when someone calls
- 56px height, rounded corners

### Mobile-Specific Adaptations
- KPI cards become horizontal scroll instead of grid
- Appointment list is the primary scrollable content
- No chart on mobile - space is better used for actionable list
- Customer details shown on card tap (sheet slides up)

### Touch Targets
- All cards minimum 56px touch height
- Bottom action button 56px height
- Adequate spacing between list items (12px)

### Interactive Elements
- Appointment cards tap to reveal full details (customer contact, notes, service details)
- Long press on appointment card shows quick actions (call, email)

---

## 5. Desktop Layout

### Overall Structure
Two-column asymmetric layout:
- **Left sidebar (280px fixed):** Hero KPI + secondary stats stacked vertically
- **Main content (flexible):** Appointment requests list + optional chart

Eye flow: Hero KPI (top-left) → Secondary stats → Appointment list header → List content

### Section Layout

**Left Sidebar (280px):**
- Hero KPI card at top (large, prominent)
  - Takes ~200px height
  - Large number centered
  - Accent background
- Below: 3 stat cards stacked vertically
  - "Termine heute"
  - "Termine diese Woche"
  - "Kunden gesamt"
- Each stat card: 80px height, white background, subtle border

**Main Content Area:**
- Header row: "Terminanfragen" title + "Neue Buchung" button (right-aligned)
- Below header: Filter/sort options (date range, status)
- Main list: Appointment request cards in a single column
  - Cards are wider, showing more info inline
  - Customer name, service, datetime, contact info all visible
  - Action buttons visible on hover (confirm, contact, decline)
- Optional: Bottom area could show weekly booking chart

### What Appears on Hover
- Appointment cards: subtle lift + shadow + action buttons appear
- Stat cards: slight scale (1.02) with transition
- Action buttons: color intensifies

### Clickable/Interactive Areas
- Appointment cards click to open detail modal with full customer info and booking notes
- Customer name is a link to customer profile (if exists)
- Phone/email icons are direct action links

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Offene Anfragen
- **Data source:** terminanfrage app
- **Calculation:** Count of all records (represents pending requests)
- **Display:** Large centered number (64px mobile, 72px desktop) with label below
- **Context shown:** If > 0, show subtle pulsing indicator; if 0, show checkmark icon
- **Why this is the hero:** This immediately answers the owner's morning question: "Do I have bookings to process?" It drives their daily workflow.

### Secondary KPIs

**Termine heute (Today's Appointments)**
- Source: terminanfrage (filtered by wunschtermin = today)
- Calculation: Count where date matches today
- Format: number
- Display: Compact card with calendar icon

**Termine diese Woche (This Week's Appointments)**
- Source: terminanfrage (filtered by wunschtermin within current week)
- Calculation: Count where date is within current week
- Format: number
- Display: Compact card with calendar-week icon

**Kunden gesamt (Total Customers)**
- Source: kundendaten
- Calculation: Total count of records
- Format: number
- Display: Compact card with users icon

### Chart (if applicable)
- **Type:** Bar chart - shows volume per day, easy to read at a glance
- **Title:** Buchungen diese Woche
- **What question it answers:** "Which days are busiest? Is my week filling up?"
- **Data source:** terminanfrage
- **X-axis:** Day of week (Mo, Di, Mi, Do, Fr, Sa, So)
- **Y-axis:** Number of appointments
- **Mobile simplification:** Hidden on mobile to prioritize list; can be accessed via tap on "Diese Woche" stat

### Lists/Tables

**Terminanfragen (Appointment Requests)**
- Purpose: The working list - users process these requests daily
- Source: terminanfrage app
- Fields shown:
  - kunde_vorname + kunde_nachname (combined as full name)
  - massageleistung (resolved from lookup to show service name)
  - wunschtermin (formatted as "DD.MM.YYYY HH:mm")
  - kunde_telefon (for quick contact)
  - Time since creation (calculated from record metadata)
- Mobile style: Cards with essential info, tap to expand
- Desktop style: Cards with more visible detail, hover for actions
- Sort: By wunschtermin descending (newest first)
- Limit: 10 initially, "Alle anzeigen" button for more

### Primary Action Button (REQUIRED!)

- **Label:** "Neue Buchung"
- **Action:** add_record
- **Target app:** terminanfrage (app_id: 691343895f81839bc1f243fe)
- **What data:** Form with fields:
  - kunde_vorname (Vorname)
  - kunde_nachname (Nachname)
  - kunde_telefon (Telefon)
  - e_mail_adresse (E-Mail)
  - wunschtermin (Gewünschter Termin - datetime picker)
  - gesamtdauer (Dauer - select: 30/45/60 min)
  - massageleistung (Leistung - select from Leistungskatalog)
  - anmerkungen (Anmerkungen - textarea)
- **Mobile position:** bottom_fixed
- **Desktop position:** header (right-aligned in main content header)
- **Why this action:** When customers call to book, the owner needs to quickly create a booking. This is the second most common action after checking requests.

---

## 7. Visual Details

### Border Radius
rounded (8px) - Soft enough to feel friendly, not so round it looks childish

### Shadows
subtle - Cards have `0 1px 3px rgba(0,0,0,0.08)` base, hover adds `0 4px 12px rgba(0,0,0,0.1)`

### Spacing
spacious - Generous padding (24px in cards, 16px gaps) creates breathing room that fits the wellness theme

### Animations
- **Page load:** Stagger fade-in for cards (100ms delay between each)
- **Hover effects:** Cards lift 2px with shadow transition (200ms ease)
- **Tap feedback:** Scale to 0.98 briefly on mobile tap
- **Hero pulse:** Subtle scale animation on the indicator dot if requests > 0

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

:root {
  --background: hsl(40 30% 97%);
  --foreground: hsl(30 10% 20%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(30 10% 20%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(30 10% 20%);
  --primary: hsl(152 35% 45%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(40 20% 95%);
  --secondary-foreground: hsl(30 10% 30%);
  --muted: hsl(40 20% 95%);
  --muted-foreground: hsl(30 10% 45%);
  --accent: hsl(152 25% 92%);
  --accent-foreground: hsl(152 35% 25%);
  --destructive: hsl(0 65% 50%);
  --border: hsl(40 20% 88%);
  --input: hsl(40 20% 88%);
  --ring: hsl(152 35% 45%);
  --radius: 0.5rem;
}

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from Google Fonts URL above
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4 (hero prominent, horizontal stats, vertical list)
- [ ] Desktop layout matches Section 5 (sidebar + main content)
- [ ] Hero element is prominent as described (large number, accent background)
- [ ] Colors create the warm, spa-like mood described
- [ ] Appointment cards have left accent border
- [ ] Hover states implemented on desktop
- [ ] Primary action button positioned correctly (bottom fixed mobile, header desktop)
- [ ] Stagger animation on page load
- [ ] Date formatting uses German locale (DD.MM.YYYY)
