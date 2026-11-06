<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep word-path movement, answer threshold and card-refresh rules in a pure browser-safe module with unit tests so board geometry and progression stay independently verifiable.
- Share a start/finish completion clock across games and freeze the duration on the final correct answer so exit animations do not inflate reading time.
- Activity points are banked centrally by Shell into the authenticated account wallet; browser mutations serialize optimistic updates with version checks to avoid cross-tab overwrites.
- Share pre-game difficulty and timed-mode settings; keep memory dealing and pronunciation exceptions in browser-safe modules with rule tests. Derive consonant pronunciation hints from each written Hebrew cluster in the shared speech prompt so every activity respects dagesh and shin/sin marks regardless of Unicode mark order.
- Use the shared browser-safe Fisher–Yates shuffle for all card and answer dealing; memory has an explicit pictured vocabulary by difficulty, never a duplicate-text fallback when a word lacks a picture.
- Display the companion in a reserved in-flow stage, never as a fixed overlay, so celebrations cannot hide game text.
- Child-code sign-in uses server-only name mappings and HMAC-derived Auth credentials; validate PINs on the server and retain authenticated wallet RLS. Existing accounts may attach a child code only from their own authenticated session to avoid name-based account takeover.
- Keep the generated Cloud client and brokered session storage intact; an app-owned same-origin fetch bridge forwards only allowlisted Auth, Data and Storage paths using the publishable key and caller bearer, never service-role data access.
- Room and street use a lazily loaded Pixi.js scene with generated bitmap backgrounds and sprites; save placement once on drag release, and keep navigation and purchase controls accessible in HTML.
- Parent recovery requires the separate server-held parent code and a validated authenticated child session; credit points atomically with a wallet version increment and audit row, never authorize by hidden keys alone.
