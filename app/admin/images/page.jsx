import PersonalImages from '@/app/components/personal-images';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function LeadFormsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <PersonalImages />
    </ProtectedRoute>
  );
}
