DROP TABLE "__drizzle_migrations" CASCADE;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "dodo_payments_subscription_id" text;--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD COLUMN "dodo_payments_payment_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "dodo_payments_customer_id" text;