---
description: schematize-docs — revisa a documentação como se revisa código: roda os 5 gates (links, OpenAPI, drift, índice §39, root limpo) e lê o que a máquina não lê (o exemplo bate? a doc mente?)
argument-hint: "[diretório ou PR]"
---

# /docs-review — a doc é TESTADA, e alguém a lê

Esta skill só tinha **comandos criadores** (`/docs-adr`, `/docs-api`, `/docs-runbook`): faltava o
único que exercita a tese *"doc é testada"* — achado da vistoria de 2026-08-21. É este.

## 1. Rode os gates

```bash
node .claude/skills/schematize-docs/scripts/docs-gate.mjs .
# ou um por vez: --so links | openapi | drift | indice | root
```

`0` passa · `1` **reprova** · `2` **nada verificável** — que não é aprovação.

| Gate | Reprova quando |
|---|---|
| **links** | link relativo que não abre · âncora `#secao` que não existe (no arquivo ou no destino). Link dentro de bloco de código é exemplo, não link — não conta |
| **openapi** | usa **Spectral** se estiver disponível; senão roda o **piso embutido** e diz que é piso. Sem `operationId` · `operationId` repetido · sem `summary` · **só o caminho feliz** (nenhum 4xx/5xx) · resposta sem `description` · Swagger 2.0 · spec sem nenhum path |
| **drift** | rota no código **fora** da spec (quem integra não sabe que ela existe) · caminho na spec **sem** rota no código (spec que promete o que não existe) · **comparação inconclusiva** — nenhuma rota reconhecida: inconclusivo não é "sem drift" |
| **indice** | a contagem do `INDEX_FUNCTIONS.md` não bate com as funções do código (§39) |
| **root** | `.md` **gerado** solto na raiz — artefato gerado mora em `<projeto>_archive/` ou `docs/`; a raiz só tem os MDs de mão |

## 2. Leia o que a máquina não lê

O gate prova que o link abre; **não** prova que a frase é verdadeira. Na revisão, com a mesma régua
do review de código:

- **O exemplo bate com o código de hoje?** Rode-o. Exemplo que não roda é **pior que nenhum**:
  engana com autoridade.
- **A doc mente por omissão?** O passo que "todo mundo sabe" é justamente o que trava quem chega.
- **O README responde às quatro perguntas** — o que é, como rodar, como testar, como deployar?
- **O runbook é executável sob pressão**, às 3h da manhã, por quem não escreveu o sistema?
- **O ADR registra a decisão e o que foi descartado**, ou virou ata de reunião?
- **Sobrou doc morta?** Doc que descreve o que não existe mais é dívida ativa — apague.

## 3. No PR

Doc entra no mesmo PR do código e é revisada no mesmo review (`references/disciplina.md` §2). PR de
feature sem a doc que a DoD pede **não passa**. Os gates entram no CI e travam o merge.

## Prova do próprio gate

`bash .claude/skills/schematize-docs/scripts/docs-gate.test.sh` — 18 casos, 16 vermelhos de
propósito, contra repos de fixture com um defeito cada.
