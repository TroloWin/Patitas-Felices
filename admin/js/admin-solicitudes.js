let solicitudSeleccionada = null;

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = '../login/login.html';
        return;
    }

    const userDoc = await db.collection('usuarios').doc(user.uid).get();
    if (!userDoc.data()?.esAdmin) {
        window.location.href = '../index.html';
        return;
    }

    cargarSolicitudes();
});

async function cargarSolicitudes() {
    const filtro = document.getElementById('filtroEstado').value;
    
    try {
        let query = db.collection('solicitudes').orderBy('fechaSolicitud', 'desc');
        
        if (filtro !== 'todos') {
            query = query.where('estado', '==', filtro);
        }
        
        const snapshot = await query.get();
        const solicitudes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        mostrarSolicitudes(solicitudes);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarSolicitudes(solicitudes) {
    const container = document.getElementById('solicitudesContainer');
    
    if (solicitudes.length === 0) {
        container.innerHTML = '<p>No hay solicitudes</p>';
        return;
    }
    
    container.innerHTML = solicitudes.map(s => {
        const fecha = s.fechaSolicitud ? new Date(s.fechaSolicitud.toDate()).toLocaleDateString() : 'Fecha no disponible';
        const badgeClass = s.estado === 'pendiente' ? 'badge-pendiente' : 
                          (s.estado === 'aprobada' ? 'badge-aprobada' : 'badge-rechazada');
        
        return `
            <div class="solicitud-card">
                <div class="solicitud-header">
                    <h3>Solicitud de ${s.adoptante?.nombre || 'Usuario'}</h3>
                    <span class="badge ${badgeClass}">${s.estado.toUpperCase()}</span>
                </div>
                <div class="solicitud-body">
                    <div class="solicitud-info">
                        <p><strong>Mascota:</strong> ${s.mascota?.nombre || 'No especificado'}</p>
                        <p><strong>Email:</strong> ${s.adoptante?.email || 'No especificado'}</p>
                        <p><strong>Fecha:</strong> ${fecha}</p>
                        ${s.motivoRechazo ? `<p><strong>Motivo:</strong> ${s.motivoRechazo}</p>` : ''}
                    </div>
                    ${s.estado === 'pendiente' ? `
                        <div class="solicitud-acciones">
                            <button onclick="aprobar('${s.id}', '${s.mascotaId}')" class="btn-aprobar">Aprobar</button>
                            <button onclick="abrirRechazo('${s.id}')" class="btn-rechazar">Rechazar</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function aprobar(solicitudId, mascotaId) {
    if (!confirm('¿Aprobar esta solicitud?')) return;
    
    try {
        await db.collection('solicitudes').doc(solicitudId).update({
            estado: 'aprobada',
            fechaProcesamiento: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('mascotas').doc(mascotaId).update({
            estado: 'adoptado'
        });
        
        alert('Solicitud aprobada');
        cargarSolicitudes();
        
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function abrirRechazo(solicitudId) {
    solicitudSeleccionada = solicitudId;
    document.getElementById('modalRechazar').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalRechazar').style.display = 'none';
    document.getElementById('motivoRechazo').value = '';
}

async function confirmarRechazo() {
    const motivo = document.getElementById('motivoRechazo').value;
    if (!motivo) {
        alert('Debes indicar un motivo');
        return;
    }
    
    try {
        await db.collection('solicitudes').doc(solicitudSeleccionada).update({
            estado: 'rechazada',
            motivoRechazo: motivo,
            fechaProcesamiento: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Solicitud rechazada');
        cerrarModal();
        cargarSolicitudes();
        
    } catch (error) {
        alert('Error: ' + error.message);
    }
}