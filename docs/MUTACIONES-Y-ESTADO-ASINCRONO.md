# Mutaciones y estado asíncrono

Esta guía define cómo elegir el flujo de datos y cómo presentar mutaciones iniciadas desde la interfaz.

## Elegir el mecanismo

| Necesidad | Mecanismo |
| --- | --- |
| Lectura para un Server Component | Servicio autenticado del servidor |
| Lectura iniciada por un Client Component | Route Handler que proxifica el backend; React Query si el cliente es dueño de su caché |
| Mutación interna de la interfaz | Server Action |
| API para terceros, webhooks o clientes externos | Route Handler |

Una Server Action con `revalidatePath` y `redirect` actualiza el árbol RSC de destino en la misma respuesta. No se debe agregar una Route Handler de mutación ni una invalidación de React Query para una vista que no se lee desde su caché.

## `useActionState`, `useTransition` y `useMutation`

- Usar `useActionState` para formularios y diálogos que envían una Server Action y deben mostrar `pending`, errores devueltos por el backend o errores de validación. La Action recibe estado previo y `FormData` después de sus argumentos vinculados.
- Usar `useTransition` para una interacción cliente que no sea un formulario y que deba conservar responsiva la UI durante una transición. No duplicar con estados manuales el estado que ya entrega `useActionState`.
- Usar `useMutation` solamente cuando la mutación opera sobre datos que el cliente obtiene y mantiene en la caché de TanStack Query. Su `mutationFn` debe rechazar errores para que `isError` y `error` sean significativos, y el éxito debe invalidar o actualizar las query keys propietarias.

Las Server Actions que devuelven `{ error }` no son un reemplazo directo de una `mutationFn`: para React Query son resoluciones exitosas salvo que se agregue un adaptador que lance el error. No introducir ese adaptador si la navegación y la actualización siguen perteneciendo al árbol RSC.

## Contrato de una Server Action

1. Validar todos los argumentos vinculados y cada entrada de `FormData`; la UI no es una frontera de seguridad.
2. Validar el valor crudo antes de coercionarlo. Por ejemplo, un booleano de un input oculto acepta sólo `"true"` o `"false"`; un campo ausente o desconocido es un error de validación, no `false` por defecto.
3. Autorizar dentro de la Action y usar el transporte autenticado compartido.
4. Pasar la promesa de red al normalizador de errores para que capture tanto respuestas HTTP como fallos de transporte.
5. Ejecutar `revalidatePath` antes de `redirect`, y validar `returnTo` nuevamente en la Action.

## Diálogos de confirmación

- Montar el diálogo sólo cuando está abierto. Al cerrarlo se descarta el estado de la Action y un error anterior no reaparece en la siguiente operación.
- Mientras la Action está pendiente, deshabilitar cancelar y confirmar, e ignorar intentos de cierre.
- Mantenerlo abierto cuando la Action devuelve un error y mostrar el mensaje en el propio diálogo.
- Compartir el shell de un diálogo sólo cuando los recursos comparten el mismo contrato de entrada y de envío. Mantener la autorización, los permisos, las rutas y los mensajes específicos en una configuración explícita o en sus capas correspondientes.

## Navegación y pruebas

- En tabla, construir `returnTo` con pathname y query string completos. En detalle, usar la URL del detalle para permanecer en él después de la operación.
- Conservar separados permisos de edición y de cambio de estado en la UI y en la Action.
- Probar valores válidos e inválidos de cada input, errores HTTP y de red, pending, cierre/reapertura del diálogo, permiso ausente y destino tras éxito.
- Para variantes equivalentes, usar factories locales e `it.each` para que la misma aserción cubra cada recurso sin duplicar montaje.
