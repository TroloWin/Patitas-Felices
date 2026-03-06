auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = '../login/login.html';
        return;
    }

    const userDoc = await db.collection('usuarios').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData?.esAdmin) {
        window.location.href = '../index.html';
        return;
    }

    document.getElementById('adminNombre').textContent = userData.nombre || 'Admin';
    
    const fecha = new Date();
    document.getElementById('fechaActual').textContent = fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    cargarEstadisticas();
});

async function cargarEstadisticas() {
    try {
        const mascotasSnap = await db.collection('mascotas').get();
        document.getElementById('totalMascotas').textContent = mascotasSnap.size;

        const solicitudesSnap = await db.collection('solicitudes')
            .where('estado', '==', 'pendiente')
            .get();
        document.getElementById('solicitudesPendientes').textContent = solicitudesSnap.size;

        const usuariosSnap = await db.collection('usuarios')
            .where('activo', '==', true)
            .get();
        document.getElementById('usuariosActivos').textContent = usuariosSnap.size;

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

function cerrarSesion() {
    auth.signOut().then(() => {
        window.location.href = '../index.html';
    });
}