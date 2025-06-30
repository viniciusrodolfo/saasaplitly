import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Scissors, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign,
  Settings,
  Star,
  Waves
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ServiceModal from '@/components/modals/service-modal';

export default function ServicesSection() {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['/api/services'],
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/services/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({
        title: "Service updated",
        description: "The service has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      await apiRequest('DELETE', `/api/services/${serviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({
        title: "Service deleted",
        description: "The service has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive",
      });
    },
  });

  const handleToggleActive = async (service: any) => {
    updateServiceMutation.mutate({
      id: service.id,
      data: { isActive: !service.isActive }
    });
  };

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const handleDeleteService = async (serviceId: number) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  const handleAddService = () => {
    setSelectedService(null);
    setShowServiceModal(true);
  };

  const getServiceIcon = (index: number) => {
    const icons = [Scissors, Waves, Star, Settings];
    const Icon = icons[index % icons.length];
    return Icon;
  };

  const getServiceIconColor = (index: number) => {
    const colors = [
      'text-primary bg-primary/10',
      'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
      'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
      'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Management</CardTitle>
            <Button onClick={handleAddService}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service: any, index: number) => {
                const Icon = getServiceIcon(index);
                const iconColor = getServiceIconColor(index);
                
                return (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteService(service.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <h4 className="text-lg font-semibold text-foreground mb-2">
                        {service.name}
                      </h4>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {service.description || 'No description provided'}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Duration:
                          </span>
                          <span className="text-foreground font-medium">
                            {service.duration} min
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Price:
                          </span>
                          <span className="text-foreground font-semibold">
                            {formatCurrency(parseFloat(service.price))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-muted-foreground">Status:</span>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={service.isActive}
                              onCheckedChange={() => handleToggleActive(service)}
                              disabled={updateServiceMutation.isPending}
                            />
                            <Badge variant={service.isActive ? "default" : "secondary"}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {service.requirements && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            <strong>Requirements:</strong> {service.requirements}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No services yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first service to start accepting appointments
              </p>
              <Button onClick={handleAddService}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ServiceModal
        open={showServiceModal}
        onOpenChange={setShowServiceModal}
        service={selectedService}
      />
    </>
  );
}
