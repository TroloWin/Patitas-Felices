let todasLasMascotas = [];

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

    cargarMascotas();
});

async function cargarMascotas() {
    try {
        const snapshot = await db.collection('mascotas')
            .orderBy('fechaRegistro', 'desc')
            .get();
            
        todasLasMascotas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        mostrarMascotas(todasLasMascotas);
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarMascotas(mascotas) {
    const tbody = document.getElementById('tablaMascotas');
    
    if (mascotas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No hay mascotas</td></tr>';
        return;
    }
    
    tbody.innerHTML = mascotas.map(m => `
        <tr>
            <td>${m.nombre}</td>
            <td>${m.especie}</td>
            <td>${m.edad} años</td>
            <td>
                <select onchange="cambiarEstado('${m.id}', this.value)">
                    <option value="disponible" ${m.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
                    <option value="proceso" ${m.estado === 'proceso' ? 'selected' : ''}>En proceso</option>
                    <option value="adoptado" ${m.estado === 'adoptado' ? 'selected' : ''}>Adoptado</option>
                </select>
            </td>
            <td class="acciones">
                <button onclick="editarMascota('${m.id}')" class="btn-editar">
                    <img src="../assets/icons/edit.svg" alt="Editar" width="16">
                </button>
                <button onclick="eliminarMascota('${m.id}')" class="btn-eliminar">
                    <img src="../assets/icons/delete.svg" alt="Eliminar" width="16">
                </button>
            </td>
        </tr>
    `).join('');
}

async function cambiarEstado(mascotaId, nuevoEstado) {
    try {
        await db.collection('mascotas').doc(mascotaId).update({
            estado: nuevoEstado
        });
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function editarMascota(id) {
    window.location.href = `mascota-editar.html?id=${id}`;
}

async function eliminarMascota(id) {
    if (!confirm('¿Eliminar esta mascota?')) return;
    
    try {
        await db.collection('mascotas').doc(id).delete();
        cargarMascotas();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function aplicarFiltros() {
    const busqueda = document.getElementById('buscar').value.toLowerCase();
    const especie = document.getElementById('filtroEspecie').value;
    const estado = document.getElementById('filtroEstado').value;
    
    let filtradas = todasLasMascotas;
    
    if (busqueda) {
        filtradas = filtradas.filter(m => m.nombre.toLowerCase().includes(busqueda));
    }
    if (especie) {
        filtradas = filtradas.filter(m => m.especie === especie);
    }
    if (estado) {
        filtradas = filtradas.filter(m => m.estado === estado);
    }
    
    mostrarMascotas(filtradas);
}