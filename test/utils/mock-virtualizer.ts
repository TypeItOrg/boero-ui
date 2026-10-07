export function mockVirtualizer({
  count,
  estimateSize,
  getItemKey,
}: {
  count: number;
  estimateSize: (index: number) => number;
  getItemKey?: (index: number) => string | number;
}) {
  let offset = 0;
  const items = Array.from({ length: count }, (_, index) => {
    const size = estimateSize(index);
    const start = offset;
    offset += size;

    return { index, key: getItemKey?.(index) ?? index, size, start, end: offset };
  });

  return {
    getVirtualItems: () => items,
    getTotalSize: () => offset,
    getOffsetForIndex: (index: number) => (items[index] ? [items[index].start, "start"] : undefined),
    scrollToOffset: jest.fn(),
    measure: jest.fn(),
    measureElement: jest.fn(),
  };
}
