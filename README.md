# schematize-docs

> **Documentação da casa** como disciplina — documentar é **parte da entrega**, não um extra de
> fim de tarefa. Rege docs-as-code (a doc mora no repo, é revisada no PR, versionada e **testada** —
> link que abre, exemplo que roda, spec que casa), **ADRs** (toda decisão relevante versionada no
> ciclo `proposed → accepted/rejected`), READMEs úteis, **runbooks** operacionais, **API docs**
> (OpenAPI gerada do código), changelog + SemVer, diagramas C4/mermaid, e o **índice/archive** que
> a auditoria e o overdev consomem. Regra de ouro: **doc que ninguém lê é dívida**, não patrimônio.

Pacote de **skill normativa para [Claude Code](https://claude.com/claude-code)**.
Parte do catálogo **schematize skills**. Disciplina **agnóstica de linguagem** que pareia com a
`schematize-engineering` (a base: DoD §35, archive §28, índice §39, ADR §27) e com a
`schematize-audit` (que cobra o rastro: ADR `proposed` órfão, doc prometida ausente, índice com
contagem errada).

## Instalar

### Pelo app schematize (recomendado)

```bash
schematize install docs      # requer o CLI schematize instalado
```

### Última versão (a partir de um clone)

```bash
git clone https://github.com/schematizeme/skill-docs.git
cd skill-docs && ./install.sh            # instala no projeto atual
# ./install.sh /caminho/do/projeto         # ou aponte para outro projeto
```

Ou baixe o `.zip` da última release e descompacte em `.claude/skills/`:

```bash
curl -L -o skill-docs.zip \
  https://github.com/schematizeme/skill-docs/releases/latest/download/skill-docs.zip
unzip skill-docs.zip -d .claude/skills/
```

## O que tem dentro

- **SKILL.md** — o contrato: 7 pisos inegociáveis (doc é parte do DoD, ADR pra toda decisão
  relevante, docs-as-code testada no CI, contrato/índice gerados do código, escrita clara e
  mínima, rastro durável no archive/índice com root limpo, índice é fonte da verdade com gate) +
  mapa de references.
- **references/** — `disciplina` (doc como DoD + docs-as-code + README + escrita mínima), `adr`
  (o ciclo proposed→accepted/rejected + anatomia), `runbooks` (o que fazer quando quebra),
  `api-versionamento` (OpenAPI do código + drift + SemVer + changelog), `indice-diagramas`
  (índice §39 + archive §28 + C4/mermaid).
- **assets/commands/** — `/docs-help`, `/docs-adr`, `/docs-runbook`, `/docs-api`, `/docs-load`,
  `/docs-claude`, `/docs-cc`, `/docs-handoff`.
- **assets/CLAUDE.md** — regra sempre-on: doc é parte do DoD; ADR pra toda decisão relevante.

## Regra de ouro

**Documentação é parte da Definition of Done, não um extra.** Doc mora no repo, é revisada no PR,
versionada e **testada**; toda decisão relevante vira **ADR** com desfecho datado (`proposed`
eterno é órfão RED); e **doc que ninguém lê é dívida** — corte o que não serve. Documentar bem é o
que faz a auditoria (`schematize-audit`) passar.

## Relação com as outras skills

- **schematize-engineering** — a base. Esta skill opera a camada de documentação que a engenharia
  normatiza: DoD (§35), archive (§28), índice/MAPA (§39) e ADR (§27). A engenharia diz *que* tem
  que documentar; esta skill diz *como* fica bom.
- **schematize-audit** — quem cobra. A auditoria lê o rastro que esta skill produz e reabre o que
  não é verdade: ADR `proposed` órfão, doc ausente, índice cuja contagem não bate.

## Co-autoria / patrocínio

Co-autoria / patrocínio: Lucassa — https://lucassa.me

MIT.
