/**
 * ARCHIVO: storageService.js
 * 
 * En mi tesis, utilizo Firebase Storage para guardar los archivos multimedia
 * (como las imágenes de portada de los módulos o archivos adjuntos).
 * Esta capa abstrae la subida, listado y eliminación de archivos.
 */

import { storage } from './config';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
} from 'firebase/storage';

// SUBIDA DE ARCHIVOS (UPLOAD)

/**
 * Sube un archivo a Firebase Storage mostrando el progreso.
 * Le agrego un timestamp al nombre para evitar que archivos con el mismo
 * nombre se sobrescriban por accidente.
 */
export function subirArchivo(archivo, rutaDestino, alProgresar) {
  return new Promise((resolve, reject) => {
    // Nombre seguro sin espacios ni caracteres raros
    const nombreSeguro = archivo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const rutaCompleta = `${rutaDestino}/${Date.now()}_${nombreSeguro}`;

    const storageRef = ref(storage, rutaCompleta);
    const metadata = { contentType: archivo.type || 'application/octet-stream' };
    const tareaSubida = uploadBytesResumable(storageRef, archivo, metadata);

    tareaSubida.on(
      'state_changed',
      (snapshot) => {
        if (typeof alProgresar === 'function') {
          const porcentaje = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          alProgresar(porcentaje);
        }
      },
      (error) => {
        console.error('[storageService] error al subirArchivo:', error);
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(tareaSubida.snapshot.ref);
          resolve({ url, rutaFirebase: tareaSubida.snapshot.ref.fullPath });
        } catch (err) {
          console.error('[storageService] error al obtener URL tras la subida:', err);
          reject(err);
        }
      },
    );
  });
}

// OBTENER URL (RETRIEVE)

export async function getUrlArchivo(rutaFirebase) {
  try {
    const storageRef = ref(storage, rutaFirebase);
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.error('[storageService] error en getUrlArchivo:', err);
    throw err;
  }
}

// LISTAR ARCHIVOS

/**
 * Lista todos los archivos dentro de una carpeta en Storage.
 * Como resuelve la URL pública de cada uno, es un poco pesado,
 * así que lo uso solo para carpetas pequeñas.
 */
export async function listarArchivos(rutaCarpeta) {
  try {
    const folderRef = ref(storage, rutaCarpeta);
    const resultado = await listAll(folderRef);

    const archivos = await Promise.all(
      resultado.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          nombre: itemRef.name,
          rutaFirebase: itemRef.fullPath,
          url,
        };
      }),
    );

    return archivos;
  } catch (err) {
    console.error('[storageService] error en listarArchivos:', err);
    throw err;
  }
}

// ELIMINAR (DELETE)

/**
 * Elimina un archivo permanentemente del Storage de Firebase.
 */
export async function eliminarArchivo(rutaFirebase) {
  try {
    const storageRef = ref(storage, rutaFirebase);
    await deleteObject(storageRef);
  } catch (err) {
    console.error('[storageService] error en eliminarArchivo:', err);
    throw err;
  }
}
