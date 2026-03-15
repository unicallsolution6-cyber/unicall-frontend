import AddLeadFile from "@/app/components/add-lead-file/Index";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AddLeadFilePage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AddLeadFile />
    </ProtectedRoute>
  )
}
