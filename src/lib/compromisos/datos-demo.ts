import { sumarDias } from "@/lib/fechas";

import type { Compromiso, Estado, FechaISO, Seguimiento } from "./tipos";

/**
 * Datos ficticios de demostración. Las fechas se calculan respecto a "hoy"
 * para que el panel muestre siempre casos vigentes, próximos a vencer y vencidos.
 */
const AUDITORES = {
  lucia: { auditorNombre: "Lucía Herrera Pech", auditorEmail: "lucia.herrera@ejemplo.com" },
  marco: { auditorNombre: "Marco Antonio Cetina", auditorEmail: "marco.cetina@ejemplo.com" },
  sofia: { auditorNombre: "Sofía Canul Ramírez", auditorEmail: "sofia.canul@ejemplo.com" },
  diego: { auditorNombre: "Diego Arjona Medina", auditorEmail: "diego.arjona@ejemplo.com" },
};

type Auditor = keyof typeof AUDITORES;

interface Semilla {
  ref: string;
  empresa: string;
  auditoriaHace: number;
  auditor: Auditor;
  descripcion: string;
  responsable: string;
  venceEn: number;
  estado: Estado;
  observaciones?: string;
  cumplidoHace?: number;
  seguimientos?: Array<{ hace: number; descripcion: string; accion: string; avance: string }>;
}

