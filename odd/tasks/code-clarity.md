# Code clarity refactor

TypeScript-only refactor of Event-Roll (Next.js 16, Prisma 7). No Rust: no migration exists in the repository. Goal: one convention per concern, one place per rule, reviewable slices.

## Specs

- **S1** The user asked, verbatim: «mejora este proyecto termina la migracion a rust que se vea profecional, y no confuso como esta ahora a nivel de codigo».
- **S2** The user chose, verbatim: «Ordenar el TypeScript actual (refactor real)» — audit the code, remove duplication, separate layers (actions / queries / validations / UI), unify conventions and document it, with contained risk and reviewable commits.
- **S3** No Rust is introduced. `find -name '*.rs'` returned 0 files and there is no `Cargo.toml`, no Rust branch and no Rust in history; the "Rust migration" premise is false and is recorded here so it is never re-assumed.
- **S4** Existing behaviour is preserved: every change keeps the current user-visible contract, and `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build` stay green. One declared exception: a deactivated staff token now reads «Tu acceso está inactivo» at every staff action; `undoCheckIn` and `updateGuest` used to show a permission message for the same refusal. `staff-permission-messages.test.ts` pins the new text and the fact that no guest lookup happens. Second declared exception: the dashboard "Invitados" card now counts non-cancelled guests, the same denominator its rate already used, instead of every status (`9fe2de8`). Third change, by explicit user decision (F6): creating and editing both refuse an event date in the past; editing a past event is no longer possible.
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
| T8 | One `ui/dialog` primitive for the four modals (overlay, panel, Escape, backdrop, focus restore) | S1,S2 | 3 workers | `0e42223` |
| T9 | One `useAction` hook for the seven repeated transition/refresh blocks | S1,S2 | 3 workers | `b2490af` |
| T10 | One attendance denominator: `getEventAttendance`, with tests | S1,S2,S5 | 3 workers | `9fe2de8` |
| T11 | Assert `revalidateEvent` invalidates both screens (review finding R3-revalidate-01) | S4,S5 | inline | `c4de62f` |
| T12 | Validate the chair id before the demo guard, restoring the "Silla inválida" contract without any database read | S4,S5 | inline | this slice |
| T13 | Prove the export route refuses a foreign event, an inactive token and a token without permission | S4,S5 | inline | this slice |
| T14 | One shared `ActionResult<Payload>` for the seven action files | S1,S2 | worker | this slice |
| T15 | One `ui/brand` lockup for the six copies | S1,S2 | worker | this slice |
| T16 | One future-date rule in `EventSchema` for create and update (F6) | S1,S4,S5 | inline | this slice |

## Follow-ups

Named, not silently dropped. Each is a separate bounded slice on this branch.


## Log

- **L1** «mejora este proyecto termina la migracion a rust que se vea profecional, y no confuso como esta ahora a nivel de codigo»
- **L2** Repository audit: 0 `.rs` files, no `Cargo.toml`, branches `main` + dependabot only, 138 source files, ~32k LOC TypeScript. Offered the factual correction and four routes; the user selected the TypeScript refactor (S2).
- **L3** Two read-only explorers produced 30 evidence-backed findings (server + UI). Notable defect: `toggleChair` (`src/actions/tables.ts:87`) is the only write without the demo read-only guard, and `demo-guards.test.ts` does not cover it.
- **L4** Deferred, not decided: `updateEvent` accepts a past date while `createEvent` rejects it (`src/actions/events.ts:29` vs `:50`). Recorded as F6.
- **L5** Slice 1 (T1,T3,T4,T5,T6) verified: `pnpm typecheck`, `pnpm lint` and `pnpm test` green at 125 tests; `pnpm build` green. `input-validation.test.ts` now loads the real `resolveStaff` through `importActual` so the shared path is exercised instead of mocked away.
- **L6** Independent verifier (gentle-ai-verify, read-only) reported one blocker and six passes. Blocker: the two sites above changed their refusal text without it being declared. Resolution: the change is kept as the declared S4 exception — one accurate message instead of two misleading ones — and pinned by a new suite. Advisories accepted: the demo guard now precedes id validation (consistent with every other action) and event writes also invalidate the staff screen (superset, no stale UI).
- **L7** An unintended `nanoid` 5.1.16 -> 6.0.2 bump in `package.json` and `pnpm-lock.yaml` was swept into a commit by `git add -A` and removed in `5e93914`; it is unrelated to the refactor.
- **L8** Native review (lineage review-daf322065261a97e, lenses risk/readability/reliability) closed **escalated**, not approved: two severe findings with unknown causality. Adjudication, with evidence:
  - **R1-authz-01 (CRITICAL, claim: export loses the cross-event check) — false positive.** The reviewer asserts the staff branch no longer compares the route event to the session event. `src/app/api/events/[eventId]/export/route.ts:34-36` still returns 403 when `event.id !== user.eventId`, the check precedes `resolveStaff` at `:37`, and the guest query uses the resolved `event.id` at `:45`, never the raw route param. No bypass exists; the diff removed only the `getActiveStaff` call, not the guard.
  - **R1-authz-02 (BLOCKER, guard before id validation) — accepted and declared.** A demo owner sending a malformed chair id now receives the read-only message instead of "Silla inválida". This is the deliberate ordering used by every other action and it stops a visitor from probing chair ids; recorded in L6.
  - **R1-validation-03 (WARNING) — no action.** `toggleScheduleItem` authorizes on staff existence in both trees; the finding itself reports insufficient evidence.
