import * as React from "react";

import type { InstitutionPermission } from "@features/roles/types/institution-permission.types";
import type { PermissionTreeNode } from "@features/roles/utils/permission-hierarchy.util";

type PermissionHierarchyProps = {
  nodes: readonly PermissionTreeNode[];
  renderPermission: (permission: InstitutionPermission) => React.ReactElement;
  layout?: "tree" | "columns";
};

export function PermissionHierarchy({ nodes, renderPermission, layout = "tree" }: PermissionHierarchyProps): React.ReactElement {
  const renderedNodes = nodes.map((node) => {
    const content = (
      <>
        {renderPermission(node.permission)}
        {node.children.length > 0 ? (
          <div className="border-border/50 ml-6 flex flex-col gap-3 border-l pl-3">
            <PermissionHierarchy nodes={node.children} renderPermission={renderPermission} />
          </div>
        ) : null}
      </>
    );

    return layout === "columns" ? (
      <div key={node.permission.code} className="flex min-w-0 flex-col gap-3">
        {content}
      </div>
    ) : (
      <React.Fragment key={node.permission.code}>{content}</React.Fragment>
    );
  });

  return layout === "columns" ? <div className="grid gap-x-8 gap-y-4 2xl:grid-cols-2">{renderedNodes}</div> : <>{renderedNodes}</>;
}
