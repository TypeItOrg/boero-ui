export function groupDropdownItems<TItem>(
  items: readonly TItem[],
  getItemGroup?: (item: TItem) => string | undefined,
  groupOrder: readonly string[] = [],
  compareGroups?: (left: string, right: string) => number,
): { label: string | undefined; items: TItem[] }[] {
  if (!getItemGroup) {
    return [{ label: undefined, items: [...items] }];
  }

  const groups = new Map<string | undefined, TItem[]>();

  for (const item of items) {
    const label = getItemGroup(item);
    const group = groups.get(label) ?? [];

    group.push(item);
    groups.set(label, group);
  }

  const labels = [...new Set([...groupOrder.filter((label) => groups.has(label)), ...groups.keys()])];

  if (compareGroups) {
    labels.sort((left, right) => {
      if (left === undefined) {
        return right === undefined ? 0 : 1;
      }

      if (right === undefined) {
        return -1;
      }

      const leftIndex = groupOrder.indexOf(left);
      const rightIndex = groupOrder.indexOf(right);

      if (leftIndex >= 0 || rightIndex >= 0) {
        return (leftIndex >= 0 ? leftIndex : groupOrder.length) - (rightIndex >= 0 ? rightIndex : groupOrder.length);
      }

      return compareGroups(left, right);
    });
  }

  return labels.map((label) => ({ label, items: groups.get(label) ?? [] }));
}
