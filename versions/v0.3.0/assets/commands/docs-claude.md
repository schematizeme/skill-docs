---
description: schematize-docs — cria ou mescla o CLAUDE.md sempre-on de documentação na raiz do repo (não sobrescreve blocos de outras skills)
---

Instale/atualize a regra **sempre-on** de documentação da casa na raiz do repositório.

1. Pegue `assets/CLAUDE.md` da skill `schematize-docs` (projeto ou `~/.claude/skills/...`).
2. Se **não existe** `CLAUDE.md` na raiz: crie com esse conteúdo.
3. Se **já existe** (de outra skill — engineering/go/rust/web/audit/...): **mescle** — adicione a
   seção de Documentação **sem sobrescrever** os blocos das outras skills. Em repo multi-skill,
   cada CLAUDE convive; o piso da documentação é aditivo.
4. Se houver customização local, salve `./CLAUDE.md.bak` e reaplique por cima.
5. Confirme a versão aplicada e destaque o **piso**: doc é parte do DoD (mesmo PR); ADR pra toda
   decisão relevante (com desfecho datado); doc-as-code testada no CI; tudo durável no
   archive/índice com root limpo.
