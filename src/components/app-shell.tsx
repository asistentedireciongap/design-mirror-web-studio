import { Link, useLocation } from "@tanstack/react-router";
import { BellRing, ClipboardCheck, LayoutDashboard, ListChecks, PlusCircle } from "lucide-react";
import type { ReactNode } from "react";

const NAVEGACION = [
  { to: "/", etiqueta: "Panel", icono: LayoutDashboard, exacto: true },
  { to: "/compromisos", etiqueta: "Compromisos", icono: ListChecks, exacto: false },
  { to: "/compromisos/nuevo", etiqueta: "Registrar compromiso", icono: PlusCircle, exacto: true },
  { to: "/recordatorios", etiqueta: "Recordatorios", icono: BellRing, exacto: true },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4 md:py-6">
          <div className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <ClipboardCheck className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Seguimiento de Compromisos</p>
            <p className="text-xs text-sidebar-muted">de Auditoría</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-2 md:flex-col md:py-4">
          {NAVEGACION.map(({ to, etiqueta, icono: Icono, exacto }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: exacto || pathname.startsWith("/compromisos/nuevo") }}
              className="flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:font-medium data-[status=active]:text-sidebar-accent-foreground"
            >
              <Icono className="size-4" />
              {etiqueta}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-muted md:block">
          Acceso exclusivo del administrador
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="border-b border-border bg-notice px-6 py-2 text-xs text-notice-foreground">
          <strong className="font-semibold">Modo demostración:</strong> se muestran datos ficticios.
          Los cambios que haga se conservan solo mientras no recargue la página; todavía no se
          guardan en ninguna base de datos.
        </div>
        <main className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function EncabezadoPagina({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string;
  descripcion?: ReactNode;
  acciones?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}
