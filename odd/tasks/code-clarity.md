# Code clarity refactor

TypeScript-only refactor of Event-Roll (Next.js 16, Prisma 7). No Rust: no migration exists in the repository. Goal: one convention per concern, one place per rule, reviewable slices.

## Specs

- **S1** The user asked, verbatim: «mejora este proyecto termina la migracion a rust que se vea profecional, y no confuso como esta ahora a nivel de codigo».
- **S2** The user chose, verbatim: «Ordenar el TypeScript actual (refactor real)» — audit the code, remove duplication, separate layers (actions / queries / validations / UI), unify conventions and document it, with contained risk and reviewable commits.
- **S3** No Rust is introduced. `find -name '*.rs'` returned 0 files and there is no `Cargo.toml`, no Rust branch and no Rust in history; the "Rust migration" premise is false and is recorded here so it is never re-assumed.
- **S4** Existing behaviour is preserved: every change keeps the current user-visible contract, and `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build` stay green.
- **S5** Every bug found during the audit is fixed with a test that fails before the fix, not folded silently into a rename.

## Tasks

| ID | Task | Specs | Route | Commit |
| --- | --- | --- | --- | --- |
| T1 | Refuse `toggleChair` for the demo organization and cover it with a test | S1,S4,S5 | inline | this slice |
| T2 | One `ActionResult` type in `src/lib/action-result.ts`, adopted by every action file | S1,S2 | inline | _pending_ |
| T3 | Resolve owner/staff authorization once: `resolveStaffAction`, org-scoped row helpers | S1,S2 | inline | _pending_ |
| T4 | `revalidateEvent` helper replacing 20 drifting `revalidatePath` calls | S1,S2 | inline | _pending_ |
| T5 | Shared `IdSchema`; delete unused inferred input types and dead exports | S1,S2 | inline | _pending_ |
| T6 | `ui/dialog.tsx` + shared guest form fields (4 duplicate modals, 2 duplicate forms) | S1,S2 | inline | _pending_ |
| T7 | `ui/brand.tsx` and a `useAction` hook for the 12 repeated transition/error blocks | S1,S2 | inline | _pending_ |
| T8 | Verify: typecheck, lint, unit tests, build | S4 | inline | _pending_ |

## Log

- **L1** «mejora este proyecto termina la migracion a rust que se vea profecional, y no confuso como esta ahora a nivel de codigo»
- **L2** Repository audit: 0 `.rs` files, no `Cargo.toml`, branches `main` + dependabot only, 138 source files, ~32k LOC TypeScript. Offered the factual correction and four routes; the user selected the TypeScript refactor (S2).
- **L3** Two read-only explorers produced 30 evidence-backed findings (server + UI). Notable defect: `toggleChair` (`src/actions/tables.ts:87`) is the only write without the demo read-only guard, and `demo-guards.test.ts` does not cover it.
- **L4** Deferred, not decided: `updateEvent` accepts a past date while `createEvent` rejects it (`src/actions/events.ts:29` vs `:50`). Tightening it may break legitimate edits of past events, so it needs a product decision, not a silent refactor.
