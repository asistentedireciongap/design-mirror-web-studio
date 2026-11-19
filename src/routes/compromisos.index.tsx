import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Search, X } from "lucide-react";
import { useMemo } from "react";

import { EncabezadoPagina } from "@/components/app-shell";
import { InsigniaCondicion, InsigniaEstado } from "@/components/compromisos/insignias";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { filtrarCompromisos, validarBusqueda, type Busqueda } from "@/lib/compromisos/filtros";
import { condicionPlazo, sinSeguimiento, ultimoSeguimiento } from "@/lib/compromisos/plazos";
import { useCompromisos } from "@/lib/compromisos/store";
import { CONDICIONES, ESTADOS } from "@/lib/compromisos/tipos";
import { formatearFecha } from "@/lib/fechas";

export const Route = createFileRoute("/compromisos/")({
  validateSearch: validarBusqueda,
  head: () => ({
    meta: [
      { title: "Compromisos | Seguimiento de Compromisos de Auditoría" },
      {
        name: "description",
        content:
          "Lista de compromisos de auditoría con búsqueda y filtros por empresa, auditor y estado.",
      },
      { property: "og:title", content: "Compromisos | Seguimiento de Compromisos de Auditoría" },
      {
        property: "og:description",
        content:
          "Lista de compromisos de auditoría con búsqueda y filtros por empresa, auditor y estado.",
      },
    ],
  }),
  component: ListaCompromisos,
});

function FiltroSelect({
  id,
  etiqueta,
  valor,
  opciones,
  onCambio,
}: {
  id: string;
  etiqueta: string;
  valor: string | undefined;
  opciones: readonly string[];
  onCambio: (v: string | undefined) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {etiqueta}
      </Label>
      <NativeSelect
        id={id}
        value={valor ?? ""}
        onChange={(e) => onCambio(e.target.value || undefined)}
      >
        <option value="">Todos</option>
        {opciones.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

function ListaCompromisos() {
  const busqueda = Route.useSearch();
  const navigate = useNavigate({ from: "/compromisos/" });
  const { compromisos, hoy } = useCompromisos();

  const opciones = useMemo(() => {
    const unicos = (v: string[]) => [...new Set(v)].sort((a, b) => a.localeCompare(b, "es"));
    return {
      empresas: unicos(compromisos.map((c) => c.empresa)),
      auditores: unicos(compromisos.map((c) => c.auditorNombre)),
      responsables: unicos(compromisos.map((c) => c.responsable)),
    };
  }, [compromisos]);

  const filtrados = useMemo(
    () =>
      filtrarCompromisos(compromisos, busqueda, hoy).sort((a, b) =>
        a.fechaCompromiso.localeCompare(b.fechaCompromiso),
      ),
    [compromisos, busqueda, hoy],
  );

  const cambiar = (parcial: Busqueda) =>
    navigate({ search: (prev) => ({ ...prev, ...parcial }), replace: true });

  const hayFiltros = Object.values(busqueda).some((v) => v !== undefined);

  return (
    <>
      <EncabezadoPagina
        titulo="Compromisos"
        descripcion="Busque un compromiso y ábralo para ver su detalle e historial de seguimiento."
        acciones={
          <Button asChild>
            <Link to="/compromisos/nuevo">
              <Plus /> Registrar compromiso
            </Link>
          </Button>
        }
      />

      <Card className="mb-6 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-6">
            <Label htmlFor="buscar" className="text-xs font-medium text-muted-foreground">
              Buscar
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="buscar"
                className="h-10 pl-9"
                placeholder="Referencia, empresa, descripción, responsable o auditor"
                value={busqueda.q ?? ""}
                onChange={(e) => cambiar({ q: e.target.value || undefined })}
              />
            </div>
          </div>
          <FiltroSelect
            id="f-empresa"
            etiqueta="Empresa"
            valor={busqueda.empresa}
            opciones={opciones.empresas}
            onCambio={(v) => cambiar({ empresa: v })}
          />
          <FiltroSelect
            id="f-auditor"
            etiqueta="Auditor"
            valor={busqueda.auditor}
            opciones={opciones.auditores}
            onCambio={(v) => cambiar({ auditor: v })}
          />
          <FiltroSelect
            id="f-responsable"
            etiqueta="Responsable"
            valor={busqueda.responsable}
            opciones={opciones.responsables}
            onCambio={(v) => cambiar({ responsable: v })}
          />
          <FiltroSelect
            id="f-estado"
            etiqueta="Estado"
            valor={busqueda.estado}
            opciones={ESTADOS}
            onCambio={(v) => cambiar({ estado: v as Busqueda["estado"] })}
          />
          <FiltroSelect
            id="f-condicion"
            etiqueta="Condición de plazo"
            valor={busqueda.condicion}
            opciones={CONDICIONES}
            onCambio={(v) => cambiar({ condicion: v as Busqueda["condicion"] })}
          />
          <div className="flex flex-col justify-end gap-2">
            <div className="flex h-10 items-center gap-2">
              <Checkbox
                id="f-vencidos"
                checked={busqueda.condicion === "Vencido"}
                onCheckedChange={(v) => cambiar({ condicion: v === true ? "Vencido" : undefined })}
              />
              <Label htmlFor="f-vencidos" className="text-sm">
                Solo vencidos
              </Label>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="f-sinseg"
              checked={busqueda.sinSeguimiento === true}
              onCheckedChange={(v) => cambiar({ sinSeguimiento: v === true ? true : undefined })}
            />
            <Label htmlFor="f-sinseg" className="text-sm">
              Solo compromisos sin seguimiento registrado
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Mostrando {filtrados.length} de {compromisos.length}
            </p>
            {hayFiltros && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ search: {}, replace: true })}
              >
                <X /> Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead className="pl-4">Referencia y empresa</TableHead>
              <TableHead>Compromiso y responsable</TableHead>
              <TableHead>Auditor</TableHead>
              <TableHead>Vence</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Último seg.</TableHead>
              <TableHead className="pr-4">Condición</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  No se encontraron compromisos con estos filtros.
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((c) => {
              const ultimo = ultimoSeguimiento(c);
              return (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => navigate({ to: "/compromisos/$id", params: { id: c.id } })}
                >
                  <TableCell className="min-w-32 pl-4">
                    <p className="whitespace-nowrap text-xs font-semibold tracking-wide text-muted-foreground">
                      {c.referenciaAuditoria}
                    </p>
                    <p className="text-sm">{c.empresa}</p>
                  </TableCell>
                  <TableCell className="min-w-56">
                    <Link
                      to="/compromisos/$id"
                      params={{ id: c.id }}
                      onClick={(e) => e.stopPropagation()}
                      className="line-clamp-2 font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {c.descripcion}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Responsable: {c.responsable}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{c.auditorNombre}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm tabular-nums">
                    {formatearFecha(c.fechaCompromiso)}
                  </TableCell>
                  <TableCell>
                    <InsigniaEstado estado={c.estado} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm tabular-nums">
                    {ultimo ? (
                      formatearFecha(ultimo)
                    ) : sinSeguimiento(c) ? (
                      <span className="font-medium text-warning">Sin seguimiento</span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="pr-4">
                    <InsigniaCondicion condicion={condicionPlazo(c, hoy)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
