"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Garagem() {
  const router = useRouter();
  
  // States de Usuário / Admin
  const [userRole, setUserRole] = useState('user');
  const [userName, setUserName] = useState('');

  // States principais das Motos
  const [motos, setMotos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // States do Modal de Motos
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [novaMoto, setNovaMoto] = useState({ marca: "", modelo: "", ano: "", placa: "" });
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState("");
  const [motoEmEdicao, setMotoEmEdicao] = useState(null);

  // States de Manutenções
  const [motoSelecionada, setMotoSelecionada] = useState(null);
  const [manutencoes, setManutencoes] = useState([]);
  const [carregandoManut, setCarregandoManut] = useState(false);
  const [isModalManutAberto, setIsModalManutAberto] = useState(false);
  const [novaManut, setNovaManut] = useState({ descricao: "", custo: "", data_servico: "" });
  const [salvandoManut, setSalvandoManut] = useState(false);
  const [erroModalManut, setErroModalManut] = useState("");
  const [manutencaoEmEdicao, setManutencaoEmEdicao] = useState(null);

  // State da barra de pesquisa de manutenções
  const [termoBusca, setTermoBusca] = useState("");

  // Busca as motos ao carregar a página
  const buscarMotos = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const resposta = await fetch("https://mototrack-backend-giad.onrender.com/motocicletas", {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const dados = await resposta.json();
      if (resposta.ok) { 
        setMotos(dados.motos || []); 
      } else { 
        setErro(dados.erro || "O back-end recusou o acesso às motos."); 
      }
    } catch (error) { 
      setErro("Erro de conexão com o servidor na nuvem."); 
    } finally { 
      setCarregando(false); 
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    // Pega as informações do usuário assim que a tela carrega
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    if (role) setUserRole(role);
    if (name) setUserName(name);

    buscarMotos();
  }, [router]);

  // Buscar Manutenções de uma moto específica
  const buscarManutencoes = async (motoId) => {
    if (!motoId) return;
    setCarregandoManut(true);
    const token = localStorage.getItem("token");
    try {
      const resposta = await fetch(`https://mototrack-backend-giad.onrender.com/manutencoes/moto/${motoId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setManutencoes(Array.isArray(dados) ? dados : dados.manutencoes || []);
      }
    } catch (error) {
      console.log("Erro ao buscar manutenções no servidor na nuvem.");
    } finally {
      setCarregandoManut(false);
    }
  };

  const handleSair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    router.push("/");
  };

  // Salva ou edita a moto
  const handleSalvarMoto = async (e) => {
    e.preventDefault();
    setErroModal("");
    setSalvando(true);

    const token = localStorage.getItem("token");
    const url = motoEmEdicao 
      ? `https://mototrack-backend-giad.onrender.com/motocicletas/${motoEmEdicao.id}` 
      : "https://mototrack-backend-giad.onrender.com/motocicletas";
    const metodo = motoEmEdicao ? "PUT" : "POST";

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          marca: novaMoto.marca,
          modelo: novaMoto.modelo,
          ano: novaMoto.ano ? parseInt(novaMoto.ano) : null,
          placa: novaMoto.placa
        })
      });

      if (resposta.ok) {
        await buscarMotos();
        fecharModal();
      } else {
        const dados = await resposta.json();
        setErroModal(dados.erro || "Erro ao salvar a moto.");
      }
    } catch (error) {
      setErroModal("Erro de conexão. Verifique a internet.");
    } finally {
      setSalvando(false);
    }
  };

  // Cadastra ou Edita a manutenção
  const handleSalvarManutencao = async (e) => {
    e.preventDefault();
    setErroModalManut(""); setSalvandoManut(true);
    const token = localStorage.getItem("token");

    const url = manutencaoEmEdicao 
      ? `https://mototrack-backend-giad.onrender.com/manutencoes/${manutencaoEmEdicao.id}`
      : "https://mototrack-backend-giad.onrender.com/manutencoes";
      
    const metodo = manutencaoEmEdicao ? "PUT" : "POST";

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          moto_id: motoSelecionada.id,
          descricao: novaManut.descricao,
          custo: parseFloat(novaManut.custo) || 0,
          data_servico: novaManut.data_servico
        })
      });

      if (resposta.ok) {
        await buscarManutencoes(motoSelecionada.id);
        fecharModalManut();
      } else {
        const dados = await resposta.json();
        setErroModalManut(dados.erro || "Erro ao registrar.");
      }
    } catch (error) { 
      setErroModalManut("Erro de conexão."); 
    } finally { 
      setSalvandoManut(false); 
    }
  };

  // Excluir moto
  const handleExcluirMoto = async (idDaMoto) => {
    if (!window.confirm("Tem certeza que deseja excluir esta moto da garagem?")) return;
    const token = localStorage.getItem("token");

    try {
      const resposta = await fetch(`https://mototrack-backend-giad.onrender.com/motocicletas/${idDaMoto}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (resposta.ok) {
        await buscarMotos();
      } else {
        const dados = await resposta.json();
        setErro(dados.erro || "Erro ao excluir a moto.");
      }
    } catch (error) {
      setErro("Erro de conexão ao tentar excluir a moto.");
    }
  };

  // Deletar manutenção
  const handleDeletarManutencao = async (idManut) => {
    if (!window.confirm("Remover este registro de manutenção?")) return;
    const token = localStorage.getItem("token");
    try {
      const resposta = await fetch(`https://mototrack-backend-giad.onrender.com/manutencoes/${idManut}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resposta.ok) {
        await buscarManutencoes(motoSelecionada.id);
      }
    } catch (error) { 
      console.error("Erro ao deletar"); 
    }
  };

  const handleAbrirEditar = (moto) => {
    setMotoEmEdicao(moto);
    setNovaMoto({ marca: moto.marca, modelo: moto.modelo, ano: moto.ano || "", placa: moto.placa || "" });
    setIsModalAberto(true);
  };

  const handleAbrirEditarManut = (manut) => {
    setManutencaoEmEdicao(manut);
    const dataFormatada = manut.data_servico ? manut.data_servico.split("T") : "";
    setNovaManut({
      descricao: manut.descricao,
      custo: manut.custo,
      data_servico: dataFormatada
    });
    setIsModalManutAberto(true);
  };

  const fecharModal = () => {
    setNovaMoto({ marca: "", modelo: "", ano: "", placa: "" });
    setMotoEmEdicao(null); setErroModal(""); setIsModalAberto(false);
  };

  const fecharModalManut = () => {
    setNovaManut({ descricao: "", custo: "", data_servico: "" });
    setManutencaoEmEdicao(null);
    setErroModalManut("");
    setIsModalManutAberto(false);
  };

  // Cálculo do total gasto de uma moto selecionada
  const totalGasto = manutencoes.reduce((acc, atual) => acc + (parseFloat(atual.custo) || 0), 0);

  // Filtro de pesquisa de manutenções
  const manutencoesFiltradas = manutencoes.filter((manut) => 
    manut.descricao?.toLowerCase().includes(termoBusca.toLowerCase())
  );

  // LÓGICA DOS INDICADORES GERAIS DA GARAGEM
  const totalVeiculos = motos.length;
  const marcasUnicas = new Set(motos.map(m => m.marca?.trim().toLowerCase()).filter(Boolean)).size;
  const anosValidos = motos.map(m => parseInt(m.ano)).filter(a => !isNaN(a));
  const anoMaisRecente = anosValidos.length > 0 ? Math.max(...anosValidos) : "-";

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-400 font-medium animate-pulse">Abrindo a garagem da nuvem...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabeçalho Atualizado com lógica de ADMIN */}
        <div className="flex justify-between items-center bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-lg mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">MotoTrack</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Olá, {userName} ({userRole === 'admin' ? 'Administrador' : 'Piloto'})
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* BOTÃO EXCLUSIVO DO ADM */}
            {userRole === 'admin' && (
                <button 
                    onClick={() => router.push('/admin/oficinas')}
                    className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg shadow-lime-500/20"
                >
                    🔧 Painel de Oficinas ADM
                </button>
            )}
            
            <button onClick={handleSair} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2 px-4 rounded-lg text-sm transition-colors">
              Sair
            </button>
          </div>
        </div>

        {erro && <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-sm p-4 rounded-lg mb-6 text-center font-medium">⚠️ {erro}</div>}

        {/* ---------------- VISTA 1: LISTA DE MOTOS ---------------- */}
        {!motoSelecionada ? (
          <div className="space-y-6">
            
            {/* PAINEL DE INDICADORES GERAIS */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-md flex flex-col gap-1">
                <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Total da Frota</span>
                <span className="text-2xl font-black text-blue-500 font-mono">{totalVeiculos}</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-md flex flex-col gap-1">
                <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Marcas Ativas</span>
                <span className="text-2xl font-black text-purple-500 font-mono">{marcasUnicas}</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-md flex flex-col gap-1">
                <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Mais Recente</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{anoMaisRecente}</span>
              </div>
            </div>

            {/* Listagem de Motos */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Minhas Motos</h2>
                <button onClick={() => { setMotoEmEdicao(null); setIsModalAberto(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-lg shadow-blue-500/20">+ Adicionar Moto</button>
              </div>

              {motos.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">Sua garagem está vazia. Adicione uma moto para começar.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {motos.map((moto, index) => (
                    <div 
                      key={moto.id || index} 
                      onClick={() => { if(moto.id) { setMotoSelecionada(moto); buscarManutencoes(moto.id); } }}
                      className="p-5 border border-zinc-800 rounded-lg bg-zinc-950 flex flex-col gap-1 relative cursor-pointer hover:border-zinc-700 transition-all group"
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleAbrirEditar(moto)} className="text-zinc-500 hover:text-blue-400 transition-colors text-sm" title="Editar Moto">✏️</button>
                        <button onClick={() => handleExcluirMoto(moto.id)} className="text-zinc-500 hover:text-red-400 transition-colors text-sm" title="Excluir Moto">🗑️</button>
                      </div>

                      <div className="flex justify-between items-start pr-16">
                        <h3 className="font-bold text-lg text-zinc-100 group-hover:text-blue-400 transition-colors">{moto.modelo || "Sem Modelo"}</h3>
                        {moto.ano && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{moto.ano}</span>}
                      </div>
                      <p className="text-zinc-400 text-sm">{moto.marca || "Sem Marca"}</p>
                      {moto.placa && <div className="mt-2 inline-block bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded text-zinc-400 font-mono text-xs tracking-wider w-max">{moto.placa}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ---------------- VISTA 2: PAINEL DE MANUTENÇÕES ---------------- */
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
              <div>
                <button onClick={() => { setMotoSelecionada(null); setTermoBusca(""); }} className="text-zinc-400 hover:text-white text-sm font-medium mb-1 flex items-center gap-1">← Voltar para a Garagem</button>
                <h2 className="text-xl font-bold text-white">Manutenções: {motoSelecionada.modelo}</h2>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Investido</p>
                  <p className="text-lg font-extrabold text-emerald-400 font-mono">R$ {totalGasto.toFixed(2)}</p>
                </div>
                <button onClick={() => { setManutencaoEmEdicao(null); setIsModalManutAberto(true); }} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">+ Registrar Serviço</button>
              </div>
            </div>

            {/* Barra de Busca de Serviços */}
            {manutencoes.length > 0 && (
              <div className="mb-4">
                <input 
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="🔍 Pesquisar serviço... (Ex: óleo, freio, embreagem)"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
              </div>
            )}

            {carregandoManut ? (
              <p className="text-center py-6 text-zinc-500 animate-pulse">Buscando ordens de serviço...</p>
            ) : manutencoes.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">Nenhuma manutenção registrada para esta moto ainda.</div>
            ) : manutencoesFiltradas.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                Nenhum serviço encontrado com o termo "{termoBusca}".
              </div>
            ) : (
              <div className="space-y-3">
                {manutencoesFiltradas.map((manut) => (
                  <div key={manut.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-zinc-200">{manut.descricao}</h4>
                      <p className="text-xs text-zinc-500 mt-1">Data: {manut.data_servico ? new Date(manut.data_servico).toLocaleDateString('pt-BR') : 'Não informada'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-emerald-400 font-bold font-mono">R$ {parseFloat(manut.custo).toFixed(2)}</span>
                      
                      <div className="flex items-center gap-3 ml-2">
                        <button onClick={() => handleAbrirEditarManut(manut)} className="text-zinc-500 hover:text-blue-400 text-xs transition-colors" title="Editar Serviço">✏️</button>
                        <button onClick={() => handleDeletarManutencao(manut.id)} className="text-zinc-600 hover:text-red-400 text-xs transition-colors" title="Excluir Serviço">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL 1: MOTO */}
      {isModalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-md shadow-2xl text-zinc-200">
            <h3 className="text-xl font-bold mb-4">{motoEmEdicao ? "Editar Moto" : "Adicionar Nova Moto"}</h3>
            {erroModal && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-4">{erroModal}</div>}
            <form onSubmit={handleSalvarMoto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Marca *</label>
                <input type="text" required className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Honda" value={novaMoto.marca} onChange={(e) => setNovaMoto({...novaMoto, marca: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Modelo *</label>
                <input type="text" required className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: CG 160 Titan" value={novaMoto.modelo} onChange={(e) => setNovaMoto({...novaMoto, modelo: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Ano</label>
                  <input type="number" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 2026" value={novaMoto.ano} onChange={(e) => setNovaMoto({...novaMoto, ano: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Placa</label>
                  <input type="text" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" placeholder="ABC-1234" maxLength={8} value={novaMoto.placa} onChange={(e) => setNovaMoto({...novaMoto, placa: e.target.value.toUpperCase()})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={fecharModal} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" disabled={salvando} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">{salvando ? "Salvando..." : (motoEmEdicao ? "Salvar Alterações" : "Salvar Moto")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANUTENÇÃO */}
      {isModalManutAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-md shadow-2xl text-zinc-200">
            <h3 className="text-xl font-bold mb-4">
              {manutencaoEmEdicao ? "Editar Registro de Manutenção" : "Registrar Manutenção"}
            </h3>
            {erroModalManut && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-4">{erroModalManut}</div>}
            <form onSubmit={handleSalvarManutencao} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Descrição do Serviço *</label>
                <input type="text" required className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Troca de óleo e pastilha de freio" value={novaManut.descricao} onChange={(e) => setNovaManut({...novaManut, descricao: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Custo (R$) *</label>
                  <input type="number" step="0.01" required className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" value={novaManut.custo} onChange={(e) => setNovaManut({...novaManut, custo: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Data do Serviço *</label>
                  <input type="date" required className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" value={novaManut.data_servico} onChange={(e) => setNovaManut({...novaManut, data_servico: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={fecharModalManut} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancelar</button>
                <button type="submit" disabled={salvandoManut} className="bg-emerald-600 hover:bg-emerald-700 py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50">
                  {salvandoManut ? "Gravando..." : (manutencaoEmEdicao ? "Salvar Alterações" : "Confirmar")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}