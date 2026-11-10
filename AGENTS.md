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
- Drain accepted wallet writes before switching accounts or signing out, reconcile committed rows with later queued operations, and cancel superseded room renders so saved state cannot be replaced by an older view.
- Share pre-game difficulty and timed-mode settings; keep memory dealing and pronunciation exceptions in browser-safe modules with rule tests. Derive consonant pronunciation hints from each written Hebrew cluster in the shared speech prompt so every activity respects dagesh and shin/sin marks regardless of Unicode mark order.
- Use the shared browser-safe Fisher–Yates shuffle for all card and answer dealing; memory has an explicit pictured vocabulary by difficulty, never a duplicate-text fallback when a word lacks a picture.
- Display the companion in a reserved in-flow stage, never as a fixed overlay, so celebrations cannot hide game text.
- Child-code sign-in uses server-only name mappings and HMAC-derived Auth credentials; validate PINs on the server and retain authenticated wallet RLS. Existing accounts may attach a child code only from their own authenticated session to avoid name-based account takeover.
- Remember only successfully authenticated child identities on the current device for returning-account selection; never persist PINs or publish the child account directory.
- Keep the generated Cloud client and brokered session storage intact; an app-owned same-origin fetch bridge forwards only allowlisted Auth, Data and Storage paths using the publishable key and caller bearer, never service-role data access.
- Room and street use a lazily loaded Pixi.js scene with generated bitmap backgrounds and sprites bundled on the same origin; pedestrian crops must retain full heads/feet and transparent backgrounds. Save placement once on drag release, and keep every shop, navigation and purchase control accessible in HTML.
- Parent recovery requires the separate server-held parent code and a validated authenticated child session; credit points atomically with a wallet version increment and audit row, never authorize by hidden keys alone.
- The dormant microphone trial modules are not mounted by the reading route; preserve their complete WAV/authenticated SSE boundary and durable AI access blocks if explicitly reactivated.
- Reading pronunciation is saved in the authenticated child's profile through account settings and loaded into the common speech client; dialect and tav rules stay browser-safe and tested, and the server selects dialect-specific instructions without changing display text.
- Resolve isolated pointed syllables into explicit consonant-plus-vowel sounds before TTS, separate from whole-word guidance, to avoid model guesses about letter names and dialect vowels.
- Resolve traditional letter names through a browser-safe dialect lexicon; apply Israeli pronunciation respellings only to Israeli requests so Litvish kamatz is never changed into cholam.
- Street buildings use accessible HTML hit regions aligned to fixed-ratio local bitmap scenes; extend the street horizontally rather than distorting its canvas to viewport height.
- Persist room transforms in each owned object's wallet JSON; normalize them in a browser-safe tested helper and keep legacy objects at their original size and angle.
- Use pre-generated dialect-specific praise clips for varied completion voices and independent quiet Web Audio chimes for successes; never interrupt listening targets with spoken milestone praise.
- Parent recovery opens from the room balance through a public convenience gate; revealing the form never replaces server-side parent-code authorization.
- Optional signup parent credentials are salted PBKDF2 verifiers in a server-only table; an account-specific verifier supersedes the legacy shared server secret and child sessions cannot overwrite it.
- Speech failures stay silent to the child: the TTS route retries transient model rejections (last with a short dialect-preserving prompt), the browser retries once and caches finished utterances in memory; never surface raw TTS errors as toasts.
- The shopping street shows one fixed-ratio section at a time, fitted to the viewport, with HTML buttons to switch sections, so no section is cut off at the screen edge.
- Keep per-account practice filtering in a browser-safe tested module and apply it to every activity vocabulary; empty pools disable entry and small path pools repeat only eligible items so selections never fall back to unrelated content.
