"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminOficinas() {
  const router = useRouter();
  const [oficinas, setOficinas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [userName, setUserName] = useState('');
  
  // Estados para o Modal de Cadastro
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novaOficina, setNovaOficina] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    especialidade: ''
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");

    if (!token || role !== 'admin') {
      router.push("/garagem");
      return;
    }
    
    if (name) setUserName(name);
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

  // Função disparada ao enviar o formulário do Modal
  const handleCadastrar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    const token = localStorage.getItem("token");

    try {
      const resposta = await fetch("https://mototrack-backend-giad.onrender.com/oficinas", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(novaOficina)
      });

      if (resposta.ok) {
        // Limpa o formulário, fecha o modal e atualiza a lista
        setNovaOficina({ nome: '', cnpj: '', endereco: '', especialidade: '' });
        setModalAberto(false);
        buscarOficinas();
      } else {
        alert("Erro ao cadastrar. Verifique os dados.");
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">Verificando credenciais de Administrador...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-white relative">
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
            {/* O BOTÃO AGORA ABRE O MODAL */}
            <button 
              onClick={() => setModalAberto(true)}
              className="bg-lime-600 hover:bg-lime-700 text-black font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-lg shadow-lime-500/20"
            >
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
                  <p className="text-xs text-zinc-500 mt-2 truncate">{oficina.endereco}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CADASTRO (Fica invisível até clicar no botão) */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-lime-500 mb-4">Nova Oficina</h2>
            
            <form onSubmit={handleCadastrar} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nome da Oficina *</label>
                <input required type="text" value={novaOficina.nome} onChange={(e) => setNovaOficina({...novaOficina, nome: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-lime-500" placeholder="Ex: Oficina Central" />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">CNPJ</label>
                <input type="text" value={novaOficina.cnpj} onChange={(e) => setNovaOficina({...novaOficina, cnpj: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-lime-500" placeholder="00.000.000/0001-00" />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Endereço *</label>
                <input required type="text" value={novaOficina.endereco} onChange={(e) => setNovaOficina({...novaOficina, endereco: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-lime-500" placeholder="Rua, Número, Bairro" />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Especialidade</label>
                <input type="text" value={novaOficina.especialidade} onChange={(e) => setNovaOficina({...novaOficina, especialidade: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-lime-500" placeholder="Ex: Multimarcas, Honda, etc." />
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-lg font-semibold transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="flex-1 bg-lime-600 hover:bg-lime-700 disabled:opacity-50 text-black py-2.5 rounded-lg font-bold transition-colors">
                  {salvando ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
