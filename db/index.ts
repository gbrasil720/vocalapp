/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import { drizzle } from 'drizzle-orm/neon-http'

export const db = drizzle(process.env.DATABASE_URL!)
