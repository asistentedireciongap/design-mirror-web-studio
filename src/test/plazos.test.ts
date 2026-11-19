import { describe, expect, it } from "vitest";

import {
  calcularMetricas,
  calendarioRecordatorios,
  condicionPlazo,
  proximoRecordatorio,
  sinSeguimiento,
} from "@/lib/compromisos/plazos";
import type { Compromiso } from "@/lib/compromisos/tipos";

const HOY = "2026-11-19";

function compromiso(parcial: Partial<Compromiso>): Compromiso {
  return {
    id: "x",
    referenciaAuditoria: "AUD-1",
    empresa: "Empresa",
    fechaAuditoria: "2026-10-01",
    auditorNombre: "Auditor",
    auditorEmail: "a@ejemplo.com",
    descripcion: "d",
    responsable: "r",
    fechaCompromiso: "2026-12-31",
    estado: "Pendiente",
    fechaUltimoSeguimiento: null,
    observacionesSeguimiento: "",
    fechaCumplimiento: null,
    seguimientos: [],
    ...parcial,
  };
}

describe("Condición de plazo", () => {
  it("es Próximo a vencer con 5 días naturales restantes", () => {
    expect(condicionPlazo({ estado: "Pendiente", fechaCompromiso: "2026-11-24" }, HOY)).toBe(
      "Próximo a vencer",
    );
  });

  it("es Vigente con 6 días restantes", () => {
    expect(condicionPlazo({ estado: "Pendiente", fechaCompromiso: "2026-11-25" }, HOY)).toBe(
      "Vigente",
    );
  });

  it("es Próximo a vencer el mismo día de vencimiento", () => {
    expect(condicionPlazo({ estado: "Pendiente", fechaCompromiso: HOY }, HOY)).toBe(
      "Próximo a vencer",
    );
  });

  it("un compromiso En proceso puede estar Vencido", () => {
    expect(condicionPlazo({ estado: "En proceso", fechaCompromiso: "2026-11-18" }, HOY)).toBe(
      "Vencido",
    );
  });

  it("un compromiso Completado es Completado aunque su fecha haya pasado", () => {
    expect(condicionPlazo({ estado: "Completado", fechaCompromiso: "2026-10-01" }, HOY)).toBe(
      "Completado",
    );
  });
});

describe("Recordatorios al auditor", () => {
  it("se programan 5 días antes, el día de vencimiento y cada 7 días después", () => {
    const lista = calendarioRecordatorios(
      { estado: "En proceso", fechaCompromiso: "2026-11-10" },
      "2026-11-30",
    );
    expect(lista.map((r) => r.fecha)).toEqual([
      "2026-11-05",
      "2026-11-10",
      "2026-11-17",
      "2026-11-24",
    ]);
  });

  it("se detienen cuando el compromiso está Completado", () => {
    const c = { estado: "Completado" as const, fechaCompromiso: "2026-11-10" };
    expect(calendarioRecordatorios(c, "2026-12-31")).toEqual([]);
    expect(proximoRecordatorio(c, HOY)).toBeNull();
  });

  it("el próximo recordatorio de un vencido cae en el siguiente múltiplo de 7 días", () => {
    expect(
      proximoRecordatorio({ estado: "Pendiente", fechaCompromiso: "2026-11-10" }, HOY),
    ).toEqual({ fecha: "2026-11-24", tipo: "vencido" });
  });

  it("dentro de los 5 días previos, el próximo es el día de vencimiento", () => {
    expect(
      proximoRecordatorio({ estado: "Pendiente", fechaCompromiso: "2026-11-22" }, HOY),
    ).toEqual({ fecha: "2026-11-22", tipo: "vencimiento" });
  });
});

describe("Panel", () => {
  it("cuenta como sin seguimiento solo los abiertos sin ninguna fecha de seguimiento", () => {
    expect(sinSeguimiento(compromiso({}))).toBe(true);
    expect(sinSeguimiento(compromiso({ fechaUltimoSeguimiento: "2026-11-01" }))).toBe(false);
    expect(sinSeguimiento(compromiso({ estado: "Completado" }))).toBe(false);
  });

  it("calcula los totales por estado y condición", () => {
    const m = calcularMetricas(
      [
        compromiso({ estado: "Pendiente", fechaCompromiso: "2026-11-21" }),
        compromiso({ estado: "En proceso", fechaCompromiso: "2026-11-01" }),
        compromiso({ estado: "Completado", fechaCompromiso: "2026-11-01" }),
      ],
      HOY,
    );
    expect(m).toEqual({
      total: 3,
      pendientes: 1,
      enProceso: 1,
      completados: 1,
      proximosAVencer: 1,
      vencidos: 1,
      sinSeguimiento: 2,
    });
  });
});
