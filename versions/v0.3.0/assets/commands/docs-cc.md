---
description: Context Compact — gera handoff (context.md + checklist.md) no <projeto>_archive e compacta
---

Antes de compactar, **arquive o handoff** (não perca o estado do trabalho de documentação):

1. `<projeto>_archive/context/<YYYY-MM-DD-HH-MM-SS>-context.md` — estado: que doc está em
   andamento (README/ADR/runbook/OpenAPI/índice), decisões registradas e ainda por registrar,
   ADRs em `proposed` abertos, drift de spec pendente, onde parou.
2. `<projeto>_archive/context/<YYYY-MM-DD-HH-MM-SS>-checklist.md` — **FEITO vs EM ABERTO** (doc
   exigida pela DoD já entregue vs faltante; ADRs a fechar; índice a atualizar).
3. Só então rode `/compact` (foco na tarefa corrente).
