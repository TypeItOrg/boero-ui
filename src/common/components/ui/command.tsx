"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@common/utils/cn.util";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { InputGroup, InputGroupAddon } from "@common/components/ui/input-group";
import { Kbd } from "@common/components/ui/kbd";
import { SearchIcon, CheckIcon } from "lucide-react";

type CommandInputProps = React.ComponentProps<typeof CommandPrimitive.Input> & {
  variant?: "default" | "palette";
  shortcut?: string;
};

const DEFAULT_COMMAND_INPUT_CLASS_NAME = "w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50";
const PALETTE_COMMAND_INPUT_CLASS_NAME =
  "placeholder:text-muted-foreground/70 h-14 min-w-0 flex-1 bg-transparent px-0 text-base font-medium tracking-tight outline-hidden disabled:cursor-not-allowed disabled:opacity-50";
const COMMAND_INPUT_CLASS_NAMES = {
  default: DEFAULT_COMMAND_INPUT_CLASS_NAME,
  palette: PALETTE_COMMAND_INPUT_CLASS_NAME,
} as const;

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn("bg-popover text-popover-foreground flex size-full flex-col overflow-hidden rounded-xl! p-1", className)}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  onCloseAutoFocus?: React.ComponentProps<typeof DialogContent>["onCloseAutoFocus"];
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0", className)}
        showCloseButton={showCloseButton}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({ className, shortcut, variant = "default", ...props }: CommandInputProps): React.ReactElement {
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

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none", className)}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className={cn("py-6 text-center text-sm", className)} {...props} />;
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator data-slot="command-separator" className={cn("bg-border -mx-1 h-px", className)} {...props} />;
}

function CommandItem({ className, children, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "group/command-item data-selected:bg-muted data-selected:text-foreground data-selected:*:[svg]:text-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("text-muted-foreground group-data-selected/command-item:text-foreground ml-auto text-xs tracking-widest", className)}
      {...props}
    />
  );
}

export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator };
