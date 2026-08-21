#!/usr/bin/env node
// schematize-docs — os CINCO gates que a skill prometia e nao tinha (vistoria de 2026-08-21:
// "promete 5 gates e entrega zero scripts"). Doc nao e "melhor esforco": e verificavel, e o que e
// verificavel a casa verifica — inclusive a doc desta skill.
//
//   links    link interno/ancora que nao abre reprova
//   openapi  o piso do lint de spec (usa Spectral se existir; senao, o piso embutido)
//   drift    rota no codigo fora da spec, e caminho na spec sem rota no codigo
//   indice   a contagem do indice (secao 39) bate com as funcoes do codigo
//   root     o root fica limpo: so codigo, config e os poucos MDs de mao
//
// uso: docs-gate.mjs [dir] [--so links,openapi,...] [--spec caminho] [--externos] [--json]
//      0 = passa · 1 = REPROVA · 2 = nada para verificar / uso errado
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve, dirname } from 'node:path'
import { execSync } from 'node:child_process'
import { analisa } from './lib-yaml-minimo.mjs'

const argv = process.argv.slice(2)
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined }
const consumidos = new Set([opt('--so'), opt('--spec')].filter(Boolean))
const raiz = resolve(argv.find(a => !a.startsWith('--') && !consumidos.has(a)) || '.')
const SO = (opt('--so') || 'links,openapi,drift,indice,root').split(',').map(s => s.trim())
const IGNORA = new Set(['node_modules', '.git', 'target', 'dist', 'build', '.next', '_build', 'versions', 'vendor', 'coverage'])

function varrer(dir, filtro, achados = []) {
  let entradas
  try { entradas = readdirSync(dir, { withFileTypes: true }) } catch { return achados }
  for (const e of entradas) {
    if (IGNORA.has(e.name)) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) varrer(p, filtro, achados)
    else if (filtro(e.name, p)) achados.push(p)
  }
  return achados
}

const falhas = [], avisos = []
const rel = (p) => relative(raiz, p) || p
let rodou = 0

