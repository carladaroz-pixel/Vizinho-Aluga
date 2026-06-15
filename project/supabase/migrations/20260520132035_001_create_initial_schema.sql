/*
  # Vizinho Aluga - Initial Schema

  1. New Tables
    - `users` - Perfil de usuário
    - `items` - Itens disponíveis para aluguel
    - `rentals` - Histórico de aluguéis
    - `reviews` - Avaliações de itens e usuários
  
  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Public read access for item listings
  
  3. Key Features
    - Auto-generated timestamps
    - Financial tracking per item
    - Review system with ratings
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  cep text,
  phone text,
  rating_avg numeric DEFAULT 0,
  total_rentals integer DEFAULT 0,
  total_earned numeric DEFAULT 0,
  total_spent numeric DEFAULT 0,
  verification_status text DEFAULT 'unverified',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view public profiles"
  ON users FOR SELECT
  TO anon
  USING (verification_status = 'verified');

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  emoji text,
  price_per_day numeric NOT NULL CHECK (price_per_day >= 15),
  laundry_fee numeric DEFAULT 0,
  image_url text,
  available boolean DEFAULT true,
  delivery_available boolean DEFAULT false,
  pickup_location text,
  cep text,
  total_rented integer DEFAULT 0,
  total_earned numeric DEFAULT 0,
  rating_avg numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all available items"
  ON items FOR SELECT
  TO anon, authenticated
  USING (available = true);

CREATE POLICY "Users can read own items"
  ON items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR available = true);

CREATE POLICY "Users can create items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id bigserial PRIMARY KEY,
  item_id bigint NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  renter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  rental_price numeric NOT NULL,
  laundry_fee numeric DEFAULT 0,
  delivery_fee numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  item_condition_checkout text,
  item_condition_return text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rentals"
  ON rentals FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid() OR renter_id = auth.uid());

CREATE POLICY "Users can create rentals"
  ON rentals FOR INSERT
  TO authenticated
  WITH CHECK (renter_id = auth.uid());

CREATE POLICY "Users can update own rentals"
  ON rentals FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR renter_id = auth.uid())
  WITH CHECK (owner_id = auth.uid() OR renter_id = auth.uid());

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id bigserial PRIMARY KEY,
  item_id bigint REFERENCES items(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  review_type text DEFAULT 'renter' CHECK (review_type IN ('item', 'renter', 'owner')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_available ON items(available);
CREATE INDEX IF NOT EXISTS idx_rentals_owner ON rentals(owner_id);
CREATE INDEX IF NOT EXISTS idx_rentals_renter ON rentals(renter_id);
CREATE INDEX IF NOT EXISTS idx_rentals_item ON rentals(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_to_user ON reviews(to_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_from_user ON reviews(from_user_id);
