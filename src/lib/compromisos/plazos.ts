import { diferenciaDias, sumarDias } from "@/lib/fechas";

import type { CondicionPlazo, Compromiso, FechaISO } from "./tipos";

/** Un compromiso abierto es "Próximo a vencer" con estos días naturales o menos restantes. */
export const DIAS_PROXIMO_A_VENCER = 5;
/** Primer recordatorio al auditor: estos días antes de la fecha compromiso. */
export const DIAS_RECORDATORIO_PREVIO = 5;
/** Después del vencimiento, se recuerda al auditor cada estos días mientras siga abierto. */
export const INTERVALO_RECORDATORIO_VENCIDO = 7;

type ConPlazo = Pick<Compromiso, "estado" | "fechaCompromiso">;

export function diasRestantes(c: Pick<Compromiso, "fechaCompromiso">, hoy: FechaISO): number {
  return diferenciaDias(c.fechaCompromiso, hoy);
}

/** Condición de plazo, calculada de forma independiente al estado (salvo Completado). */
export function condicionPlazo(c: ConPlazo, hoy: FechaISO): CondicionPlazo {
  if (c.estado === "Completado") return "Completado";
  const dias = diasRestantes(c, hoy);
  if (dias < 0) return "Vencido";
  if (dias <= DIAS_PROXIMO_A_VENCER) return "Próximo a vencer";
  return "Vigente";
}

/** Fecha más reciente entre el campo "último seguimiento" y el historial. */
export function ultimoSeguimiento(
  c: Pick<Compromiso, "fechaUltimoSeguimiento" | "seguimientos">,
): FechaISO | null {
  const fechas = c.seguimientos.map((s) => s.fecha);
  if (c.fechaUltimoSeguimiento) fechas.push(c.fechaUltimoSeguimiento);
  if (fechas.length === 0) return null;
  return fechas.reduce((max, f) => (f > max ? f : max));
}

/** Compromiso abierto sin ningún seguimiento registrado. */
export function sinSeguimiento(c: Compromiso): boolean {
  return c.estado !== "Completado" && ultimoSeguimiento(c) === null;
}

export type TipoRecordatorio = "previo" | "vencimiento" | "vencido";

export interface Recordatorio {
  fecha: FechaISO;
  tipo: TipoRecordatorio;
}

export const ETIQUETA_RECORDATORIO: Record<TipoRecordatorio, string> = {
  previo: `${DIAS_RECORDATORIO_PREVIO} días antes del vencimiento`,
  vencimiento: "Día de vencimiento",
  vencido: `Recordatorio semanal (vencido)`,
};

/**
 * Calendario de recordatorios al auditor asignado, desde el inicio hasta `hasta` (inclusive).
 * Un compromiso Completado no tiene recordatorios.
 */
export function calendarioRecordatorios(c: ConPlazo, hasta: FechaISO): Recordatorio[] {
  if (c.estado === "Completado") return [];
  const lista: Recordatorio[] = [];
  const previo = sumarDias(c.fechaCompromiso, -DIAS_RECORDATORIO_PREVIO);
  if (previo <= hasta) lista.push({ fecha: previo, tipo: "previo" });
  if (c.fechaCompromiso <= hasta) lista.push({ fecha: c.fechaCompromiso, tipo: "vencimiento" });
  let siguiente = sumarDias(c.fechaCompromiso, INTERVALO_RECORDATORIO_VENCIDO);
  while (siguiente <= hasta) {
    lista.push({ fecha: siguiente, tipo: "vencido" });
    siguiente = sumarDias(siguiente, INTERVALO_RECORDATORIO_VENCIDO);
  }
  return lista;
}

/** Próximo recordatorio pendiente (hoy o después), o null si ya no corresponde enviar. */
export function proximoRecordatorio(c: ConPlazo, hoy: FechaISO): Recordatorio | null {
  if (c.estado === "Completado") return null;
  const previo = sumarDias(c.fechaCompromiso, -DIAS_RECORDATORIO_PREVIO);
  if (hoy <= previo) return { fecha: previo, tipo: "previo" };
  if (hoy <= c.fechaCompromiso) return { fecha: c.fechaCompromiso, tipo: "vencimiento" };
  const diasVencido = diferenciaDias(hoy, c.fechaCompromiso);
  const semanas = Math.ceil(diasVencido / INTERVALO_RECORDATORIO_VENCIDO);
  return {
    fecha: sumarDias(c.fechaCompromiso, semanas * INTERVALO_RECORDATORIO_VENCIDO),
    tipo: "vencido",
  };
}

export interface Metricas {
  total: number;
  pendientes: number;
  enProceso: number;
  completados: number;
  proximosAVencer: number;
  vencidos: number;
  sinSeguimiento: number;
}

export function calcularMetricas(lista: Compromiso[], hoy: FechaISO): Metricas {
  const m: Metricas = {
    total: lista.length,
    pendientes: 0,
    enProceso: 0,
    completados: 0,
    proximosAVencer: 0,
    vencidos: 0,
    sinSeguimiento: 0,
  };
  for (const c of lista) {
    if (c.estado === "Pendiente") m.pendientes++;
    if (c.estado === "En proceso") m.enProceso++;
    if (c.estado === "Completado") m.completados++;
    const cond = condicionPlazo(c, hoy);
    if (cond === "Próximo a vencer") m.proximosAVencer++;
    if (cond === "Vencido") m.vencidos++;
    if (sinSeguimiento(c)) m.sinSeguimiento++;
  }
  return m;
}

export interface ResumenAuditor {
  nombre: string;
  email: string;
  abiertos: number;
  vencidos: number;
  sinSeguimiento: number;
  ultimoSeguimiento: FechaISO | null;
}

/** Resumen por auditor para saber si están al día con su seguimiento. */
export function resumenPorAuditor(lista: Compromiso[], hoy: FechaISO): ResumenAuditor[] {
  const mapa = new Map<string, ResumenAuditor>();
  for (const c of lista) {
    const r = mapa.get(c.auditorNombre) ?? {
      nombre: c.auditorNombre,
      email: c.auditorEmail,
      abiertos: 0,
      vencidos: 0,
      sinSeguimiento: 0,
      ultimoSeguimiento: null,
    };
    if (c.estado !== "Completado") r.abiertos++;
    if (condicionPlazo(c, hoy) === "Vencido") r.vencidos++;
    if (sinSeguimiento(c)) r.sinSeguimiento++;
    const u = ultimoSeguimiento(c);
    if (u && (!r.ultimoSeguimiento || u > r.ultimoSeguimiento)) r.ultimoSeguimiento = u;
    mapa.set(c.auditorNombre, r);
  }
  return [...mapa.values()].sort(
    (a, b) => b.vencidos + b.sinSeguimiento - (a.vencidos + a.sinSeguimiento),
  );
}

/** Abiertos que requieren atención: vencidos, próximos a vencer o sin seguimiento. */
export function requierenAtencion(lista: Compromiso[], hoy: FechaISO): Compromiso[] {
  const peso = (c: Compromiso) => {
    const cond = condicionPlazo(c, hoy);
    return (
      (cond === "Vencido" ? 4 : cond === "Próximo a vencer" ? 2 : 0) + (sinSeguimiento(c) ? 1 : 0)
    );
  };
  return lista
    .filter((c) => peso(c) > 0)
    .sort((a, b) => peso(b) - peso(a) || a.fechaCompromiso.localeCompare(b.fechaCompromiso));
}
