# Changelog — schematize-docs

Todas as mudanças relevantes deste pacote, no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
com versionamento [SemVer](https://semver.org/lang/pt-BR/).


## [0.4.0] — 2026-10-14

### Corrigido
- Nome do ADR unificado em `ADR-NNNN-<slug>.md` (`docs-adr.md`, `adr.md`, `disciplina.md`), o padrão que o `check-archive.sh` da `schematize-archive` cobra; antes mandava `<n>-<slug>.md` e o ADR nascia fora do padrão.
- Tabela de `indice-diagramas.md` punha ADR/runbook/OpenAPI em `docs/`/raiz; agora cada um tem um caminho só (ADR em `decisoes/`, runbook em `docs/runbook*`, OpenAPI na raiz ou `docs/`).
- Texto da allowlist do root passa a listar exatamente a do gate (inclui SKILL, AGENTS, CONTEXT, CODE_OF_CONDUCT): a fonte é o código, não a prosa.
- Description reduzida a <=350 caracteres; promessa de "exemplo que roda" e "runbook testado" rebaixada para o que é verificado em review/game day.

### Adicionado
- Gate `adr` no `docs-gate.mjs`: ADR `proposed` sem data ou mais velho que `--adr-dias` (default 30) reprova. Cumpre a promessa de "nunca `proposed` órfão".
- Gate `diagrama`: imagem de diagrama em `docs/`/`*_archive/` sem fonte `.mmd`/mermaid reprova. Cumpre "Mermaid, nunca imagem opaca".
- 5 casos novos (2 verdes, 3 vermelhos plantados) em `docs-gate.test.sh`: 23 no total.

## [0.3.0] — 2026-08-21

### Corrigido
- **A allowlist do root era diferente em quatro lugares** — dois **com** `CHANGELOG` e dois **sem** —, numa skill cujo piso 6 é *root limpo*. Agora é uma só (**README, CLAUDE, LICENSE, CHANGELOG, CONTRIBUTING, SECURITY**), com o critério escrito (`CHANGELOG` entra porque a casa normatiza Keep a Changelog **na raiz**; **ADR não entra** — mora em `<projeto>_archive/decisoes/`) e, principalmente, **em código**: o gate `scripts/docs-gate.mjs --so root` usa a mesma lista, com o comentário apontando a fonte.

## [0.2.0] — 2026-08-21
A skill que prega *"doc é TESTADA"* prometia **5 gates** e entregava **zero scripts**; e só tinha **comandos criadores** — faltava justamente o que exercita a tese (vistoria de 2026-08-21).

### Adicionado
- **`scripts/docs-gate.mjs`** — os cinco gates, num comando: **links** (relativo que não abre, âncora que não existe no arquivo ou no destino; link dentro de bloco de código é exemplo, não link), **openapi** (usa **Spectral** quando disponível e, quando não, roda um **piso embutido que declara ser piso**: sem `operationId`, id repetido, sem `summary`, **só o caminho feliz**, resposta sem `description`, Swagger 2.0, spec sem path), **drift** (rota no código fora da spec · caminho na spec sem rota no código · **inconclusivo reprova**), **indice** (§39, a contagem bate) e **root** (`.md` gerado solto na raiz).
- **`scripts/lib-yaml-minimo.mjs`** — leitor de YAML mínimo para o gate rodar em CI **sem `npm install`**. Ele **declara o alcance** em vez de fingir: devolve avisos para a linha que não entendeu, porque gate que lê errado é pior que gate ausente.
- **`/docs-review`** — o comando que faltava: roda os gates **e** lista o que a máquina não lê (o exemplo roda? a doc mente por omissão? o runbook é executável às 3h da manhã? o ADR registra o que foi descartado? sobrou doc morta?).
- **`scripts/docs-gate.test.sh`** — **18 casos**, 16 vermelhos, contra repos de fixture com um defeito cada.

### Decisões que valem registro
- **Inconclusivo reprova** no drift: passar quando nenhuma rota foi reconhecida seria o gate mais perigoso do conjunto — diria "spec em dia" justamente quando não conseguiu olhar.
- **`2` = nada verificável**, nunca `0`: ausência de material não é aprovação.

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
