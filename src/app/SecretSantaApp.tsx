'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { revealSecretSanta, type DrawResult } from './actions'

type Participant = {
  id: string
  name: string
  hasDrawn: boolean
}

type SavedResult = Extract<DrawResult, { success: true }>


const treeRows = [1, 2, 3, 3, 3]

const colorClasses: Record<string, string> = {
  Azul: 'bg-blue-500',
  Amarelo: 'bg-yellow-300',
  Verde: 'bg-emerald-500',
  Marrom: 'bg-amber-800',
  Vermelho: 'bg-red-500',
  Rosa: 'bg-pink-400',
  Laranja: 'bg-orange-500',
  Preto: 'bg-zinc-900',
  Cinza: 'bg-zinc-400',
  Roxo: 'bg-violet-500',
  Branco: 'bg-white ring-1 ring-stone-300',
  Dourado: 'bg-amber-400',
}

function GiftIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M4 10h16v10H4V10Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M2.8 6.5h18.4V10H2.8V6.5ZM12 6.5V20" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 6.3c-1.5-3.5-5.2-3.7-5.4-1.2-.1 1.4 1.8 1.7 5.4 1.2Zm0 0c1.5-3.5 5.2-3.7 5.4-1.2.1 1.4-1.8 1.7-5.4 1.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  )
}

function SparkleIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M12 2.5c.6 5.6 3.9 8.9 9.5 9.5-5.6.6-8.9 3.9-9.5 9.5-.6-5.6-3.9-8.9-9.5-9.5 5.6-.6 8.9-3.9 9.5-9.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function RuleIcon({ type }: { type: 'palette' | 'money' | 'secret' }) {
  if (type === 'money') {
    return <span className="font-display text-[17px] font-bold">R$</span>
  }
  if (type === 'secret') {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <path d="M4 12s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3a9 9 0 1 0 0 18h1.4a1.8 1.8 0 0 0 0-3.6h-.7a1.5 1.5 0 0 1 0-3h2.8A5.5 5.5 0 0 0 21 8.9C21 5.6 17 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="7.5" cy="10" r="1" fill="currentColor" />
      <circle cx="10" cy="6.8" r="1" fill="currentColor" />
      <circle cx="14" cy="6.6" r="1" fill="currentColor" />
      <circle cx="17" cy="9" r="1" fill="currentColor" />
    </svg>
  )
}

type XmasIconType = 'bauble' | 'gift' | 'candy' | 'star'