const SEMILLAS: Semilla[] = [
  {
    ref: "AUD-2026-014",
    empresa: "Logística del Golfo S.A. de C.V.",
    auditoriaHace: 60,
    auditor: "lucia",
    descripcion: "Actualizar el procedimiento de resguardo de expedientes de importación.",
    responsable: "Ricardo Pacheco (Gerente de Operaciones)",
    venceEn: -12,
    estado: "En proceso",
    observaciones: "El borrador del procedimiento está en revisión por Dirección.",
    seguimientos: [
      {
        hace: 30,
        descripcion: "Reunión inicial con el gerente para revisar el hallazgo.",
        accion: "Se acordó calendario de trabajo.",
        avance: "Sin avance, se asignó responsable interno.",
      },
      {
        hace: 16,
        descripcion: "Revisión del borrador del procedimiento.",
        accion: "Se enviaron comentarios por correo.",
        avance: "Borrador al 60 %.",
      },
    ],
  },
  {
    ref: "AUD-2026-014",
    empresa: "Logística del Golfo S.A. de C.V.",
    auditoriaHace: 60,
    auditor: "lucia",
    descripcion:
      "Capacitar al personal de almacén en el control de inventario de mercancía en depósito.",
    responsable: "Ana Gabriela Sosa (Jefa de Almacén)",
    venceEn: 3,
    estado: "Pendiente",
  },
  {
    ref: "AUD-2026-014",
    empresa: "Logística del Golfo S.A. de C.V.",
    auditoriaHace: 60,
    auditor: "lucia",
    descripcion: "Conciliar los pedimentos del primer semestre contra registros contables.",
    responsable: "Jorge Uc (Contador General)",
    venceEn: -20,
    estado: "Completado",
    cumplidoHace: 22,
    observaciones: "Conciliación entregada y validada.",
    seguimientos: [
      {
        hace: 35,
        descripcion: "Solicitud de avance de la conciliación.",
        accion: "Llamada con el contador.",
        avance: "Conciliación al 50 %.",
      },
      {
        hace: 22,
        descripcion: "Recepción de la conciliación final.",
        accion: "Se validó la evidencia.",
        avance: "Concluido.",
      },
    ],
  },
  {
    ref: "AUD-2026-021",
    empresa: "Transportes Mayab",
    auditoriaHace: 45,
    auditor: "marco",
    descripcion: "Implementar bitácora de mantenimiento preventivo de unidades.",
    responsable: "Fernando Chan (Coordinador de Flotilla)",
    venceEn: 18,
    estado: "En proceso",
    observaciones: "Formato de bitácora aprobado.",
    seguimientos: [
      {
        hace: 6,
        descripcion: "Revisión del formato de bitácora propuesto.",
        accion: "Se aprobó el formato.",
        avance: "Bitácora en uso en 4 de 12 unidades.",
      },
    ],
  },
  {
    ref: "AUD-2026-021",
    empresa: "Transportes Mayab",
    auditoriaHace: 45,
    auditor: "marco",
    descripcion: "Renovar las pólizas de seguro vencidas de dos tractocamiones.",
    responsable: "Patricia Dzib (Administración)",
    venceEn: -5,
    estado: "Pendiente",
  },
  {
    ref: "AUD-2026-021",
    empresa: "Transportes Mayab",
    auditoriaHace: 45,
    auditor: "marco",
    descripcion: "Documentar el control de acceso al patio de maniobras.",
    responsable: "Fernando Chan (Coordinador de Flotilla)",
    venceEn: 1,
    estado: "En proceso",
    seguimientos: [
      {
        hace: 25,
        descripcion: "Solicitud de evidencia del control de acceso.",
        accion: "Correo al coordinador.",
        avance: "Se instaló caseta; falta registro escrito.",
      },
    ],
  },
  {
    ref: "AUD-2026-030",
    empresa: "Almacenes Peninsulares",
    auditoriaHace: 30,
    auditor: "sofia",
    descripcion: "Corregir diferencias en el inventario físico de la bodega 3.",
    responsable: "Raúl Novelo (Gerente de Almacenes)",
    venceEn: 9,
    estado: "En proceso",
    observaciones: "Se programó segundo conteo.",
    seguimientos: [
      {
        hace: 12,
        descripcion: "Primer conteo físico con el gerente.",
        accion: "Se levantó acta de diferencias.",
        avance: "Diferencias identificadas en 14 partidas.",
      },
      {
        hace: 4,
        descripcion: "Seguimiento al ajuste de partidas.",
        accion: "Visita a bodega.",
        avance: "9 de 14 partidas ajustadas.",
      },
    ],
  },
  {
    ref: "AUD-2026-030",
    empresa: "Almacenes Peninsulares",
    auditoriaHace: 30,
    auditor: "sofia",
    descripcion: "Establecer firma dual para salidas de mercancía de alto valor.",
    responsable: "Claudia Ek (Supervisora de Embarques)",
    venceEn: 25,
    estado: "Pendiente",
  },
  {
    ref: "AUD-2026-030",
    empresa: "Almacenes Peninsulares",
    auditoriaHace: 30,
    auditor: "sofia",
    descripcion: "Respaldar semanalmente el sistema de control de inventarios.",
    responsable: "Héctor Can (Sistemas)",
    venceEn: -3,
    estado: "Completado",
    cumplidoHace: 5,
    seguimientos: [
      {
        hace: 5,
        descripcion: "Verificación de respaldos programados.",
        accion: "Se revisaron los registros del sistema.",
        avance: "Respaldo semanal activo.",
      },
    ],
  },
  {
    ref: "AUD-2026-037",
    empresa: "Agencia Aduanal Costa Esmeralda",
    auditoriaHace: 20,
    auditor: "diego",
    descripcion: "Actualizar el padrón de clientes con documentación vigente.",
    responsable: "Mariana Burgos (Coordinadora de Clientes)",
    venceEn: -9,
    estado: "En proceso",
    seguimientos: [
      {
        hace: 15,
        descripcion: "Revisión de expedientes de clientes.",
        accion: "Se entregó lista de faltantes.",
        avance: "40 % de expedientes actualizados.",
      },
    ],
  },
  {
    ref: "AUD-2026-037",
    empresa: "Agencia Aduanal Costa Esmeralda",
    auditoriaHace: 20,
    auditor: "diego",
    descripcion: "Definir responsable de validación de clasificación arancelaria.",
    responsable: "Luis Alberto Poot (Director de Operaciones)",
    venceEn: 5,
    estado: "Pendiente",
  },
  {
    ref: "AUD-2026-037",
    empresa: "Agencia Aduanal Costa Esmeralda",
    auditoriaHace: 20,
    auditor: "diego",
    descripcion: "Archivar digitalmente las cartas de encomienda del último año.",
    responsable: "Mariana Burgos (Coordinadora de Clientes)",
    venceEn: 40,
    estado: "Pendiente",
  },
  {
    ref: "AUD-2026-042",
    empresa: "Transportes Mayab",
    auditoriaHace: 10,
    auditor: "lucia",
    descripcion: "Registrar los permisos de circulación de las unidades nuevas.",
    responsable: "Patricia Dzib (Administración)",
    venceEn: 14,
    estado: "Pendiente",
  },
  {
    ref: "AUD-2026-042",
    empresa: "Transportes Mayab",
    auditoriaHace: 10,
    auditor: "marco",
    descripcion: "Corregir la facturación de fletes con datos fiscales incompletos.",
    responsable: "Jimena Castillo (Facturación)",
    venceEn: -1,
    estado: "En proceso",
    observaciones: "Se corrigieron 18 de 25 facturas.",
    seguimientos: [
      {
        hace: 3,
        descripcion: "Revisión de facturas corregidas.",
        accion: "Llamada con facturación.",
        avance: "18 de 25 facturas corregidas.",
      },
    ],
  },
];

export function crearDatosDemo(hoy: FechaISO): Compromiso[] {
  return SEMILLAS.map((s, i) => {
    const seguimientos: Seguimiento[] = (s.seguimientos ?? []).map((seg, j) => ({
      id: `demo-${i + 1}-s${j + 1}`,
      fecha: sumarDias(hoy, -seg.hace),
      descripcion: seg.descripcion,
      accionAuditor: seg.accion,
      avanceReportado: seg.avance,
    }));
    const ultimo = seguimientos.at(-1)?.fecha ?? null;
    return {
      id: `demo-${i + 1}`,
      referenciaAuditoria: s.ref,
      empresa: s.empresa,
      fechaAuditoria: sumarDias(hoy, -s.auditoriaHace),
      ...AUDITORES[s.auditor],
      descripcion: s.descripcion,
      responsable: s.responsable,
      fechaCompromiso: sumarDias(hoy, s.venceEn),
      estado: s.estado,
      fechaUltimoSeguimiento: ultimo,
      observacionesSeguimiento: s.observaciones ?? "",
      fechaCumplimiento: s.cumplidoHace !== undefined ? sumarDias(hoy, -s.cumplidoHace) : null,
      seguimientos,
    };
  });
}
