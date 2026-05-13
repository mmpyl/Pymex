import React from 'react';

const NotAuthorizedPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Acceso Denegado</h1>
    <p className="text-muted-foreground mb-6">No tienes permisos para acceder a esta página.</p>
  </div>
);

export default NotAuthorizedPage;
