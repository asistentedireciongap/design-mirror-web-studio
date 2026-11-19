import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileQuestion,
  Hourglass,
  ListChecks,
  CircleDashed,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";

import { EncabezadoPagina } from "@/components/app-shell";
import { InsigniaCondicion } from "@/components/compromisos/insignias";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calcularMetricas,
  condicionPlazo,
  diasRestantes,
  requierenAtencion,
  resumenPorAuditor,
  sinSeguimiento,
} from "@/lib/compromisos/plazos";
import { useCompromisos } from "@/lib/compromisos/store";
import type { Busqueda } from "@/lib/compromisos/filtros";
import { formatearFecha, formatearFechaLarga } from "@/lib/fechas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Panel | Seguimiento de Compromisos de Auditoría" },
      {
        name: "description",
        content: "Resumen de compromisos pendientes, vencidos y sin seguimiento por auditor.",
      },
      { property: "og:title", content: "Panel | Seguimiento de Compromisos de Auditoría" },
      {
        property: "og:description",
        content: "Resumen de compromisos pendientes, vencidos y sin seguimiento por auditor.",
      },
    ],
  }),
  component: Panel,
});

type Tono = "neutral" | "info" | "success" | "warning" | "danger";

const TONO: Record<Tono, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-destructive-soft text-destructive",
};

function TarjetaMetrica({
  etiqueta,
  valor,
  icono: Icono,
  tono,
  busqueda,
  destacada,
}: {
  etiqueta: string;
  valor: number;
  icono: LucideIcon;
  tono: Tono;
  busqueda: Busqueda;
  destacada?: boolean;
}) {
  return (
    <Link
      to="/compromisos"
      search={busqueda}
      className={cn(
        "group flex items-center gap-4 rounded-lg border bg-card p-4 shadow-card transition-colors hover:border-primary/40",
        destacada && valor > 0 && "border-destructive/30",
      )}
    >
      <div
        className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", TONO[tono])}
      >
        <Icono className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums leading-none text-foreground">{valor}</p>
        <p className="mt-1 text-sm text-muted-foreground group-hover:text-foreground">{etiqueta}</p>
      </div>
    </Link>
  );
}

function Panel() {
  const { compromisos, hoy } = useCompromisos();
  const m = useMemo(() => calcularMetricas(compromisos, hoy), [compromisos, hoy]);
  const atencion = useMemo(() => requierenAtencion(compromisos, hoy), [compromisos, hoy]);
  const auditores = useMemo(() => resumenPorAuditor(compromisos, hoy), [compromisos, hoy]);

  return (
    <>
      <EncabezadoPagina
        titulo="Panel de seguimiento"
        descripcion={`Situación al ${formatearFechaLarga(hoy)}`}
        acciones={
          <Button asChild>
            <Link to="/compromisos/nuevo">Registrar compromiso</Link>
          </Button>
        }
      />

      <section aria-label="Indicadores" className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TarjetaMetrica
            etiqueta="Compromisos registrados"
            valor={m.total}
            icono={ListChecks}
            tono="neutral"
            busqueda={{}}
          />
          <TarjetaMetrica
            etiqueta="Pendientes"
            valor={m.pendientes}
            icono={CircleDashed}
            tono="neutral"
            busqueda={{ estado: "Pendiente" }}
          />
          <TarjetaMetrica
            etiqueta="En proceso"
            valor={m.enProceso}
            icono={Hourglass}
            tono="info"
            busqueda={{ estado: "En proceso" }}
          />
          <TarjetaMetrica
            etiqueta="Completados"
            valor={m.completados}
            icono={CheckCircle2}
            tono="success"
            busqueda={{ estado: "Completado" }}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <TarjetaMetrica
            etiqueta="Próximos a vencer (5 días o menos)"
            valor={m.proximosAVencer}
            icono={Clock}
            tono="warning"
            busqueda={{ condicion: "Próximo a vencer" }}
          />
          <TarjetaMetrica
            etiqueta="Vencidos"
            valor={m.vencidos}
            icono={AlertTriangle}
            tono="danger"
            busqueda={{ condicion: "Vencido" }}
            destacada
          />
          <TarjetaMetrica
            etiqueta="Sin seguimiento registrado"
            valor={m.sinSeguimiento}
            icono={FileQuestion}
            tono="warning"
            busqueda={{ sinSeguimiento: true }}
            destacada
          />
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Requieren atención</CardTitle>
            <p className="text-sm text-muted-foreground">
              Compromisos abiertos vencidos, próximos a vencer o sin seguimiento.
            </p>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {atencion.length === 0 ? (
              <p className="px-6 pb-4 text-sm text-muted-foreground">
                No hay compromisos que requieran atención.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Compromiso</TableHead>
                    <TableHead>Auditor</TableHead>
                    <TableHead>Vence</TableHead>
                    <TableHead className="pr-6">Situación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atencion.slice(0, 8).map((c) => {
                    const dias = diasRestantes(c, hoy);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="max-w-xs pl-6">
                          <Link
                            to="/compromisos/$id"
                            params={{ id: c.id }}
                            className="line-clamp-2 font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {c.descripcion}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">{c.empresa}</p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {c.auditorNombre}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatearFecha(c.fechaCompromiso)}
                          <p className="text-xs text-muted-foreground">
                            {dias < 0
                              ? `Hace ${-dias} día${dias === -1 ? "" : "s"}`
                              : dias === 0
                                ? "Hoy"
                                : `En ${dias} día${dias === 1 ? "" : "s"}`}
                          </p>
                        </TableCell>
                        <TableCell className="pr-6">
                          <div className="flex flex-wrap gap-1">
                            <InsigniaCondicion condicion={condicionPlazo(c, hoy)} />
                            {sinSeguimiento(c) && (
                              <span className="rounded-md bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
                                Sin seguimiento
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            {atencion.length > 8 && (
              <div className="px-6 pt-2">
                <Link
                  to="/compromisos"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Ver los {atencion.length} compromisos en la lista
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Seguimiento por auditor</CardTitle>
            <p className="text-sm text-muted-foreground">
              ¿Están los auditores al día con sus compromisos asignados?
            </p>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Auditor</TableHead>
                  <TableHead className="text-right">Abiertos</TableHead>
                  <TableHead className="text-right">Vencidos</TableHead>
                  <TableHead className="text-right">Sin seg.</TableHead>
                  <TableHead className="pr-6">Último seg.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditores.map((a) => (
                  <TableRow key={a.nombre}>
                    <TableCell className="pl-6">
                      <Link
                        to="/compromisos"
                        search={{ auditor: a.nombre }}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {a.nombre}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{a.abiertos}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        a.vencidos > 0 && "font-semibold text-destructive",
                      )}
                    >
                      {a.vencidos}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        a.sinSeguimiento > 0 && "font-semibold text-warning",
                      )}
                    >
                      {a.sinSeguimiento}
                    </TableCell>
                    <TableCell className="whitespace-nowrap pr-6 text-sm">
                      {formatearFecha(a.ultimoSeguimiento)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
