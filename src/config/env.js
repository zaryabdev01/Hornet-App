import Constants from 'expo-constants';

export const PROXY_URL = Constants.expoConfig?.extra?.proxyUrl || '';
export const PROXY_SECRET = Constants.expoConfig?.extra?.proxySecret || '';
export const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || '';
export const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || '';
export const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || '';
