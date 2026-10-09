# Al-Furqan improvement plan and delivery checklist

Repository for later push: https://github.com/crynxmartinez/alfurqan

Scope: the ECC audit, teacher self-service without approval, readable grade reports, sorting, and printing. Public grade lookup stays public. Grades remain numeric; no letter-grade scale has been invented.

## Implemented

- [x] Teacher subject creation assigns the logged-in teacher; no call to the admin-only teacher directory.
- [x] Subject changes and grade entry require ownership; students can be edited by their creator or a teacher teaching their enrolled class. School-wide archival stays admin-only. Teachers can remove enrollments from their classes and archive their own subjects/items without approval.
- [x] Teachers can create a class, create a subject, create-and-enroll a student, enroll an existing student, and enter grades.
- [x] Check Grades has a visible Print / Save as PDF action, disabled until records are ready.
- [x] Name, numeric student ID, and numeric grade headers toggle ascending/descending sorting in both report views. Ungraded rows stay last.
- [x] Explicit paper colors inside dark-mode pages, shared screen/print grade-sheet component, landscape pages, repeated table headers and bounded column groups.
- [x] Report metadata includes class, year, subject/teacher when applicable, and generation date. Reports are labelled provisional because there is no school-approved finalization workflow.
- [x] Ungraded is null, not zero; ungraded subjects are excluded from averages; recorded zeros count.
- [x] Saves show status, retain failed drafts, retry, serialize changes per cell, and detect changes from another session.
- [x] APIs validate scores, maximums, calendar dates, categories and class enrollment. Enrollment year is derived from its class.
- [x] School-year activation is atomic and protected by a database uniqueness constraint.
- [x] Archives preserve relationships and grades. Database restrictions prevent destructive cascade deletion. Admin Recovery & History restores archives and shows score/profile/archive changes.
- [x] Password hashes are excluded from teacher creation responses. Staff guards recheck active accounts.
- [x] Public lookup, subject management and enrollment filters abort stale requests and expose retryable errors.
- [x] Modal keyboard focus is contained, restored on close, and no longer stolen during typing. Password-eye interaction is regression tested.
- [x] Demo seed requires an explicitly selected local test/development database and supplied test passwords.
- [x] Unit, component, permission, SQL migration and browser tests added; CI runs them.

## Verification and release boundary

See `VERIFICATION.md` for executed checks and `DATABASE-ROLLOUT.md` before deployment. The live database migration was subsequently authorized and applied on 10 October 2026, with backup/restore rehearsal and preservation verification. Existing academic values and passwords were not changed. This release is being pushed to the saved GitHub repository.

## Follow-up improvements requiring school policy or operational evidence

- Confirm the school's policy for finalizing/locking grades, missing work and grading periods before introducing final transcripts or GPA.
- Test a restored production-sized backup and the real deployment connection in staging before release.
- Review the lint-tool advisory chain when upstream publishes a compatible fix. Do not downgrade Next's lint configuration to an incompatible major just to suppress an audit.
- Public student records remain intentionally public per the agreed scope; changing that access policy is a separate product decision.
