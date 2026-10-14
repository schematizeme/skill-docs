# Documentação como disciplina — docs-as-code, parte do DoD, clara e mínima

> A casa **documenta como parte da entrega**, não depois dela. Documentação não é um `.md`
> largado no fim pra "cobrir": é artefato de engenharia — mora no repo, passa no review, é
> versionado, é **testado** e tem gate na Definition of Done (§35). Este reference é o piso da
> disciplina: por que a doc entra na DoD, o que "docs-as-code" exige, como é um README/doc útil, e
> a regra de ouro da escrita — **doc que ninguém lê é dívida, não patrimônio.**

Documentação erra por dois lados, e os dois são bug: **ausência** (a decisão que ninguém registrou,
o runbook que não existe quando o serviço cai) e **mentira** (o README que descreve a versão de
dois anos atrás, o exemplo que não roda, o ADR proposed eterno). A disciplina ataca os dois: doc
obrigatória onde a DoD pede, e doc **testada** pra não derivar.

## 1. Doc é parte da Definition of Done (§35), não um extra

A DoD da casa lista a doc como item **bloqueante**, não como "nice to have":

- **Documentação atualizada** (README, ADR, runbook se aplicável) — no **mesmo PR** da mudança.
- **OpenAPI atualizada** se for API (`api-versionamento.md`).
- **Índice de funcionalidades atualizado** — global e microfunções (§39, `indice-diagramas.md`).
- **Archive de chat/task gerado e commitado** (§28) — gate rígido.

> Tarefa cujo código está verde mas cuja doc exigida não veio **não está pronta**. "Documento
> depois" é "documento nunca": a doc separada em backlog não é priorizada, o contexto evapora, e
> seis meses depois ninguém sabe por que aquela fila é NATS e não SQS. A doc que se escreve **junto**
> é barata (o contexto está na cabeça); a que se escreve depois é cara ou falsa.

O que NÃO precisa de doc formal: refactor puro que não muda comportamento nem contrato (o diff é a
doc), rename local, ajuste cosmético. A regra é proporcional ao impacto — decisão/contrato/operação
documenta; mexida interna sem efeito externo não gera papel por gerar.

## 2. Docs-as-code — no repo, revisada, versionada, TESTADA

"Docs-as-code" é a doc tratada com o mesmo rigor do código. Quatro exigências:

1. **No repo, ao lado do que documenta.** ADR em `<projeto>_archive/decisoes/` (caminho único da casa), runbook em `docs/runbook*`, README
   na raiz do módulo, OpenAPI versionada, índice em `<projeto>_archive/index/` (§39). **Não** num
   wiki externo que ninguém atualiza no PR e que deriva no primeiro dia. A doc que não está no diff
   não é revisada e apodrece.
2. **Revisada no mesmo review.** A doc entra no PR e o reviewer a lê como lê o código: está
   correta? está clara? o exemplo bate? PR de feature sem a doc que a DoD pede **não passa** (item
   de §35). Doc não é opcional no review — é linha do checklist.
3. **Versionada.** A doc muda junto com o código, na mesma commit/PR, com o mesmo histórico. `git
   blame` na doc responde "por que isso mudou" tanto quanto no código. Changelog e SemVer
   (`api-versionamento.md`) versionam a superfície pública.
4. **Testada no CI.** É o que separa docs-as-code de "markdown no git" — e desde 2026-08-21 isto
   **roda**: `scripts/docs-gate.mjs` (comando `/docs-review`), `0` passa · `1` reprova · `2` nada
   verificável, que não é aprovação. Os sete gates (exemplos/snippets que rodam são disciplina de review, sem script):
   - **Links** — link interno/externo que abre (link-checker no CI); link morto reprova.
   - **Exemplos/snippets** — o código de exemplo **compila/roda** (doctest, exemplo executável, ou
     snippet extraído e testado). Exemplo que não roda é pior que nenhum: engana com autoridade.
   - **OpenAPI/contrato** — valida contra o schema **e** contra a implementação (drift check,
     `api-versionamento.md`).
   - **Índice (§39)** — a contagem bate (`nº de entradas == nº de funções`); CI reprova se não.
   - **Root limpo** (§5 deste arquivo) — `.md` **gerado** na raiz reprova.
   - **ADR** — `proposed` sem data ou mais velho que `--adr-dias` (default 30) reprova.
   - **Diagrama** — imagem de diagrama em `docs/`/`*_archive/` sem fonte `.mmd`/mermaid reprova.

   Duas decisões do gate que valem ser ditas: no **openapi**, ele usa **Spectral** quando existe e,
   quando não existe, roda um **piso embutido** que **declara ser piso** (menos regras, não
   substitui o lint); no **drift**, comparação **inconclusiva** — nenhuma rota reconhecida no
   código — **reprova**, porque passar ali seria o gate mais perigoso do conjunto: ele diria "spec
   em dia" justamente quando não conseguiu olhar.

