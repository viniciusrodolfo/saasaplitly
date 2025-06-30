import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
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
    <div className="flex h-screen bg-background">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="flex-1 ml-64 overflow-auto">
        <Header title={getSectionTitle(activeSection)} />
        
        <div className="p-6">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
