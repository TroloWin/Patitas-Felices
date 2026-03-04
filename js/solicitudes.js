// ===== SOLICITUDES - VERSIÓN DE PRUEBA (sin Firebase) =====

const STORAGE_KEY = 'patitas_solicitudes';

/**
 * Enviar una nueva solicitud de adopcion (guarda en localStorage)
 * @param {string} mascotaId - ID de la mascota
 * @param {Object} mascotaData - Datos de la mascota
 * @returns {Promise<Object>} Resultado de la operacion
 */
async function enviarSolicitud(mascotaId, mascotaData) {
    console.log('=== ENVIAR SOLICITUD (PRUEBA) ===');
    console.log('mascotaId:', mascotaId);
    console.log('mascotaData:', mascotaData);
    
    try {
        // Simular un pequeño retraso como si fuera una operación real
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user = auth.currentUser;
        console.log('Usuario actual:', user ? user.uid : 'No hay usuario');
        
        if (!user) {
            throw new Error('Debes iniciar sesion para adoptar');
        }

        // Obtener datos del usuario desde localStorage (simulado)
        // En una app real, estos vendrían de Firestore
        const userData = {
            nombre: user.displayName || 'Usuario',
            email: user.email,
            telefono: 'No proporcionado',
            direccion: 'No proporcionada'
        };

        // Obtener solicitudes existentes de localStorage
        const solicitudesExistentes = obtenerTodasLasSolicitudesStorage();
        
        // Verificar si ya tiene una solicitud pendiente para esta mascota
        const solicitudExistente = solicitudesExistentes.find(s => 
            s.usuarioId === user.uid && 
            s.mascotaId === mascotaId && 
            (s.estado === 'pendiente' || s.estado === 'aprobada')
        );

        if (solicitudExistente) {
            throw new Error('Ya tienes una solicitud activa para esta mascota');
        }

        // Crear la nueva solicitud
        const nuevaSolicitud = {
            id: generarIdUnico(),
            usuarioId: user.uid,
            mascotaId: mascotaId,
            fechaSolicitud: new Date().toISOString(),
            estado: 'pendiente',
            adoptante: {
                nombre: userData.nombre,
                email: user.email,
                telefono: userData.telefono,
                direccion: userData.direccion
            },
            mascota: {
                nombre: mascotaData.nombre,
                especie: mascotaData.especie,
                imagen: mascotaData.imagen || '',
                edad: mascotaData.edad || 0,
                tamano: mascotaData.tamano || 'No especificado'
            },
            notificado: false
        };

        console.log('Nueva solicitud:', nuevaSolicitud);

        // Guardar en localStorage
        solicitudesExistentes.push(nuevaSolicitud);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudesExistentes));
        
        console.log('Solicitud guardada en localStorage');
        console.log('=== FIN ENVIAR SOLICITUD (EXITO) ===');
        
        return { 
            success: true, 
            id: nuevaSolicitud.id,
            message: 'Solicitud enviada correctamente'
        };

    } catch (error) {
        console.error('Error al enviar solicitud:', error);
        console.log('=== FIN ENVIAR SOLICITUD (ERROR) ===');
        return { 
            success: false, 
            error: error.message 
        };
    }
}

/**
 * Obtener solicitudes del usuario actual desde localStorage
 * @returns {Promise<Array>} Lista de solicitudes
 */
async function obtenerMisSolicitudes() {
    console.log('=== OBTENER MIS SOLICITUDES (PRUEBA) ===');
    
    try {
        const user = auth.currentUser;
        console.log('Usuario actual:', user ? user.uid : 'No hay usuario');
        
        if (!user) {
            console.log('No hay usuario autenticado');
            return [];
        }

        // Obtener todas las solicitudes de localStorage
        const todasLasSolicitudes = obtenerTodasLasSolicitudesStorage();
        
        // Filtrar por usuario actual
        const misSolicitudes = todasLasSolicitudes.filter(s => s.usuarioId === user.uid);
        
        // Ordenar por fecha (más reciente primero)
        misSolicitudes.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));
        
        console.log('Solicitudes encontradas: ' + misSolicitudes.length);
        console.log('Datos:', misSolicitudes);
        console.log('=== FIN OBTENER MIS SOLICITUDES ===');
        
        return misSolicitudes;

    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        console.log('=== FIN OBTENER MIS SOLICITUDES (ERROR) ===');
        return [];
    }
}

/**
 * Obtener todas las solicitudes (para admin) desde localStorage
 * @param {string} filtroEstado - Filtrar por estado
 * @returns {Promise<Array>} Lista de solicitudes
 */
