import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  cep: string | null;
  phone: string | null;
  rating_avg: number;
  total_rentals: number;
  total_earned: number;
  total_spent: number;
  verification_status: string;
  created_at: string;
  updated_at: string;
  total_protection_fees?: number;
  total_commissions_paid?: number;
  bank_account?: string | null;
  pix_key?: string | null;
};

export type Item = {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  emoji: string | null;
  price_per_day: number;
  laundry_fee: number;
  image_url: string | null;
  available: boolean;
  delivery_available: boolean;
  pickup_location: string | null;
  cep: string | null;
  total_rented: number;
  total_earned: number;
  rating_avg: number;
  created_at: string;
  updated_at: string;
  insured?: boolean;
  insurance_coverage?: number;
};

export type Rental = {
  id: number;
  item_id: number;
  owner_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  rental_price: number;
  laundry_fee: number;
  delivery_fee: number;
  total_amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  item_condition_checkout: string | null;
  item_condition_return: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Protection fields
  insurance_fee?: number;
  insurance_claim_id?: string | null;
  insurance_status?: string;
  // GPS fields
  delivery_lat?: number | null;
  delivery_lng?: number | null;
  delivery_photo_url?: string | null;
  delivery_timestamp?: string | null;
  return_lat?: number | null;
  return_lng?: number | null;
  return_photo_url?: string | null;
  return_timestamp?: string | null;
  // Payment fields
  payment_id?: string | null;
  split_data?: any;
  platform_fee?: number;
  owner_payout?: number;
  insurance_cost?: number;
};

export type ProtectionClaim = {
  id: number;
  rental_id: number;
  user_id: string;
  claim_type: 'damage' | 'theft' | 'late_return' | 'item_not_returned';
  description: string;
  evidence_photos: string[];
  status: 'pending' | 'analysis' | 'approved' | 'rejected' | 'paid';
  amount_claimed: number | null;
  amount_approved: number | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export type ServicesPartner = {
  id: string;
  name: string;
  category: 'Encanador' | 'Eletricista' | 'Diarista' | 'Chaveiro' | 'Outros';
  whatsapp: string;
  description: string | null;
  photo_url: string | null;
  condominiums: string[];
  cities: string[];
  is_active: boolean;
  is_verified: boolean;
  plan: 'condominio' | 'rede';
  monthly_price: number;
  clicks: number;
  created_at: string;
  updated_at: string;
};
