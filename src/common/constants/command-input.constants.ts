export const DEFAULT_COMMAND_INPUT_CLASS_NAME = "w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50";

export const PALETTE_COMMAND_INPUT_CLASS_NAME =
  "placeholder:text-muted-foreground/70 h-14 min-w-0 flex-1 bg-transparent px-0 text-base font-medium tracking-tight outline-hidden disabled:cursor-not-allowed disabled:opacity-50";

export const COMMAND_INPUT_CLASS_NAMES = {
  default: DEFAULT_COMMAND_INPUT_CLASS_NAME,
  palette: PALETTE_COMMAND_INPUT_CLASS_NAME,
} as const;
