import LeadForms from "@/app/components/lead-forms/Index";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function LeadFormsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <LeadForms />
    </ProtectedRoute>
  )
}