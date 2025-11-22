import React from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { CreditCard, User, Shield, LogOut } from 'lucide-react';

export const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="pt-28 px-4 max-w-4xl mx-auto pb-20">
        
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-800 pb-4">Configurações da Conta</h1>

        <div className="grid md:grid-cols-3 gap-8">
            
            {/* Sidebar */}
            <div className="md:col-span-1 space-y-2">
                <div className="flex items-center space-x-4 mb-6 p-4 bg-slate-900 rounded-lg">
                    <div className="w-12 h-12 bg-amber-600 rounded flex items-center justify-center text-xl font-bold">J</div>
                    <div>
                        <p className="font-bold text-white">João Silva</p>
                        <p className="text-xs text-gray-400">Membro desde 2023</p>
                    </div>
                </div>
                <button className="w-full text-left px-4 py-3 rounded bg-slate-800 text-white font-medium border-l-4 border-amber-500">Assinatura</button>
                <button className="w-full text-left px-4 py-3 rounded hover:bg-slate-800 text-gray-400 hover:text-white transition-colors">Detalhes de Cobrança</button>
                <button className="w-full text-left px-4 py-3 rounded hover:bg-slate-800 text-gray-400 hover:text-white transition-colors">Controle dos Pais</button>
                <button className="w-full text-left px-4 py-3 rounded hover:bg-slate-800 text-gray-400 hover:text-white transition-colors">Segurança</button>
            </div>

            {/* Content */}
            <div className="md:col-span-2 space-y-6">
                
                {/* Plan Section */}
                <section className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-amber-500" /> Plano Atual
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">Gerencie seu nível de assinatura</p>
                        </div>
                        <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-sm font-bold border border-amber-500/20">Família Premium</span>
                    </div>
                    
                    <div className="bg-slate-950 p-4 rounded-lg mb-6 border border-slate-800 flex justify-between items-center">
                         <div>
                            <p className="font-bold text-white">Lumen Família (4K)</p>
                            <p className="text-sm text-gray-500">Próxima cobrança: 24 Out, 2023</p>
                         </div>
                         <p className="font-bold text-white">R$ 29,90/mês</p>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" size="sm" className="text-red-400 border-red-900 hover:border-red-500 hover:bg-red-500/10 hover:text-red-400">Cancelar Assinatura</Button>
                        <Button variant="secondary" size="sm">Alterar Plano</Button>
                    </div>
                </section>

                {/* Payment Method */}
                 <section className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-400" /> Forma de Pagamento
                            </h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400">Atualizar</Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-2 py-1 rounded text-slate-900 font-bold text-xs">VISA</div>
                        <p className="text-gray-300">•••• •••• •••• 4242</p>
                    </div>
                </section>

                <div className="pt-4 border-t border-slate-800">
                    <button className="flex items-center text-gray-400 hover:text-white transition-colors">
                        <LogOut className="w-5 h-5 mr-2" /> Sair de todos os dispositivos
                    </button>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};