'use client'

import { useSearchParams } from 'next/navigation'
import RopaDCForm from '@/components/RopaDCForm'

export default function CreateRopaPage() {
  const searchParams = useSearchParams()
  const editActivityId = searchParams.get('edit') || undefined

  return (
    <div className="max-w-2xl mx-auto">      
      <RopaDCForm editActivityId={editActivityId} />
    </div>
  )
}