---
description: schematize-docs — scaffolda/atualiza um runbook operacional (sintoma → diagnóstico → ação → verificação → rollback → escalar) para um serviço/incidente
argument-hint: "[serviço/sintoma, ex: checkout-latencia]"
---

Scaffolde ou atualize um **runbook** operacional — `references/runbooks.md`. O runbook é o manual
de emergência: **quando isto quebra, o que faço, nesta ordem, pra voltar — e como sei que voltou?**
Serviço crítico sem runbook não está pronto (DoD §35).

## 1. Confirme que precisa de runbook (§1)
Serviço crítico (dinheiro/auth/dados/derruba o produto), procedimento operacional recorrente
(deploy manual, rotação de segredo, migração em prod, failover, restore), ou incidente recorrente
que deve virar rotina. Se a resposta a "o que fazer se X cair?" mora só na cabeça de alguém, falta
runbook.

## 2. Escreva a entrada em `docs/runbook.md` (ou `/docs/runbook/${ARGUMENTS:-<serviço>}.md`)
Por sintoma/procedimento, os seis blocos (§2):
- **Sintoma / impacto** — o alerta que dispara, o efeito no negócio, links de dashboard/alerta.
- **Diagnóstico** — o que olhar, **em ordem**, com o comando exato.
- **Ação** — o que fazer por causa provável, **comando literal e copiável** (nome do deploy/host).
- **Verificação** — como sei que voltou (métrica < X por N min; smoke que passa fim-a-fim).
- **Rollback / saída segura** — se a ação piorou, como reverter; aviso antes de todo passo destrutivo.
- **Escalar** — quando e quem acionar (não resolveu em N min; suspeita de perda de dados).

## 3. Regras (§3)
Comando exato copiável; passo destrutivo idempotente/reversível com rollback ao lado; **segredo
nunca no runbook** (referencie o cofre/variável); **datado e validado** (quando foi exercitado por
último); linka o dashboard/alerta que dispara.

## 4. Teste e feche o loop (§4)
Runbook não exercitado é ficção: valide num game day/staging (os comandos existem e funcionam?),
teste os scripts referenciados no CI, e faça todo incidente **retroalimentar** o runbook (o
improviso que funcionou vira passo). Linke o runbook no README e no índice global (§39). Reporte o
caminho do arquivo e o que ficou pendente de validação.
