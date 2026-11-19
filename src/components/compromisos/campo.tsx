import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  opcional,
  className,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string | undefined;
  ayuda?: string | undefined;
  opcional?: boolean | undefined;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {etiqueta}
        {opcional && <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : ayuda ? (
        <p className="text-xs text-muted-foreground">{ayuda}</p>
      ) : null}
    </div>
  );
}
