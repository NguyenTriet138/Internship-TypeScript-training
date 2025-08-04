export const ENV = {
  IMGBB_API_KEY: process.env.IMGBB_API_KEY as string,
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
