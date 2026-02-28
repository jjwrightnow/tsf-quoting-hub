export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_type: string
          active: boolean
          airtable_id: string | null
          company_name: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          account_type: string
          active?: boolean
          airtable_id?: string | null
          company_name: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          active?: boolean
          airtable_id?: string | null
          company_name?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          account_id: string
          active: boolean
          airtable_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          supabase_auth_uid: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          active?: boolean
          airtable_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          supabase_auth_uid?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          active?: boolean
          airtable_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          supabase_auth_uid?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          account_id: string
          airtable_last_modified: string | null
          airtable_record_id: string
          contact_id: string
          created_at: string
          customer_notes: string | null
          date_sent: string | null
          environment: string | null
          final_price: number | null
          finish: string | null
          id: string
          illumination_style: string | null
          lead_time: string | null
          letter_height_in: number | null
          material: string | null
          mounting_type: string | null
          pdf_url: string | null
          profile_type: string | null
          project_name: string | null
          quantity: number | null
          quote_display_id: string | null
          status: string | null
          synced_at: string
          version_status: string | null
        }
        Insert: {
          account_id: string
          airtable_last_modified?: string | null
          airtable_record_id: string
          contact_id: string
          created_at?: string
          customer_notes?: string | null
          date_sent?: string | null
          environment?: string | null
          final_price?: number | null
          finish?: string | null
          id?: string
          illumination_style?: string | null
          lead_time?: string | null
          letter_height_in?: number | null
          material?: string | null
          mounting_type?: string | null
          pdf_url?: string | null
          profile_type?: string | null
          project_name?: string | null
          quantity?: number | null
          quote_display_id?: string | null
          status?: string | null
          synced_at?: string
          version_status?: string | null
        }
        Update: {
          account_id?: string
          airtable_last_modified?: string | null
          airtable_record_id?: string
          contact_id?: string
          created_at?: string
          customer_notes?: string | null
          date_sent?: string | null
          environment?: string | null
          final_price?: number | null
          finish?: string | null
          id?: string
          illumination_style?: string | null
          lead_time?: string | null
          letter_height_in?: number | null
          material?: string | null
          mounting_type?: string | null
          pdf_url?: string | null
          profile_type?: string | null
          project_name?: string | null
          quantity?: number | null
          quote_display_id?: string | null
          status?: string | null
          synced_at?: string
          version_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_queue: {
        Row: {
          account_id: string
          airtable_record_id: string | null
          contact_id: string
          created_at: string
          error_detail: string | null
          id: string
          idempotency_key: string
          last_attempt: string | null
          payload: Json
          retry_count: number
          sync_status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          airtable_record_id?: string | null
          contact_id: string
          created_at?: string
          error_detail?: string | null
          id?: string
          idempotency_key: string
          last_attempt?: string | null
          payload: Json
          retry_count?: number
          sync_status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          airtable_record_id?: string | null
          contact_id?: string
          created_at?: string
          error_detail?: string | null
          id?: string
          idempotency_key?: string
          last_attempt?: string | null
          payload?: Json
          retry_count?: number
          sync_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_queue_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_queue_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_state: {
        Row: {
          error_count: number
          id: number
          last_polled_at: string
          last_successful_at: string | null
          poll_count: number
        }
        Insert: {
          error_count?: number
          id?: number
          last_polled_at?: string
          last_successful_at?: string | null
          poll_count?: number
        }
        Update: {
          error_count?: number
          id?: number
          last_polled_at?: string
          last_successful_at?: string | null
          poll_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_account_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
