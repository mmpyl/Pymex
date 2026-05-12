import React from 'react';
import { AdminLoginForm, EmpresaLoginForm } from '../components';

/**
 * Página de Login - Permite seleccionar entre login de Admin o Empresa
 */
const LoginPage = ({ type = 'admin' }) => {
  if (type === 'empresa') {
    return <EmpresaLoginForm />;
  }

  return <AdminLoginForm />;
};

export default LoginPage;
