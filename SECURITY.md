# 🔒 Guia de Segurança e CI/CD - FenixUI

Este documento explica como configurar a proteção da branch `main` e os workflows de publicação automática no npm e GitHub Pages.

---

## 🎯 Visão Geral

- ✅ **Branch `main` protegida** — Ninguém pode fazer push direto
- ✅ **Pull Requests exigem aprovação** — Apenas maintainers podem aprovar
- ✅ **CODEOWNERS ativo** — Todos os arquivos exigem review do maintainer
- ✅ **Publicação no npm automatizada** — Apenas via GitHub Actions na `main`
- ✅ **Deploy de docs automático** — GitHub Pages atualiza após merge na `main`
- ✅ **Versionamento controlado** — Apenas maintainers podem disparar o workflow

---

## ⚙️ Configuração Inicial (Obrigatória)

### Passo 1: Criar Access Token do npm

1. Acesse [https://www.npmjs.com/settings/~/tokens](https://www.npmjs.com/settings/~/tokens)
2. Clique em **"Generate New Token"** → escolha **"Publish"**
3. Copie o token gerado (ex: `npm_xxxxxxxxxxxxxxxxxxxx`)

### Passo 2: Adicionar o Token como Secret no GitHub

1. Acesse: `https://github.com/wesley-reis/FenixUI/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Configure:
   - **Name:** `NPM_TOKEN`
   - **Value:** Cole o token do npm gerado no passo anterior
4. Clique em **"Add secret"**

### Passo 3: Configurar Branch Protection Rules

1. Acesse: `https://github.com/wesley-reis/FenixUI/settings/branches`
2. Clique em **"Add branch protection rule"**
3. Configure conforme a tabela abaixo:

| Configuração | Valor | Descrição |
|---|---|---|
| **Branch name pattern** | `main` | Protege a branch principal |
| **Require a pull request before merging** | ✅ Ativar | Impede push direto |
| ↳ Require approvals | `1` | Mínimo 1 aprovação |
| ↳ Dismiss stale pull request approvals | ✅ Ativar | Reavalia se houver mudanças |
| ↳ Require review from Code Owners | ✅ **CRÍTICO** | Exige aprovação do maintainer |
| ↳ Restrict who can dismiss reviews | ✅ Ativar | Apenas maintainers |
| **Require status checks to pass** | ✅ Ativar | CI precisa passar |
| ↳ Require branches to be up to date | ✅ Ativar | Branch precisa estar atualizada |
| **Require conversation resolution** | ✅ Ativar | Comentários resolvidos |
| **Include administrators** | ✅ **CRÍTICO** | Até admins seguem as regras |
| **Restrict who can push** | ✅ Ativar | Apenas pessoas específicas |
| **Allow force pushes** | ❌ Desativado | **NUNCA** ative |
| **Allow deletions** | ❌ Desativado | **NUNCA** ative |

> ⚠️ Marque **"Include administrators"** para que até o dono precise seguir as regras.

4. Clique em **"Create"** ou **"Save changes"**

### Passo 4: Verificar GitHub Pages

1. Acesse: `https://github.com/wesley-reis/FenixUI/settings/pages`
2. Em **Source**, selecione **"GitHub Actions"**
3. O workflow `deploy-docs.yml` cuidará do deploy automaticamente

---

## 🔄 Fluxo de Trabalho

### Fluxo para Contribuidores (Fork + PR)

```
1. Contribuidor faz fork do repositório
2. Cria branch de feature: feature/nova-funcionalidade
3. Faz commit e push no fork
4. Abre Pull Request para a main
5. CI roda automaticamente (typecheck, tests, build)
6. CODEOWNERS exige aprovação do maintainer (@wesley-reis)
7. Maintainer revisa e aprova (ou solicita mudanças)
8. PR é mergeado na main
9. Workflows de deploy são disparados automaticamente
```

### Fluxo para Maintainer (Versionamento + Publicação)

```
1. Maintainer vai em Actions → "Bump Version" → "Run workflow"
2. Escolhe o tipo: patch / minor / major / custom
3. Workflow executa:
   ├── Atualiza versão no package.json
   ├── Atualiza README.md (prepack)
   ├── Commit + push na main
   ├── Cria tag vX.Y.Z
   └── Dispara automaticamente o "Publish to npm"
4. Workflow "Publish to npm" executa:
   ├── Build, typecheck, tests
   ├── Publica no npm com --provenance
   └── Cria GitHub Release
5. Workflow "Deploy Docs" executa:
   ├── Build das docs
   └── Deploy no GitHub Pages
```

---

## 📦 Workflows Disponíveis

### 1. `deploy-docs.yml` — Deploy da Documentação
- **Trigger:** Push na `main` (quando arquivos relevantes mudam) ou `workflow_dispatch`
- **O que faz:** Build e deploy do site de documentação no GitHub Pages
- **Proteções:**
  - Só roda na branch `main`
  - Só roda no repositório original (não em forks)
  - Verifica se o build foi gerado corretamente

### 2. `publish-npm.yml` — Publicação no npm
- **Trigger:** Criação de tag `v*`, `workflow_dispatch` manual, ou `repository_dispatch` do bump-version
- **O que faz:** Build, testes, e publicação no npm
- **Proteções:**
  - Só roda na branch `main` ou em tags
  - Só roda no repositório original (não em forks)
  - Usa `NPM_TOKEN` armazenado como secret
  - Verifica se o build foi gerado corretamente
  - Publica com `--provenance` para rastreabilidade

### 3. `bump-version.yml` — Versionamento
- **Trigger:** Apenas `workflow_dispatch` manual na branch `main`
- **O que faz:** Bump de versão, commit, tag, e dispara publicação
- **Proteções:**
  - Só pode ser disparado na branch `main`
  - Só maintainers (com permissão de `write`) podem disparar
  - Cria tag automaticamente

---

## 🛡️ Segurança

### O que está protegido?

| Recurso | Proteção | Como |
|---|---|---|
| **Branch `main`** | Push direto bloqueado | Branch Protection Rules |
| **PRs** | Exigem aprovação do maintainer | CODEOWNERS + Branch Protection |
| **Todos os arquivos** | Exigem review do maintainer | CODEOWNERS (`* @wesley-reis`) |
| **Workflows** | Ninguém pode alterar sem aprovação | CODEOWNERS protege `.github/` |
| **package.json** | Ninguém pode alterar sem aprovação | CODEOWNERS + Branch Protection |
| **vite.*.config.ts** | Ninguém pode alterar sem aprovação | CODEOWNERS + Branch Protection |
| **tsconfig*.json** | Ninguém pode alterar sem aprovação | CODEOWNERS + Branch Protection |
| **Publicação npm** | Apenas via GitHub Actions na main | NPM_TOKEN como secret + workflows |
| **GitHub Pages** | Apenas via workflow na main | Workflow protegido |
### Arquivos protegidos pelo CODEOWNERS

O arquivo `.github/CODEOWNERS` define que **TODOS** os arquivos (`*`) exigem aprovação de `@wesley-reis`:

```
* @wesley-reis
```

Isso inclui:
- `.github/workflows/` — pipelines
- `package.json` — configurações npm
- `vite.*.config.ts` — configurações de build
- `tsconfig*.json` — configurações TypeScript
- `vitest.config.ts` — configurações de teste
- `src/` — código-fonte
- `scripts/` — scripts de automação
- `.npmignore` — configuração de publicação
- `README.md` — documentação

### Por que isso é seguro?

1. **Contribuidores não podem fazer merge** sem aprovação do maintainer
2. **Maintainer precisa aprovar** TODAS as mudanças (inclusive em configs)
3. **NPM_TOKEN está seguro** como GitHub Secret (ninguém pode ver o valor)
4. **Publicação só acontece** na branch `main` via GitHub Actions
5. **Forks não executam** workflows protegidos (proteção `if: github.repository`)
6. **`--provenance`** garante rastreabilidade de cada pacote publicado no npm

---

## 🚀 Como Publicar uma Nova Versão

### Opção A: Workflow Automático (Recomendado)

1. Vá em **Actions** → **Bump Version** → **Run workflow**
2. Escolha o tipo de bump:
   - `patch` → 1.0.15 → 1.0.16 (bugfixes)
   - `minor` → 1.0.15 → 1.1.0 (novas features)
   - `major` → 1.0.15 → 2.0.0 (breaking changes)
   - `custom` → versão específica (ex: 1.2.3)
3. Opcionalmente, marque **"Pular publicação automática"** se quiser publicar manualmente depois
4. Clique em **Run workflow**

O workflow irá:
- Atualizar `package.json` com a nova versão
- Atualizar `README.md` com a nova versão
- Criar commit na `main`
- Criar tag `vX.Y.Z`
- Disparar automaticamente o **Publish to npm**
- Criar **GitHub Release**

### Opção B: Publicação Manual

Se você marcou "Pular publicação automática" no bump:

1. Vá em **Actions** → **Publish to npm** → **Run workflow**
2. Escolha a tag npm:
   - `latest` → versão estável (padrão)
   - `beta` → versão beta
   - `next` → próxima versão
   - `alpha` → versão alpha
3. Clique em **Run workflow**

---

## ❓ FAQ

### P: Um contribuidor pode publicar no npm?
**R:** Não. O `NPM_TOKEN` está armazenado como secret e só é acessível nos workflows que rodam na branch `main`. Contribuidores não têm acesso ao secret.

### P: Um contribuidor pode alterar os workflows?
**R:** Não sem aprovação. O CODEOWNERS protege todos os arquivos, incluindo `.github/workflows/`. Qualquer mudança exige aprovação do maintainer.

### P: O que acontece se alguém fizer fork e tentar publicar?
**R:** Nada. Os workflows têm a proteção `if: github.repository == 'wesley-reis/FenixUI'` que impede execução em forks.

### P: Posso adicionar outros maintainers?
**R:** Sim! Atualize o `.github/CODEOWNERS` para incluir outros usuários:
```
* @wesley-reis @outro-maintainer
```

### P: O que é `--provenance`?
**R:** É uma feature do npm que vincula cada pacote publicado ao workflow do GitHub que o gerou. Isso garante que o pacote `@wrrdev/fenix-ui` no npm foi realmente publicado pelo seu repositório oficial.

---

## 📝 Checklist de Segurança

- [ ] `NPM_TOKEN` adicionado como secret no GitHub
- [ ] Branch Protection Rules configuradas na `main`
- [ ] "Require review from Code Owners" ativado
- [ ] "Include administrators" ativado
- [ ] "Allow force pushes" desativado
- [ ] "Allow deletions" desativado
- [ ] GitHub Pages configurado para deploy via GitHub Actions (Settings → Pages → Source: GitHub Actions)