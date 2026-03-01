# 🎓 Sistema de Gestión Académica (Frontend)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

Un prototipo interactivo y reactivo para la administración de registros académicos. Este sistema gestiona entidades clave (Alumnos, Carreras, Clases y Periodos Escolares) asegurando la integridad de los datos y aplicando reglas de negocio estrictas directamente desde el cliente utilizando `LocalStorage`.

## 📋 Descripción del Proyecto

Este proyecto nace con el objetivo de estructurar una interfaz limpia y minimalista para el control escolar, enfocándose en la experiencia del usuario (UX) y en la prevención de inconsistencias en los datos. Toda la información se persiste localmente en el navegador, simulando el comportamiento de una base de datos relacional a través de arreglos y objetos en JavaScript.

## ✨ Funcionalidades Principales

### 🧠 Lógica y Reglas de Negocio
* **Identificadores Únicos (UUID):** Relaciones basadas en IDs internos para mantener la integridad aunque los nombres de los registros cambien.
* **Prevención de Duplicidad:** Bloqueo de registros con códigos de clase o documentos de identidad repetidos.
* **Integridad Referencial:** Restricción de borrado para Carreras o Años Escolares que ya posean alumnos matriculados.
* **Control de Cupos:** Límite de capacidad por clase y prevención de doble matrícula para un mismo alumno en un periodo.

### 🖥️ Interfaz Reactiva y UX
* **Motor de Búsqueda en Tiempo Real:** Filtrado dinámico de la tabla de alumnos sin recargar la página.
* **Sistema de Modales y Toasts:** Interacciones no bloqueantes para confirmaciones de borrado y notificaciones de éxito, reemplazando las alertas nativas del navegador.
* **Paginación y Filtros Cruzados:** Control total sobre la visualización del volumen de datos (10, 20, 50 registros) y filtros combinados por año y carrera.
* **Soporte para Modo Oscuro (Dark Mode):** Interfaz adaptable a las preferencias del usuario mediante variables CSS.
* **Skeleton Loaders:** Animaciones de carga que mejoran la percepción de rendimiento al inicializar el sistema.

### 🛠️ Herramientas de Persistencia
* **Importar / Exportar JSON:** Capacidad de serializar todo el estado del `LocalStorage` para descargar copias de seguridad y restaurarlas posteriormente.
* **Impresión Contextual:** Estilos CSS dedicados (`@media print`) para generar reportes limpios y listos para PDF o papel.

## 🏗️ Arquitectura y Tecnologías

El proyecto está construido enteramente con tecnologías web nativas, sin dependencias externas pesadas, estructurando la lógica en módulos preparados para escalar:

* **Estructura y Estilos:** HTML Semántico y CSS Vanilla (Flexbox/Grid, Variables CSS).
* **Interactividad y Lógica:** JavaScript (ES6+). Manipulación del DOM, Promesas para modales, y funciones de orden superior (`filter`, `map`, `some`) para el procesamiento de datos.

### 🚀 Roadmap y Próximos Pasos

La arquitectura actual sienta las bases ideales para una futura migración hacia la Programación Orientada a Objetos (POO). El siguiente paso natural en la evolución de este sistema es trasladar la lógica de validación a un backend sólido (utilizando C# o PHP) y conectar la interfaz a una base de datos relacional (como MySQL o SQL Server).

## ⚙️ Instalación y Uso

Dado que es un proyecto frontend puro, no requiere configuración de servidores locales ni dependencias de Node.js para funcionar.

1. Clona este repositorio:
   ```bash
   git clone [https://github.com/tu-usuario/sistema-academico.git](https://github.com/tu-usuario/sistema-academico.git)
