// ===== FORMULARIO DE EDICIÓN DE MASCOTA =====

// Obtener ID de la URL
const urlParams = new URLSearchParams(window.location.search);
const mascotaId = urlParams.get('id');

if (!mascotaId) {
    window.location.href = 'mascotas.html';
}

// Referencias a elementos
const form = document.getElementById('formMascota');
const imagenFile = document.getElementById('imagenFile');
const previewContainer = document.getElementById('previewContainer');
const fileInfo = document.getElementById('fileInfo');
const imagenRuta = document.getElementById('imagenRuta');
const imagenActual = document.getElementById('imagenActual');
const noImagen = document.getElementById('noImagen');

let imagenOriginal = ''; // Guardar la ruta de la imagen original
let archivoSeleccionado = null;

// Vista previa de nueva imagen
if (imagenFile) {
    imagenFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            // Validar tipo de archivo
            const tipoValido = file.type.startsWith('image/');
            if (!tipoValido) {
                alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, GIF)');
                imagenFile.value = '';
                return;
            }
            
            // Validar tamaño (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                alert('La imagen no debe superar los 5MB');
                imagenFile.value = '';
                return;
            }

            // Guardar referencia del archivo
            archivoSeleccionado = file;
            
            // Crear nombre único para el archivo
            const timestamp = Date.now();
            const nombreLimpio = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const nuevoNombre = `${timestamp}_${nombreLimpio}`;
            const rutaNueva = `assets/images/mascotas/${nuevoNombre}`;
            
            // Guardar la nueva ruta
            if (imagenRuta) imagenRuta.value = rutaNueva;
            
            // Mostrar vista previa
            const reader = new FileReader();
            reader.onload = function(e) {
                if (previewContainer) {
                    previewContainer.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
                }
            };
            reader.readAsDataURL(file);
            
            // Mostrar información del archivo
            if (fileInfo) {
                fileInfo.innerHTML = `
                    <strong>Nueva imagen seleccionada:</strong> ${file.name}<br>
                    <strong>Tamaño:</strong> ${(file.size / 1024).toFixed(2)} KB<br>
                    <strong>Se guardará como:</strong> ${rutaNueva}<br>
                    <strong>Nota:</strong> La imagen original no será eliminada automáticamente.
                `;
            }
        } else {
            if (previewContainer) {
                previewContainer.innerHTML = '<p class="sin-imagen">Vista previa de nueva imagen</p>';
            }
            if (fileInfo) {
                fileInfo.innerHTML = '';
            }
            if (imagenRuta) {
                imagenRuta.value = imagenOriginal; // Restaurar ruta original
            }
            archivoSeleccionado = null;
        }
    });
}

// Cargar datos de la mascota
async function cargarMascota() {
    try {
        const doc = await db.collection('mascotas').doc(mascotaId).get();
        
        if (!doc.exists) {
            alert('Mascota no encontrada');
            window.location.href = 'mascotas.html';
            return;
        }
        
        const mascota = doc.data();
        imagenOriginal = mascota.imagen || '';
        
        // Llenar formulario
        document.getElementById('mascotaId').value = mascotaId;
        document.getElementById('nombre').value = mascota.nombre || '';
        document.getElementById('especie').value = mascota.especie || '';
        document.getElementById('raza').value = mascota.raza || '';
        document.getElementById('edad').value = mascota.edad || '';
        document.getElementById('tamano').value = mascota.tamano || '';
        document.getElementById('sexo').value = mascota.sexo || '';
        document.getElementById('color').value = mascota.color || '';
        document.getElementById('estado').value = mascota.estado || 'disponible';
        document.getElementById('salud').value = mascota.salud || '';
        document.getElementById('descripcion').value = mascota.descripcion || '';
        
        // Marcar personalidad
        if (mascota.personalidad && Array.isArray(mascota.personalidad)) {
            document.querySelectorAll('#personalidadContainer input[type="checkbox"]').forEach(cb => {
                cb.checked = mascota.personalidad.includes(cb.value);
            });
        }
        
        // Mostrar imagen actual
        if (mascota.imagen) {
            if (imagenActual) {
                imagenActual.src = `../${mascota.imagen}`;
                imagenActual.style.display = 'inline-block';
            }
            if (noImagen) noImagen.style.display = 'none';
            
            // Guardar ruta original en el campo oculto
            if (imagenRuta) imagenRuta.value = mascota.imagen;
        } else {
            if (imagenActual) imagenActual.style.display = 'none';
            if (noImagen) noImagen.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error cargando mascota:', error);
        alert('Error al cargar la mascota');
    }
}

// Guardar cambios
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener personalidad seleccionada
        const personalidad = [];
        document.querySelectorAll('#personalidadContainer input:checked').forEach(cb => {
            personalidad.push(cb.value);
        });
        
        // Crear objeto con datos
        const datosMascota = {
            nombre: document.getElementById('nombre').value,
            especie: document.getElementById('especie').value,
            raza: document.getElementById('raza').value || '',
            edad: parseFloat(document.getElementById('edad').value),
            tamano: document.getElementById('tamano').value,
            sexo: document.getElementById('sexo').value,
            color: document.getElementById('color').value || '',
            estado: document.getElementById('estado').value,
            personalidad: personalidad,
            salud: document.getElementById('salud').value || '',
            descripcion: document.getElementById('descripcion').value,
            fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Si se seleccionó una nueva imagen, actualizar la ruta
        if (imagenRuta && imagenRuta.value) {
            datosMascota.imagen = imagenRuta.value;
        }
        
        try {
            // Actualizar en Firestore
            await db.collection('mascotas').doc(mascotaId).update(datosMascota);
            
            let mensajeExito = '✅ Mascota actualizada correctamente';
            
            // Si hay nueva imagen, dar instrucciones
            if (archivoSeleccionado) {
                mensajeExito += `\n\nIMPORTANTE: Debes copiar manualmente el archivo "${archivoSeleccionado.name}" a la carpeta "assets/images/mascotas/" con el nombre "${imagenRuta.value.split('/').pop()}"`;
            }
            
            alert(mensajeExito);
            window.location.href = 'mascotas.html';
            
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error: ' + error.message);
        }
    });
}

// Verificar autenticación
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

    cargarMascota();
});