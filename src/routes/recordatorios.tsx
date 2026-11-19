import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, Mail } from "lucide-react";
import { useMemo } from "react";

import { EncabezadoPagina } from "@/components/app-shell";
import { InsigniaCondicion } from "@/components/compromisos/insignias";
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
  condicionPlazo,
  DIAS_RECORDATORIO_PREVIO,
  ETIQUETA_RECORDATORIO,
  INTERVALO_RECORDATORIO_VENCIDO,
  proximoRecordatorio,
} from "@/lib/compromisos/plazos";
import { useCompromisos } from "@/lib/compromisos/store";
import { formatearFecha } from "@/lib/fechas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/recordatorios")({
  head: () => ({
    meta: [
      { title: "Recordatorios | Seguimiento de Compromisos de Auditoría" },
      {
        name: "description",
        content: "Calendario previsto de recordatorios por correo a los auditores asignados.",
      },
      { property: "og:title", content: "Recordatorios | Seguimiento de Compromisos de Auditoría" },
      {
        property: "og:description",
        content: "Calendario previsto de recordatorios por correo a los auditores asignados.",
      },
    ],
  }),
  component: Recordatorios,
});

function Recordatorios() {
  const { compromisos, hoy } = useCompromisos();

  const programados = useMemo(
    () =>
      compromisos
        .map((c) => ({ c, r: proximoRecordatorio(c, hoy) }))
        .filter((x): x is { c: typeof x.c; r: NonNullable<typeof x.r> } => x.r !== null)
        .sort((a, b) => a.r.fecha.localeCompare(b.r.fecha)),
    [compromisos, hoy],
  );

  return (
    <>
      <EncabezadoPagina
        titulo="Recordatorios a auditores"
        descripcion="Vista previa de cuándo se recordaría a cada auditor dar seguimiento a sus compromisos."
      />

      <div className="mb-6 flex gap-3 rounded-lg border border-info/20 bg-info-soft p-4 text-sm text-info">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          El envío automático de correos <strong>todavía no está activo</strong>: esta página solo
          muestra el calendario previsto. Los recordatorios se dirigen exclusivamente al auditor
          asignado; nunca al gerente o empleado responsable del compromiso.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Próximos recordatorios</CardTitle>
            <p className="text-sm text-muted-foreground">
              {programados.length} compromisos abiertos. Los completados ya no reciben
              recordatorios.
            </p>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Fecha y motivo</TableHead>
                <TableHead>Destinatario (auditor)</TableHead>
                <TableHead>Compromiso</TableHead>
                <TableHead className="pr-6">Condición</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programados.map(({ c, r }) => (
                <TableRow key={c.id}>
                  <TableCell className="min-w-40 pl-6">
                    <p
                      className={cn(
                        "whitespace-nowrap font-medium tabular-nums",
                        r.fecha === hoy && "text-primary",
                      )}
                    >
                      {r.fecha === hoy ? "Hoy" : formatearFecha(r.fecha)}
                    </p>
                    <p className="text-xs text-muted-foreground">{ETIQUETA_RECORDATORIO[r.tipo]}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    <p className="whitespace-nowrap font-medium">{c.auditorNombre}</p>
                    <p className="text-xs text-muted-foreground">{c.auditorEmail}</p>
                  </TableCell>
                  <TableCell className="min-w-48">
                    <Link
                      to="/compromisos/$id"
                      params={{ id: c.id }}
                      className="line-clamp-2 text-sm font-medium hover:text-primary hover:underline"
                    >
                      {c.descripcion}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Vence {formatearFecha(c.fechaCompromiso)}
                    </p>
                  </TableCell>
                  <TableCell className="pr-6">
                    <InsigniaCondicion condicion={condicionPlazo(c, hoy)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Calendario previsto</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                    1
                  </span>
                  {DIAS_RECORDATORIO_PREVIO} días antes de la fecha compromiso.
                </li>
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                    2
                  </span>
                  El día de vencimiento.
                </li>
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                    3
                  </span>
                  Cada {INTERVALO_RECORDATORIO_VENCIDO} días después del vencimiento, mientras no
                  esté completado.
                </li>
              </ol>
              <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                Los recordatorios se detienen al marcar el compromiso como Completado.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="size-4 text-muted-foreground" /> Contenido del correo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-xs text-muted-foreground">Texto de ejemplo (no se envía):</p>
              <div className="space-y-2 rounded-md bg-muted/60 p-4 leading-relaxed">
                <p>
                  <strong>Asunto:</strong> Seguimiento pendiente: [referencia de auditoría]
                </p>
                <p>Hola [nombre del auditor]:</p>
                <p>El compromiso «[descripción]» de [empresa] vence el [fecha compromiso].</p>
                <p>
                  Por favor contacte a [responsable], solicite el avance y documente el seguimiento
                  en el sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
