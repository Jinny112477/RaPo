'use client'

import { useParams } from 'next/navigation'
import RopaDPForm from '@/components/RopaDPForm'

export default function CreateDPPage() {
  const params = useParams()

  return (
    <RopaDPForm activityId={params.activityId as string} />
  )
}