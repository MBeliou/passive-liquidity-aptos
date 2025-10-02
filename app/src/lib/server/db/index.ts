import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

//const client = env.DATABASE_URL.includes("localhost") ? postgres(env.DATABASE_URL) : neon(env.DATABASE_URL);

//export const db = drizzle(client, { schema });
export const db = (() => {
	if (env.DATABASE_URL.includes('localhost')) {
		const client = postgres(env.DATABASE_URL);
		return drizzle(client, { schema });
	} else {
		const client = neon(env.DATABASE_URL);
		return drizzleNeon(client, { schema });
	}
})();

//const db = drizzle({ client: sql });
