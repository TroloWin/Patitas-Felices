// Importar comandos personalizados
import './commands';

// Ignorar errores de Firebase y JS que no afectan las pruebas
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('registroForm') || 
      err.message.includes('is not defined') ||
      err.message.includes('firebase')) {
    return false;
  }
  return true;
});