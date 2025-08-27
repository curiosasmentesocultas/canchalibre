import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReservationData {
  id: string;
  user_id: string;
  complex_id: string;
  court_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  payment_method: 'mercado_pago' | 'transfer' | 'cash';
  payment_status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  deposit_amount: number;
  deposit_paid: boolean;
  mercadopago_payment_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  court_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const useReservations = () => {
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          sport_complexes (name, address),
          sport_courts (name, sport)
        `)
        .order('reservation_date', { ascending: true });

      if (error) throw error;
      
      // Transform data to match our interface
      const formattedReservations = data?.map((reservation: any) => ({
        id: reservation.id,
        user_id: reservation.user_id,
        complex_id: reservation.complex_id,
        court_id: reservation.court_id,
        reservation_date: reservation.reservation_date,
        start_time: reservation.start_time,
        end_time: reservation.end_time,
        total_price: reservation.total_price,
        payment_method: reservation.payment_method as 'mercado_pago' | 'transfer' | 'cash',
        payment_status: reservation.payment_status as 'pending' | 'confirmed' | 'paid' | 'cancelled',
        deposit_amount: reservation.deposit_amount || 0,
        deposit_paid: reservation.deposit_paid || false,
        mercadopago_payment_id: reservation.mercadopago_payment_id,
        notes: reservation.notes,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at,
      })) || [];
      
      setReservations(formattedReservations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (courtId: string, date: string) => {
    try {
      const dayOfWeek = new Date(date).getDay();
      const { data, error } = await supabase
        .from('court_availability')
        .select('*')
        .eq('court_id', courtId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching available slots:', err);
      return [];
    }
  };

  const checkSlotAvailability = async (
    courtId: string, 
    date: string, 
    startTime: string, 
    endTime: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('start_time, end_time')
        .eq('court_id', courtId)
        .eq('reservation_date', date)
        .neq('payment_status', 'cancelled');

      if (error) throw error;
      
      // Check for time overlaps manually since Supabase doesn't have overlaps function
      const hasConflict = data?.some((reservation: any) => {
        const existingStart = reservation.start_time;
        const existingEnd = reservation.end_time;
        return (startTime < existingEnd && endTime > existingStart);
      });
      
      return !hasConflict;
    } catch (err: any) {
      console.error('Error checking availability:', err);
      return false;
    }
  };

  const createReservation = async (reservationData: Omit<ReservationData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateReservationStatus = async (reservationId: string, status: string, paymentId?: string) => {
    try {
      const updateData: any = { payment_status: status };
      if (paymentId) {
        updateData.mercadopago_payment_id = paymentId;
      }

      const { data, error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  useEffect(() => {
    fetchUserReservations();
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchUserReservations,
    fetchAvailableSlots,
    checkSlotAvailability,
    createReservation,
    updateReservationStatus,
    refetch: fetchUserReservations
  };
};