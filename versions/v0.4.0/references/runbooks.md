# Runbook operacional — o que fazer quando quebra

> Às 3h da manhã, com o serviço caído, ninguém lê a arquitetura: lê o **runbook**. O runbook é a
> doc operacional que transforma "o serviço está down e só o fulano sabe consertar" em "qualquer
> oncall segue os passos e recupera". Ele responde a uma pergunta prática: **quando isto quebra,
> o que eu faço, nesta ordem, pra voltar ao normal — e como sei que voltou?**

Runbook não é a doc de arquitetura (o *como funciona*) nem o ADR (o *por que é assim*). É o **manual
de emergência e operação**: sintomas concretos, comandos exatos, critério de sucesso e a saída
segura (rollback, escalar). Serviço crítico **sem** runbook é serviço que depende de heroísmo — e
heroísmo não escala nem dorme.

## 1. Quando um runbook precisa existir

- **Serviço crítico** (caminho de dinheiro, auth/IAM, dados, o que derruba o produto se cair) —
  runbook **obrigatório** em `docs/runbook.md` ou `/docs/runbook/`.
- **Procedimento operacional recorrente** — deploy manual, rotação de segredo, migração de schema
  em produção, failover, restore de backup, expurgo de dados.
- **Incidente que já aconteceu** — todo incidente recorrente **atualiza** o runbook (o post-mortem
  vira passo de runbook pra da próxima vez ser rotina, não descoberta).

> Regra: se a resposta a "o que fazer se X cair?" mora só na cabeça de uma pessoa, **falta
> runbook**. O runbook é o que permite o oncall agir sem acordar quem escreveu o serviço.

## 2. Anatomia de um runbook (por procedimento/sintoma)

Cada entrada de runbook é uma receita executável, na ordem em que se executa:

```markdown
## Sintoma: latência de /checkout > 2s (alerta P1)

- **Impacto:** clientes não conseguem finalizar compra; perda de receita direta.
- **Dashboards/alertas:** [link Grafana checkout], alerta `checkout_p99_high`.

### 1. Diagnóstico (o que olhar, em ordem)
- Verifique a fila de repasse: `nats stream info REPASSE` — backlog crescendo?
- Verifique o banco: conexões saturadas? `SELECT count(*) FROM pg_stat_activity`.
- Verifique o dependente `payments`: [link health] responde 200?

### 2. Ação (o que fazer, por causa provável)
- **Se backlog de fila:** escalar consumers → `kubectl scale deploy repasse-consumer --replicas=6`.
- **Se pool de conexão saturado:** reciclar → `kubectl rollout restart deploy checkout`.
- **Se `payments` down:** ativar circuit-breaker (flag `payments_degraded=true`) e escalar (§4).

### 3. Verificação (como sei que voltou)
- `checkout_p99` < 800ms por 5 min no dashboard; alerta `checkout_p99_high` resolvido.
- Um pedido de teste passa fim-a-fim (script `scripts/smoke-checkout.sh`).

### 4. Rollback / saída segura
- Se a ação piorou: `kubectl rollout undo deploy checkout` volta à versão anterior.
- Reverter a flag `payments_degraded` quando `payments` estabilizar.

### 5. Escalar
- Não resolveu em 15 min → acionar oncall de plataforma (@time-plataforma no PagerDuty).
- Perda de dados suspeita → acionar DRI de dados **antes** de qualquer ação destrutiva.
```

Os seis blocos — **sintoma/impacto → diagnóstico → ação → verificação → rollback → escalar** — são
o esqueleto. Um runbook sem "como sei que voltou" (verificação) e sem "e se piorar" (rollback) é
meio runbook: manda agir sem fechar o loop.

## 3. Regras de um bom runbook

- **Comando exato, copiável.** Não "reinicie o serviço" — o comando literal, com o nome do
  deploy/host. Sob incidente ninguém traduz instrução vaga.
- **Ação idempotente e reversível quando possível.** Todo passo destrutivo (restore, expurgo,
  migração) carrega o rollback ao lado e um aviso explícito antes.
- **Segredo nunca no runbook.** Referencie o cofre/variável (`$DATABASE_URL` do secret manager),
  nunca o valor. Runbook é versionado no git — colar credencial é vazar.
- **Datado e validado.** Cada runbook diz **quando foi validado por último**. Comando que mudou
  (nome de deploy, flag renomeada) e ninguém atualizou é uma armadilha sob pressão.
- **Linka o dashboard/alerta.** O runbook parte do alerta que dispara e aponta o painel onde se
  confirma — não descreve gráficos de memória.

## 4. Testar o runbook (ele também é doc-as-code)

Runbook que nunca foi exercitado é ficção. A casa testa runbook como testa doc:

- **Game day / ensaio:** roda o procedimento num ambiente controlado (staging, ou produção sob
  janela) — os comandos existem? funcionam? o passo de verificação realmente confirma?
- **Comando verificável no CI quando dá:** scripts referenciados (`smoke-checkout.sh`) são testados;
  links de dashboard passam pelo link-checker (`disciplina.md` §2).
- **Post-mortem retroalimenta:** todo incidente vira/atualiza runbook. Se o oncall teve que
  improvisar, o improviso que funcionou **vira passo**; o que faltou vira lacuna anotada.

> Um runbook envelhece silenciosamente — a infra muda, os comandos derivam. Por isso ele é datado,
> validado periodicamente e atualizado a cada incidente. Runbook desatualizado sob incidente é
> pior que ausência: dá falsa confiança e faz o oncall perder tempo num caminho morto.

## 5. Onde mora e como se liga

- **Local:** `docs/runbook.md` (ou `/docs/runbook/<serviço>.md`), versionado no repo, linkado pelo
  README (`disciplina.md` §3) e pelo índice global (§39, `indice-diagramas.md`).
- **Observabilidade:** o runbook é a ponte entre o **alerta** (que a `schematize-engineering`
  §observabilidade define) e a **ação**. Alerta sem runbook é barulho; runbook sem alerta é manual
  que ninguém abre na hora certa.
- **DoD (§35):** serviço crítico entregue **sem** runbook não está pronto. O runbook entra com o
  serviço, não "depois que estabilizar".
