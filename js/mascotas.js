// ===== MASCOTAS - DATOS ESTÁTICOS (SIN FIREBASE) =====

// Lista completa de mascotas
const mascotas = [
    // Perros (6)
    {
        id: "perro1",
        nombre: "Luna",
        especie: "perro",
        raza: "Labrador",
        edad: 2,
        tamano: "mediano",
        sexo: "hembra",
        color: "Dorado",
        descripcion: "Luna es una perrita muy juguetona y cariñosa. Le encanta correr y jugar con niños. Es muy sociable con otros perros y gatos. Busca un hogar con espacio para correr y una familia que le dedique tiempo y cariño.",
        imagen: "assets/images/mascotas/perro-luna.png",
        estado: "disponible",
        personalidad: ["Juguetona", "Cariñosa", "Energética"],
        salud: "Vacunada, esterilizada, desparasitada",
        compatibleCon: {
            ninos: true,
            perros: true,
            gatos: true
        }
    },
    {
        id: "perro2",
        nombre: "Max",
        especie: "perro",
        raza: "Pastor Alemán",
        edad: 3,
        tamano: "grande",
        sexo: "macho",
        color: "Negro con café",
        descripcion: "Max es un perro muy leal y protector. Es ideal para una casa con jardín. Aunque es grande, es muy tranquilo y se lleva bien con niños mayores de 10 años. Le encanta salir a caminar y jugar a buscar la pelota.",
        imagen: "assets/images/mascotas/perro-max.png",
        estado: "proceso",
        personalidad: ["Leal", "Protector", "Tranquilo"],
        salud: "Vacunado, esterilizado",
        compatibleCon: {
            ninos: true,
            perros: false,
            gatos: false
        }
    },
    {
        id: "perro3",
        nombre: "Rocky",
        especie: "perro",
        raza: "Criollo",
        edad: 1,
        tamano: "mediano",
        sexo: "macho",
        color: "Blanco con manchas negras",
        descripcion: "Rocky fue rescatado de la calle cuando era cachorro. Es súper juguetón y lleno de energía. Necesita una familia activa que pueda sacarlo a pasear y jugar con él. Es muy cariñoso y le encanta dormir en el sofá.",
        imagen: "assets/images/mascotas/perro1.png",
        estado: "disponible",
        personalidad: ["Juguetón", "Enérgico", "Cariñoso"],
        salud: "Vacunado, esterilizado, desparasitado",
        compatibleCon: {
            ninos: true,
            perros: true,
            gatos: false
        }
    },
    {
        id: "perro4",
        nombre: "Kiara",
        especie: "perro",
        raza: "Husky",
        edad: 2,
        tamano: "grande",
        sexo: "hembra",
        color: "Gris y blanco",
        descripcion: "Kiara es una perrita muy hermosa y fotogénica. Es independiente pero cariñosa a su manera. Necesita espacio para correr y actividad física diaria. Ideal para personas con experiencia en la raza.",
        imagen: "assets/images/mascotas/perro2.png",
        estado: "disponible",
        personalidad: ["Independiente", "Activa", "Inteligente"],
        salud: "Vacunada, esterilizada",
        compatibleCon: {
            ninos: false,
            perros: true,
            gatos: false
        }
    },
    {
        id: "perro5",
        nombre: "Coco",
        especie: "perro",
        raza: "Poodle",
        edad: 4,
        tamano: "pequeño",
        sexo: "macho",
        color: "Blanco",
        descripcion: "Coco es un perrito muy inteligente y fácil de entrenar. Es perfecto para departamento porque no requiere mucho espacio. Es cariñoso y se lleva bien con todos. Le encanta que le peinen y consentir.",
        imagen: "assets/images/mascotas/perro3.png",
        estado: "disponible",
        personalidad: ["Inteligente", "Cariñoso", "Tranquilo"],
        salud: "Vacunado, esterilizado",
        compatibleCon: {
            ninos: true,
            perros: true,
            gatos: true
        }
    },
    {
        id: "perro6",
        nombre: "Canela",
        especie: "perro",
        raza: "Beagle",
        edad: 2,
        tamano: "mediano",
        sexo: "hembra",
        color: "Café y blanco",
        descripcion: "Canela es muy curiosa y juguetona. Tiene mucha energía y necesita actividades para mantenerse estimulada. Es muy sociable con otros perros. Ideal para familias activas.",
        imagen: "assets/images/mascotas/perro-luna.png",
        estado: "disponible",
        personalidad: ["Curiosa", "Juguetona", "Sociable"],
        salud: "Vacunada, esterilizada",
        compatibleCon: {
            ninos: true,
            perros: true,
            gatos: false
        }
    },

    // Gatos (5)
    {
        id: "gato1",
        nombre: "Simba",
        especie: "gato",
        raza: "Naranja",
        edad: 1,
        tamano: "pequeño",
        sexo: "macho",
        color: "Naranja",
        descripcion: "Simba es un gatito muy juguetón y curioso. Le encanta perseguir luces y jugar con pelotas. Es muy cariñoso y ronronea mucho cuando lo acaricias. Ideal para departamento.",
        imagen: "assets/images/mascotas/gato-simba.png",
        estado: "disponible",
        personalidad: ["Juguetón", "Curioso", "Cariñoso"],
        salud: "Vacunado, esterilizado",
        compatibleCon: {
            ninos: true,
            perros: false,
            gatos: true
        }
    },
    {
        id: "gato2",
        nombre: "Luna",
        especie: "gato",
        raza: "Negro",
        edad: 2,
        tamano: "mediano",
        sexo: "hembra",
        color: "Negro",
        descripcion: "Luna es una gata muy elegante y tranquila. Le gusta observar desde las alturas y tomar siestas al sol. Es independiente pero de vez en cuando busca caricias. Perfecta para personas tranquilas.",
        imagen: "assets/images/mascotas/gato1.png",
        estado: "disponible",
        personalidad: ["Tranquila", "Independiente", "Observadora"],
        salud: "Vacunada, esterilizada",
        compatibleCon: {
            ninos: true,
            perros: true,
            gatos: true
        }
    },
    {
        id: "gato3",
        nombre: "Milo",
        especie: "gato",
        raza: "Atigrado",
        edad: 1,
        tamano: "pequeño",
        sexo: "macho",
        color: "Gris atigrado",
        descripcion: "Milo es muy travieso y juguetón. Le encanta esconderse en cajas y explorar cada rincón. Es muy cariñoso y busca atención constantemente. Ideal para familias con niños.",
        imagen: "assets/images/mascotas/gato2.png",
        estado: "disponible",
        personalidad: ["Travieso", "Juguetón", "Cariñoso"],
        salud: "Vacunado, esterilizado",
        compatibleCon: {
            ninos: true,
            perros: true,
            gatos: true
        }
    },
    {
        id: "gato4",
        nombre: "Nala",
        especie: "gato",
        raza: "Blanco",
        edad: 3,
        tamano: "mediano",
        sexo: "hembra",
        color: "Blanco",
        descripcion: "Nala es una gata muy dulce y tranquila. Le encanta dormir en lugares cómodos y recibir caricias. Es muy limpia y se lleva bien con otros gatos. Perfecta para un hogar relajado.",
        imagen: "assets/images/mascotas/gato3.png",
        estado: "disponible",
        personalidad: ["Dulce", "Tranquila", "Limpia"],
        salud: "Vacunada, esterilizada",
        compatibleCon: {
            ninos: true,
            perros: false,
            gatos: true
        }
    },
    {
        id: "gato5",
        nombre: "Bigotes",
        especie: "gato",
        raza: "Naranja",
        edad: 2,
        tamano: "mediano",
        sexo: "macho",
        color: "Naranja",
        descripcion: "Bigotes es un gato muy fotogénico con sus bigotes largos. Es sociable y le gusta estar cerca de las personas. Es muy hablador y maúlla para comunicarse. Ideal para quienes buscan un gato comunicativo.",
        imagen: "assets/images/mascotas/gato4.png",
        estado: "disponible",
        personalidad: ["Sociable", "Comunicativo", "Fotogénico"],
        salud: "Vacunado, esterilizado",
        compatibleCon: {
            ninos: true,
            perros: true,
            gatos: true
        }
    }
];

