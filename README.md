# 🎓 Sistema de Gestión Académica (Frontend)

Aplicación web en **HTML + CSS + JavaScript** para administrar carreras, periodos, clases y alumnos con persistencia en `localStorage`.

## ✨ Mejoras aplicadas

- Gestión de catálogos (Carreras, Periodos y Clases) con validaciones de duplicados.
- Registro de alumnos con integridad referencial.
- Búsqueda en tiempo real, filtros por carrera/periodo y paginación configurable.
- Confirmaciones de borrado con `<dialog>` y notificaciones tipo toast.
- Exportación e importación de datos en JSON.
- Modo oscuro persistente.
- Skeleton loader al iniciar.
- Estilos de impresión para reportes limpios.

## 🚀 Uso

1. Abrir `index.html` en el navegador.
2. Crear primero carreras y periodos.
3. Registrar alumnos y aplicar filtros en la tabla.
4. Usar exportar/importar para respaldos.

## 🗂️ Archivos principales

- `index.html`: estructura y componentes UI.
- `styles.css`: estilos, dark mode, skeleton y print.
- `app.js`: lógica de negocio, persistencia y renderizado.
