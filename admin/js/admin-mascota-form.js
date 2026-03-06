// ===== FORMULARIO DE NUEVA MASCOTA CON SELECCIÓN DE ARCHIVO LOCAL =====

// Referencias a elementos
const imagenFile = document.getElementById('imagenFile');
const previewContainer = document.getElementById('previewContainer');
const fileInfo = document.getElementById('fileInfo');
const imagenRuta = document.getElementById('imagenRuta');

// Mapa de archivos seleccionados (para simular la "copia" a la carpeta del proyecto)
const archivosSeleccionados = {};

// Vista previa de imagen al seleccionar archivo
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

            // Crear nombre único para el archivo
            const timestamp = Date.now();
            const nombreLimpio = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const nuevoNombre = `${timestamp}_${nombreLimpio}`;
            
            // En un entorno real, aquí necesitarías subir el archivo al servidor
            // Como es solo frontend, simulamos que se guarda en la carpeta mascotas
            const rutaSimulada = `assets/images/mascotas/${nuevoNombre}`;
            
            // Guardar la referencia del archivo (simulado)
            archivosSeleccionados[nuevoNombre] = file;
            imagenRuta.value = rutaSimulada;
            
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
                    <strong>Archivo seleccionado:</strong> ${file.name}<br>
                    <strong>Tamaño:</strong> ${(file.size / 1024).toFixed(2)} KB<br>
                    <strong>Se guardará como:</strong> ${rutaSimulada}
                `;
            }
        } else {
            if (previewContainer) {
                previewContainer.innerHTML = '<p class="sin-imagen">No hay imagen seleccionada</p>';
            }
            if (fileInfo) {
                fileInfo.innerHTML = '';
            }
            if (imagenRuta) {
                imagenRuta.value = '';
            }
        }
    });
}

// Guardar mascota
const form = document.getElementById('formMascota');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validar que se haya seleccionado una imagen
        if (!imagenRuta || !imagenRuta.value) {
            alert('Debes seleccionar una imagen para la mascota');
            return;
        }
        
        // Obtener personalidad seleccionada
        const personalidad = [];
        document.querySelectorAll('.checkbox-grid input:checked').forEach(cb => {
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
            personalidad: personalidad,
            salud: document.getElementById('salud').value || '',
            descripcion: document.getElementById('descripcion').value,
            imagen: imagenRuta.value,
            estado: 'disponible',
            fechaRegistro: firebase.firestore.FieldValue.serverTimestamp(),
            registradoPor: auth.currentUser ? auth.currentUser.uid : null
        };
        
        try {
            // Guardar en Firestore
            await db.collection('mascotas').add(datosMascota);
            
            alert('✅ Mascota registrada correctamente');
            
            // Instrucciones para mover el archivo manualmente
            if (imagenFile && imagenFile.files[0]) {
                const instrucciones = `
                    IMPORTANTE: Debes copiar manualmente el archivo a la carpeta del proyecto.
                    
                    Archivo original: ${imagenFile.files[0].name}
                    Debe estar en: /assets/images/mascotas/${imagenRuta.value.split('/').pop()}
                    
                    Pasos:
                    1. Abre la carpeta de tu proyecto
                    2. Ve a la carpeta 'assets/images/mascotas/'
                    3. Copia el archivo seleccionado con el nombre indicado
                `;
                alert(instrucciones);
            }
            
            window.location.href = 'mascotas.html';
            
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error: ' + error.message);
        }
    });
}