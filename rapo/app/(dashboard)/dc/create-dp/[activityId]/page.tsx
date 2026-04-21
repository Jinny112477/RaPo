'use client'

import { useParams } from 'next/navigation'
import RopaDPForm from '@/components/RopaDPForm'

export default function CreateDPPage() {
  const params = useParams<{ activityId: string }>()
  const activityId = params.activityId

  return (
    <div className="p-6">
      <RopaDPForm activityId={activityId} />
    </div>
  )
}