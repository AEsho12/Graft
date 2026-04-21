import {
  CloudDownloadIcon,
  type DiscoverAppItem,
} from '@/data/discoverAppMap'
import { seeAllAppMap } from '@/data/seeAllAppMap'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function AppAction({ action }: { action: DiscoverAppItem['action'] }) {
  if (action === 'update') return <>Update</>
  if (action === 'cloud') return <CloudDownloadIcon />
  return <>Get</>
}

export function SeeAllPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isExiting, setIsExiting] = useState(false)
  const shouldAnimateIn =
    (location.state as { transition?: string } | null)?.transition === 'discover-see-all'

  const handleBack = () => {
    if (isExiting) return
    setIsExiting(true)
    window.setTimeout(() => {
      navigate(-1)
    }, 220)
  }

  const pageTransition = isExiting
    ? { duration: 0.22, ease: [0.4, 0, 1, 1] as const }
    : { type: 'spring' as const, stiffness: 145, damping: 28, mass: 1.0 }
  const baseOffsetX = 0

  useEffect(() => {
    const scroller = document.querySelector('.desktop-content') as HTMLElement | null
    if (!scroller) return
    scroller.scrollTop = 0
  }, [])

  return (
    <section className="discover-page discover-layout">
      <motion.button
        className="see-all-back"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => console.log('hover started!')}
        onClick={handleBack}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="#141B34"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18" />
        </svg>
      </motion.button>
      <div className="discover-content see-all-content">
        <h1 className="discover-heading">Open Source Apps we Love Right Now</h1>
        <motion.div
          initial={shouldAnimateIn ? { x: baseOffsetX + 36, opacity: 0.9 } : { x: baseOffsetX }}
          animate={isExiting ? { x: baseOffsetX + 28, opacity: 0 } : { x: baseOffsetX, opacity: 1 }}
          transition={pageTransition}
        >
          <section className="discover-app-grid see-all-grid">
            {seeAllAppMap.map((app) => (
              <article key={app.title} className="discover-app-card see-all-card">
                <div className="discover-app-main">
                  <div className="discover-app-icon" aria-hidden="true">
                    <img src={app.icon} alt="" />
                  </div>
                  <div className="see-all-card-copy">
                    <h3 className="discover-app-title">{app.title}</h3>
                    <p className="discover-app-subtitle">{app.subtitle}</p>
                    <button
                      className={`discover-app-get see-all-card-action ${app.action === 'cloud' ? 'discover-app-get-icon' : ''}`}
                    >
                      <AppAction action={app.action} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </motion.div>
      </div>
    </section>
  )
}
