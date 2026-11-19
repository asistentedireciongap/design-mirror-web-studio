import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BellRing, Pencil, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { HistorialSeguimiento } from "@/components/compromisos/historial";
import { InsigniaCondicion, InsigniaEstado } from "@/components/compromisos/insignias";
import { CompromisoNoEncontrado } from "@/components/compromisos/no-encontrado";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  condicionPlazo,
  diasRestantes,
  ETIQUETA_RECORDATORIO,
  proximoRecordatorio,
  ultimoSeguimiento,
} from "@/lib/compromisos/plazos";
import { useCompromisos } from "@/lib/compromisos/store";
import { ESTADOS, type Estado } from "@/lib/compromisos/tipos";
import { formatearFecha } from "@/lib/fechas";

export const Route = createFileRoute("/compromisos/$id/")({
  head: () => ({
    meta: [
      { title: "Detalle del compromiso | Seguimiento de Compromisos de Auditoría" },
      {
        name: "description",
        content: "Detalle e historial de seguimiento de un compromiso de auditoría.",
      },
      {
        property: "og:title",
        content: "Detalle del compromiso | Seguimiento de Compromisos de Auditoría",
      },
      {
        property: "og:description",
        content: "Detalle e historial de seguimiento de un compromiso de auditoría.",
      },
    ],
  }),
  component: DetalleCompromiso,
});

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function textoDias(dias: number) {
  if (dias === 0) return "Vence hoy";
  if (dias > 0) return `Faltan ${dias} día${dias === 1 ? "" : "s"}`;
  return `Vencido hace ${-dias} día${dias === -1 ? "" : "s"}`;
}

function DetalleCompromiso() {
  const { id } = Route.useParams();
  const { obtener, actualizar, hoy } = useCompromisos();
  const c = obtener(id);

  if (!c) return <CompromisoNoEncontrado />;

  const condicion = condicionPlazo(c, hoy);
  const ultimo = ultimoSeguimiento(c);
  const recordatorio = proximoRecordatorio(c, hoy);
  const { id: _id, seguimientos: _s, ...datos } = c;

  function cambiarEstado(estado: Estado) {
    actualizar(id, {
      ...datos,
      estado,
      fechaCumplimiento: estado === "Completado" ? (datos.fechaCumplimiento ?? hoy) : null,
    });
    toast.success(`Estado cambiado a «${estado}»`);
  }

  return (
    <>
      <Link
        to="/compromisos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Volver a compromisos
      </Link>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">
            {c.referenciaAuditoria} · {c.empresa}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{c.descripcion}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <InsigniaEstado estado={c.estado} />
            {c.estado !== "Completado" && <InsigniaCondicion condicion={condicion} />}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:shrink-0">
          <Button variant="outline" asChild>
            <Link to="/compromisos/nuevo" search={{ desde: c.id }}>
              <Plus /> Otro compromiso de esta auditoría
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/compromisos/$id/editar" params={{ id: c.id }}>
              <Pencil /> Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Compromiso</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Dato etiqueta="Responsable de cumplirlo">{c.responsable}</Dato>
                <Dato etiqueta="Fecha compromiso">
                  {formatearFecha(c.fechaCompromiso)}
                  {c.estado !== "Completado" && (
                    <span className="ml-2 text-muted-foreground">
                      ({textoDias(diasRestantes(c, hoy))})
                    </span>
                  )}
                </Dato>
                <Dato etiqueta="Fecha de cumplimiento">{formatearFecha(c.fechaCumplimiento)}</Dato>
                <Dato etiqueta="Fecha del último seguimiento">
                  {ultimo ? (
                    formatearFecha(ultimo)
                  ) : (
                    <span className="font-medium text-warning">Sin seguimiento registrado</span>
                  )}
                </Dato>
                <div className="sm:col-span-2">
                  <Dato etiqueta="Observaciones de seguimiento">
                    {c.observacionesSeguimiento || (
                      <span className="text-muted-foreground">Sin observaciones</span>
                    )}
                  </Dato>
                </div>
              </dl>
            </CardContent>
          </Card>

          <HistorialSeguimiento compromiso={c} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="cambiar-estado" className="text-xs font-medium text-muted-foreground">
                Cambiar estado
              </Label>
              <NativeSelect
                id="cambiar-estado"
                value={c.estado}
                onChange={(e) => cambiarEstado(e.target.value as Estado)}
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </NativeSelect>
              <p className="text-xs text-muted-foreground">
                Al marcarlo como Completado se registra la fecha de cumplimiento y se detienen los
                recordatorios.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Auditoría</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <Dato etiqueta="Referencia">{c.referenciaAuditoria}</Dato>
                <Dato etiqueta="Empresa">{c.empresa}</Dato>
                <Dato etiqueta="Fecha de auditoría">{formatearFecha(c.fechaAuditoria)}</Dato>
                <Dato etiqueta="Auditor asignado">{c.auditorNombre}</Dato>
                <Dato etiqueta="Correo del auditor">{c.auditorEmail}</Dato>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BellRing className="size-4 text-muted-foreground" /> Recordatorio al auditor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {recordatorio ? (
                <>
                  <p>
                    Próximo: <strong>{formatearFecha(recordatorio.fecha)}</strong>
                  </p>
                  <p className="text-muted-foreground">
                    {ETIQUETA_RECORDATORIO[recordatorio.tipo]}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Sin recordatorios: el compromiso está completado.
                </p>
              )}
              <p className="border-t pt-2 text-xs text-muted-foreground">
                El envío de correos aún no está activo. Solo se recordará al auditor, nunca al
                responsable.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
