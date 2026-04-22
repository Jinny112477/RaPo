"use client"

import { createContext, useContext, useState } from "react"
// 1. นำเข้า Mock Data และ Types
import { mockActivities, mockDpRecords } from '@/lib/mockData'
import { Activity, DpRecord } from '@/types'

// 2. กำหนด Type ของ Context ให้ครอบคลุมทั้ง Activities และ DpRecords
type RopaContextType = {
  activities: Activity[]
  dpRecords: DpRecord[]
  addActivity: (data: Activity) => void
  updateActivity: (id: string, data: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  getActivityById: (id: string) => Activity | undefined
  // เพิ่มส่วนของ DpRecords
  addDpRecord: (data: DpRecord) => void
  updateDpRecord: (id: string, data: Partial<DpRecord>) => void
  deleteDpRecord: (id: string) => void
}

const RopaContext = createContext<RopaContextType | null>(null)

export function RopaProvider({ children }: { children: React.ReactNode }) {
  // 3. เริ่มต้น State ด้วย Mock Data
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [dpRecords, setDpRecords] = useState<DpRecord[]>(mockDpRecords)

  /** --- ส่วนจัดการ Activity --- **/
  const addActivity = (data: Activity) => {
    setActivities(prev => [...prev, { ...data, id: Date.now().toString() }])
  }

  const updateActivity = (id: string, data: Partial<Activity>) => {
    setActivities(prev =>
      prev.map(a => a.id === id ? { ...a, ...data } : a)
    )
  }

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  const getActivityById = (id: string) => {
    return activities.find(a => a.id === id)
  }

  /** --- ส่วนจัดการ DpRecord (เพิ่มใหม่) --- **/
  const addDpRecord = (data: DpRecord) => {
    setDpRecords(prev => [...prev, { ...data, id: Date.now().toString() }])
  }

  const updateDpRecord = (id: string, data: Partial<DpRecord>) => {
    setDpRecords(prev => 
      prev.map(d => d.id === id ? { ...d, ...data } : d)
    )
  }

  const deleteDpRecord = (id: string) => {
    setDpRecords(prev => prev.filter(d => d.id !== id))
  }

  return (
    // 4. ส่งค่าทั้งหมดผ่าน Provider value
    <RopaContext.Provider value={{
      activities,
      dpRecords,
      addActivity,
      updateActivity,
      deleteActivity,
      getActivityById,
      addDpRecord,
      updateDpRecord,
      deleteDpRecord
    }}>
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