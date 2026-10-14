---
name: schematize-docs
metadata:
  version: 0.3.0
description: >-
  Documentação como entrega: ADR, runbook, OpenAPI, README, índice/MAPA §39 e diagramas Mermaid. Use ao escrever ou
  cobrar docs, fechar entrega pela DoD, ou ao ver ADR proposed parado, spec fora do código, link morto ou MD solto no
  root. Traz gate `docs-gate.mjs`.
---

# Documentação da casa (schematize-docs)

Disciplina normativa, **agnóstica de linguagem**, sobre uma coisa só: **a casa documenta como
parte da entrega, não depois dela.** Documentação aqui não é um `.md` largado no fim pra
"cobrir"; é um artefato de engenharia — mora no repo, passa no review, é versionado, é **testado**
e tem gate na Definition of Done (§35). Doc que não existe é tarefa não pronta; doc que existe mas
mente (link quebrado, exemplo que não roda, ADR proposed eterno, README de mentira) é **dívida**,
não patrimônio.

É a contraparte de **registro** do que as outras skills produzem: a engenharia decide e constrói,
a doc **grava a decisão e o como** (ADR, runbook, índice), e a auditoria depois **cobra** que o
gravado seja verdade. Fecha o ciclo `decidir → construir → documentar → auditar`.

**Versão:** skill `schematize-docs` v0.3.0. Changelog em `CHANGELOG.md`.

## Comandos (Claude Code)

Digite `/docs-help` pra ver todos. Em resumo:

| Comando | O que faz |
|---|---|
| `/docs-help` | lista todos os comandos do schematize-docs |
| `/docs-adr` | cria ou movimenta um **ADR** (proposed → accepted/rejected) no `<projeto>_archive/decisoes/` (caminho único da casa), com contexto/decisão/consequências/alternativas; nunca deixa um `proposed` órfão |
| `/docs-runbook` | scaffolda/atualiza um **runbook** operacional (sintomas → diagnóstico → ação → verificação → rollback → escalar) pra um serviço/incidente |
| `/docs-review` | **revisa a doc como se revisa código**: roda os 7 gates (links, OpenAPI, drift, índice §39, root limpo, ADR `proposed`, diagrama sem fonte) e lê o que a máquina não lê |
| `/docs-api` | gera/valida a **API doc** (OpenAPI 3.1/contrato) a partir do código quando possível; checa drift entre spec e implementação |
| `/docs-load` | carrega à força TODO o corpo normativo (disciplina, ADR, runbook, API/versionamento, índice/diagramas) e passa a aplicá-lo |
| `/docs-claude` | cria ou mescla o `CLAUDE.md` sempre-on de documentação na raiz do repo |
| `/docs-cc` | context compact: gera handoff no archive e roda `/compact` |
| `/docs-handoff` | gera o handoff (context.md + checklist.md) sem compactar |

Os comandos ficam em `assets/commands/` e são instalados em `.claude/commands/`.

## Como usar esta skill

1. **Documente na mesma entrega, não depois.** Cada mudança que a DoD (§35) marca —
   contrato público, decisão arquitetural, feature nova, comportamento operacional — carrega a
   sua doc **no mesmo PR**. Doc separada "pra quando der" é doc que não vem. Leia
   `references/disciplina.md`.
2. **Toda decisão relevante vira ADR** (`references/adr.md`): escolha de banco/broker/linguagem,
   padrão arquitetural, mudança de contrato, qualquer desvio do padrão. Ciclo
   `proposed → accepted/rejected` com motivo datado — nunca `proposed` pra sempre.
3. **Doc é código:** mora no repo, revisada no PR, versionada, e **testada no CI** (o gate
   prova: link que abre, spec que casa com a implementação, `proposed` com prazo, diagrama com fonte;
   exemplo que roda e runbook exercitado em game day são verificados em review — sem script). Doc quebrada reprova o gate.
4. **Não trabalhe de memória** — as anatomias (ADR, runbook, OpenAPI, índice) e os pisos estão
   nos references. Aplique os pisos abaixo independentemente do reference carregado.

Mapa de references — leia o que casa com a tarefa:

| Tarefa | Reference |
|---|---|
| A disciplina: doc como parte do DoD, docs-as-code (revisada/versionada/testada), README útil, escrita clara e mínima ("doc que ninguém lê é dívida"), o que documentar e o que NÃO | `references/disciplina.md` |
| **ADR**: quando criar, o ciclo `proposed → accepted/rejected`, a anatomia (contexto/decisão/consequências/alternativas), onde mora, o ADR órfão que a auditoria pega | `references/adr.md` |
| **Runbook** operacional: o que fazer quando quebra, anatomia (sintoma→diagnóstico→ação→verificação→rollback→escalar), quando existe, teste do runbook | `references/runbooks.md` |
| **API docs e versionamento**: OpenAPI 3.1/contrato gerado do código, drift spec×implementação, changelog (Keep a Changelog) + SemVer, breaking change | `references/api-versionamento.md` |
| O **índice/MAPA (§39)**, o **archive (§28)** e os **diagramas** (C4/mermaid versionados) — o rastro que a auditoria e o overdev consomem | `references/indice-diagramas.md` |

