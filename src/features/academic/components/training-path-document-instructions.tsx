"use client";

import { useId, useState, type ReactElement } from "react";

import { InfoIcon, XIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@common/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@common/components/ui/tooltip";
import { cn } from "@common/utils/cn.util";

export function TrainingPathDocumentInstructions({
  name,
  instructions,
  specificInstructions,
  className,
}: {
  name: string;
  instructions: string;
  specificInstructions?: string | null;
  className?: string;
}): ReactElement | null {
  const [open, setOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const hasGeneral = Boolean(instructions?.trim());
  const hasSpecific = Boolean(specificInstructions?.trim());
  const hasBoth = hasGeneral && hasSpecific;

  if (!hasGeneral && !hasSpecific) {
    return null;
  }

  const title = hasBoth ? "Instrucciones" : hasGeneral ? "Instrucciones generales" : "Instrucciones del trayecto";

  function changeOpen(value: boolean): void {
    setOpen(value);

    if (value) {
      setTooltipOpen(false);
    }
  }

  const trigger = (
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("text-muted-foreground", className)}
        aria-label={`Ver instrucciones de ${name}`}
      >
        <InfoIcon aria-hidden="true" />
      </Button>
    </PopoverTrigger>
  );

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <Tooltip open={!open && tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        {!open ? <TooltipContent side="top">Ver instrucciones</TooltipContent> : null}
      </Tooltip>
      <PopoverContent
        align="start"
        sideOffset={6}
        collisionPadding={16}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="max-h-[min(24rem,var(--radix-popover-content-available-height))] w-80 max-w-[calc(100vw-2rem)] gap-4 overflow-y-auto p-4"
      >
        <div className="flex items-start gap-2">
          <PopoverHeader className="min-w-0 flex-1">
            <PopoverTitle id={titleId}>{title}</PopoverTitle>
            <PopoverDescription id={descriptionId} className="break-words">
              {name}
            </PopoverDescription>
          </PopoverHeader>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground -mt-1 -mr-1"
            aria-label="Cerrar instrucciones"
            onClick={() => changeOpen(false)}
          >
            <XIcon aria-hidden="true" />
          </Button>
        </div>
        {hasGeneral ? (
          <div className="space-y-1">
            {hasBoth ? <h3 className="text-sm font-medium">Instrucciones generales</h3> : null}
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{instructions}</p>
          </div>
        ) : null}
        {hasSpecific ? (
          <div className="space-y-1">
            {hasBoth ? <h3 className="text-sm font-medium">Instrucciones del trayecto</h3> : null}
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{specificInstructions}</p>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
