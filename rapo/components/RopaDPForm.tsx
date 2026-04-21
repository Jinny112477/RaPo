'use client'

interface Props {
  activityId: string
}

export default function RopaDPForm({ activityId }: Props) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">DP Form</h1>
      <p className="text-sm text-gray-500">
        Activity ID: {activityId}
      </p>
    </div>
  )
}