# Boero

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Boero está orientado a conservatorios superiores de música. Sus usuarios prioritarios son:

- **Estudiantes:** acceder a sus trámites e información académica, realizar inscripciones, presentar documentación y consultar el estado de sus solicitudes.
- **Administrativos de la institución:** organizar la información académica y de las personas, gestionar inscripciones y revisar solicitudes y documentación.

El alcance también incluye docentes y administradores de la plataforma. Las decisiones de producto deben contemplar especialmente la facilidad de uso para estudiantes y administrativos.

## Product Purpose

Centralizar la gestión académica y administrativa de los conservatorios en una aplicación web fácil de usar y de entender.

La experiencia debe ayudar a encontrar la información pertinente, comprender qué se puede hacer y completar las tareas sin ruido de interfaz ni complejidad innecesaria.

## Operating Context

- Existe un portal institucional con acceso a funciones según los permisos del usuario y un portal separado de administración de la plataforma.
- La gestión académica utiliza trayectos, planes de estudio, espacios académicos, instrumentos, turnos, ciclos lectivos, cursos y ofertas académicas.
- El flujo de inscripción incluye solicitudes, documentación requerida, seguimiento de estados y revisión administrativa.
- La aplicación existente contempla navegación en escritorio y móvil, y contenido en español.

## Capabilities and Constraints

El repositorio contiene funciones para gestionar instituciones, personas, roles y permisos, catálogos académicos, períodos y solicitudes de inscripción, documentación e inscripciones a cursos. También contiene vistas personales de cursadas, horarios y actividad docente.

- Mantener la separación entre el contexto institucional y la administración de plataforma, respetando los permisos de cada usuario.
- Utilizar terminología consistente con el dominio académico y explicar las acciones y estados de forma comprensible.
- Preservar el contexto de trabajo al navegar entre listados, detalles y formularios, incluidos filtros, búsqueda y paginación cuando corresponda.
- Reutilizar las convenciones existentes para evitar experiencias distintas ante tareas equivalentes.

Estas capacidades se identificaron en el código y la documentación del proyecto; no constituyen una verificación de su funcionamiento en un entorno desplegado.

## Brand Commitments

El nombre del producto es **Boero**. El repositorio ya dispone de identidad y recursos de marca. Esta inicialización documenta el producto; no solicita un rediseño ni un reemplazo de esa identidad.

## Evidence on Hand

- `README.md`: descripción del producto y su alcance académico y administrativo.
- `docs/UI-Y-NAVEGACION.md`: convenciones existentes de interacción y navegación.
- `src/app/` y `src/features/`: rutas, permisos y flujos implementados.
- `public/brand/`: logotipos existentes.
- `public/images/`: recursos gráficos existentes relacionados con la gestión institucional y académica.

No se aportaron testimonios, métricas de resultados ni un diferenciador comercial confirmado. No inventarlos para futuras pantallas o contenidos.

## Product Principles

1. **Comprensión antes que adorno:** cada elemento debe aportar información o ayudar a realizar una tarea; evitar el «slop» de interfaz y el contenido de relleno.
2. **Facilidad de uso para estudiantes y administrativos:** priorizar acciones comprensibles y recorridos sencillos para ambos públicos.
3. **Consistencia entre tareas equivalentes:** conservar términos y comportamientos previsibles en toda la aplicación.
4. **Información y acciones pertinentes:** respetar el contexto, los permisos y la tarea del usuario, sin sobrecargar la experiencia con opciones innecesarias.

## Open Decisions

- No se definió una tarea única como prioridad por encima de las demás dentro de la gestión académica y administrativa.
- No se establecieron métricas cuantitativas de éxito ni requisitos específicos de accesibilidad adicionales a las convenciones actuales del proyecto.
