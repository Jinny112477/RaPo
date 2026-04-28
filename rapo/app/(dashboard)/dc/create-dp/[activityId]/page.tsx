'use client'

import { useParams } from 'next/navigation'
import RopaDPForm from '@/components/RopaDPForm'

export default function CreateDPPage() {
  const params = useParams()
  const activityId = params?.activityId as string

  return (
    <div className="p-6">
      <RopaDPForm activityId={activityId} />
    </div>
  )
}