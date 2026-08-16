# Changelog — schematize-docs

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/). Versionamento semântico.

## [0.1.0] — 2026-08-15

Primeira versão da skill de **documentação** da casa — a disciplina "documentar como parte da
entrega, não depois dela", destilada da `schematize-engineering` (DoD §35, archive §28, índice
§39, ADR §27) pra rodar solta e agnóstica de linguagem.

### Adicionado
- **SKILL.md** com 7 pisos inegociáveis (doc é parte do DoD, ADR pra toda decisão relevante,
  docs-as-code testada no CI, contrato/índice gerados do código, escrita clara e mínima, rastro
  durável no archive/índice com root limpo, índice/MAPA é fonte da verdade com gate) + mapa de
  references + relação com engineering/audit.
- **references/**:
  - `disciplina.md` — doc como parte do DoD, docs-as-code (no repo, revisada, versionada, TESTADA
    — link/exemplo/spec/índice que não quebram), README útil, escrita clara e mínima ("doc que
    ninguém lê é dívida"), o que documentar e o que NÃO, onde cada coisa mora.
  - `adr.md` — ADR pra toda decisão relevante, o ciclo `proposed → accepted/rejected` datado, a
    anatomia (contexto/decisão/alternativas/consequências), imutabilidade + supersede, e o ADR
    `proposed` órfão que a `schematize-audit` reabre.
  - `runbooks.md` — runbook operacional (o que fazer quando quebra), a anatomia (sintoma→
    diagnóstico→ação→verificação→rollback→escalar), quando existe, regras, e como testar (game day).
  - `api-versionamento.md` — OpenAPI 3.1/contrato gerado do código, drift check spec×implementação,
    SemVer da superfície pública, changelog (Keep a Changelog), breaking change com ADR.
  - `indice-diagramas.md` — o índice/MAPA (§39) (fonte da verdade, conta não resume, gate no
    merge), o archive (§28) (rastro durável, root limpo), diagramas C4/mermaid versionados como
    código — o rastro que a auditoria e o overdev consomem.
- **assets/commands/**: `/docs-help`, `/docs-adr`, `/docs-runbook`, `/docs-api`, `/docs-load`,
  `/docs-claude`, `/docs-cc`, `/docs-handoff`.
- **assets/CLAUDE.md** — regra sempre-on: doc é parte do DoD; ADR pra toda decisão relevante;
  docs-as-code testada; tudo durável no archive/índice com root limpo.