// Función para obtener todas las mascotas
function obtenerTodasLasMascotas() {
    return mascotas;
}

// Función para obtener mascotas por especie
function obtenerMascotasPorEspecie(especie) {
    if (especie === 'todos') return mascotas;
    return mascotas.filter(m => m.especie === especie);
}

// Función para obtener una mascota por ID
function obtenerMascotaPorId(id) {
    return mascotas.find(m => m.id === id) || null;
}

// Función para filtrar mascotas
function filtrarMascotas(filtros = {}) {
    let resultado = [...mascotas];
    
    if (filtros.especie && filtros.especie !== 'todos') {
        resultado = resultado.filter(m => m.especie === filtros.especie);
    }
    
    if (filtros.estado && filtros.estado !== 'todos') {
        resultado = resultado.filter(m => m.estado === filtros.estado);
    } else {
        // Por defecto, mostrar solo disponibles
        resultado = resultado.filter(m => m.estado === 'disponible');
    }
    
    if (filtros.tamano && filtros.tamano !== 'todos') {
        resultado = resultado.filter(m => m.tamano === filtros.tamano);
    }
    
    if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        resultado = resultado.filter(m => 
            m.nombre.toLowerCase().includes(busqueda) ||
            m.raza.toLowerCase().includes(busqueda)
        );
    }
    
    return resultado;
}

// Función para obtener estadísticas
function obtenerEstadisticasMascotas() {
    return {
        total: mascotas.length,
        disponibles: mascotas.filter(m => m.estado === 'disponible').length,
        enProceso: mascotas.filter(m => m.estado === 'proceso').length,
        adoptados: mascotas.filter(m => m.estado === 'adoptado').length,
        perros: mascotas.filter(m => m.especie === 'perro').length,
        gatos: mascotas.filter(m => m.especie === 'gato').length
    };
}