import DodoPayments from "dodopayments";

export const dodoPayments = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: (process.env.DODO_PAYMENTS_MODE as 'test_mode' | 'live_mode') || 'test_mode'
})