// ---------------------------------------------------------------------------- 1. links
if (SO.includes('links')) {
  const mds = varrer(raiz, n => n.endsWith('.md'))
  if (!mds.length) avisos.push('links: nenhum .md encontrado')
  else {
    rodou++
    for (const md of mds) {
      const texto = readFileSync(md, 'utf8')
      const semCodigo = texto.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
      const ancoras = new Set(
        [...texto.matchAll(/^#{1,6}\s+(.+)$/gm)].map(m =>
          m[1].toLowerCase().trim()
            .replace(/[`*_~]/g, '')
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'))
      )
      for (const m of semCodigo.matchAll(/\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
        const alvo = m[2]
        const linha = semCodigo.slice(0, m.index).split('\n').length
        if (/^(https?:|mailto:|tel:)/.test(alvo)) {
          if (argv.includes('--externos')) avisos.push(`links: externo nao checado nesta versao: ${alvo}`)
          continue
        }
        const [caminho, ancora] = alvo.split('#')
        if (!caminho) {
          if (ancora && !ancoras.has(ancora.toLowerCase())) falhas.push(`links: ${rel(md)}:${linha} ancora #${ancora} nao existe neste arquivo`)
          continue
        }
        const destino = resolve(dirname(md), caminho)
        if (!existsSync(destino)) { falhas.push(`links: ${rel(md)}:${linha} aponta para ${caminho}, que nao existe`); continue }
        if (ancora && destino.endsWith('.md')) {
          const alvoTexto = readFileSync(destino, 'utf8')
          const alvoAncoras = new Set([...alvoTexto.matchAll(/^#{1,6}\s+(.+)$/gm)].map(x =>
            x[1].toLowerCase().trim().replace(/[`*_~]/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '')
              .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')))
          if (!alvoAncoras.has(ancora.toLowerCase())) falhas.push(`links: ${rel(md)}:${linha} ancora #${ancora} nao existe em ${caminho}`)
        }
      }
    }
  }
}

// -------------------------------------------------------------------- 2. openapi (spectral)
function acharSpec() {
  const dado = opt('--spec')
  if (dado) return resolve(raiz, dado)
  return varrer(raiz, n => /^(openapi|swagger)\.(ya?ml|json)$/i.test(n))[0]
}
let spec = null, specArq = null
if (SO.includes('openapi') || SO.includes('drift')) {
  specArq = acharSpec()
  if (specArq && existsSync(specArq)) {
    const bruto = readFileSync(specArq, 'utf8')
    if (specArq.endsWith('.json')) {
      try { spec = JSON.parse(bruto) } catch (e) { falhas.push(`openapi: ${rel(specArq)} JSON invalido — ${e.message}`) }
    } else {
      const { dado, avisos: av } = analisa(bruto)
      spec = dado
      for (const a of av.slice(0, 3)) avisos.push(`openapi: leitor minimo — ${a}`)
    }
  }
}
if (SO.includes('openapi')) {
  if (!specArq) avisos.push('openapi: nenhuma spec encontrada (openapi.yaml/json) — nada a validar')
  else if (spec) {
    rodou++
    // Spectral e o lint de verdade. Se estiver disponivel, e ELE que manda; o piso embutido existe
    // para o CI que nao tem node_modules, e diz de si mesmo que e piso.
    let usouSpectral = false
    try {
      execSync('npx --no-install spectral --version', { stdio: 'ignore' })
      const saida = execSync(`npx --no-install spectral lint --fail-severity=error -f text ${JSON.stringify(specArq)}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      usouSpectral = true
      if (saida.trim()) avisos.push(`openapi (spectral): ${saida.trim().split('\n').slice(0, 5).join(' · ')}`)
    } catch (e) {
      if (e.status === 1 && e.stdout) {
        usouSpectral = true
        for (const l of String(e.stdout).trim().split('\n').slice(0, 10)) if (l.trim()) falhas.push(`openapi (spectral): ${l.trim()}`)
      }
    }
    if (!usouSpectral) avisos.push('openapi: Spectral nao disponivel — rodando o PISO embutido (menos regras, nao substitui o lint)')
    const versao = spec.openapi || spec.swagger
    if (!versao) falhas.push('openapi: sem campo `openapi:` — isto nao e uma spec OpenAPI')
    else if (String(versao).startsWith('2')) falhas.push(`openapi: Swagger 2.0 (${versao}) — a casa usa OpenAPI 3.1`)
    if (!spec.info?.title) falhas.push('openapi: info.title ausente')
    if (!spec.info?.version) falhas.push('openapi: info.version ausente')
    const caminhos = Object.entries(spec.paths || {})
    if (!caminhos.length) falhas.push('openapi: nenhum path — spec vazia nao e "API pequena", e spec quebrada')
    const ids = new Map()
    const METODOS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
    for (const [caminho, item] of caminhos) {
      for (const [metodo, op] of Object.entries(item || {})) {
        if (!METODOS.includes(metodo.toLowerCase())) continue
        const onde = `${metodo.toUpperCase()} ${caminho}`
        if (!op.operationId) falhas.push(`openapi: ${onde} sem operationId`)
        else if (ids.has(op.operationId)) falhas.push(`openapi: operationId "${op.operationId}" repetido (${ids.get(op.operationId)} e ${onde})`)
        else ids.set(op.operationId, onde)
        if (!op.summary && !op.description) falhas.push(`openapi: ${onde} sem summary/description`)
        const respostas = Object.keys(op.responses || {})
        if (!respostas.length) falhas.push(`openapi: ${onde} sem responses`)
        else {
          if (!respostas.some(c => /^2/.test(c))) falhas.push(`openapi: ${onde} sem resposta 2xx`)
          // Spec que so documenta o caminho feliz e metade da verdade: quem integra descobre os
          // erros em producao.
          if (!respostas.some(c => /^[45]/.test(c)) && !respostas.includes('default')) {
            falhas.push(`openapi: ${onde} so documenta o caminho feliz (nenhum 4xx/5xx nem default)`)
          }
          for (const [cod, r] of Object.entries(op.responses || {})) {
            if (r && typeof r === 'object' && !r.description && !r.$ref) falhas.push(`openapi: ${onde} resposta ${cod} sem description`)
          }
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------- 3. drift
if (SO.includes('drift')) {
  if (!specArq || !spec) avisos.push('drift: sem spec — nada a comparar')
  else {
    rodou++
    const fontes = varrer(raiz, n => /\.(go|rs|ts|js|py|rb|ex|cs|php)$/.test(n))
    const rotasCodigo = new Set()
    const PADROES = [
      /\.(?:Get|Post|Put|Patch|Delete)\(\s*["'`]([^"'`]+)["'`]/g,
      /\.(?:get|post|put|patch|delete)\(\s*["'`]([^"'`]+)["'`]/g,
      /\.route\(\s*["'`]([^"'`]+)["'`]/g,
      /@(?:app|router|api)\.(?:get|post|put|patch|delete)\(\s*["']([^"']+)["']/g,
      /#\[(?:get|post|put|patch|delete)\(\s*["']([^"']+)["']/g,
    ]
    for (const f of fontes) {
      const t = readFileSync(f, 'utf8')
      for (const re of PADROES) for (const m of t.matchAll(re)) if (m[1].startsWith('/')) rotasCodigo.add(m[1])
    }
    const norm = (p) => p.replace(/\{[^}]+\}/g, '{}').replace(/:[A-Za-z_]+/g, '{}').replace(/\/$/, '')
    const naSpec = new Set(Object.keys(spec.paths || {}).map(norm))
    const noCodigo = new Set([...rotasCodigo].map(norm))
    if (!noCodigo.size) {
      // Fail-closed: comparacao inconclusiva NAO e "sem drift". Passar aqui seria o gate mais
      // perigoso do conjunto — ele diria "spec em dia" justamente quando nao conseguiu olhar.
      falhas.push(`drift: nenhuma rota reconhecida no codigo, e a spec declara ${naSpec.size} caminho(s) — comparacao INCONCLUSIVA, e inconclusivo NAO e "sem drift"`)
    } else {
      for (const r of noCodigo) if (!naSpec.has(r)) falhas.push(`drift: rota ${r} existe no codigo e NAO esta na spec — quem integra nao sabe que ela existe`)
      for (const r of naSpec) if (!noCodigo.has(r)) falhas.push(`drift: caminho ${r} esta na spec e NAO foi achado no codigo — spec que promete o que nao existe`)
    }
  }
}

// ---------------------------------------------------------------------------- 4. indice (39)
if (SO.includes('indice')) {
  const idx = varrer(raiz, n => /^INDEX_FUNCTIONS\.md$/i.test(n))[0]
  if (!idx) avisos.push('indice: INDEX_FUNCTIONS.md nao encontrado — sem indice nao ha contagem para bater')
  else {
    rodou++
    const texto = readFileSync(idx, 'utf8')
    const entradas = texto.split('\n').filter(l => /^\s*[-|]\s*`?[A-Za-z_]/.test(l)).length
    const fontes = varrer(raiz, n => /\.(go|rs|ts|js|py|rb|ex|cs)$/.test(n))
    let funcoes = 0
    for (const f of fontes) {
      const t = readFileSync(f, 'utf8')
      funcoes += [...t.matchAll(/^\s*(?:pub\s+)?(?:async\s+)?(?:export\s+)?(?:function|func|fn|def|defp)\s+[A-Za-z_]/gm)].length
    }
    if (!funcoes) avisos.push('indice: nenhuma funcao reconhecida no codigo — contagem inconclusiva')
    else if (entradas !== funcoes) falhas.push(`indice: ${entradas} entrada(s) no INDEX_FUNCTIONS.md para ${funcoes} funcao(oes) no codigo — a contagem tem de bater (secao 39)`)
  }
}

// ---------------------------------------------------------------------------- 5. root limpo
if (SO.includes('root')) {
  rodou++
  // A lista e dos MDs escritos A MAO que sao contrato do repo. Tudo o mais que for `.md` na raiz e
  // artefato GERADO, e artefato gerado mora em `<projeto>_archive/` ou `docs/`.
  // A allowlist é a MESMA de `references/disciplina.md` §5 (root limpo): README, CLAUDE, LICENSE,
  // CHANGELOG, CONTRIBUTING, SECURITY — mais os nomes que ferramentas do ecossistema exigem na raiz
  // (SKILL/AGENTS/CONTEXT/CODE_OF_CONDUCT). `CHANGELOG` entra porque a casa normatiza Keep a
  // Changelog **na raiz**; ADR NÃO entra (mora em `<projeto>_archive/decisoes/`).
  const PERMITIDOS = /^(README|CLAUDE|SKILL|LICENSE|CHANGELOG|CONTRIBUTING|CODE_OF_CONDUCT|SECURITY|AGENTS|CONTEXT)(\.[a-z-]+)?\.(md|txt)$/i
  let mds = 0
  for (const e of readdirSync(raiz, { withFileTypes: true })) {
    if (!e.isFile() || !/\.md$/i.test(e.name)) continue
    mds++
    if (!PERMITIDOS.test(e.name)) {
      falhas.push(`root: ${e.name} solto na raiz — MD gerado mora em <projeto>_archive/ ou docs/ (root limpo)`)
    }
  }
  if (!mds) avisos.push('root: nenhum .md na raiz — nem README?')
}

if (!rodou) {
  console.error(`✖ nada verificavel em ${raiz} (nenhum md/spec/indice) — ausencia de material nao e aprovacao.`)
  process.exit(2)
}

if (argv.includes('--json')) {
  console.log(JSON.stringify({ veredito: falhas.length ? 'reprovado' : 'aprovado', gates: SO, falhas, avisos }, null, 2))
} else {
  avisos.forEach(a => console.error(`  ! ${a}`))
  if (falhas.length) {
    console.error(`\n✖ DOCS REPROVADO — ${falhas.length} problema(s):`)
    falhas.forEach(f => console.error(`  · ${f}`))
    console.error('\nLink morto, spec fora de sincronia e indice defasado sao BUGS DE DOCUMENTACAO.')
  } else {
    console.log(`✔ docs: ${rodou} gate(s) rodado(s) de [${SO.join(', ')}], nenhum problema.`)
  }
}
process.exit(falhas.length ? 1 : 0)
