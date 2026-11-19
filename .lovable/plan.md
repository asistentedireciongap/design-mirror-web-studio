# Move the app from demo data to the real database

## What I found

- The connected database is **empty**: no tables, no user accounts. So there are no fictional records to remove there, and none will be added.
- The app today keeps everything in browser memory, seeded with 14 invented commitments. Every screen reads and writes through one shared data module, so only that module needs to switch to the database.
- **Login is not set up yet.** There is no sign-in page and no administrator account.

## Tables I will create

```text
compromisos (commitments)          seguimientos (follow-up history)
- audit reference                  - commitment it belongs to  --> compromisos
- company                          - date
- audit date                       - description
- auditor name                     - action taken by the auditor
- auditor email                    - progress reported by the responsible person
- commitment description           - recorded at (automatic)
- responsible person
- due date
- status (Pendiente / En proceso / Completado)
- follow-up observations
- latest follow-up date
- completion date
- created / updated (automatic)

user_roles (who is administrator)
- user account
- role (admin)
```

## How they relate

- One commitment has many follow-up entries. Each entry points to its commitment.
- When a follow-up is added, the commitment's "latest follow-up date" is updated automatically if the new date is more recent.
- Follow-ups are **add-only**: the database itself will not allow editing or deleting an entry, so history can never be overwritten.
- `user_roles` is kept separate from everything else so nobody can make themselves administrator.

## Security

- Row Level Security switched on for all three tables.
- No public access at all: visitors who are not signed in can read nothing.
- Only a signed-in user who has the **admin** role can view, create and edit commitments, and view and add follow-ups.
- Nobody can edit or delete follow-ups (not even the admin).
- Nobody can change roles from the app; I assign the admin role once to the account you choose.
- Only the public "publishable" key is used in the browser. No passwords or secret keys go into the app.

## Login (still to be set up)

- A Spanish sign-in page (email + password), no public sign-up form.
- All existing pages move behind sign-in; their addresses stay the same.
- A "Cerrar sesión" option in the side menu.
- You create the administrator account in your Supabase dashboard (Authentication > Users > Add user), then I give that account the admin role.

## App parts that change to use the database

- Shared data module (`useCompromisos`): load commitments with their history, create, edit, add follow-up.
- Panel metrics, Compromisos table and filters, Detail view, Registrar and Editar forms, Historial, Recordatorios preview: same screens, now reading real records. Their calculation rules stay exactly as they are.
- The invented demo data is removed from the app, and the "modo demostración" banner is removed because it would no longer be true.
- Empty states are shown when there are no records yet.

## Not included

- No email reminders (Recordatorios stays a preview only).
- No redesign, no new features.

## Technical details

- Migration: `compromisos`, `seguimientos` (FK `compromiso_id` ON DELETE CASCADE, index), `app_role` enum, `user_roles` + `has_role()` security definer; grants to `authenticated` / `service_role` only (no `anon`); RLS policies `to authenticated using (has_role(auth.uid(),'admin'))`; `seguimientos` gets SELECT + INSERT only, no UPDATE/DELETE grant or policy; trigger to bump `fecha_ultimo_seguimiento`; `updated_at` trigger.
- Store rewritten on TanStack Query + browser Supabase client (RLS applies as the signed-in user), keeping the same action names; actions become async and screens await them.
- `/auth` public route; protected routes moved under `_authenticated/` (pathless, URLs unchanged); root `onAuthStateChange` listener; existing domain tests in `plazos.test.ts` kept passing.
