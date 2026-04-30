"use client"

import { supabase } from '@/lib/supabaseClient'
import { createContext, useContext, useState, useEffect } from "react"
import { Activity, DpRecord } from '@/types'
import { mockActivities, mockDpRecords } from '@/lib/mockData'

type RopaContextType = {
  activities: Activity[]
  dpRecords: DpRecord[]
  addActivity: (data: Activity) => void
  updateActivity: (id: string, data: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  getActivityById: (id: string) => Activity | undefined
  addDpRecord: (data: DpRecord) => void
  updateDpRecord: (id: string, data: Partial<DpRecord>) => void
  deleteDpRecord: (id: string) => void
}

const RopaContext = createContext<RopaContextType | null>(null)

export function RopaProvider({ children }: { children: React.ReactNode }) {

  // const [activities, setActivities] = useState<Activity[]>([])
  // const [dpRecords, setDpRecords] = useState<DpRecord[]>([])
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [dpRecords, setDpRecords] = useState<DpRecord[]>(mockDpRecords)

  // ✅ โหลดข้อมูลจาก Supabase ตอนเปิดเว็บ
  // useEffect(() => {
  //   const fetchActivities = async () => {
  //     const { data, error } = await supabase
  //       .from('activities')
  //       .select('*')

  //     if (!error && data) {
  //       setActivities(data)
  //     }
  //   }

  //   fetchActivities()
  // }, [])

  type CreateActivityInput = {
  activityName: string;
  status: string;
};

  // ---------- Activity ----------
  const addActivity = async (data: CreateActivityInput) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("No user");
    return;
  }

  const { data: inserted, error } = await supabase
    .from('activities')
    .insert({
      activity_name: data.activityName,
      user_id: user.id, // ✅ correct source
      approval_status: data.status,
    })
    .select()
    .single();

  if (error) {
    console.error(error.message);
    return;
  }

  if (inserted) {
    setActivities((prev) => [...prev, inserted]);
  }
};

  const updateActivity = async (id: string, data: Partial<Activity>) => {
    await supabase
      .from('activities')
      .update({
        approval_status: data.status
      })
      .eq('activity_id', id)

    setActivities(prev =>
      prev.map(a => a.id === id ? { ...a, ...data } : a)
    )
  }

  const deleteActivity = async (id: string) => {
    await supabase
      .from('activities')
      .delete()
      .eq('activity_id', id)

    setActivities(prev => prev.filter(a => a.id !== id))
  }

  const getActivityById = (id: string) => {
    return activities.find(a => a.id === id)
  }

  // ---------- DP ----------
  const addDpRecord = (data: DpRecord) => {
    setDpRecords(prev => [...prev, data])
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