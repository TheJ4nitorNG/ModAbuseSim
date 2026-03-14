# The Forum That Ate Itself

A satirical forum simulator with mod abuse mechanics and a Cancelled User Museum. This is a server-rendered Express + EJS application using SQLite for persistence.

## Overview

This project recreates the aesthetic and mechanics of early 2000s web forums, with added satirical elements around inconsistent moderation and bureaucratic absurdity. Users can browse threads, post replies, report content, and experience the capricious nature of forum moderation.

## Architecture

**Deliberately Non-Standard**: This project uses a different stack than the default React template per explicit user requirements:

- **Backend**: Express.js with EJS templates (no React)
- **Database**: SQLite via better-sqlite3 (not PostgreSQL/Drizzle)
- **Styling**: Custom CSS with 2004-2009 forum aesthetic
- **Rendering**: Server-side only (no client-side framework)

## Key Features

1. **Forum System**: Threads, posts, replies with vintage forum styling
2. **User Switching**: Dropdown to switch between different user roles for testing
3. **Moderation Dashboard**: Mod panel with reports queue and action history
4. **RNG Enforcement**: Moderation actions have random outcomes (warnings may escalate to bans)
5. **Cancelled User Museum**: Auto-generated exhibits for banned users with artifacts
6. **Rules Page**: Including the mysterious classified Rule 4

## Project Structure

```
server/
├── index.ts          # Express app entry point with EJS setup
├── db.ts             # SQLite database schema and queries
├── seed.ts           # Demo data seeding
├── helpers.ts        # RNG mechanics and content generators
├── forum-routes.ts   # All route handlers
├── views/            # EJS templates
│   ├── layout.ejs    # Main layout wrapper
│   ├── index.ejs     # Forum homepage
│   ├── thread.ejs    # Thread view
│   ├── new-thread.ejs
│   ├── rules.ejs
│   ├── museum.ejs
│   ├── museum_detail.ejs
│   ├── mod.ejs       # Moderator dashboard
│   └── user_profile.ejs
└── public/
    ├── styles.css    # Vintage forum CSS
    └── app.js        # Minimal client JS
```

## Database Tables

- `users` - Forum members with roles (user/mod/admin)
- `threads` - Forum threads
- `posts` - Thread replies
- `reports` - User reports on content
- `moderation_actions` - Log of all mod actions
- `bans` - User ban records
- `museum_entries` - Cancelled user exhibits
- `museum_artifacts` - Evidence/quotes for exhibits
- `rules` - Forum rules (editable by mods)

## Routes

### Public
- `GET /` - Forum index
- `GET /thread/:id` - Thread view
- `GET /new-thread` - New thread form
- `POST /new-thread` - Create thread
- `POST /thread/:id/reply` - Post reply
- `POST /report` - Report content
- `GET /rules` - Forum rules
- `GET /museum` - Cancelled User Museum
- `GET /museum/:id` - Museum exhibit detail

### Moderation (requires mod/admin role)
- `GET /mod` - Mod dashboard
- `GET /mod/user/:id` - User profile with mod tools
- `POST /mod/action` - Execute mod action (warn, delete, ban, etc.)

### Utility
- `POST /switch-user` - Switch acting user (for testing)

## RNG Mechanics

Moderation actions are influenced by:
- Base severity (1-5)
- Random swing (-2 to +2)
- Mod "mood" (seeded daily)
- User reputation (low rep = harsher outcomes)

Possible escalations:
- 15% chance a warning becomes a ban
- 10% chance a deletion triggers thread lock
- 5% chance any ban becomes permanent

## Running the App

The app runs on port 5000 via `npm run dev`. The database is automatically initialized and seeded on first run.

## User Roles for Testing

Use the "Acting as" dropdown in the header:
- **Administrator** - Full admin access
- **ModeratorSteve** / **Mod_Karen** - Mod access
- **Various users** - Regular forum members (some banned)

## Design Philosophy

The forum intentionally looks and feels like a phpBB/vBulletin forum from 2004-2009:
- Table-based layouts
- Small font sizes (10-12px)
- Gradient headers
- User info panels with avatars
- Signature lines
- "Cursed" elements like Rule 4 and conflicting mod notes
