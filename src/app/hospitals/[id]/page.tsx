import { mockHospitals } from '@/lib/mock-data'
import HospitalDetailClient from './HospitalDetailClient'

export function generateStaticParams() {
  return mockHospitals.map((h) => ({ id: h.id }))
}

export default async function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <HospitalDetailClient id={id} />
}
