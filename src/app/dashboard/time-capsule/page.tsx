import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import GlobalZenoPlayer from '@/components/GlobalZenoPlayer';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Time Capsule | Rise Radio',
  description:
    'Travel through the soundtrack of the 1900s with Amanda and Mark every other Sunday at 4:00 PM ET on Rise Radio.',
  openGraph: {
    title: 'Time Capsule | Rise Radio',
    description:
      'Any song. Any genre. Any time. Travel through the soundtrack of the 1900s with Amanda and Mark.',
    images: ['/images/main-images/Cover Art/time-capsule-cover.jpg'],
  },
};

const eras = ['1900s', '1920s', '1940s', '1960s', '1970s', '1980s', '1990s'];

export default function TimeCapsulePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-cormorant text-gray-100">
      <div className="fixed inset-0 z-0 bg-black">
        <Image
          src="/images/main-images/Cover Art/time-capsule-cover.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover opacity-35 blur-xl"
        />
        <Image
          src="/images/main-images/Cover Art/time-capsule-cover.jpg"
          alt="Time Capsule artwork featuring a phoenix and music from across the 1900s"
          fill
          priority
          sizes="100vw"
          className="object-contain object-top opacity-60 md:object-cover md:object-center md:opacity-50"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.18),rgba(0,0,0,0.74)_48%,rgba(0,0,0,0.98)_82%)] md:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.38),rgba(0,0,0,0.82)_65%,rgba(0,0,0,0.98))]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="flex-grow px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(7rem+env(safe-area-inset-top))] sm:px-6 md:px-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
            <Link
              href="/dashboard"
              className="mb-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-orange-400/30 bg-black/65 px-5 font-cinzel text-xs font-bold uppercase tracking-widest text-orange-200 backdrop-blur-md transition-colors hover:border-orange-300 hover:text-white"
            >
              <span aria-hidden="true">←</span> Back to Dashboard
            </Link>

            <section className="flex min-h-[calc(100svh-10rem)] w-full items-center justify-center py-10 text-center">
              <div className="w-full max-w-4xl rounded-[2rem] border border-orange-300/35 bg-black/68 px-5 py-10 shadow-[0_0_80px_rgba(234,88,12,0.24)] backdrop-blur-md sm:px-10 md:py-14">
                <p className="font-cinzel text-xs font-bold uppercase tracking-[0.45em] text-orange-300">
                  Rise Radio Presents
                </p>
                <h1 className="mt-5 bg-gradient-to-r from-amber-100 via-orange-300 to-fuchsia-400 bg-clip-text font-cinzel-decorative text-4xl font-bold uppercase tracking-wide text-transparent drop-shadow-[0_0_24px_rgba(249,115,22,0.45)] min-[390px]:text-5xl sm:text-7xl md:text-8xl">
                  Time Capsule
                </h1>
                <p className="mt-5 font-cinzel text-base uppercase tracking-[0.2em] text-orange-100 sm:text-2xl sm:tracking-[0.25em]">
                  Hosted by Amanda &amp; Mark
                </p>

                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
                  <span className="rounded-full border border-orange-400/50 bg-orange-950/70 px-5 py-3 font-cinzel text-xs font-bold uppercase tracking-widest text-orange-100 sm:text-sm">
                    Every Other Sunday
                  </span>
                  <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-950/65 px-5 py-3 font-cinzel text-xs font-bold uppercase tracking-widest text-fuchsia-100 sm:text-sm">
                    4:00 PM ET
                  </span>
                </div>

                <p className="mt-6 text-base italic text-amber-100/85 sm:text-lg">
                  Premiered August 2, 2026 · Next journey August 16, 2026
                </p>
                <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-gray-100 sm:text-3xl">
                  Any song. Any genre. Any time. Travel through the soundtrack of the 1900s—where every song has a story and every era opens another door.
                </p>
              </div>
            </section>

            <section className="mt-16 w-full max-w-4xl rounded-3xl border border-orange-400/30 bg-black/80 p-5 text-center shadow-2xl backdrop-blur-xl sm:p-7 md:p-10">
              <div className="mb-7 text-center">
                <div className="mb-4 flex items-center justify-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
                  </span>
                  <h2 className="font-cinzel text-xs font-bold uppercase tracking-[0.4em] text-gray-300">
                    Listen Live on Rise Radio
                  </h2>
                </div>
                <p className="text-lg text-orange-200/80">Choose your Rise station and step into the Time Capsule.</p>
              </div>
              <GlobalZenoPlayer className="shadow-[0_0_35px_rgba(124,58,237,0.18)]" />
            </section>

            <section className="mt-24 w-full max-w-5xl rounded-3xl border border-fuchsia-400/20 bg-black/70 px-5 py-12 text-center shadow-2xl backdrop-blur-md sm:px-10 md:py-16">
              <p className="font-cinzel text-xs font-bold uppercase tracking-[0.4em] text-fuchsia-300">One Incredible Journey</p>
              <h2 className="mt-4 font-cinzel-decorative text-4xl font-bold uppercase tracking-wider text-orange-100 md:text-6xl">
                A Century of Sound
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-gray-200 md:text-2xl">
                From gramophones and jazz halls to disco balls, electric guitars, mixtapes, and everything between—Amanda and Mark cross decades, genres, and memories without putting music in a box.
              </p>
              <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
                {eras.map((era) => (
                  <span
                    key={era}
                    className="rounded-xl border border-amber-300/30 bg-gradient-to-br from-orange-950/80 to-violet-950/70 px-5 py-3 font-cinzel text-sm font-bold tracking-widest text-amber-100"
                  >
                    {era}
                  </span>
                ))}
              </div>
            </section>

            <section className="mt-24 w-full border-t border-orange-500/20 pt-20 text-center">
              <div className="text-center">
                <p className="font-cinzel text-xs font-bold uppercase tracking-[0.4em] text-orange-300">Your Guides Through Time</p>
                <h2 className="mt-4 font-cinzel-decorative text-4xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-fuchsia-400 md:text-6xl">
                  Meet the Hosts
                </h2>
              </div>

              <div className="mx-auto mt-14 grid w-full max-w-5xl gap-8 lg:grid-cols-2">
                <article className="overflow-hidden rounded-3xl border border-orange-400/30 bg-black/80 text-center shadow-2xl backdrop-blur-lg">
                  <div className="relative aspect-[4/3] w-full bg-zinc-950">
                    <Image
                      src="/images/misc/amanda-bio.jpg"
                      alt="Amanda, co-host of Time Capsule"
                      fill
                      sizes="(max-width: 1024px) 92vw, 44vw"
                      className="object-cover object-[center_48%]"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-7 text-center">
                      <h3 className="font-cinzel-decorative text-4xl font-bold text-orange-200">Amanda</h3>
                      <p className="font-cinzel text-xs uppercase tracking-[0.3em] text-orange-400">Papaduck78</p>
                    </div>
                  </div>
                  <div className="space-y-4 p-7 text-xl leading-relaxed text-gray-200 md:p-9">
                    <p>
                      Amanda is a distinctive Rise Radio voice and a rich contralto vocalist who has spent more than a decade creating music on Smule and connecting with listeners through her expressive style.
                    </p>
                    <p>
                      Based in England, she brings curiosity, community, and an instinct for the story inside a song to Time Capsule—helping every era feel immediate again.
                    </p>
                  </div>
                </article>

                <article className="overflow-hidden rounded-3xl border border-fuchsia-400/30 bg-black/80 text-center shadow-2xl backdrop-blur-lg">
                  <div className="relative aspect-[4/3] w-full bg-zinc-950">
                    <Image
                      src="/images/misc/mark-time-capsule.png"
                      alt="Mark, co-host of Time Capsule"
                      fill
                      sizes="(max-width: 1024px) 92vw, 44vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-7 text-center">
                      <h3 className="font-cinzel-decorative text-4xl font-bold text-fuchsia-200">Mark</h3>
                      <p className="font-cinzel text-xs uppercase tracking-[0.3em] text-fuchsia-400">Co-host &amp; Musical Time Traveler</p>
                    </div>
                  </div>
                  <div className="space-y-4 p-7 text-xl leading-relaxed text-gray-200 md:p-9">
                    <p>
                      Mark joins Amanda at the controls for a journey that can leap from one decade, mood, or genre to another without warning.
                    </p>
                    <p>
                      Together they uncover the songs, stories, and surprises that made the twentieth century sound like no other—one remarkable stop at a time.
                    </p>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
