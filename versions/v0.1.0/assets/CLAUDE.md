# CLAUDE.md — Documentação da Casa (sempre on)

> Copie para a **raiz do repositório** e ajuste `<project>`. Fica pinado no contexto de toda
> tarefa e garante o piso mesmo quando a skill `schematize-docs` não dispara sozinha. Em repo
> multi-skill, use **junto** com os `CLAUDE.md` das skills de engenharia (rode `/docs-claude` que
> mescla, sem sobrescrever os outros blocos).

## Regra mestre

Documentação neste repo é **parte da entrega**, não um extra de fim de tarefa. A skill
`schematize-docs` rege como a doc fica boa e verdadeira: mora no repo, é revisada no PR, versionada,
**testada** e tem gate na Definition of Done (§35). Em conflito entre "documento depois" e este
piso, **o piso vence**. Consulte o reference antes de agir — não trabalhe de memória.

## Pisos inegociáveis (VETADO — sem exceção)

1. **Doc é parte da Definition of Done.** README/ADR/runbook/OpenAPI/índice, quando a mudança os
   exige, entram **no mesmo PR** que o código. Tarefa sem a doc que a DoD (§35) pede = tarefa
   **não pronta**, por mais verde que esteja o resto. "Documento depois" é "documento nunca".
2. **ADR pra toda decisão relevante.** Escolha de stack/banco/broker, padrão arquitetural, mudança
   de contrato público, desvio do padrão → **ADR versionado** em `docs/adr/`. Ciclo
   `proposed → accepted`/`rejected` com motivo **datado**. Um `proposed` que nunca fecha é **órfão
   RED** (a `schematize-audit` o reabre). Decisão "combinada" sem ADR não existe pro projeto.
3. **Docs-as-code: no repo, revisada, versionada, TESTADA.** A doc vive ao lado do código (não num
   wiki que deriva), passa no **mesmo review** e é **verificada no CI**: link que abre, exemplo que
   roda/compila, OpenAPI que valida e casa com a implementação, índice cuja contagem bate (§39).
   Link morto / exemplo quebrado / spec fora de sincronia = **bug** que reprova o gate.
4. **Contrato/índice gerados do código quando possível.** OpenAPI, tabela de rotas, índice de
   microfunções — **derivar** do código, não manter à mão em paralelo. Fonte da verdade é o código;
   onde não dá gerar, o CI checa o **drift**.
5. **Escrita clara e mínima — doc que ninguém lê é dívida.** Documente o que serve ao leitor
   concreto (o próximo dev, o oncall às 3h, o auditor): objetivo, como rodar/testar/deployar,
   decisão e porquê, o que fazer quando quebra. Corte o resto; deletar doc morta é manutenção.
6. **Rastro durável no archive/índice — root limpo.** Todo `.md` gerado mora em
   `<project>_archive/` (§28) ou no `docs/` versionado (ADR em `docs/adr/`, runbook em
   `docs/runbook*`, índice em `<project>_archive/index/` §39). O root fica limpo: só código, config
   e os poucos MDs de mão (`README`, `CLAUDE`, `LICENSE`, `CHANGELOG`). Largar plano/relatório/
   índice no root é violação (§37).
7. **Índice/MAPA é fonte da verdade e tem gate.** O índice (§39) **conta, não resume** e trava o
   merge quando desatualizado. Diagrama (C4/mermaid) é **versionado como código**, nunca PNG solto.

## Como se documenta aqui

- **Na mesma entrega:** a doc que a DoD (§35) exige entra no PR da mudança, não em backlog.
- **ADR (`/docs-adr`):** toda decisão relevante vira ADR com desfecho datado; `proposed` é
  temporário por definição.
- **Runbook (`/docs-runbook`):** serviço crítico tem runbook (sintoma→diagnóstico→ação→verificação
  →rollback→escalar), testado em game day, atualizado a cada incidente.
- **API (`/docs-api`):** OpenAPI gerada do código, drift check verde, SemVer + changelog
  (Keep a Changelog), breaking change com ADR.
- **Índice/diagramas:** índice §39 com contagem que bate; diagramas mermaid/C4 no texto,
  versionados.

## Relação com as outras skills

- **schematize-engineering** — a base: DoD (§35), archive (§28), índice/MAPA (§39), ADR (§27). Esta
  skill é o **como** esses artefatos ficam bons.
- **schematize-audit** — quem cobra: ADR `proposed` órfão, doc prometida ausente e índice com
  contagem errada são o que a auditoria reabre. Documentar bem é o que faz a auditoria passar.

## Gestão de contexto (sessões longas)

Ao se aproximar do teto de contexto: **PARE e** gere o handoff em `<project>_archive/context/`
(doc em andamento + FEITO vs EM ABERTO + ADRs a fechar) **antes** de compactar (`/docs-cc`).
