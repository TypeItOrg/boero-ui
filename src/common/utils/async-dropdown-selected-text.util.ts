import type { AsyncDropdownDefaultOption } from "@common/types/async-dropdown-default-option.types";

export function getSelectedText<TItem>({
  defaultOption,
  getItemLabel,
  placeholder,
  selectedItem,
  selectedLabel,
  value,
}: SelectedTextInput<TItem>): string {
  if (selectedItem) {
    return getItemLabel(selectedItem);
  }

  if (selectedLabel) {
    return selectedLabel;
  }

  if (defaultOption && value === defaultOption.value) {
    return defaultOption.label;
  }

  if (value) {
    return value;
  }

  return placeholder;
}

export type SelectedTextInput<TItem> = {
  defaultOption?: AsyncDropdownDefaultOption;
  getItemLabel: (item: TItem) => string;
  placeholder: string;
  selectedItem: TItem | undefined;
  selectedLabel: string | undefined;
  value: string | undefined;
};
