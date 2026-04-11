/**
 * Obtiene la ruta correcta de la imagen para cualquier mascota
 * @param {Object} mascota - Datos de la mascota desde Firebase
 * @returns {string} Ruta completa de la imagen
 */
function obtenerRutaImagen(mascota) {
    // Si no hay imagen en Firebase
    if (!mascota.imagen) {
        return 'assets/images/default-pet.png';
    }
    
    // Extraer solo el nombre del archivo (por si viene con ruta completa)
    const nombreArchivo = mascota.imagen.split('/').pop();
    
    // Lista de extensiones válidas
    const extensionesValidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    // Verificar si el archivo tiene extensión válida
    const tieneExtension = extensionesValidas.some(ext => 
        nombreArchivo.toLowerCase().endsWith(ext)
    );
    
    if (!tieneExtension) {
        console.warn('Extension no valida para: ' + nombreArchivo);
        return 'assets/images/default-pet.png';
    }
    
    // Devolver la ruta completa
    return 'assets/images/mascotas/' + nombreArchivo;
}

/**
 * Obtener todas las mascotas desde Firestore
 * @param {Object} filtros - Filtros a aplicar (especie, tamano, busqueda)
 * @returns {Promise<Array>} Lista de mascotas
 */
async function obtenerMascotas(filtros = {}) {
    try {
        console.log('Obteniendo mascotas con filtros:', filtros);
        
        let query = db.collection('mascotas');
        
        // Aplicar filtro de especie
        if (filtros.especie && filtros.especie !== 'todos') {
            console.log('Filtrando por especie:', filtros.especie);
            query = query.where('especie', '==', filtros.especie);
        }
        
        // Aplicar filtro de tamaño
        if (filtros.tamano && filtros.tamano !== 'todos') {
            console.log('Filtrando por tamaño:', filtros.tamano);
            query = query.where('tamano', '==', filtros.tamano);
        }
        
        const snapshot = await query.get();
        console.log('Documentos encontrados:', snapshot.size);
        
        let mascotas = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            
            // Crear objeto mascota con la imagen procesada
            const mascota = {
                id: doc.id,
                ...data
            };
            
            // Asignar la ruta correcta de la imagen
            mascota.imagenUrl = obtenerRutaImagen(mascota);
            
            mascotas.push(mascota);
        });
        
        // Ordenar manualmente en JavaScript
        mascotas.sort((a, b) => {
            if (!a.fechaRegistro) return 1;
            if (!b.fechaRegistro) return -1;
            const tiempoA = a.fechaRegistro?.seconds || 0;
            const tiempoB = b.fechaRegistro?.seconds || 0;
            return tiempoB - tiempoA;
        });
        
        // Filtrar por busqueda de texto
        if (filtros.busqueda && filtros.busqueda.trim() !== '') {
            const busqueda = filtros.busqueda.toLowerCase().trim();
            mascotas = mascotas.filter(m => 
                m.nombre?.toLowerCase().includes(busqueda) ||
                (m.raza && m.raza.toLowerCase().includes(busqueda))
            );
        }
        
        console.log('Mascotas obtenidas:', mascotas.length);
        return mascotas;
        
    } catch (error) {
        console.error('Error al obtener mascotas:', error);
        return [];
    }
}

/**
 * Obtener una mascota por su ID
 * @param {string} id - ID de la mascota
 * @returns {Promise<Object|null>} Datos de la mascota
 */
async function obtenerMascotaPorId(id) {
    try {
        console.log('Obteniendo mascota con ID:', id);
        
        const doc = await db.collection('mascotas').doc(id).get();
        
        if (doc.exists) {
            const data = doc.data();
            
            const mascota = {
                id: doc.id,
                ...data
            };
            
            // Asignar la ruta correcta de la imagen
            mascota.imagenUrl = obtenerRutaImagen(mascota);
            
            return mascota;
        } else {
            console.log('Mascota no encontrada');
            return null;
        }
    } catch (error) {
        console.error('Error al obtener mascota:', error);
        return null;
    }
}

/**
 * Obtener mascotas destacadas para el home (por popularidad)
 * @param {number} limite - Numero de mascotas a mostrar
 * @returns {Promise<Array>} Lista de mascotas destacadas
 */
async function obtenerMascotasDestacadas(limite = 5) {
    try {
        console.log('Obteniendo mascotas destacadas, limite:', limite);
        
        // Obtener todas las mascotas disponibles
        const mascotasSnap = await db.collection('mascotas')
            .where('estado', '==', 'disponible')
            .get();
        
        if (mascotasSnap.empty) {
            console.log('No hay mascotas disponibles');
            return [];
        }
        
        // Intentar obtener solicitudes (puede fallar si no hay datos)
        let conteoSolicitudes = {};
        try {
            const solicitudesSnap = await db.collection('solicitudes').get();
            solicitudesSnap.forEach(doc => {
                const data = doc.data();
                const mascotaId = data.mascotaId;
                if (mascotaId) {
                    conteoSolicitudes[mascotaId] = (conteoSolicitudes[mascotaId] || 0) + 1;
                }
            });
            console.log('Solicitudes cargadas:', Object.keys(conteoSolicitudes).length);
        } catch (errorSolicitudes) {
            console.log('No hay solicitudes registradas o error de permisos:', errorSolicitudes.message);
            // Continuar sin solicitudes
        }
        
        // Construir array de mascotas
        let mascotas = [];
        mascotasSnap.forEach(doc => {
            const data = doc.data();
            const mascota = {
                id: doc.id,
                nombre: data.nombre || 'Mascota',
                especie: data.especie || 'Mascota',
                raza: data.raza || 'Mestizo',
                edad: data.edad || 'Joven',
                tamano: data.tamano || 'Mediano',
                descripcion: data.descripcion || '',
                imagen: data.imagen || null,
                solicitudes: conteoSolicitudes[doc.id] || 0,
                fechaRegistro: data.fechaRegistro
            };
            
            // Asignar la ruta correcta de la imagen
            mascota.imagenUrl = obtenerRutaImagen(mascota);
            
            mascotas.push(mascota);
        });
        
        // Ordenar por número de solicitudes (mayor a menor)
        mascotas.sort((a, b) => b.solicitudes - a.solicitudes);
        
        // Tomar las primeras 'limite' mascotas
        mascotas = mascotas.slice(0, limite);
        
        console.log('Mascotas destacadas obtenidas:', mascotas.length);
        return mascotas;
        
    } catch (error) {
        console.error('Error al obtener mascotas destacadas:', error);
        return [];
    }
}

// Exportar funciones para usar en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        obtenerRutaImagen,
        obtenerMascotas,
        obtenerMascotaPorId,
        obtenerMascotasDestacadas
    };
}