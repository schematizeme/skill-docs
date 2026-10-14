---
description: schematize-docs — carrega à força TODO o corpo normativo (disciplina, ADR, runbook, API/versionamento, índice/diagramas) e passa a aplicá-lo
---

Carregue **à força** e passe a aplicar **integralmente** os Padrões de Documentação da Casa (skill
`schematize-docs`) neste projeto. A partir de agora, nesta sessão, isto **não é opcional**.

1. **Leia agora, na íntegra, TODOS os references** — não trabalhe de memória. Caminho:
   `.claude/skills/schematize-docs/references/*.md` (projeto) ou
   `~/.claude/skills/schematize-docs/references/*.md` (global):
   - `disciplina.md` — doc como parte do **DoD (§35)**, **docs-as-code** (no repo, revisada,
     versionada, **testada** — link/exemplo/spec/índice que não quebram), README útil, escrita
     clara e mínima ("doc que ninguém lê é dívida"), o que documentar e o que NÃO.
   - `adr.md` — **ADR** pra toda decisão relevante, o ciclo `proposed → accepted/rejected` com
     motivo datado, a anatomia (contexto/decisão/alternativas/consequências), imutabilidade, e o
     ADR `proposed` órfão que a `schematize-audit` reabre.
   - `runbooks.md` — **runbook** operacional (o que fazer quando quebra), a anatomia
     (sintoma→diagnóstico→ação→verificação→rollback→escalar), quando existe, e como testar.
   - `api-versionamento.md` — **OpenAPI 3.1/contrato gerado do código**, drift check
     spec×implementação, **SemVer** da superfície pública, **changelog** (Keep a Changelog),
     breaking change com ADR.
   - `indice-diagramas.md` — o **índice/MAPA (§39)** (fonte da verdade, conta não resume, gate no
     merge), o **archive (§28)** (rastro durável, root limpo), e **diagramas** C4/mermaid
     versionados como código — o rastro que a auditoria e o overdev consomem.

2. **Confirme ao usuário** que leu (1 linha por arquivo).

3. Deste ponto, aplique como regra inegociável: **doc é parte do DoD** (entra no mesmo PR),
   **ADR pra toda decisão relevante** (com desfecho datado), **docs-as-code testada no CI** (doc
   quebrada reprova o gate), **contrato/índice gerados do código** quando possível, **escrita
   clara e mínima** (corte a doc que ninguém lê), e **tudo durável no archive/índice** com o root
   limpo (§28/§37).

4. **Atualize o `CLAUDE.md` da raiz** com `assets/CLAUDE.md` da skill (mescla se já houver de outra
   skill) — é o `/docs-claude`.
