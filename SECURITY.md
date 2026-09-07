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

### Passo 1: Configurar Trusted Publishing no npm (OIDC — sem token estático)

> 🔐 **Por que Trusted Publishing?** Diferente de um `NPM_TOKEN` estático (que pode vazar), o Trusted Publishing usa **OIDC (OpenID Connect)** para gerar tokens efêmeros de curta duração, vinculados ao workflow específico. Se alguém tentar publicar fora do seu workflow autorizado, **não funciona**.

1. Acesse: `https://www.npmjs.com/package/@wrrdev/fenix-ui/access`
2. Na seção **"Provenance"**, clique em **"Add trusted publisher"**
3. Preencha:

| Campo | Valor |
|---|---|
| **Provider** | `GitHub` |
| **Organization or user** | `wesley-reis` |
| **Repository** | `FenixUI` |
| **Workflow filename** | `publish-npm.yml` |
| **Environment** (opcional) | `npm-publish` |

4. Clique em **"Add trusted publisher"**

> ✅ Pronto! Agora o npm aceita publicações **apenas** do seu workflow `publish-npm.yml`, rodando na branch `main`, do repositório `wesley-reis/FenixUI`. Nenhum token de longa duração é necessário.

> 💡 **Dica:** Se quiser proteção extra, configure o **Environment `npm-publish`** no GitHub (Settings → Environments → New environment → `npm-publish`) e ative "Required reviewers" para que apenas pessoas específicas possam disparar a publicação.

### Passo 2: Configurar Branch Protection Rules

1. Acesse: `https://github.com/wesley-reis/FenixUI/settings/branches`
2. Clique em **"Add branch protection rule"**
3. Configure conforme a tabela abaixo:

| Configuração | Valor | Descrição |
|---|---|---|
| **Enforcement status** | `Active` | ✅ **Ativa** a regra de proteção |
| **Branch name pattern** | `main` | Protege a branch principal |
| **Require a pull request before merging** | ✅ Ativar | Impede push direto |
| ↳ Require approvals | `1` | Mínimo 1 aprovação |
| ↳ Dismiss stale pull request approvals | ✅ Ativar | Reavalia se houver mudanças |
| ↳ Require review from Code Owners | ✅ **CRÍTICO** | Exige aprovação do maintainer |
| ↳ Restrict who can dismiss reviews | ✅ Ativar | Apenas maintainers |
| **Require status checks to pass** | ⚠️ Veja nota | CI precisa passar |
| ↳ Require branches to be up to date | ✅ Ativar | Branch precisa estar atualizada |
| **Require conversation resolution** | ✅ Ativar | Comentários resolvidos |
| **Allow force pushes** | ❌ Desativado | **NUNCA** ative |
| **Allow deletions** | ❌ Desativado | **NUNCA** ative |

> ⚠️ **Sobre "Require status checks to pass":** O GitHub exige que pelo menos um workflow tenha rodado na branch antes de aparecer como opção. Se der erro "Required status checks cannot be empty", faça assim:
> 1. **Salve a regra sem ativar** "Require status checks" primeiro
> 2. Dispare o workflow CI manualmente: **Actions → CI → Run workflow** (na branch `main`)
> 3. Após o CI rodar com sucesso, volte em **Branch Protection Rules** e ative "Require status checks to pass", selecionando o job `validate`

> 💡 **Sobre "Include administrators":** Essa opção só aparece em contas pagas (Pro/Team/Enterprise) ou organizações. Em **contas pessoais gratuitas**, a proteção já se aplica a todos por padrão — não precisa configurar.

> 🔄 **Sobre auto-aprovação de PRs (dono único):** O autor de um Pull Request **nunca pode se auto-aprovar**. Se o CODEOWNERS aponta para você (`* @wesley-reis`) e o PR é seu, ele fica travado em *"Awaiting review from Code Owners"* sem botão de aprovação.
>
> **Para dono único em conta gratuita** (sem a opção "Who can bypass"), a configuração mais segura possível é:
> - ✅ Manter: "Require a pull request before merging" (push direto bloqueado)
> - ❌ Desmarcar: "Require review from Code Owners" e "Require approvals" (auto-aprovação é impossível no GitHub)
> - ✅ Manter: CI `validate` obrigatório, force push e deletions bloqueados
>
> **Resultado:** PRs seus → CI roda → merge liberado. PRs de contribuidores → CI roda → **você aprova** → merge. A segurança real vem do CI + bloqueio de push direto + CODEOWNERS documentando os responsáveis.
>
> 💡 **Dica:** Ao adicionar mais maintainers ao CODEOWNERS (`* @wesley-reis @outro-maintainer`), reative "Require review from Code Owners" e "Require approvals" — eles poderão aprovar seus PRs e a proteção completa volta a valer.

