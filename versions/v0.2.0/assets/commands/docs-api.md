---
description: schematize-docs — gera/valida a API doc (OpenAPI 3.1/contrato) a partir do código quando possível, checa o drift entre spec e implementação, e cuida do changelog + SemVer
argument-hint: "[serviço/API, ex: checkout]"
---

Gere ou valide a **documentação de API** — `references/api-versionamento.md`. O piso: **contrato
gerado do código** (pra não derivar), **testado** contra a implementação, e a superfície pública
versionada com **SemVer** + **changelog**.

## 1. Gere/derive a spec do código (§1)
Prefira **derivar** a OpenAPI 3.1 (ou protobuf/GraphQL SDL/AsyncAPI) das anotações/tipos/handlers,
não manter à mão em paralelo. Onde for spec-first, o código é gerado/validado **contra** a spec.
Um dos dois é derivado do outro; nunca os dois à mão. Versione a spec no repo.

## 2. Cheque o drift spec × implementação (§2)
Rode as verificações de doc-as-code no contrato de `${ARGUMENTS:-<serviço>}`:
- **Válida** contra o schema 3.1 (lint: spectral/equivalente).
- **Casa com o código** — cada rota/campo da spec existe no código com o tipo certo, e cada rota
  do código está na spec. Rota sem spec / campo removido do código mas vivo na spec **reprova**.
- **Exemplos validam** contra os próprios schemas.
- Quando há consumidor interno: **consumer-driven contract test** (o provider não quebra o que o
  consumer espera).

## 3. Versione com SemVer + changelog (§3, §4)
- Classifique a mudança: **MAJOR** (breaking — remover/renomear/mudar tipo/semântica → exige **ADR**
  e plano de migração/deprecação datada), **MINOR** (adição retrocompatível), **PATCH** (fix).
- Atualize `CHANGELOG.md` (Keep a Changelog): seção por tipo, **breaking em destaque** com link pro
  ADR e pra rota de migração, escrito **pro consumidor** (o que muda pra quem usa), datado.
- Breaking em shared lib ou contrato público **sempre** com ADR (`/docs-adr`).

## 4. Feche o loop
Spec + changelog + (ADR se breaking) entram no **mesmo PR** da mudança (DoD §35). A prova de
"feito" é a spec válida + drift check **verde hoje** — sem isso a `schematize-audit` reabre o item.
Reporte o status do drift, a classe SemVer da mudança e a entrada de changelog gerada.
