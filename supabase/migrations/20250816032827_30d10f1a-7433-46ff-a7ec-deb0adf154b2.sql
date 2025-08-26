-- Create voucher products table
CREATE TABLE public.voucher_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sell_price_vnd INTEGER NOT NULL,
    reward_ran INTEGER NOT NULL,
    payment_channel TEXT NOT NULL DEFAULT 'MB_ONLY',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment intents table  
CREATE TABLE public.payment_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_phone TEXT NOT NULL,
    voucher_product_id UUID REFERENCES public.voucher_products(id),
    expected_amount_vnd INTEGER NOT NULL,
    payment_content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bank transactions table
CREATE TABLE public.bank_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    txn_id TEXT UNIQUE NOT NULL,
    credit_account TEXT NOT NULL,
    amount_vnd INTEGER NOT NULL,
    content_raw TEXT NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE NOT NULL,
    matched_user_phone TEXT,
    matched_intent_id UUID REFERENCES public.payment_intents(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RAN wallet table
CREATE TABLE public.ran_wallets (
    user_phone TEXT PRIMARY KEY,
    balance_ran BIGINT DEFAULT 0,
    total_earned_ran BIGINT DEFAULT 0,
    total_spent_ran BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RAN ledger for transaction history
CREATE TABLE public.ran_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_phone TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('CREDIT', 'DEBIT', 'PROMO_CREDIT', 'PURCHASE_CREDIT', 'BILL_PAYMENT', 'VOUCHER_EXCHANGE')),
    amount_ran BIGINT NOT NULL,
    description TEXT,
    reference_id TEXT,
    reference_type TEXT,
    balance_after BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.voucher_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ran_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ran_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voucher_products (public read)
CREATE POLICY "Anyone can view active voucher products" ON public.voucher_products
    FOR SELECT USING (status = 'active');

-- RLS Policies for payment_intents (users can view their own)
CREATE POLICY "Users can view their own payment intents" ON public.payment_intents
    FOR ALL USING (user_phone = current_setting('request.jwt.claims', true)::json->>'phone');

-- RLS Policies for bank_transactions (admin only)
CREATE POLICY "Admin can manage bank transactions" ON public.bank_transactions
    FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'admin');

-- RLS Policies for ran_wallets (users can view their own)
CREATE POLICY "Users can view their own wallet" ON public.ran_wallets
    FOR SELECT USING (user_phone = current_setting('request.jwt.claims', true)::json->>'phone');

CREATE POLICY "Users can update their own wallet" ON public.ran_wallets
    FOR UPDATE USING (user_phone = current_setting('request.jwt.claims', true)::json->>'phone');

CREATE POLICY "System can insert wallets" ON public.ran_wallets
    FOR INSERT WITH CHECK (true);

-- RLS Policies for ran_ledger (users can view their own)
CREATE POLICY "Users can view their own ledger" ON public.ran_ledger
    FOR SELECT USING (user_phone = current_setting('request.jwt.claims', true)::json->>'phone');

CREATE POLICY "System can insert ledger entries" ON public.ran_ledger
    FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_payment_intents_user_phone ON public.payment_intents(user_phone);
CREATE INDEX idx_payment_intents_status ON public.payment_intents(status);
CREATE INDEX idx_bank_transactions_txn_id ON public.bank_transactions(txn_id);
CREATE INDEX idx_bank_transactions_credit_account ON public.bank_transactions(credit_account);
CREATE INDEX idx_ran_ledger_user_phone ON public.ran_ledger(user_phone);
CREATE INDEX idx_ran_ledger_created_at ON public.ran_ledger(created_at DESC);

-- Insert the RAN Membership voucher product
INSERT INTO public.voucher_products (
    name,
    description,
    sell_price_vnd,
    reward_ran,
    payment_channel,
    image_url
) VALUES (
    'Hội viên RAN',
    'Voucher 799.000₫, thanh toán qua MB 9090190899999 – cộng 1.000.000 RAN dùng thanh toán bill/đổi voucher.',
    799000,
    1000000,
    'MB_ONLY',
    '/src/assets/qr-mb-payment.png'
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_voucher_products_updated_at BEFORE UPDATE ON public.voucher_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_intents_updated_at BEFORE UPDATE ON public.payment_intents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ran_wallets_updated_at BEFORE UPDATE ON public.ran_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();