/*
  # Vizinho Aluga - Extended Schema
  
  1. Add Protection System
    - insurance_fee column (1% protection)
    - insurance_claim tracking
    - GPS coordinates for delivery/return
  
  2. Photo Evidence System
    - photo_delivery_url
    - photo_return_url
    - GPS coordinates embedded
  
  3. Payment Tracking
    - payment_id (Pagar.me reference)
    - split_data JSON
    - commission tracking
*/

-- Add protection and payment columns to rentals
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS insurance_fee numeric DEFAULT 0;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS insurance_claim_id text;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS insurance_status text DEFAULT 'active';

-- Add GPS and photo evidence
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS delivery_lat numeric;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS delivery_lng numeric;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS delivery_photo_url text;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS delivery_timestamp timestamptz;

ALTER TABLE rentals ADD COLUMN IF NOT EXISTS return_lat numeric;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS return_lng numeric;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS return_photo_url text;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS return_timestamp timestamptz;

-- Add payment tracking
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS payment_id text;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS split_data jsonb;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS owner_payout numeric DEFAULT 0;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS insurance_cost numeric DEFAULT 0;

-- Add protection to items
ALTER TABLE items ADD COLUMN IF NOT EXISTS insured boolean DEFAULT false;
ALTER TABLE items ADD COLUMN IF NOT EXISTS insurance_coverage numeric DEFAULT 500;

-- Add financial summary to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_protection_fees numeric DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_commissions_paid numeric DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pix_key text;

-- Create protection claims table
CREATE TABLE IF NOT EXISTS protection_claims (
  id bigserial PRIMARY KEY,
  rental_id bigint NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  claim_type text NOT NULL CHECK (claim_type IN ('damage', 'theft', 'late_return', 'item_not_returned')),
  description text NOT NULL,
  evidence_photos text[], -- array of photo URLs
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'analysis', 'approved', 'rejected', 'paid')),
  amount_claimed numeric,
  amount_approved numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE protection_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims"
  ON protection_claims FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create claims"
  ON protection_claims FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own claims"
  ON protection_claims FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rentals_payment ON rentals(payment_id);
CREATE INDEX IF NOT EXISTS idx_protection_claims_user ON protection_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_protection_claims_rental ON protection_claims(rental_id);
CREATE INDEX IF NOT EXISTS idx_protection_claims_status ON protection_claims(status);

-- Function to calculate split automatically
CREATE OR REPLACE FUNCTION calculate_rental_split(
  rental_price numeric,
  laundry_fee numeric DEFAULT 0,
  delivery_fee numeric DEFAULT 0
) RETURNS jsonb AS $$
DECLARE
  total numeric;
  platform_fee numeric;
  insurance numeric;
  owner_amount numeric;
BEGIN
  total := rental_price + laundry_fee + delivery_fee;
  platform_fee := total * 0.15; -- 15% platform commission
  insurance := total * 0.01; -- 1% protection fee
  owner_amount := total - platform_fee - insurance;
  
  RETURN jsonb_build_object(
    'total', total,
    'platform_fee', platform_fee,
    'insurance_fee', insurance,
    'owner_payout', owner_amount,
    'commission_rate', 0.15,
    'protection_rate', 0.01
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protection_claims_updated_at BEFORE UPDATE ON protection_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
