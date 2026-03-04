

## Plan: Chat-First Sign Specification System

The user confirmed the RLS consideration (reviewer_email field name is misleading for customer sessions) is not a blocker for MVP. Proceeding with implementation.

### RLS Note (deferred)
Current `review_signs` and `review_sessions` RLS checks `reviewer_email = auth.jwt()->>'email'`. This works for both reviewers and customers as long as the session creator's email is stored in `reviewer_email`. A future rename to `creator_email` or adding a `customer_email` path is tracked but not needed now.

---

### New Files

1. **`src/lib/sign-constants.ts`** — `SPEC_FIELDS_BY_PROFILE`, `FIELD_LABELS`, `PROFILE_DEFAULTS`, `CATEGORY_MAP` constants, isolated for future Supabase migration.

2. **`src/stores/signStore.ts`** — New Zustand store:
   - `chatPhase`: `'welcome' | 'chat' | 'post_upload' | 'identify_signs' | 'spec_signs' | 'done'`
   - `sessionId`, `uploadedFiles`, `signs`, `currentSignIndex`, `userRole`, `autocompleteOptions`
   - Actions for phase transitions, sign CRUD, file tracking

3. **`src/components/chat/WelcomeActions.tsx`** — Two buttons: "Upload Artwork" (file picker) and "Start Chat" (activates input). Inline chat component.

4. **`src/components/chat/PostUploadActions.tsx`** — Three buttons after upload: "Specify sign profiles", "I'm done", "I have questions".

5. **`src/components/chat/SignIdentifier.tsx`** — Text input + "Add Sign" button to build sign list. "Done adding signs" inserts `review_signs` records via authenticated Supabase client.

6. **`src/components/chat/SignSpecCard.tsx`** — Core component with three states:
   - **Profile selection**: 8 profile tiles
   - **Spec editing**: Profile-specific fields with `[Change]` dropdowns filtered from `autocompleteOptions` by `CATEGORY_MAP`. Four action buttons (Looks good / Specs in artwork / Add another / I'm done)
   - **Collapsed**: One-line summary with Edit link
   - **Assistant extras**: Flag Issue form, PG Quote Number, Price, Company selector

7. **`src/components/chat/AssistantFlagForm.tsx`** — Compact flag form with autocomplete (reason_code category), flag type toggle, spec change fields. Calls `save-flag` via `invokeWithAuth`.

### Modified Files

1. **`src/components/chat/ChatThread.tsx`** — Rework message building from wizard-step-based to phase-based using `signStore.chatPhase`. Each phase appends appropriate messages with inline components. Keep existing wizard flow as fallback when `wizardStore.currentStep > 0`.

2. **`src/components/layout/MainPanel.tsx`** — Show ChatThread when sign store has an active phase (in addition to existing wizard check).

3. **`src/components/layout/InputBar.tsx`** — Add persistent upload button after chat starts. Adapt placeholder text per phase. Hide input when phase doesn't need it (welcome, done).

4. **`src/components/chat/WelcomeScreen.tsx`** — Integrate with new welcome phase; when no draft exists, defer to chat welcome.

### Data Flow

- **Reviewer detection**: On mount, call `checkReviewerAccess()` → set `userRole` in signStore
- **Autocomplete**: Direct query `supabase.from('autocomplete_options').select(...).eq('active', true)` on session start
- **Sign CRUD**: Direct Supabase client calls to `review_signs` table (RLS allows insert/update when session's `reviewer_email` matches JWT)
- **File uploads**: `supabase.storage.from('intake-assets').upload(...)` to `uploads/{sessionId}/{uuid}.{ext}`
- **Session creation**: `createReviewSession` edge function (existing) to get `session_id`
- **Flags**: `invokeWithAuth('save-flag', ...)` (existing)

### No Database Changes Needed
All tables (`review_sessions`, `review_signs`, `review_flags`, `autocomplete_options`) already exist with appropriate columns and RLS policies.

### Implementation Order
1. Create `sign-constants.ts` + `signStore.ts`
2. Build `WelcomeActions`, `PostUploadActions`, `SignIdentifier`
3. Build `SignSpecCard` (profile selection → spec editing → collapsed)
4. Build `AssistantFlagForm`
5. Rework `ChatThread.tsx` for phase-based flow
6. Update `MainPanel.tsx`, `InputBar.tsx`, `WelcomeScreen.tsx`

