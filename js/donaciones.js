// ===== DONACIONES - FUNCIONES PARA FIRESTORE =====

/**
 * Registrar una nueva donación
 * @param {Object} datosDonacion - Datos de la donación
 * @returns {Promise<Object>} Resultado de la operación
 */
async function registrarDonacion(datosDonacion) {
    try {
        const user = auth.currentUser;
        
        const donacion = {
            nombreDonante: datosDonacion.nombre,
            email: datosDonacion.email,
            monto: datosDonacion.monto,
            tipoDonacion: datosDonacion.tipo,
            fechaDonacion: firebase.firestore.FieldValue.serverTimestamp(),
            metodoPago: datosDonacion.metodoPago,
            mensaje: datosDonacion.mensaje || ''
        };
        
        if (user) {
            donacion.usuarioId = user.uid;
        }
        
        await db.collection('donaciones').add(donacion);
        
        return { 
            success: true, 
            message: 'Gracias por tu donación' 
        };
        
    } catch (error) {
        console.error('Error al registrar donación:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

/**
 * Obtener donaciones (solo admin)
 * @returns {Promise<Array>} Lista de donaciones
 */
async function obtenerDonaciones() {
    try {
        const snapshot = await db.collection('donaciones')
            .orderBy('fechaDonacion', 'desc')
            .get();
            
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
    } catch (error) {
        console.error('Error al obtener donaciones:', error);
        return [];
    }
}

/**
 * Obtener total de donaciones
 * @returns {Promise<number>} Monto total
 */
async function obtenerTotalDonaciones() {
    try {
        const snapshot = await db.collection('donaciones').get();
        let total = 0;
        
        snapshot.forEach(doc => {
            total += doc.data().monto || 0;
        });
        
        return total;
        
    } catch (error) {
        console.error('Error al calcular total:', error);
        return 0;
    }
}