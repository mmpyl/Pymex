

import AppRouter from './routes/AppRouter';

const App = () => <AppRouter />;

export default App;

// ═══════════════════════════════════════════════════════════════════════
// ARCHIVO 2: frontend/src/App.jsx — con TrialBanner integrado
// ═══════════════════════════════════════════════════════════════════════
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider }  from './context/AuthContext';
import PrivateRoute      from './components/PrivateRoute';
import AdminRoute        from './components/AdminRoute';
import Sidebar           from './components/Sidebar';
import TrialBanner       from './components/TrialBanner';
import Login             from './pages/Login';
import Register          from './pages/Register';
import Dashboard         from './pages/Dashboard';
import Productos         from './pages/Productos';
import Categorias        from './pages/Categorias';
import Inventario        from './pages/Inventario';
import Ventas            from './pages/Ventas';
import Gastos            from './pages/Gastos';
import Clientes          from './pages/Clientes';
import Proveedores       from './pages/Proveedores';
import Reportes          from './pages/Reportes';
import Alertas           from './pages/Alertas';
import Predicciones      from './pages/Predicciones';
import Facturacion       from './pages/Facturacion';
import AdminPanel        from './pages/AdminPanel';
import AdminLogin        from './pages/AdminLogin';
import Landing           from './pages/Landing';

// frontend/src/App.jsx — versión consolidada (sin conflictos de merge)
// FIX: usa AppRouter que ya contiene todas las rutas con guards correctos.
// La versión alternativa (rama main) duplicaba las rutas en App.jsx directamente;
// se elige la de la rama HEAD que delega en AppRouter para mejor separación de responsabilidades.
import AppRouter from './routes/AppRouter';

const App = () => <AppRouter />;


export default App;

 



