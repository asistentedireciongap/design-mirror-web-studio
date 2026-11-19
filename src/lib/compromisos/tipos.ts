export const ESTADOS = ["Pendiente", "En proceso", "Completado"] as const;
export type Estado = (typeof ESTADOS)[number];

export const CONDICIONES = ["Vigente", "Próximo a vencer", "Vencido", "Completado"] as const;
export type CondicionPlazo = (typeof CONDICIONES)[number];

/** Fechas siempre como texto "AAAA-MM-DD" (fecha local, sin hora). */
export type FechaISO = string;

export interface Seguimiento {
  id: string;
  fecha: FechaISO;
  descripcion: string;
  accionAuditor: string;
  avanceReportado: string;
}

export interface Compromiso {
  id: string;
  referenciaAuditoria: string;
  empresa: string;
  fechaAuditoria: FechaISO;
  auditorNombre: string;
  auditorEmail: string;
  descripcion: string;
  responsable: string;
  fechaCompromiso: FechaISO;
  estado: Estado;
  fechaUltimoSeguimiento: FechaISO | null;
  observacionesSeguimiento: string;
  fechaCumplimiento: FechaISO | null;
  seguimientos: Seguimiento[];
}

export type DatosCompromiso = Omit<Compromiso, "id" | "seguimientos">;
export type DatosSeguimiento = Omit<Seguimiento, "id">;
