import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import type { FechaISO } from "@/lib/compromisos/tipos";

/** Fecha local de hoy en formato AAAA-MM-DD. */
export function hoyISO(): FechaISO {
  return format(new Date(), "yyyy-MM-dd");
}

export function sumarDias(fecha: FechaISO, dias: number): FechaISO {
  return format(addDays(parseISO(fecha), dias), "yyyy-MM-dd");
}

/** Días de `desde` a `hasta` (positivo si `hasta` es posterior). */
export function diferenciaDias(hasta: FechaISO, desde: FechaISO): number {
  return differenceInCalendarDays(parseISO(hasta), parseISO(desde));
}

export function formatearFecha(fecha: FechaISO | null | undefined): string {
  if (!fecha) return "—";
  return format(parseISO(fecha), "dd/MM/yyyy");
}

export function formatearFechaLarga(fecha: FechaISO): string {
  return format(parseISO(fecha), "d 'de' MMMM 'de' yyyy", { locale: es });
}
