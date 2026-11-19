import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { EncabezadoPagina } from "@/components/app-shell";
import { CompromisoNoEncontrado } from "@/components/compromisos/no-encontrado";
import {
  aFormulario,
  FormularioCompromisoForm,
} from "@/components/compromisos/formulario-compromiso";
import { useCompromisos } from "@/lib/compromisos/store";

export const Route = createFileRoute("/compromisos/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar compromiso | Seguimiento de Compromisos de Auditoría" },
      { name: "description", content: "Editar los datos de un compromiso de auditoría." },
      {
        property: "og:title",
        content: "Editar compromiso | Seguimiento de Compromisos de Auditoría",
      },
      { property: "og:description", content: "Editar los datos de un compromiso de auditoría." },
    ],
  }),
  component: EditarCompromiso,
});

function EditarCompromiso() {
  const { id } = Route.useParams();
  const { obtener, actualizar } = useCompromisos();
  const navigate = useNavigate();
  const compromiso = obtener(id);

  if (!compromiso) return <CompromisoNoEncontrado />;

  const volver = () => navigate({ to: "/compromisos/$id", params: { id } });

  return (
    <div className="mx-auto max-w-4xl">
      <EncabezadoPagina
        titulo="Editar compromiso"
        descripcion={`${compromiso.referenciaAuditoria} · ${compromiso.empresa}`}
      />
      <FormularioCompromisoForm
        valoresIniciales={aFormulario(compromiso)}
        textoGuardar="Guardar cambios"
        onCancelar={volver}
        onGuardar={(datos) => {
          actualizar(id, datos);
          toast.success("Cambios aplicados", {
            description: "Disponibles mientras no recargue la página (modo demostración).",
          });
          volver();
        }}
      />
    </div>
  );
}
