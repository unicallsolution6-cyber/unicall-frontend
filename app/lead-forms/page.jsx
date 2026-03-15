import LeadForms from "../components/lead-forms/Index";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function LeadFormsPage() {
  return (
    <ProtectedRoute>
      <LeadForms />
    </ProtectedRoute>
  )
}