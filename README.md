# 🚚 Trans-Ruta - Frontend (Panel de Administración)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Interfaz de usuario (SPA) para el sistema de gestión logística **Trans-Ruta**. Este panel de administración permite visualizar métricas en tiempo real, gestionar la flota de vehículos, asignar órdenes de despacho a conductores y monitorear repuestos mediante el consumo de una API REST.

---

## 🚀 Características Principales

*   **Dashboard Interactivo:** KPIs y métricas clave del sistema.
*   **Gestión de Flota:** Listado de vehículos con visualización de capacidades y estados en tiempo real.
*   **Órdenes de Despacho:** Modal dinámico para la asignación de rutas, conductores, vehículos y clientes.
*   **Sistema de Notificaciones:** Alertas integradas en la barra superior.
*   **Tipado Estricto:** Modelos de dominio alineados exactamente con los DTOs del backend mediante TypeScript.

---

## 🛠️ Requisitos Previos

Para ejecutar este proyecto, necesitas tener instalado:
*   [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).
*   El servidor Backend de Trans-Ruta ejecutándose localmente (o en un servidor accesible).

---

## ⚙️ Guía de Instalación

1. **Instalar dependencias:**
   Ejecuta el siguiente comando en la raíz del proyecto para descargar los paquetes necesarios de `package.json`:
   ```bash
   npm install
   ```

2. **Configurar Variables de Entorno:**
   Crea un archivo `.env` en la raíz del proyecto (al mismo nivel que `vite.config.ts`) y define la URL del backend:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
   Cambia el puerto si el backend de Express/Sequelize está corriendo en uno distinto.

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible por defecto en `http://localhost:5173`.

4. **Compilar para Producción:**
   Para generar la versión optimizada:
   ```bash
   npm run build
   ```

---

## 📂 Estructura del Proyecto

*   `/src/components`: Componentes visuales modulares (Layout, Tablas, Modales).
*   `/src/services`: Configuración de Axios y funciones HTTP reales conectadas a los endpoints.
*   `/src/types`: Interfaces de TypeScript (`domain.ts`) para mantener consistencia con los datos del servidor.
*   `/src/data`: Información de respaldo para entornos sin conexión (Mocks).

---

✒️ *Desarrollado para la entrega de Metodología (Corte 2).*
