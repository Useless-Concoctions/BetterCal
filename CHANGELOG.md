# Changelog

All notable changes to **BetterCal** will be documented in this file.

## [0.3.1] - 2026-02-27
### Added
- **Flexible Durations**: Detects duration keywords (e.g., "30m", "1.5h") in commands.
- **Any-Time Scheduling**: Smart goals can now be scheduled for any available slot throughout the 24-hour day, starting from the current time.
- **Enhanced Intelligence**: The "Fully Flexible" indicator explicitly confirms when a goal is using the entire day for potential slotting.

## [Unreleased]
### Added
- **Google Calendar Sync**: Integrated Google Calendar API to allow users to sync their events directly into BetterCal.
- **NextAuth Authentication**: Added support for GitHub and Google authentication.
- **Data Persistence**: Switched to Prisma with SQLite for persistent storage of events and goals.
- **Modular Component Architecture**: Refactored the monolithic `page.tsx` into specialized components:
  - `CalendarHeader`: Navigation, view switching, and sync controls.
  - `MonthView`, `WeekView`, `DayView`, `ScheduleView`: Specific view implementations.
  - `CommandBar`: Smart event creation input.
- **Server Actions**: Implemented Next.js Server Actions for all CRUD operations.
- **Types**: Added NextAuth type augmentation for user IDs.
- **Ultra-Minimal Settings UI**: Simplified the Settings panel into an ultra-minimal, text-and-number-driven vertical list, removing all grids, cards, and icons for a raw, high-end aesthetic.
- **Recurring Goal Support**: Added logic to automatically generate future occurrences for recurring goals. Daily goals now spawn 30 days of "ghost" slots, while weekly goals spawn 4 weeks, with each instance individually scheduled by the intelligence engine.
- **DND Midnight Rollover**: Enhanced Do Not Disturb logic to reliably handle time ranges spanning across midnight (e.g., 22:00 - 07:00).
- **Settings Renaming**: Shortened "Intelligence Settings" to just "Settings" for a cleaner, more direct interface.

### Fixed
- Fixed layout issues and data structure mismatches in the Schedule view.
- Resolved various TypeScript linting errors related to session management.

### Changed
- Refined UI/UX for a more minimalist and responsive feel.
- Improved event conflict resolution logic integration.
- **Event Popover Header Styling**: Tightened the vertical and horizontal spacing in the event popover header to ensure the emoji and title text feel organically connected.
- **Goal Conflict Resolution**: Refactored the `findFirstAvailableSlot` engine to strictly respect DND boundaries and prevent "ghost" goals from being scheduled in the past or disappearing due to recursive logic loops.
- **Time Block Inputs**: Standardized settings inputs to a "bare-input" style that only reveals a border on active focus.

### Changed
- **Add Event Popover**: Updated the overall Add Event interface (accessed via the `+` button or `n`/`g` network shortcuts) to use the new compact `event-popover-card` design instead of a full-screen overlay, matching the Intelligence Settings behavior and automatically positioning beneath the trigger point in the header.
- **Intelligence Goals Refinement**: Updated the "Intelligence Goals" engine to respect user-defined time blocks and DND hours.
- **Anchored Create Event UI**: Replaced the central event creation modal with a contextual, anchored popover that blooms directly from the clicked day or time slot, maintaining direct focus on the calendar context.
- **Anchored Settings UI**: Refactored the Intelligence Settings into a lean, contextual popover anchored to the Settings icon, ensuring consistent navigation behavior.
- **Header Action Layout**: Grouped the Plus and Settings icons together on the right side of the month display for a more balanced and efficient action center.
- **Icon Aesthetic Standard**: Swapped previous icons for a bold 14px **Settings** (gear) and **Plus** icon set with a 3px stroke weight, matching the optical height and minimalist vibe of the navigation text.
- **Event Popover Positioning**: Updated the `.event-popover-card` layout and rendering logic to use absolute positioning. The popover now dynamically calculates its coordinates (`top`/`left`) based on the clicked event chip's bounding box, automatically constraining itself within the viewport bounds.
- **Popover Overlay**: Introduced a transparent `.popover-overlay` to cleanly intercept dismiss clicks without dimming the application background.
- **Command Palette UI**: Streamlined the event command interface by dynamically hiding the preview box when empty, removing the "Command Preview" header label, and surfacing parsed contextual date/time information directly back to the user for explicit confirmation.
- **Event Modal Shortcuts**: Cleaned up the command modal hints by removing outdated 'n New Event' and '# Tag' hints, replacing them with a single '↵ Create Event' confirmation shortcut.
- **Event Details Styles**: Replaced the "command-palette" class on the event modal with dedicated ".event-popover-card" CSS classes for a cleaner, unified aesthetic.
- **Tags & Vibes**: Completely removed the event category system (focus, social, etc.) and ambient UI tinting to maintain a clean, minimal, and predictable aesthetic.
- **Typography Refresh**: Replaced inconsistent default monospace font stacks with Geist Sans and Geist Mono. Specifically refined the command preview information (Date, Duration, Intelligence) to use a clean sans-serif look.
- **Anchored Preview Layout**: Replaced the fluid flexbox layout in the command bar with a stable CSS grid. This anchors property labels (Event, Date, Duration, Intelligence) to fixed horizontal positions, preventing "jumping" or layout shifts while typing.
- **Vertical Layout Stabilization**: Added a minimum height constraint to the command preview container to prevent vertical shifting when additional goal information is displayed.
- **Event Hover Cursors**: Standardized `cursor: pointer` for all event chips and `cursor: alias` for predictive goals in the global stylesheet, removing inline style overrides.


