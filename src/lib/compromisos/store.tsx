import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { hoyISO } from "@/lib/fechas";

import { crearDatosDemo } from "./datos-demo";
import type { Compromiso, DatosCompromiso, DatosSeguimiento, FechaISO } from "./tipos";

/**
 * Almacén de compromisos en memoria (modo demostración).
 * Las acciones tienen la misma forma que tendrá el futuro repositorio persistente,
 * para poder sustituir esta implementación sin cambiar las pantallas.
 */
interface AlmacenCompromisos {
  hoy: FechaISO;
  compromisos: Compromiso[];
  obtener: (id: string) => Compromiso | undefined;
  crear: (datos: DatosCompromiso) => Compromiso;
  actualizar: (id: string, datos: DatosCompromiso) => void;
  agregarSeguimiento: (id: string, datos: DatosSeguimiento) => void;
}

const Contexto = createContext<AlmacenCompromisos | null>(null);

function nuevoId(prefijo: string) {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ProveedorCompromisos({ children }: { children: ReactNode }) {
  const [hoy] = useState(hoyISO);
  const [compromisos, setCompromisos] = useState<Compromiso[]>(() => crearDatosDemo(hoy));

  const obtener = useCallback((id: string) => compromisos.find((c) => c.id === id), [compromisos]);

  const crear = useCallback((datos: DatosCompromiso) => {
    const nuevo: Compromiso = { ...datos, id: nuevoId("c"), seguimientos: [] };
    setCompromisos((prev) => [nuevo, ...prev]);
    return nuevo;
  }, []);

  const actualizar = useCallback((id: string, datos: DatosCompromiso) => {
    setCompromisos((prev) => prev.map((c) => (c.id === id ? { ...c, ...datos } : c)));
  }, []);

  const agregarSeguimiento = useCallback((id: string, datos: DatosSeguimiento) => {
    setCompromisos((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const ultimo =
          !c.fechaUltimoSeguimiento || datos.fecha > c.fechaUltimoSeguimiento
            ? datos.fecha
            : c.fechaUltimoSeguimiento;
        return {
          ...c,
          fechaUltimoSeguimiento: ultimo,
          // Se agrega al historial; nunca se reemplazan entradas anteriores.
          seguimientos: [...c.seguimientos, { ...datos, id: nuevoId("s") }],
        };
      }),
    );
  }, []);

  const valor = useMemo(
    () => ({ hoy, compromisos, obtener, crear, actualizar, agregarSeguimiento }),
    [hoy, compromisos, obtener, crear, actualizar, agregarSeguimiento],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCompromisos() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useCompromisos debe usarse dentro de ProveedorCompromisos");
  return ctx;
}
