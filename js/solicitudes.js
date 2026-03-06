// ===== SOLICITUDES - FUNCIONES PARA FIRESTORE =====
// VERSIÓN TEMPORAL - SIN ORDERBY EN LA CONSULTA

/**
 * Enviar una nueva solicitud de adopción
 * @param {string} mascotaId - ID de la mascota
 * @param {Object} mascotaData - Datos de la mascota
 * @returns {Promise<Object>} Resultado de la operación
 */
async function enviarSolicitud(mascotaId, mascotaData) {
    try {
        console.log('🔍 Enviando solicitud para mascota:', mascotaId);
        
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Debes iniciar sesión para adoptar');
        }
        console.log('Usuario:', user.uid);

        // Obtener datos del usuario
        const userDoc = await db.collection('usuarios').doc(user.uid).get();
        if (!userDoc.exists) {
            throw new Error('Usuario no encontrado en la base de datos');
        }
        
        const userData = userDoc.data();
        console.log('Datos del usuario:', userData);

        // Verificar si ya tiene una solicitud pendiente para esta mascota
        const solicitudesExistentes = await db.collection('solicitudes')
            .where('usuarioId', '==', user.uid)
            .where('mascotaId', '==', mascotaId)
            .where('estado', 'in', ['pendiente', 'aprobada'])
            .get();

        if (!solicitudesExistentes.empty) {
            console.log('⚠️ Ya existe una solicitud activa');
            throw new Error('Ya tienes una solicitud activa para esta mascota');
        }

        // Crear la solicitud
        const solicitud = {
            usuarioId: user.uid,
            mascotaId: mascotaId,
            fechaSolicitud: firebase.firestore.FieldValue.serverTimestamp(),
            estado: 'pendiente',
            adoptante: {
                nombre: userData.nombre || 'Sin nombre',
                email: user.email,
                telefono: userData.telefono || 'No proporcionado'
            },
            mascota: {
                nombre: mascotaData.nombre,
                especie: mascotaData.especie,
                imagen: mascotaData.imagen || ''
            }
        };

        console.log('📦 Guardando solicitud:', solicitud);

        const docRef = await db.collection('solicitudes').add(solicitud);
        console.log('✅ Solicitud creada con ID:', docRef.id);
        
        return { 
            success: true, 
            id: docRef.id,
            message: 'Solicitud enviada correctamente'
        };

    } catch (error) {
        console.error('❌ Error al enviar solicitud:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

/**
 * Obtener solicitudes del usuario actual (SIN ÍNDICE)
 * @returns {Promise<Array>} Lista de solicitudes
 */
async function obtenerMisSolicitudes() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('⚠️ Usuario no autenticado');
            return [];
        }

        console.log('🔍 Obteniendo solicitudes para usuario:', user.uid);
        
        // ⚠️ SOLUCIÓN TEMPORAL: Solo filtramos por usuarioId, sin orderBy
        const snapshot = await db.collection('solicitudes')
            .where('usuarioId', '==', user.uid)
            .get();

        const solicitudes = [];
        snapshot.forEach(doc => {
            solicitudes.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // 🔧 Ordenar manualmente en JavaScript
        solicitudes.sort((a, b) => {
            // Si no hay fecha, poner al final
            if (!a.fechaSolicitud) return 1;
            if (!b.fechaSolicitud) return -1;
            
            // Comparar timestamps de Firestore
            const tiempoA = a.fechaSolicitud?.seconds || 0;
            const tiempoB = b.fechaSolicitud?.seconds || 0;
            
            return tiempoB - tiempoA; // Más reciente primero
        });
        
        console.log('✅ Solicitudes encontradas (ordenadas manualmente):', solicitudes.length);
        return solicitudes;

    } catch (error) {
        console.error('❌ Error al obtener solicitudes:', error);
        return [];
    }
}

/**
 * Obtener todas las solicitudes (para admin) - VERSIÓN SIN ÍNDICE
 * @param {string} filtroEstado - Filtrar por estado
 * @returns {Promise<Array>} Lista de solicitudes
 */
async function obtenerTodasLasSolicitudes(filtroEstado = 'todos') {
    try {
        console.log('🔍 Obteniendo todas las solicitudes, filtro:', filtroEstado);
        
        let query = db.collection('solicitudes');
        
        if (filtroEstado && filtroEstado !== 'todos') {
            query = query.where('estado', '==', filtroEstado);
        }
        
        // ⚠️ SOLUCIÓN TEMPORAL: Sin orderBy
        const snapshot = await query.get();
        
        let solicitudes = [];
        snapshot.forEach(doc => {
            solicitudes.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // 🔧 Ordenar manualmente
        solicitudes.sort((a, b) => {
            if (!a.fechaSolicitud) return 1;
            if (!b.fechaSolicitud) return -1;
            const tiempoA = a.fechaSolicitud?.seconds || 0;
            const tiempoB = b.fechaSolicitud?.seconds || 0;
            return tiempoB - tiempoA;
        });
        
        console.log('✅ Solicitudes obtenidas:', solicitudes.length);
        return solicitudes;

    } catch (error) {
        console.error('❌ Error al obtener solicitudes:', error);
        return [];
    }
}

/**
 * Aprobar una solicitud (solo admin)
 */
async function aprobarSolicitud(solicitudId, mascotaId) {
    try {
        console.log('🔍 Aprobando solicitud:', solicitudId);
        
        await db.collection('solicitudes').doc(solicitudId).update({
            estado: 'aprobada',
            fechaProcesamiento: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        if (mascotaId) {
            await db.collection('mascotas').doc(mascotaId).update({
                estado: 'adoptado'
            });
        }
        
        console.log('✅ Solicitud aprobada');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error al aprobar solicitud:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Rechazar una solicitud (solo admin)
 */
async function rechazarSolicitud(solicitudId, motivo) {
    try {
        console.log('🔍 Rechazando solicitud:', solicitudId, 'Motivo:', motivo);
        
        await db.collection('solicitudes').doc(solicitudId).update({
            estado: 'rechazada',
            motivoRechazo: motivo,
            fechaProcesamiento: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Solicitud rechazada');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error al rechazar solicitud:', error);
        return { success: false, error: error.message };
    }
}