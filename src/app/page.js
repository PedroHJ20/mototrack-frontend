"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Redireciona automaticamente se já estiver logado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/garagem");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setCarregando(true);

    // 💡 URL oficial do Render atualizada aqui:
    // Nota: Verifique se a sua rota de cadastro no Back-end é "/usuarios" ou "/usuarios/registrar"
    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    const url = `https://mototrack-backend-giad.onrender.com${endpoint}`;

    const payload = isLogin ? { email, senha } : { nome, email, senha };

    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        if (isLogin) {
          // Login com sucesso: guarda o token e vai para a garagem
          localStorage.setItem("token", dados.token);
          localStorage.setItem('userRole', dados.user.role); 
          localStorage.setItem('userName', dados.user.nome);
          router.push("/garagem");
        } else {
          // Cadastro com sucesso: limpa o formulário e volta para a tela de login
          setSucesso("Conta criada com sucesso! Faça login para entrar.");
          setIsLogin(true);
          setNome("");
          setSenha("");
        }
      } else {
        setErro(dados.erro || "Falha na autenticação. Verifique os dados.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor na nuvem.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-zinc-200">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">MotoTrack</h1>
          <p className="text-zinc-400 text-sm">
            {isLogin ? "Acesse sua garagem digital" : "Crie sua conta para começar"}
          </p>
        </div>

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-lg mb-6 text-center">
            {sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Nome Completo</label>
              <input 
                type="text" 
                required 
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail</label>
            <input 
              type="email" 
              required 
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Senha</label>
            <input 
              type="password" 
              required 
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors mt-4"
          >
            {carregando ? "Conectando..." : (isLogin ? "Entrar na Garagem" : "Criar Conta")}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-zinc-800 pt-6">
          <p className="text-sm text-zinc-500">
            {isLogin ? "Ainda não tem uma conta?" : "Já possui uma conta?"}
          </p>
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setErro("");
              setSucesso("");
            }}
            className="text-blue-400 hover:text-blue-300 font-medium text-sm mt-1 transition-colors"
          >
            {isLogin ? "Cadastre-se agora" : "Faça login aqui"}
          </button>
        </div>

      </div>
    </div>
  );
}