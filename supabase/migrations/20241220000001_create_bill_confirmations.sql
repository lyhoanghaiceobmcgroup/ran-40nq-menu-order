-- Create bill_confirmations table
CREATE TABLE IF NOT EXISTS bill_confirmations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by TEXT,
  ran_tokens INTEGER,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bill_confirmations_order_id ON bill_confirmations(order_id);
CREATE INDEX IF NOT EXISTS idx_bill_confirmations_user_phone ON bill_confirmations(user_phone);
CREATE INDEX IF NOT EXISTS idx_bill_confirmations_confirmed ON bill_confirmations(confirmed);

-- Enable RLS
ALTER TABLE bill_confirmations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on bill_confirmations" ON bill_confirmations
  FOR ALL USING (true) WITH CHECK (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bill_confirmations_updated_at
    BEFORE UPDATE ON bill_confirmations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();