# BetterCal

A premium, localized social calendar and personal schedule designed to bridge the gap between static scheduling, social events, and the fluid reality of daily life.

## Problem

The modern calendar is a rigid container. Life is liquid and deeply connected to what's happening around you. When a single meeting runs over, the rest of your day "breaks". Furthermore, adding external events like sports, finance (earnings calls), or local events requires tedious manual entry. BetterCal turns your schedule into a fluid system with native subscriptions to what matters to you.

## Features

- **SoCal Discovery**: A premium, motion-enhanced view featuring dynamic celestial mechanics and glassmorphic UI. Seamlessly browse and subscribe to global calendars like F1, S&P 500 Earnings, and local events.
- **Liquid Scheduling Engine**: An elastic system that automatically flows predictive "Ghost Goals" around your fixed commitments. If your day shifts, your goals shift with it.
- **Zero-Barrier Local-First**: Jump straight in with a seamless Guest Mode backed by local SQLite (LibSQL) persistence. Experience the full calendar instantly before deciding to sync via NextAuth.
- **Weather-Aware Context**: Open-Meteo integration automatically detects rain or temperature extremes to smartly reschedule `#outdoor` activities.
- **Semantic Intuition**: Automatically infers "Energy Windows"—slotting high-energy objectives (code, gym) in the morning and administrative tasks in the afternoon.
- **Zero-Friction NLP**: A highly polished natural language parser that understands complex intent, durations, and advanced frequencies (e.g., "Read 5x a week for 45m") without clunky menus.
- **Universal Interactivity**: Buttery smooth drag-and-drop fluidity across Month, Week, and Day views with optimistic UI reactivity.
- **Adaptive Aesthetics**: Intelligent text contrast and ultra-minimal icon navigation that adapts to custom, time-of-day UI gradients.


## Stack

- **NLP**: `chrono-node`
- **Frontend**: React 19, Next.js 15, Framer Motion, Lucide.
- **Database**: Local-First SQLite via Prisma 7 and LibSQL.
- **Desktop**: Tauri for a native, high-performance experience.

---

- [Roadmap](./ROADMAP.md)
- [Changelog](./CHANGELOG.md)
- [Security](./SECURITY.md)

Created by Ryan Hanna | [ryanisnota.pro](https://ryanisnota.pro)
