import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/common/Header.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { AuthProvider, useAuthContext } from './context/AuthContext.jsx';
import Footer from './components/common/Footer.jsx';

const Shell = () => {
  const { user, logout } = useAuthContext();
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 via-violet-300 to-violet-400">
      <Header user={user} onLogout={logout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
