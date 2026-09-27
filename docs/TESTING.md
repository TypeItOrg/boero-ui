# Guía de Testing en el Frontend

Esta guía describe las herramientas, patrones y buenas prácticas para escribir pruebas automatizadas en Boero UI.

---

## 1. Stack y Filosofía de Testing

El frontend utiliza:
- **Test Runner y Aserciones**: [Jest](https://jestjs.io/).
- **Renderizado de Componentes**: [React Testing Library](https://testing-library.com/).
- **Simulación de Interacciones**: `@testing-library/user-event` (interacciones realistas de clic, escritura y foco).
- **Aserciones DOM**: `@testing-library/jest-dom` (`toBeInTheDocument`, `toBeDisabled`, etc.).
- **Mock de APIs**: [Mock Service Worker (MSW)](https://mswjs.io/) para interceptar peticiones de red si corresponde.

### Filosofía: Probar el comportamiento del usuario
- Priorizar consultas accesibles por rol (`screen.getByRole("button", { name: "Guardar" })`, `screen.getByRole("alertdialog")`).
- Evitar buscar elementos por clases CSS o selectores frágiles.
- No testear estados internos de React; verificar lo que el usuario ve y puede hacer en pantalla.

---

## 2. Ubicación de las Pruebas

Los archivos de test se colocan en el mismo directorio que el módulo que prueban, facilitando su localización y mantenimiento:

```
src/features/academic/
├── components/
│   ├── academic-delete-dialog.tsx
│   └── academic-delete-dialog.test.tsx    # Test del componente
├── actions/
│   ├── academic-resource.action.ts
│   └── academic-resource.action.test.ts  # Test de la Server Action
└── utils/
    ├── academic-scope.util.ts
    └── academic-scope.util.test.ts        # Test de funciones utilitarias
```

---

## 3. Patrones de Prueba Frecuentes

### A. Diálogos de Confirmación y Acciones Asíncronas

Al probar diálogos que ejecutan Server Actions:

1. **Estado de Carga / Pending**:
   - Simular una promesa pendiente (`new Promise(...)`).
   - Verificar que los controles (botón confirmar y cancelar) se deshabiliten mientras la acción se ejecuta.
2. **Manejo de Errores**:
   - Simular que la Server Action devuelve `{ error: "Mensaje de error" }`.
   - Verificar que el mensaje aparezca dentro del diálogo y que el modal **permanezca abierto**.
3. **Reinicio de Estado al Reabrir**:
   - Verificar que si el usuario cancela y vuelve a abrir el diálogo desde su botón disparador, los errores previos hayan desaparecido.

```tsx
// Ejemplo de prueba de diálogo
it("keeps the dialog open when deletion returns an error", async () => {
  const user = userEvent.setup();
  jest.mocked(deleteAcademicResourceAction).mockResolvedValueOnce({
    error: "No se pudo eliminar el recurso.",
  });

  render(<AcademicDeleteDialog {...PROPS} open onOpenChange={jest.fn()} />);

  await user.click(screen.getByRole("button", { name: "Eliminar" }));

  await waitFor(() => {
    expect(screen.getByText("No se pudo eliminar el recurso.")).toBeInTheDocument();
  });
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
});
```

---

### B. Formularios y `ActionForm`

- **Validación en cliente**: Verificar que si faltan campos obligatorios, se muestren los mensajes de validación correspondientes antes de enviar la acción.
- **Preservación de campos**: Verificar que si la acción falla en el servidor, los valores ingresados por el usuario no se borren.

---

### C. Uso de `it.each` para evitar duplicación

Cuando múltiples recursos comparten el mismo comportamiento o contrato (por ejemplo, diferentes tipos de recursos académicos que usan un mismo diálogo de eliminación):

- Usar `it.each` con una tabla de casos o factories locales.
- Esto asegura cobertura completa para cada variante sin repetir bloques enteros de renderizado.

---

## 4. Comandos de Ejecución

| Comando | Descripción |
| :--- | :--- |
| `pnpm test` | Ejecuta toda la suite de pruebas una sola vez. |
| `pnpm test:watch` | Modo interactivo: re-ejecuta pruebas afectadas al guardar cambios. |
| `pnpm test:coverage` | Genera un reporte detallado de cobertura en la consola y en `coverage/`. |
| `pnpm test <filtro>` | Ejecuta únicamente los archivos cuyo nombre coincida con el filtro.<br>Ejemplo: `pnpm test academic-delete-dialog` |
