import UnicallUsers from "@/app/components/unicall-users/Index";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function UnicallUsersPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <UnicallUsers />
    </ProtectedRoute>
  )
}