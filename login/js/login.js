// =============================
// FUNCION PARA MOSTRAR MENSAJES
// =============================
function mostrarMensaje(elemento, mensaje, tipo = "error") {

    if (!elemento) return;

    elemento.textContent = mensaje;
    elemento.style.display = "block";

    if (tipo === "error") {
        elemento.style.color = "#e74c3c";
    } 
    else if (tipo === "exito") {
        elemento.style.color = "#2ecc71";
    } 
    else {
        elemento.style.color = "#3498db";
    }

}


// =============================
// LOGIN
// =============================
const loginForm = document.getElementById('loginForm');

if (loginForm) {

    const btnLogin = document.getElementById('btnLogin');
    const mensajeError = document.getElementById('credencialesInvalidas');

    loginForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const recordarme = document.getElementById('recordarme')?.checked || false;

        mensajeError.style.display = 'none';

        btnLogin.disabled = true;
        btnLogin.textContent = "Iniciando sesión...";

        try {

            // =============================
            // CONFIGURAR PERSISTENCIA
            // =============================
            const persistence = recordarme
                ? firebase.auth.Auth.Persistence.LOCAL
                : firebase.auth.Auth.Persistence.SESSION;

            await auth.setPersistence(persistence);

            // =============================
            // INICIAR SESION
            // =============================
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // =============================
            // OBTENER DATOS DEL USUARIO
            // =============================
            const userDoc = await db.collection('usuarios').doc(user.uid).get();
            const userData = userDoc.data();

            if (!userData) {
                throw new Error("Usuario no encontrado");
            }

            if (!userData.activo) {
                await auth.signOut();
                throw new Error("Usuario desactivado");
            }

            // =============================
            // MENSAJE DE EXITO
            // =============================
            mostrarMensaje(mensajeError, "Inicio de sesión exitoso. Redirigiendo...", "exito");

            setTimeout(() => {

                if (userData.esAdmin) {
                    window.location.href = '../admin/index.html';
                } else {
                    window.location.href = '../adoptar.html';
                }

            }, 1200);

        } catch (error) {

            console.error("Error login:", error);

            let mensaje = "Credenciales inválidas";

            if (error.code === "auth/too-many-requests") {
                mensaje = "Demasiados intentos fallidos. Intenta más tarde";
            }

            mostrarMensaje(mensajeError, mensaje, "error");

            btnLogin.disabled = false;
            btnLogin.textContent = "Iniciar Sesión";
        }

    });

}