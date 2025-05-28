export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

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
        };
        Insert: {
          id?: number;
          user_email: string;
          message: string;
          gpt_reply: string;
          audio_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_email?: string;
          message?: string;
          gpt_reply?: string;
          audio_url?: string | null;
          created_at?: string;
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
