// ===== COMANDOS PERSONALIZADOS =====

/**
 * Limpiar localStorage y sessionStorage
 */
Cypress.Commands.add('clearStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});

/**
 * Registrar un nuevo usuario (prueba positiva)
 */
Cypress.Commands.add('registerUser', (nombre, email, password) => {
  cy.visit('/login/registro.html');
  cy.get('#nombre').type(nombre);
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('#confirmPassword').type(password);
  cy.get('#terminos').check({ force: true });
  cy.get('#btnRegistro').click();
  cy.get('#modalExito', { timeout: 10000 }).should('be.visible');
  cy.get('#modalExito .btn-primario').click();
});

/**
 * Iniciar sesión (prueba positiva)
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login/login.html');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('#btnLogin').click();
});

/**
 * Intentar iniciar sesión con credenciales incorrectas (prueba de error)
 */
Cypress.Commands.add('loginShouldFail', (email, password) => {
  cy.visit('/login/login.html');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('#btnLogin').click();
  cy.get('.mensaje-error').should('be.visible');
});

/**
 * Iniciar sesión como administrador
 */
Cypress.Commands.add('loginAsAdmin', () => {
  cy.fixture('usuarios').then((usuarios) => {
    cy.login(usuarios.admin.email, usuarios.admin.password);
    cy.url().should('include', '/admin/index.html');
  });
});

/**
 * Iniciar sesión como usuario normal
 */
Cypress.Commands.add('loginAsUser', () => {
  cy.fixture('usuarios').then((usuarios) => {
    cy.login(usuarios.usuario.email, usuarios.usuario.password);
    cy.url().should('include', '/adoptar.html');
  });
});