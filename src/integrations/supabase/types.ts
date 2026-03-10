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
      autocomplete_options: {
        Row: {
          active: boolean | null
          category: string
          display_label: string
          id: string
          option_value: string
          search_terms: string | null
          source_airtable_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category: string
          display_label: string
          id?: string
          option_value: string
          search_terms?: string | null
          source_airtable_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string
          display_label?: string
          id?: string
          option_value?: string
          search_terms?: string | null
          source_airtable_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      catalog_finishes: {
        Row: {
          compatible_materials: string[] | null
          finish_id: string
          finish_name: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          compatible_materials?: string[] | null
          finish_id: string
          finish_name: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          compatible_materials?: string[] | null
          finish_id?: string
          finish_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      catalog_last_updated: {
        Row: {
          table_name: string
          updated_at: string
        }
        Insert: {
          table_name: string
          updated_at?: string
        }
        Update: {
          table_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      catalog_materials: {
        Row: {
          id: string
          is_active: boolean
          material_id: string
          material_name: string
          sort_order: number | null
          swatch_url: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          material_id: string
          material_name: string
          sort_order?: number | null
          swatch_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          is_active?: boolean
          material_id?: string
          material_name?: string
          sort_order?: number | null
          swatch_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      catalog_profiles: {
        Row: {
          defaults_json: Json | null
          id: string
          illustration_url: string | null
          is_active: boolean
          profile_code: string
          profile_name: string
          updated_at: string
        }
        Insert: {
          defaults_json?: Json | null
          id?: string
          illustration_url?: string | null
          is_active?: boolean
          profile_code: string
          profile_name: string
          updated_at?: string
        }
        Update: {
          defaults_json?: Json | null
          id?: string
          illustration_url?: string | null
          is_active?: boolean
          profile_code?: string
          profile_name?: string
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
      draft_quotes: {
        Row: {
          created_at: string | null
          id: string
          profile_type: string | null
          spec_data: Json | null
          title: string
          updated_at: string | null
          user_email: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_type?: string | null
          spec_data?: Json | null
          title?: string
          updated_at?: string | null
          user_email: string
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_type?: string | null
          spec_data?: Json | null
          title?: string
          updated_at?: string | null
          user_email?: string
        }
        Relationships: []
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
      review_flags: {
        Row: {
          airtable_record_id: string | null
          created_at: string | null
          customer_notes: string | null
          customer_response: string | null
          customer_value: string | null
          flag_type: string
          id: string
          issue_description: string
          reason_code: string | null
          recommended_value: string | null
          screenshot_path: string | null
          session_id: string
          sign_page_ref: string | null
          sort_order: number
          spec_field: string | null
        }
        Insert: {
          airtable_record_id?: string | null
          created_at?: string | null
          customer_notes?: string | null
          customer_response?: string | null
          customer_value?: string | null
          flag_type?: string
          id?: string
          issue_description: string
          reason_code?: string | null
          recommended_value?: string | null
          screenshot_path?: string | null
          session_id: string
          sign_page_ref?: string | null
          sort_order?: number
          spec_field?: string | null
        }
        Update: {
          airtable_record_id?: string | null
          created_at?: string | null
          customer_notes?: string | null
          customer_response?: string | null
          customer_value?: string | null
          flag_type?: string
          id?: string
          issue_description?: string
          reason_code?: string | null
          recommended_value?: string | null
          screenshot_path?: string | null
          session_id?: string
          sign_page_ref?: string | null
          sort_order?: number
          spec_field?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_flags_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "review_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      review_sessions: {
        Row: {
          account_id: string | null
          airtable_record_id: string | null
          artwork_paths: string[] | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          fillout_link: string | null
          flag_count: number | null
          id: string
          markup_paths: string[] | null
          pg_quote_number: string | null
          reviewer_email: string
          status: string
          updated_at: string | null
          upload_path: string | null
        }
        Insert: {
          account_id?: string | null
          airtable_record_id?: string | null
          artwork_paths?: string[] | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          fillout_link?: string | null
          flag_count?: number | null
          id?: string
          markup_paths?: string[] | null
          pg_quote_number?: string | null
          reviewer_email: string
          status?: string
          updated_at?: string | null
          upload_path?: string | null
        }
        Update: {
          account_id?: string | null
          airtable_record_id?: string | null
          artwork_paths?: string[] | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          fillout_link?: string | null
          flag_count?: number | null
          id?: string
          markup_paths?: string[] | null
          pg_quote_number?: string | null
          reviewer_email?: string
          status?: string
          updated_at?: string | null
          upload_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_sessions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      review_signs: {
        Row: {
          acrylic_face: string | null
          airtable_record_id: string | null
          back_type: string | null
          created_at: string | null
          customer_notes: string | null
          depth: string | null
          finish: string | null
          flag_count: number | null
          id: string
          lead_wires: string | null
          led_color: string | null
          metal_type: string | null
          mounting: string | null
          page_ref: string | null
          price: number | null
          profile_type: string | null
          session_id: string
          sign_name: string
          sort_order: number
          specs_source: string | null
          status: string | null
          ul_label: string | null
          updated_at: string | null
          wire_exit: string | null
        }
        Insert: {
          acrylic_face?: string | null
          airtable_record_id?: string | null
          back_type?: string | null
          created_at?: string | null
          customer_notes?: string | null
          depth?: string | null
          finish?: string | null
          flag_count?: number | null
          id?: string
          lead_wires?: string | null
          led_color?: string | null
          metal_type?: string | null
          mounting?: string | null
          page_ref?: string | null
          price?: number | null
          profile_type?: string | null
          session_id: string
          sign_name: string
          sort_order?: number
          specs_source?: string | null
          status?: string | null
          ul_label?: string | null
          updated_at?: string | null
          wire_exit?: string | null
        }
        Update: {
          acrylic_face?: string | null
          airtable_record_id?: string | null
          back_type?: string | null
          created_at?: string | null
          customer_notes?: string | null
          depth?: string | null
          finish?: string | null
          flag_count?: number | null
          id?: string
          lead_wires?: string | null
          led_color?: string | null
          metal_type?: string | null
          mounting?: string | null
          page_ref?: string | null
          price?: number | null
          profile_type?: string | null
          session_id?: string
          sign_name?: string
          sort_order?: number
          specs_source?: string | null
          status?: string | null
          ul_label?: string | null
          updated_at?: string | null
          wire_exit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_signs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "review_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      reviewer_whitelist: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string
          id: string
          name: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      spec_options: {
        Row: {
          field_name: string
          id: string
          label: string
          options: Json
          profile_type: string
          required: boolean | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          field_name: string
          id?: string
          label: string
          options?: Json
          profile_type: string
          required?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          field_name?: string
          id?: string
          label?: string
          options?: Json
          profile_type?: string
          required?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
      verified_domains: {
        Row: {
          approved_by: string | null
          company_name: string | null
          created_at: string | null
          domain: string
          id: string
        }
        Insert: {
          approved_by?: string | null
          company_name?: string | null
          created_at?: string | null
          domain: string
          id?: string
        }
        Update: {
          approved_by?: string | null
          company_name?: string | null
          created_at?: string | null
          domain?: string
          id?: string
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
