// ===== auth.js - Autenticación simplificada =====

// Función para iniciar sesión
async function iniciarSesion(email, password) {
    try {
        // Intentar iniciar sesión
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Obtener datos del usuario desde Firestore
        const userDoc = await db.collection('usuarios').doc(user.uid).get();
        
        // Verificar si existe en Firestore
        if (!userDoc.exists) {
            await auth.signOut();
            throw new Error('Usuario no encontrado en la base de datos');
        }
        
        const userData = userDoc.data();
        
        // Verificar si está activo
        if (userData.activo === false) {
            await auth.signOut();
            throw new Error('Usuario desactivado. Contacta al administrador.');
        }
        
        // Inicio de sesión exitoso
        console.log('✅ Sesión iniciada:', user.email);
        return { user, userData };
        
    } catch (error) {
        console.error('Error en iniciarSesion:', error);
        
        let mensajeError = '';
        switch(error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                mensajeError = '❌ Email o contraseña incorrectos';
                break;
            case 'auth/too-many-requests':
                mensajeError = '❌ Demasiados intentos fallidos. Intenta más tarde.';
                break;
            default:
                mensajeError = error.message;
        }
        
        throw new Error(mensajeError);
    }
}

// Función para cerrar sesión
async function cerrarSesion() {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

// Función para obtener usuario actual
function getUsuarioActual() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await db.collection('usuarios').doc(user.uid).get();
                resolve({
                    uid: user.uid,
                    email: user.email,
                    ...userDoc.data()
                });
            } else {
                resolve(null);
            }
        });
    });
}

// Función para proteger rutas
async function protegerRuta(requiereAdmin = false) {
    const user = auth.currentUser;
    
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    
    const userDoc = await db.collection('usuarios').doc(user.uid).get();
    
    if (!userDoc.exists) {
        await auth.signOut();
        window.location.href = 'login.html';
        return false;
    }
    
    const userData = userDoc.data();
    
    if (userData.activo === false) {
        await auth.signOut();
        window.location.href = 'login.html';
        return false;
    }
    
    if (requiereAdmin && userData.esAdmin !== true) {
        window.location.href = 'adoptar.html';
        return false;
    }
    
    return true;
}