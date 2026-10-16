/**
 * Utilidades de validación y sanitización para formularios de FlowTime
 */

export const Validators = {
  /**
   * Sanitizar cadenas de texto (remover espacios adicionales)
   */
  sanitize(text: string): string {
    return text.trim();
  },

  /**
   * Validar formato de correo electrónico
   */
  validateEmail(email: string): string | null {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return 'El correo electrónico es requerido.';
    }

    // Expresión regular estándar y segura para emails
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return 'Ingresa un correo electrónico válido.';
    }

    if (cleanEmail.length > 150) {
      return 'El correo es demasiado largo.';
    }

    return null;
  },

  /**
   * Validar contraseña
   */
  validatePassword(password: string): string | null {
    if (!password) {
      return 'La contraseña es requerida.';
    }

    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (password.length > 72) {
      return 'La contraseña no puede exceder 72 caracteres.';
    }

    return null;
  },

  /**
   * Validar coincidencia de contraseñas
   */
  validatePasswordMatch(password: string, confirmPassword: string): string | null {
    if (!confirmPassword) {
      return 'Confirma tu contraseña.';
    }

    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden.';
    }

    return null;
  },

  /**
   * Validar nombre o apellido
   */
  validateName(value: string, fieldName = 'nombre'): string | null {
    const clean = value.trim();
    if (!clean) {
      return `El ${fieldName} es requerido.`;
    }

    if (clean.length < 2) {
      return `El ${fieldName} debe tener al menos 2 caracteres.`;
    }

    if (clean.length > 50) {
      return `El ${fieldName} no puede exceder 50 caracteres.`;
    }

    // Permite letras (incluyendo tildes y eñes) y espacios
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
    if (!nameRegex.test(clean)) {
      return `El ${fieldName} solo debe contener letras.`;
    }

    return null;
  },
};
