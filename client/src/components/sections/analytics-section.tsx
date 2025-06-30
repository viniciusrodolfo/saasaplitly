import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsSection() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics'],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statusColors = {
    completed: 'bg-green-500',
    pending: 'bg-yellow-500',
    cancelled: 'bg-red-500',
    rescheduled: 'bg-gray-500',
  };

  const getStatusPercentage = (status: string, total: number) => {
    const item = analytics?.appointmentsByStatus.find((s: any) => s.status === status);
    return total > 0 ? Math.round((item?.count || 0) / total * 100) : 0;
  };

  const totalAppointments = analytics?.appointmentsByStatus.reduce((sum: number, item: any) => sum + item.count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Total Revenue</h3>
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">
              {formatCurrency(analytics?.totalRevenue || 0)}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +22% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Completed</h3>
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">
              {formatCurrency(analytics?.completedRevenue || 0)}
            </p>
            <p className="text-sm text-muted-foreground">
              {Math.round(((analytics?.completedRevenue || 0) / (analytics?.totalRevenue || 1)) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Cancelled</h3>
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">
              {formatCurrency(analytics?.cancelledRevenue || 0)}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <TrendingDown className="w-4 h-4 mr-1" />
              -5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Appointments by Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 mb-6">
              <div className="relative w-48 h-48">
                {/* Simplified donut chart using CSS */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                      ${statusColors.completed} 0deg ${getStatusPercentage('completed', totalAppointments) * 3.6}deg,
                      ${statusColors.pending} ${getStatusPercentage('completed', totalAppointments) * 3.6}deg ${(getStatusPercentage('completed', totalAppointments) + getStatusPercentage('pending', totalAppointments)) * 3.6}deg,
                      ${statusColors.cancelled} ${(getStatusPercentage('completed', totalAppointments) + getStatusPercentage('pending', totalAppointments)) * 3.6}deg ${(getStatusPercentage('completed', totalAppointments) + getStatusPercentage('pending', totalAppointments) + getStatusPercentage('cancelled', totalAppointments)) * 3.6}deg,
                      ${statusColors.rescheduled} ${(getStatusPercentage('completed', totalAppointments) + getStatusPercentage('pending', totalAppointments) + getStatusPercentage('cancelled', totalAppointments)) * 3.6}deg 360deg
                    )`
                  }}
                />
                <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{totalAppointments}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {analytics?.appointmentsByStatus.map((item: any) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-3 h-3 rounded-full ${statusColors[item.status as keyof typeof statusColors]}`}
                    />
                    <span className="text-sm text-muted-foreground capitalize">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      {item.count}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {getStatusPercentage(item.status, totalAppointments)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Revenue by Service</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.revenueByService.map((item: any, index: number) => {
                const maxRevenue = Math.max(...analytics.revenueByService.map((s: any) => s.revenue));
                const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                const colors = ['bg-primary', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500'];
                
                return (
                  <div key={item.serviceName} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                      {item.serviceName}
                    </span>
                    <div className="flex items-center space-x-2 flex-1 ml-4">
                      <div className="w-32 h-2 bg-muted rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${colors[index % colors.length]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground min-w-[60px] text-right">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monthly Trends</CardTitle>
            <Select defaultValue="6months">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
              const heights = [120, 150, 90, 180, 200, 160];
              return (
                <div key={month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-primary rounded-t transition-all duration-300 hover:opacity-80"
                    style={{ height: `${heights[index]}px` }}
                  />
                  <span className="text-xs text-muted-foreground mt-2">{month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
