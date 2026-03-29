
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home,
  BookOpen, 
  LogOut,
  ArrowLeft,
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/' || location.pathname === '';

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="edu-container flex items-center justify-between gap-3 py-3 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {!isHome && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Go back"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-edu-blue to-edu-purple shadow-md shadow-edu-blue/20">
              <BookOpen className="h-5 w-5 text-black sm:h-6 sm:w-6" />
            </div>
            <span className="truncate text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              <span className="bg-gradient-to-r from-edu-blue to-edu-purple bg-clip-text text-blue">
                Exam Prep
              </span>
            </span>
          </Link>
        </div>
        
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link to={user?.role === 'student' ? '/student' : '/teacher'}>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Dashboard">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-gray-600 md:inline">
                {user?.name} ({user?.role})
              </span>
              
              <Button variant="ghost" size="sm" onClick={logout} className="text-gray-700">
                <LogOut className="mr-0 h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-gray-300">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-edu-blue shadow-sm hover:bg-edu-blue/90">
                  Register
                </Button>
              </Link>
              {/* <Link to="/authorization">
                <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
                  Upload question
                </Button>
              </Link> */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
