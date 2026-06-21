/**
 * Catálogo de láminas disponibles en el proyecto.
 * Todos los archivos están en public/laminas/ y funcionan 100% offline.
 *
 * tipo: 'lamina' | 'tarea'
 * formato: 'pdf' | 'docx'
 */
export const LAMINAS_CATALOGO = {
  basico: {
    label: 'Básico',
    color: 'teal',
    temas: [
      {
        id: '00-introduccion',
        label: 'Introducción',
        icon: '🚀',
        archivos: [
          {
            id: 'basico-00-intro-espacio',
            nombre: 'Introducción a Espacio Educa',
            path: '/laminas/basico/00-introduccion/Introduccion-a-Espacio-Educa.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
        ],
      },
      {
        id: '01-pseudocodigo',
        label: 'Pseudocódigo',
        icon: '🧠',
        archivos: [
          {
            id: 'basico-01-algoritmos',
            nombre: 'Algoritmos y Pseudocódigo',
            path: '/laminas/basico/01-pseudocodigo/1.-Algoritmos.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'basico-01-tarea',
            nombre: 'Tarea 1.1 - Pseudocódigo',
            path: '/laminas/basico/01-pseudocodigo/Tarea-1.1.-Pseudocodigo.docx',
            formato: 'docx',
            tipo: 'tarea',
          },
          {
            id: 'basico-01-tarea-v2',
            nombre: 'Tarea 1.1 - Pseudocódigo (v2)',
            path: '/laminas/basico/01-pseudocodigo/Tarea-1.1.-Pseudocodigo1.docx',
            formato: 'docx',
            tipo: 'tarea',
          },
          {
            id: 'basico-01-tarea-v3',
            nombre: 'Tarea 1.1 - Pseudocódigo (v3)',
            path: '/laminas/basico/01-pseudocodigo/Tarea-1.1.-Pseudocodigo2.docx',
            formato: 'docx',
            tipo: 'tarea',
          },
          {
            id: 'basico-01-tarea-v4',
            nombre: 'Tarea 1.1 - Pseudocódigo (v4)',
            path: '/laminas/basico/01-pseudocodigo/Tarea-1.1.-Pseudocodigo3.docx',
            formato: 'docx',
            tipo: 'tarea',
          },
        ],
      },
      {
        id: '02-javascript',
        label: 'JavaScript',
        icon: '⚡',
        archivos: [
          {
            id: 'basico-02-variables',
            nombre: '2.1 Variables',
            path: '/laminas/basico/02-javascript/2.1-Variables.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'basico-02-tipos',
            nombre: '2.2 Tipos de Datos y Operadores',
            path: '/laminas/basico/02-javascript/2.2-Tipos-de-datos-y-operadores.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'basico-02-cond-simples',
            nombre: '2.3 Condicionales Simples',
            path: '/laminas/basico/02-javascript/2.3-Condicionales-simples.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'basico-02-cond-compuestos',
            nombre: '2.4 Condicionales Compuestos',
            path: '/laminas/basico/02-javascript/2.4-Condicionales-compuestos.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'basico-02-funciones',
            nombre: '2.5 Funciones',
            path: '/laminas/basico/02-javascript/2.5-Funciones.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'basico-02-funciones-params',
            nombre: '2.6 Funciones con Parámetros',
            path: '/laminas/basico/02-javascript/2.6-Funciones-con-parametros.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
        ],
      },
      {
        id: '03-html',
        label: 'HTML',
        icon: '🌐',
        archivos: [
          {
            id: 'basico-03-tags',
            nombre: '3.1 Tags',
            path: '/laminas/basico/03-html/3.1.-Tags.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'basico-03-elementos',
            nombre: '3.2 Elementos',
            path: '/laminas/basico/03-html/3.2.-Elementos.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'basico-03-hipervinculos',
            nombre: '3.3 Hipervínculos',
            path: '/laminas/basico/03-html/3.3.-Hipervinculos_.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'basico-03-imagenes',
            nombre: '3.4 Imágenes',
            path: '/laminas/basico/03-html/3.4-Imagenes.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
        ],
      },
      {
        id: '04-css',
        label: 'CSS',
        icon: '🎨',
        archivos: [
          {
            id: 'basico-04-selectores',
            nombre: '4.1 Selectores',
            path: '/laminas/basico/04-css/4.1-Selectores.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'basico-04-colores',
            nombre: '4.2 Colores, Background y Border',
            path: '/laminas/basico/04-css/4.2-Colores-Background-y-Border.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'basico-04-fonts',
            nombre: '4.3 Etiqueta head y Fonts',
            path: '/laminas/basico/04-css/4.3-Etiqueta-head-y-fonts.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
        ],
      },
    ],
  },

  avanzado: {
    label: 'Avanzado',
    color: 'violet',
    temas: [
      {
        id: '01-conceptos-basicos',
        label: 'Conceptos Básicos',
        icon: '📚',
        archivos: [
          {
            id: 'avanzado-01-repaso-js',
            nombre: 'Repaso de JavaScript',
            path: '/laminas/avanzado/01-conceptos-basicos/01---Repaso-de-Javascript.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'avanzado-01-git',
            nombre: 'Git',
            path: '/laminas/avanzado/01-conceptos-basicos/02---Git.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
        ],
      },
      {
        id: '02-algoritmos',
        label: 'Algoritmos',
        icon: '🔢',
        archivos: [
          {
            id: 'avanzado-02-intro-algoritmos',
            nombre: 'Introducción a Algoritmos',
            path: '/laminas/avanzado/02-algoritmos/01---Introduccion-a-Algoritmos.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
        ],
      },
      {
        id: '03-nodejs-funciones',
        label: 'Node.js + Funciones',
        icon: '🟢',
        archivos: [
          {
            id: 'avanzado-03-nodejs',
            nombre: '3.0 Node.js',
            path: '/laminas/avanzado/03-nodejs-funciones/3.0-Node-js.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'avanzado-03-funciones',
            nombre: '3.1 Funciones con Node.js',
            path: '/laminas/avanzado/03-nodejs-funciones/3.1-Funciones-utilizando-Node-JS.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
        ],
      },
      {
        id: '04-estructuras-datos',
        label: 'Estructuras de Datos',
        icon: '🗂️',
        archivos: [
          {
            id: 'avanzado-04-estructuras',
            nombre: 'Estructuras de Datos',
            path: '/laminas/avanzado/04-estructuras-datos/01---Estructuras-de-datos.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
        ],
      },
      {
        id: '05-poo',
        label: 'POO',
        icon: '🏗️',
        archivos: [
          {
            id: 'avanzado-05-intro-poo',
            nombre: '5.1 Introducción a POO',
            path: '/laminas/avanzado/05-poo/5.1-Introduccion-a-POO.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'avanzado-05-clases',
            nombre: '5.2 Clases y Atributos',
            path: '/laminas/avanzado/05-poo/5.2-Clases-y-Atributos.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'avanzado-05-metodos',
            nombre: '5.3 Métodos',
            path: '/laminas/avanzado/05-poo/5.3-Metodos.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'avanzado-05-herencia',
            nombre: '5.4 Herencia',
            path: '/laminas/avanzado/05-poo/5.4-Herencia.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'avanzado-05-typescript',
            nombre: '6. TypeScript',
            path: '/laminas/avanzado/05-poo/6.-Typescript.pdf',
            formato: 'pdf',
            tipo: 'lamina',
          },
          {
            id: 'avanzado-05-ejercicios',
            nombre: 'Ejercicios POO',
            path: '/laminas/avanzado/05-poo/Ejercicios.docx',
            formato: 'docx',
            tipo: 'tarea',
          },
          {
            id: 'avanzado-05-tarea-51',
            nombre: 'Tarea - Clase 5.1',
            path: '/laminas/avanzado/05-poo/Tarea---Clase-5.1.pdf',
            formato: 'pdf',
            tipo: 'tarea',
          },
          {
            id: 'avanzado-05-tarea-52',
            nombre: 'Tarea - Clase 5.2',
            path: '/laminas/avanzado/05-poo/Tarea---Clase-5.2.docx',
            formato: 'docx',
            tipo: 'tarea',
          },
        ],
      },
    ],
  },
};

/** Lista plana de todas las láminas para búsqueda */
export const LAMINAS_FLAT = Object.entries(LAMINAS_CATALOGO).flatMap(([nivel, nivelData]) =>
  nivelData.temas.flatMap(tema =>
    tema.archivos.map(archivo => ({
      ...archivo,
      nivel,
      nivelLabel: nivelData.label,
      nivelColor: nivelData.color,
      temaId: tema.id,
      temaLabel: tema.label,
      temaIcon: tema.icon,
    }))
  )
);
