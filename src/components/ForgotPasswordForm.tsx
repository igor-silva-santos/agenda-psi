import React from 'react';

export default function ForgotPasswordForm() {
  return (
    <form>
      <h2>Recuperar senha</h2>
      <label htmlFor="email">E-mail:</label>
      <input type="email" id="email" name="email" required />
      <button type="submit">Enviar link de recuperação</button>
    </form>
  );
} 