/// <reference types="cypress" />

describe('Navegación entre pantallas', () => {
  // Usuario de prueba para navegación
  const usuarioPrueba = {
    nombre: 'Usuario Navegacion',
    email: `navegacion_${Date.now()}@test.com`,
    password: 'Navegacion123!'
  };

  beforeEach(() => {
    // Limpiar almacenamiento antes de cada prueba
    cy.clearStorage();
    
    // Ignorar errores de Firebase y JS
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('registroForm') || 
          err.message.includes('is not defined') ||
          err.message.includes('firebase')) {
        return false;
      }
      return true;
    });
  });

  // ========== NAVEGACIÓN SIN LOGIN ==========
  describe('Como visitante (sin iniciar sesión)', () => {
    it('debería navegar entre todas las páginas principales', () => {
      cy.visit('/index.html');
      cy.get('.hero-titulo').should('be.visible');
      cy.url().should('include', '/index.html');
      
      cy.get('.enlaces-nav a').contains('Adoptar').click();
      cy.url().should('include', '/adoptar.html');
      cy.get('.encabezado-pagina h1').should('contain', 'Encuentra tu compañero ideal');
      
      cy.get('.enlaces-nav a').contains('Donadores').click();
      cy.url().should('include', '/donadores.html');
      cy.get('.encabezado-pagina h1').should('contain', 'Donadores');
      
      cy.get('.enlaces-nav a').contains('Nosotros').click();
      cy.url().should('include', '/nosotros.html');
      cy.get('.encabezado-pagina h1').should('contain', 'Sobre Nosotros');
      
      cy.get('.enlaces-nav a').contains('Inicio').click();
      cy.url().should('include', '/index.html');
      cy.get('.hero-titulo').should('be.visible');
    });

    it('debería navegar desde el botón flotante de adoptar', () => {
      cy.visit('/index.html');
      cy.get('.boton-flotante').click();
      cy.url().should('include', '/login/login.html');
    });

    it('debería navegar desde el botón "Adoptar Ahora"', () => {
      cy.visit('/index.html');
      cy.get('.hero-botones .btn-primario').click();
      cy.url().should('include', '/login/login.html');
    });

    it('debería navegar desde el botón "Registrarme"', () => {
      cy.visit('/index.html');
      cy.get('.hero-botones .btn-outline').click();
      cy.url().should('include', '/login/registro.html');
    });
  });

  // ========== NAVEGACIÓN DESDE EL FOOTER ==========
  describe('Enlaces del footer', () => {
    it('debería navegar correctamente desde el footer', () => {
      cy.visit('/index.html');
      
      cy.get('.footer-columna a').contains('Adoptar').click();
      cy.url().should('include', '/adoptar.html');
      cy.go('back');
      
      cy.get('.footer-columna a').contains('Donadores').click();
      cy.url().should('include', '/donadores.html');
      cy.go('back');
      
      cy.get('.footer-columna a').contains('Nosotros').click();
      cy.url().should('include', '/nosotros.html');
    });
  });

  // ========== REGISTRO DE USUARIO PARA PRUEBAS ==========
  describe('Preparar usuario de prueba', () => {
    it('debería crear un usuario de prueba', () => {
      // Registrar usuario
      cy.visit('/login/registro.html');
      cy.get('#nombre').type(usuarioPrueba.nombre);
      cy.get('#email').type(usuarioPrueba.email);
      cy.get('#password').type(usuarioPrueba.password);
      cy.get('#confirmPassword').type(usuarioPrueba.password);
      cy.get('#terminos').check({ force: true });
      cy.get('#btnRegistro').click();
      
      // Esperar a que se muestre el modal de éxito
      cy.get('#modalExito', { timeout: 10000 }).should('be.visible');
      cy.get('#modalExito .btn-primario').click();
    });
  });

  // ========== MENÚ DE USUARIO ==========
  describe('Menú de usuario cuando hay sesión', () => {
    beforeEach(() => {
      // Iniciar sesión con el usuario recién creado
      cy.visit('/login/login.html');
      cy.get('#email').type(usuarioPrueba.email);
      cy.get('#password').type(usuarioPrueba.password);
      cy.get('#btnLogin').click();
      
      // Esperar a que redirija a adoptar.html
      cy.url({ timeout: 10000 }).should('include', '/adoptar.html');
    });

    it('debería mostrar el menú de usuario después de iniciar sesión', () => {
      cy.get('.usuario-menu').should('be.visible');
      cy.get('.usuario-nombre').should('contain', usuarioPrueba.nombre);
    });

    it('debería poder abrir el dropdown y ver las opciones', () => {
      cy.get('.usuario-menu').click();
      cy.get('.usuario-dropdown').should('be.visible');
      cy.get('.usuario-dropdown a').contains('Mis Solicitudes').should('be.visible');
    });

    it('debería poder navegar a Mis Solicitudes desde el dropdown', () => {
      cy.get('.usuario-menu').click();
      cy.get('.usuario-dropdown a').contains('Mis Solicitudes').click();
      cy.url().should('include', '/mis-solicitudes.html');
      cy.get('.solicitudes-header h1').should('contain', 'Mis Solicitudes');
    });
  });

  // ========== VOLVER ATRÁS EN EL HISTORIAL ==========
  describe('Navegación con historial', () => {
    it('debería poder volver atrás correctamente', () => {
      cy.visit('/index.html');
      
      cy.get('.enlaces-nav a').contains('Adoptar').click();
      cy.url().should('include', '/adoptar.html');
      
      cy.get('.enlaces-nav a').contains('Donadores').click();
      cy.url().should('include', '/donadores.html');
      
      cy.get('.enlaces-nav a').contains('Nosotros').click();
      cy.url().should('include', '/nosotros.html');
      
      cy.go('back');
      cy.url().should('include', '/donadores.html');
      cy.go('back');
      cy.url().should('include', '/adoptar.html');
      cy.go('back');
      cy.url().should('include', '/index.html');
    });
  });
});