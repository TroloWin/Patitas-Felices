let todosLosUsuarios = [];

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

    cargarUsuarios();
});

async function cargarUsuarios() {
    try {
        const snapshot = await db.collection('usuarios').get();
        todosLosUsuarios = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));
        mostrarUsuarios(todosLosUsuarios);
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarUsuarios(usuarios) {
    const tbody = document.getElementById('tablaUsuarios');
    
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No hay usuarios</td></tr>';
        return;
    }
    
    tbody.innerHTML = usuarios.map(u => `
        <tr>
            <td>${u.nombre || '—'}</td>
            <td>${u.email}</td>
            <td><span class="badge ${u.esAdmin ? 'badge-admin' : 'badge-user'}">${u.esAdmin ? 'ADMIN' : 'ADOPTANTE'}</span></td>
            <td><span class="badge ${u.activo ? 'badge-activo' : 'badge-inactivo'}">${u.activo ? 'ACTIVO' : 'INACTIVO'}</span></td>
            <td class="acciones">
                ${!u.esAdmin ? `
                    <button onclick="cambiarRol('${u.uid}', true)" class="btn-admin">Hacer Admin</button>
                ` : `
                    <button onclick="cambiarRol('${u.uid}', false)" class="btn-user">Quitar Admin</button>
                `}
                <button onclick="toggleEstado('${u.uid}', ${u.activo})" 
                        class="${u.activo ? 'btn-desactivar' : 'btn-activar'}">
                    ${u.activo ? 'Desactivar' : 'Activar'}
                </button>
            </td>
        </tr>
    `).join('');
}

async function cambiarRol(userId, hacerAdmin) {
    if (!confirm(`¿${hacerAdmin ? 'Hacer admin' : 'Quitar admin'}?`)) return;
    
    try {
        await db.collection('usuarios').doc(userId).update({
            esAdmin: hacerAdmin
        });
        cargarUsuarios();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function toggleEstado(userId, estadoActual) {
    const nuevoEstado = !estadoActual;
    if (!confirm(`${nuevoEstado ? 'Activar' : 'Desactivar'} usuario?`)) return;
    
    try {
        await db.collection('usuarios').doc(userId).update({
            activo: nuevoEstado
        });
        cargarUsuarios();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function aplicarFiltros() {
    const busqueda = document.getElementById('buscar').value.toLowerCase();
    const tipo = document.getElementById('filtroTipo').value;
    const estado = document.getElementById('filtroEstado').value;
    
    let filtrados = todosLosUsuarios;
    
    if (busqueda) {
        filtrados = filtrados.filter(u => 
            u.nombre?.toLowerCase().includes(busqueda) || 
            u.email.toLowerCase().includes(busqueda)
        );
    }
    if (tipo) {
        filtrados = filtrados.filter(u => tipo === 'admin' ? u.esAdmin : !u.esAdmin);
    }
    if (estado) {
        filtrados = filtrados.filter(u => estado === 'activo' ? u.activo : !u.activo);
    }
    
    mostrarUsuarios(filtrados);
}