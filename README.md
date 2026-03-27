# Indaiá Logística - Sistema de Gestão de Comércio Exterior

Bem-vindo ao sistema de gestão da **Indaiá Logística Internacional**. Esta é uma plataforma full-stack desenvolvida para centralizar e otimizar as operações de comércio exterior, oferecendo controle total sobre processos, clientes e equipe.

## 🚀 Principais Funcionalidades

### 📦 Gestão de Processos
- Abertura e acompanhamento de processos de Importação e Exportação.
- Registro detalhado de fatores (moeda, taxa de câmbio, pesos, volumes).
- Filtros inteligentes que mostram apenas os processos pertinentes à área de atuação do usuário logado.

### 👥 Banco de Dados de Clientes
- Cadastro completo de clientes (Pessoa Jurídica e Física).
- Gestão de contatos, endereços e informações fiscais.
- Busca rápida e intuitiva.

### 🔐 Administração de Usuários
- Controle de acesso baseado em funções (Admin, Gestor, Analista, Assistente, Auxiliar).
- Definição de escopo operacional (Importação, Exportação ou Ambos).
- Interface segura para criação e bloqueio de usuários.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Auth:** [Supabase](https://supabase.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)

## ⚙️ Configuração do Projeto

### Pré-requisitos
- Node.js (v18 ou superior)
- NPM ou Yarn

### Instalação

1. Clone o repositório:
   ```bash
   git clone [url-do-repositorio]
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` baseado no `.env.example` e adicione suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 📂 Estrutura de Pastas

- `src/pages`: Componentes de página (Dashboard, Processos, Clientes, Usuários, Login).
- `src/components`: Componentes de UI reutilizáveis.
- `src/lib`: Configurações de serviços (Supabase, Contexto de Autenticação).
- `src/types`: Definições de tipos TypeScript.

---

Desenvolvido com ❤️ para Indaiá Logística Internacional.
