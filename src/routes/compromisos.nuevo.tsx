import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { EncabezadoPagina } from "@/components/app-shell";
import {
  aFormulario,
  FormularioCompromisoForm,
} from "@/components/compromisos/formulario-compromiso";
import { useCompromisos } from "@/lib/compromisos/store";

export const Route = createFileRoute("/compromisos/nuevo")({
  validateSearch: (s: Record<string, unknown>): { desde?: string | undefined } => ({
    desde: typeof s["desde"] === "string" ? s["desde"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Registrar compromiso | Seguimiento de Compromisos de Auditoría" },
      {
        name: "description",
        content: "Formulario para registrar un nuevo compromiso de auditoría.",
      },
      {
        property: "og:title",
        content: "Registrar compromiso | Seguimiento de Compromisos de Auditoría",
      },
      {
        property: "og:description",
        content: "Formulario para registrar un nuevo compromiso de auditoría.",
      },
    ],
  }),
  component: NuevoCompromiso,
});

function NuevoCompromiso() {
  const { desde } = Route.useSearch();
  const { obtener, crear } = useCompromisos();
  const navigate = useNavigate();
  const base = desde ? obtener(desde) : undefined;

  // Al agregar otro compromiso a una auditoría existente, se copian los datos de la auditoría.
  const iniciales = aFormulario(
    base
      ? {
          referenciaAuditoria: base.referenciaAuditoria,
          empresa: base.empresa,
          fechaAuditoria: base.fechaAuditoria,
          auditorNombre: base.auditorNombre,
          auditorEmail: base.auditorEmail,
        }
      : undefined,
  );

  return (
    <div className="mx-auto max-w-4xl">
      <EncabezadoPagina
        titulo="Registrar compromiso"
        descripcion={
          base
            ? `Nuevo compromiso para la auditoría ${base.referenciaAuditoria} (${base.empresa}).`
            : "Capture los datos del compromiso derivado de la auditoría."
        }
      />
      <FormularioCompromisoForm
        key={desde ?? "nuevo"}
        valoresIniciales={iniciales}
        textoGuardar="Registrar compromiso"
        onCancelar={() => navigate({ to: "/compromisos" })}
        onGuardar={(datos) => {
          const nuevo = crear(datos);
          toast.success("Compromiso registrado", {
            description: "Disponible mientras no recargue la página (modo demostración).",
          });
          navigate({ to: "/compromisos/$id", params: { id: nuevo.id } });
        }}
      />
    </div>
  );
}
