
flowchart TD
    subgraph Cliente ["Capa Cliente (App React)"]
        UI["Interfaz de Usuario (UI)"]
        State["Gestor de Estado (Redux Toolkit)"]
        Sandbox["Editor de Código (Sandbox)"]
        
        UI <--> State
        Sandbox <--> State
    end

    subgraph Almacenamiento_Local ["Capa de Almacenamiento Local"]
        SW["Service Worker (Workbox)"]
        Cache["Cache Storage API\n(Archivos Estáticos HTML/CSS/JS)"]
        IDB[("IndexedDB\n(Datos Dinámicos y Sync Queue)")]
        
        SW <--> Cache
        State <--> IDB
    end

    subgraph Servidor ["Capa Servidor (Nube Firebase)"]
        Backend{"Firebase Services\n(Firestore / Auth / Storage)"}
    end

    Cliente -->|Carga inicial app| SW
    State <-.->|Conexión WebSockets| Backend
