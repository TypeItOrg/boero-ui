type SelectionCountLabelOptions = {
  selectedItems: number;
  totalItems: number;
  singularItemLabel: string;
  pluralItemLabel: string;
  singularSelectionLabel: string;
  pluralSelectionLabel: string;
};

export function formatSelectionCountLabel({
  selectedItems,
  totalItems,
  singularItemLabel,
  pluralItemLabel,
  singularSelectionLabel,
  pluralSelectionLabel,
}: SelectionCountLabelOptions): string {
  const usesSingularLabel = totalItems === 1;
  const itemLabel = usesSingularLabel ? singularItemLabel : pluralItemLabel;
  const selectionLabel = usesSingularLabel ? singularSelectionLabel : pluralSelectionLabel;

  return `${selectedItems} de ${totalItems} ${itemLabel} ${selectionLabel}.`;
}
