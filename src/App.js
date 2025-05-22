import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import HomePage from './pages/HomePage';
import Usuarios from './pages/Usuarios';
import AvanceInterno from './pages/AvanceInterno';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SidebarIntern from './components/SidebarIntern'; 
import Footer from './components/Footer';
import FormularioInternoEditar from './pages/FormularioInternoEditar';

import VerUsuarios from './pages/VerAvances';
import Avances from './pages/Avances';


function App() {
  const { keycloak } = useKeycloak();

  const isLoggedIn = keycloak?.authenticated;
  const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
  const isSupervisor = roles.includes('SUPERVISOR');
  const isIntern = roles.includes('INTERN');

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        {isLoggedIn && <Header />}
        <div className="d-flex flex-grow-1">
          {/* Renderiza el sidebar según el rol */}
          {isLoggedIn && isSupervisor && (
            <Sidebar
              isOpen={isSidebarOpen}
              onToggleSidebar={toggleSidebar}
              onClose={() => setSidebarOpen(false)}
            />
          )}
          {isLoggedIn && isIntern && (
            <SidebarIntern
              isOpen={isSidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          )}

          <main className="flex-grow-1 p-3">
            <Routes>
              <Route
                path="/"
                element={
                  !isLoggedIn ? (
                    <HomePage />
                  ) : isSupervisor ? (
                    <Navigate to="/usuarios" />
                  ) : isIntern ? (
                    <Navigate to="/avanceinterno" />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route path="/usuarios" element={isSupervisor ? <Usuarios /> : <Navigate to="/" />} />
              <Route path="/avances" element={isSupervisor ? <Avances/> : <Navigate to="/" />} />
              <Route path="/reportes" element={isSupervisor ? <div>Reportes</div> : <Navigate to="/" />} />
              <Route path="/avanceinterno" element={isIntern ? <AvanceInterno /> : <Navigate to="/" />} />
              <Route path="/FormularioInternoEditar/:id" element={isSupervisor ? <FormularioInternoEditar /> : <Navigate to="/" />}/>
               <Route path="/verUsuarios" element={isSupervisor ? <VerUsuarios /> : <Navigate to="/" />}/>

            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
