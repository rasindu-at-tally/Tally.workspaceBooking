import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Calendar, LayoutDashboard, Users, FileText, Settings, PenTool, Video } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-sky-700/40 bg-gradient-to-r from-sky-700 via-indigo-700 to-blue-800 shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/tallygroup-logo.svg"
                  alt="tallygroup"
                  className="h-8 w-auto"
                />
                <span className="sr-only">Office Booking</span>
              </Link>
              <nav className="hidden space-x-4 md:flex">
                <Link
                  to="/"
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-sky-50/80 hover:bg-white/10'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/my-bookings"
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/my-bookings')
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-sky-50/80 hover:bg-white/10'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  My Bookings
                </Link>
                <Link
                  to="/teams"
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/teams')
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-sky-50/80 hover:bg-white/10'
                  }`}
                >
                  <Video className="h-4 w-4" />
                  Teams Meetings
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/floor-plan"
                      className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/admin/floor-plan')
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-sky-50/80 hover:bg-white/10'
                      }`}
                    >
                      <PenTool className="h-4 w-4" />
                      Floor Plan
                    </Link>
                    <Link
                      to="/admin/desks"
                      className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/admin/desks')
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-sky-50/80 hover:bg-white/10'
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      Manage Desks
                    </Link>
                    <Link
                      to="/admin/bookings"
                      className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/admin/bookings')
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-sky-50/80 hover:bg-white/10'
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      All Bookings
                    </Link>
                    <Link
                      to="/admin/audit-logs"
                      className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/admin/audit-logs')
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-sky-50/80 hover:bg-white/10'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      Audit Logs
                    </Link>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-sky-50">
                <div className="font-medium">{user?.full_name}</div>
                <div className="text-xs text-sky-100/80">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-sky-700 shadow-sm transition-colors hover:bg-sky-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 py-8 sm:px-6 lg:px-8" style={{ maxWidth: '1920px' }}>
        <div className="rounded-2xl bg-white/90 p-4 shadow-xl ring-1 ring-black/5 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

