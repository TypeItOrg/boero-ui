# Pautas de UI, Componentes y Navegación

Esta guía detalla las reglas de diseño, patrones de tablas y convenciones de navegación que garantizan una experiencia de usuario consistente y accesible en Boero UI.

---

## 1. Sistema de Diseño y Componentes

El proyecto utiliza **Tailwind CSS v4** y la librería de componentes **shadcn/ui** (basada en primitivas accesibles de Radix UI y React Aria).

### Ubicación de componentes
- **Componentes primitivos (`@common/components/ui/`)**: Elementos visuales base como `button.tsx`, `dialog.tsx`, `input.tsx`, `select.tsx`, `table.tsx`, `badge.tsx`, etc.
- **Componentes compuestos (`@common/components/`)**: Piezas transversales complejas como `ActionForm`, `ReturnToLink`, `EmptyState`, modales compartidos o encabezados de sección.
- **Componentes de dominio (`@features/<feature>/components/`)**: Vistas, formularios y tablas específicas de un módulo funcional.

### Composición de clases con `cn()`
Para combinar clases de Tailwind condicionalmente sin colisiones de especificidad, se utiliza la función utilitaria `cn(...)`:

```tsx
import { cn } from "@common/utils/cn.util";

<button className={cn("px-4 py-2 font-medium", isPrimary && "bg-primary text-primary-foreground", className)} />
```

### Soporte de Temas (Claro / Oscuro)
La aplicación soporta modo claro y oscuro a través de `next-themes`. Todas las interfaces deben utilizar tokens semánticos de color en lugar de colores rígidos:
- Usar `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`.
- Evitar colores fijos como `bg-white` o `text-black` que rompen la legibilidad en modo oscuro.

### Encabezados de sección responsive

Reutilizar `SectionHeader` (`@common/components/section-header`) para secciones con icono, título y descripción. El icono tiene tamaño fijo: no usar `self-stretch` para hacerlo crecer con el texto.

- En contenedores angostos, la descripción ocupa todo el ancho y las acciones van debajo. El título conserva su jerarquía y puede envolver sin recortarse.
- En contenedores amplios, descripción y título se alinean junto al icono y las acciones quedan a la derecha. La adaptación usa el contenedor `section-header`, no solo el viewport.
- `compactTitle` y `compactDescription` permiten una redacción breve para móvil sin ocultar funcionalidad ni cambiar el significado; el texto completo se conserva en escritorio.
- Conservar `titleId` cuando la sección utiliza `aria-labelledby`. Mantener las descripciones útiles y evitar abreviar datos de negocio o reemplazar información por tooltips.

---

## 2. Invariantes en Tablas y Paginación

Para ofrecer una experiencia predecible en todos los listados de la plataforma:

1. **Opciones estándar de tamaño de página**:
   - Todas las tablas paginadas deben consumir la constante compartida:
     ```ts
     // @common/utils/pagination-query.util.ts
     export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const;
     ```
   - No deben definirse selectores ad-hoc con valores como `5`, `15` o `100`.
2. **Estados vacíos**:
   - Cuando una tabla no tenga registros, debe mostrar un estado vacío claro que distinga entre "no hay datos cargados" y "no hay coincidencias para los filtros actuales".

---

## 3. Navegación y Retorno Seguro con `returnTo`

Cuando un usuario interactúa con una lista paginada o filtrada (ej. página 3, filtro por estado "Activo") y hace clic para ver o editar un ítem, el sistema debe permitirle cancelar o guardar y **volver exactamente al mismo punto de la lista**.

### Uso de `ReturnToLink`
Para enlaces que abren formularios o vistas de edición, utilizar `ReturnToLink`:

```tsx
import { ReturnToLink } from "@common/components/navigation/return-to-link";

<ReturnToLink href={`/academic/study-plans/${id}/edit`}>
  Editar plan
</ReturnToLink>
```
Este componente adjunta automáticamente la URL actual codificada como parámetro `?returnTo=...`.

### Reglas estrictas de seguridad (Open Redirect Protection)
El parámetro `returnTo` es validado mediante `getSafeReturnTo()`:
1. **Restricción a rutas internas**: Solo se permiten URLs que comiencen con una sola barra diagonal (`/...`).
2. **Rechazo de URLs maliciosas**: Se descartan URLs absolutas (`https://...`), esquemas relativos de protocolo (`//malicious.com`) o secuencias de escape (`/\...`). Si el valor no es seguro, se hace fallback a la ruta por defecto.
3. **Doble validación**: Se valida en el cliente antes de armar el enlace y **se vuelve a validar en la Server Action** antes de ejecutar la redirección final.

### Excepciones a `returnTo`
- **Eliminación de recursos**: Al confirmar el borrado de un elemento, la redirección debe ir a la lista general limpia, nunca al detalle del recurso eliminado.
- **Acciones sensibles de seguridad**: Cambios críticos de credenciales fuerzan el cierre de sesión y redirección al login.

---

## 4. Sidebar y Navegación Móvil

Para evitar parpadeos visuales y saltos de renderizado en dispositivos móviles:

1. **Transición y feedback inmediato**: Al hacer clic en un enlace del menú móvil, solo se marca como activo el enlace clickeado en ese instante, suprimiendo visualmente el estilo de la ruta previa.
2. **Retraso de cierre coordinado**: El drawer móvil se cierra mediante `setOpenMobile(false)` **únicamente después** de que `pathname` coincide con la ruta de destino y ha transcurrido un retardo visual de 100 ms.
3. **Independencia de estado**: Las acciones en el menú móvil no deben alterar el estado de colapso o expansión del menú de escritorio.
