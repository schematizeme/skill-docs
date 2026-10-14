# API docs e versionamento — contrato gerado do código, changelog, SemVer

> O contrato de uma API é uma promessa a quem a consome. Uma promessa que a doc descreve errado é
> pior que promessa nenhuma — o cliente confia e quebra. Por isso a casa **gera a doc de API do
> código** sempre que possível (pra não derivar), **testa** que a spec bate com a implementação, e
> versiona a superfície pública com **SemVer** + **changelog** (Keep a Changelog). Contrato é
> código; doc de contrato é testada como código.

> **Dona do conteúdo do contrato: `schematize-api`** (OpenAPI contract-first, erros RFC 9457, paginação,
> idempotência, webhooks, compatibilidade e Sunset — `schematize-api → references/contrato-rest.md` e
> `references/versionamento-deprecacao.md`). Aqui fica a **doc como entrega**: a spec versionada no repo,
> o drift check no CI, o changelog escrito para o consumidor e o ADR do breaking.

## 1. OpenAPI 3.1 — a spec é gerada, não escrita à mão

Toda API HTTP da casa tem uma **OpenAPI 3.1** (ou o contrato equivalente da tecnologia:
protobuf/gRPC, GraphQL SDL, AsyncAPI pra eventos). O piso é: **derivar do código**, não manter em
paralelo.

- **Gerar do código** — anotações/tipos/handlers geram a spec (ex.: do router + structs de
  request/response). A fonte da verdade é o **código**; a spec é um artefato **gerado**, não um
  segundo lugar que alguém edita à mão e esquece de sincronizar.
- **Onde gerar não dá** (spec-first, contrato desenhado antes do código) — então o **código é
  gerado/validado contra a spec**: a spec vira a fonte, e o CI checa que os handlers a cumprem.
  Um dos dois é derivado do outro; nunca os dois à mão em paralelo.
- **Versionada no repo** — `openapi.yaml` (ou gerada no build e publicada), no git, revisada no PR.

## 2. Drift check — a spec TEM que bater com a implementação

Doc de API só vale se for verdade **hoje**. O CI checa o **drift** entre spec e implementação —
é o teste de doc-as-code (`disciplina.md` §2) aplicado ao contrato:

- **Validação estrutural:** a OpenAPI é válida contra o schema 3.1 (lint: `spectral`/equivalente).
- **Spec × implementação:** contract-test — cada rota/campo da spec existe no código com o tipo
  certo, e cada rota do código está na spec. Rota nova sem spec, ou campo removido do código mas
  vivo na spec, **reprova o gate**.
- **Exemplos que validam:** os `examples` da spec validam contra os próprios schemas (exemplo que
  não bate com o schema que ele ilustra é bug).
- **Contra o consumidor** (quando há consumidor interno): consumer-driven contract test — o
  provider não quebra o contrato que o consumer espera.

> Uma OpenAPI que descreve a API de três releases atrás é uma **mentira versionada**. O drift check
> é o que a mantém honesta: se a spec e o código discordam, o CI falha e alguém reconcilia — não se
> descobre em produção pelo cliente que integrou errado.

## 3. Versionamento semântico (SemVer) da superfície pública

A superfície pública (API, evento, biblioteca compartilhada) versiona com **SemVer** `MAJOR.MINOR.PATCH`:

- **MAJOR** — **breaking change** (o que conta como breaking e como deprecar: `schematize-api → references/versionamento-deprecacao.md`): remover/renomear campo ou rota, mudar tipo, apertar validação,
  mudar semântica. Exige ADR (`adr.md`) e plano de migração/deprecação — nunca big-bang silencioso.
- **MINOR** — adição retrocompatível: rota/campo novo opcional, novo valor de enum tolerado.
- **PATCH** — correção que não muda o contrato: bug fix, doc, performance.

Regras da casa:

- **Breaking change em contrato público exige ADR** (§27) e caminho de migração (versão paralela
  `/v2`, deprecação datada, header de versão — não quebrar o cliente de surpresa).
- **Breaking change em shared lib exige ADR** (a casa proíbe quebrar dependente sem registro).
- **Deprecação é datada e anunciada** — `Deprecation`/`Sunset` header, changelog, prazo. Campo
  deprecado some **na próxima MAJOR**, não quando der.

## 4. Changelog — Keep a Changelog

Todo componente versionado mantém `CHANGELOG.md` no formato
[Keep a Changelog](https://keepachangelog.com/pt-BR/), em ordem cronológica reversa:

```markdown
# Changelog — <componente>

Formato: Keep a Changelog. Versionamento semântico.

## [2.0.0] — 2026-08-15
### Removido
- **BREAKING:** campo `legacy_id` da resposta de `/orders` (deprecado desde 1.4.0). ADR 0011.
### Adicionado
- rota `POST /orders/:id/refund`.

## [1.4.0] — 2026-06-02
### Deprecado
- `legacy_id` em `/orders` — usar `id`. Remoção prevista em 2.0.0.
### Corrigido
- paginação de `/orders` retornava cursor inválido no fim da lista.
```

- **Seções:** `Adicionado / Modificado / Deprecado / Removido / Corrigido / Segurança`.
- **Breaking marcado** em negrito, com link pro ADR e pra rota de migração.
- **Escrito pro consumidor**, não pro autor: o que muda pra quem usa, não o refactor interno.
- **Uma entrada por release**, datada. `## [Unreleased]` acumula o que vai sair na próxima.

> O changelog é a doc que o **integrador** lê antes de subir de versão. Um "veja os commits" não é
> changelog: commit é ruído pra quem consome. O changelog **cura** o ruído em "o que muda pra
> você", com o breaking em destaque e o caminho de saída.

## 5. Onde mora e como se liga

- **OpenAPI/contrato:** versionado no repo (gerado no build ou commitado), linkado pelo README e
  pelo índice global (§39, `indice-diagramas.md`).
- **CHANGELOG.md:** raiz do componente. É um dos MDs de projeto de mão, fora do `_archive`.
- **DoD (§35):** "OpenAPI atualizada (se for API)" é item bloqueante — a spec entra no **mesmo PR**
  da mudança de contrato, com o changelog e o ADR quando for breaking.
- **Auditoria:** a `schematize-audit` trata "API doc prometida que não existe/não bate" como item
  que **volta a aberto** (feito-sem-prova) — a prova é a spec válida + drift check verde hoje.
