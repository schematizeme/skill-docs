#!/usr/bin/env bash
# Vermelho primeiro dos sete gates. Cada fixture e um repo de mentira com UM defeito de doc.
# EXCEÇÃO DECLARADA de strict mode (`schematize-shell` -> `references/piso.md` secao 1):
# harness de teste roda sem `-e` de propósito — ele precisa continuar depois de um caso
# vermelho para reportar TODOS, em vez de parar no primeiro.
set -u
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
G="$AQUI/docs-gate.mjs"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
ok=0; fail=0
checa() { local nome="$1" esp="$2" agulha="$3"; shift 3
  local saida; saida="$("$@" 2>&1)"; local rc=$?
  if [ "$rc" != "$esp" ]; then echo "  ✖ $nome: exit $rc, esperado $esp"; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  if [ -n "$agulha" ] && ! grep -qF -- "$agulha" <<<"$saida"; then echo "  ✖ $nome: exit certo, saida sem \"$agulha\""; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  echo "  ✔ $nome"; ok=$((ok+1)); }

repo() { # $1 = nome -> ecoa caminho de um repo saudavel
  local d="$TMP/$1"; rm -rf "$d"; mkdir -p "$d/docs" "$d/src"
  cat > "$d/README.md" <<'M'
# Loja

Veja o [runbook](docs/runbook.md) e a [seção de deploy](#deploy).

## Deploy
Roda com `make deploy`.
M
  printf '# Runbook\n\nVolta para o [README](../README.md).\n' > "$d/docs/runbook.md"
  cat > "$d/openapi.yaml" <<'Y'
openapi: 3.1.0
info:
  title: Loja
  version: 1.2.0
paths:
  /v1/pedidos:
    get:
      operationId: listarPedidos
      summary: lista pedidos
      responses:
        '200':
          description: ok
        '401':
          description: sem auth
    post:
      operationId: criarPedido
      summary: cria pedido
      responses:
        '201':
          description: criado
        '422':
          description: invalido
Y
  cat > "$d/src/rotas.go" <<'G'
func montar(r chi.Router) {
	r.Get("/v1/pedidos", listar)
	r.Post("/v1/pedidos", criar)
}
G
  echo "$d"
}

echo "== verde de partida =="
d="$(repo ok)"
# 4 e nao 5: sem INDEX_FUNCTIONS.md o gate de indice AVISA em vez de fingir que rodou.
checa "repo saudavel passa" 0 "4 gate(s) rodado(s)" node "$G" "$d" --so links,openapi,drift,indice,root

echo "== 1. links =="
d="$(repo l1)"; printf '\nVeja [o guia](docs/guia.md).\n' >> "$d/README.md"
checa "link para arquivo inexistente reprova" 1 "que nao existe" node "$G" "$d" --so links
d="$(repo l2)"; printf '\nVeja a [seção fantasma](#nao-existe).\n' >> "$d/README.md"
checa "ancora inexistente reprova" 1 "ancora #nao-existe" node "$G" "$d" --so links
d="$(repo l3)"; printf '\nVeja o [runbook errado](docs/runbook.md#secao-que-nao-ha).\n' >> "$d/README.md"
checa "ancora inexistente em OUTRO arquivo reprova" 1 "nao existe em docs/runbook.md" node "$G" "$d" --so links
d="$(repo l4)"; printf '\nExemplo em bloco:\n\n```md\n[link quebrado](nao-existe.md)\n```\n' >> "$d/README.md"
checa "link dentro de bloco de codigo NAO reprova" 0 "" node "$G" "$d" --so links

echo "== 2. openapi (piso embutido) =="
d="$(repo o1)"; sed -i '/operationId: listarPedidos/d' "$d/openapi.yaml"
checa "operacao sem operationId reprova" 1 "sem operationId" node "$G" "$d" --so openapi
d="$(repo o2)"; sed -i 's/operationId: criarPedido/operationId: listarPedidos/' "$d/openapi.yaml"
checa "operationId repetido reprova" 1 "repetido" node "$G" "$d" --so openapi
d="$(repo o3)"; python3 - "$d/openapi.yaml" <<'PY'
import sys,re
p=sys.argv[1]; s=open(p).read()
s=s.replace("        '401':\n          description: sem auth\n","")
open(p,'w').write(s)
PY
checa "operacao so com caminho feliz reprova" 1 "so documenta o caminho feliz" node "$G" "$d" --so openapi
d="$(repo o4)"; sed -i 's/openapi: 3.1.0/swagger: "2.0"/' "$d/openapi.yaml"
checa "Swagger 2.0 reprova" 1 "a casa usa OpenAPI 3.1" node "$G" "$d" --so openapi
d="$(repo o5)"; sed -i '/summary: lista pedidos/d' "$d/openapi.yaml"
checa "operacao sem summary reprova" 1 "sem summary" node "$G" "$d" --so openapi

echo "== 3. drift =="
d="$(repo d1)"; printf '\tr.Get("/v1/relatorios", rel)\n' >> "$d/src/rotas.go"
checa "rota no codigo fora da spec reprova" 1 "NAO esta na spec" node "$G" "$d" --so drift
d="$(repo d2)"; cat >> "$d/openapi.yaml" <<'Y'
  /v1/fantasma:
    get:
      operationId: fantasma
      summary: nao existe no codigo
      responses:
        '200':
          description: ok
        '404':
          description: nao
Y
checa "caminho na spec sem rota no codigo reprova" 1 "spec que promete o que nao existe" node "$G" "$d" --so drift
d="$(repo d3)"; rm "$d/src/rotas.go"
checa "comparacao inconclusiva reprova (fail-closed)" 1 "inconclusivo NAO e \"sem drift\"" node "$G" "$d" --so drift

echo "== 4. indice (secao 39) =="
d="$(repo i1)"; mkdir -p "$d/archive/index"
printf 'func listar(w http.ResponseWriter) {}\n' >> "$d/src/rotas.go"   # 2 funcoes no codigo...
printf '# Funcoes\n\n- `montar`\n' > "$d/archive/index/INDEX_FUNCTIONS.md"   # ...1 no indice
checa "contagem que nao bate reprova" 1 "a contagem tem de bater" node "$G" "$d" --so indice
d="$(repo i2)"; mkdir -p "$d/archive/index"
printf '# Funcoes\n\n- `montar` — monta as rotas\n' > "$d/archive/index/INDEX_FUNCTIONS.md"
checa "contagem que bate passa" 0 "" node "$G" "$d" --so indice

echo "== 5. root limpo =="
d="$(repo r1)"; printf '# Plano\n' > "$d/PLANO-2026.md"
checa "MD gerado solto na raiz reprova" 1 "root limpo" node "$G" "$d" --so root
d="$(repo r2)"; printf '# Mapa\n' > "$d/MAPA.md"
checa "MAPA no root reprova" 1 "MAPA.md solto na raiz" node "$G" "$d" --so root

echo "== 6. adr proposed =="
d="$(repo a1)"; mkdir -p "$d/p_archive/decisoes"
printf '# ADR 0001\n\n- **Status:** proposed\n- **Data:** 2020-01-01\n' > "$d/p_archive/decisoes/ADR-0001-x.md"
checa "ADR proposed velho reprova" 1 "proposed ha" node "$G" "$d" --so adr
d="$(repo a2)"; mkdir -p "$d/p_archive/decisoes"
printf '# ADR 0001\n\n- **Status:** proposed\n' > "$d/p_archive/decisoes/ADR-0001-x.md"
checa "ADR proposed sem data reprova" 1 "sem **Data:**" node "$G" "$d" --so adr
d="$(repo a3)"; mkdir -p "$d/p_archive/decisoes"
printf '# ADR 0001\n\n- **Status:** accepted\n- **Data:** 2020-01-01\n' > "$d/p_archive/decisoes/ADR-0001-x.md"
printf '# ADR 0002\n\n- **Status:** proposed\n- **Data:** %s\n' "$(date -u +%F)" > "$d/p_archive/decisoes/ADR-0002-y.md"
checa "ADR accepted antigo e proposed recente passam" 0 "" node "$G" "$d" --so adr

echo "== 7. diagrama sem fonte =="
d="$(repo g1)"; printf 'x' > "$d/docs/diagrama-arquitetura.png"
checa "PNG de diagrama sem fonte reprova" 1 "imagem sem fonte" node "$G" "$d" --so diagrama
d="$(repo g2)"; printf 'x' > "$d/docs/diagrama-arquitetura.png"; printf 'graph TD; A-->B\n' > "$d/docs/diagrama-arquitetura.mmd"
checa "PNG com .mmd ao lado passa" 0 "" node "$G" "$d" --so diagrama

echo "== nada verificavel nao e aprovacao =="
d="$TMP/vazio"; mkdir -p "$d"
checa "repo sem md/spec/indice sai 2" 2 "ausencia de material nao e aprovacao" node "$G" "$d" --so links,openapi,drift,indice

echo; echo "docs-gate: $ok ok, $fail falha(s)"; [ "$fail" = 0 ]
