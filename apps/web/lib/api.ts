/**
 * Central API exports. Prefer `@/lib/api` / `@/lib/api-config` in application code (TypeScript path alias).
 */
export { API_BASE_URL, API_V1_BASE, getApiOrigin } from '../src/lib/api-config';
export {
  apiBaseDisplay,
  apiUrl,
  fetchApi,
  getAuthHeaders,
  uploadAdminMedia,
} from '../src/lib/api';
