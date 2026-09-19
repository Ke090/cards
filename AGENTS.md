# Development guide

## Project overview
- Initial repository inspection: only README.md (`# cards` / `cards`) existed. There was no package manifest, lockfile, application code, CI, GitHub Actions, environment configuration, database, migration, API, authentication, or developer instruction file. No pre-existing coding conventions could be inferred.
- This project is a free, UI-only collectible gacha web game. No payments, accounts, backend, or secrets are needed.
- Initial implementation stack: TypeScript, Vite, native DOM/CSS; npm with package-lock.json. These are new project decisions, not inherited conventions.
- `src/`: application UI, item catalog, random draw and collection persistence. `public/assets/`: generated artwork. `tests/`: game behavior tests. `scripts/`: development helpers. `.github/workflows/`: CI.
- Collection data lives in browser localStorage, scoped to the origin. Environment variables, database, migrations, API routes and authentication are not used.

## Development commands
The initial implementation supplies these scripts in package.json; keep this list aligned with the actual scripts.
- Install: `npm ci` (Node.js 22.13+ in 22.x, 24.x, or 26+; validated on 22.17.0).
- Dev: `npm run dev`; Windows users can double-click `start-local.bat`.
- Lint: `npm run lint`.
- Typecheck: `npm run typecheck`.
- Test: `npm test`.
- Build: `npm run build`.
- Preview production build: `npm run preview`.
- Migration: none; do not invent migration commands.

## Coding rules
Since the repository had no implementation, these are conventions established for this initial implementation.
- Use strict TypeScript, explicit types at persistence boundaries, and validate data read from localStorage.
- Keep draw probabilities and item metadata in the catalog; new items should not require hardcoded UI slots.
- Keep game logic independent of DOM code for testing. Use semantic HTML, keyboard-operable buttons and reduced-motion support.
- Use camelCase for functions/variables, PascalCase for types and kebab-case for CSS classes/files.
- Treat storage failures as recoverable: continue the game in memory and show a user-facing notice.
- Presentation state belongs in `draw-sequence.ts`, separate from the one-time draw/save. Skipping or opening repeatedly must not grant extra items; cancel pending presentation timers when skipping.
- Audio uses `sound.ts` and Web Audio, initialized only after a user gesture. Respect the persisted mute choice, stop scheduled sounds on mute/page hide, and never let audio failure block the game. Honor reduced-motion settings in presentation timing and CSS.
- Do not add an API or authentication without a corresponding feature requirement.

## Change policy
- Preserve existing behavior unless the task requires changing it. Avoid unrelated refactoring and keep changes minimal.
- Confirm the necessity of new production dependencies; do not add them casually.
- Do not implement uncertain requirements purely by guessing; clarify material ambiguities.
- Never commit secrets, API keys, passwords, local environment files or credentials.
- Consider updating this file when architecture or important development rules change, not for every minor edit.

## Testing policy
- After code changes, run each available check: lint, typecheck, test and build. Only run commands that actually exist; report any missing checks.
- Report failures honestly, including pre-existing failures. Test drawing boundaries, persistence validation and collection behavior.
- Check responsive layout, keyboard interaction, reduced motion and the draw animation in a browser when possible.

## Git workflow
- Never edit or push directly to the default branch (main/master). Work on a feature branch.
- Continue fixes for the same feature on the same branch; do not create a branch for every correction.
- Ordinary commits/pushes to the feature branch are permitted when useful.
- Never force push or perform destructive Git operations without explicit authorization.
- Do not merge until the user has completed local verification.
- Do not create a Pull Request until explicitly instructed by the user, including after local verification.

## Completion criteria
- Implementation is complete only after all available lint, typecheck, test and build checks pass AND the user has completed local verification.
- Until then, report the implementation as ready for local verification, not fully complete. Do not create a completion PR.
