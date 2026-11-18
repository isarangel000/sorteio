export const PARTICIPANTES = [
  'Janaína',
  'Reginaldo',
  'Isabela',
  'Rafaela',
  'Fátima',
  'Tibaes',
  'Cleuza',
  'Zé',
  'Rodrigo',
  'Jefferson',
  'Letícia',
  'Bento',
] as const

const CORES = [
  'Azul',
  'Amarelo',
  'Verde',
  'Marrom',
  'Vermelho',
  'Rosa',
  'Laranja',
  'Preto',
  'Cinza',
  'Roxo',
  'Branco',
  'Dourado',
] as const

// O sorteio é calculado a partir desta frase secreta (variável de ambiente na Vercel).
// Mesma frase = mesmo sorteio. Trocar a frase = sorteio novo e zera quem já sorteou.
// No computador (npm run dev) sem a frase: cada vez que o servidor reinicia, sai um sorteio novo.
function segredo() {
  if (process.env.SORTEIO_SEGREDO) return process.env.SORTEIO_SEGREDO
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Configure a variável de ambiente SORTEIO_SEGREDO antes de publicar.')
  }
  const global = globalThis as { __segredoLocal?: string }
  return (global.__segredoLocal ??= crypto.randomUUID())
}

function hash(texto: string) {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function geradorAleatorio(semente: number) {
  let a = semente
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function rodada() {
  return hash(`rodada:${segredo()}`).toString(36)
}

type Resultado = { amigo: string; cor: string }

function calcularSorteio(): Map<string, Resultado> {
  const aleatorio = geradorAleatorio(hash(segredo()))

  // Algoritmo de Sattolo: gera um único ciclo, então ninguém tira a si mesmo.
  const ordem = PARTICIPANTES.map((_, i) => i)
  for (let i = ordem.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * i)
    ;[ordem[i], ordem[j]] = [ordem[j], ordem[i]]
  }

  const cores = [...CORES]
  for (let i = cores.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[cores[i], cores[j]] = [cores[j], cores[i]]
  }

  return new Map(
    PARTICIPANTES.map((nome, i) => [nome, { amigo: PARTICIPANTES[ordem[i]], cor: cores[i] }]),
  )
}

let sorteio: Map<string, Resultado> | undefined

export function resultadoDe(nome: string) {
  sorteio ??= calcularSorteio()
  return sorteio.get(nome)
}

// ---- Registro de quem já sorteou ----
// Na Vercel: usa o Redis (Upstash) conectado ao projeto.
// No computador (sem Redis configurado): guarda na memória enquanto o servidor estiver rodando.

const chave = () => `amigo-secreto:sorteados:${rodada()}`
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const memoria = ((globalThis as { __sorteados?: Set<string> }).__sorteados ??= new Set<string>())

async function redis<T>(comando: (string | number)[]): Promise<T> {
  const resposta = await fetch(redisUrl!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(comando),
    cache: 'no-store',
  })
  if (!resposta.ok) throw new Error(`Redis respondeu ${resposta.status}`)
  const dados = (await resposta.json()) as { result: T }
  return dados.result
}

export async function quemJaSorteou(): Promise<Set<string>> {
  if (!redisUrl || !redisToken) return memoria
  return new Set(await redis<string[]>(['SMEMBERS', chave()]))
}

/** Marca o participante como sorteado. Retorna false se ele já tinha sorteado. */
export async function marcarSorteado(nome: string): Promise<boolean> {
  if (!redisUrl || !redisToken) {
    if (memoria.has(nome)) return false
    memoria.add(nome)
    return true
  }
  return (await redis<number>(['SADD', chave(), nome])) === 1
}
