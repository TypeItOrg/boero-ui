export type AsyncDropdownRow<TItem> =
  | { kind: "group"; key: string; label: string }
  | { kind: "item"; key: string; item: TItem; isFirstInGroup: boolean; isLastInGroup: boolean }
  | { kind: "default"; key: string }
  | { kind: "loader"; key: string };
