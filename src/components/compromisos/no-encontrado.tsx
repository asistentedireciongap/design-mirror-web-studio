import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CompromisoNoEncontrado() {
  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <h1 className="text-lg font-semibold">Compromiso no encontrado</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Es posible que se haya registrado en esta demostración y se perdiera al recargar la página.
      </p>
      <Button asChild className="mt-6">
        <Link to="/compromisos">Volver a compromisos</Link>
      </Button>
    </Card>
  );
}
