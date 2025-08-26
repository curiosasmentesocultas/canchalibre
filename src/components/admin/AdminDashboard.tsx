import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, DollarSign, AlertTriangle, TrendingUp, Clock } from "lucide-react";

interface DashboardStats {
  totalComplexes: number;
  pendingApproval: number;
  activeSubscriptions: number;
  expiringSoon: number;
  totalRevenue: number;
  newThisMonth: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalComplexes: 0,
    pendingApproval: 0,
    activeSubscriptions: 0,
    expiringSoon: 0,
    totalRevenue: 0,
    newThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Get all complexes
      const { data: complexes, error: complexesError } = await supabase
        .from('sport_complexes')
        .select('*');

      if (complexesError) throw complexesError;

      // Calculate current date and expiration threshold (7 days from now)
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const thisMonth = new Date();
      thisMonth.setDate(1); // First day of current month

      const totalComplexes = complexes?.length || 0;
      const pendingApproval = complexes?.filter(c => !c.is_approved).length || 0;
      const activeSubscriptions = complexes?.filter(c => 
        c.is_active && c.subscription_expires_at && new Date(c.subscription_expires_at) > today
      ).length || 0;
      
      const expiringSoon = complexes?.filter(c => {
        if (!c.subscription_expires_at) return false;
        const expirationDate = new Date(c.subscription_expires_at);
        return expirationDate > today && expirationDate <= nextWeek;
      }).length || 0;

      const newThisMonth = complexes?.filter(c => 
        new Date(c.created_at) >= thisMonth
      ).length || 0;

      // Calculate revenue (mock calculation - in real app this would come from payment data)
      const totalRevenue = activeSubscriptions * 29.99; // Assuming $29.99 per month

      setStats({
        totalComplexes,
        pendingApproval,
        activeSubscriptions,
        expiringSoon,
        totalRevenue,
        newThisMonth,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Total Complejos
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.totalComplexes}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              +{stats.newThisMonth} este mes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Pendientes Aprobación
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.pendingApproval}
            </div>
            <Badge variant={stats.pendingApproval > 0 ? "destructive" : "secondary"} className="mt-1">
              {stats.pendingApproval > 0 ? "Requiere atención" : "Todo al día"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
              Suscripciones Activas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.activeSubscriptions}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {((stats.activeSubscriptions / stats.totalComplexes) * 100 || 0).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">
              Expiran Pronto
            </CardTitle>
            <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {stats.expiringSoon}
            </div>
            <Badge variant={stats.expiringSoon > 0 ? "destructive" : "secondary"} className="mt-1">
              {stats.expiringSoon > 0 ? "Próximos 7 días" : "Ninguno próximo"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Ingresos Estimados
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              ${stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              Mensual estimado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
              Nuevos Este Mes
            </CardTitle>
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {stats.newThisMonth}
            </div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
              Registros nuevos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Resumen de tareas importantes que requieren atención
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.pendingApproval > 0 && (
              <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100">
                      {stats.pendingApproval} complejo{stats.pendingApproval > 1 ? 's' : ''} esperando aprobación
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Revisa y aprueba los nuevos registros
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stats.expiringSoon > 0 && (
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-800">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">
                      {stats.expiringSoon} suscripción{stats.expiringSoon > 1 ? 'es' : ''} expira{stats.expiringSoon > 1 ? 'n' : ''} pronto
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Envía recordatorios de renovación
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stats.pendingApproval === 0 && stats.expiringSoon === 0 && (
              <div className="flex items-center justify-center p-8 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    ¡Todo está al día!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    No hay tareas urgentes pendientes
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;