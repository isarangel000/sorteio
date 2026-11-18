'use server'

import { marcarSorteado, PARTICIPANTES, resultadoDe } from '@/lib/sorteio'

export type DrawResult =
  | {
      success: true
      participant: string
      assignedName: string
      assignedColor: string
    }
  | { success: false; message: string }

export async function revealSecretSanta(participant: string): Promise<DrawResult> {
  const cleanName = typeof participant === 'string' ? participant.trim() : ''

  if (!(PARTICIPANTES as readonly string[]).includes(cleanName)) {
    return { success: false, message: 'Escolha o seu nome para continuar.' }
  }

  const resultado = resultadoDe(cleanName)
  if (!resultado) {
    return { success: false, message: 'Não encontramos esse participante.' }
  }

  try {
    const primeiraVez = await marcarSorteado(cleanName)
    if (!primeiraVez) {
      return {
        success: false,
        message: 'Esse nome já realizou o sorteio. Cada pessoa só pode sortear uma vez.',
      }
    }
  } catch {
    return { success: false, message: 'Não foi possível concluir o sorteio. Tente novamente.' }
  }

  return {
    success: true,
    participant: cleanName,
    assignedName: resultado.amigo,
    assignedColor: resultado.cor,
  }
}
