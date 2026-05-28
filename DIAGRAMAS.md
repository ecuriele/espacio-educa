# Documentación de Arquitectura y Datos

A continuación se presentan los diagramas de arquitectura, flujo de sincronización asíncrona y modelo físico de datos local para la PWA de Espacio Educa.

### Figura 1. Arquitectura de Componentes del Sistema PWA

Este diagrama de nivel de contenedores (C4) muestra cómo el Cliente se comunica con la Nube. Destaca la separación entre archivos estáticos manejados por el Service Worker y los datos dinámicos manejados directamente por React/Redux hacia Firebase.

```mermaid
flowchart TD
    subgraph Cliente ["Capa Cliente (App React)"]
        UI["Interfaz de Usuario (UI)"]
        State["Gestor de Estado (Redux Toolkit)"]
        Sandbox["Editor de Código (Sandbox)"]
        
        UI <--> State
        Sandbox <--> State
    end

    subgraph Almacenamiento_Local ["Capa de Almacenamiento Local"]
        SW["Service Worker (Workbox)"] <--> Cache["Cache Storage API\n(Archivos Estáticos HTML/CSS/JS)"]
        State <--> IDB[("IndexedDB\n(Datos Dinámicos y Sync Queue)")]
    end

    subgraph Servidor ["Capa Servidor (Nube Firebase)"]
        Backend{"Firebase Services\n(Firestore / Auth / Storage)"}
    end

    Cliente -->|Carga inicial app| SW
    State <-.->|Conexión WebSockets| Backend
```

### Figura 2. Flujo de Sincronización Asíncrona (Offline-First)

Diagrama de Secuencia que ilustra el proceso de entrega de un reto cuando no hay conexión a internet y su posterior sincronización controlada por Redux y la cola nativa.

```mermaid
sequenceDiagram
    participant Estudiante
    participant React as App React (UI)
    participant Redux as Redux (syncSlice)
    participant IDB as IndexedDB (colaSincronizacion)
    participant Firestore as Firebase Firestore

    Estudiante->>React: Clic en "Entregar Reto" (Offline)
    React->>Firestore: Intenta guardar el documento
    Firestore-->>React: Falla (Sin conexión a internet)
    React->>IDB: Guarda la operación en la 'colaSincronizacion'
    IDB-->>React: Guardado local OK
    React-->>Estudiante: Notificación "Guardado en el dispositivo. Se enviará luego"

    Note over Estudiante, Firestore: (Pausa / Recuperación de Red)

    Estudiante->>React: Navegador detecta red y dispara evento 'online'
    React->>Redux: Ejecuta syncPendingItems()
    Redux->>IDB: Recupera tareas pendientes
    IDB-->>Redux: Retorna payloads de la cola
    Redux->>Firestore: Envía la petición (Sincronización)
    Firestore-->>Redux: Respuesta de éxito
    Redux->>IDB: Elimina la tarea de la cola local
```

### Figura 3. Modelo Físico de Datos Local en IndexedDB

Diagrama Entidad-Relación de los principales Object Stores (tablas) guardados localmente para permitir el funcionamiento sin conexión, correspondientes al esquema real de `schema.js`.

```mermaid
erDiagram
    usuarios {
        string id PK
        string correo
        string nombreMostrar
        string rol
    }

    progreso {
        string usuarioId_leccionId PK "Llave Compuesta"
        string estado "no_iniciado | en_progreso | completado"
        boolean sincronizado
    }

    logros {
        string usuarioId_logroId PK "Llave Compuesta"
        date fecha
        boolean visto
    }
    
    rachas {
        string usuarioId PK
        int rachaActual
        date ultimaActividad
    }

    proyectosSandbox {
        string id PK
        string usuarioId
        string codigo
        date actualizadoEn
    }

    colaSincronizacion {
        int id PK "Autoincremental"
        string tipo "submission | progress_update"
        json payload
        string estado "pendiente | procesando | fallido"
    }

    usuarios ||--o{ progreso : "registra"
    usuarios ||--o{ logros : "gana"
    usuarios ||--|| rachas : "mantiene"
    usuarios ||--o{ proyectosSandbox : "crea"
```
