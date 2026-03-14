# Design Guidelines: The Forum That Ate Itself

## Design Approach

**Reference-Based: Early 2000s Forum Aesthetic (phpBB, vBulletin, IPB era)**

This project requires authentic recreation of 2004-2009 forum design patterns with intentional "cursed" elements. The aesthetic should feel familiar yet slightly off, functional yet petty.

## Core Design Principles

1. **Nostalgic Authenticity**: Embrace table-based layouts, fixed widths, and pixel-perfect borders
2. **Functional Chaos**: Professional forum structure with subtly irrational elements
3. **Information Density**: Pack content like old forums - minimal whitespace, maximum data
4. **Bureaucratic Museum**: The museum section should feel like an institutional archive

## Typography

**Font Stack**: 
- Primary: `Verdana, Geneva, sans-serif` (classic forum font)
- Headings: `Arial, Helvetica, sans-serif`
- Code/Usernames: `'Courier New', monospace`

**Hierarchy**:
- Page titles: 18px, bold
- Thread titles: 14px, bold
- Body text: 11px-12px (small, dense like old forums)
- Meta text (timestamps, post counts): 10px
- User signatures: 9px, italic

## Layout System

**Spacing Units**: Use tight, old-web spacing - Tailwind equivalents: `p-1`, `p-2`, `gap-2`, `mb-3`, `mt-4`

**Container Strategy**:
- Fixed-width main container: `max-w-5xl` (960px equivalent)
- Nested table structures for thread/post layouts
- No modern responsive grids - use `<table>` semantic structure with divs styled as tables

**Forum Index Layout**:
- Sticky header with navigation (Home | Rules | Museum | Mod Panel)
- Breadcrumb trail
- Category tables with alternating row styling
- Right sidebar: "Who's Online", "Forum Stats", "Recent Bans"

**Thread View Layout**:
- Left column (150px): Avatar, username, title/badges, post count, reputation, join date
- Right column (fluid): Post content, signature, timestamp, action buttons
- Horizontal dividers between posts

**Museum Layout**:
- Grid layout for museum index (2-3 columns of "exhibit cards")
- Museum detail: Timeline-style with dated entries, conflicting mod notes stacked
- "Evidence" artifacts in bordered boxes with labels

## Component Library

### Navigation
- Horizontal tab-style navigation bar with pixel borders
- Breadcrumbs: `Home > Category > Thread Title`
- Dropdown "Acting as: [username]" in header corner

### Forum Tables
- Header row with column labels: "Thread", "Author", "Replies", "Last Post"
- Alternating row backgrounds (striped)
- Icons: sticky pin, lock icon, hot thread flame (use Font Awesome)
- Thread status indicators in separate narrow columns

### Post Components
- **Post Container**: Bordered box with header (username, timestamp, post #)
- **User Info Panel**: Vertical stack - avatar (80x80), username, user title, badges, stats
- **Post Body**: Left-aligned text, quoted posts in nested bordered boxes
- **Post Footer**: Edit timestamp, signature separator line, mod actions
- **Action Buttons**: Small inline buttons - Quote, Edit, Report, Delete (mods only)

### Museum Components
- **Exhibit Card**: Bordered container with exhibit number, username, ban date, verdict badge
- **Artifact Box**: Labeled container (`[MOD LOG]`, `[WITNESS STATEMENT]`, `[MISSING SCREENSHOT]`) with monospace timestamps
- **Timeline**: Vertical line with dated nodes, contradictory entries at each point
- **Verdict Badges**: Small pills - "CONTESTED", "UNCLEAR", "OVERTURNED" with border styling

### Forms
- **Create Thread/Reply**: Simple form with text input (thread title) and textarea (body)
- Labels above inputs, helper text below in small font
- Submit buttons: bordered, slightly raised appearance
- No floating labels or modern input designs

### Mod Dashboard
- **Report Queue**: Table format with columns: Type, Reporter, Target, Reason, Actions
- **Quick Action Panel**: Dropdown for action type + text input for reason + severity slider
- **Mod Log**: Chronological list with timestamps, mod name, action type, target

### User Profile (Mod View)
- Two-column: Left = user info card, Right = infraction history table
- Ban button prominent with confirmation dialog
- Reputation modifier controls

## Museum-Specific Design

### Index Page
- Search/filter bar at top: dropdowns for reason, year, mod, severity
- Grid of exhibit cards (2-3 columns)
- Each card shows: exhibit #, username, ban reason snippet, verdict badge, "View Details" link

### Detail Page
- Header: Exhibit title, username in monospace, ban date
- Timeline section: Vertical events (Join, Last Seen, Incident, Ban) with timestamps
- Artifacts section: Stacked boxes with varying backgrounds, each labeled
- Conflicting notes displayed side-by-side for dramatic effect
- Footer: "Return to Museum" link

## Intentional "Cursed" Elements

- Slightly misaligned elements (not broken, just imperfect)
- Inconsistent button sizes across different sections
- Mod notes in slightly different font size/style than user content
- Museum verdict badges with cryptic labels
- "Last edited" timestamps that contradict post content dates
- Signature line breaks at odd points

## Icons

**Font Awesome (CDN)** for:
- Thread status: `fa-thumbtack`, `fa-lock`, `fa-fire`
- User badges: `fa-shield`, `fa-star`, `fa-hammer`
- Actions: `fa-quote-left`, `fa-edit`, `fa-flag`, `fa-trash`
- Museum: `fa-archive`, `fa-gavel`, `fa-scroll`

## Accessibility

- Use semantic HTML tables for tabular data (forum index, mod logs)
- Ensure all form inputs have labels
- Maintain sufficient contrast (old forums had high contrast by default)
- Skip navigation link at top
- ARIA labels for icon-only buttons

## Images

**No hero images.** This is a functional forum application, not a marketing site.

**User Avatars**: 80x80px placeholder avatars (use generic silhouette or initials-based placeholder)
**Museum Artifacts**: Text-only, no actual images. Use `[IMAGE MISSING]` placeholder text in bordered boxes to enhance the "incomplete archive" aesthetic

## Animation

None. Static page loads only, matching old forum behavior.