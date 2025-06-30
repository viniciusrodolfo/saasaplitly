import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Section } from '@/pages/dashboard';
import {
  CalendarDays,
  BarChart3,
  Calendar,
  Users,
  Settings,
  Clock,
  Link,
  PieChart,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ activeSection, setActiveSection, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const navigationItems = [
    { id: 'dashboard' as Section, label: t('dashboard'), icon: BarChart3 },
    { id: 'calendar' as Section, label: t('calendar'), icon: Calendar },
    { id: 'clients' as Section, label: t('clients'), icon: Users },
    { id: 'services' as Section, label: t('services'), icon: Settings },
    { id: 'availability' as Section, label: t('availability'), icon: Clock },
    { id: 'booking-form' as Section, label: t('bookingForm'), icon: Link },
    { id: 'analytics' as Section, label: t('analytics'), icon: PieChart },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div 
      className={cn(
        "h-full bg-sidebar border-r border-border flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center")}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">Apptly</h1>
                <p className="text-xs text-sidebar-foreground/60">{t('appointmentManager')}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 h-auto"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground/70",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Actions */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center space-x-3 justify-start",
            isCollapsed && "justify-center px-2"
          )}
        >
          {theme === 'dark' ? (
            <Sun className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
          ) : (
            <Moon className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
          )}
          {!isCollapsed && <span className="text-sm">{t('toggleTheme')}</span>}
        </Button>

        {/* User Info */}
        {!isCollapsed && (
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-sidebar-accent/50">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-xs">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.businessName || t('professional')}
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center space-x-3 justify-start text-destructive hover:text-destructive",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
          {!isCollapsed && <span className="text-sm">{t('logout')}</span>}
        </Button>
      </div>
    </div>
  );
}