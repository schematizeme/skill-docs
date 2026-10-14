# ADR — Architecture Decision Record: toda decisão relevante, versionada, com desfecho

> Uma decisão arquitetural sem registro é uma decisão que ninguém consegue defender daqui a seis
> meses — nem lembrar por que foi tomada. O **ADR** é o registro versionado da decisão: o que se
> decidiu, **por quê**, quais alternativas caíram e o que a decisão custa. A casa exige ADR pra
> **toda decisão relevante**, e o ADR tem um **ciclo com desfecho**: `proposed → accepted` ou
> `rejected`. Um ADR `proposed` que nunca fecha é **órfão RED** — a `schematize-audit` o pega.

O ADR não é burocracia; é a memória da arquitetura. Ele responde à pergunta que sempre volta —
"por que isto é assim?" — sem arqueologia de git nem "pergunta pro fulano que já saiu".

## 1. Quando criar um ADR (o gatilho)

Cria-se ADR pra **decisão estruturante** — a que é cara de reverter ou que amarra o resto:

- **Escolha de stack** — linguagem do rol (Go/Rust/Elixir/C#/Zig/Ruby) por **fit + ADR** (§27),
  banco, broker/fila, cache, provedor.
- **Padrão arquitetural** — CQRS, event sourcing, modular monolith (só com ADR de plano e prazo de
  extração), saga, outbox.
- **Mudança de contrato público** — nova versão de API, breaking change, formato de evento.
- **Fronteira** — novo bounded context, split/merge de serviço, leitura cross-service.
- **Qualquer desvio do padrão da casa** — exceto itens **VETADO** (esses não admitem exceção nem
  com ADR: segredo no cliente, SQL concatenado, auth no cliente).
- **Migração** — DDD/coexistência, saída de Node/PHP, quebra de monólito — cada uma com ADR e plano.

> Regra de bolso: se alguém daqui a um ano vai perguntar "por que fizeram assim?", **era ADR**. Se
> a decisão é trivial e reversível em minutos (nome de variável, ordem de campo), não é. Na dúvida
> sobre algo que amarra contrato ou stack: ADR. Decisão "combinada no chat" sem ADR **não existe**
> pro projeto — evaporou junto com o contexto.

## 2. O ciclo — proposed → accepted / rejected (com desfecho datado)

O ADR tem um `status` que **caminha até um desfecho**. Nunca fica parado:

| Status | Significado | Próximo passo |
|---|---|---|
| `proposed` | decisão proposta, em discussão | **precisa fechar**: virar `accepted` ou `rejected` |
| `accepted` | ratificada, está valendo | vira norma do projeto; supersede ADRs anteriores se for o caso |
| `rejected` | descartada, com motivo | fica no histórico — registra o "não" pra ninguém repropor sem saber |
| `superseded` | substituída por um ADR posterior | aponta pro ADR que a substituiu (`superseded by ADR-0012`) |
| `deprecated` | valeu, não vale mais | contexto mudou; registra desde quando |

> **O `proposed` é temporário por definição.** Um ADR `proposed` há dois meses é uma decisão que
> está valendo **por acidente** — ninguém ratificou, ninguém descartou, e o código já foi
> construído em cima dela. Isso é exatamente o **órfão RED do tipo `adr_proposed_orphan`** que a
> auditoria (`schematize-audit`) reabre. O desfecho é obrigatório e **datado**: `accepted` ou
> `rejected` com data e motivo. "Deixa proposed por ora" não é desfecho — é dívida.

O ciclo do ADR é o **mesmo ciclo** que a auditoria cobra: assim como um `- [ ]` aberto precisa
fechar com prova, um `proposed` precisa fechar com decisão. Documentar a decisão é o que faz o gate
da auditoria passar.

## 3. Anatomia de um ADR (formato mínimo)

Um ADR mora em `<projeto>/<projeto>_archive/decisoes/ADR-NNNN-<slug>.md` (`NNNN` sequencial de 4 dígitos, ex.: ADR-0007-fila-sqs-vs-nats.md) e
carrega:

```markdown
# ADR 0007 — Fila de repasse: SQS vs NATS

- **Status:** accepted            <!-- proposed | accepted | rejected | superseded | deprecated -->
- **Data:** 2026-08-15
- **Autor(es):** lucas
- **Supersede:** —                <!-- ou "ADR 0003" -->

## Contexto
O que força a decisão agora: o problema, as restrições (SLA, custo, time, stack), o que já existe.
Fatos, não opinião. Por que decidir isto **agora** e não depois.

## Decisão
O que se decidiu, em uma frase afirmativa: "Vamos usar NATS JetStream para a fila de repasse."
O suficiente pra alguém aplicar sem reabrir a discussão.

## Alternativas consideradas
- **SQS** — prós/contras, por que caiu (custo por msg no volume esperado, lock-in).
- **NATS JetStream** — prós/contras, por que ganhou.
- **Kafka** — por que foi descartada (peso operacional pro estágio).
Cada alternativa com o motivo real da queda — o "não" documentado vale tanto quanto o "sim".

## Consequências
O que muda por causa desta decisão: o que fica mais fácil, o que fica mais difícil, que dívida
nova nasce, o que precisa de runbook/observabilidade novo. Inclui o custo de reverter.
```

> O coração do ADR é o **porquê** e as **alternativas** — não o "o quê" (isso o código mostra). Um
> ADR que só diz "usamos NATS" sem o contexto e o que caiu não serve: daqui a um ano alguém
> reabre a mesma discussão do zero. O valor está em registrar **por que não** as outras opções.

## 4. ADR é imutável; decisão nova é ADR novo

ADR aceito **não se reescreve** — ele é um registro histórico datado. Mudou de ideia? Cria-se um
**novo ADR** que **supersede** o anterior (`superseded by ADR-0012`), e o antigo passa a
`superseded` apontando pro novo. Assim a linha do tempo das decisões fica íntegra: dá pra ver **o
que se pensava quando**, não só o estado final. Editar um ADR aceito pra "corrigir" apaga a memória
— é o oposto do propósito.

## 5. Onde o ADR mora e como se liga ao resto

- **Local:** `<projeto>/<projeto>_archive/decisoes/`, versionado no repo do archive (que é repo
  git próprio e privado — `schematize-archive`, `references/archive.md`). O índice global (§39,
  `indice-diagramas.md`) linka os ADRs relevantes de cada serviço.

> **Caminho único de ADR da casa:** `<projeto>/<projeto>_archive/decisoes/`. É onde o `/docs-adr` grava, onde a `/archive-todos` procura e onde a `/audit-run` audita — o mesmo lugar nos três. Antes de 2026-08-21 havia **quatro** caminhos concorrentes (`/docs/adr/`, `docs/adr/`, `_archive/decisoes/`, `archive/adr/`), o que tornava o piso *"ADR `proposed` é órfão RED"* inexequível por construção (achado B2b).

- **Na DoD (§35):** decisão estruturante sem ADR = tarefa não pronta. O ADR entra no **mesmo PR**
  da mudança que ele justifica.
- **Na auditoria:** a `schematize-audit` enumera os ADRs `proposed` e trava o veredito enquanto
  houver um sem desfecho. Fechar o ciclo (`accepted`/`rejected` datado) é o que sana o órfão.
- **Com a engenharia:** a `schematize-engineering` define, em `references/operacao.md` §27 (*"ADR — Architecture Decision Records"*),
  **quando** a arquitetura exige ADR; este reference define **como** o ADR fica bom.
