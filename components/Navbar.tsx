
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 
import { Search, Bell, Menu, X, User, Gift, Lock, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Simulating auth state read (in a real app, use Context)
  const userString = localStorage.getItem('lumen_user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lumen_user');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Séries', path: '/series' },
    { name: 'Filmes', path: '/movies' },
    { name: 'Área Família', path: '/family-zone', icon: <Gift className="w-4 h-4 mr-1 text-amber-400" /> },
    { name: 'Minha Lista', path: '/my-list' },
  ];

  // If user is admin or editor, inject dashboard link
  if (user?.role === 'ADMIN' || user?.role === 'EDITOR') {
      navLinks.push({ name: 'Painel da Equipe', path: '/admin', icon: <LayoutDashboard className="w-4 h-4 mr-1 text-red-500" /> });
  }

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-slate-950/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Logo & Desktop Links */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-3xl font-extrabold text-amber-500 tracking-tighter font-serif">LUMEN</h1>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-white font-bold' : 'text-gray-300 hover:text-white'}`}
                  >
                    {link.icon && link.icon}
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-gray-300 hover:text-white focus:outline-none">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-gray-300 hover:text-white focus:outline-none">
              <Bell className="w-5 h-5" />
            </button>
            
            {user ? (
                <div className="relative group">
                    <button className="flex items-center text-gray-300 hover:text-white focus:outline-none">
                        <div className="w-8 h-8 rounded bg-amber-600 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </button>
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div className="px-4 py-2 text-xs text-gray-500 border-b border-slate-800">Logado como {user.role}</div>
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-800 hover:text-white">Meu Perfil</Link>
                        {(user.role === 'ADMIN' || user.role === 'EDITOR') && (
                            <Link to="/admin" className="block px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300">Painel da Equipe</Link>
                        )}
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-800 hover:text-white">Sair</button>
                    </div>
                </div>
            ) : (
                <Link to="/login" className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium text-sm">
                    <Lock className="w-4 h-4 mr-2" /> Entrar
                </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              >
                 {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.name}
              </Link>
            ))}
             <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <User className="w-4 h-4 mr-2" /> Meu Perfil
              </Link>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-700"
              >
                 Sair
              </button>
          </div>
        </div>
      )}
    </nav>
  );
};
