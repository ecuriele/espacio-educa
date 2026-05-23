# Documentación de Arquitectura y Datos

A continuación se presentan los diagramas de arquitectura, flujo de sincronización asíncrona y modelo físico de datos local para la PWA de Espacio Educa.

### Figura 1. Arquitectura de Componentes del Sistema PWA

Este diagrama de nivel de contenedores (C4) muestra cómo el Cliente se comunica con la Nube a través de la capa intermedia del Service Worker y las bases de datos locales.

```mermaid
flowchart TD
    subgraph Cliente ["Capa Cliente (Dispositivo Móvil / Navegador)"]
        UI["Interfaz de Usuario (UI)"]
        State["Gestor de Estado (State)"]
        Sandbox["Editor de Código (Sandbox)"]
        
        UI <--> State
        Sandbox <--> State
    end

    subgraph Intermedia ["Capa Intermedia (Controlador)"]
        SW["Service Worker (Workbox)"]
    end

    subgraph Almacenamiento ["Capa de Almacenamiento Local"]
        Cache["Cache Storage API\n(Archivos Estáticos)"]
        IDB[("IndexedDB\n(Datos Dinámicos)")]
    end

    subgraph Servidor ["Capa Servidor (Nube)"]
        Backend{"Backend (API REST /\nBD Principal)"}
    end

    UI -->|Peticiones HTTP| SW
    SW <--> Cache
    SW <--> IDB
    SW -.->|Conexión Condicional| Backend
```

### Figura 2. Flujo de Sincronización Asíncrona (Background Sync)

Diagrama de Secuencia que ilustra el proceso de entrega de un reto cuando no hay conexión a internet y su posterior sincronización.

```mermaid
sequenceDiagram
    participant Estudiante
    participant UI as UI (Frontend)
    participant SW as Service Worker
    participant IDB as IndexedDB
    participant Servidor as Servidor Remoto

    Estudiante->>UI: Clic en "Entregar Reto" (Offline)
    UI->>SW: Petición HTTP (POST) interceptada
    SW->>Servidor: Fetch Failed (Sin conexión)
    Servidor-->>SW: (Falla)
    SW->>IDB: Guarda el payload en "Cola de Sincronización"
    IDB-->>SW: Guardado OK
    SW-->>UI: Devuelve evento de éxito local
    UI-->>Estudiante: Notificación "Guardado en el dispositivo. Se enviará luego"

    Note over Estudiante, Servidor: (Pausa / Recuperación de Red)

    Estudiante->>SW: Navegador dispara evento Sync
    SW->>IDB: Recupera tareas encoladas
    IDB-->>SW: Retorna payloads
    SW->>Servidor: Envía petición HTTP (POST)
    Servidor-->>SW: Respuesta 200 OK
    SW->>IDB: Elimina la tarea de la cola local
```

### Figura 3. Modelo Físico de Datos Local en IndexedDB

Diagrama Entidad-Relación de las principales tablas (Object Stores) guardadas localmente.

```mermaid
erDiagram
    Perfil_Usuario {
        int usuario_id PK
        string nombre_completo
        int racha_actual
        array medallas_ganadas
    }

    Progreso_Curso {
        string reto_id PK
        enum estado "Completado | Pendiente"
        string codigo_fuente
    }

    Cola_Sincronizacion {
        string tarea_id PK
        string endpoint_destino
        json payload
        date timestamp_creacion
    }
```
