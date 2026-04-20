"use client"

import { createContext, useContext, useState } from "react"

type RopaContextType = {
  activities: any[]
  addActivity: (data: any) => void
}

const RopaContext = createContext<RopaContextType | null>(null)

export function RopaProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<any[]>([])

  const addActivity = (data: any) => {
    setActivities((prev) => [...prev, data])
  }

  return (
    <RopaContext.Provider value={{ activities, addActivity }}>
      {children}
    </RopaContext.Provider>
  )
}

export function useRopa() {
  const context = useContext(RopaContext)

  if (!context) {
    throw new Error("useRopa must be used inside RopaProvider")
  }

  return context
}