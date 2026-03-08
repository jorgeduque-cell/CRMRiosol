import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Setup mock login logic simulating network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (email && password) {
        setUser({
          id: '1',
          name: 'Usuario Administrador',
          email,
          role: 'ADMIN'
        });
        navigate('/');
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-8 rounded-2xl w-full flex flex-col items-center">
      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
        <LogIn className="text-white w-8 h-8" />
      </div>
      
      <h1 className="text-3xl font-heading font-bold text-white mb-2">Bienvenido de nuevo</h1>
      <p className="text-slate-400 mb-8 text-center text-sm">
        Ingresa a tu cuenta para gestionar tus clientes y operaciones
      </p>

      <form onSubmit={handleLogin} className="w-full space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300 ml-1">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300 ml-1">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center animate-fade-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-primary/25 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>
    </div>
  );
}
