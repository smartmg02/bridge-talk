export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      records: {
        Row: {
          id: number;
          user_email: string;
          message: string;
          gpt_reply: string;
          audio_url: string | null;
          created_at: string;
          mode: string;
          role: string;
          tone: string;
          recipient: string;
        };
        Insert: {
          id?: number;
          user_email: string;
          message: string;
          gpt_reply: string;
          audio_url?: string | null;
          created_at?: string;
          mode: string;
          role: string;
          tone: string;
          recipient: string;
        };
        Update: {
          id?: number;
          user_email?: string;
          message?: string;
          gpt_reply?: string;
          audio_url?: string | null;
          created_at?: string;
          mode?: string;
          role?: string;
          tone?: string;
          recipient?: string;
        };
        Relationships: [];
      };

      token_usage: {
        Row: {
          id: string;
          user_email: string;
          date: string;
          tokens_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          date: string;
          tokens_used: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          date?: string;
          tokens_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
