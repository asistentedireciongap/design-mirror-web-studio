import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { esquemaCompromiso, type FormularioCompromiso } from "@/lib/compromisos/esquemas";
import { useCompromisos } from "@/lib/compromisos/store";
import { ESTADOS, type DatosCompromiso } from "@/lib/compromisos/tipos";

import { Campo } from "./campo";

export function aFormulario(d?: Partial<DatosCompromiso>): FormularioCompromiso {
  return {
    referenciaAuditoria: d?.referenciaAuditoria ?? "",
    empresa: d?.empresa ?? "",
    fechaAuditoria: d?.fechaAuditoria ?? "",
    auditorNombre: d?.auditorNombre ?? "",
    auditorEmail: d?.auditorEmail ?? "",
    descripcion: d?.descripcion ?? "",
    responsable: d?.responsable ?? "",
    fechaCompromiso: d?.fechaCompromiso ?? "",
    estado: d?.estado ?? "Pendiente",
    fechaUltimoSeguimiento: d?.fechaUltimoSeguimiento ?? "",
    observacionesSeguimiento: d?.observacionesSeguimiento ?? "",
    fechaCumplimiento: d?.fechaCumplimiento ?? "",
  };
}

function aDatos(f: FormularioCompromiso): DatosCompromiso {
  return {
    ...f,
    fechaUltimoSeguimiento: f.fechaUltimoSeguimiento || null,
    fechaCumplimiento: f.estado === "Completado" ? f.fechaCumplimiento || null : null,
  };
}

export function FormularioCompromisoForm({
  valoresIniciales,
  textoGuardar,
  onGuardar,
  onCancelar,
}: {
  valoresIniciales: FormularioCompromiso;
  textoGuardar: string;
  onGuardar: (datos: DatosCompromiso) => void;
  onCancelar: () => void;
}) {
  const { compromisos, hoy } = useCompromisos();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormularioCompromiso>({
    resolver: zodResolver(esquemaCompromiso),
    defaultValues: valoresIniciales,
  });

  const sugerencias = useMemo(() => {
    const unicos = (valores: string[]) => [...new Set(valores)].sort();
    return {
      referencias: unicos(compromisos.map((c) => c.referenciaAuditoria)),
      empresas: unicos(compromisos.map((c) => c.empresa)),
      auditores: unicos(compromisos.map((c) => c.auditorNombre)),
      responsables: unicos(compromisos.map((c) => c.responsable)),
    };
  }, [compromisos]);

  const estado = watch("estado");

  // Si la referencia ya existe, completa los datos de la auditoría que estén vacíos.
  function alSalirDeReferencia() {
    const ref = getValues("referenciaAuditoria").trim();
    const existente = compromisos.find((c) => c.referenciaAuditoria === ref);
    if (!existente) return;
    const campos = ["empresa", "fechaAuditoria", "auditorNombre", "auditorEmail"] as const;
    for (const campo of campos) {
      if (!getValues(campo)) setValue(campo, existente[campo]);
    }
  }

  function alSalirDeAuditor() {
    const nombre = getValues("auditorNombre").trim();
    const existente = compromisos.find((c) => c.auditorNombre === nombre);
    if (existente && !getValues("auditorEmail")) setValue("auditorEmail", existente.auditorEmail);
  }

  return (
    <form onSubmit={handleSubmit((f) => onGuardar(aDatos(f)))} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de la auditoría</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Campo
            id="referenciaAuditoria"
            etiqueta="Referencia o número de auditoría"
            error={errors.referenciaAuditoria?.message}
            ayuda="Use la misma referencia para varios compromisos de una auditoría."
          >
            <Input
              id="referenciaAuditoria"
              list="lista-referencias"
              placeholder="Ej. AUD-2026-050"
              {...register("referenciaAuditoria", { onBlur: alSalirDeReferencia })}
            />
          </Campo>
          <Campo id="empresa" etiqueta="Empresa" error={errors.empresa?.message}>
            <Input id="empresa" list="lista-empresas" {...register("empresa")} />
          </Campo>
          <Campo
            id="fechaAuditoria"
            etiqueta="Fecha de auditoría"
            error={errors.fechaAuditoria?.message}
          >
            <Input id="fechaAuditoria" type="date" max={hoy} {...register("fechaAuditoria")} />
          </Campo>
          <div className="hidden sm:block" />
          <Campo
            id="auditorNombre"
            etiqueta="Nombre del auditor"
            error={errors.auditorNombre?.message}
          >
            <Input
              id="auditorNombre"
              list="lista-auditores"
              {...register("auditorNombre", { onBlur: alSalirDeAuditor })}
            />
          </Campo>
          <Campo
            id="auditorEmail"
            etiqueta="Correo electrónico del auditor"
            error={errors.auditorEmail?.message}
            ayuda="Los recordatorios futuros se dirigirán solo a este correo."
          >
            <Input id="auditorEmail" type="email" {...register("auditorEmail")} />
          </Campo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compromiso</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Campo
            id="descripcion"
            etiqueta="Descripción del compromiso"
            error={errors.descripcion?.message}
            className="sm:col-span-2"
          >
            <Textarea id="descripcion" rows={3} {...register("descripcion")} />
          </Campo>
          <Campo
            id="responsable"
            etiqueta="Gerente o empleado responsable de cumplirlo"
            error={errors.responsable?.message}
          >
            <Input id="responsable" list="lista-responsables" {...register("responsable")} />
          </Campo>
          <Campo
            id="fechaCompromiso"
            etiqueta="Fecha compromiso"
            error={errors.fechaCompromiso?.message}
          >
            <Input id="fechaCompromiso" type="date" {...register("fechaCompromiso")} />
          </Campo>
          <Campo id="estado" etiqueta="Estado" error={errors.estado?.message}>
            <NativeSelect
              id="estado"
              {...register("estado", {
                onChange: (e) => {
                  if (e.target.value === "Completado" && !getValues("fechaCumplimiento")) {
                    setValue("fechaCumplimiento", hoy);
                  }
                },
              })}
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </NativeSelect>
          </Campo>
          {estado === "Completado" ? (
            <Campo
              id="fechaCumplimiento"
              etiqueta="Fecha de cumplimiento"
              error={errors.fechaCumplimiento?.message}
            >
              <Input id="fechaCumplimiento" type="date" {...register("fechaCumplimiento")} />
            </Campo>
          ) : (
            <div className="hidden sm:block" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seguimiento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Campo
            id="fechaUltimoSeguimiento"
            etiqueta="Fecha del último seguimiento"
            opcional
            error={errors.fechaUltimoSeguimiento?.message}
            ayuda="Se actualiza sola al registrar un seguimiento en el historial."
          >
            <Input
              id="fechaUltimoSeguimiento"
              type="date"
              max={hoy}
              {...register("fechaUltimoSeguimiento")}
            />
          </Campo>
          <div className="hidden sm:block" />
          <Campo
            id="observacionesSeguimiento"
            etiqueta="Observaciones de seguimiento"
            opcional
            error={errors.observacionesSeguimiento?.message}
            className="sm:col-span-2"
          >
            <Textarea
              id="observacionesSeguimiento"
              rows={3}
              {...register("observacionesSeguimiento")}
            />
          </Campo>
        </CardContent>
      </Card>

      <datalist id="lista-referencias">
        {sugerencias.referencias.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>
      <datalist id="lista-empresas">
        {sugerencias.empresas.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>
      <datalist id="lista-auditores">
        {sugerencias.auditores.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>
      <datalist id="lista-responsables">
        {sugerencias.responsables.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">{textoGuardar}</Button>
      </div>
    </form>
  );
}
