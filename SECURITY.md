# Política de Segurança — FenixUI

Obrigado por ajudar a manter o **FenixUI** seguro. Esta página explica **como
reportar uma vulnerabilidade** com responsabilidade e o que você pode esperar
de nós.

> ⚠️ **Não abra issue pública para vulnerabilidades.** Use um canal privado.

---

## Versões suportadas

| Versão | Suporte |
| --- | --- |
| `1.6.x` (latest) | ✅ Ativa |
| `< 1.6` | ❌ Não suportada |

Correções de segurança são publicadas na versão **latest** e, quando aplicável,
em uma `patch` da linha atual.

---

## Como reportar

**Canal preferido — GitHub Security Advisories (privado):**

1. Acesse **Security → Advisories → “Report a vulnerability”**:
   <https://github.com/wesley-reis/FenixUI/security/advisories/new>
2. Descreva o problema. A conversa fica **privada** entre você e o maintainer
   até a divulgação coordenada.

O advisory privado cria um canal rastreável, com crédito ao pesquisador na
divulgação (se desejar).

### O que incluir no relatório

- Descrição do problema e **impacto** (o que um atacante consegue fazer);
- **Passos para reproduzir** (versão do `@wrrdev/fenix-ui`, navegador/ambiente,
  e um trecho mínimo de código/HTML);
- Componente afetado (ex.: `fx-table`, `fx-editor`, `fx-input`…);
- Se possível, uma **prova de conceito (PoC)** e uma **sugestão de correção**.

---

## Nosso compromisso

- **Confirmação de recebimento** em até **72 horas**;
- Avaliação inicial (severidade + impacto) em até **7 dias**;
- Correção/contorno e **divulgação coordenada** assim que houver versão
  disponível — combinamos o prazo com você;
- **Crédito público** ao pesquisador na divulgação (opcional).

Pedimos que você **não divulgue publicamente** o problema antes de publicarmos
uma correção.

---

## Boas práticas para quem consome a biblioteca

- Use sempre a **versão latest** e mantenha as dependências atualizadas;
- O pacote **não possui dependências de runtime** e **não executa scripts de
  instalação** — a superfície de ataque na instalação é mínima;
- Em produção, prefira importar **por subpath** (`@wrrdev/fenix-ui/button` etc.)
  para manter o bundle enxuto;
- Como qualquer UI, evite inserir HTML/atributos **não confiáveis** em slots,
  `innerHTML` ou conteúdo de template — o FenixUI escapa valores por padrão, mas
  a origem dos dados continua sendo responsabilidade da aplicação.

---

## Escopo

Esta política cobre o **pacote npm `@wrrdev/fenix-ui`** e o **código deste
repositório**. Problemas em dependências de terceiros devem ser reportados aos
respectivos projetos.
