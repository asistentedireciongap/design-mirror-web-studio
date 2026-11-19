import { z } from "zod";

import { ESTADOS } from "./tipos";

const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Indique una fecha" });
const fechaOpcional = z.union([fecha, z.literal("")]);
const texto = (max: number, mensaje: string) =>
  z
    .string()
    .trim()
    .min(1, { message: mensaje })
    .max(max, { message: `Máximo ${max} caracteres` });

export const esquemaCompromiso = z
  .object({
    referenciaAuditoria: texto(50, "Indique la referencia o número de auditoría"),
    empresa: texto(120, "Indique la empresa"),
    fechaAuditoria: fecha,
    auditorNombre: texto(100, "Indique el nombre del auditor"),
    auditorEmail: z
      .string()
      .trim()
      .email({ message: "Correo electrónico no válido" })
      .max(255, { message: "Máximo 255 caracteres" }),
    descripcion: texto(1000, "Describa el compromiso"),
    responsable: texto(150, "Indique quién es responsable de cumplirlo"),
    fechaCompromiso: fecha,
    estado: z.enum(ESTADOS),
    fechaUltimoSeguimiento: fechaOpcional,
    observacionesSeguimiento: z.string().trim().max(1000, { message: "Máximo 1000 caracteres" }),
    fechaCumplimiento: fechaOpcional,
  })
  .refine((d) => d.fechaCompromiso >= d.fechaAuditoria, {
    path: ["fechaCompromiso"],
    message: "La fecha compromiso no puede ser anterior a la fecha de auditoría",
  })
  .refine((d) => d.estado !== "Completado" || d.fechaCumplimiento !== "", {
    path: ["fechaCumplimiento"],
    message: "Indique la fecha de cumplimiento",
  });

export type FormularioCompromiso = z.infer<typeof esquemaCompromiso>;

export const esquemaSeguimiento = z.object({
  fecha,
  descripcion: texto(1000, "Describa el seguimiento"),
  accionAuditor: texto(500, "Indique la acción realizada por el auditor"),
  avanceReportado: texto(500, "Indique el avance reportado por el responsable"),
});

export type FormularioSeguimiento = z.infer<typeof esquemaSeguimiento>;
