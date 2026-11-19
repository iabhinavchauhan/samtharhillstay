import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900)

  useEffect(() => {
    const checkMobile = () => window.innerWidth <= 900
    const handleResize = () => setIsMobile(checkMobile())
    const handleMove = (event) => setPosition({ x: event.clientX, y: event.clientY })

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMove)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMove)
    }
  }, [])

  useEffect(() => {
    const handleContextMenu = (event) => event.preventDefault()
    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  if (isMobile) return null

  return <div className="custom-cursor" style={{ transform: `translate(${position.x}px, ${position.y}px)` }} aria-hidden="true" />
}
