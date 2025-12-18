import createClient from 'openapi-fetch';
import type { paths } from '$lib/types/openapi';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

export const apiClient = createClient<paths>({
	baseUrl: PUBLIC_API_BASE_URL
});
