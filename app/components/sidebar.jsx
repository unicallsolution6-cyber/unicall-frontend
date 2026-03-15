import {
  LayoutDashboard,
  FileText,
  Users,
  UserCheck,
  Settings,
  LogOut,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useLayoutData } from '../LayoutWrapper';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar({ userInfo }) {
  const { role, setRole } = useLayoutData();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const sidebarItems =
    (user?.role || role) === 'admin'
      ? [
          {
            icon: LayoutDashboard,
            label: 'Dashboard',
            link: '/admin/dashboard',
          },
          { icon: FileText, label: 'Leads Forms', link: '/admin/lead-forms' },
          { icon: Users, label: 'Clients', link: '/admin/clients' },
          {
            icon: UserCheck,
            label: 'Unicall Users',
            link: '/admin/unicall-users',
          },
          { icon: UserCheck, label: 'Personal Images', link: '/admin/images' },
        ]
      : [
          { icon: LayoutDashboard, label: 'Dashboard', link: '/dashboard' },
          { icon: FileText, label: 'Leads Forms', link: '/lead-forms' },
          { icon: Users, label: 'Clients', link: '/clients' },
          { icon: CreditCard, label: 'Card Lookup', link: '/card-lookup' },
        ];

  // Function to check if a route is active
  const isActiveRoute = (link) => {
    if (pathname === link) return true;

    // Handle sub-routes for better matching
    if (
      link.includes('dashboard') &&
      (pathname.includes('dashboard') ||
        pathname === '/' ||
        pathname === '/admin')
    )
      return true;
    if (link.includes('lead-forms') && pathname.includes('lead-forms'))
      return true;
    if (
      link.includes('clients') &&
      pathname.includes('clients') &&
      !pathname.includes('add-client')
    )
      return true;
    if (link.includes('unicall-users') && pathname.includes('unicall-users'))
      return true;
    if (link.includes('user-details') && pathname.includes('user-details'))
      return true;
    if (link.includes('card-lookup') && pathname.includes('card-lookup'))
      return true;

    // Handle add-client page - should highlight Clients tab
    if (link.includes('clients') && pathname.includes('add-client'))
      return true;

    return false;
  };

  const defaultUser = {
    name: 'Asril Mohammad',
    email: 'asril.m@hotmail.com',
    role: 'Sales Representative',
    avatar: '/user.png',
  };

  const displayUser = user || userInfo || defaultUser;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-gradient-to-b from-purple-500 to-pink-500 flex flex-col rounded-r-4xl !z-10">
      {/* User Profile Section */}
      <div className="p-6 text-center">
        <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-white">
          <img
            src={displayUser.avatar || '/placeholder.svg'}
            alt={displayUser.name}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-white font-semibold text-lg mb-1">
          {displayUser.name}
        </h3>
        <p className="text-white/80 text-sm">
          {displayUser.email} | {displayUser.role}
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.link}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute(item.link)
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Menu */}
      <div className="p-4 space-y-2 mb-4">
        <Link
          href="/user-details"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActiveRoute('/user-details')
              ? 'bg-white/30 text-white'
              : 'text-white/70 hover:text-white bg-white/10 hover:bg-white/20'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>User Setting</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
