/**
 * Banco de Retos — Espacio Educa
 * ─────────────────────────────────────────────────────────────────
 * Estructura de cada reto:
 *  id          : string único
 *  tipo        : 'diario' | 'semanal'
 *  nivel       : 'basico' | 'avanzado'
 *  semana      : número de semana del curso (1‑16)
 *  dia         : 1‑5  (solo retos diarios; undefined para semanales)
 *  titulo      : string
 *  descripcion : string  — qué debe lograr el alumno
 *  instrucciones: string[] — pasos claros
 *  criterios   : string[] — lista de qué debe tener el entregable
 *  xp          : número de XP que otorga
 *  etiquetas   : string[]
 *  tipo_entrega: 'codigo' | 'captura' | 'url' | 'texto'
 *  codigo_inicial: string (opcional) — código de partida para retos de código
 */

// ────────────────────────────────────────────────────────────────────────────
// RETOS BÁSICOS — HTML, CSS y JavaScript fundamentos
// ────────────────────────────────────────────────────────────────────────────
export const RETOS_BASICO = [

  // ── SEMANA 1 ──────────────────────────────────────────────────────────────

  {
    id: 'b-s1-d1',
    tipo: 'diario',
    nivel: 'basico',
    semana: 1,
    dia: 1,
    titulo: 'Mi primera página HTML',
    descripcion: 'Crea una página HTML con tu presentación personal usando las etiquetas básicas.',
    instrucciones: [
      'Crea un archivo HTML con la estructura básica (doctype, html, head, body).',
      'Agrega un título con tu nombre usando <h1>.',
      'Escribe un párrafo corto sobre ti usando <p>.',
      'Agrega una lista de 3 cosas que te gustan usando <ul> y <li>.',
    ],
    criterios: [
      'El archivo tiene estructura HTML válida (DOCTYPE, html, head, body).',
      'Hay exactamente un <h1> con el nombre del alumno.',
      'Hay al menos un párrafo <p>.',
      'Hay una lista <ul> con al menos 3 ítems.',
    ],
    xp: 30,
    etiquetas: ['HTML', 'Estructura', 'Básico'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Presentación</title>
</head>
<body>
  <!-- Escribe tu presentación aquí -->

</body>
</html>`,
  },

  {
    id: 'b-s1-d2',
    tipo: 'diario',
    nivel: 'basico',
    semana: 1,
    dia: 2,
    titulo: 'Etiquetas de texto',
    descripcion: 'Practica las etiquetas de texto de HTML: encabezados, énfasis y más.',
    instrucciones: [
      'Crea una página sobre tu tema favorito (película, deporte, etc.).',
      'Usa al menos un h1, un h2 y un h3.',
      'Pon al menos una palabra en negrita con <strong>.',
      'Pon al menos una palabra en cursiva con <em>.',
    ],
    criterios: [
      'Hay encabezados h1, h2 y h3.',
      'Se usa <strong> al menos una vez.',
      'Se usa <em> al menos una vez.',
      'El contenido tiene coherencia temática.',
    ],
    xp: 25,
    etiquetas: ['HTML', 'Etiquetas', 'Texto'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Tema Favorito</title>
</head>
<body>

</body>
</html>`,
  },

  {
    id: 'b-s1-d3',
    tipo: 'diario',
    nivel: 'basico',
    semana: 1,
    dia: 3,
    titulo: 'Hipervínculos en acción',
    descripcion: 'Agrega enlaces a tu página para navegar entre secciones y páginas externas.',
    instrucciones: [
      'Crea una página con al menos 3 hipervínculos usando <a href="">.',
      'Uno de los enlaces debe abrir en una nueva pestaña (target="_blank").',
      'Agrega un enlace a una sección de la misma página usando id y #.',
    ],
    criterios: [
      'Hay al menos 3 etiquetas <a>.',
      'Al menos un enlace tiene target="_blank".',
      'Hay un enlace interno usando # y un id en la misma página.',
    ],
    xp: 30,
    etiquetas: ['HTML', 'Hipervínculos', 'Navegación'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mis Hipervínculos</title>
</head>
<body>

  <nav>
    <!-- Agrega tus enlaces aquí -->
  </nav>

  <section id="inicio">
    <h1>Inicio</h1>
  </section>

</body>
</html>`,
  },

  {
    id: 'b-s1-d4',
    tipo: 'diario',
    nivel: 'basico',
    semana: 1,
    dia: 4,
    titulo: 'Imágenes en HTML',
    descripcion: 'Inserta imágenes correctamente en una página HTML usando la etiqueta <img>.',
    instrucciones: [
      'Crea una galería sencilla con al menos 2 imágenes usando <img>.',
      'Cada imagen debe tener el atributo alt con una descripción.',
      'Establece un ancho (width) para cada imagen.',
      'Agrega un pie de imagen debajo de cada una con <p> o <figcaption>.',
    ],
    criterios: [
      'Hay al menos 2 etiquetas <img>.',
      'Todas las imágenes tienen el atributo alt.',
      'Las imágenes tienen atributo width o están dentro de <figure>.',
      'Cada imagen tiene un texto descriptivo asociado.',
    ],
    xp: 30,
    etiquetas: ['HTML', 'Imágenes', 'Galería'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Galería</title>
</head>
<body>
  <h1>Mi Galería de Imágenes</h1>

  <!-- Agrega tus imágenes aquí. Puedes usar URLs de internet -->

</body>
</html>`,
  },

  {
    id: 'b-s1-d5',
    tipo: 'diario',
    nivel: 'basico',
    semana: 1,
    dia: 5,
    titulo: 'Mi primera variable en JS',
    descripcion: 'Declara variables y muestra su valor en consola.',
    instrucciones: [
      'Abre la consola del navegador o usa un archivo .html con <script>.',
      'Declara una variable con tu nombre usando let.',
      'Declara una variable con tu edad usando const.',
      'Muestra ambos valores con console.log() formateado como: "Hola, soy [nombre] y tengo [edad] años".',
    ],
    criterios: [
      'Se usan let y const correctamente.',
      'console.log() muestra el mensaje con las dos variables.',
      'No hay errores en la consola.',
    ],
    xp: 25,
    etiquetas: ['JavaScript', 'Variables', 'Console'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Reto: Mi primera variable en JS
// Declara tus variables aquí

let nombre = '';
const edad = 0;

// Muestra el mensaje en consola
console.log();`,
  },

  {
    id: 'b-s1-sem',
    tipo: 'semanal',
    nivel: 'basico',
    semana: 1,
    titulo: 'Página de presentación personal',
    descripcion: 'Construye una página HTML completa que te presente como persona, combinando todo lo visto en la semana.',
    instrucciones: [
      'Crea un archivo HTML llamado "yo.html".',
      'Incluye: tu nombre (h1), una foto o avatar (img), un párrafo sobre ti (p), una lista de tus hobbies (ul/li).',
      'Agrega al menos 2 hipervínculos: uno a tu red social favorita y uno interno.',
      'Usa al menos un <strong> y un <em>.',
    ],
    criterios: [
      'La página tiene estructura HTML válida.',
      'Hay una foto/avatar con alt descriptivo.',
      'Hay una lista de hobbies con al menos 3 ítems.',
      'Hay al menos 2 hipervínculos funcionales.',
      'Se usan <strong> y <em> en el texto.',
    ],
    xp: 100,
    etiquetas: ['HTML', 'Proyecto', 'Integración'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yo — [Tu nombre]</title>
</head>
<body>

  <!-- Tu página de presentación aquí -->

</body>
</html>`,
  },

  // ── SEMANA 2 ──────────────────────────────────────────────────────────────

  {
    id: 'b-s2-d1',
    tipo: 'diario',
    nivel: 'basico',
    semana: 2,
    dia: 1,
    titulo: 'Selectores CSS',
    descripcion: 'Aplica estilos usando selectores de etiqueta, clase e id.',
    instrucciones: [
      'Crea una página HTML con un <h1>, dos <p> y un <div>.',
      'Agrega un archivo CSS (o <style>) y usa selector de etiqueta para el h1.',
      'Agrega una clase "destacado" y aplica un color diferente.',
      'Usa un id "titulo-principal" y centra el texto.',
    ],
    criterios: [
      'Se usa selector de etiqueta (h1, p, div, etc.).',
      'Se usa selector de clase (.nombreClase).',
      'Se usa selector de id (#nombreId).',
      'Los estilos son visibles en el navegador.',
    ],
    xp: 30,
    etiquetas: ['CSS', 'Selectores', 'Estilos'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Selectores CSS</title>
  <style>
    /* Selector de etiqueta */

    /* Selector de clase */

    /* Selector de id */

  </style>
</head>
<body>
  <h1 id="titulo-principal">Título Principal</h1>
  <p>Párrafo normal</p>
  <p class="destacado">Párrafo destacado</p>
</body>
</html>`,
  },

  {
    id: 'b-s2-d2',
    tipo: 'diario',
    nivel: 'basico',
    semana: 2,
    dia: 2,
    titulo: 'Colores y fondos',
    descripcion: 'Cambia los colores de texto y fondo de distintos elementos.',
    instrucciones: [
      'Crea una página con 3 secciones de colores distintos.',
      'Cada sección debe tener un fondo (background-color) diferente.',
      'Cambia el color del texto (color) en al menos 2 secciones.',
      'Usa al menos un color en formato hexadecimal (#rrggbb) y uno en RGB.',
    ],
    criterios: [
      'Hay 3 secciones con fondos de color distintos.',
      'Se usa la propiedad color en al menos 2 elementos.',
      'Se usa al menos un color hexadecimal.',
      'Se usa al menos un color rgb().',
    ],
    xp: 30,
    etiquetas: ['CSS', 'Colores', 'Fondos'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Colores CSS</title>
  <style>
    /* Estilos aquí */
  </style>
</head>
<body>
  <section class="seccion-1">Sección 1</section>
  <section class="seccion-2">Sección 2</section>
  <section class="seccion-3">Sección 3</section>
</body>
</html>`,
  },

  {
    id: 'b-s2-d3',
    tipo: 'diario',
    nivel: 'basico',
    semana: 2,
    dia: 3,
    titulo: 'Fuentes y tipografía',
    descripcion: 'Cambia la fuente y el tamaño de texto de tu página.',
    instrucciones: [
      'Importa una fuente de Google Fonts (ej: Roboto, Open Sans).',
      'Aplica la fuente importada al body.',
      'Cambia el font-size del h1 a 2.5rem y del párrafo a 1.1rem.',
      'Usa font-weight para poner un párrafo en negrita.',
    ],
    criterios: [
      'Se importa una fuente de Google Fonts.',
      'La fuente se aplica al body o a los elementos.',
      'El h1 tiene font-size de al menos 2rem.',
      'Se usa font-weight: bold o 700 en algún elemento.',
    ],
    xp: 25,
    etiquetas: ['CSS', 'Tipografía', 'Google Fonts'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tipografía</title>
  <!-- Importa tu fuente de Google Fonts aquí -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <style>
    /* Aplica los estilos de tipografía aquí */
  </style>
</head>
<body>
  <h1>Título con fuente personalizada</h1>
  <p>Este es un párrafo con texto normal.</p>
  <p>Este párrafo está en <strong>negrita</strong>.</p>
</body>
</html>`,
  },

  {
    id: 'b-s2-d4',
    tipo: 'diario',
    nivel: 'basico',
    semana: 2,
    dia: 4,
    titulo: 'Bordes y cajas',
    descripcion: 'Estiliza cajas usando border, padding y margin en CSS.',
    instrucciones: [
      'Crea 3 tarjetas (divs) con contenido.',
      'Agrega un borde (border) a cada tarjeta.',
      'Usa border-radius para redondear las esquinas.',
      'Agrega padding interno y margin entre las tarjetas.',
    ],
    criterios: [
      'Hay 3 cajas/tarjetas estilizadas.',
      'Cada tarjeta tiene border y border-radius.',
      'Se usa padding en las tarjetas.',
      'Las tarjetas tienen separación (margin).',
    ],
    xp: 30,
    etiquetas: ['CSS', 'Border', 'Box Model'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tarjetas CSS</title>
  <style>
    .tarjeta {
      /* Agrega tus estilos aquí */
    }
  </style>
</head>
<body>
  <div class="tarjeta">Tarjeta 1</div>
  <div class="tarjeta">Tarjeta 2</div>
  <div class="tarjeta">Tarjeta 3</div>
</body>
</html>`,
  },

  {
    id: 'b-s2-d5',
    tipo: 'diario',
    nivel: 'basico',
    semana: 2,
    dia: 5,
    titulo: 'Tipos de datos en JS',
    descripcion: 'Identifica y usa los tipos de datos principales de JavaScript.',
    instrucciones: [
      'Declara una variable de tipo string con tu nombre.',
      'Declara una variable de tipo number con tu edad.',
      'Declara una variable de tipo boolean indicando si te gusta programar.',
      'Usa console.log() con typeof para mostrar el tipo de cada variable.',
    ],
    criterios: [
      'Se usan los 3 tipos: string, number, boolean.',
      'Se usa typeof para verificar los tipos.',
      'Los console.log() muestran el tipo correcto para cada variable.',
    ],
    xp: 25,
    etiquetas: ['JavaScript', 'Tipos de datos', 'typeof'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Tipos de datos en JavaScript

// String
const nombre = '';

// Number
const edad = 0;

// Boolean
const megustaProgramar = false;

// Verificar tipos
console.log('Tipo de nombre:', typeof nombre);
console.log('Tipo de edad:', typeof edad);
console.log('Tipo de megustaProgramar:', typeof megustaProgramar);`,
  },

  {
    id: 'b-s2-sem',
    tipo: 'semanal',
    nivel: 'basico',
    semana: 2,
    titulo: 'Tarjeta de perfil estilizada',
    descripcion: 'Combina HTML y CSS para crear una tarjeta de perfil con diseño atractivo.',
    instrucciones: [
      'Crea una tarjeta de perfil centrada en la pantalla.',
      'Incluye: foto de perfil (img redonda con border-radius:50%), nombre, descripción breve, 3 "habilidades" como etiquetas (chips).',
      'Usa colores, fuentes de Google Fonts y bordes redondeados.',
      'La tarjeta debe tener una sombra (box-shadow).',
    ],
    criterios: [
      'La tarjeta está centrada en la pantalla.',
      'La imagen es circular (border-radius: 50%).',
      'Se usan al menos 2 colores distintos.',
      'Hay al menos 3 etiquetas de habilidades.',
      'Se usa box-shadow.',
      'Se usa una fuente de Google Fonts.',
    ],
    xp: 120,
    etiquetas: ['HTML', 'CSS', 'Diseño', 'Proyecto'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tarjeta de Perfil</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    /* Tu diseño aquí */
    body {
      font-family: 'Inter', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f0f4f8;
    }
  </style>
</head>
<body>
  <!-- Tu tarjeta de perfil aquí -->
</body>
</html>`,
  },

  // ── SEMANA 3 ──────────────────────────────────────────────────────────────

  {
    id: 'b-s3-d1',
    tipo: 'diario',
    nivel: 'basico',
    semana: 3,
    dia: 1,
    titulo: 'Condicional if/else',
    descripcion: 'Usa if/else para tomar decisiones en JavaScript.',
    instrucciones: [
      'Declara una variable "hora" con la hora actual (0-23).',
      'Usa if/else if/else para imprimir "Buenos días", "Buenas tardes" o "Buenas noches" según la hora.',
      'Prueba tu código cambiando el valor de la variable hora.',
    ],
    criterios: [
      'Se usa if, else if y else.',
      'Los tres mensajes son posibles según el valor de hora.',
      'El código funciona correctamente para hora = 8, 14 y 22.',
    ],
    xp: 30,
    etiquetas: ['JavaScript', 'Condicionales', 'if/else'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Condicional if/else
const hora = 10; // Cambia este valor para probar

// Escribe tu condicional aquí
if () {

} else if () {

} else {

}`,
  },

  {
    id: 'b-s3-d2',
    tipo: 'diario',
    nivel: 'basico',
    semana: 3,
    dia: 2,
    titulo: 'Operadores lógicos',
    descripcion: 'Practica los operadores AND (&&), OR (||) y NOT (!) en condiciones.',
    instrucciones: [
      'Declara dos variables booleanas: tieneDinero y tieneTiempo.',
      'Usa && para verificar si puede ir al cine (necesita ambas).',
      'Usa || para verificar si puede descansar (necesita al menos una).',
      'Usa ! para imprimir si NO tiene dinero.',
    ],
    criterios: [
      'Se usan los tres operadores: &&, || y !.',
      'Los resultados son lógicamente correctos.',
      'Se usan console.log() para mostrar los resultados.',
    ],
    xp: 25,
    etiquetas: ['JavaScript', 'Operadores', 'Lógica'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Operadores lógicos
const tieneDinero = true;
const tieneTiempo = false;

// ¿Puede ir al cine? (necesita ambas condiciones)
const puedeIrAlCine = ;
console.log('¿Puede ir al cine?', puedeIrAlCine);

// ¿Puede descansar? (necesita al menos una condición)
const puedeDescansar = ;
console.log('¿Puede descansar?', puedeDescansar);

// ¿NO tiene dinero?
console.log('¿No tiene dinero?', );`,
  },

  {
    id: 'b-s3-d3',
    tipo: 'diario',
    nivel: 'basico',
    semana: 3,
    dia: 3,
    titulo: 'Mi primera función',
    descripcion: 'Crea y llama funciones sencillas en JavaScript.',
    instrucciones: [
      'Crea una función llamada "saludar" que reciba un nombre y devuelva "¡Hola, [nombre]!".',
      'Crea una función "sumar" que reciba dos números y devuelva su suma.',
      'Llama cada función e imprime el resultado en consola.',
    ],
    criterios: [
      'La función saludar recibe un parámetro y devuelve el saludo correcto.',
      'La función sumar recibe 2 parámetros y devuelve la suma.',
      'Ambas funciones son llamadas con console.log().',
    ],
    xp: 35,
    etiquetas: ['JavaScript', 'Funciones', 'Parámetros'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Funciones en JavaScript

// 1. Función saludar
function saludar(nombre) {
  // Completa esta función

}

// 2. Función sumar
function sumar(a, b) {
  // Completa esta función

}

// Llama las funciones
console.log(saludar('Ana'));
console.log(sumar(5, 3));`,
  },

  {
    id: 'b-s3-d4',
    tipo: 'diario',
    nivel: 'basico',
    semana: 3,
    dia: 4,
    titulo: 'Función con condicional',
    descripcion: 'Combina funciones y condicionales para resolver un problema simple.',
    instrucciones: [
      'Crea una función "esMayor" que reciba una edad y devuelva true si es mayor de edad (>= 18) o false si no.',
      'Crea una función "clasificarNota" que reciba una nota (0-100) y devuelva: "Excelente" (>=90), "Bien" (>=70), "Regular" (>=50), o "Reprobado" (< 50).',
      'Prueba ambas funciones con distintos valores.',
    ],
    criterios: [
      'esMayor devuelve true para 18 o más y false para menos.',
      'clasificarNota devuelve la categoría correcta para valores de prueba.',
      'Las funciones usan return.',
    ],
    xp: 35,
    etiquetas: ['JavaScript', 'Funciones', 'Condicionales'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Función con condicional

function esMayor(edad) {
  // Devuelve true si edad >= 18

}

function clasificarNota(nota) {
  // Clasifica la nota según los criterios

}

// Pruebas
console.log(esMayor(20));   // true
console.log(esMayor(16));   // false
console.log(clasificarNota(95));  // Excelente
console.log(clasificarNota(72));  // Bien
console.log(clasificarNota(45));  // Reprobado`,
  },

  {
    id: 'b-s3-d5',
    tipo: 'diario',
    nivel: 'basico',
    semana: 3,
    dia: 5,
    titulo: 'JS en el HTML: cambiar texto',
    descripcion: 'Conecta JavaScript con HTML para cambiar el contenido de la página.',
    instrucciones: [
      'Crea una página HTML con un <h1> que diga "Hola Mundo" y un <button>.',
      'Al hacer clic en el botón, cambia el texto del h1 a "¡JavaScript funciona!".',
      'Usa getElementById para seleccionar el h1 y innerHTML para cambiarlo.',
    ],
    criterios: [
      'El botón tiene un evento onclick o addEventListener.',
      'El h1 cambia su texto al hacer clic.',
      'Se usa getElementById o querySelector.',
    ],
    xp: 40,
    etiquetas: ['JavaScript', 'DOM', 'Interactividad'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>JS en el HTML</title>
</head>
<body>
  <h1 id="mensaje">Hola Mundo</h1>
  <button onclick="cambiarTexto()">Haz clic aquí</button>

  <script>
    function cambiarTexto() {
      // Cambia el texto del h1 aquí

    }
  </script>
</body>
</html>`,
  },

  {
    id: 'b-s3-sem',
    tipo: 'semanal',
    nivel: 'basico',
    semana: 3,
    titulo: 'Calculadora de notas interactiva',
    descripcion: 'Crea una página web interactiva que calcule y muestre la nota final de un alumno.',
    instrucciones: [
      'Crea un formulario HTML con 3 campos numéricos: nota1, nota2, nota3.',
      'Agrega un botón "Calcular".',
      'Al hacer clic, JavaScript calcula el promedio y lo muestra en la página.',
      'Muestra también la clasificación: Excelente (>=90), Bien (>=70), Regular (>=50), Reprobado (<50).',
      'Cambia el color del resultado según la clasificación (verde, azul, amarillo, rojo).',
    ],
    criterios: [
      'El formulario tiene 3 campos de nota.',
      'El promedio se calcula correctamente.',
      'Se muestra la clasificación de la nota.',
      'El color del resultado cambia según la nota.',
      'La página es funcional sin recargar.',
    ],
    xp: 150,
    etiquetas: ['HTML', 'CSS', 'JavaScript', 'DOM', 'Proyecto'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculadora de Notas</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
    /* Agrega más estilos aquí */
  </style>
</head>
<body>
  <h1>Calculadora de Notas</h1>
  <!-- Tu formulario aquí -->

  <script>
    // Tu lógica aquí
  </script>
</body>
</html>`,
  },

  // ── SEMANA 4 ──────────────────────────────────────────────────────────────

  {
    id: 'b-s4-d1',
    tipo: 'diario',
    nivel: 'basico',
    semana: 4,
    dia: 1,
    titulo: 'Funciones con parámetros múltiples',
    descripcion: 'Practica funciones que reciben varios parámetros y devuelven valores.',
    instrucciones: [
      'Crea una función "presentar" que reciba nombre, edad y ciudad, y devuelva una oración completa.',
      'Crea una función "calcularArea" que reciba ancho y alto, y devuelva el área de un rectángulo.',
      'Llama ambas funciones con diferentes valores.',
    ],
    criterios: [
      'presentar usa los 3 parámetros en la frase devuelta.',
      'calcularArea multiplica ancho * alto y devuelve el resultado.',
      'Ambas funciones tienen return.',
    ],
    xp: 35,
    etiquetas: ['JavaScript', 'Funciones', 'Parámetros'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Funciones con múltiples parámetros

function presentar(nombre, edad, ciudad) {
  // Devuelve: "Me llamo [nombre], tengo [edad] años y soy de [ciudad]."

}

function calcularArea(ancho, alto) {
  // Devuelve el área del rectángulo

}

// Pruebas
console.log(presentar('Carlos', 20, 'Caracas'));
console.log(calcularArea(5, 3)); // 15`,
  },

  {
    id: 'b-s4-d2',
    tipo: 'diario',
    nivel: 'basico',
    semana: 4,
    dia: 2,
    titulo: 'Cambiar estilos con JS',
    descripcion: 'Usa JavaScript para modificar estilos CSS de elementos HTML dinámicamente.',
    instrucciones: [
      'Crea una página con una caja (div) de 200x200px.',
      'Agrega 3 botones: "Rojo", "Azul", "Verde".',
      'Al hacer clic en cada botón, cambia el color de fondo de la caja.',
      'Usa element.style.backgroundColor para cambiar el color.',
    ],
    criterios: [
      'La caja cambia de color al hacer clic en cada botón.',
      'Se usa element.style para cambiar estilos.',
      'Los 3 colores funcionan correctamente.',
    ],
    xp: 35,
    etiquetas: ['JavaScript', 'DOM', 'Estilos dinámicos'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Cambiar Colores</title>
  <style>
    #caja {
      width: 200px;
      height: 200px;
      background-color: gray;
      border-radius: 12px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div id="caja"></div>
  <button onclick="cambiarColor('red')">Rojo</button>
  <button onclick="cambiarColor('blue')">Azul</button>
  <button onclick="cambiarColor('green')">Verde</button>

  <script>
    function cambiarColor(color) {
      // Cambia el fondo de la caja

    }
  </script>
</body>
</html>`,
  },

  {
    id: 'b-s4-d3',
    tipo: 'diario',
    nivel: 'basico',
    semana: 4,
    dia: 3,
    titulo: 'Agregar clases CSS con JS',
    descripcion: 'Usa classList para agregar y quitar clases CSS dinámicamente.',
    instrucciones: [
      'Crea un botón "Activar modo oscuro".',
      'Al hacer clic, agrega la clase "dark" al body usando classList.toggle().',
      'En CSS, define la clase .dark con un fondo oscuro y texto claro.',
      'El botón debe cambiar su texto según el modo activo.',
    ],
    criterios: [
      'Se usa classList.toggle() o classList.add/remove.',
      'La clase "dark" cambia los colores de la página.',
      'El texto del botón cambia al hacer clic.',
    ],
    xp: 40,
    etiquetas: ['JavaScript', 'DOM', 'classList', 'Dark Mode'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Modo Oscuro</title>
  <style>
    body {
      background: white;
      color: black;
      font-family: Arial, sans-serif;
      padding: 20px;
      transition: all 0.3s;
    }
    body.dark {
      /* Define el modo oscuro aquí */
    }
  </style>
</head>
<body>
  <h1>¡Cambia el modo!</h1>
  <button id="btn" onclick="toggleModo()">Activar modo oscuro</button>

  <script>
    function toggleModo() {
      // Alterna la clase "dark" en el body
      // Cambia el texto del botón

    }
  </script>
</body>
</html>`,
  },

  {
    id: 'b-s4-d4',
    tipo: 'diario',
    nivel: 'basico',
    semana: 4,
    dia: 4,
    titulo: 'Formulario interactivo',
    descripcion: 'Lee valores de un formulario HTML con JavaScript y muéstralos en la página.',
    instrucciones: [
      'Crea un formulario con campos: nombre, color favorito y un botón "Enviar".',
      'Al hacer clic en Enviar, lee los valores del formulario.',
      'Muestra un mensaje personalizado usando los valores ingresados.',
      'Usa preventDefault() para evitar que el formulario recargue la página.',
    ],
    criterios: [
      'El formulario tiene al menos 2 campos de texto.',
      'Se leen los valores con .value.',
      'Se muestra un mensaje con los datos ingresados.',
      'La página no se recarga al enviar.',
    ],
    xp: 40,
    etiquetas: ['JavaScript', 'Formularios', 'DOM'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Formulario Interactivo</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 400px; margin: 40px auto; }
    input { display: block; margin: 8px 0; padding: 8px; width: 100%; }
    button { padding: 10px 20px; background: #ea5837; color: white; border: none; border-radius: 8px; cursor: pointer; }
    #resultado { margin-top: 20px; padding: 15px; background: #f0f4f8; border-radius: 8px; display: none; }
  </style>
</head>
<body>
  <h1>¿Quién eres?</h1>
  <form id="miFormulario">
    <label>Nombre: <input type="text" id="nombre" placeholder="Tu nombre"></label>
    <label>Color favorito: <input type="text" id="color" placeholder="Ej: azul"></label>
    <button type="submit">Enviar</button>
  </form>
  <div id="resultado"></div>

  <script>
    document.getElementById('miFormulario').addEventListener('submit', function(e) {
      e.preventDefault(); // Evita recarga
      // Lee los valores y muestra el resultado

    });
  </script>
</body>
</html>`,
  },

  {
    id: 'b-s4-d5',
    tipo: 'diario',
    nivel: 'basico',
    semana: 4,
    dia: 5,
    titulo: 'Concatenar con template literals',
    descripcion: 'Usa los template literals de JavaScript (backticks) para crear cadenas dinámicas.',
    instrucciones: [
      'Declara variables: nombre, ciudad, edad y profesion.',
      'Crea una carta de presentación usando template literals (` `).',
      'La carta debe tener al menos 3 líneas que usen las variables.',
      'Muestra la carta con console.log().',
    ],
    criterios: [
      'Se usan template literals con ${}.',
      'La carta incluye al menos 3 variables distintas.',
      'El texto tiene saltos de línea (\\n o multilinea con backtick).',
    ],
    xp: 25,
    etiquetas: ['JavaScript', 'Template Literals', 'Strings'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Template Literals
const nombre = 'Ana García';
const ciudad = 'Caracas';
const edad = 21;
const profesion = 'estudiante de programación';

// Crea la carta con template literals
const carta = \`
Hola, mi nombre es ...
\`;

console.log(carta);`,
  },

  {
    id: 'b-s4-sem',
    tipo: 'semanal',
    nivel: 'basico',
    semana: 4,
    titulo: 'Página interactiva con HTML + CSS + JS',
    descripcion: 'Crea una página web completa con interactividad usando todo lo aprendido.',
    instrucciones: [
      'Crea una "Tarjeta de Bienvenida" interactiva.',
      'Al entrar a la página, se muestra un formulario que pide: nombre, color favorito y hobby.',
      'Al hacer clic en "Entrar", se oculta el formulario y aparece una tarjeta personalizada con los datos ingresados.',
      'El fondo de la tarjeta debe ser del color favorito ingresado.',
      'Agrega un botón "Editar" que vuelva al formulario.',
    ],
    criterios: [
      'El formulario recoge los 3 datos.',
      'La tarjeta muestra los datos con template literals.',
      'El color de fondo de la tarjeta usa el color ingresado.',
      'El formulario y la tarjeta se alternan correctamente.',
      'El diseño está estilizado con CSS.',
    ],
    xp: 175,
    etiquetas: ['HTML', 'CSS', 'JavaScript', 'DOM', 'Proyecto Integrador'],
    tipo_entrega: 'codigo',
    codigo_inicial: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tarjeta de Bienvenida</title>
  <style>
    /* Tu diseño aquí */
  </style>
</head>
<body>
  <!-- Formulario de entrada -->
  <div id="formulario">
    <!-- Tu formulario aquí -->
  </div>

  <!-- Tarjeta de bienvenida (oculta al inicio) -->
  <div id="tarjeta" style="display:none">
    <!-- Tu tarjeta aquí -->
  </div>

  <script>
    // Tu lógica JavaScript aquí
  </script>
</body>
</html>`,
  },
];

// ────────────────────────────────────────────────────────────────────────────
// RETOS AVANZADOS — POO y JavaScript avanzado
// ────────────────────────────────────────────────────────────────────────────
export const RETOS_AVANZADO = [

  // ── SEMANA 1 ──────────────────────────────────────────────────────────────

  {
    id: 'a-s1-d1',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 1,
    dia: 1,
    titulo: 'Repaso: Arrow functions',
    descripcion: 'Convierte funciones tradicionales a arrow functions y comprende sus diferencias.',
    instrucciones: [
      'Convierte estas 3 funciones tradicionales a arrow functions.',
      'Verifica que devuelven el mismo resultado.',
      'Agrega una arrow function de una sola línea (sin llaves ni return explícito).',
    ],
    criterios: [
      'Las 3 funciones están convertidas a arrow functions.',
      'Los resultados son idénticos a las versiones originales.',
      'Se usa al menos una arrow function de expresión concisa (sin llaves).',
    ],
    xp: 30,
    etiquetas: ['JavaScript', 'Arrow Functions', 'Repaso'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Convierte estas funciones a arrow functions

// 1. Función tradicional
function duplicar(n) {
  return n * 2;
}

// 2. Función tradicional
function saludar(nombre) {
  return \`Hola, \${nombre}!\`;
}

// 3. Función tradicional
function esPar(n) {
  return n % 2 === 0;
}

// Tus arrow functions aquí:
const duplicarArrow = ;
const saludarArrow = ;
const esParArrow = ;

// Pruebas (no modificar)
console.log(duplicarArrow(5));     // 10
console.log(saludarArrow('Ana')); // Hola, Ana!
console.log(esParArrow(4));        // true`,
  },

  {
    id: 'a-s1-d2',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 1,
    dia: 2,
    titulo: 'Destructuring de objetos',
    descripcion: 'Practica el destructuring de objetos en JavaScript ES6+.',
    instrucciones: [
      'Dado el objeto "usuario", usa destructuring para extraer sus propiedades.',
      'Usa destructuring con valor por defecto para una propiedad que no existe.',
      'Renombra una propiedad al hacer destructuring.',
    ],
    criterios: [
      'Se usa la sintaxis { prop } = objeto para extraer variables.',
      'Se usa un valor por defecto ({ prop = "default" }).',
      'Se usa renombrado ({ prop: nuevoNombre }).',
    ],
    xp: 30,
    etiquetas: ['JavaScript', 'Destructuring', 'ES6'],
    tipo_entrega: 'codigo',
    codigo_inicial: `const usuario = {
  nombre: 'Carlos López',
  edad: 25,
  email: 'carlos@email.com',
  ciudad: 'Caracas',
};

// 1. Destructuring básico (extrae nombre, edad y email)


// 2. Destructuring con valor por defecto (telefono no existe en el objeto)
const { telefono = 'No disponible' } = usuario;

// 3. Destructuring con renombrado (renombra ciudad como ubicacion)


console.log(nombre);      // Carlos López
console.log(edad);        // 25
console.log(email);       // carlos@email.com
console.log(telefono);    // No disponible
console.log(ubicacion);   // Caracas`,
  },

  {
    id: 'a-s1-d3',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 1,
    dia: 3,
    titulo: 'Métodos de arrays: map y filter',
    descripcion: 'Usa map() y filter() para transformar y filtrar arrays.',
    instrucciones: [
      'Dado el array de notas, usa filter() para obtener solo las notas aprobadas (>=60).',
      'Usa map() para convertir las notas aprobadas a letras: A(>=90), B(>=75), C(>=60).',
      'Encadena filter() y map() en una sola expresión.',
    ],
    criterios: [
      'filter() retorna solo las notas >= 60.',
      'map() convierte correctamente cada nota a su letra.',
      'Se usa method chaining (.filter().map()).',
    ],
    xp: 35,
    etiquetas: ['JavaScript', 'Arrays', 'map', 'filter'],
    tipo_entrega: 'codigo',
    codigo_inicial: `const notas = [45, 88, 62, 95, 55, 73, 40, 91, 67];

// 1. Solo las aprobadas (>= 60)
const aprobadas = notas.filter();
console.log('Aprobadas:', aprobadas);

// 2. Convertir a letras (usa una función auxiliar)
function aLetra(nota) {
  // A(>=90), B(>=75), C(>=60)

}

// 3. En cadena: filtrar y convertir a letras
const letrasAprobadas = notas
  .filter()
  .map();

console.log('Letras:', letrasAprobadas); // ['B', 'C', 'A', 'B', 'A', 'C']`,
  },

  {
    id: 'a-s1-d4',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 1,
    dia: 4,
    titulo: 'Reduce y acumuladores',
    descripcion: 'Usa reduce() para calcular valores acumulados de un array.',
    instrucciones: [
      'Dado un array de ventas, usa reduce() para calcular el total.',
      'Usa reduce() para encontrar la venta máxima.',
      'Usa reduce() para contar cuántas ventas superan 500.',
    ],
    criterios: [
      'Se usa reduce() para sumar el total.',
      'Se usa reduce() para encontrar el máximo.',
      'Se usa reduce() para contar ventas > 500.',
    ],
    xp: 40,
    etiquetas: ['JavaScript', 'Arrays', 'reduce'],
    tipo_entrega: 'codigo',
    codigo_inicial: `const ventas = [350, 720, 480, 910, 250, 680, 430, 850, 120, 550];

// 1. Total de ventas
const total = ventas.reduce();
console.log('Total:', total);

// 2. Venta máxima
const maxVenta = ventas.reduce();
console.log('Máxima:', maxVenta);

// 3. Ventas que superan 500
const ventasGrandes = ventas.reduce();
console.log('Ventas > 500:', ventasGrandes);`,
  },

  {
    id: 'a-s1-d5',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 1,
    dia: 5,
    titulo: 'Spread y Rest operators',
    descripcion: 'Usa el operador spread (...) para clonar y fusionar, y rest para parámetros variables.',
    instrucciones: [
      'Clona un array usando spread sin modificar el original.',
      'Fusiona dos objetos usando spread.',
      'Crea una función con rest parameter que reciba cualquier cantidad de números y devuelva su suma.',
    ],
    criterios: [
      'El array clonado es independiente del original (distintas referencias).',
      'Los dos objetos se fusionan correctamente.',
      'La función con rest acepta cualquier cantidad de argumentos.',
    ],
    xp: 35,
    etiquetas: ['JavaScript', 'Spread', 'Rest', 'ES6'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// 1. Clonar array con spread
const original = [1, 2, 3, 4, 5];
const copia = ;
copia.push(6);
console.log('Original:', original); // [1, 2, 3, 4, 5] (no debe cambiar)
console.log('Copia:', copia);       // [1, 2, 3, 4, 5, 6]

// 2. Fusionar objetos con spread
const persona = { nombre: 'Ana', edad: 22 };
const contacto = { email: 'ana@mail.com', telefono: '0412-0000000' };
const completo = ;
console.log(completo);

// 3. Rest parameter
function sumarTodo(...numeros) {
  // Suma todos los números recibidos

}

console.log(sumarTodo(1, 2, 3));       // 6
console.log(sumarTodo(10, 20, 30, 40)); // 100`,
  },

  {
    id: 'a-s1-sem',
    tipo: 'semanal',
    nivel: 'avanzado',
    semana: 1,
    titulo: 'Procesador de datos de alumnos',
    descripcion: 'Usa métodos de arrays (map, filter, reduce) para procesar y analizar un listado de alumnos.',
    instrucciones: [
      'Dado el array "alumnos", calcula el promedio de notas de toda la clase usando reduce.',
      'Filtra los alumnos reprobados (nota < 60).',
      'Crea un nuevo array con map que incluya para cada alumno: nombre, nota y clasificación (A/B/C/Reprobado).',
      'Ordena los resultados de mayor a menor nota usando sort.',
      'Muestra un reporte en consola con los resultados.',
    ],
    criterios: [
      'Se calcula el promedio correctamente.',
      'Se filtran los reprobados.',
      'Se asigna la clasificación a cada alumno.',
      'El array se ordena de mayor a menor.',
      'El reporte en consola es legible.',
    ],
    xp: 120,
    etiquetas: ['JavaScript', 'Arrays', 'map', 'filter', 'reduce', 'sort'],
    tipo_entrega: 'codigo',
    codigo_inicial: `const alumnos = [
  { nombre: 'Ana García', nota: 88 },
  { nombre: 'Carlos López', nota: 55 },
  { nombre: 'María Torres', nota: 92 },
  { nombre: 'José Martínez', nota: 47 },
  { nombre: 'Luisa Rodríguez', nota: 73 },
  { nombre: 'Pedro Sánchez', nota: 61 },
  { nombre: 'Carmen Díaz', nota: 95 },
  { nombre: 'Miguel Flores', nota: 38 },
];

// 1. Promedio de la clase
const promedio = ;
console.log(\`Promedio de la clase: \${promedio.toFixed(1)}\`);

// 2. Alumnos reprobados
const reprobados = ;
console.log('Reprobados:', reprobados.map(a => a.nombre));

// 3. Array con clasificación
const conClasificacion = alumnos.map(alumno => ({
  ...alumno,
  clasificacion: /* A/B/C/Reprobado */,
}));

// 4. Ordenar de mayor a menor
const ordenados = ;

// 5. Reporte
console.log('\\n--- REPORTE FINAL ---');
ordenados.forEach(a => console.log(\`\${a.nombre}: \${a.nota} (\${a.clasificacion})\`));`,
  },

  // ── SEMANA 2 (POO) ────────────────────────────────────────────────────────

  {
    id: 'a-s2-d1',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 2,
    dia: 1,
    titulo: 'Mi primera clase',
    descripcion: 'Crea tu primera clase JavaScript con constructor y propiedades.',
    instrucciones: [
      'Crea una clase "Persona" con el constructor que recibe nombre y edad.',
      'Agrega un método "presentarse()" que devuelva una cadena con el saludo.',
      'Instancia 2 objetos Persona y llama al método presentarse().',
    ],
    criterios: [
      'La clase Persona tiene constructor con nombre y edad.',
      'El método presentarse() retorna una cadena con los datos.',
      'Se crean al menos 2 instancias y se llama al método en cada una.',
    ],
    xp: 35,
    etiquetas: ['POO', 'Clases', 'Constructor', 'Métodos'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Mi primera clase en JavaScript

class Persona {
  constructor(nombre, edad) {
    // Inicializa las propiedades

  }

  presentarse() {
    // Retorna: "Hola, soy [nombre] y tengo [edad] años."

  }
}

// Instanciar personas
const persona1 = new Persona('Ana', 22);
const persona2 = new Persona('Carlos', 28);

console.log(persona1.presentarse());
console.log(persona2.presentarse());`,
  },

  {
    id: 'a-s2-d2',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 2,
    dia: 2,
    titulo: 'Atributos y métodos',
    descripcion: 'Crea una clase con múltiples atributos y métodos que los manipulen.',
    instrucciones: [
      'Crea una clase "CuentaBancaria" con atributos: titular, saldo (inicia en 0).',
      'Agrega el método "depositar(monto)" que suma al saldo.',
      'Agrega el método "retirar(monto)" que resta del saldo (sin dejar saldo negativo).',
      'Agrega el método "verSaldo()" que devuelve el saldo actual.',
    ],
    criterios: [
      'El saldo inicia en 0.',
      'depositar() suma correctamente al saldo.',
      'retirar() no permite saldo negativo (muestra mensaje de error si no hay fondos).',
      'verSaldo() retorna el saldo actual.',
    ],
    xp: 45,
    etiquetas: ['POO', 'Clases', 'Métodos', 'Encapsulamiento'],
    tipo_entrega: 'codigo',
    codigo_inicial: `class CuentaBancaria {
  constructor(titular) {
    this.titular = titular;
    this.saldo = 0;
  }

  depositar(monto) {
    // Suma monto al saldo

  }

  retirar(monto) {
    // Resta monto del saldo
    // Si no hay suficiente saldo, muestra 'Saldo insuficiente'

  }

  verSaldo() {
    // Retorna el saldo actual

  }
}

// Pruebas
const cuenta = new CuentaBancaria('Ana García');
cuenta.depositar(1000);
console.log(cuenta.verSaldo());  // 1000
cuenta.retirar(300);
console.log(cuenta.verSaldo());  // 700
cuenta.retirar(1000);             // 'Saldo insuficiente'
console.log(cuenta.verSaldo());  // 700`,
  },

  {
    id: 'a-s2-d3',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 2,
    dia: 3,
    titulo: 'Herencia básica',
    descripcion: 'Crea una clase hija que extiende una clase padre usando extends y super.',
    instrucciones: [
      'Tienes la clase "Animal" con constructor (nombre, sonido) y método "hacerSonido()".',
      'Crea la clase "Perro" que extiende Animal.',
      'Perro tiene un método extra: "buscarPelota()" que devuelve "[nombre] busca la pelota!".',
      'Instancia un Perro y prueba ambos métodos.',
    ],
    criterios: [
      'Perro usa extends Animal.',
      'Se llama super() en el constructor de Perro.',
      'Perro hereda y puede usar hacerSonido().',
      'Perro tiene su método propio buscarPelota().',
    ],
    xp: 45,
    etiquetas: ['POO', 'Herencia', 'extends', 'super'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Clase padre
class Animal {
  constructor(nombre, sonido) {
    this.nombre = nombre;
    this.sonido = sonido;
  }

  hacerSonido() {
    return \`\${this.nombre} hace: \${this.sonido}!\`;
  }
}

// Clase hija
class Perro extends Animal {
  constructor(nombre) {
    super(nombre, 'Guau'); // Llama al constructor del padre
  }

  buscarPelota() {
    // Retorna: "[nombre] busca la pelota!"

  }
}

// Pruebas
const miPerro = new Perro('Rex');
console.log(miPerro.hacerSonido());   // Rex hace: Guau!
console.log(miPerro.buscarPelota()); // Rex busca la pelota!`,
  },

  {
    id: 'a-s2-d4',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 2,
    dia: 4,
    titulo: 'Sobreescribir métodos (Override)',
    descripcion: 'Sobreescribe un método heredado y usa super para llamar al padre.',
    instrucciones: [
      'Usa la clase Animal del reto anterior.',
      'Crea la clase "Gato" que extiende Animal.',
      'Sobreescribe el método hacerSonido() en Gato para que retorne algo diferente.',
      'Usa super.hacerSonido() dentro del método sobreescrito para incluir el sonido original.',
    ],
    criterios: [
      'Gato sobreescribe hacerSonido().',
      'Se usa super.hacerSonido() dentro del método.',
      'El resultado incluye información del método padre y algo propio de Gato.',
    ],
    xp: 45,
    etiquetas: ['POO', 'Override', 'super', 'Polimorfismo'],
    tipo_entrega: 'codigo',
    codigo_inicial: `class Animal {
  constructor(nombre, sonido) {
    this.nombre = nombre;
    this.sonido = sonido;
  }
  hacerSonido() {
    return \`\${this.nombre} hace: \${this.sonido}!\`;
  }
}

class Gato extends Animal {
  constructor(nombre) {
    super(nombre, 'Miau');
  }

  // Sobreescribe hacerSonido()
  hacerSonido() {
    // Incluye super.hacerSonido() y algo extra

  }
}

const miGato = new Gato('Luna');
console.log(miGato.hacerSonido());
// Ej: "Luna hace: Miau! (y ronronea suavemente)"`,
  },

  {
    id: 'a-s2-d5',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 2,
    dia: 5,
    titulo: 'Array de objetos',
    descripcion: 'Trabaja con arrays de instancias de clases y usa los métodos de array.',
    instrucciones: [
      'Crea un array con 4 instancias de la clase Persona (del reto s2-d1).',
      'Usa filter() para obtener las personas mayores de 25 años.',
      'Usa map() para obtener solo los nombres.',
      'Usa find() para encontrar la persona con un nombre específico.',
    ],
    criterios: [
      'El array tiene 4 instancias de Persona.',
      'filter() devuelve las personas > 25 años.',
      'map() devuelve solo los nombres.',
      'find() retorna el objeto Persona correcto.',
    ],
    xp: 40,
    etiquetas: ['POO', 'Arrays', 'Instancias', 'map/filter/find'],
    tipo_entrega: 'codigo',
    codigo_inicial: `class Persona {
  constructor(nombre, edad) {
    this.nombre = nombre;
    this.edad = edad;
  }
  presentarse() {
    return \`Hola, soy \${this.nombre} y tengo \${this.edad} años.\`;
  }
}

// Array de personas
const personas = [
  new Persona('Ana', 22),
  new Persona('Carlos', 30),
  new Persona('María', 28),
  new Persona('José', 19),
];

// 1. Mayores de 25 años
const mayores = personas.filter();
console.log('Mayores de 25:', mayores.map(p => p.nombre));

// 2. Solo nombres
const nombres = personas.map();
console.log('Nombres:', nombres);

// 3. Encontrar a María
const maria = personas.find();
console.log(maria?.presentarse());`,
  },

  {
    id: 'a-s2-sem',
    tipo: 'semanal',
    nivel: 'avanzado',
    semana: 2,
    titulo: 'Sistema de tienda con POO',
    descripcion: 'Diseña un pequeño sistema de tienda usando clases y herencia.',
    instrucciones: [
      'Crea la clase "Producto" con: nombre, precio, stock.',
      'Agrega métodos: vender(cantidad) que reduce el stock, verDisponibilidad() que retorna si hay stock.',
      'Crea la clase "ProductoDigital" que extiende Producto.',
      'ProductoDigital sobreescribe vender() para que el stock no se reduzca (descargas ilimitadas).',
      'Crea una clase "Carrito" con un array de { producto, cantidad }.',
      'Carrito tiene métodos: agregar(producto, cantidad), calcularTotal(), mostrarResumen().',
      'Instancia productos y un carrito, agrega productos y muestra el resumen.',
    ],
    criterios: [
      'Clase Producto con los métodos indicados.',
      'Clase ProductoDigital hereda y sobreescribe vender().',
      'Clase Carrito gestiona productos y cantidades.',
      'calcularTotal() devuelve la suma correcta.',
      'mostrarResumen() muestra todos los productos del carrito.',
    ],
    xp: 175,
    etiquetas: ['POO', 'Herencia', 'Clases', 'Arrays', 'Proyecto'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Sistema de Tienda con POO

class Producto {
  constructor(nombre, precio, stock) {
    // Tu código aquí
  }

  vender(cantidad) {
    // Tu código aquí
  }

  verDisponibilidad() {
    // Tu código aquí
  }
}

class ProductoDigital extends Producto {
  constructor(nombre, precio) {
    super(nombre, precio, Infinity);
  }

  vender(cantidad) {
    // Sobreescribe: el stock no se reduce
  }
}

class Carrito {
  constructor() {
    this.items = [];
  }

  agregar(producto, cantidad) {
    // Tu código aquí
  }

  calcularTotal() {
    // Tu código aquí
  }

  mostrarResumen() {
    // Tu código aquí
  }
}

// Prueba tu sistema
const laptop = new Producto('Laptop', 1200, 5);
const curso = new ProductoDigital('Curso de JS', 49);

const carrito = new Carrito();
carrito.agregar(laptop, 1);
carrito.agregar(curso, 2);
carrito.mostrarResumen();
console.log('Total:', carrito.calcularTotal());`,
  },

  // ── SEMANA 3 (POO Avanzada) ───────────────────────────────────────────────

  {
    id: 'a-s3-d1',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 3,
    dia: 1,
    titulo: 'Getters y Setters',
    descripcion: 'Usa get y set para controlar el acceso a propiedades de una clase.',
    instrucciones: [
      'Crea una clase "Temperatura" con una propiedad privada _celsius.',
      'Agrega un getter "celsius" que retorne el valor.',
      'Agrega un setter "celsius" que valide que la temperatura no sea menor a -273.15 (cero absoluto).',
      'Agrega un getter "fahrenheit" que convierta y retorne la temperatura en Fahrenheit.',
    ],
    criterios: [
      'Se usa la convención _celsius para la propiedad privada.',
      'El setter valida el rango mínimo.',
      'El getter fahrenheit hace la conversión correctamente (°F = °C * 9/5 + 32).',
    ],
    xp: 45,
    etiquetas: ['POO', 'Getters', 'Setters', 'Encapsulamiento'],
    tipo_entrega: 'codigo',
    codigo_inicial: `class Temperatura {
  constructor(celsius) {
    this._celsius = celsius;
  }

  get celsius() {
    return this._celsius;
  }

  set celsius(valor) {
    // Valida que valor >= -273.15

  }

  get fahrenheit() {
    // Retorna la temperatura en Fahrenheit

  }
}

const temp = new Temperatura(25);
console.log(temp.celsius);     // 25
console.log(temp.fahrenheit);  // 77

temp.celsius = 100;
console.log(temp.fahrenheit);  // 212

temp.celsius = -300; // Debe mostrar error`,
  },

  {
    id: 'a-s3-d2',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 3,
    dia: 2,
    titulo: 'Métodos estáticos',
    descripcion: 'Crea y usa métodos static que pertenecen a la clase, no a las instancias.',
    instrucciones: [
      'Crea una clase "MatematicasUtils" con métodos static.',
      'Agrega static esPrimo(n): retorna true si n es primo.',
      'Agrega static factoriales(n): retorna el factorial de n.',
      'Agrega static maximo(...nums): retorna el número mayor del array.',
      'Llama los métodos sin instanciar la clase.',
    ],
    criterios: [
      'Todos los métodos son static.',
      'esPrimo() funciona correctamente para 7 (true) y 10 (false).',
      'factorial() calcula correctamente (5! = 120).',
      'maximo() acepta cualquier cantidad de argumentos.',
    ],
    xp: 45,
    etiquetas: ['POO', 'Static', 'Métodos de clase'],
    tipo_entrega: 'codigo',
    codigo_inicial: `class MatematicasUtils {

  static esPrimo(n) {
    // Retorna true si n es primo

  }

  static factorial(n) {
    // Retorna n!

  }

  static maximo(...nums) {
    // Retorna el mayor de los números

  }
}

// Usar sin instanciar
console.log(MatematicasUtils.esPrimo(7));    // true
console.log(MatematicasUtils.esPrimo(10));   // false
console.log(MatematicasUtils.factorial(5));  // 120
console.log(MatematicasUtils.maximo(3, 7, 1, 9, 4)); // 9`,
  },

  {
    id: 'a-s3-d3',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 3,
    dia: 3,
    titulo: 'Polimorfismo en práctica',
    descripcion: 'Demuestra polimorfismo: objetos de distintas clases responden al mismo método.',
    instrucciones: [
      'Crea 3 clases: Circulo, Rectangulo, Triangulo.',
      'Cada una tiene un método calcularArea() con su fórmula correspondiente.',
      'Crea un array con una instancia de cada figura.',
      'Usa forEach para llamar calcularArea() en cada figura y mostrar el resultado.',
    ],
    criterios: [
      'Las 3 clases tienen el método calcularArea().',
      'Cada clase calcula el área con la fórmula correcta.',
      'El array contiene instancias de las 3 clases.',
      'forEach llama calcularArea() polimórficamente.',
    ],
    xp: 50,
    etiquetas: ['POO', 'Polimorfismo', 'Clases', 'Figuras'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Polimorfismo: todas las figuras tienen calcularArea()

class Circulo {
  constructor(radio) {
    this.radio = radio;
  }
  calcularArea() {
    // π * r²
  }
  toString() { return \`Círculo (r=\${this.radio})\`; }
}

class Rectangulo {
  constructor(ancho, alto) {
    this.ancho = ancho;
    this.alto = alto;
  }
  calcularArea() {
    // ancho * alto
  }
  toString() { return \`Rectángulo (\${this.ancho}x\${this.alto})\`; }
}

class Triangulo {
  constructor(base, altura) {
    this.base = base;
    this.altura = altura;
  }
  calcularArea() {
    // (base * altura) / 2
  }
  toString() { return \`Triángulo (b=\${this.base}, h=\${this.altura})\`; }
}

// Array con una instancia de cada figura
const figuras = [
  new Circulo(5),
  new Rectangulo(4, 6),
  new Triangulo(3, 8),
];

// Polimorfismo en acción
figuras.forEach(figura => {
  console.log(\`\${figura}: Área = \${figura.calcularArea().toFixed(2)}\`);
});`,
  },

  {
    id: 'a-s3-d4',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 3,
    dia: 4,
    titulo: 'Promesas básicas',
    descripcion: 'Comprende y usa Promesas para manejar código asíncrono.',
    instrucciones: [
      'Crea una función "esperar(ms)" que devuelve una Promise que se resuelve después de ms milisegundos.',
      'Crea una función "obtenerDatos(id)" que simula una consulta: si id > 0 resuelve con datos, si no rechaza con error.',
      'Usa .then() y .catch() para manejar los resultados.',
    ],
    criterios: [
      'esperar() devuelve una Promise con setTimeout.',
      'obtenerDatos() resuelve o rechaza según el id.',
      'Se usan .then() y .catch() correctamente.',
    ],
    xp: 50,
    etiquetas: ['JavaScript', 'Promesas', 'Asíncrono'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Promesas básicas

function esperar(ms) {
  return new Promise(resolve => {
    // Resuelve después de ms milisegundos con setTimeout

  });
}

function obtenerDatos(id) {
  return new Promise((resolve, reject) => {
    if (id > 0) {
      // Simula datos del usuario
      resolve({ id, nombre: 'Usuario ' + id, activo: true });
    } else {
      // Rechaza con error

    }
  });
}

// Usar las promesas
obtenerDatos(1)
  .then(datos => console.log('Datos:', datos))
  .catch(error => console.error('Error:', error));

obtenerDatos(-1)
  .then(datos => console.log('Datos:', datos))
  .catch(error => console.error('Error:', error));`,
  },

  {
    id: 'a-s3-d5',
    tipo: 'diario',
    nivel: 'avanzado',
    semana: 3,
    dia: 5,
    titulo: 'Async / Await',
    descripcion: 'Reescribe código con promesas usando async/await para mayor legibilidad.',
    instrucciones: [
      'Usa las funciones esperar() y obtenerDatos() del reto anterior.',
      'Crea una función async "cargarPerfil(id)" que: espera 500ms, luego obtiene los datos, luego los muestra.',
      'Usa try/catch para manejar errores.',
      'Llama la función con un id válido y uno inválido.',
    ],
    criterios: [
      'La función usa async/await.',
      'Se usa await esperar() para simular la demora.',
      'Se usa try/catch para manejar el rechazo de la promesa.',
      'Se llama con id positivo y negativo.',
    ],
    xp: 50,
    etiquetas: ['JavaScript', 'async/await', 'try/catch'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// De las funciones del reto anterior:
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function obtenerDatos(id) {
  return new Promise((resolve, reject) => {
    if (id > 0) resolve({ id, nombre: 'Usuario ' + id, activo: true });
    else reject(new Error('ID inválido: debe ser mayor a 0'));
  });
}

// Tu función async aquí
async function cargarPerfil(id) {
  try {
    console.log(\`Cargando perfil \${id}...\`);
    // 1. Espera 500ms
    // 2. Obtiene los datos
    // 3. Muestra los datos

  } catch (error) {
    // Maneja el error

  }
}

// Pruebas
cargarPerfil(3);
cargarPerfil(-1);`,
  },

  {
    id: 'a-s3-sem',
    tipo: 'semanal',
    nivel: 'avanzado',
    semana: 3,
    titulo: 'Sistema de gestión de empleados',
    descripcion: 'Diseña un sistema completo de gestión de empleados usando POO avanzada.',
    instrucciones: [
      'Crea la clase base "Empleado" con: nombre, salarioBase, departamento.',
      'Métodos: calcularSalario() (retorna salarioBase), toString().',
      'Crea "EmpleadoPorHoras" que extiende Empleado: horasTrabajadas, tarifaPorHora. calcularSalario() = horas * tarifa.',
      'Crea "Gerente" que extiende Empleado: bono. calcularSalario() = salarioBase + bono.',
      'Crea clase "Empresa" con nombre y array de empleados.',
      'Empresa tiene: contratar(empleado), calcularNomina() (suma total de salarios), empleadoMejorPagado(), reportePorDepartamento().',
      'Instancia varios empleados de distintos tipos, contratalos y genera un reporte.',
    ],
    criterios: [
      'Las 3 clases de empleados implementan calcularSalario() correctamente.',
      'Clase Empresa gestiona el array de empleados.',
      'calcularNomina() suma correctamente.',
      'empleadoMejorPagado() retorna el correcto.',
      'reportePorDepartamento() agrupa por departamento.',
    ],
    xp: 200,
    etiquetas: ['POO', 'Herencia', 'Polimorfismo', 'static', 'Proyecto'],
    tipo_entrega: 'codigo',
    codigo_inicial: `// Sistema de Gestión de Empleados

class Empleado {
  constructor(nombre, salarioBase, departamento) {
    // Tu código aquí
  }
  calcularSalario() { return this.salarioBase; }
  toString() { return \`\${this.nombre} [\${this.departamento}]\`; }
}

class EmpleadoPorHoras extends Empleado {
  constructor(nombre, horasTrabajadas, tarifaPorHora, departamento) {
    // Tu código aquí
  }
  calcularSalario() {
    // horas * tarifa
  }
}

class Gerente extends Empleado {
  constructor(nombre, salarioBase, bono, departamento) {
    // Tu código aquí
  }
  calcularSalario() {
    // salarioBase + bono
  }
}

class Empresa {
  constructor(nombre) {
    this.nombre = nombre;
    this.empleados = [];
  }
  contratar(empleado) { this.empleados.push(empleado); }
  calcularNomina() { /* Tu código */ }
  empleadoMejorPagado() { /* Tu código */ }
  reportePorDepartamento() { /* Tu código */ }
}

// Prueba tu sistema
const empresa = new Empresa('TechVE');
empresa.contratar(new Gerente('Ana Torres', 3000, 800, 'Tecnología'));
empresa.contratar(new EmpleadoPorHoras('Carlos Ruiz', 160, 12, 'Soporte'));
empresa.contratar(new Empleado('María López', 1500, 'Administración'));
empresa.contratar(new Gerente('José Pérez', 2800, 600, 'Tecnología'));

console.log('Nómina total:', empresa.calcularNomina());
console.log('Mejor pagado:', empresa.empleadoMejorPagado().toString());
empresa.reportePorDepartamento();`,
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Unificación y utilidades
// ────────────────────────────────────────────────────────────────────────────

export const TODOS_LOS_RETOS = [...RETOS_BASICO, ...RETOS_AVANZADO];

/** Devuelve los retos de un nivel específico */
export function getRetosPorNivel(nivel) {
  return TODOS_LOS_RETOS.filter(r => r.nivel === nivel);
}

/** Devuelve los retos de una semana específica */
export function getRetosPorSemana(nivel, semana) {
  return TODOS_LOS_RETOS.filter(r => r.nivel === nivel && r.semana === semana);
}

/** Devuelve el reto diario de hoy según el nivel (rotación por día del año) */
export function getRetoDiarioHoy(nivel) {
  const diarios = TODOS_LOS_RETOS.filter(r => r.nivel === nivel && r.tipo === 'diario');
  const hoy = new Date();
  const diaDelAnio = Math.floor((hoy - new Date(hoy.getFullYear(), 0, 0)) / 86400000);
  return diarios[diaDelAnio % diarios.length];
}

/** Devuelve el reto semanal de esta semana según el nivel */
export function getRetoSemanalActual(nivel) {
  const semanales = TODOS_LOS_RETOS.filter(r => r.nivel === nivel && r.tipo === 'semanal');
  const semanaDelAnio = Math.ceil(new Date().getDate() / 7);
  return semanales[semanaDelAnio % semanales.length];
}
