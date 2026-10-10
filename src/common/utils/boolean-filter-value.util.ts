export function getBooleanFilterValue(value: boolean | undefined): "all" | "true" | "false" {
  if (value === undefined) {
    return "all";
  }

  return value ? "true" : "false";
}