- **L9** Slice 1 closes here. Nothing was pushed: commit, push and merge remain the user's decision.
- **L10** The user said «has lo que falta»; slice 2 delivered F2, F4, F5 and the revalidate assertion (T8-T11). Three concurrent writers on disjoint edit surfaces; the parent merged, fixed nothing silently, and verified: 28 test files / 131 tests, `typecheck`, `lint` and `build` green.
- **L11** Slice boundary: slice 2 is 4 commits and about 1,250 changed lines, so it is a separate review unit — review per commit, not as one hunk. Deliberate behaviour notes for the reviewer: the import dialog now uses the shared panel styling instead of `Card`; three modals gain backdrop-click close; the close button is disabled (not inert) while a dialog is not dismissible.
- **L15** F6 decided by the user: «Rechazar toda fecha pasada, también al editar». The rule moved from `createEvent` into `EventSchema.refine`, so both paths share one message and a future action cannot skip it. Tests added for create-past, update-past and update-future (`events-date.test.ts`), RED first. Accepted cost: a past event can no longer be edited. `e2e/import.spec.ts` already uses 2027-12-31, so the suite is unaffected.
- **L14** F1 and F3 closed the follow-up list. `ActionResult<Payload>` stays deliberately permissive with an explicit comment: a strict discriminated union would still break the twenty client call sites that read `result.error` before narrowing, so that is a contract change, not a rename. The brand lockup is now one component; declared visual normalizations: the staff console mark gains the gradient, border and amber period, and its wordmark goes from text-sm to text-lg.
- **L13** Third native review (lineage review-87fb019f27101004) escalated with two findings that were acted on instead of argued:
  - **R1-002 (BLOCKER, guard before id validation) — fixed.** Validation is local, so it now runs before the demo guard: a malformed id keeps "Silla inválida" while the guard still precedes every database read, and the test asserts no chair lookup happens either way.
  - **R3-exlect-01 (CRITICAL, export authorization unproved) — fixed.** `route.test.ts` now proves 403 for a foreign event, 403 for a deactivated token, 403 without `canExport`, and the allowed path's scoped query.
  - Dismissed with evidence: R1-001/R1-005 (event status is still checked at the two door call sites; the other actions never checked it), R1-003 (the comment claims a handled error, not one literal), R2-001/R2-003/R2-004/R3-safe-id-01 (comments and boundaries, no behaviour), R3-race-01/R3-dead-01/R3-staffmgr-01 (advisory, no test runner for DOM behaviour without adding dependencies).
- **L12** A second native review (lineage review-91ddb399b491a349) also escalated. Its CRITICAL finding R1-001 speculates that `resolveStaff` may not bind the staff row to the session event; it does — `src/lib/queries/staff.ts:25-33` queries on `{ id, eventId, organizationId, active, sessionVersion }` with the session's eventId — and the reviewer itself marks the evidence `insufficient`. Adjudication kept in Engram (`eventroll/review-adjudication`) rather than in this file, because every repo commit creates a new review target and an endless review loop. The remaining work is F1–F6 above, each reviewable on its own; no unverified change is left in the tree.
