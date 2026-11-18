import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center text-[#fff9ec]">
      <h1 className="font-display text-3xl font-bold">Página não encontrada</h1>
      <Link className="mt-6 font-bold text-[#e9bd63] underline-offset-4 hover:underline" href="/">
        ← Voltar para o sorteio
      </Link>
    </main>
  )
}