### Removed
- **Hashtag UI & Parsing**: Removed the `#focus` hashtag from event input placeholders and deleted the parsing logic that explicitly stripped hashtags from event titles.
- **Event Animations**: Completely removed all `framer-motion` layout and entrance animations from calendar event chips across Month, Week, Day, and Schedule views to ensure instant, stable rendering during navigation.

### Fixed
- **Smart Pill Display Refinements**: Capitalized frequency and preference labels (e.g., "Daily", "Evening") and hid the start date pill for daily recurring events to reduce UI clutter and user confusion.
- **Improved "everyday" Parsing**: Added support for "everyday" (single word) in the NLP engine to match existing "every day" logic.
- **NLP Parsing Precision**: Fixed several issues with the event creation engine:
  - Added support for explicit duration units like "minutes", "min", "minute", "hours", "hour", and "hr".
  - Implemented recurring frequency detection (e.g., "every day", "daily", "weekly", "every week").
  - Implemented preference detection (e.g., "morning", "afternoon", "evening").
  - Refined title cleanup to remove leading/trailing prepositions ("to", "for", "in", "at", "with", "the") and "Goal:"/"Smart:" prefixes.
  - Suppressed specific time display for fully flexible smart goals unless explicitly provided.
- **Event Preview UI Update**: Refactored the event creation preview layout (using `flex-wrap` and `overflow-wrap: break-word`) to ensure titles wrap across multiple lines instead of being truncated. Added a specific display field for **Frequency**.
- **Navigation Overlay & Positioning**: Fixed two critical layering and layout issues:
  - Increased the header's `z-index` to ensure the menu remains visible and interactive while settings are open.
  - Adjusted the vertical positioning of the "Intelligence Settings" modal to ensure it's not obscured behind the header.
- **Navigation Layout Shifts**: Fixed an issue where the "Prev", "Today", and "Next" navigation buttons would shift horizontally depending on the length of the displayed month's name.
- **Navigation Button Spacing**: Reduced the gap to move the "Prev", "Today", and "Next" buttons much closer to the month display text.
- **Navigation Active States**: Fixed an issue where both 'Calendar' and 'Views' nav links would be highlighted simultaneously. 'Calendar' is now correctly bolded across Month, Week, and Day views, while 'Views' is never bolded, and the specific active view is correctly highlighted inside the Views dropdown.
- **Views Dropdown Behavior**: The 'Views' dropdown now correctly remains open when clicking the view options inside it, but closes automatically when clicking anywhere outside of it.
- **Vertical Alignment**: Fixed mismatched text baselines in the top navigation bar between the BetterCal logo, navigation links, and the month display text by adopting a baseline flex alignment approach.
- **Calendar Layout Overflow**: Added flex constraints (`min-height: 0`) to `.main-stage` and `.calendar-grid` elements to ensure the 6-week fixed calendar grid neatly squishes to fit the viewport height without scrolling or cutting off dates.
- **Parsing Fallbacks**: Prevented visual glitching by correctly handling empty strings in the Command Input instead of rendering "Untitled Event" for "Tomorrow".
- **TypeScript Errors**: Resolved generic implicit `any` type errors across event handler `.onClick()` functions and standard view type assertions (`'day' | 'week' | 'month' | 'schedule'`) in the calendar views.

## [0.2.0] - 2026-02-27
### Added
- **Event Details Overlay**: Clicking an active event across any calendar view now triggers a minimalist information overlay containing Title, Time, Location, and Tag without triggering grid creation actions.
- **Contextual Event Modal**: Clicking any empty calendar cell or timeline grid slot instantly opens an Event Preview overlaid specifically for that contextual date.

### Changed
- **Fixed Calendar Grid Height**: Standardized the Month view grid to strictly calculate 42 days (6 weeks) to completely stop vertical UI layout shifting on month traverse.
- **Streamlined Command Shortcuts**: Simplified system hotkeys to `n` (New Event) and `g` (Smart Goal). Replaced verbose jargon like "Predictive Slotting" with clean labels.
- **Inline View Switching**: Replaced the clunky "Views" dropdown overlay with a buttery smooth inline expansion (Day | Week | Month), which collapses cleanly when clicking top-level nodes like Schedule.

## [0.1.0] - 2026-02-26
### Added
- **Smart Goals Engine**: Predictive ghost slots for recurring objectives. "Penciled-in" sessions that you can confirm or bounce with a single click.
- **Liquid Task Inbox**: A flickable panel on the right for unstructured tasks. Drag tasks onto the calendar to solidify them into time blocks.
- **Subscription Layers**: Added support for layered views (Personal, Work) accessible via the 'Views' dropdown.
- **Superior NLP Parser**: Intelligent event parsing that handles complex structures (e.g., "Meeting Sammy at 7pm for Drinks") without losing context.
- **Ambient Vibe Tinting**: The entire UI dynamically tints its border and logo colors based on your current focus block (Focus Blue, Social Rose, etc.).

### Changed
- **Header Proportions**: Restored the 'BetterCal' logo to a bold 19px weight and refined navigation link spacing for a more distinct visual hierarchy.
- **Predictive Slotting UI**: Redesigned the command bar preview with a high-tech monospace aesthetic and "Vibe Indicator" bars.
- **VOID UI Refinements**: Further reduction of visual noise; tucked subscription toggles into a dropdown to keep the header pristine.

### Fixed
- Calendar grid alignment issues across different viewport sizes.
- Date logic for highlighting "Today" and handling cross-month boundaries.
- Command bar "Live Preview" parsing logic to handle days of the week.

---
*Last updated: 2026-02-28*

