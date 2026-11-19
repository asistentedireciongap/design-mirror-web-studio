import { zodResolver } from "@hookform/resolvers/zod";
import { History, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { esquemaSeguimiento, type FormularioSeguimiento } from "@/lib/compromisos/esquemas";
import { useCompromisos } from "@/lib/compromisos/store";
import type { Compromiso } from "@/lib/compromisos/tipos";
import { formatearFecha } from "@/lib/fechas";

import { Campo } from "./campo";

function FormularioNuevoSeguimiento({
  compromisoId,
  onListo,
}: {
  compromisoId: string;
  onListo: () => void;
}) {
  const { agregarSeguimiento, hoy } = useCompromisos();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioSeguimiento>({
    resolver: zodResolver(esquemaSeguimiento),
    defaultValues: { fecha: hoy, descripcion: "", accionAuditor: "", avanceReportado: "" },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((datos) => {
        agregarSeguimiento(compromisoId, datos);
        toast.success("Seguimiento agregado al historial", {
          description: "Disponible mientras no recargue la página (modo demostración).",
        });
        onListo();
      })}
      className="grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2"
    >
      <Campo id="seg-fecha" etiqueta="Fecha del seguimiento" error={errors.fecha?.message}>
        <Input id="seg-fecha" type="date" max={hoy} className="bg-card" {...register("fecha")} />
      </Campo>
      <div className="hidden sm:block" />
      <Campo
        id="seg-desc"
        etiqueta="Descripción o notas del seguimiento"
        error={errors.descripcion?.message}
        className="sm:col-span-2"
      >
        <Textarea id="seg-desc" rows={2} className="bg-card" {...register("descripcion")} />
      </Campo>
      <Campo
        id="seg-accion"
        etiqueta="Acción realizada por el auditor"
        error={errors.accionAuditor?.message}
      >
        <Textarea
          id="seg-accion"
          rows={2}
          className="bg-card"
          placeholder="Ej. Llamada, reunión, correo…"
          {...register("accionAuditor")}
        />
      </Campo>
      <Campo
        id="seg-avance"
        etiqueta="Avance reportado por el responsable"
        error={errors.avanceReportado?.message}
      >
        <Textarea id="seg-avance" rows={2} className="bg-card" {...register("avanceReportado")} />
      </Campo>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="outline" onClick={onListo}>
          Cancelar
        </Button>
        <Button type="submit">Agregar al historial</Button>
      </div>
    </form>
  );
}

export function HistorialSeguimiento({ compromiso }: { compromiso: Compromiso }) {
  const [agregando, setAgregando] = useState(false);
  const entradas = [...compromiso.seguimientos].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Historial de seguimiento</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {entradas.length === 0
              ? "Aún no hay seguimientos registrados."
              : `${entradas.length} seguimiento${entradas.length === 1 ? "" : "s"} registrado${entradas.length === 1 ? "" : "s"}. Las entradas anteriores se conservan.`}
          </p>
        </div>
        {!agregando && (
          <Button onClick={() => setAgregando(true)}>
            <Plus /> Registrar seguimiento
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {agregando && (
          <FormularioNuevoSeguimiento
            compromisoId={compromiso.id}
            onListo={() => setAgregando(false)}
          />
        )}
        {entradas.length === 0 && !agregando ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            <History className="size-6" />
            El auditor todavía no ha documentado ningún seguimiento.
          </div>
        ) : (
          <ol className="relative space-y-6 border-l border-border pl-6">
            {entradas.map((s) => (
              <li key={s.id} className="relative">
                <span className="absolute -left-[1.85rem] top-1 size-3 rounded-full border-2 border-card bg-primary" />
                <p className="text-sm font-semibold text-foreground">{formatearFecha(s.fecha)}</p>
                <p className="mt-1 text-sm text-foreground">{s.descripcion}</p>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-md bg-muted/60 p-3">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Acción del auditor
                    </dt>
                    <dd className="mt-0.5">{s.accionAuditor}</dd>
                  </div>
                  <div className="rounded-md bg-muted/60 p-3">
                    <dt className="text-xs font-medium text-muted-foreground">Avance reportado</dt>
                    <dd className="mt-0.5">{s.avanceReportado}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
