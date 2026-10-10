"use client";

import type { ComponentProps, ReactElement } from "react";

import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";

import { InputGroup, InputGroupAddon } from "@common/components/ui/input-group";
import { Kbd } from "@common/components/ui/kbd";
import { COMMAND_INPUT_CLASS_NAMES } from "@common/constants/command-input.constants";
import { cn } from "@common/utils/cn.util";

export function CommandInput({ className, shortcut, variant = "default", ...props }: CommandInputProps): ReactElement {
  const commandInput = <CommandPrimitive.Input data-slot="command-input" className={cn(COMMAND_INPUT_CLASS_NAMES[variant], className)} {...props} />;

  if (variant === "palette") {
    return (
      <div data-slot="command-input-wrapper" className="border-border/70 flex h-14 w-full items-center border-b pr-3 pl-3 sm:pr-4 sm:pl-4">
        {commandInput}
        {shortcut ? <Kbd className="bg-muted/70 border-border/60 hidden shrink-0 border px-1.5 text-[11px] sm:inline-flex">{shortcut}</Kbd> : null}
      </div>
    );
  }

  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="border-input/30 bg-input/30 h-8! rounded-lg! shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        {commandInput}
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export type CommandInputProps = ComponentProps<typeof CommandPrimitive.Input> & {
  variant?: "default" | "palette";
  shortcut?: string;
};
