import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  serviceId: string;
  date: string;
  time: string;
}

export default function BookingForm() {
  const { userId } = useParams();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    serviceId: '',
    date: '',
    time: '',
  });

  const { data: bookingData, isLoading } = useQuery({
    queryKey: [`/api/public/booking-form/${userId}`],
    enabled: !!userId,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await apiRequest('POST', `/api/public/appointments/${userId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been successfully scheduled. You will receive a confirmation soon.",
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        serviceId: '',
        date: '',
        time: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.serviceId || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createAppointmentMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-semibold text-foreground mb-2">Booking Form Not Found</h1>
            <p className="text-muted-foreground">The booking form you're looking for doesn't exist or has been disabled.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { form, services } = bookingData;
  const backgroundColor = form.backgroundColor || '#6366F1';
  const buttonColor = form.buttonColor || '#10B981';

  // Generate time slots (9 AM to 5 PM with 30-minute intervals)
  const timeSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${backgroundColor}, ${backgroundColor}80)` }}>
      <Card className="w-full max-w-md">
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            {form.headerImage && (
              <img 
                src={form.headerImage} 
                alt="Header" 
                className="w-full h-32 object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-xl font-bold">{form.title}</h1>
              <p className="text-sm opacity-90">{form.description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Full Name *</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email Address *</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Phone Number *</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Number</span>
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="Enter your WhatsApp number (optional)"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Service *</Label>
              <Select value={formData.serviceId} onValueChange={(value) => setFormData(prev => ({ ...prev, serviceId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services?.filter((service: any) => service.isActive).map((service: any) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - ${service.price} ({service.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center space-x-2">
                <CalendarDays className="w-4 h-4" />
                <span>Preferred Date *</span>
              </Label>
              <Input
                id="date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Preferred Time *</span>
              </Label>
              <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => {
                    const [hours, minutes] = time.split(':');
                    const date = new Date();
                    date.setHours(parseInt(hours), parseInt(minutes));
                    const formattedTime = date.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    });
                    
                    return (
                      <SelectItem key={time} value={time}>
                        {formattedTime}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6"
              style={{ backgroundColor: buttonColor }}
              disabled={createAppointmentMutation.isPending}
            >
              {createAppointmentMutation.isPending ? 'Booking...' : 'Book Appointment'}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By booking an appointment, you agree to our terms and conditions. 
              You will receive a confirmation email shortly.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