function XmasIcon({ type }: { type: XmasIconType }) {
  const common = {
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  return (
    <svg aria-hidden="true" className="size-8" fill="none" viewBox="0 0 32 32">
      {type === 'bauble' && (
        <>
          <path d="M16 3v3" {...common} />
          <rect height="3.5" rx="1" width="6" x="13" y="6" {...common} />
          <circle cx="16" cy="19.5" r="10" {...common} />
          <path d="M6.6 16.5c3 1.6 15.8 1.6 18.8 0M6.6 22.5c3 1.6 15.8 1.6 18.8 0" {...common} />
          <circle cx="12" cy="19.6" fill="currentColor" r="1.1" />
          <circle cx="16" cy="19.9" fill="currentColor" r="1.1" />
          <circle cx="20" cy="19.6" fill="currentColor" r="1.1" />
        </>
      )}
      {type === 'gift' && (
        <>
          <rect height="15" rx="1.5" width="20" x="6" y="14" {...common} />
          <rect height="5" rx="1.5" width="24" x="4" y="9" {...common} />
          <path d="M16 9v20" {...common} />
          <path
            d="M16 9c-1.8-4.6-7-5.4-7.3-2.4-.2 2 2.8 2.6 7.3 2.4Zm0 0c1.8-4.6 7-5.4 7.3-2.4.2 2-2.8 2.6-7.3 2.4Z"
            {...common}
          />
        </>
      )}
      {type === 'candy' && (
        <>
          <path d="M12 29V11a6 6 0 0 1 12 0v2" {...common} strokeWidth={4.2} />
          <path
            d="M12 27.5v1.5M12 21.5v2.5M12 15.5v2.5M13.4 8.4l1.8 1.8M19 5.2l-.3 2.6M23.6 9l-2.3 1.2"
            stroke="#c64b42"
            strokeLinecap="round"
            strokeWidth={2.4}
          />
        </>
      )}
      {type === 'star' && (
        <>
          <path
            d="m16 4 3.5 7.6 8.2.9-6.1 5.6 1.7 8.1L16 22.1l-7.3 4.1 1.7-8.1-6.1-5.6 8.2-.9L16 4Z"
            {...common}
          />
          <path d="M16 13.5v4.5M13.8 15.75h4.4" {...common} strokeWidth={1.3} />
        </>
      )}
    </svg>
  )
}

function NamePicker({
  participants,
  selectedName,
  onSelect,
}: {
  participants: Participant[]
  selectedName: string
  onSelect: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const selected = participants.find((participant) => participant.name === selectedName)

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex h-14 w-full items-center gap-3 rounded-2xl border bg-white px-4 text-left text-sm font-semibold outline-none transition ${
          open
            ? 'border-[#b28b47] ring-4 ring-[#d7b56f]/20'
            : 'border-[#dcd8ca] hover:border-[#cdb47f] focus-visible:border-[#b28b47] focus-visible:ring-4 focus-visible:ring-[#d7b56f]/20'
        }`}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-full font-display text-sm font-bold ${
            selected ? 'bg-[#c64b42] text-white' : 'bg-[#f2ead9] text-[#b18b48]'
          }`}
        >
          {selected ? selected.name.charAt(0) : <GiftIcon className="size-4" />}
        </span>
        <span className={`flex-1 truncate ${selected ? 'text-[#17362d]' : 'text-[#8c938f]'}`}>
          {selected ? selected.name : 'Toque para escolher seu nome'}
        </span>
        <svg
          aria-hidden="true"
          className={`size-5 shrink-0 text-[#b18b48] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path d="m7 9 5 5 5-5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      </button>

      <div
        aria-hidden={!open}
        aria-label="Escolha seu nome"
        className={`absolute inset-x-0 top-[calc(100%+8px)] z-30 origin-top rounded-3xl border border-[#ead9b6] bg-[#fffaf0] p-3 shadow-[0_24px_50px_rgba(11,45,36,.28)] transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(.2,.9,.3,1.2)] motion-reduce:transition-none ${
          open
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none invisible -translate-y-2 scale-95 opacity-0'
        }`}
        role="listbox"
      >
          <p className="mb-2.5 flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#b18b48]">
            <SparkleIcon className="size-3" /> Quem é você? <SparkleIcon className="size-3" />
          </p>
          <div className="grid max-h-[min(60vh,360px)] grid-cols-2 gap-2 overflow-y-auto">
            {participants.map((participant, index) => {
              const isSelected = participant.name === selectedName
              return (
                <button
                  aria-selected={isSelected}
                  style={{ animationDelay: `${60 + index * 35}ms` }}
                  tabIndex={open ? 0 : -1}
                  className={`flex min-h-12 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm font-bold transition ${
                    open ? 'name-pop' : ''
                  } ${
                    isSelected
                      ? 'border-[#c64b42] bg-[#c64b42] text-white shadow-[0_8px_18px_rgba(198,75,66,.25)]'
                      : participant.hasDrawn
                        ? 'cursor-not-allowed border-[#d7e8dc] bg-[#eef6f0] text-[#7f9a8b]'
                        : 'border-[#ead9b6] bg-white text-[#17362d] hover:border-[#d4ae60] hover:bg-[#fff6e3] active:scale-[.98]'
                  }`}
                  disabled={participant.hasDrawn}
                  key={participant.id}
                  onClick={() => {
                    onSelect(participant.name)
                    setOpen(false)
                  }}
                  role="option"
                  type="button"
                >
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      isSelected ? 'bg-[#ffe9aa]' : participant.hasDrawn ? 'bg-[#3e9a70]' : 'bg-[#d4ae60]'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{participant.name}</span>
                    {participant.hasDrawn && (
                      <span className="block text-[10px] font-semibold text-[#3e9a70]">
                        já sorteou ✓
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
      </div>
    </div>
  )
}

export function SecretSantaApp({
  participants,
  round,
}: {
  participants: Participant[]
  round: string
}) {
  const STORAGE_KEY = `natal-em-cores-resultado-${round}`
  const router = useRouter()
  const [selectedName, setSelectedName] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [savedResult, setSavedResult] = useState<SavedResult | null>(null)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setSavedResult(JSON.parse(stored) as SavedResult)
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }

    const interval = window.setInterval(() => router.refresh(), 20000)
    return () => window.clearInterval(interval)
  }, [router, STORAGE_KEY])

  const completed = participants.filter((participant) => participant.hasDrawn).length
  const progress = Math.round((completed / participants.length) * 100)

  const groupedParticipants = useMemo(() => {
    let cursor = 0
    return treeRows.map((amount) => {
      const row = participants.slice(cursor, cursor + amount)
      cursor += amount
      return row
    })
  }, [participants])

  const selectedParticipant = participants.find((participant) => participant.name === selectedName)

  const [confirmLeave, setConfirmLeave] = useState(false)

  const goHome = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setSavedResult(null)
    setConfirmed(false)
    setSelectedName('')
    setConfirmLeave(false)
    setError('')
    router.refresh()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDraw = () => {
    setError('')
    startTransition(async () => {
      const response = await revealSecretSanta(selectedName)
      if (response.success) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(response))
        setSavedResult(response)
        router.refresh()
      } else {
        setError(response.message)
      }
    })
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b2d24] pb-14 text-[#17362d]">
      <div aria-hidden="true" className="snow-layer absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute -left-24 top-40 size-72 rounded-full bg-[#c7433d]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 top-10 size-80 rounded-full bg-[#d6aa55]/10 blur-3xl"
      />

      <section className="relative mx-auto max-w-6xl px-4 pb-10 pt-7 sm:px-6 lg:pt-10">
        <header className="mb-9 flex items-center justify-between text-[#fff9ec]">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-full border border-[#e9cc8a]/40 bg-white/5 text-[#e9cc8a]">
              <GiftIcon className="size-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-none">Natal em Cores</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#d9bd7f]">
                Família reunida
              </p>
            </div>
          </div>
          <p className="text-right text-xs leading-tight text-white/60">
            <span className="font-display block text-xl font-bold text-[#fff9ec]">
              {completed}
              <span className="text-sm text-white/40">/{participants.length}</span>
            </span>
            já sortearam
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-14">
          <div className="pt-2 text-center lg:pt-12 lg:text-left">
            <p className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#f1d795]">
              <span className="h-px w-6 bg-[#e9cc8a]/50" />
              Amigo secreto da família
              <span className="h-px w-6 bg-[#e9cc8a]/50" />
            </p>
            <h1 className="font-display text-5xl font-bold leading-[.96] tracking-[-0.035em] text-[#fff9ec] sm:text-6xl lg:text-7xl">
              Um presente,
              <br />
              <span className="italic text-[#e9bd63]">uma cor,</span> uma
              <br className="hidden lg:block" /> surpresa.
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-7 text-white/68 lg:mx-0 lg:text-base">
              Descubra quem você vai presentear e qual cor vai deixar esse Natal ainda mais
              especial.
            </p>

            <div className="mx-auto mt-8 grid max-w-md grid-cols-3 divide-x divide-[#e9cc8a]/20 border-y border-[#e9cc8a]/20 py-4 lg:mx-0">
              {[
                ['palette', 'Só uma cor', 'do presente à embalagem'],
                ['money', 'Até R$ 30', 'um ou vários mimos'],
                ['secret', 'É segredo', 'nada de contar antes'],
              ].map(([type, title, text]) => (
                <div key={title} className="px-2 text-center">
                  <span className="mx-auto mb-1.5 flex justify-center text-[#e9bd63]">
                    <RuleIcon type={type as 'palette' | 'money' | 'secret'} />
                  </span>
                  <p className="font-display text-[15px] font-bold text-[#fff9ec]">{title}</p>
                  <p className="mt-0.5 text-[10px] italic leading-4 text-white/45">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="relative rounded-[28px] bg-[#fffaf0] p-5 shadow-[0_30px_80px_rgba(0,0,0,.3)] sm:p-7">
            <div className="absolute left-1/2 top-0 h-1 w-24 -translate-x-1/2 rounded-b-full bg-[#c84b43]" />
            {!savedResult ? (
              <>
                <div className="mb-6 text-center">
                  <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#b18b48]">
                    Seu sorteio
                  </p>
                  <h2 className="font-display text-3xl font-bold text-[#17362d]">
                    {confirmed ? `Tudo pronto, ${selectedName}!` : 'Quem é você?'}
                  </h2>
                  <p className="mt-2 text-sm leading-5 text-[#65756f]">
                    {confirmed
                      ? 'Toque no presente para revelar sua dupla e sua cor.'
                      : 'Escolha seu nome com atenção para começar.'}
                  </p>
                </div>

                {!confirmed ? (
                  <div className="space-y-3">
                    <NamePicker
                      onSelect={(name) => {
                        setSelectedName(name)
                        setError('')
                      }}
                      participants={participants}
                      selectedName={selectedName}
                    />
                    <button
                      className="h-14 w-full rounded-2xl bg-[#c64b42] text-sm font-extrabold text-white shadow-[0_9px_22px_rgba(198,75,66,.24)] transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[#b93e37] disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!selectedName || selectedParticipant?.hasDrawn}
                      onClick={() => setConfirmed(true)}
                      type="button"
                    >
                      {selectedParticipant?.hasDrawn ? 'Este nome já sorteou' : 'Sim, sou eu'}
                    </button>
                    {selectedParticipant?.hasDrawn && (
                      <p className="text-center text-xs leading-5 text-[#9a554f]">
                        Cada pessoa só pode sortear uma vez. Escolha outro nome.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      aria-label="Revelar meu amigo secreto e minha cor"
                      className="group relative mx-auto mb-5 grid size-40 place-items-center rounded-full bg-[#f2ead9] transition hover:scale-[1.03] disabled:animate-pulse"
                      disabled={isPending}
                      onClick={handleDraw}
                      type="button"
                    >
                      <span className="absolute inset-3 rounded-full border border-dashed border-[#c9b27e]" />
                      <span className="gift-box relative grid size-24 place-items-center rounded-xl bg-[#c64b42] text-[#ffe9aa] shadow-[0_14px_25px_rgba(77,30,24,.24)]">
                        <span className="absolute left-1/2 top-0 h-full w-5 -translate-x-1/2 bg-[#e6b950]" />
                        <span className="absolute left-0 top-1/2 h-5 w-full -translate-y-1/2 bg-[#e6b950]" />
                        <GiftIcon className="relative z-10 size-9 text-white" />
                      </span>
                    </button>
                    <button
                      className="h-13 w-full rounded-2xl bg-[#173f33] px-5 text-sm font-extrabold text-white transition hover:bg-[#0e3127] disabled:opacity-60"
                      disabled={isPending}
                      onClick={handleDraw}
                      type="button"
                    >
                      {isPending ? 'Embaralhando as cores…' : 'Abrir meu presente'}
                    </button>
                    <button
                      className="mt-3 text-xs font-bold text-[#78837e] underline-offset-4 hover:underline"
                      onClick={() => setConfirmed(false)}
                      type="button"
                    >
                      ← Voltar e trocar o nome
                    </button>
                  </div>
                )}
                {error && (
                  <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700">
                    {error}
                  </p>
                )}
              </>
            ) : (
              <div className="py-2 text-center">
                <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#e7f0e8] text-[#2f7659]">
                  <SparkleIcon />
                </span>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#b18b48]">
                  Resultado de {savedResult.participant}
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-[#17362d]">
                  Seu segredo foi revelado!
                </h2>
                <div className="mt-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c938f]">
                    Você vai presentear
                  </p>
                  <p className="font-display mt-1 text-5xl font-bold leading-tight text-[#c64b42]">
                    {savedResult.assignedName}
                  </p>
                </div>

                <div aria-hidden="true" className="my-5 flex items-center justify-center gap-3 text-[#d4ae60]">
                  <span className="h-px w-16 bg-[#e4d6b8]" />
                  <SparkleIcon className="size-3.5" />
                  <span className="h-px w-16 bg-[#e4d6b8]" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c938f]">
                    Sua cor é
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-2.5">
                    <span
                      className={`size-7 rounded-full shadow-[0_0_0_4px_#fffaf0,0_0_0_5px_#e4d6b8] ${colorClasses[savedResult.assignedColor] ?? 'bg-stone-400'}`}
                    />
                    <p className="font-display text-4xl font-bold text-[#17362d]">
                      {savedResult.assignedColor}
                    </p>
                  </div>
                </div>

                <p className="font-display mx-auto mt-8 max-w-xs text-lg italic leading-snug text-[#9a6f25]">
                  ✎ Anote para não esquecer!
                </p>
                <p className="mx-auto mt-1.5 max-w-xs text-xs leading-5 text-[#65756f]">
                  Escreva num papel ou tire um print de{' '}
                  <strong className="text-[#c64b42]">{savedResult.assignedName}</strong> e{' '}
                  <strong className="text-[#17362d]">{savedResult.assignedColor}</strong>. Depois de
                  voltar ao início, este resultado não aparece mais — e nada de contar pra ninguém!{' '}
                  <SparkleIcon className="inline size-3 -translate-y-px text-[#d4ae60]" />
                </p>

                {!confirmLeave ? (
                  <button
                    className="mt-5 h-13 w-full rounded-2xl bg-[#173f33] px-5 text-sm font-extrabold text-white transition hover:bg-[#0e3127] active:scale-[.98]"
                    onClick={() => setConfirmLeave(true)}
                    type="button"
                  >
                    Voltar ao início
                  </button>
                ) : (
                  <div className="name-pop mt-5 border-t border-[#e4d6b8] pt-4">
                    <p className="font-display text-lg font-bold text-[#17362d]">Já anotou seu resultado?</p>
                    <p className="mt-1 text-xs text-[#65756f]">
                      Ao voltar, outra pessoa poderá sortear neste celular.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        className="h-12 rounded-xl border border-[#dcd8ca] bg-white text-sm font-bold text-[#65756f] transition hover:bg-[#fffaf0]"
                        onClick={() => setConfirmLeave(false)}
                        type="button"
                      >
                        Ainda não
                      </button>
                      <button
                        className="h-12 rounded-xl bg-[#c64b42] text-sm font-extrabold text-white transition hover:bg-[#b93e37]"
                        onClick={goHome}
                        type="button"
                      >
                        Sim, voltar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1.08fr_.92fr]">
          <section className="rounded-[28px] bg-[#f5efe2] p-5 sm:p-7">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#b18b48]">
                  Nossa árvore
                </p>
                <h2 className="font-display mt-1 text-3xl font-bold">Quem já sorteou?</h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-[#2f7659]">{progress}%</p>
                <p className="text-[10px] text-[#78837e]">concluído</p>
              </div>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-[#dcd8ca]">
              <div
                className="h-full rounded-full bg-[#c64b42] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="relative mx-auto mt-7 max-w-md pb-9">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-2 h-[86%] w-[72%] -translate-x-1/2 bg-[#174f3c] [clip-path:polygon(50%_0,100%_100%,0_100%)]"
              />
              <div className="relative z-10 space-y-2.5 px-3 py-4">
                {groupedParticipants.map((row, rowIndex) => (
                  <div className="flex justify-center gap-2" key={rowIndex}>
                    {row.map((participant, index) => (
                      <div
                        className={`flex min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-2 text-[10px] font-bold shadow-sm sm:px-3 sm:text-xs ${
                          participant.hasDrawn
                            ? 'border-[#91c6a9] bg-[#e6f4eb] text-[#236045]'
                            : 'border-[#ead9b6] bg-[#fff9ec] text-[#6d716e]'
                        }`}
                        key={participant.id}
                      >
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${participant.hasDrawn ? 'bg-[#3e9a70]' : 'bg-[#d4ae60]'}`}
                        />
                        <span className="truncate">{participant.name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 h-11 w-12 -translate-x-1/2 rounded-b-md bg-[#805033]"
              />
              <SparkleIcon className="absolute left-1/2 top-[-14px] z-20 size-8 -translate-x-1/2 text-[#e1ae43]" />
            </div>

            <div className="mt-2 flex justify-center gap-5 text-[10px] font-semibold text-[#6e7b75]">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#3e9a70]" /> Já sorteou
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#d4ae60]" /> Ainda falta
              </span>
            </div>
          </section>

          <section className="px-1 pt-6 text-[#fff9ec] sm:px-3 lg:pt-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#e2bd72]">
              Antes de sortear
            </p>
            <h2 className="font-display mt-1 text-3xl font-bold">Regrinhas da brincadeira</h2>
            <ol className="mt-5 divide-y divide-white/10 border-t border-white/10">
              {[
                [
                  'bauble',
                  'Tudo da mesma cor',
                  'O presente do seu amigo deve seguir somente a cor sorteada — começando pela embalagem.',
                ],
                [
                  'gift',
                  'Limite de R$ 30',
                  'Você pode escolher uma coisa só ou vários mimos, desde que o total seja de até trinta reais.',
                ],
                [
                  'candy',
                  'Vale ser criativo',
                  'Comida, acessório, item útil ou engraçado: o importante é respeitar a cor e pensar com carinho.',
                ],
                [
                  'star',
                  'Segredo é segredo',
                  'Não conte quem você tirou nem sua cor. Aqui mostramos apenas quem já fez o sorteio.',
                ],
              ].map(([number, title, text]) => (
                <li className="flex gap-4 py-4" key={number}>
                  <span className="w-9 shrink-0 pt-0.5 text-[#e2bd72]">
                    <XmasIcon type={number as XmasIconType} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold leading-tight">{title}</h3>
                    <p className="mt-1 text-[13px] leading-5 text-white/55">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 border-t border-white/10 pt-6 text-center">
              <p className="font-display text-xl font-bold italic text-[#e9bd63]">
                Capriche no presente e divirta-se!
              </p>
              <p className="mt-1.5 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                <SparkleIcon className="size-3 text-[#c64b42]" />
                O melhor é celebrar juntos
                <SparkleIcon className="size-3 text-[#c64b42]" />
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
