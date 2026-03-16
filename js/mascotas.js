// ===== MASCOTAS - FUNCIONES PARA FIRESTORE =====
// VERSIÓN TEMPORAL - SIN ORDERBY EN LA CONSULTA

/**
 * Obtener todas las mascotas disponibles desde Firestore
 * @param {Object} filtros - Filtros a aplicar (especie, tamano, busqueda)
 * @returns {Promise<Array>} Lista de mascotas
 */
async function obtenerMascotas(filtros = {}) {
    try {
        console.log('🔍 Obteniendo mascotas con filtros:', filtros);
        
        let query = db.collection('mascotas');
        
        // Por defecto, mostrar solo disponibles
        query = query.where('estado', '==', 'disponible');
        
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
        
        // ⚠️ SOLUCIÓN TEMPORAL: Comentamos el orderBy hasta que se cree el índice
        // query = query.orderBy('fechaRegistro', 'desc');
        
        const snapshot = await query.get();
        console.log('📦 Documentos encontrados:', snapshot.size);
        
        let mascotas = [];
        snapshot.forEach(doc => {
            console.log('Documento:', doc.id, doc.data());
            mascotas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // 🔧 Ordenar manualmente en JavaScript (solución temporal)
        mascotas.sort((a, b) => {
            // Si no hay fecha, poner al final
            if (!a.fechaRegistro) return 1;
            if (!b.fechaRegistro) return -1;
            
            // Comparar timestamps de Firestore
            const tiempoA = a.fechaRegistro.seconds || 0;
            const tiempoB = b.fechaRegistro.seconds || 0;
            
            return tiempoB - tiempoA; // Más reciente primero
        });
        
        console.log('✅ Mascotas ordenadas manualmente:', mascotas.length);
        
        // Filtrar por búsqueda de texto (Firestore no soporta búsqueda parcial)
        if (filtros.busqueda && filtros.busqueda.trim() !== '') {
            const busqueda = filtros.busqueda.toLowerCase().trim();
            console.log('Filtrando por búsqueda:', busqueda);
            mascotas = mascotas.filter(m => 
                m.nombre.toLowerCase().includes(busqueda) ||
                (m.raza && m.raza.toLowerCase().includes(busqueda))
            );
        }
        
        console.log('✅ Mascotas obtenidas:', mascotas.length);
        return mascotas;
        
    } catch (error) {
        console.error('❌ Error al obtener mascotas:', error);
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
        console.log('🔍 Obteniendo mascota con ID:', id);
        
        const doc = await db.collection('mascotas').doc(id).get();
        
        if (doc.exists) {
            console.log('✅ Mascota encontrada:', doc.data());
            return {
                id: doc.id,
                ...doc.data()
            };
        } else {
            console.log('❌ Mascota no encontrada');
            return null;
        }
    } catch (error) {
        console.error('❌ Error al obtener mascota:', error);
        return null;
    }
}

/**
 * Obtener mascotas destacadas para el home
 * @param {number} limite - Número de mascotas a mostrar
 * @returns {Promise<Array>} Lista de mascotas destacadas
 */
async function obtenerMascotasDestacadas(limite = 3) {
    try {
        console.log('🔍 Obteniendo mascotas destacadas, límite:', limite);
        
        // ⚠️ SOLUCIÓN TEMPORAL: Sin orderBy en la consulta
        const snapshot = await db.collection('mascotas')
            .where('estado', '==', 'disponible')
            // .orderBy('fechaRegistro', 'desc') // Comentado temporalmente
            // .limit(limite) // El límite también requiere orden, lo aplicamos después
            .get();
        
        let mascotas = [];
        snapshot.forEach(doc => {
            mascotas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Ordenar manualmente
        mascotas.sort((a, b) => {
            if (!a.fechaRegistro) return 1;
            if (!b.fechaRegistro) return -1;
            const tiempoA = a.fechaRegistro.seconds || 0;
            const tiempoB = b.fechaRegistro.seconds || 0;
            return tiempoB - tiempoA;
        });
        
        // Aplicar límite después de ordenar
        mascotas = mascotas.slice(0, limite);
        
        console.log('✅ Mascotas destacadas:', mascotas.length);
        return mascotas;
        
    } catch (error) {
        console.error('❌ Error al obtener mascotas destacadas:', error);
        return [];
    }
}