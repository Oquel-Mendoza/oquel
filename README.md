# Sistema de Registro Académico

Un sistema integral para la gestión y registro de alumnos, carreras, clases y periodos académicos. Este proyecto asegura la integridad de los datos educativos mediante restricciones lógicas y validaciones de dependencias.



## 📋 Descripción del Proyecto

El objetivo principal de este sistema es administrar el flujo académico de una institución, desde la apertura de un año escolar y el registro de la oferta académica (carreras y clases), hasta la matriculación de los alumnos. Todo el sistema está respaldado por reglas lógicas que impiden inconsistencias (como inscribir a un alumno en una clase sin cupo o en un año escolar cerrado).

## 🏗️ Entidades Principales

* **Alumnos:** Información personal, matrícula única, estado (activo, egresado, baja).
* **Carreras:** Programas de estudio ofrecidos por la institución, duración y créditos totales.
* **Clases (Asignaturas):** Materias específicas asociadas a una carrera, con información sobre cupos y créditos.
* **Año Escolar (Periodo/Ciclo):** Periodos lectivos de la institución (ej. 2026-I, 2026-II) con fechas de inicio, fin y estado (abierto/cerrado).

## 🧠 Lógica de Negocio y Restricciones

El sistema implementa las siguientes reglas para garantizar la integridad referencial y operativa:

### 1. Restricciones de Matrícula (Alumnos y Clases)
* **Validación de Año Escolar:** Un alumno solo puede inscribirse en clases si el `año_escolar` correspondiente tiene el estado "Abierto".
* **Límite de Cupos:** Una clase no puede aceptar más alumnos de los definidos en su capacidad máxima (ej. 30 alumnos por clase). Si el cupo está lleno, el registro se rechaza.
* **Unicidad:** Un alumno no puede registrarse dos veces en la misma clase durante el mismo año escolar.

### 2. Restricciones de Carreras y Clases
* **Pertenencia:** Una clase debe pertenecer obligatoriamente a una o más carreras.
* **Prerrequisitos (Opcional):** Para registrar una clase avanzada, el sistema verifica si el alumno aprobó la clase requisito en un año escolar anterior.

### 3. Integridad de Datos (Eliminación en Cascada/Restringida)
* **Protección de Historial:** No se puede eliminar una `Carrera` si existen `Alumnos` registrados en ella.
* **Cierre de Ciclo:** Un `año_escolar` finalizado no puede ser modificado ni eliminado, preservando el registro histórico de las notas y clases cursadas.

## 🛠️ Tecnologías Sugeridas
*(Modifica esta sección según las herramientas que decidas utilizar)*
* **Backend / Lógica:** Orientado a objetos (ej. C#, PHP o similar)
* **Frontend:** HTML, CSS, JavaScript
* **Base de Datos:** Relacional (MySQL, SQL Server, PostgreSQL) para manejar llaves foráneas y constraints.

## 🚀 Instalación y Configuración

1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/Oquel-Mendoza/oquel.git](https://github.com/Oquel-Mendoza/oquel.git)
