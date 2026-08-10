import * as React from "react";

import type { InstitutionPermission } from "@features/roles/types/institution-permission.types";
import type { PermissionTreeNode } from "@features/roles/utils/permission-hierarchy.util";

type PermissionHierarchyProps = {
  nodes: readonly PermissionTreeNode[];
  renderPermission: (permission: InstitutionPermission) => React.ReactElement;
};

export function PermissionHierarchy({ nodes, renderPermission }: PermissionHierarchyProps): React.ReactElement {
  return (
    <>
      {nodes.map((node) => (
        <React.Fragment key={node.permission.code}>
          {renderPermission(node.permission)}
          {node.children.length > 0 ? (
            <div className="border-border/50 ml-6 flex flex-col gap-3 border-l pl-3">
              <PermissionHierarchy nodes={node.children} renderPermission={renderPermission} />
            </div>
          ) : null}
        </React.Fragment>
      ))}
    </>
  );
}
