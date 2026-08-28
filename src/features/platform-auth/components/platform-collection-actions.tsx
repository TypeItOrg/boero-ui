export function PlatformCollectionActions({ children }: { children?: React.ReactNode }): React.ReactElement | null {
  if (!children) return null;

  return <div className="flex shrink-0 justify-end [&>*]:w-full sm:[&>*]:w-auto">{children}</div>;
}
