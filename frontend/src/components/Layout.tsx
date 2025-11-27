import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Calendar, LayoutDashboard, Users, FileText, Settings, PenTool, Video, DoorOpen, Sparkles, ChevronRight, MapPin } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
      isActive(path)
        ? 'bg-gradient-to-r from-white/25 to-white/10 text-white shadow-lg shadow-cyan-900/20 backdrop-blur-sm'
        : 'text-cyan-100/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
    }`;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-turquoise-50" style={{ backgroundColor: '#e0f7fa' }}>
      {/* Vertical Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col overflow-hidden">
        {/* Dark Cyan Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-700 via-cyan-800 to-cyan-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        {/* Content */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center py-6 border-b border-white/10 px-6">
            <Link to="/" className="flex flex-col items-center group">
                <img
                src="https://demopublic.blob.core.windows.net/assets/tally-logo.svg"
                  alt="tallygroup"
                className="h-14 w-auto rounded-lg transition-transform group-hover:scale-105 mb-2"
                />
              <span className="text-md font-bold text-white tracking-tight">Workspace</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-cyan-200/70">Booking System</span>
            </Link>
          </div>

          {/* Navigation with Custom Scrollbar */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6 sidebar-scroll">
            {/* Main Menu Section */}
            <div className="mb-6">
              <p className="mb-3 flex items-center gap-2 px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200/60">
                <span className="h-px flex-1 bg-gradient-to-r from-cyan-200/20 to-transparent" />
                Menu
                <span className="h-px flex-1 bg-gradient-to-l from-cyan-200/20 to-transparent" />
              </p>
              <div className="space-y-1">
                <Link to="/" className={navLinkClass('/')}>
                  <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">Dashboard</span>
                  {isActive('/') && <ChevronRight className="h-4 w-4 opacity-60" />}
                </Link>
                <Link to="/my-bookings" className={navLinkClass('/my-bookings')}>
                  <Calendar className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">My Bookings</span>
                  {isActive('/my-bookings') && <ChevronRight className="h-4 w-4 opacity-60" />}
              </Link>
                <Link to="/meeting-rooms" className={navLinkClass('/meeting-rooms')}>
                  <DoorOpen className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">Meeting Rooms</span>
                  {isActive('/meeting-rooms') && <ChevronRight className="h-4 w-4 opacity-60" />}
                </Link>
              </div>
            </div>

            {/* Smart Features Section */}
            <div className="mb-6">
              <p className="mb-3 flex items-center gap-2 px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200/60">
                <span className="h-px flex-1 bg-gradient-to-r from-cyan-200/20 to-transparent" />
                Smart
                <span className="h-px flex-1 bg-gradient-to-l from-cyan-200/20 to-transparent" />
              </p>
              <div className="space-y-1">
                <Link to="/teams" className={navLinkClass('/teams')}>
                  <Video className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">Teams Meetings</span>
                  {isActive('/teams') && <ChevronRight className="h-4 w-4 opacity-60" />}
                </Link>
                <Link to="/smart-recommendations" className={navLinkClass('/smart-recommendations')}>
                  <Sparkles className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">AI Recommendations</span>
                  {isActive('/smart-recommendations') && <ChevronRight className="h-4 w-4 opacity-60" />}
                </Link>
              </div>
            </div>

            {/* Admin Section */}
                {isAdmin && (
              <div>
                <p className="mb-3 flex items-center gap-2 px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200/60">
                  <span className="h-px flex-1 bg-gradient-to-r from-cyan-200/20 to-transparent" />
                  Admin
                  <span className="h-px flex-1 bg-gradient-to-l from-cyan-200/20 to-transparent" />
                </p>
                <div className="space-y-1">
                  <Link to="/admin/floor-plan" className={navLinkClass('/admin/floor-plan')}>
                    <PenTool className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">Floor Plan</span>
                    {isActive('/admin/floor-plan') && <ChevronRight className="h-4 w-4 opacity-60" />}
                    </Link>
                  <Link to="/admin/desks" className={navLinkClass('/admin/desks')}>
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">Manage Desks</span>
                    {isActive('/admin/desks') && <ChevronRight className="h-4 w-4 opacity-60" />}
                    </Link>
                  <Link to="/admin/bookings" className={navLinkClass('/admin/bookings')}>
                    <Users className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">All Bookings</span>
                    {isActive('/admin/bookings') && <ChevronRight className="h-4 w-4 opacity-60" />}
                    </Link>
                  <Link to="/admin/audit-logs" className={navLinkClass('/admin/audit-logs')}>
                    <FileText className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">Audit Logs</span>
                    {isActive('/admin/audit-logs') && <ChevronRight className="h-4 w-4 opacity-60" />}
                    </Link>
                </div>
              </div>
                )}
              </nav>

          {/* User Profile & Logout */}
          <div className="border-t border-white/10 p-4">
            {/* User Card */}
            <div className="mb-3 rounded-xl bg-gradient-to-r from-white/15 to-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-teal-400 text-sm font-bold text-cyan-900 shadow-lg">
                  {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{user?.full_name}</div>
                  <div className="truncate text-xs text-cyan-200/70">{user?.email}</div>
            </div>
              </div>
              {/* User Location Badge */}
              {user?.location && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                  <span className="text-xs font-medium text-cyan-100">{user.location}</span>
                </div>
              )}
              {!user?.location && isAdmin && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-xs font-medium text-emerald-100">All Locations</span>
                </div>
              )}
            </div>
            
            {/* Logout Button */}
              <button
                onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-red-500/80 hover:shadow-lg hover:shadow-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
      </aside>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Main Content - Light Turquoise Background */}
      <main className="ml-72 flex-1 p-8" style={{ backgroundColor: '#e0f7fa' }}>
        <div className="min-h-[calc(100vh-4rem)] rounded-3xl bg-white p-8 shadow-xl shadow-cyan-200/30 ring-1 ring-cyan-100">
          {children}
        </div>
      </main>
    </div>
  );
}
