export interface ApiConfig {
  url: string;
  authToken: string | null;
}

export const EMPTY_API_CONFIG: ApiConfig = {
  url: 'na-URL',
  authToken: null
};
