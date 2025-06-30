import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import DashboardSection from '@/components/sections/dashboard-section';
import CalendarSection from '@/components/sections/calendar-section';
import ClientsSection from '@/components/sections/clients-section';
import ServicesSection from '@/components/sections/services-section';
import AvailabilitySection from '@/components/sections/availability-section';
import BookingFormSection from '@/components/sections/booking-form-section';
import AnalyticsSection from '@/components/sections/analytics-section';

export type Section = 'dashboard' | 'calendar' | 'clients' | 'services' | 'availability' | 'booking-form' | 'analytics';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed on mobile

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getSectionTitle = (section: Section): string => {
    const titles = {
      dashboard: 'Dashboard',
      calendar: 'Calendar Management',
      clients: 'Client Management',
      services: 'Service Management',
      availability: 'Availability Settings',
      'booking-form': 'Booking Form',
      analytics: 'Analytics & Reports',
    };
    return titles[section];
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'calendar':
        return <CalendarSection />;
      case 'clients':
        return <ClientsSection />;
      case 'services':
        return <ServicesSection />;
      case 'availability':
        return <AvailabilitySection />;
      case 'booking-form':
        return <BookingFormSection />;
      case 'analytics':
        return <AnalyticsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative z-50 h-full transition-all duration-300 ease-in-out",
        sidebarCollapsed 
          ? "-translate-x-full lg:translate-x-0 lg:w-16" 
          : "translate-x-0 w-64 lg:w-64"
      )}>
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
      </div>
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
        "lg:ml-0", // Remove margin on large screens since sidebar is fixed
        !sidebarCollapsed && "lg:ml-64", // Add margin when sidebar is expanded on large screens
        sidebarCollapsed && "lg:ml-16" // Add small margin when sidebar is collapsed on large screens
      )}>
        <Header 
          title={getSectionTitle(activeSection)} 
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          showMenuButton={true}
        />
        
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
