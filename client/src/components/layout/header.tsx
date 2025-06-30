import { Button } from '@/components/ui/button';
import { Bell, Plus, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import AppointmentModal from '@/components/modals/appointment-modal';
import { useLanguage } from '@/hooks/use-language';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export default function Header({ title, onMenuClick, showMenuButton = false }: HeaderProps) {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const { t } = useLanguage();

  const getDescription = (title: string): string => {
    const descriptions = {
      [t('dashboard')]: t('welcomeMessage'),
      [t('calendar')]: t('calendarDescription'),
      [t('clients')]: t('clientsDescription'),
      [t('services')]: t('servicesDescription'),
      [t('availability')]: t('availabilityDescription'),
      [t('bookingForm')]: t('bookingFormDescription'),
      [t('analytics')]: t('analyticsDescription'),
    };
    return descriptions[title as keyof typeof descriptions] || t('defaultDescription');
  };

  return (
    <>
      <header className="bg-card border-b border-border px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden mr-3"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
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
