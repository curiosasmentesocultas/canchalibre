import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Send, Bell, Users, Calendar, MessageSquare, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  message: string;
  type: 'expiration' | 'welcome' | 'payment' | 'general';
}

interface NotificationRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  complex_name: string;
  status: string;
  days_until_expiration?: number;
}

const AdminNotifications = () => {
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationSubject, setNotificationSubject] = useState("");
  const [notificationType, setNotificationType] = useState<string>("general");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const templates: NotificationTemplate[] = [
    {
      id: "welcome",
      name: "Bienvenida - Período de Prueba",
      subject: "¡Bienvenido a Canchas Jujuy! - 15 días gratis",
      message: `¡Hola {{nombre}}!

¡Felicitaciones! Tu complejo deportivo "{{complejo}}" ha sido aprobado en Canchas Jujuy.

🎉 Has recibido 15 días GRATUITOS para que pruebes nuestra plataforma.

Durante este período podrás:
✅ Recibir reservas de clientes
✅ Gestionar tus canchas y horarios  
✅ Acceder al panel de administración
✅ Recibir notificaciones automáticas

Después del período de prueba, la suscripción cuesta solo $29.99/mes.

¡Comienza a recibir reservas ya mismo!

Saludos,
Equipo Canchas Jujuy`,
      type: "welcome"
    },
    {
      id: "expiration_warning",
      name: "Advertencia - Próximo a Expirar",
      subject: "⚠️ Tu suscripción expira en {{dias}} días",
      message: `Hola {{nombre}},

Tu suscripción para "{{complejo}}" expirará en {{dias}} días ({{fecha_expiracion}}).

Para continuar recibiendo reservas, renueva tu suscripción antes de la fecha de vencimiento.

💳 Renovar ahora: {{link_renovacion}}

¿Necesitas ayuda? Contáctanos en soporte@canchasjujuy.com

Saludos,
Equipo Canchas Jujuy`,
      type: "expiration"
    },
    {
      id: "expired",
      name: "Suscripción Expirada",
      subject: "❌ Tu suscripción ha expirado",
      message: `Hola {{nombre}},

Tu suscripción para "{{complejo}}" ha expirado el {{fecha_expiracion}}.

Tu complejo ya no aparece en los resultados de búsqueda y no recibirás nuevas reservas hasta que renueves.

💳 Renovar ahora: {{link_renovacion}}

¿Preguntas? Escríbenos a soporte@canchasjujuy.com

Saludos,
Equipo Canchas Jujuy`,
      type: "expiration"
    },
    {
      id: "payment_reminder",
      name: "Recordatorio de Pago",
      subject: "💰 Recordatorio de pago - Canchas Jujuy",
      message: `Hola {{nombre}},

Este es un recordatorio amigable sobre el pago pendiente para "{{complejo}}".

Detalles:
• Monto: $29.99
• Vencimiento: {{fecha_expiracion}}
• Estado: {{estado}}

💳 Pagar ahora: {{link_pago}}

Gracias por confiar en nosotros.

Equipo Canchas Jujuy`,
      type: "payment"
    }
  ];

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sport_complexes')
        .select(`
          id,
          name,
          email,
          phone,
          whatsapp,
          payment_status,
          subscription_expires_at,
          profiles:owner_id (
            full_name,
            email,
            phone
          )
        `)
        .eq('is_approved', true);

      if (error) throw error;

      const formattedRecipients: NotificationRecipient[] = (data || []).map((complex: any) => {
        const daysUntilExpiration = complex.subscription_expires_at 
          ? Math.ceil((new Date(complex.subscription_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          id: complex.id,
          name: complex.profiles?.full_name || complex.profiles?.email || 'Sin nombre',
          email: complex.profiles?.email || complex.email,
          phone: complex.profiles?.phone || complex.phone,
          whatsapp: complex.whatsapp,
          complex_name: complex.name,
          status: complex.payment_status,
          days_until_expiration: daysUntilExpiration,
        };
      });

      setRecipients(formattedRecipients);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los destinatarios: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: NotificationTemplate) => {
    setNotificationSubject(template.subject);
    setNotificationMessage(template.message);
    setNotificationType(template.type);
  };

  const sendNotifications = async () => {
    if (!notificationMessage.trim() || selectedRecipients.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona destinatarios y escribe un mensaje.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);

      // Here you would integrate with your notification service
      // For now, we'll simulate the sending process
      
      for (const recipientId of selectedRecipients) {
        const recipient = recipients.find(r => r.id === recipientId);
        if (!recipient) continue;

        // Replace template variables
        let personalizedSubject = notificationSubject
          .replace('{{nombre}}', recipient.name)
          .replace('{{complejo}}', recipient.complex_name)
          .replace('{{dias}}', recipient.days_until_expiration?.toString() || '0')
          .replace('{{fecha_expiracion}}', recipient.days_until_expiration 
            ? new Date(Date.now() + recipient.days_until_expiration * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'No definida'
          )
          .replace('{{estado}}', recipient.status);

        let personalizedMessage = notificationMessage
          .replace('{{nombre}}', recipient.name)
          .replace('{{complejo}}', recipient.complex_name)
          .replace('{{dias}}', recipient.days_until_expiration?.toString() || '0')
          .replace('{{fecha_expiracion}}', recipient.days_until_expiration 
            ? new Date(Date.now() + recipient.days_until_expiration * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'No definida'
          )
          .replace('{{estado}}', recipient.status)
          .replace('{{link_renovacion}}', `https://canchasjujuy.com/renew/${recipient.id}`)
          .replace('{{link_pago}}', `https://canchasjujuy.com/payment/${recipient.id}`);

        // Here you would call your notification service (email, SMS, WhatsApp)
        console.log('Sending notification to:', recipient.email);
        console.log('Subject:', personalizedSubject);
        console.log('Message:', personalizedMessage);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Notificaciones Enviadas",
        description: `Se enviaron ${selectedRecipients.length} notificación${selectedRecipients.length > 1 ? 'es' : ''} exitosamente.`,
      });

      // Reset form
      setSelectedRecipients([]);
      setNotificationMessage("");
      setNotificationSubject("");
      setNotificationType("general");

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al enviar notificaciones: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string, daysUntilExpiration?: number) => {
    if (status === 'trial') {
      return <Badge variant="secondary">Período Prueba</Badge>;
    }
    if (status === 'active') {
      if (daysUntilExpiration && daysUntilExpiration <= 7) {
        return <Badge variant="destructive">Expira Pronto</Badge>;
      }
      return <Badge variant="default">Activo</Badge>;
    }
    if (status === 'expired') {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const filterRecipients = (filter: string) => {
    switch (filter) {
      case 'expiring':
        return recipients.filter(r => r.days_until_expiration && r.days_until_expiration <= 7 && r.days_until_expiration > 0);
      case 'expired':
        return recipients.filter(r => r.status === 'expired' || (r.days_until_expiration && r.days_until_expiration <= 0));
      case 'trial':
        return recipients.filter(r => r.status === 'trial');
      case 'active':
        return recipients.filter(r => r.status === 'active');
      default:
        return recipients;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
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
      </div>
    );
  }

  return (
    <Tabs defaultValue="send" className="space-y-6">
      <TabsList>
        <TabsTrigger value="send">Enviar Notificaciones</TabsTrigger>
        <TabsTrigger value="templates">Plantillas</TabsTrigger>
        <TabsTrigger value="recipients">Destinatarios</TabsTrigger>
      </TabsList>

      <TabsContent value="send" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compose Notification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Crear Notificación</span>
              </CardTitle>
              <CardDescription>
                Compón y envía notificaciones personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  value={notificationSubject}
                  onChange={(e) => setNotificationSubject(e.target.value)}
                  placeholder="Asunto del mensaje..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Notificación</Label>
                <Select value={notificationType} onValueChange={setNotificationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="welcome">Bienvenida</SelectItem>
                    <SelectItem value="expiration">Expiración</SelectItem>
                    <SelectItem value="payment">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Escribe tu mensaje aquí... Puedes usar variables como {{nombre}}, {{complejo}}, {{dias}}, {{fecha_expiracion}}"
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles: nombre, complejo, dias, fecha_expiracion, estado
                </p>
              </div>

              <div className="space-y-2">
                <Label>Destinatarios Seleccionados ({selectedRecipients.length})</Label>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                  {selectedRecipients.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Ningún destinatario seleccionado</p>
                  ) : (
                    selectedRecipients.map(id => {
                      const recipient = recipients.find(r => r.id === id);
                      return recipient ? (
                        <Badge key={id} variant="secondary" className="cursor-pointer" 
                              onClick={() => setSelectedRecipients(prev => prev.filter(r => r !== id))}>
                          {recipient.name} × 
                        </Badge>
                      ) : null;
                    })
                  )}
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="w-full"
                    disabled={selectedRecipients.length === 0 || !notificationMessage.trim() || sending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sending ? 'Enviando...' : `Enviar a ${selectedRecipients.length} destinatario${selectedRecipients.length !== 1 ? 's' : ''}`}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Envío</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro de que quieres enviar esta notificación a {selectedRecipients.length} destinatario{selectedRecipients.length !== 1 ? 's' : ''}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={sendNotifications}>
                      Enviar Notificaciones
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Recipients Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Seleccionar Destinatarios</span>
              </CardTitle>
              <CardDescription>
                Elige quién recibirá las notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="expiring">Expirando</TabsTrigger>
                  <TabsTrigger value="expired">Expirados</TabsTrigger>
                  <TabsTrigger value="trial">Prueba</TabsTrigger>
                  <TabsTrigger value="active">Activos</TabsTrigger>
                </TabsList>

                {['all', 'expiring', 'expired', 'trial', 'active'].map(filter => (
                  <TabsContent key={filter} value={filter} className="space-y-2 max-h-96 overflow-y-auto">
                    {filterRecipients(filter).map(recipient => (
                      <div 
                        key={recipient.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedRecipients.includes(recipient.id) 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => {
                          setSelectedRecipients(prev => 
                            prev.includes(recipient.id)
                              ? prev.filter(id => id !== recipient.id)
                              : [...prev, recipient.id]
                          );
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{recipient.name}</p>
                            <p className="text-xs text-muted-foreground">{recipient.complex_name}</p>
                            <div className="flex items-center space-x-2 text-xs">
                              {recipient.email && (
                                <div className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{recipient.email}</span>
                                </div>
                              )}
                              {recipient.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{recipient.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            {getStatusBadge(recipient.status, recipient.days_until_expiration)}
                            {recipient.days_until_expiration !== null && (
                              <p className="text-xs text-muted-foreground text-right">
                                {recipient.days_until_expiration > 0 
                                  ? `${recipient.days_until_expiration} días`
                                  : 'Expirado'
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="templates" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Plantillas de Notificación</span>
            </CardTitle>
            <CardDescription>
              Plantillas predefinidas para diferentes tipos de notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {templates.map(template => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => loadTemplate(template)}
                    >
                      Usar Plantilla
                    </Button>
                  </div>
                  <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                    <p className="line-clamp-3">{template.message}</p>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="recipients" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Lista de Destinatarios</span>
            </CardTitle>
            <CardDescription>
              Todos los propietarios de complejos registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recipients.map(recipient => (
                <Card key={recipient.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">{recipient.name}</h4>
                      <p className="text-sm text-muted-foreground">{recipient.complex_name}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        {recipient.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{recipient.email}</span>
                          </div>
                        )}
                        {recipient.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{recipient.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {getStatusBadge(recipient.status, recipient.days_until_expiration)}
                      {recipient.days_until_expiration !== null && (
                        <p className="text-sm text-muted-foreground">
                          {recipient.days_until_expiration > 0 
                            ? `${recipient.days_until_expiration} días restantes`
                            : 'Expirado'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminNotifications;