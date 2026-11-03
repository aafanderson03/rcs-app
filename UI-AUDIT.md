# Employee Portal UI Audit

This is the prioritized follow-up list from the all-pages UI review. Work through
one item at a time; keep later items queued until the current item is verified.

## Status

- [x] **1. Make date filtering reliable** — Replace manually typed date strings on
  Applications and Dashboard with date selection, reject invalid ranges, and
  provide a clear-dates action.
- [x] **2. Streamline Dashboard and portal navigation** — Remove Dashboard and
  the standalone Other URLs destination from the Workspace navigation. Move the
  legacy portal link below Help and label it Other URLs.
- [ ] **3. Resolve role-specific Workspace access** — Authenticated navigation
  currently redirects `/workspace/...` to Home; decide whether this route should
  become reachable or be retired.
- [x] **4. Show today's attendance on Home and DTR (demo)** — Show current-day
  punches on Home and open DTR on today, with only punches reached by the
  current time. Use the sample shift for lateness and clearly label the data as
  fictional until a live attendance feed is connected.
- [x] **5. Explain Attendance calendar dates** — Label work/rest days, shift
  schedules, and holidays directly in the full-width calendar. Selecting a date
  opens its punch record in a modal.
- [x] **6. Improve balance layouts across mobile and web** — Use compact cards
  for Leave and Loan balances on all platforms, with a two-column web layout on
  wide screens.
- [x] **7. Improve announcement and Help discovery** — Announcements can be
  searched and filtered by category, cards open the full notice, Help results
  show content previews, and future-dated announcements are not labeled NEW.
- [ ] **8. Add consistent live-data states** — When real employee systems are
  connected, provide loading, error, empty, and last-updated states instead of
  treating sample data as live data.
- [ ] **9. Keep the legacy portal prototype-only until HTTPS is available** —
  Continue to restrict the HTTP endpoint to test use; require HTTPS before any
  real employee credentials or broader release.
- [ ] **10. Improve the compact mobile header** — The company name is truncated
  to one line beside the logo, profile photo, notifications, and theme control.
  Keep the full company identity accessible while reducing visual clipping on
  narrow phones.
- [ ] **11. Clarify long application forms** — Add progress/context and
  field-level validation feedback so users can understand required information
  and correct errors before submitting.

## Audit notes

- **Login:** Company/account selection is clear. Make the HR/system-admin help
  text actionable when a supported contact path is available.
- **Home and Dashboard:** Home is useful but information-dense. Dashboard and
  the standalone Other URLs destination are intentionally omitted from the
  sidebar; the legacy portal is listed as Other URLs under Support, after Help.
- **Applications:** Strong end-to-end request, tracker, and history flow. Long
  forms could benefit from clearer progress and validation feedback.
- **Attendance:** Home and DTR now default to today's sample attendance, showing
  only punches reached by the current time and lateness relative to the sample
  shift. Both surfaces explicitly label the data as fictional. The full-width
  DTR calendar labels work/rest days, schedules, and holidays; selecting a date
  opens its record in a modal.
- **Announcements:** Cards open the full sample notice in a scrollable,
  accessible detail modal. Search and category filters are available; future
  notices are excluded from the NEW badge.
- **Profile, balances, payslip, and employee records:** Clear data presentation;
  leave and loan balances use cards on all platforms, with a two-column layout
  on wide web screens.
- **Help:** Compact searchable article pattern opens full content in a modal;
  search results now include a readable content preview.
- **Legacy portal, Other URLs, and Workspace:** The Support navigation label
  Other URLs points to the legacy portal. The standalone `/other-urls` route is
  no longer linked in the sidebar. The `/workspace/...` route currently
  redirects authenticated users to Home.

Most employee content is currently fictional or local demo data. Keep that
distinction explicit until live employee systems are connected.

## Follow-up audit — November 3, 2026

- **Announcements and Help:** The announcement list now opens full notice
  content, supports title/body search and category filters, and only marks
  notices dated today or in the past as NEW. Help search results now include
  content previews. These changes complete item 7 above. The current source
  contains demo notice text only; original uploaded documents still need to be
  connected from the eventual file/storage source.
- **Responsive improvement completed:** Item 6 replaces leave and loan tables
  with compact cards on all platforms; wide web views show two columns. The
  compact mobile header remains a follow-up.
- **Workspace behavior:** Role-specific workspace screens and links exist, but
  authenticated `/workspace/...` visits are redirected to Home. Decide whether
  to expose those screens or retire the route before investing in them.
- **Legacy portal:** The HTTP destination remains reachable from the prototype.
  Keep it restricted to test use and require HTTPS before real credentials or
  wider release.
- **Live-data states:** No employee-system data source is connected yet. Add
  loading, error, empty, and last-updated states when the live integration is
  introduced; continue labeling current sample content as fictional.
- **Mobile header:** The company name currently uses a single truncated line
  alongside the logo and account controls. Preserve access to the full name
  while refining the layout at narrow phone widths.
- **Applications:** Long request forms can be easier to complete with explicit
  progress/context and field-level validation feedback before submission.
- **Leave and loan balances:** Item 6 is complete. Narrow screens now show
  balance cards with remaining/owed amounts and supporting details; web uses
  the same card design and arranges cards in two columns on wide screens.
