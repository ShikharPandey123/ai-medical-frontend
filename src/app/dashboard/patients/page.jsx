import PatientsClient, { AddPatientButton } from "@/components/patients/patients-client"

export default function PatientsPage() {
  return (
    <main className="w-full">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance">Patients</h1>
          <AddPatientButton />
        </div>

        <PatientsClient />
      </div>
    </main>
  )
}
