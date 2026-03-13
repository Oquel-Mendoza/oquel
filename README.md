# Sistema de Gestión Académica (Frontend)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

Prototipo web para la administración de registros académicos (Alumnos, Carreras, Clases y Periodos Escolares) con persistencia local y validaciones de negocio en cliente.

## Descripción

Este proyecto prioriza una interfaz clara, una experiencia de usuario consistente y la integridad de los datos. Toda la información se almacena en `LocalStorage`, simulando una base de datos relacional con estructuras de JavaScript.

## Funcionalidades principales

### Lógica y reglas de negocio

- **Identificadores únicos (UUID):** las relaciones internas se mantienen estables aunque cambien nombres visibles.
- **Prevención de duplicados:** bloqueo de documentos de identidad y códigos de clase repetidos.
- **Integridad referencial:** no permite eliminar Carreras o Periodos con dependencias activas.
- **Control de cupos:** límite de capacidad por clase y validación de matrícula única por periodo.

### Interfaz y experiencia de usuario

- **Búsqueda en tiempo real:** filtrado dinámico sin recargar la página.
- **Modales y notificaciones toast:** reemplazo de alertas nativas para una UX más profesional.
- **Paginación y filtros combinados:** visualización por bloques y cruce por año/carrera.
- **Modo oscuro:** personalización mediante variables CSS.
- **Skeleton loaders:** mejora de percepción de rendimiento durante carga inicial.

### Persistencia y portabilidad

- **Importar/exportar JSON:** respaldo y restauración del estado completo de `LocalStorage`.
- **Impresión contextual:** estilos específicos para generar reportes en PDF o papel.

## Mejoras propuestas

- Incorporar **sistema de roles y permisos** (administrador, docente, consulta).
- Agregar **bitácora de cambios** (auditoría básica de altas, ediciones y bajas).
- Incluir **validaciones de formato avanzadas** (documento, correo, teléfono, fechas).
- Crear un **panel de métricas** con indicadores académicos clave.
- Preparar la capa de datos para migración a API REST (C# o PHP) y base de datos relacional.

## Restricciones y consideraciones

- Proyecto **frontend puro**: no incluye autenticación real ni cifrado del lado servidor.
- Dependencia de `LocalStorage`: los datos pueden perderse al limpiar el navegador.
- Alcance orientado a prototipo: no apto para operación multiusuario en tiempo real.
- La integridad depende de validaciones en cliente; para producción se requiere backend.

## Arquitectura y tecnologías

- **Estructura y estilos:** HTML semántico y CSS Vanilla (Flexbox/Grid, variables CSS).
- **Interactividad y lógica:** JavaScript ES6+ (DOM, promesas, funciones de orden superior).

## Instalación y uso

Al ser un proyecto frontend sin dependencias de build, puede ejecutarse directamente en navegador.

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/sistema-academico.git
   ```

2. Abre el archivo principal HTML en tu navegador.
3. Comienza a gestionar datos académicos en entorno local.
