import { Loader2Icon } from "lucide-react";

export function DataTableLoadingOverlay({ label = "Cargando información" }: { label?: string }): React.ReactElement {
  return (
    <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
      <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label={label} role="status" />
    </div>
  );
}
