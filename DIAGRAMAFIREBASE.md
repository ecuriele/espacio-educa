
erDiagram
    perfiles_usuarios {
        string uid PK "UID de Firebase"
        string correo
        string nombreMostrar
        string rol "estudiante | profesor | admin"
        int xp
        string colegio
        string salon
        array preferencias
    }

    modulos {
        string id PK
        string nivel "básico | avanzado"
        int orden
        string titulo
        string descripcion
        boolean isPublished
    }

    lecciones {
        string id PK
        string moduloId FK
        string titulo
        array bloques "contenido y popcodes"
    }

    entregas {
        string id PK
        string estudianteId FK
        string leccionId FK
        string codigoEntregado
        string calificacion
        string feedback
        date entregadoEn
    }

    modulos ||--o{ lecciones : "contiene"
    perfiles_usuarios ||--o{ entregas : "realiza"
    lecciones ||--o{ entregas : "recibe"
