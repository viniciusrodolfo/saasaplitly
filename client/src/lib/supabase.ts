// Note: We're using direct database connection through Drizzle instead of Supabase client
// This file is kept for potential future Supabase features like real-time subscriptions

export const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// For now, we're using our Express API with Drizzle
// Future: Could implement real-time subscriptions here
export const setupRealtimeSubscriptions = () => {
  // TODO: Implement real-time subscriptions for appointments, clients, etc.
  console.log('Real-time subscriptions will be implemented here');
};
