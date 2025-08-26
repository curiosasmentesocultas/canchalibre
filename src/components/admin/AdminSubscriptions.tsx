import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, DollarSign, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionComplex {
  id: string;
  name: string;
  address: string;
  payment_status: string;
  subscription_expires_at?: string;
  created_at: string;
  is_active: boolean;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

const AdminSubscriptions = () => {
  const [complexes, setComplexes] = useState<SubscriptionComplex[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sport_complexes')
        .select(`
          id,
          name,
          address,
          payment_status,
          subscription_expires_at,
          created_at,
          is_active,
          profiles:owner_id (
            full_name,
            email
          )
        `)
        .eq('is_approved', true)
        .order('subscription_expires_at', { ascending: true });

      if (error) throw error;
      setComplexes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las suscripciones: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (
    complexId: string, 
    status: string, 
    expirationDate?: string
  ) => {
    try {
      setProcessingId(complexId);

      const updateData: any = {
        payment_status: status,
        is_active: status === 'active' || status === 'trial',
      };

      if (expirationDate) {
        updateData.subscription_expires_at = expirationDate;
      }

      const { error } = await supabase
        .from('sport_complexes')
        .update(updateData)
        .eq('id', complexId);

      if (error) throw error;

      toast({
        title: "Suscripción Actualizada",
        description: "El estado de la suscripción ha sido actualizado correctamente.",
      });

      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la suscripción: " + error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const extendTrial = async (complexId: string, days: number) => {
    const newExpirationDate = new Date();
    newExpirationDate.setDate(newExpirationDate.getDate() + days);
    
    await updateSubscription(
      complexId, 
      'trial', 
      newExpirationDate.toISOString()
    );
  };

  const activateSubscription = async (complexId: string, months: number) => {
    const newExpirationDate = new Date();
    newExpirationDate.setMonth(newExpirationDate.getMonth() + months);
    
    await updateSubscription(
      complexId, 
      'active', 
      newExpirationDate.toISOString()
    );
  };

  const getStatusBadge = (status: string, expirationDate?: string) => {
    const now = new Date();
    const expiration = expirationDate ? new Date(expirationDate) : null;
    const isExpired = expiration && expiration < now;

    switch (status) {
      case 'trial':
        return (
          <Badge variant={isExpired ? "destructive" : "secondary"}>
            {isExpired ? 'Prueba Expirada' : 'Período de Prueba'}
          </Badge>
        );
      case 'active':
        return (
          <Badge variant={isExpired ? "destructive" : "default"}>
            {isExpired ? 'Suscripción Expirada' : 'Activo'}
          </Badge>
        );
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelado</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getDaysUntilExpiration = (expirationDate?: string) => {
    if (!expirationDate) return null;
    
    const now = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const SubscriptionCard = ({ complex }: { complex: SubscriptionComplex }) => {
    const [selectedAction, setSelectedAction] = useState<string>("");
    const [customDays, setCustomDays] = useState<string>("30");
    const daysUntilExpiration = getDaysUntilExpiration(complex.subscription_expires_at);
    const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 7 && daysUntilExpiration > 0;
    const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;

    return (
      <Card className={`w-full ${isExpiringSoon ? 'border-orange-200 bg-orange-50/50' : ''} ${isExpired ? 'border-red-200 bg-red-50/50' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-lg">{complex.name}</CardTitle>
              <CardDescription>{complex.address}</CardDescription>
              <div className="text-sm text-muted-foreground">
                Propietario: {complex.profiles?.full_name || complex.profiles?.email || 'Sin datos'}
              </div>
            </div>
            {getStatusBadge(complex.payment_status, complex.subscription_expires_at)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Registrado: {formatDate(complex.created_at)}</span>
              </div>
              {complex.subscription_expires_at && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Expira: {formatDate(complex.subscription_expires_at)}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {daysUntilExpiration !== null && (
                <div className={`flex items-center space-x-2 ${
                  isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {isExpired ? (
                    <XCircle className="w-4 h-4" />
                  ) : isExpiringSoon ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {isExpired 
                      ? `Expiró hace ${Math.abs(daysUntilExpiration)} días`
                      : `${daysUntilExpiration} días restantes`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => extendTrial(complex.id, 15)}
              disabled={processingId === complex.id}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              +15 días prueba
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => activateSubscription(complex.id, 1)}
              disabled={processingId === complex.id}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Activar 1 mes
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Acciones Avanzadas
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Gestionar Suscripción</AlertDialogTitle>
                  <AlertDialogDescription>
                    Administra la suscripción de "{complex.name}"
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="action">Acción</Label>
                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar acción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="extend-trial">Extender período de prueba</SelectItem>
                        <SelectItem value="activate">Activar suscripción</SelectItem>
                        <SelectItem value="suspend">Suspender temporalmente</SelectItem>
                        <SelectItem value="cancel">Cancelar suscripción</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(selectedAction === 'extend-trial' || selectedAction === 'activate') && (
                    <div className="space-y-2">
                      <Label htmlFor="days">
                        {selectedAction === 'extend-trial' ? 'Días adicionales' : 'Días de suscripción'}
                      </Label>
                      <Input
                        id="days"
                        type="number"
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        placeholder="30"
                        min="1"
                        max="365"
                      />
                    </div>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedAction("")}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const days = parseInt(customDays) || 30;
                      if (selectedAction === 'extend-trial') {
                        extendTrial(complex.id, days);
                      } else if (selectedAction === 'activate') {
                        const months = Math.ceil(days / 30);
                        activateSubscription(complex.id, months);
                      } else if (selectedAction === 'suspend') {
                        updateSubscription(complex.id, 'suspended');
                      } else if (selectedAction === 'cancel') {
                        updateSubscription(complex.id, 'cancelled');
                      }
                      setSelectedAction("");
                    }}
                    disabled={!selectedAction}
                  >
                    Aplicar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const trialComplexes = complexes.filter(c => c.payment_status === 'trial');
  const activeComplexes = complexes.filter(c => c.payment_status === 'active');
  const expiredComplexes = complexes.filter(c => 
    c.payment_status === 'expired' || 
    (c.subscription_expires_at && new Date(c.subscription_expires_at) < new Date())
  );
  const expiringSoon = complexes.filter(c => {
    const days = getDaysUntilExpiration(c.subscription_expires_at);
    return days !== null && days <= 7 && days > 0;
  });

  return (
    <Tabs defaultValue="expiring" className="space-y-6">
      <TabsList>
        <TabsTrigger value="expiring" className="relative">
          Expiran Pronto
          {expiringSoon.length > 0 && (
            <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-xs">
              {expiringSoon.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="trial">
          Período Prueba ({trialComplexes.length})
        </TabsTrigger>
        <TabsTrigger value="active">
          Activos ({activeComplexes.length})
        </TabsTrigger>
        <TabsTrigger value="expired">
          Expirados ({expiredComplexes.length})
        </TabsTrigger>
        <TabsTrigger value="all">
          Todos ({complexes.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="expiring" className="space-y-4">
        {expiringSoon.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h3 className="text-lg font-medium">¡Excelente!</h3>
                <p className="text-muted-foreground">No hay suscripciones expirando pronto.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          expiringSoon.map((complex) => (
            <SubscriptionCard key={complex.id} complex={complex} />
          ))
        )}
      </TabsContent>

      <TabsContent value="trial" className="space-y-4">
        {trialComplexes.map((complex) => (
          <SubscriptionCard key={complex.id} complex={complex} />
        ))}
      </TabsContent>

      <TabsContent value="active" className="space-y-4">
        {activeComplexes.map((complex) => (
          <SubscriptionCard key={complex.id} complex={complex} />
        ))}
      </TabsContent>

      <TabsContent value="expired" className="space-y-4">
        {expiredComplexes.map((complex) => (
          <SubscriptionCard key={complex.id} complex={complex} />
        ))}
      </TabsContent>

      <TabsContent value="all" className="space-y-4">
        {complexes.map((complex) => (
          <SubscriptionCard key={complex.id} complex={complex} />
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default AdminSubscriptions;