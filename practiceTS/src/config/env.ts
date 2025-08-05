export const ENV = {
  IMGBB_API_KEY: process.env.IMGBB_API_KEY as string,
  IMGBB_EXPIRATION: 3600,
  IMGBB_BASE_URL: 'https://api.imgbb.com/1/upload',
};

export interface ApiConfig {
  baseUrl: string;
  endpoints: Record<
    'products' | 'users',
    string
  >;
}

/**
 * Default API configuration
 */
export const API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:3000',
  endpoints: {
    products: '/products',
    users: '/users'
  }
} as const;
