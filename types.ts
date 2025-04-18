export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          email?: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          email?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          email?: string;
        };
        Relationships: [];
      };
      reading_log: {
        Row: {
          id: string;
          user_id: string;
          verse: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          verse?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reading_log_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      reflections: {
        Row: {
          id: string;
          user_id: string;
          verse: string;
          verse_text?: string;
          question: string;
          answer: string;
          insight?: string;
          themes?: string[];
          is_shared?: boolean;
          likes?: number;
          liked_by?: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse: string;
          verse_text?: string;
          question: string;
          answer: string;
          insight?: string;
          themes?: string[];
          is_shared?: boolean;
          likes?: number;
          liked_by?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          verse?: string;
          verse_text?: string;
          question?: string;
          answer?: string;
          insight?: string;
          themes?: string[];
          is_shared?: boolean;
          likes?: number;
          liked_by?: string[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reflections_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      themes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          count?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "themes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      shared_insights: {
        Row: {
          id: string;
          user_id: string;
          verse: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          verse?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shared_insights_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      toggle_like: {
        Args: {
          p_user_id: string;
          p_insight_id: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
