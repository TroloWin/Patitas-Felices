/// <reference types="cypress" />

describe('Autenticación - Registro y Login', () => {
  const timestamp = Date.now();
  const usuarioValido = {
    nombre: 'Usuario Test',
    email: `test_${timestamp}@correo.com`,
    password: 'Test123456!'
  };

  beforeEach(() => {
    cy.clearStorage();
    
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('registroForm') || 
          err.message.includes('is not defined') ||
          err.message.includes('firebase')) {
        return false;
      }
      return true;
    });
  });

  // ========== PÁGINA DE REGISTRO ==========
  describe('Página de Registro', () => {
    beforeEach(() => {
      cy.visit('/login/registro.html');
    });

    it('debería cargar correctamente el formulario de registro', () => {
      cy.get('.encabezado-formulario h1').should('contain', 'Crear cuenta');
      cy.get('#nombre').should('be.visible');
      cy.get('#email').should('be.visible');
      cy.get('#password').should('be.visible');
      cy.get('#confirmPassword').should('be.visible');
      cy.get('#terminos').should('exist');
      cy.get('#btnRegistro').should('be.visible');
    });

    it('debería mostrar el modal de términos al hacer clic', () => {
      cy.get('#verTerminos').click();
      // El modal puede estar con opacity:0 pero visible en el DOM
      cy.get('#modalTerminos').should('be.visible');
      // Forzar clic en el botón del modal
      cy.get('#modalTerminos .btn-primario').click({ force: true });
      cy.get('#modalTerminos').should('not.be.visible');
    });

    it('debería mostrar validación HTML5 al enviar formulario vacío', () => {
      cy.get('#btnRegistro').click();
      cy.get('#nombre').then(($el) => {
        expect($el[0].validationMessage).to.not.be.empty;
      });
    });

    it('debería mostrar validación HTML5 si las contraseñas no coinciden', () => {
      cy.get('#nombre').type(usuarioValido.nombre);
      cy.get('#email').type(usuarioValido.email);
      cy.get('#password').type(usuarioValido.password);
      cy.get('#confirmPassword').type('otra123');
      cy.get('#btnRegistro').click();
      cy.get('#confirmPassword').then(($el) => {
        expect($el[0].validationMessage).to.not.be.empty;
      });
    });

    it('debería mostrar validación HTML5 si no se aceptan términos', () => {
      cy.get('#nombre').type(usuarioValido.nombre);
      cy.get('#email').type(usuarioValido.email);
      cy.get('#password').type(usuarioValido.password);
      cy.get('#confirmPassword').type(usuarioValido.password);
      cy.get('#btnRegistro').click();
      cy.get('#terminos').then(($el) => {
        expect($el[0].validationMessage).to.not.be.empty;
      });
    });

    it('debería registrar un usuario nuevo correctamente', () => {
      cy.get('#nombre').type(usuarioValido.nombre);
      cy.get('#email').type(usuarioValido.email);
      cy.get('#password').type(usuarioValido.password);
      cy.get('#confirmPassword').type(usuarioValido.password);
      cy.get('#terminos').check({ force: true });
      cy.get('#btnRegistro').click();

      cy.get('#modalExito', { timeout: 10000 }).should('be.visible');
      cy.get('#modalExito h2').should('contain', 'Registro exitoso');
    });
  });

  // ========== PÁGINA DE LOGIN ==========
  describe('Página de Login', () => {
    beforeEach(() => {
      cy.visit('/login/login.html');
    });

    it('debería cargar correctamente el formulario de login', () => {
      cy.get('.encabezado-formulario h1').should('contain', 'Iniciar Sesión');
      cy.get('#email').should('be.visible');
      cy.get('#password').should('be.visible');
      cy.get('#recordarme').should('exist');
      cy.get('#btnLogin').should('be.visible');
      cy.get('.pie-formulario a').should('contain', 'Regístrate aquí');
    });

    it('debería mostrar validación HTML5 al enviar formulario vacío', () => {
      cy.get('#btnLogin').click();
      cy.get('#email').then(($el) => {
        expect($el[0].validationMessage).to.not.be.empty;
      });
    });

    it('debería mostrar error con credenciales incorrectas', () => {
      cy.get('#email').type('incorrecto@email.com');
      cy.get('#password').type('incorrecta123');
      cy.get('#btnLogin').click();
      cy.get('.mensaje-error', { timeout: 5000 }).should('be.visible');
    });

    it('debería tener enlace a recuperar contraseña', () => {
      cy.get('.link').should('have.attr', 'href', 'recuperar-password.html');
    });

    it('debería tener enlace a registro', () => {
      cy.get('.pie-formulario a').should('have.attr', 'href', 'registro.html');
    });
  });

  // ========== FLUJO COMPLETO REGISTRO + LOGIN ==========
  describe('Flujo completo de autenticación', () => {
    const nuevoUsuario = {
      nombre: 'Flujo Completo Test',
      email: `flujo_${Date.now()}@test.com`,
      password: 'Flujo123456!'
    };

    it('debería registrar y luego iniciar sesión correctamente', () => {
      // 1. Registrar usuario
      cy.visit('/login/registro.html');
      cy.get('#nombre').type(nuevoUsuario.nombre);
      cy.get('#email').type(nuevoUsuario.email);
      cy.get('#password').type(nuevoUsuario.password);
      cy.get('#confirmPassword').type(nuevoUsuario.password);
      cy.get('#terminos').check({ force: true });
      cy.get('#btnRegistro').click();

      cy.get('#modalExito', { timeout: 10000 }).should('be.visible');
      cy.get('#modalExito .btn-primario').click();

      // 2. Iniciar sesión
      cy.url().should('include', '/login/login.html');
      cy.get('#email').type(nuevoUsuario.email);
      cy.get('#password').type(nuevoUsuario.password);
      cy.get('#btnLogin').click();

      // 3. Verificar que termina en adoptar.html
      cy.url({ timeout: 10000 }).should('include', '/adoptar.html');
    });
  });

  // ========== VALIDACIONES DE CAMPOS ==========
  describe('Validaciones de campos', () => {
    beforeEach(() => {
      cy.visit('/login/registro.html');
    });

    it('debería tener validación de email en el campo', () => {
      cy.get('#email').type('email-invalido');
      cy.get('#email').then(($el) => {
        expect($el[0].validationMessage).to.not.be.empty;
      });
    });

    it('debería tener validación de longitud mínima en contraseña', () => {
      cy.get('#password').should('have.attr', 'minlength', '6');
      cy.get('#password').should('have.attr', 'required');
    });
  });

  // ========== NAVEGACIÓN CON RECUPERAR CONTRASEÑA Y LOGIN FINAL ==========
  describe('Navegación', () => {
    const usuarioLogin = {
      email: `navegacion_${Date.now()}@test.com`,
      password: 'Navegacion123!'
    };

    it('debería navegar a recuperar contraseña, volver e iniciar sesión', () => {
      // 1. Registrar usuario primero
      cy.visit('/login/registro.html');
      cy.get('#nombre').type('Navegacion Test');
      cy.get('#email').type(usuarioLogin.email);
      cy.get('#password').type(usuarioLogin.password);
      cy.get('#confirmPassword').type(usuarioLogin.password);
      cy.get('#terminos').check({ force: true });
      cy.get('#btnRegistro').click();
      cy.get('#modalExito', { timeout: 10000 }).should('be.visible');
      cy.get('#modalExito .btn-primario').click();

      // 2. Ir a recuperar contraseña
      cy.get('.link').click();
      cy.url().should('include', '/login/recuperar-password.html');
      
      // 3. Volver a login sin hacer nada
      cy.get('.pie-formulario a').click();
      cy.url().should('include', '/login/login.html');
      
      // 4. Los campos deben estar vacíos
      cy.get('#email').should('have.value', '');
      cy.get('#password').should('have.value', '');
      
      // 5. Iniciar sesión con el usuario creado
      cy.get('#email').type(usuarioLogin.email);
      cy.get('#password').type(usuarioLogin.password);
      cy.get('#btnLogin').click();
      
      // 6. Verificar que termina en adoptar.html
      cy.url({ timeout: 10000 }).should('include', '/adoptar.html');
    });
  });
});