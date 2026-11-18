import { connection } from 'next/server'
import { PARTICIPANTES, quemJaSorteou, rodada } from '@/lib/sorteio'
import { SecretSantaApp } from './SecretSantaApp'

export default async function HomePage() {
  await connection()

  const sorteados = await quemJaSorteou()
  const participants = PARTICIPANTES.map((name) => ({
    id: name,
    name,
    hasDrawn: sorteados.has(name),
  }))

  return <SecretSantaApp participants={participants} round={rodada()} />
}
