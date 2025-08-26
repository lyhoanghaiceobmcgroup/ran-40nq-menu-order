-- Fix RLS policies to allow edge functions to work properly

-- Update payment_intents policies
DROP POLICY IF EXISTS "Users can view their own payment intents" ON public.payment_intents;

CREATE POLICY "Users can view their own payment intents" ON public.payment_intents
    FOR SELECT USING (user_phone = current_setting('request.jwt.claims', true)::json->>'phone');

CREATE POLICY "System can insert payment intents" ON public.payment_intents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payment intents" ON public.payment_intents
    FOR UPDATE USING (true);

-- Update ran_wallets policies to allow system operations
DROP POLICY IF EXISTS "System can insert wallets" ON public.ran_wallets;
DROP POLICY IF EXISTS "System can update wallets" ON public.ran_wallets;

CREATE POLICY "System can insert wallets" ON public.ran_wallets
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update wallets" ON public.ran_wallets
    FOR UPDATE USING (true);

-- Update ran_ledger policy to allow system operations
DROP POLICY IF EXISTS "System can insert ledger entries" ON public.ran_ledger;

CREATE POLICY "System can insert ledger entries" ON public.ran_ledger
    FOR INSERT WITH CHECK (true);