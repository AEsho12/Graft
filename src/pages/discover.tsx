import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  CloudDownloadIcon,
  discoverAppMap,
  type DiscoverAppItem,
} from '@/data/discoverAppMap'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AppAction({ action }: { action: DiscoverAppItem['action'] }) {
  if (action === 'update') return <>Update</>
  if (action === 'cloud') return <CloudDownloadIcon />
  return <>Get</>
}

function CarouselSpacing() {
  return (
    <Carousel className="w-full">
      <CarouselContent className="-ml-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-[4/3] items-center justify-center p-5">
                  <span className="text-xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
      <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
    </Carousel>
  )
}

export function DiscoverPage() {
  const navigate = useNavigate()
  const handleOpenSeeAll = () => {
    const scroller = document.querySelector('.desktop-content') as HTMLElement | null
    if (scroller) {
      window.sessionStorage.setItem('discover-scroll-top', String(scroller.scrollTop))
    }
    navigate('/see-all', { state: { transition: 'discover-see-all' } })
  }

  useEffect(() => {
    const scroller = document.querySelector('.desktop-content') as HTMLElement | null
    const saved = window.sessionStorage.getItem('discover-scroll-top')
    if (!scroller || saved === null) return

    const savedTop = Number(saved)
    if (Number.isFinite(savedTop)) {
      scroller.scrollTop = savedTop
    }
    window.sessionStorage.removeItem('discover-scroll-top')
  }, [])

  return (
    <section className="discover-page discover-layout">
      <div className="discover-content">
        <h1 className="discover-heading">Discover</h1>
        <article className="discover-hero-carousel">
          <Carousel className="w-full">
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-[16/5] items-center justify-center p-6">
                        <span className="text-4xl font-semibold">{index + 1}</span>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2" />
            <CarouselNext className="right-3 top-1/2 -translate-y-1/2" />
          </Carousel>
        </article>

        <section className="discover-feature-grid">
          <article className="discover-feature-strip">
            <CarouselSpacing />
          </article>
        </section>

        <div className="discover-divider" aria-hidden="true" />
        <div className="discover-section-row">
          <h2 className="discover-section-heading">Open Source Apps we Love Right Now</h2>
          <button
            className="discover-section-link"
            onClick={handleOpenSeeAll}
          >
            See All
          </button>
        </div>

        <section className="discover-app-grid">
          {discoverAppMap.map((app) => (
            <article key={app.title} className="discover-app-card">
              <div className="discover-app-main">
                <div className="discover-app-icon" aria-hidden="true">
                  <img src={app.icon} alt="" />
                </div>
                <div>
                  <h3 className="discover-app-title">{app.title}</h3>
                  <p className="discover-app-subtitle">{app.subtitle}</p>
                </div>
              </div>
              <button
                className={`discover-app-get ${app.action === 'cloud' ? 'discover-app-get-icon' : ''}`}
              >
                <AppAction action={app.action} />
              </button>
            </article>
          ))}
        </section>
      </div>
    </section>
  )
}