async function obtenerTodasLasSolicitudes(filtroEstado = 'todos') {
    console.log('=== OBTENER TODAS LAS SOLICITUDES (PRUEBA) ===');
    console.log('filtroEstado:', filtroEstado);
    
    try {
        // Simular un pequeño retraso
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let solicitudes = obtenerTodasLasSolicitudesStorage();

        if (filtroEstado && filtroEstado !== 'todos') {
            solicitudes = solicitudes.filter(s => s.estado === filtroEstado);
        }
        
        // Ordenar por fecha (más reciente primero)
        solicitudes.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));
        
        console.log('Solicitudes encontradas: ' + solicitudes.length);
        console.log('=== FIN OBTENER TODAS LAS SOLICITUDES ===');
        
        return solicitudes;

    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        console.log('=== FIN OBTENER TODAS LAS SOLICITUDES (ERROR) ===');
        return [];
    }
}

/**
 * Obtener todas las solicitudes del localStorage
 * @returns {Array} Lista de solicitudes
 */
function obtenerTodasLasSolicitudesStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Generar un ID único para las solicitudes
 * @returns {string} ID único
 */
function generarIdUnico() {
    return 'sol_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Aprobar una solicitud (solo admin)
 * @param {string} solicitudId - ID de la solicitud
 * @returns {Promise<Object>} Resultado de la operacion
 */
async function aprobarSolicitud(solicitudId) {
    console.log('=== APROBAR SOLICITUD (PRUEBA) ===');
    console.log('solicitudId:', solicitudId);
    
    try {
        // Simular retraso
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const solicitudes = obtenerTodasLasSolicitudesStorage();
        const index = solicitudes.findIndex(s => s.id === solicitudId);
        
        if (index === -1) {
            throw new Error('La solicitud no existe');
        }

        // Actualizar la solicitud
        solicitudes[index].estado = 'aprobada';
        solicitudes[index].fechaProcesamiento = new Date().toISOString();
        solicitudes[index].notificado = false;

        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));

        console.log('Solicitud aprobada');
        console.log('=== FIN APROBAR SOLICITUD ===');
        
        return { success: true };

    } catch (error) {
        console.error('Error al aprobar solicitud:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Rechazar una solicitud (solo admin)
 * @param {string} solicitudId - ID de la solicitud
 * @param {string} motivo - Motivo del rechazo
 * @returns {Promise<Object>} Resultado de la operacion
 */
async function rechazarSolicitud(solicitudId, motivo) {
    console.log('=== RECHAZAR SOLICITUD (PRUEBA) ===');
    console.log('solicitudId:', solicitudId);
    console.log('motivo:', motivo);
    
    try {
        // Simular retraso
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const solicitudes = obtenerTodasLasSolicitudesStorage();
        const index = solicitudes.findIndex(s => s.id === solicitudId);
        
        if (index === -1) {
            throw new Error('La solicitud no existe');
        }

        // Actualizar la solicitud
        solicitudes[index].estado = 'rechazada';
        solicitudes[index].motivoRechazo = motivo;
        solicitudes[index].fechaProcesamiento = new Date().toISOString();
        solicitudes[index].notificado = false;

        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));

        console.log('Solicitud rechazada');
        console.log('=== FIN RECHAZAR SOLICITUD ===');
        
        return { success: true };

    } catch (error) {
        console.error('Error al rechazar solicitud:', error);
        return { success: false, error: error.message };
    }
}

// Función para limpiar todas las solicitudes (útil para pruebas)
function limpiarTodasLasSolicitudes() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Todas las solicitudes eliminadas');
}

// Función para crear solicitudes de prueba
function crearSolicitudesDePrueba() {
    const solicitudesEjemplo = [
        {
            id: generarIdUnico(),
            usuarioId: 'usuario1',
            mascotaId: 'perro1',
            fechaSolicitud: new Date(2024, 0, 15, 10, 30).toISOString(),
            estado: 'pendiente',
            adoptante: {
                nombre: 'Ana García',
                email: 'ana@email.com',
                telefono: '555-1234',
                direccion: 'Calle Principal 123'
            },
            mascota: {
                nombre: 'Luna',
                especie: 'perro',
                imagen: 'assets/images/mascotas/perro-luna.png',
                edad: 2,
                tamano: 'mediano'
            }
        },
        {
            id: generarIdUnico(),
            usuarioId: 'usuario2',
            mascotaId: 'gato1',
            fechaSolicitud: new Date(2024, 0, 10, 15, 45).toISOString(),
            estado: 'aprobada',
            fechaProcesamiento: new Date(2024, 0, 12, 9, 0).toISOString(),
            adoptante: {
                nombre: 'Carlos Ruiz',
                email: 'carlos@email.com',
                telefono: '555-5678',
                direccion: 'Av. Reforma 456'
            },
            mascota: {
                nombre: 'Simba',
                especie: 'gato',
                imagen: 'assets/images/mascotas/gato-simba.png',
                edad: 1,
                tamano: 'pequeño'
            }
        }
    ];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudesEjemplo));
    console.log('Solicitudes de prueba creadas');
}