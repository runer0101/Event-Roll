# Code clarity refactor

TypeScript-only refactor of Event-Roll (Next.js 16, Prisma 7). No Rust: no migration exists in the repository. Goal: one convention per concern, one place per rule, reviewable slices.

## Specs

- **S1** The user asked, verbatim: «mejora este proyecto termina la migracion a rust que se vea profecional, y no confuso como esta ahora a nivel de codigo».
- **S2** The user chose, verbatim: «Ordenar el TypeScript actual (refactor real)» — audit the code, remove duplication, separate layers (actions / queries / validations / UI), unify conventions and document it, with contained risk and reviewable commits.
- **S3** No Rust is introduced. `find -name '*.rs'` returned 0 files and there is no `Cargo.toml`, no Rust branch and no Rust in history; the "Rust migration" premise is false and is recorded here so it is never re-assumed.
- **S4** Existing behaviour is preserved: every change keeps the current user-visible contract, and `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build` stay green. One declared exception: a deactivated staff token now reads «Tu acceso está inactivo» at every staff action; `undoCheckIn` and `updateGuest` used to show a permission message for the same refusal. `staff-permission-messages.test.ts` pins the new text and the fact that no guest lookup happens.
- **S5** Every bug found during the audit is fixed with a test that fails before the fix, not folded silently into a rename.

## Tasks

| ID | Task | Specs | Route | Commit |
| --- | --- | --- | --- | --- |
| T1 | Refuse `toggleChair` for the demo organization and cover it with a test | S1,S4,S5 | inline | `212f46d` |
| T3 | One staff authorization path: `resolveStaff`, adopted by four actions and the export route | S1,S2 | inline | `77aa335` |
| T4 | `revalidateEvent` helper replacing 20 drifting `revalidatePath` calls | S1,S2 | inline | `3413b2b` |
| T5 | Shared `idSchema`; unused input types, dead `FieldError` and uncalled `getSchedulePreview` removed | S1,S2 | inline | `1ca787e` |
| T6 | Split `staff-manager.tsx` (478 lines, two exports, aliased imports) into `staff/staff-card.tsx` and `staff/staff-create-dialog.tsx` | S1,S2 | inline | `090ff69` |
| T7 | Independent verification and hardening: guard-before-read assertion, deactivated-token messages pinned | S4,S5 | inline | this slice |

## Follow-ups

Named, not silently dropped. Each is a separate bounded slice on this branch.

- **F1 — `ActionResult`**: seven files declare their own `{ success?, error? }`. A strict discriminated union is the real fix, but it breaks about twenty client call sites that read `result.error` before narrowing, so it needs its own commit and its own review.
- **F2 — `ui/dialog.tsx`**: four modals repeat the overlay and close markup with no focus trap and inconsistent Escape/backdrop handling (`guest-dialog.tsx`, `staff-create-dialog.tsx`, `guest-import.tsx`, `staff/staff-guest-editor.tsx`).
- **F3 — `ui/brand.tsx`**: the logo lockup is copy-pasted six times with drifting sizes.
- **F4 — `useAction`**: twelve `startTransition` + `setError` + `router.refresh()` blocks repeat the same flow.
- **F5 — Attendance denominator**: `app/dashboard/page.tsx` sums `_count.guests` for one card while the same screen computes its rate from `countedGuests` (CANCELLED excluded), so two denominators share one screen.
- **F6 — Product decision needed**: `updateEvent` accepts a past date while `createEvent` rejects it. Tightening it may break legitimate edits of past events, so it is not a silent refactor.

## Log

- **L1** «mejora este proyecto termina la migracion a rust que se vea profecional, y no confuso como esta ahora a nivel de codigo»
- **L2** Repository audit: 0 `.rs` files, no `Cargo.toml`, branches `main` + dependabot only, 138 source files, ~32k LOC TypeScript. Offered the factual correction and four routes; the user selected the TypeScript refactor (S2).
- **L3** Two read-only explorers produced 30 evidence-backed findings (server + UI). Notable defect: `toggleChair` (`src/actions/tables.ts:87`) is the only write without the demo read-only guard, and `demo-guards.test.ts` does not cover it.
- **L4** Deferred, not decided: `updateEvent` accepts a past date while `createEvent` rejects it (`src/actions/events.ts:29` vs `:50`). Recorded as F6.
- **L5** Slice 1 (T1,T3,T4,T5,T6) verified: `pnpm typecheck`, `pnpm lint` and `pnpm test` green at 125 tests; `pnpm build` green. `input-validation.test.ts` now loads the real `resolveStaff` through `importActual` so the shared path is exercised instead of mocked away.
- **L6** Independent verifier (gentle-ai-verify, read-only) reported one blocker and six passes. Blocker: the two sites above changed their refusal text without it being declared. Resolution: the change is kept as the declared S4 exception — one accurate message instead of two misleading ones — and pinned by a new suite. Advisories accepted: the demo guard now precedes id validation (consistent with every other action) and event writes also invalidate the staff screen (superset, no stale UI).
- **L7** An unintended `nanoid` 5.1.16 -> 6.0.2 bump in `package.json` and `pnpm-lock.yaml` was swept into a commit by `git add -A` and removed in `5e93914`; it is unrelated to the refactor.
- **L8** Slice 1 closes here. The remaining work is F1–F6 above, each reviewable on its own; no unverified change is left in the tree.
