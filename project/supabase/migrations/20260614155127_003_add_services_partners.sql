/*
  # Vizinho Aluga - Services Partners Module
  
  1. Services Partners Table
    - Local service providers as sponsors
    - Click-to-WhatsApp only (no transactions in app)
    - Categories: Encanador, Eletricista, Diarista, Chaveiro, Outros
*/

CREATE TYPE partner_category AS ENUM ('Encanador', 'Eletricista', 'Diarista', 'Chaveiro', 'Outros');
CREATE TYPE partner_plan AS ENUM ('condominio', 'rede');

CREATE TABLE IF NOT EXISTS services_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category partner_category NOT NULL,
  whatsapp text NOT NULL,
  description text CHECK (char_length(description) <= 120),
  photo_url text,
  condominiums text[] DEFAULT '{}',
  cities text[] DEFAULT ARRAY['São José do Rio Preto', 'Olímpia'],
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT true,
  plan partner_plan DEFAULT 'condominio',
  monthly_price numeric DEFAULT 97,
  clicks integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services_partners ENABLE ROW LEVEL SECURITY;

-- Public read for active partners
CREATE POLICY "Public read active partners"
  ON services_partners FOR SELECT
  USING (is_active = true);

-- Admin write (for now, authenticated users can write)
CREATE POLICY "Admin write partners"
  ON services_partners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_partners_category ON services_partners(category);
CREATE INDEX idx_partners_cities ON services_partners USING GIN(cities);
CREATE INDEX idx_partners_condominiums ON services_partners USING GIN(condominiums);
CREATE INDEX idx_partners_active ON services_partners(is_active);
CREATE INDEX idx_partners_clicks ON services_partners(clicks DESC);

-- Trigger for updated_at
CREATE TRIGGER update_services_partners_updated_at 
  BEFORE UPDATE ON services_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data - 4 partners for Rio Preto
INSERT INTO services_partners (name, category, whatsapp, description, condominiums, cities, is_verified, plan, monthly_price) VALUES
('João Encanador', 'Encanador', '5517998877661', 'Especialista em reparos residenciais. 15 anos de experiência. Atendimento rápido.', ARRAY['Residencial Flores', 'Jardim Primavera', 'Geral Rio Preto'], ARRAY['São José do Rio Preto', 'Olímpia'], true, 'rede', 147),
('Maria Eletricista', 'Eletricista', '5517998877662', 'Instalações elétricas, reparos e manutenção. CREA ativo. Serviço garantido.', ARRAY['Residencial Flores', 'Vila Nova', 'Geral Rio Preto'], ARRAY['São José do Rio Preto', 'Olímpia'], true, 'condominio', 97),
('Ana Diarista', 'Diarista', '5517998877663', 'Limpeza residencial e pós-obra. Horários flexíveis. Indicação dos vizinhos.', ARRAY['Jardim Primavera', 'Parque das Árvores', 'Geral Rio Preto'], ARRAY['São José do Rio Preto', 'Olímpia'], true, 'condominio', 97),
('Carlos Chaveiro', 'Chaveiro', '5517998877664', 'Cópia de chaves, instalação de fechaduras. Atendimento 24h. Emergências.', ARRAY['Geral Rio Preto', 'Geral Olímpia'], ARRAY['São José do Rio Preto', 'Olímpia'], true, 'rede', 147);
