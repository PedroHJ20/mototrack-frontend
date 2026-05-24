"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminOficinas() {
  const router = useRouter();
  const [oficinas, setOficinas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");

    // Segurança: Se não for admin, chuta de volta para a garagem
    if (!token || role !== 'admin') {
      router.push("/garagem");
      return;
    }
    
    if (name) setUserName(name);

    // Busca as oficinas fictícias (ou reais do seu back-end)
    buscarOficinas();
  }, [router]);

  const buscarOficinas = async () => {
    const token = localStorage.getItem("token");
    try {
      const resposta = await fetch("https://mototrack-backend-giad.onrender.com/oficinas", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setOficinas(dados.oficinas || []);
      }
    } catch (error) {
      console.log("Erro ao buscar oficinas");
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">Verificando credenciais de Administrador...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabeçalho do Admin */}
        <div className="flex justify-between items-center bg-zinc-900 p-6 rounded-xl border-l-4 border-lime-500 shadow-lg">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-lime-500">Painel Administrativo</h1>
            <p className="text-zinc-400 text-sm mt-1">Gestão Global - Operador: {userName}</p>
          </div>
          <button onClick={() => router.push("/garagem")} className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
            Voltar à Garagem
          </button>
        </div>

        {/* Gestão de Oficinas */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-semibold">Oficinas Parceiras Credenciadas</h2>
            <button className="bg-lime-600 hover:bg-lime-700 text-black font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-lg shadow-lime-500/20">
              + Cadastrar Oficina
            </button>
          </div>

          {oficinas.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">
              Nenhuma oficina credenciada na plataforma ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {oficinas.map((oficina, i) => (
                <div key={i} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <h3 className="font-bold text-zinc-200">{oficina.nome}</h3>
                  <p className="text-sm text-zinc-400">CNPJ: {oficina.cnpj}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
