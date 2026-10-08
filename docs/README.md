# Documentación de Boero

Este directorio contiene la documentación técnica y funcional del frontend de Boero. Los temas transversales se encuentran en la raíz y aquellos con múltiples documentos relacionados se agrupan en carpetas técnicas.

---

## Estructura de la Documentación

```
docs/
├── README.md                          # Índice general y guía de navegación
├── DESARROLLO.md                      # Setup local (Docker/pnpm), variables de entorno y troubleshooting
├── TESTING.md                         # Jest, React Testing Library, MSW y patrones de prueba
├── UI-Y-NAVEGACION.md                 # shadcn/ui, temas, tablas paginadas, returnTo y sidebar móvil
├── architecture/                      # Arquitectura, seguridad y flujo de datos
│   ├── ARQUITECTURA.md                # Stack (Next.js 16, React 19, Tailwind v4), estructura y tipado
│   ├── AUTENTICACION.md               # Proxy, cookies HttpOnly, rotación de tokens y manejo de 401
│   └── MUTACIONES-Y-ESTADO-ASINCRONO.md # Server Actions vs React Query, ActionForm y diálogos
└── infrastructure/                    # (Apartado: CI y despliegues coordinados con boero-infra)
    ├── CI.md
    └── DEPLOYMENT.md
```

---

## Índice de Documentos (Frontend)

| Documento | Alcance y Contenido |
| :--- | :--- |
| **[DESARROLLO.md](DESARROLLO.md)** | **Puesta en marcha y Desarrollo Local**<br>Requisitos del sistema (Node 24, pnpm 12, Docker, Make), cómo levantar la app (Docker Compose Watch vs Nativo con pnpm), variables de entorno (`BOERO_API_URL`, `NEXT_PUBLIC_API_URL`), scripts de desarrollo y solución de problemas comunes. |
| **[UI-Y-NAVEGACION.md](UI-Y-NAVEGACION.md)** | **Pautas de UI, Componentes y Navegación**<br>Sistema de diseño con Tailwind CSS v4 y shadcn/ui, tokens de color para modo claro/oscuro, invariantes de tablas paginadas (`10, 20, 30, 40, 50`), navegación y retorno seguro con `returnTo` y comportamiento del sidebar móvil. |
| **[TESTING.md](TESTING.md)** | **Guía de Testing en el Frontend**<br>Pruebas automatizadas con Jest, React Testing Library y MSW. Filosofía de pruebas orientada a comportamiento y accesibilidad, testing de Server Actions y diálogos de confirmación, y comandos de ejecución. |
| **[architecture/ARQUITECTURA.md](architecture/ARQUITECTURA.md)** | **Estructura y Tecnologías del Frontend**<br>Visión global del stack tecnológico, organización de carpetas por dominios (`src/features/`), componentes transversales y regla estricta de TypeScript: 1 tipo por archivo `*.types.ts` sin barriles. |
| **[architecture/AUTENTICACION.md](architecture/AUTENTICACION.md)** | **Autenticación y Manejo de Sesiones**<br>Manejo de los dos contextos de sesión (Institucional vs Admin), almacenamiento en cookies `HttpOnly`, capa proxy en Next.js, deduplicación de refresco de tokens en vuelo y comportamiento ante errores. |
| **[architecture/MUTACIONES-Y-ESTADO-ASINCRONO.md](architecture/MUTACIONES-Y-ESTADO-ASINCRONO.md)** | **Mutaciones, Formularios y Estado Asíncrono**<br>Flujos de datos asíncronos: criterios para Server Components vs Server Actions vs TanStack Query, uso de `ActionForm` para evitar pérdida de datos en errores de validación y diálogos de confirmación controlados. |

---