-- Add 500,000 RAN Tokens to account "Hai" (phone: 0826999923)

-- Insert or update RAN wallet for user
INSERT INTO public.ran_wallets (user_phone, balance_ran, total_earned_ran, updated_at)
VALUES ('0826999923', 500000, 500000, now())
ON CONFLICT (user_phone) 
DO UPDATE SET 
    balance_ran = ran_wallets.balance_ran + 500000,
    total_earned_ran = ran_wallets.total_earned_ran + 500000,
    updated_at = now();

-- Add transaction record
INSERT INTO public.ran_wallet_transactions (user_phone, amount, kind, reference)
VALUES ('0826999923', 500000, 'adjust', 'Manual addition for user Hai');

-- Verify the update
SELECT user_phone, balance_ran, total_earned_ran, updated_at 
FROM public.ran_wallets 
WHERE user_phone = '0826999923';