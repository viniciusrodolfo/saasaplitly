import { Button } from '@/components/ui/button';
import { Bell, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import AppointmentModal from '@/components/modals/appointment-modal';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const getDescription = (title: string): string => {
    const descriptions = {
      'Dashboard': "Welcome back! Here's what's happening today.",
      'Calendar Management': "Manage your appointments and schedule.",
      'Client Management': "View and manage your client information.",
      'Service Management': "Configure your services and pricing.",
      'Availability Settings': "Set your working hours and availability.",
      'Booking Form': "Customize your public booking form.",
      'Analytics & Reports': "View your business insights and metrics.",
    };
    return descriptions[title as keyof typeof descriptions] || "Manage your business effectively.";
  };

  return (
    <>
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground mt-1">{getDescription(title)}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-destructive" />
            </Button>
            
            <Button onClick={() => setShowAppointmentModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>
      </header>

      <AppointmentModal
        open={showAppointmentModal}
        onOpenChange={setShowAppointmentModal}
      />
    </>
  );
}