## Pisos inegociáveis (vetam o atalho)

Independente do reference, estes limites nunca são cruzados:

1. **Doc é parte da Definition of Done — não opcional.** README/ADR/runbook/OpenAPI/índice
   quando a mudança os exige entram **no mesmo PR** que o código. Tarefa sem a doc que a DoD
   (§35) pede = tarefa **não pronta**, por mais verde que esteja o resto. "Documento depois" é
   "documento nunca".
2. **ADR pra toda decisão relevante.** Escolha de stack/banco/broker, padrão arquitetural,
   mudança de contrato público, qualquer desvio do padrão → **ADR versionado**. O ciclo é
   `proposed → accepted` **ou** `rejected`, com motivo **datado**. Um ADR `proposed` que nunca
   fecha é **órfão RED** — a `schematize-audit` o reabre. Decisão "combinada" sem ADR não existe.
3. **Docs-as-code: no repo, revisada, versionada, TESTADA.** A doc vive ao lado do código (não
   num wiki que deriva), passa no **mesmo review** do PR, e é **verificada no CI**: link que
   abre, exemplo/snippet que roda ou compila, OpenAPI que valida, índice cuja contagem bate
   (§39). Link morto / exemplo quebrado / spec fora de sincronia é **bug** que reprova o gate,
   não "detalhe".
4. **Contrato e doc geram-se do código quando possível.** OpenAPI, tabela de rotas, índice de
   microfunções — preferir **derivar** do código (anotações/AST/doc-comments) a manter à mão.
   Fonte da verdade é o código; doc que duplica à mão **deriva** e mente. Onde não dá gerar, o CI
   checa o **drift**.
5. **Escrita clara e mínima — doc que ninguém lê é dívida.** Documente **o que serve** a quem vai
   ler (o próximo dev, o oncall às 3h, o auditor): objetivo, como rodar/testar/deployar, decisão
   e porquê, o que fazer quando quebra. Corte o resto. Prosa que ninguém consulta apodrece e
   engana — deletar doc morta é manutenção, não perda.
6. **Rastro durável no archive/índice — root limpo.** Todo `.md` gerado mora em
   `<projeto>_archive/` (§28) — ADR em `<projeto>_archive/decisoes/` — ou no `docs/` versionado do projeto (runbook em
   `docs/runbook*`, índice em `<projeto>_archive/index/` §39). O root fica limpo: só código,
   config e os poucos MDs de mão (`README`, `CLAUDE`, `SKILL`, `LICENSE`, `CHANGELOG`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `AGENTS`, `CONTEXT`). Largar plano/relatório/índice/ADR no root é violação
   (§37). *(A fonte da allowlist é o gate `scripts/docs-gate.mjs --so root`; esta lista e a de `references/disciplina.md` §5 a espelham. `CHANGELOG` entra porque a própria casa normatiza Keep a Changelog **na raiz**; ADR **não** entra — mora em `<projeto>_archive/decisoes/`.)*
7. **Índice/MAPA é fonte da verdade e tem gate.** O índice (§39) enumera — **conta, não resume** —
   e trava o merge quando desatualizado. Diagrama (C4/mermaid) é **versionado como código**, nunca
   PNG solto que ninguém consegue editar. Doc de arquitetura que diverge da realidade é pior que
   ausência.

## Relação com as outras skills

- **schematize-engineering** — a **BASE**. Esta skill destila e opera a **camada de documentação**
  que a engenharia normatiza: a **DoD (§35)** (doc é gate), o **archive (§28)** (onde o rastro
  mora), o **índice/MAPA (§39)** (fonte da verdade, gate de contagem) e o **ADR (§27)** (registro
  de decisão). A engenharia diz *que* tem que documentar; esta skill diz *como* fica bom.
- **schematize-audit** — quem **cobra**. A auditoria de histórico lê o rastro que esta skill
  produz: ADR `proposed` que nunca virou `accepted`/`rejected` é **órfão RED**; doc/entrega
  prometida que não existe no caminho prometido **volta a aberto**; índice cuja contagem não bate
  é auditoria incompleta. Documentar bem é o que faz a auditoria passar.
- **schematize-web / go / rust / elixir / c# / zig / ruby / node** — a doc é agnóstica, mas o
  **gerador** e o **gate** rodam na stack: OpenAPI/índice saem do código daquela linguagem
  (`/<slug>-index`, `/<slug>-review`), e a doc-as-code é testada no CI dela. Esta skill dá a
  disciplina; cada linguagem executa.
