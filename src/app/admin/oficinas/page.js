"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OficinasAdmin() {
    const router = useRouter();
    const [oficinas, setOficinas] = useState([]);
    const [nome, setNome] = useState('');
    const [endereco, setEndereco] = useState('');
    const [especialidade, setEspecialidade] = useState('');
    const [erro, setErro] = useState('');

    // A URL da sua API no Render (substitua pela sua URL real se estiver diferente)
    const API_URL = "https://mototrack-backend-giad.onrender.com/oficinas";

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        if (role !== 'admin') {
            router.push('/garagem'); // Se não for admin, expulsa de volta para a garagem
        } else {
            carregarOficinas();
        }
    }, []);

    const carregarOficinas = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setOficinas(data);
        } catch (error) {
            console.error("Erro ao carregar oficinas", error);
        }
    };

    const cadastrarOficina = async (e) => {
        e.preventDefault();
        setErro('');
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nome, endereco, especialidade })
            });

            if (res.ok) {
                setNome(''); setEndereco(''); setEspecialidade('');
                carregarOficinas(); // Recarrega a lista
            } else {
                const data = await res.json();
                setErro(data.message || 'Erro ao cadastrar.');
            }
        } catch (error) {
            setErro('Erro de conexão com a API.');
        }
    };

    const deletarOficina = async (id) => {
        if (!confirm("Tem a certeza que deseja remover esta oficina?")) return;
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) carregarOficinas();
        } catch (error) {
            console.error("Erro ao deletar", error);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                <h1 className="text-3xl font-bold text-lime-500">Painel do Administrador - Oficinas</h1>
                <button onClick={() => router.push('/garagem')} className="text-zinc-400 hover:text-white">
                    Voltar para Garagem
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Formulário de Cadastro */}
                <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 h-fit">
                    <h2 className="text-xl font-semibold mb-4">Nova Oficina</h2>
                    {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
                    
                    <form onSubmit={cadastrarOficina} className="flex flex-col gap-4">
                        <input 
                            type="text" placeholder="Nome da Oficina" required
                            value={nome} onChange={(e) => setNome(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 p-3 rounded text-white"
                        />
                        <input 
                            type="text" placeholder="Endereço" required
                            value={endereco} onChange={(e) => setEndereco(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 p-3 rounded text-white"
                        />
                        <input 
                            type="text" placeholder="Especialidade (ex: Elétrica)" required
                            value={especialidade} onChange={(e) => setEspecialidade(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 p-3 rounded text-white"
                        />
                        <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-black font-bold p-3 rounded mt-2">
                            Cadastrar Rede
                        </button>
                    </form>
                </div>

                {/* Lista de Oficinas */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Rede Credenciada</h2>
                    <div className="grid gap-4">
                        {oficinas.map(oficina => (
                            <div key={oficina.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-lime-400">{oficina.nome}</h3>
                                    <p className="text-zinc-400 text-sm">{oficina.endereco}</p>
                                    <span className="inline-block mt-2 bg-zinc-800 px-2 py-1 rounded text-xs text-zinc-300">
                                        {oficina.especialidade}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => deletarOficina(oficina.id)}
                                    className="text-red-500 hover:bg-red-500/10 p-2 rounded"
                                >
                                    Remover
                                </button>
                            </div>
                        ))}
                        {oficinas.length === 0 && (
                            <p className="text-zinc-500">Nenhuma oficina cadastrada no sistema.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}