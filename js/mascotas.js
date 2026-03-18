/**
 * Obtiene la ruta correcta de la imagen para cualquier mascota
 * @param {Object} mascota - Datos de la mascota desde Firebase
 * @returns {string} Ruta completa de la imagen
 */
function obtenerRutaImagen(mascota) {
    // Si no hay imagen en Firebase
    if (!mascota.imagen) {
        return 'assets/images/mascotas/ ' + nombreArchivo;
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
        return 'assets/images/mascotas/default ' + nombreArchivo;
    }
    
    // Devolver la ruta completa
    return 'assets/images/mascotas/' + nombreArchivo;
}

/**
 * Obtener todas las mascotas desde Firestore (SIN FILTRO DE ESTADO)
 * @param {Object} filtros - Filtros a aplicar (especie, tamano, busqueda)
 * @returns {Promise<Array>} Lista de mascotas
 */
async function obtenerMascotas(filtros = {}) {
    try {
        console.log('Obteniendo mascotas con filtros:', filtros);
        
        let query = db.collection('mascotas');
        
        // ELIMINADO: query.where('estado', '==', 'disponible')
        // El estado se maneja en adoptar.html con la logica de solicitudes
        
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
        
        // SOLUCION TEMPORAL: Comentamos el orderBy hasta que se cree el indice
        // query = query.orderBy('fechaRegistro', 'desc');
        
        const snapshot = await query.get();
        console.log('Documentos encontrados:', snapshot.size);
        
        let mascotas = [];
        snapshot.forEach(doc => {
            console.log('Documento:', doc.id, doc.data());
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
        
        // Ordenar manualmente en JavaScript (solucion temporal)
        mascotas.sort((a, b) => {
            // Si no hay fecha, poner al final
            if (!a.fechaRegistro) return 1;
            if (!b.fechaRegistro) return -1;
            
            // Comparar timestamps de Firestore
            const tiempoA = a.fechaRegistro.seconds || 0;
            const tiempoB = b.fechaRegistro.seconds || 0;
            
            return tiempoB - tiempoA; // Mas reciente primero
        });
        
        console.log('Mascotas ordenadas manualmente:', mascotas.length);
        
        // Filtrar por busqueda de texto (Firestore no soporta busqueda parcial)
        if (filtros.busqueda && filtros.busqueda.trim() !== '') {
            const busqueda = filtros.busqueda.toLowerCase().trim();
            console.log('Filtrando por busqueda:', busqueda);
            mascotas = mascotas.filter(m => 
                m.nombre.toLowerCase().includes(busqueda) ||
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
            console.log('Mascota encontrada:', doc.data());
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
 * Obtener mascotas destacadas para el home
 * @param {number} limite - Numero de mascotas a mostrar
 * @returns {Promise<Array>} Lista de mascotas destacadas
 */
async function obtenerMascotasDestacadas(limite = 3) {
    try {
        console.log('Obteniendo mascotas destacadas, limite:', limite);
        
        // SOLUCION TEMPORAL: Sin orderBy en la consulta
        const snapshot = await db.collection('mascotas')
            .where('estado', '==', 'disponible')
            // .orderBy('fechaRegistro', 'desc') // Comentado temporalmente
            // .limit(limite) // El limite tambien requiere orden, lo aplicamos despues
            .get();
        
        let mascotas = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            
            const mascota = {
                id: doc.id,
                ...data
            };
            
            // Asignar la ruta correcta de la imagen
            mascota.imagenUrl = obtenerRutaImagen(mascota);
            
            mascotas.push(mascota);
        });
        
        // Ordenar manualmente
        mascotas.sort((a, b) => {
            if (!a.fechaRegistro) return 1;
            if (!b.fechaRegistro) return -1;
            const tiempoA = a.fechaRegistro.seconds || 0;
            const tiempoB = b.fechaRegistro.seconds || 0;
            return tiempoB - tiempoA;
        });
        
        // Aplicar limite despues de ordenar
        mascotas = mascotas.slice(0, limite);
        
        console.log('Mascotas destacadas:', mascotas.length);
        return mascotas;
        
    } catch (error) {
        console.error('Error al obtener mascotas destacadas:', error);
        return [];
    }
}