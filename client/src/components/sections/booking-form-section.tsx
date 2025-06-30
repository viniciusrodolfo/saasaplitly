import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  Copy, 
  Save, 
  Eye,
  Share2,
  Facebook,
  MessageCircle,
  Twitter
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export default function BookingFormSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: 'Book Your Appointment',
    description: 'Schedule your appointment with us today. We look forward to serving you!',
    backgroundColor: '#6366F1',
    buttonColor: '#10B981',
    headerImage: '',
  });

  const { data: bookingForm, isLoading } = useQuery({
    queryKey: ['/api/booking-form'],
  });

  const { data: services } = useQuery({
    queryKey: ['/api/services'],
  });

  const updateFormMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/booking-form', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/booking-form'] });
      toast({
        title: "Form updated",
        description: "Your booking form has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking form",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (bookingForm) {
      setFormData({
        title: bookingForm.title,
        description: bookingForm.description,
        backgroundColor: bookingForm.backgroundColor,
        buttonColor: bookingForm.buttonColor,
        headerImage: bookingForm.headerImage || '',
      });
    }
  }, [bookingForm]);

  const handleSave = () => {
    updateFormMutation.mutate(formData);
  };

  const bookingUrl = `${window.location.origin}/book/${user?.id}`;

  const handleCopyUrl = async () => {
    try {
      await copyToClipboard(bookingUrl);
      toast({
        title: "URL copied",
        description: "Booking form URL has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a file storage service
      // For now, we'll use a placeholder
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, headerImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const shareOnSocial = (platform: string) => {
    const text = encodeURIComponent(`Book an appointment with ${user?.businessName || user?.name || 'us'}`);
    const url = encodeURIComponent(bookingUrl);
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    };
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Customization */}
        <Card>
          <CardHeader>
            <CardTitle>Customize Booking Form</CardTitle>
            <p className="text-muted-foreground">Design your public booking form.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Header Image
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Book Your Appointment"
              />
            </div>

            <div>
              <Label htmlFor="form-description">Description</Label>
              <Textarea
                id="form-description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Schedule your appointment with us today..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Background Color</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-12 h-10 border border-border rounded-lg cursor-pointer"
                  />
                  <Input
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    placeholder="#6366F1"
                  />
                </div>
              </div>

              <div>
                <Label>Button Color</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="color"
                    value={formData.buttonColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonColor: e.target.value }))}
                    className="w-12 h-10 border border-border rounded-lg cursor-pointer"
                  />
                  <Input
                    value={formData.buttonColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonColor: e.target.value }))}
                    placeholder="#10B981"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSave}
              disabled={updateFormMutation.isPending}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateFormMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Form Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Form Preview</span>
            </CardTitle>
            <p className="text-muted-foreground">
              This is how your booking form will look.
            </p>
          </CardHeader>
          <CardContent>
            <div 
              className="max-w-md mx-auto rounded-2xl p-6 text-white"
              style={{ 
                background: `linear-gradient(135deg, ${formData.backgroundColor}, ${formData.backgroundColor}80)` 
              }}
            >
              {formData.headerImage && (
                <img 
                  src={formData.headerImage} 
                  alt="Header" 
                  className="w-full h-32 object-cover rounded-xl mb-4"
                />
              )}
              
              <h2 className="text-xl font-bold mb-2">{formData.title}</h2>
              <p className="text-sm opacity-90 mb-6">{formData.description}</p>
              
              <div className="space-y-4">
                <Input 
                  placeholder="Full Name" 
                  className="bg-white/20 border-white/30 text-white placeholder-white/70"
                />
                <Input 
                  placeholder="Email Address" 
                  className="bg-white/20 border-white/30 text-white placeholder-white/70"
                />
                <Input 
                  placeholder="WhatsApp Number" 
                  className="bg-white/20 border-white/30 text-white placeholder-white/70"
                />
                <select className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white">
                  <option>Select Service</option>
                  {services?.slice(0, 3).map((service: any) => (
                    <option key={service.id} className="text-black">
                      {service.name}
                    </option>
                  ))}
                </select>
                <Input 
                  type="date" 
                  className="bg-white/20 border-white/30 text-white"
                />
                <Input 
                  type="time" 
                  className="bg-white/20 border-white/30 text-white"
                />
                
                <Button 
                  className="w-full font-semibold py-3 transition-colors"
                  style={{ backgroundColor: formData.buttonColor }}
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Share Your Booking Form</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Booking URL
            </Label>
            <div className="flex items-center space-x-2">
              <Input 
                value={bookingUrl} 
                readOnly 
                className="flex-1 bg-muted"
              />
              <Button onClick={handleCopyUrl} variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <Button 
              onClick={() => shareOnSocial('facebook')}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Facebook className="w-4 h-4" />
              <span>Share on Facebook</span>
            </Button>
            <Button 
              onClick={() => shareOnSocial('whatsapp')}
              className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </Button>
            <Button 
              onClick={() => shareOnSocial('twitter')}
              className="flex items-center justify-center space-x-2 bg-blue-400 hover:bg-blue-500"
            >
              <Twitter className="w-4 h-4" />
              <span>Share on Twitter</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
