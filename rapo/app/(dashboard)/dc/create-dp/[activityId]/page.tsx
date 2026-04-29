'use client'

import { useParams, useSearchParams } from 'next/navigation'
import RopaDPForm from '@/components/RopaDPForm'

export default function CreateDPPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const activityId = params?.activityId as string
  const editRequestId = searchParams.get('edit') || undefined

  return (
    <div className="max-w-2xl mx-auto py-6">
      <RopaDPForm activityId={activityId} editRequestId={editRequestId} />
    </div>
  )
}