> Link morto, exemplo quebrado, spec fora de sincronia e índice defasado são **bugs de
> documentação** — reprovam o gate igual a um teste vermelho. Doc não é "melhor esforço": é
> verificável, e o que é verificável a casa verifica.

## 3. README útil — o que é, como rodar, como testar, como deployar

O README mínimo da casa responde, sem enrolação, ao dev que chega no repo hoje:

- **O que é** — o propósito do serviço/módulo em 1-3 linhas (não o slogan; a função).
- **Como rodar** — o comando pra subir local, dependências, variáveis de ambiente (nomes, não
  valores — segredo nunca no README).
- **Como testar** — o comando da suíte, como rodar um teste só, o que o CI checa.
- **Como deployar** — o fluxo (ou link pro runbook/ops), ambientes.
- **Observabilidade / oncall / runbook** — onde estão os dashboards, quem é o oncall, link pro
  runbook (`runbooks.md`).
- **Dependências / contratos** — quem este serviço chama e quem o chama (link pro índice §39).

> README não é folder de marketing nem tese. É o **manual de operação** pra quem vai mexer. Se o
> README não deixa alguém rodar e testar o projeto sem perguntar no chat, ele falhou. Um README de
> um parágrafo genérico ("Este é o serviço X") é decorativo — vale menos que sua ausência, porque
> finge que a doc existe.

## 4. Escrita clara e mínima — doc que ninguém lê é dívida

A doc é escrita **pra um leitor concreto num momento concreto**: o próximo dev que vai estender, o
oncall às 3h com o serviço caído, o auditor que pergunta "por que essa decisão". Escreva pra ele:

- **Mínima.** Documente o que **serve**; corte o resto. Doc longa não é doc completa — é doc que
  ninguém termina de ler. Uma linha certa vale um parágrafo hedge.
- **Clara.** Frase direta, voz ativa, o **porquê** antes do **como** quando a decisão não é óbvia.
  Termo da casa consistente (não três nomes pro mesmo conceito).
- **Datada e rastreável.** Decisão tem data e autor (o ADR faz isso); runbook diz quando foi
  validado por último. Doc sem data envelhece sem avisar.
- **Deletável.** Doc que descreve o que não existe mais **se apaga** — deletar doc morta é
  manutenção, não perda. Doc obsoleta que fica é uma armadilha: alguém vai confiar nela.

> Regra de ouro: **doc que ninguém lê é dívida, não patrimônio.** Antes de escrever uma seção,
> pergunte "quem lê isto, e quando?". Se a resposta é "ninguém", não escreva — e se já existe,
> apague. A meta não é *muita* doc; é a doc **certa**, curta, verdadeira e testada.

## 5. Onde cada coisa mora (root limpo)

| Artefato | Onde |
|---|---|
| README | raiz do repo/módulo (mão) |
| ADR | `<projeto>_archive/decisoes/ADR-NNNN-<slug>.md` (versionado) — `adr.md` |
| Runbook | `docs/runbook*.md` ou `/docs/runbook/` — `runbooks.md` |
| OpenAPI/contrato | versionado (`openapi.yaml`/gerado) — `api-versionamento.md` |
| Changelog | `CHANGELOG.md` na raiz (Keep a Changelog) — `api-versionamento.md` |
| Diagramas | `docs/` como código (mermaid/C4 textual) — `indice-diagramas.md` |
| Índice/MAPA (§39) | `<projeto>_archive/index/` — `indice-diagramas.md` |
| Plano/relatório/handoff/scan/auditoria | `<projeto>_archive/**` (§28) |

O **root fica limpo**: só código, config e os poucos MDs de mão — `README`, `CLAUDE`, `SKILL`, `LICENSE`, `CHANGELOG`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `AGENTS`, `CONTEXT`. *(A fonte da allowlist é o gate `scripts/docs-gate.mjs --so root`; esta lista a espelha. `CHANGELOG` entra porque a própria casa normatiza Keep a Changelog **na raiz**; ADR **não** entra — mora em `<projeto>_archive/decisoes/`.)*
Largar MAPA/índice/plano/relatório no root é violação (§37) e fere a contenção de workspace. Antes
de gravar qualquer `.md`, o caminho começa com `<projeto>_archive/` ou `docs/` — nunca solto no
root.
