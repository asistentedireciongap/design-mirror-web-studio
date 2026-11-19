<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Domain rules (deadline condition, reminder schedule, dashboard counts) live as pure functions in `src/lib/compromisos/plazos.ts` with tests in `src/test/plazos.test.ts` — keeps business rules testable and independent of the UI.
- All data access goes through the `useCompromisos()` store in `src/lib/compromisos/store.tsx`; pages never touch data directly — so the in-memory demo store can be swapped for a persistent backend without changing screens.
- The app shell renders inside `<ClientOnly>` in `__root.tsx` because demo data and "today" depend on the browser's local date; SSR would mismatch across time zones.
- List filters live in the URL search params (validated in `src/lib/compromisos/filtros.ts`) so dashboard cards can deep-link into filtered lists.
