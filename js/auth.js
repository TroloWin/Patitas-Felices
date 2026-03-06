// ===== AUTENTICACIÓN - FUNCIONES COMPARTIDAS =====

/**
 * Iniciar sesión
 * @param {string} email - Correo electrónico
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Usuario y datos
 */
async function iniciarSesion(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Obtener datos del usuario desde Firestore
        const userDoc = await db.collection('usuarios').doc(user.uid).get();
        
        if (!userDoc.exists) {
            await auth.signOut();
            throw new Error('Usuario no encontrado en la base de datos');
        }
        
        const userData = userDoc.data();
        
        if (!userData.activo) {
            await auth.signOut();
            throw new Error('Usuario desactivado. Contacta al administrador.');
        }
        
        return { user, userData };
        
    } catch (error) {
        console.error('Error en iniciarSesion:', error);
        
        let mensajeError = '';
        switch(error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                mensajeError = 'Email o contraseña incorrectos';
                break;
            case 'auth/too-many-requests':
                mensajeError = 'Demasiados intentos fallidos. Intenta más tarde.';
                break;
            default:
                mensajeError = error.message;
        }
        
        throw new Error(mensajeError);
    }
}

/**
 * Cerrar sesión
 */
async function cerrarSesion() {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

/**
 * Obtener usuario actual con datos de Firestore
 * @returns {Promise<Object|null>}
 */
function getUsuarioActual() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDoc = await db.collection('usuarios').doc(user.uid).get();
                    if (userDoc.exists) {
                        resolve({
                            uid: user.uid,
                            email: user.email,
                            ...userDoc.data()
                        });
                    } else {
                        resolve(null);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    });
}

/**
 * Proteger rutas según rol
 * @param {boolean} requiereAdmin - Si requiere ser admin
 * @returns {Promise<boolean>}
 */
async function protegerRuta(requiereAdmin = false) {
    const user = auth.currentUser;
    
    if (!user) {
        window.location.href = 'login/login.html';
        return false;
    }
    
    try {
        const userDoc = await db.collection('usuarios').doc(user.uid).get();
        
        if (!userDoc.exists) {
            await auth.signOut();
            window.location.href = 'login/login.html';
            return false;
        }
        
        const userData = userDoc.data();
        
        if (!userData.activo) {
            await auth.signOut();
            window.location.href = 'login/login.html';
            return false;
        }
        
        if (requiereAdmin && !userData.esAdmin) {
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
        
    } catch (error) {
        console.error('Error:', error);
        window.location.href = 'login/login.html';
        return false;
    }
}