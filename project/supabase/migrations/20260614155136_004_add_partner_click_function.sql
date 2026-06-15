-- Function to increment partner clicks
CREATE OR REPLACE FUNCTION increment_partner_clicks(partner_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE services_partners
  SET clicks = clicks + 1
  WHERE id = partner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;