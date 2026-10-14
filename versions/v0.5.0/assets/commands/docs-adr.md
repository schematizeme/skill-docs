---
description: schematize-docs — cria ou movimenta um ADR (proposed → accepted/rejected) em <projeto>_archive/decisoes/, com contexto/decisão/alternativas/consequências; nunca deixa um proposed órfão
argument-hint: "[título/slug da decisão, ex: fila-sqs-vs-nats]"
---

Registre ou movimente um **ADR** (Architecture Decision Record) — `references/adr.md`. Toda
decisão relevante vira ADR versionado; o ciclo é `proposed → accepted` **ou** `rejected`, com
motivo **datado**. Nunca deixe um `proposed` órfão (a `schematize-audit` o pega como órfão RED).

## 1. Decida se é ADR (o gatilho — §1)
É ADR se amarra stack/contrato/arquitetura ou desvia do padrão da casa: escolha de banco/broker/
linguagem (fit + ADR), padrão arquitetural (CQRS, modular monolith só com plano de extração),
mudança de contrato público, nova fronteira/bounded context, migração. **Não** é ADR pra decisão
trivial e reversível em minutos. Regra: se daqui a um ano alguém pergunta "por que assim?", é ADR.

## 2. Crie o arquivo `<projeto>/<projeto>_archive/decisoes/ADR-NNNN-${ARGUMENTS:-<slug>}.md`
`NNNN` sequencial com 4 dígitos (ex.: ADR-0007-fila-sqs-vs-nats.md; padrão checado pelo `check-archive.sh` da `schematize-archive`; próximo número livre (em `<projeto>_archive/decisoes/` — **caminho único da casa**: é lá que a `/archive-todos` procura e a `/audit-run` audita). Estrutura (§3):
- **Status:** `proposed` (ou o desfecho, se já decidido) · **Data** · **Autor(es)** · **Supersede**
- **Contexto** — o que força a decisão agora (fatos/restrições, não opinião).
- **Decisão** — em uma frase afirmativa, aplicável sem reabrir a discussão.
- **Alternativas consideradas** — cada uma com o **motivo real da queda** (o "não" documentado
  vale tanto quanto o "sim").
- **Consequências** — o que fica mais fácil/difícil, que dívida nasce, custo de reverter, o que
  precisa de runbook/observabilidade novo.

## 3. Movimente o status até o desfecho (§2)
- `proposed` é **temporário** — precisa virar `accepted` ou `rejected`, **datado**.
- Mudou de ideia depois de `accepted`? **Não reescreva** — crie um ADR novo que **supersede** o
  anterior (`superseded by ADR-<m>`), e marque o antigo `superseded`. O histórico é imutável.

## 4. Feche o loop
- ADR entra no **mesmo PR** da mudança que ele justifica (DoD §35).
- Se havia um `proposed` pendente sobre este tema, **resolva-o agora** (accepted/rejected) — não
  acumule proposed. Reporte o número do ADR, o status final e o motivo datado.
