// ===== ADMIN - FUNCIONES PARA GESTIÓN DE USUARIOS =====

/**
 * Obtener todos los usuarios (solo admin)
 * @returns {Promise<Array>} Lista de usuarios
 */
async function obtenerTodosLosUsuarios() {
    try {
        const snapshot = await db.collection('usuarios').get();
        return snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return [];
    }
}

/**
 * Cambiar rol de usuario (admin/usuario normal)
 * @param {string} userId - ID del usuario
 * @param {boolean} esAdmin - Nuevo valor para esAdmin
 * @returns {Promise<Object>} Resultado de la operación
 */
async function cambiarRolUsuario(userId, esAdmin) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No autorizado');

        // Verificar que sea admin
        const userDoc = await db.collection('usuarios').doc(user.uid).get();
        if (!userDoc.data()?.esAdmin) {
            throw new Error('Solo administradores pueden cambiar roles');
        }

        await db.collection('usuarios').doc(userId).update({
            esAdmin: esAdmin
        });

        return { success: true };

    } catch (error) {
        console.error('Error al cambiar rol:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Activar/desactivar usuario
 * @param {string} userId - ID del usuario
 * @param {boolean} activo - Nuevo estado
 * @returns {Promise<Object>} Resultado de la operación
 */
async function cambiarEstadoUsuario(userId, activo) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No autorizado');

        // Verificar que sea admin
        const userDoc = await db.collection('usuarios').doc(user.uid).get();
        if (!userDoc.data()?.esAdmin) {
            throw new Error('Solo administradores pueden cambiar estados');
        }

        await db.collection('usuarios').doc(userId).update({
            activo: activo
        });

        return { success: true };

    } catch (error) {
        console.error('Error al cambiar estado:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtener estadísticas del dashboard
 * @returns {Promise<Object>} Estadísticas
 */
async function obtenerEstadisticasDashboard() {
    try {
        const [usuarios, solicitudes, mascotas] = await Promise.all([
            db.collection('usuarios').get(),
            db.collection('solicitudes').get(),
            db.collection('mascotas').get()
        ]);

        const usuariosData = usuarios.docs.map(doc => doc.data());
        const solicitudesData = solicitudes.docs.map(doc => doc.data());

        return {
            usuarios: {
                total: usuarios.size,
                admins: usuariosData.filter(u => u.esAdmin).length,
                adoptantes: usuariosData.filter(u => !u.esAdmin).length,
                activos: usuariosData.filter(u => u.activo).length,
                inactivos: usuariosData.filter(u => !u.activo).length
            },
            solicitudes: {
                total: solicitudes.size,
                pendientes: solicitudesData.filter(s => s.estado === 'pendiente').length,
                aprobadas: solicitudesData.filter(s => s.estado === 'aprobada').length,
                rechazadas: solicitudesData.filter(s => s.estado === 'rechazada').length
            },
            mascotas: {
                total: mascotas.size
            }
        };

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return null;
    }
}