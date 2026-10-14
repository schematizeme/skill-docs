---
description: Gera o handoff de contexto (context.md + checklist.md) no archive, SEM compactar
---

Gere o handoff do trabalho de documentação **sem** compactar — pra fim de sessão ou troca de tarefa:

1. `<projeto>_archive/context/<YYYY-MM-DD-HH-MM-SS>-context.md` — que doc está em andamento
   (README/ADR/runbook/OpenAPI/changelog/índice), decisões registradas e pendentes, ADRs em
   `proposed` a fechar, drift de spec detectado, diagramas por atualizar, onde parou.
2. `<projeto>_archive/context/<YYYY-MM-DD-HH-MM-SS>-checklist.md` — **FEITO vs EM ABERTO** (doc
   exigida pela DoD §35 já entregue vs faltante; índice §39 com contagem batendo ou não).

Não rode `/compact` — só arquiva.
