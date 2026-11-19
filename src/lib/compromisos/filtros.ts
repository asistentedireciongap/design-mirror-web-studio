import { condicionPlazo, sinSeguimiento } from "./plazos";
import {
  CONDICIONES,
  ESTADOS,
  type Compromiso,
  type CondicionPlazo,
  type Estado,
  type FechaISO,
} from "./tipos";

/** Filtros de la lista de compromisos (se guardan en la dirección de la página). */
export interface Busqueda {
  q?: string | undefined;
  empresa?: string | undefined;
  auditor?: string | undefined;
  estado?: Estado | undefined;
  responsable?: string | undefined;
  condicion?: CondicionPlazo | undefined;
  sinSeguimiento?: boolean | undefined;
}

const texto = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v : undefined);

export function validarBusqueda(s: Record<string, unknown>): Busqueda {
  return {
    q: texto(s["q"]),
    empresa: texto(s["empresa"]),
    auditor: texto(s["auditor"]),
    estado: ESTADOS.includes(s["estado"] as Estado) ? (s["estado"] as Estado) : undefined,
    responsable: texto(s["responsable"]),
    condicion: CONDICIONES.includes(s["condicion"] as CondicionPlazo)
      ? (s["condicion"] as CondicionPlazo)
      : undefined,
    sinSeguimiento:
      s["sinSeguimiento"] === true || s["sinSeguimiento"] === "true" ? true : undefined,
  };
}

function normalizar(t: string) {
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function filtrarCompromisos(lista: Compromiso[], b: Busqueda, hoy: FechaISO): Compromiso[] {
  const q = b.q ? normalizar(b.q.trim()) : "";
  return lista.filter((c) => {
    if (b.empresa && c.empresa !== b.empresa) return false;
    if (b.auditor && c.auditorNombre !== b.auditor) return false;
    if (b.estado && c.estado !== b.estado) return false;
    if (b.responsable && c.responsable !== b.responsable) return false;
    if (b.condicion && condicionPlazo(c, hoy) !== b.condicion) return false;
    if (b.sinSeguimiento && !sinSeguimiento(c)) return false;
    if (q) {
      const texto = normalizar(
        [c.referenciaAuditoria, c.empresa, c.descripcion, c.responsable, c.auditorNombre].join(" "),
      );
      if (!texto.includes(q)) return false;
    }
    return true;
  });
}
