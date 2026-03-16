// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    const btnLogin = document.getElementById('btnLogin');
    const mensajeError = document.getElementById('mensajeError');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const recordarme = document.getElementById('recordarme')?.checked || false;
        
        mensajeError.style.display = 'none';
        btnLogin.disabled = true;
        btnLogin.textContent = 'Iniciando sesión...';
        
        try {
            // Configurar persistencia
            const persistence = recordarme 
                ? firebase.auth.Auth.Persistence.LOCAL 
                : firebase.auth.Auth.Persistence.SESSION;
            await auth.setPersistence(persistence);
            
            // Iniciar sesión
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Obtener datos del usuario
            const userDoc = await db.collection('usuarios').doc(user.uid).get();
            const userData = userDoc.data();
            
            if (!userData) {
                throw new Error('Usuario no encontrado');
            }
            
            if (!userData.activo) {
                await auth.signOut();
                throw new Error('Usuario desactivado');
            }
            
            // Redirigir según rol
            if (userData.esAdmin) {
                window.location.href = '../admin/index.html';
            } else {
                window.location.href = '../adoptar.html';
            }
            
        } catch (error) {
            console.error('Error login:', error);
            
            let mensaje = 'Error al iniciar sesión';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                mensaje = 'Email o contraseña incorrectos';
            } else if (error.code === 'auth/too-many-requests') {
                mensaje = 'Demasiados intentos fallidos. Intenta más tarde';
            } else {
                mensaje = error.message;
            }
            
            mensajeError.textContent = mensaje;
            mensajeError.style.display = 'block';
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
        }
    });
}

// Registro
const registroForm = document.getElementById('registroForm');
if (registroForm) {
    const btnRegistro = document.getElementById('btnRegistro');
    const mensajeError = document.getElementById('mensajeError');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const modalTerminos = document.getElementById('modalTerminos');
    const modalExito = document.getElementById('modalExito');

    // Validar contraseñas
    function validarContraseñas() {
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity('Las contraseñas no coinciden');
            return false;
        } else {
            confirmPassword.setCustomValidity('');
            return true;
        }
    }

    password?.addEventListener('change', validarContraseñas);
    confirmPassword?.addEventListener('keyup', validarContraseñas);

    // Términos y condiciones
    const verTerminos = document.getElementById('verTerminos');
    if (verTerminos) {
        verTerminos.addEventListener('click', (e) => {
            e.preventDefault();
            modalTerminos.style.display = 'flex';
        });
    }

    window.cerrarModal = function() {
        if (modalTerminos) modalTerminos.style.display = 'none';
    };

    window.cerrarModalExito = function() {
        if (modalExito) modalExito.style.display = 'none';
        window.location.href = 'login.html';
    };

    window.onclick = function(event) {
        if (event.target === modalTerminos) {
            modalTerminos.style.display = 'none';
        }
        if (event.target === modalExito) {
            modalExito.style.display = 'none';
        }
    };

    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validarContraseñas()) {
            mensajeError.textContent = 'Las contraseñas no coinciden';
            mensajeError.style.display = 'block';
            return;
        }

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        mensajeError.style.display = 'none';
        btnRegistro.disabled = true;
        btnRegistro.textContent = 'Registrando...';
        
        try {
            // Crear usuario
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Guardar en Firestore
            await db.collection('usuarios').doc(user.uid).set({
                nombre: nombre,
                email: email,
                esAdmin: false,
                activo: true,
                fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Guardar email para mostrar en éxito
            sessionStorage.setItem('emailRegistrado', email);
            
            modalExito.style.display = 'flex';
            registroForm.reset();
            
        } catch (error) {
            console.error('Error registro:', error);
            
            let mensaje = '';
            switch(error.code) {
                case 'auth/email-already-in-use':
                    mensaje = 'Este correo ya está registrado';
                    break;
                case 'auth/invalid-email':
                    mensaje = 'Correo inválido';
                    break;
                case 'auth/weak-password':
                    mensaje = 'La contraseña debe tener al menos 6 caracteres';
                    break;
                default:
                    mensaje = 'Error al registrar. Intenta de nuevo.';
            }
            
            mensajeError.textContent = mensaje;
            mensajeError.style.display = 'block';
            btnRegistro.disabled = false;
            btnRegistro.textContent = 'Registrarse';
        }
    });
}

// Recuperar contraseña
const recuperarForm = document.getElementById('recuperarForm');
if (recuperarForm) {
    const btnRecuperar = document.getElementById('btnRecuperar');
    const mensajeError = document.getElementById('mensajeError');
    const mensajeExito = document.getElementById('mensajeExito');

    recuperarForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        
        mensajeError.style.display = 'none';
        mensajeExito.style.display = 'none';
        btnRecuperar.disabled = true;
        btnRecuperar.textContent = 'Enviando...';
        
        try {
            await auth.sendPasswordResetEmail(email);
            
            mensajeExito.textContent = 'Revisa tu correo para restablecer tu contraseña';
            mensajeExito.style.display = 'block';
            recuperarForm.reset();
            
        } catch (error) {
            console.error('Error recuperar:', error);
            
            let mensaje = '';
            if (error.code === 'auth/user-not-found') {
                mensaje = 'No existe una cuenta con este correo';
            } else if (error.code === 'auth/invalid-email') {
                mensaje = 'Correo inválido';
            } else {
                mensaje = 'Error al enviar el correo';
            }
            
            mensajeError.textContent = mensaje;
            mensajeError.style.display = 'block';
        }
        
        btnRecuperar.disabled = false;
        btnRecuperar.textContent = 'Enviar enlace';
    });
}