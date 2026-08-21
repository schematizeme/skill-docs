---
description: schematize-docs — lista todos os comandos disponíveis e o que cada um faz
---

Liste os comandos do **schematize-docs** instalados (`/docs-*`), com 1 linha cada:

- `/docs-help` — esta lista.
- `/docs-adr` — cria ou movimenta um **ADR** (`proposed -> accepted/rejected`) em `<projeto>_archive/decisoes/`, com contexto/decisão/alternativas/consequências; nunca deixa um `proposed` órfão.
- `/docs-runbook` — scaffolda/atualiza um **runbook** operacional (sintoma → diagnóstico → ação → verificação → rollback → escalar) pra um serviço/incidente.
- `/docs-review` — **o comando que exercita a tese "doc é TESTADA"**: roda os 5 gates (links, OpenAPI, drift, índice §39, root limpo) e depois lê o que a máquina não lê.
- `/docs-api` — gera/valida a **API doc** (OpenAPI 3.1/contrato) a partir do código quando possível; checa o **drift** entre spec e implementação; cuida do changelog + SemVer.
- `/docs-load` — carrega à força TODO o corpo normativo (disciplina, ADR, runbook, API/versionamento, índice/diagramas) e passa a aplicá-lo.
- `/docs-claude` — cria ou mescla o `CLAUDE.md` sempre-on de documentação na raiz do repo.
- `/docs-cc` — context compact: gera handoff no archive e roda `/compact`.
- `/docs-handoff` — gera o handoff (context.md + checklist.md) sem compactar.

Depois da lista, lembre a **regra de ouro**: *documentação é parte da Definition of Done, não um
extra de fim de tarefa.* Doc mora no repo, é revisada no PR, versionada e **testada** (link que
abre, exemplo que roda, spec que casa); toda decisão relevante vira **ADR** com desfecho datado
(`proposed` eterno é órfão RED que a `schematize-audit` pega); e **doc que ninguém lê é dívida** —
corte o que não serve. Detalhe normativo em `references/` da skill `schematize-docs`; a base
(DoD §35, archive §28, índice §39, ADR §27) é a `schematize-engineering`; quem cobra o rastro é a
`schematize-audit`.
