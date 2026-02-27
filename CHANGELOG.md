# Changelog

All notable changes to **BetterCal** will be documented in this file.

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
*Last updated: 2026-02-27*

