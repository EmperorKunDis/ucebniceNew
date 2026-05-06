import Image from 'next/image'

export function Footer() {
  return (
    <footer className="w-full mt-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
        <div className="relative w-full aspect-[13.79/1]">
          <Image
            src="/images/LogaUcebnice.png"
            alt="Loga partnerů Učebnice AI"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-contain"
            priority={false}
          />
        </div>
      </div>
    </footer>
  )
}
