# Family Core Values App Architecture

## Goals
- Keep the app static and local-network friendly (no backend required).
- Keep features consistent across pages by centralizing shared logic.
- Preserve fast iteration for family content and UI updates.

## Architecture Overview
- `values-data.js`
  - Content layer (core values, meanings, verses, age examples).
- `fcv-core.js`
  - Shared platform layer:
    - Storage keys
    - Safe localStorage access
    - JSON load/save helpers
    - Cross-device shared sync bootstrap (`/api/state`)
    - Date/week/quarter helpers
    - Value lookup and tone mapping
    - Profile and chore normalization
- `server.js`
  - Local-network app host + shared state API.
- `app.js`
  - Dashboard feature layer:
    - Profiles
    - Parent dashboard
    - Scenario challenges
    - Verse memory mode + games
    - Chore assignment/mapping + completion tracking
    - Chore approval workflow
    - Personalized weekly plans
    - Value-to-chore suggestions
    - Goal milestones by age
    - Reflection journal
- `value.js`
  - Value detail page rendering.
- `chore-chart.js`
  - Chore chart page grouped by child profile.
- `read-aloud.js`
  - Accessibility/UX enhancement layer shared by all pages.

## Data Contracts
- Parent profile (`fcv_parent_profile_v1`)
  - `{ name: string }`
- Profiles (`fcv_profiles_v2`)
  - `{ id: string, name: string, ages: number[], icon: string }`
- Chore mappings (`fcv_chore_mappings_v1`)
  - `{ id: string, chore: string, value: string, assignedProfileId: string }`
- Profile chore completion (`fcv_profile_chore_completion_v2`)
  - `{ [profileId]: { [weekKey]: { [choreId]: boolean } } }`
- Profile chore approval (`fcv_profile_chore_approval_v1`)
  - `{ [profileId]: { [weekKey]: { [choreId]: { status: "pending", requestedAt: string } } } }`
- Profile weekly plans (`fcv_profile_weekly_plans_v1`)
  - `{ [profileId]: { [weekKey]: [{ id: string, text: string, value: string, done: boolean }] } }`
- Profile goal milestones (`fcv_profile_goal_milestones_v1`)
  - `{ [profileId]: { [milestoneId]: boolean } }`

Dashboard and chore chart scripts sanitize/normalize loaded data before rendering and prune stale chore references.

## UI Strategy
- Shared visual system in `styles.css`.
- Dedicated pages for complex flows:
  - `index.html` for dashboard/quick actions
  - `value.html` for single-value deep dives
  - `chore-chart.html` for profile-grouped chores

## Extension Rules
- Add new shared utilities only in `fcv-core.js`.
- Keep page scripts feature-focused and avoid duplicating helpers.
- Reuse storage keys from `window.FCV.STORAGE` only.
- Normalize persisted data before using it in render logic.
- Keep profile-scoped state maps schema-safe and filtered to active profile IDs.

## Local-Network Sync
- Start the app with:
  - `HOST=0.0.0.0 PORT=8080 node server.js`
- Open from any device on your network using:
  - `http://<your-computer-local-ip>:8080`
- Shared family data is stored in `shared-state.json` on the host machine and automatically synced.
