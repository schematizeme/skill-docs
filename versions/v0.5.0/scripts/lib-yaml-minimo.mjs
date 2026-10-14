// Leitor de YAML MINIMO — o suficiente para OpenAPI (mapas aninhados por indentacao, listas,
// escalares, `|`/`>` como bloco). NAO e um parser de YAML: nao faz ancora, tag, fluxo complexo,
// multi-documento nem merge key.
//
// Por que existe em vez de uma dependencia: o gate desta skill precisa rodar em CI de qualquer
// projeto sem `npm install`. O preco e o alcance — e ele DECLARA o alcance em vez de fingir:
// `analisa()` devolve `{ dado, avisos }`, e um aviso e a forma de dizer "esta linha eu nao entendi"
// em vez de silenciosamente produzir um objeto errado. Gate que le errado e pior que gate ausente.
export function analisa(texto) {
  const avisos = []
  const linhas = texto.split('\n')
  const raiz = {}
  // pilha de contextos: { indent, no, tipo }
  const pilha = [{ indent: -1, no: raiz, tipo: 'mapa' }]

  const escalar = (v) => {
    v = v.trim()
    if (v === '' ) return ''
    if (v === 'true') return true
    if (v === 'false') return false
    if (v === 'null' || v === '~') return null
    if (/^-?\d+$/.test(v)) return Number(v)
    if (/^-?\d*\.\d+$/.test(v)) return Number(v)
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1)
    if (v.startsWith('[') || v.startsWith('{')) {
      try { return JSON.parse(v.replace(/'/g, '"')) } catch { /* fluxo YAML com chave/valor nus */ }
      // `{ description: criado }` e YAML valido e JSON invalido. Converte-se o caso simples
      // (sem aninhamento) em vez de devolver a string crua — devolver string faria o gate ver
      // "resposta sem description" onde ha description.
      if (v.startsWith('{') && v.endsWith('}') && !v.slice(1, -1).includes('{')) {
        const obj = {}
        for (const par of v.slice(1, -1).split(',')) {
          const [k, ...resto] = par.split(':')
          if (!resto.length) continue
          obj[k.trim().replace(/^["']|["']$/g, '')] = escalar(resto.join(':'))
        }
        return obj
      }
      if (v.startsWith('[') && v.endsWith(']')) {
        return v.slice(1, -1).split(',').map(x => escalar(x)).filter(x => x !== '')
      }
      return v
    }
    return v
  }

  let i = 0
  while (i < linhas.length) {
    const bruta = linhas[i]
    i++
    if (!bruta.trim() || /^\s*#/.test(bruta)) continue
    if (/^---\s*$/.test(bruta)) continue
    const indent = bruta.match(/^\s*/)[0].length
    let linha = bruta.trim().replace(/\s+#\s.*$/, '')

    while (pilha.length > 1 && indent <= pilha[pilha.length - 1].indent) pilha.pop()
    const topo = pilha[pilha.length - 1]

    // item de lista
    if (linha.startsWith('- ')) {
      const conteudo = linha.slice(2).trim()
      if (!Array.isArray(topo.no)) { avisos.push(`linha ${i}: item de lista fora de lista`); continue }
      const m = conteudo.match(/^([\w.\/$-]+):\s*(.*)$/)
      if (m) {
        const obj = {}
        if (m[2] === '') {
          const filho = {}
          obj[m[1]] = filho
          topo.no.push(obj)
          pilha.push({ indent, no: obj, tipo: 'mapa' })
          pilha.push({ indent: indent + 2, no: filho, tipo: 'mapa' })
        } else {
          obj[m[1]] = escalar(m[2])
          topo.no.push(obj)
          pilha.push({ indent, no: obj, tipo: 'mapa' })
        }
      } else {
        topo.no.push(escalar(conteudo))
      }
      continue
    }

    const m = linha.match(/^("[^"]+"|'[^']+'|[^:]+):\s*(.*)$/)
    if (!m) { avisos.push(`linha ${i}: nao entendi "${linha.slice(0, 60)}"`); continue }
    const chave = m[1].replace(/^["']|["']$/g, '')
    const valor = m[2]
    const alvo = Array.isArray(topo.no) ? null : topo.no
    if (!alvo) { avisos.push(`linha ${i}: chave dentro de lista sem "- "`); continue }

    if (valor === '' ) {
      // olha a proxima linha significativa para decidir mapa ou lista
      let j = i
      while (j < linhas.length && (!linhas[j].trim() || /^\s*#/.test(linhas[j]))) j++
      const prox = linhas[j]
      const proxIndent = prox ? prox.match(/^\s*/)[0].length : -1
      if (prox && proxIndent > indent && prox.trim().startsWith('- ')) {
        alvo[chave] = []
        pilha.push({ indent, no: alvo[chave], tipo: 'lista' })
      } else if (prox && proxIndent > indent) {
        alvo[chave] = {}
        pilha.push({ indent, no: alvo[chave], tipo: 'mapa' })
      } else {
        alvo[chave] = null
      }
    } else if (valor === '|' || valor === '>' || valor === '|-' || valor === '>-') {
      const partes = []
      while (i < linhas.length && (linhas[i].match(/^\s*/)[0].length > indent || !linhas[i].trim())) {
        partes.push(linhas[i].trim()); i++
      }
      alvo[chave] = partes.join(valor.startsWith('>') ? ' ' : '\n').trim()
    } else {
      alvo[chave] = escalar(valor)
    }
  }
  return { dado: raiz, avisos }
}
