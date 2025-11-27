
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Função auxiliar para traduzir erros do Supabase
  const translateError = (msg: string) => {
      if (msg.includes('Email not confirmed')) return 'E-mail não confirmado. Verifique sua caixa de entrada ou contate o suporte.';
      if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
      if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.';
      if (msg.includes('Password should be at least')) return 'A senha deve ter no mínimo 6 caracteres.';
      if (msg.includes('fetch')) return 'Erro de conexão. Verifique sua internet ou adblock.';
      return msg; // Retorna original se não houver tradução
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        let authResponse;
        
        // Tenta autenticar com Supabase
        if (isLogin) {
            authResponse = await supabase.auth.signInWithPassword({
                email,
                password,
            });
        } else {
            authResponse = await supabase.auth.signUp({
                email,
                password,
            });
        }

        // Se houver erro real do supabase (ex: credenciais inválidas), lança exceção
        if (authResponse.error) {
             // Se for erro de fetch/network, provavelmente as chaves não estão configuradas
             // Permitimos o login de teste do Admin para demonstração
             if (authResponse.error.message.includes('fetch') || authResponse.error.name === 'AuthApiError') {
                 console.warn("Supabase connection failed, falling back to mock auth for demo.");
             } else {
                 throw authResponse.error;
             }
        }

        // LÓGICA DE FALLBACK / DEMO
        // Se o Supabase falhar (chaves inválidas) OU se o login for bem sucedido
        // verificamos as credenciais hardcoded para permitir o teste do painel.
        
        let userRole = 'USER';
        let subStatus = 'INACTIVE';
        let userId = 'mock-id';

        // Se logou no Supabase com sucesso
        if (authResponse.data?.user) {
            userId = authResponse.data.user.id;
            
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (profile) {
                userRole = profile.role;
                subStatus = profile.subscription_status;
            }
        }

        // BACKDOOR PARA TESTE DE ADMIN (Funciona mesmo sem banco de dados)
        if (email === 'otaviobrantes@gmail.com' && password === '123456') {
            userRole = 'ADMIN';
            subStatus = 'ACTIVE';
            userId = 'admin-id';
        }

        // Se não logou no supabase e não é o admin hardcoded, e estamos em modo "sem chaves"
        // Simulamos erro se não for o admin
        if (!authResponse.data?.user && userRole !== 'ADMIN' && isLogin) {
             // Verifica se estamos apenas com chaves placeholder
             // Using any cast to access protected/private url property for placeholder check
             const isPlaceholder = (supabase.auth as any).url?.includes('seu-projeto');
             if (!isPlaceholder) { 
                 // Se tem chaves reais e falhou, é erro de senha
                 if (authResponse.error) throw authResponse.error;
             }
        }

        const userData = {
            id: userId,
            name: email.split('@')[0],
            email: email,
            role: userRole,
            subscription: subStatus,
        };

        localStorage.setItem('lumen_user', JSON.stringify(userData));
        
        if (userRole === 'ADMIN') {
            navigate('/admin');
        } else {
            navigate('/');
        }

    } catch (err: any) {
        setError(translateError(err.message || 'Ocorreu um erro na autenticação.'));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1455576396297-369f638c2113?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md bg-black/60 border border-slate-700 p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-amber-500 font-serif mb-2">LUMEN</h1>
          <p className="text-gray-300">Luz para sua jornada espiritual</p>
        </div>

        <div className="flex gap-4 mb-8 bg-slate-800/50 p-1 rounded-lg">
            <button 
                onClick={() => { setIsLogin(true); setError(''); }} 
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${isLogin ? 'bg-slate-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                Entrar
            </button>
            <button 
                onClick={() => { setIsLogin(false); setError(''); }} 
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${!isLogin ? 'bg-slate-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                Criar Conta
            </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && (
              <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg flex items-center text-red-200 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
              </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : (
                <>
                    {isLogin ? 'Acessar Plataforma' : 'Começar Agora'} 
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-800 pt-4">
             <p className="text-xs text-amber-500 font-bold mb-1">Modo de Demonstração Ativo</p>
             <p className="text-xs text-gray-500">Use estas credenciais para testar o Painel Admin:</p>
             <p className="text-sm text-white font-mono mt-1 bg-slate-900 py-1 px-2 rounded inline-block">otaviobrantes@gmail.com / 123456</p>
        </div>
      </div>
    </div>
  );
};