4. Clique em **"Create"** ou **"Save changes"**

### Passo 3: Verificar GitHub Pages

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
1. Crie uma branch e edite a versão no package.json
   (ex.: 1.0.16 → 1.0.17)
2. Abra um Pull Request
3. O CI automaticamente:
   ├── Sincroniza o README.md com a nova versão (prepack automático)
   ├── Roda typecheck, tests e build
   └── Faz commit do README direto na branch do PR (se necessário)
4. Mergeie o PR quando o CI passar
5. Workflow "Release Tag" (disparado pelo merge):
   ├── Verifica se a tag vX.Y.Z já existe
   └── Se não existir, cria e envia a tag → dispara o Publish
6. Workflow "Publish to npm" executa:
   ├── Build, typecheck, tests
   ├── Publica no npm com --provenance (tolerante a versões em validating)
   └── Cria GitHub Release
7. Workflow "Deploy Docs" executa:
   ├── Build das docs (versão lida do package.json)
   └── Deploy no GitHub Pages
```

> 💡 **Sem necessidade de rodar `npm run prepack` manualmente** — o CI sincroniza
> o README automaticamente no PR. O pacote npm também sempre recebe o README
> correto, pois o hook `prepack` roda dentro do próprio `npm publish`.

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
- **Trigger:** Criação de tag `v*` ou `workflow_dispatch` manual
- **O que faz:** Build, testes, e publicação no npm
- **Proteções:**
  - Só roda na branch `main` ou em tags
  - Só roda no repositório original (não em forks)
  - Usa **Trusted Publishing (OIDC)** — sem token estático, token efêmero vinculado ao workflow
  - Verifica se o build foi gerado corretamente
  - Publica com `--provenance` para rastreabilidade
  - Tolerante a versões em *staged/validating* (sem erro E409)

### 3. `release-tag.yml` — Criação de Tag Automática
- **Trigger:** Push na branch `main` (após merge de qualquer PR)
- **O que faz:** Lê a versão do `package.json`; se a tag `vX.Y.Z` não existir, cria e envia
- **Proteções:**
  - Idempotente — não faz nada se a tag já existir
  - A tag dispara automaticamente o `publish-npm.yml`
  - Tags não são bloqueadas por Branch Protection Rules

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
| **Publicação npm** | Apenas via GitHub Actions na main | Trusted Publishing (OIDC) + workflows |
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
3. **Trusted Publishing (OIDC)** elimina tokens de longa duração — o npm gera tokens efêmeros de minutos vinculados ao workflow, repo e branch específicos
4. **Publicação só acontece** na branch `main` via GitHub Actions
5. **Forks não executam** workflows protegidos (proteção `if: github.repository`)
6. **`--provenance`** garante rastreabilidade de cada pacote publicado no npm

---

## 🚀 Como Publicar uma Nova Versão

### Fluxo único: PR de versão (simples e seguro)

1. Crie uma branch e edite a versão no `package.json`:
   - `patch` → 1.0.16 → 1.0.17 (bugfixes)
   - `minor` → 1.0.16 → 1.1.0 (novas features)
   - `major` → 1.0.16 → 2.0.0 (breaking changes)
2. Abra um **Pull Request**
3. O CI sincroniza o README automaticamente e valida tudo (typecheck, tests, build)
4. Faça o **merge**

Ao mergear, automaticamente:
- ✅ Tag `vX.Y.Z` é criada (workflow *Release Tag*)
- ✅ Pacote é publicado no npm com provenance (workflow *Publish to npm*)
- ✅ **GitHub Release** é criada
- ✅ Site de docs é atualizado no GitHub Pages (workflow *Deploy Docs*)

> 💡 Não é necessário rodar `npm run prepack` manualmente — o CI faz isso
> no PR, e o pacote npm também recebe o README correto via hook do `npm publish`.

---

## ❓ FAQ

### P: Um contribuidor pode publicar no npm?
**R:** Não. O projeto usa **Trusted Publishing (OIDC)**, que vincula a publicação ao workflow `publish-npm.yml` específico do repositório `wesley-reis/FenixUI` na branch `main`. Mesmo que alguém tente publicar localmente, não terá autorização — a autenticação é feita pelo GitHub Actions via OIDC, não por um token que alguém poderia copiar.

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

- [ ] Trusted Publishing configurado no npm (package → access → trusted publisher)
- [ ] Branch Protection Rules configuradas na `main`
- [ ] "Require review from Code Owners" ativado
- [ ] "Include administrators" ativado
- [ ] "Allow force pushes" desativado
- [ ] "Allow deletions" desativado
- [ ] GitHub Pages configurado para deploy via GitHub Actions (Settings → Pages → Source: GitHub Actions)
- [ ] (Opcional) Environment `npm-publish` com "Required reviewers" configurado no GitHub