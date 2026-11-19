import { Badge } from "@/components/ui/badge";
import type { CondicionPlazo, Estado } from "@/lib/compromisos/tipos";

const VARIANTE_ESTADO = {
  Pendiente: "neutral",
  "En proceso": "info",
  Completado: "success",
} as const satisfies Record<Estado, string>;

const VARIANTE_CONDICION = {
  Vigente: "neutral",
  "Próximo a vencer": "warning",
  Vencido: "danger",
  Completado: "success",
} as const satisfies Record<CondicionPlazo, string>;

export function InsigniaEstado({ estado }: { estado: Estado }) {
  return (
    <Badge variant={VARIANTE_ESTADO[estado]} className="whitespace-nowrap font-medium">
      {estado}
    </Badge>
  );
}

export function InsigniaCondicion({ condicion }: { condicion: CondicionPlazo }) {
  return (
    <Badge variant={VARIANTE_CONDICION[condicion]} className="whitespace-nowrap font-medium">
      {condicion}
    </Badge>
  );
}
