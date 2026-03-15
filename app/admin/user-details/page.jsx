

import UserDetails from "@/app/components/user-details/Index";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function UserDetailsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <UserDetails />
    </ProtectedRoute>
  )
}