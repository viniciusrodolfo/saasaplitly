import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTime, getStatusColor, isToday } from '@/lib/utils';
import AppointmentModal from '@/components/modals/appointment-modal';

type ViewMode = 'day' | 'week' | 'month' | 'custom';

export default function CalendarSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const dateString = selectedDate.toISOString().split('T')[0];

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['/api/appointments', { date: viewMode === 'day' ? dateString : undefined }],
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    if (!appointments) return [];
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt: any) => apt.date === dateStr);
  };

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(selectedDate);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {dayAppointments.length > 0 ? (
          <div className="space-y-3">
            {dayAppointments.map((appointment: any) => (
              <div key={appointment.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-lg">{formatTime(appointment.time)}</span>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-foreground mt-1">
                      {appointment.client.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.service.name} • {appointment.service.duration} min
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No appointments scheduled for this day</p>
          </div>
        )}
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {generateCalendarDays().map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day.date);
          const isCurrentMonth = day.date.getMonth() === selectedDate.getMonth();
          const isTodayDate = isToday(day.date.toISOString().split('T')[0]);
          
          return (
            <div
              key={index}
              className={`p-2 h-24 border border-border rounded-lg cursor-pointer hover:bg-muted/50 ${
                !isCurrentMonth ? 'opacity-50 bg-muted/20' : ''
              } ${isTodayDate ? 'bg-primary/10 border-primary' : ''}`}
              onClick={() => setSelectedDate(day.date)}
            >
              <span className={`text-sm ${isTodayDate ? 'font-bold text-primary' : 'text-foreground'}`}>
                {day.date.getDate()}
              </span>
              <div className="mt-1 space-y-1">
                {dayAppointments.slice(0, 2).map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className={`text-xs px-1 rounded appointment-${appointment.status} truncate`}
                  >
                    {formatTime(appointment.time)} {appointment.client.name}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayAppointments.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({ date });
    }
    
    return days;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Appointment Calendar</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day View</SelectItem>
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="month">Month View</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => setShowAppointmentModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Appointment
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : viewMode === 'day' ? (
            renderDayView()
          ) : viewMode === 'month' ? (
            renderMonthView()
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {viewMode === 'week' ? 'Week view' : 'Custom range view'} coming soon
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentModal
        open={showAppointmentModal}
        onOpenChange={setShowAppointmentModal}
        defaultDate={selectedDate.toISOString().split('T')[0]}
      />
    </>
  );
}
