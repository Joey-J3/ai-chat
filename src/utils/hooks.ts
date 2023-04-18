import { CSSProperties, useEffect, useState } from 'react'

export function useIsClient() {
  const [isClient, setClient] = useState(false)

  useEffect(() => {
    setClient(true)
  }, [])

  return isClient
}

export function useVisibilityInClient(): CSSProperties {
  const isClient = useIsClient()
  return { visibility: isClient ?  'visible' : 'hidden' }
}


export const useModal = (initialMode = false) => {   
  const [modalOpen, setModalOpen] = useState(initialMode)   
  const toggle = () => setModalOpen(!modalOpen)   
  return [modalOpen, setModalOpen, toggle] 
}