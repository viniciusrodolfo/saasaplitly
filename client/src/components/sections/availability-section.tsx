import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Save } from 'lucide-react';
import { getDayName } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DayAvailability {
  dayOfWeek: number;
  isEnabled: boolean;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
}

export default function AvailabilitySection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [availability, setAvailability] = useState<DayAvailability[]>([
    { dayOfWeek: 1, isEnabled: true, morningStart: '09:00', morningEnd: '12:00', afternoonStart: '13:00', afternoonEnd: '18:00' },
    { dayOfWeek: 2, isEnabled: true, morningStart: '09:00', morningEnd: '12:00', afternoonStart: '13:00', afternoonEnd: '18:00' },
    { dayOfWeek: 3, isEnabled: false, morningStart: '', morningEnd: '', afternoonStart: '', afternoonEnd: '' },
    { dayOfWeek: 4, isEnabled: true, morningStart: '09:00', morningEnd: '12:00', afternoonStart: '13:00', afternoonEnd: '18:00' },
    { dayOfWeek: 5, isEnabled: true, morningStart: '09:00', morningEnd: '12:00', afternoonStart: '13:00', afternoonEnd: '18:00' },
    { dayOfWeek: 6, isEnabled: true, morningStart: '10:00', morningEnd: '12:00', afternoonStart: '14:00', afternoonEnd: '17:00' },
    { dayOfWeek: 0, isEnabled: false, morningStart: '', morningEnd: '', afternoonStart: '', afternoonEnd: '' },
  ]);

  const { data: existingAvailability, isLoading } = useQuery({
    queryKey: ['/api/availability'],
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (data: DayAvailability[]) => {
      // Add userId to each availability record
      const formattedData = data.map(day => ({
        dayOfWeek: day.dayOfWeek,
        isEnabled: day.isEnabled,
        morningStart: day.isEnabled && day.morningStart ? day.morningStart : null,
        morningEnd: day.isEnabled && day.morningEnd ? day.morningEnd : null,
        afternoonStart: day.isEnabled && day.afternoonStart ? day.afternoonStart : null,
        afternoonEnd: day.isEnabled && day.afternoonEnd ? day.afternoonEnd : null,
      }));
      const response = await apiRequest('PUT', '/api/availability', formattedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/availability'] });
      toast({
        title: "Availability updated",
        description: "Your availability settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (existingAvailability && Array.isArray(existingAvailability) && existingAvailability.length > 0) {
      // Create a map of existing availability by day
      const existingMap = new Map();
      existingAvailability.forEach((item: any) => {
        existingMap.set(item.dayOfWeek, item);
      });

      // Update availability state with existing data
      setAvailability(prev => prev.map(day => {
        const existing = existingMap.get(day.dayOfWeek);
        if (existing) {
          return {
            dayOfWeek: day.dayOfWeek,
            isEnabled: existing.isEnabled,
            morningStart: existing.morningStart || '',
            morningEnd: existing.morningEnd || '',
            afternoonStart: existing.afternoonStart || '',
            afternoonEnd: existing.afternoonEnd || '',
          };
        }
        // If day doesn't exist in database, it should be disabled
        return {
          ...day,
          isEnabled: false,
          morningStart: '',
          morningEnd: '',
          afternoonStart: '',
          afternoonEnd: '',
        };
      }));
    }
  }, [existingAvailability]);

  const handleDayToggle = (dayIndex: number, enabled: boolean) => {
    setAvailability(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { 
            ...day, 
            isEnabled: enabled,
            morningStart: enabled && !day.morningStart ? '09:00' : day.morningStart,
            morningEnd: enabled && !day.morningEnd ? '12:00' : day.morningEnd,
            afternoonStart: enabled && !day.afternoonStart ? '13:00' : day.afternoonStart,
            afternoonEnd: enabled && !day.afternoonEnd ? '18:00' : day.afternoonEnd,
          }
        : day
    ));
  };

  const handleTimeChange = (dayIndex: number, field: keyof DayAvailability, value: string) => {
    setAvailability(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, [field]: value } : day
    ));
  };

  const handleSave = () => {
    // Filter only enabled days and validate times
    const validAvailability = availability.filter(day => {
      if (!day.isEnabled) return false;
      
      // Check if at least morning or afternoon times are set
      const hasMorning = day.morningStart && day.morningEnd;
      const hasAfternoon = day.afternoonStart && day.afternoonEnd;
      
      return hasMorning || hasAfternoon;
    });

    updateAvailabilityMutation.mutate(validAvailability);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Availability Settings</span>
        </CardTitle>
        <p className="text-muted-foreground">
          Configure your working hours for each day of the week.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {availability.map((day, index) => (
          <div
            key={day.dayOfWeek}
            className={`flex items-center justify-between p-4 border border-border rounded-lg transition-opacity ${
              !day.isEnabled ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              <Switch
                checked={day.isEnabled}
                onCheckedChange={(enabled) => handleDayToggle(index, enabled)}
              />
              <span className="font-medium text-foreground min-w-[80px]">
                {getDayName(day.dayOfWeek)}
              </span>
            </div>

            {day.isEnabled ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-muted-foreground">Morning:</Label>
                  <Input
                    type="time"
                    value={day.morningStart}
                    onChange={(e) => handleTimeChange(index, 'morningStart', e.target.value)}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={day.morningEnd}
                    onChange={(e) => handleTimeChange(index, 'morningEnd', e.target.value)}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-muted-foreground">Afternoon:</Label>
                  <Input
                    type="time"
                    value={day.afternoonStart}
                    onChange={(e) => handleTimeChange(index, 'afternoonStart', e.target.value)}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={day.afternoonEnd}
                    onChange={(e) => handleTimeChange(index, 'afternoonEnd', e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground text-sm">Closed</span>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={updateAvailabilityMutation.isPending}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>
              {updateAvailabilityMutation.isPending ? 'Saving...' : 'Save Availability'}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
