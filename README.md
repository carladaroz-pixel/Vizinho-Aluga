# Vizinho Aluga - Plataforma de Compartilhamento de Itens

Aplicativo web para alugar itens entre vizinhos na mesma comunidade, com segurança total e ganhos garantidos.

## Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: CSS puro + Tailwind inspiration
- **Icons**: Emojis + SVG
- **UI**: Mobile-first (430px base)

## Setup Rápido

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Variáveis de Ambiente

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

Já estão configuradas em `.env`

## Estrutura

```
src/
├── App.tsx              # App principal com auth integrada
├── contexts/
│   └── AuthContext.tsx  # Gerenciamento de autenticação
├── lib/
│   └── supabase.ts      # Cliente Supabase + tipos
├── index.css            # Estilos globais
└── main.tsx             # Entry point
```

## Funcionalidades

### ✅ Implementado (v1.0)
- Autenticação (Sign Up / Sign In)
- Anúncio de itens
- Catálogo de itens
- Persistência no Supabase
- RLS security policies
- Mobile-responsive

### 🚧 Próximas (v2.0)
- Dashboard financeiro
- Sistema de rentals
- Chat in-app
- Reviews & ratings
- Payment processing
- Delivery integration

## Usuário Exemplo

```
Email: teste@example.com
Senha: senha123
Nome: João Silva
```

## Dados de Teste

Após criar conta, teste anunciando itens:
- Nome: "Furadeira Bosch 18V"
- Categoria: "tools"
- Emoji: "🔧"
- Preço: "35"

Após publicar, acesse "Catálogo" para ver o item listado.

## Performance

- Build size: ~287KB (85KB gzipped)
- Mobile optimized
- CSS animations only (no JS overhead)
- Efficient database queries with indexes

## Segurança

- RLS policies em todas as tabelas
- Validações server-side no Supabase
- Senhas hashadas automaticamente
- Sessions gerenciadas pelo Supabase Auth

## Deploy

Pronto para deploy em:
- Vercel
- Netlify
- AWS Amplify
- Cloudflare Pages

Apenas adicione as variáveis de ambiente do Supabase no painel do seu host.
