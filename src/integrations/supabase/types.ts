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
      access_requests: {
        Row: {
          company_name: string
          created_at: string | null
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
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
          swatch_url: string | null
          updated_at: string
        }
        Insert: {
          compatible_materials?: string[] | null
          finish_id: string
          finish_name: string
          id?: string
          is_active?: boolean
          swatch_url?: string | null
          updated_at?: string
        }
        Update: {
          compatible_materials?: string[] | null
          finish_id?: string
          finish_name?: string
          id?: string
          is_active?: boolean
          swatch_url?: string | null
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
      chat_messages: {
        Row: {
          bubble_id: string | null
          content: string
          created_at: string
          id: string
          message_type: string
          role: string
          session_id: string
        }
        Insert: {
          bubble_id?: string | null
          content: string
          created_at?: string
          id?: string
          message_type?: string
          role: string
          session_id: string
        }
        Update: {
          bubble_id?: string | null
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          company_name: string | null
          domain: string | null
          email: string | null
          id: string
          is_verified: boolean
          jj_notified: boolean
          last_message_at: string | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          started_at: string
          status: string
        }
        Insert: {
          company_name?: string | null
          domain?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean
          jj_notified?: boolean
          last_message_at?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          started_at?: string
          status?: string
        }
        Update: {
          company_name?: string | null
          domain?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean
          jj_notified?: boolean
          last_message_at?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      components: {
        Row: {
          airtable_id: string | null
          can_be_back: boolean | null
          can_be_face: boolean | null
          client_badge: string | null
          client_description: string | null
          component_name: string
          created_at: string | null
          id: string
          is_illuminated: boolean | null
          material_category: string | null
          notes: string | null
          sub_type: string | null
          thickness: string | null
          updated_at: string | null
        }
        Insert: {
          airtable_id?: string | null
          can_be_back?: boolean | null
          can_be_face?: boolean | null
          client_badge?: string | null
          client_description?: string | null
          component_name: string
          created_at?: string | null
          id?: string
          is_illuminated?: boolean | null
          material_category?: string | null
          notes?: string | null
          sub_type?: string | null
          thickness?: string | null
          updated_at?: string | null
        }
        Update: {
          airtable_id?: string | null
          can_be_back?: boolean | null
          can_be_face?: boolean | null
          client_badge?: string | null
          client_description?: string | null
          component_name?: string
          created_at?: string | null
          id?: string
          is_illuminated?: boolean | null
          material_category?: string | null
          notes?: string | null
          sub_type?: string | null
          thickness?: string | null
          updated_at?: string | null
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
      default_thickness_rules: {
        Row: {
          created_at: string | null
          face_thickness_mm: number
          height_range: string
          id: string
          notes: string | null
          return_thickness_mm: number
        }
        Insert: {
          created_at?: string | null
          face_thickness_mm: number
          height_range: string
          id?: string
          notes?: string | null
          return_thickness_mm: number
        }
        Update: {
          created_at?: string | null
          face_thickness_mm?: number
          height_range?: string
          id?: string
          notes?: string | null
          return_thickness_mm?: number
        }
        Relationships: []
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
      finishes: {
        Row: {
          airtable_id: string | null
          created_at: string | null
          finish_category: string | null
          finish_name: string
          id: string
          notes: string | null
        }
        Insert: {
          airtable_id?: string | null
          created_at?: string | null
          finish_category?: string | null
          finish_name: string
          id?: string
          notes?: string | null
        }
        Update: {
          airtable_id?: string | null
          created_at?: string | null
          finish_category?: string | null
          finish_name?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      lighting_styles: {
        Row: {
          display_name: string
          hover_description: string | null
          id: string
          is_active: boolean | null
          lighting_code: string
          sku_label: string
          sort_order: number
          thumbnail_url: string | null
        }
        Insert: {
          display_name: string
          hover_description?: string | null
          id?: string
          is_active?: boolean | null
          lighting_code: string
          sku_label: string
          sort_order?: number
          thumbnail_url?: string | null
        }
        Update: {
          display_name?: string
          hover_description?: string | null
          id?: string
          is_active?: boolean | null
          lighting_code?: string
          sku_label?: string
          sort_order?: number
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      material_finish_compatibility: {
        Row: {
          finish_2b: boolean | null
          finish_hl: boolean | null
          finish_n4: boolean | null
          finish_n8: boolean | null
          finish_po: boolean | null
          id: string
          material: string
        }
        Insert: {
          finish_2b?: boolean | null
          finish_hl?: boolean | null
          finish_n4?: boolean | null
          finish_n8?: boolean | null
          finish_po?: boolean | null
          id?: string
          material: string
        }
        Update: {
          finish_2b?: boolean | null
          finish_hl?: boolean | null
          finish_n4?: boolean | null
          finish_n8?: boolean | null
          finish_po?: boolean | null
          id?: string
          material?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          airtable_id: string | null
          available_thicknesses: string | null
          base_material: string
          created_at: string | null
          default_finish: string | null
          grade: string | null
          id: string
          light_transmission: string | null
          material_name: string
          notes: string | null
          outdoor_rated: boolean | null
        }
        Insert: {
          airtable_id?: string | null
          available_thicknesses?: string | null
          base_material: string
          created_at?: string | null
          default_finish?: string | null
          grade?: string | null
          id?: string
          light_transmission?: string | null
          material_name: string
          notes?: string | null
          outdoor_rated?: boolean | null
        }
        Update: {
          airtable_id?: string | null
          available_thicknesses?: string | null
          base_material?: string
          created_at?: string | null
          default_finish?: string | null
          grade?: string | null
          id?: string
          light_transmission?: string | null
          material_name?: string
          notes?: string | null
          outdoor_rated?: boolean | null
        }
        Relationships: []
      }
      operator_config: {
        Row: {
          brand_name: string | null
          canned_questions: Json | null
          chatbot_name: string | null
          context_instruction: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          support_email: string | null
          updated_at: string | null
        }
        Insert: {
          brand_name?: string | null
          canned_questions?: Json | null
          chatbot_name?: string | null
          context_instruction?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          support_email?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_name?: string | null
          canned_questions?: Json | null
          chatbot_name?: string | null
          context_instruction?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          support_email?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      portal_projects: {
        Row: {
          account_id: string | null
          airtable_project_id: string | null
          contact_id: string | null
          created_at: string
          id: string
          notes: string | null
          project_name: string
          quote_ref: string | null
          share_pricing_visible: boolean | null
          share_slug: string | null
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          airtable_project_id?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          project_name: string
          quote_ref?: string | null
          share_pricing_visible?: boolean | null
          share_slug?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          airtable_project_id?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          project_name?: string
          quote_ref?: string | null
          share_pricing_visible?: boolean | null
          share_slug?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_projects_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_projects_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_signs: {
        Row: {
          acrylic_face: string | null
          airtable_sign_id: string | null
          artwork_urls: string[] | null
          back_type: string | null
          created_at: string
          depth: string | null
          finish: string | null
          height: string | null
          height_inches: number | null
          id: string
          is_complete: boolean | null
          lead_wires: string | null
          led_color: string | null
          metal_type: string | null
          mounting: string | null
          notes: string | null
          profile_code: string | null
          profile_type: string | null
          project_id: string
          sets: number | null
          sign_name: string
          sign_text: string | null
          sort_order: number | null
          spec_data: Json | null
          ul_label: string | null
          updated_at: string
          user_email: string | null
          wire_exit: string | null
        }
        Insert: {
          acrylic_face?: string | null
          airtable_sign_id?: string | null
          artwork_urls?: string[] | null
          back_type?: string | null
          created_at?: string
          depth?: string | null
          finish?: string | null
          height?: string | null
          height_inches?: number | null
          id?: string
          is_complete?: boolean | null
          lead_wires?: string | null
          led_color?: string | null
          metal_type?: string | null
          mounting?: string | null
          notes?: string | null
          profile_code?: string | null
          profile_type?: string | null
          project_id: string
          sets?: number | null
          sign_name?: string
          sign_text?: string | null
          sort_order?: number | null
          spec_data?: Json | null
          ul_label?: string | null
          updated_at?: string
          user_email?: string | null
          wire_exit?: string | null
        }
        Update: {
          acrylic_face?: string | null
          airtable_sign_id?: string | null
          artwork_urls?: string[] | null
          back_type?: string | null
          created_at?: string
          depth?: string | null
          finish?: string | null
          height?: string | null
          height_inches?: number | null
          id?: string
          is_complete?: boolean | null
          lead_wires?: string | null
          led_color?: string | null
          metal_type?: string | null
          mounting?: string | null
          notes?: string | null
          profile_code?: string | null
          profile_type?: string | null
          project_id?: string
          sets?: number | null
          sign_name?: string
          sign_text?: string | null
          sort_order?: number | null
          spec_data?: Json | null
          ul_label?: string | null
          updated_at?: string
          user_email?: string | null
          wire_exit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_signs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_applications: {
        Row: {
          auto_approved: boolean | null
          company_name: string
          created_at: string | null
          email: string
          estimated_volume: string | null
          id: string
          notes: string | null
          referral_source: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role: string | null
          status: string
          website: string | null
        }
        Insert: {
          auto_approved?: boolean | null
          company_name: string
          created_at?: string | null
          email: string
          estimated_volume?: string | null
          id?: string
          notes?: string | null
          referral_source?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          status?: string
          website?: string | null
        }
        Update: {
          auto_approved?: boolean | null
          company_name?: string
          created_at?: string | null
          email?: string
          estimated_volume?: string | null
          id?: string
          notes?: string | null
          referral_source?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          status?: string
          website?: string | null
        }
        Relationships: []
      }
      product_specs: {
        Row: {
          category: string | null
          created_at: string | null
          dimensions: Json | null
          edge_profile: string | null
          embedding: string | null
          environmental_suitability: string[] | null
          id: string
          lighting_style: string | null
          materials: string[] | null
          mounting_hardware: string[] | null
          profile_image_url: string | null
          sku: string
          specs_text: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          dimensions?: Json | null
          edge_profile?: string | null
          embedding?: string | null
          environmental_suitability?: string[] | null
          id?: string
          lighting_style?: string | null
          materials?: string[] | null
          mounting_hardware?: string[] | null
          profile_image_url?: string | null
          sku: string
          specs_text?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          dimensions?: Json | null
          edge_profile?: string | null
          embedding?: string | null
          environmental_suitability?: string[] | null
          id?: string
          lighting_style?: string | null
          materials?: string[] | null
          mounting_hardware?: string[] | null
          profile_image_url?: string | null
          sku?: string
          specs_text?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profile_components: {
        Row: {
          airtable_id: string | null
          component_id: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          layer_position: string
          notes: string | null
          position_order: number
          profile_id: string | null
        }
        Insert: {
          airtable_id?: string | null
          component_id?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          layer_position: string
          notes?: string | null
          position_order: number
          profile_id?: string | null
        }
        Update: {
          airtable_id?: string | null
          component_id?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          layer_position?: string
          notes?: string | null
          position_order?: number
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_components_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_components_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_components_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_display"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          airtable_id: string | null
          created_at: string | null
          display_name: string | null
          face_style: string | null
          id: string
          illustration_url: string | null
          is_active: boolean | null
          lighting_code: string
          notes: string | null
          profile_code: string
          profile_name: string
          return_type: string | null
          technology: string | null
          updated_at: string | null
        }
        Insert: {
          airtable_id?: string | null
          created_at?: string | null
          display_name?: string | null
          face_style?: string | null
          id?: string
          illustration_url?: string | null
          is_active?: boolean | null
          lighting_code: string
          notes?: string | null
          profile_code: string
          profile_name: string
          return_type?: string | null
          technology?: string | null
          updated_at?: string | null
        }
        Update: {
          airtable_id?: string | null
          created_at?: string | null
          display_name?: string | null
          face_style?: string | null
          id?: string
          illustration_url?: string | null
          is_active?: boolean | null
          lighting_code?: string
          notes?: string | null
          profile_code?: string
          profile_name?: string
          return_type?: string | null
          technology?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          action: string | null
          client_email: string
          client_name: string | null
          comment: string | null
          created_at: string | null
          id: string
          project_id: string
          share_slug: string | null
        }
        Insert: {
          action?: string | null
          client_email: string
          client_name?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          project_id: string
          share_slug?: string | null
        }
        Update: {
          action?: string | null
          client_email?: string
          client_name?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          project_id?: string
          share_slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_library: {
        Row: {
          airtable_record_id: string | null
          created_at: string | null
          id: string
          image_url: string
          is_verified: boolean | null
          lighting: string[] | null
          materials: string[] | null
          mounting: string[] | null
          sign_profile: string | null
          sign_types: string[] | null
          source_base: string | null
          vibe_description: string | null
        }
        Insert: {
          airtable_record_id?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_verified?: boolean | null
          lighting?: string[] | null
          materials?: string[] | null
          mounting?: string[] | null
          sign_profile?: string | null
          sign_types?: string[] | null
          source_base?: string | null
          vibe_description?: string | null
        }
        Update: {
          airtable_record_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_verified?: boolean | null
          lighting?: string[] | null
          materials?: string[] | null
          mounting?: string[] | null
          sign_profile?: string | null
          sign_types?: string[] | null
          source_base?: string | null
          vibe_description?: string | null
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
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          fillout_link: string | null
          flag_count: number | null
          id: string
          markup_paths: string[] | null
          pg_quote_number: string | null
          reviewer_email: string | null
          status: string
          updated_at: string | null
          upload_path: string | null
        }
        Insert: {
          account_id?: string | null
          airtable_record_id?: string | null
          artwork_paths?: string[] | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          fillout_link?: string | null
          flag_count?: number | null
          id?: string
          markup_paths?: string[] | null
          pg_quote_number?: string | null
          reviewer_email?: string | null
          status?: string
          updated_at?: string | null
          upload_path?: string | null
        }
        Update: {
          account_id?: string | null
          airtable_record_id?: string | null
          artwork_paths?: string[] | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          fillout_link?: string | null
          flag_count?: number | null
          id?: string
          markup_paths?: string[] | null
          pg_quote_number?: string | null
          reviewer_email?: string | null
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
          image_url: string | null
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
          image_url?: string | null
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
          image_url?: string | null
          label?: string
          options?: Json
          profile_type?: string
          required?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_materials: {
        Row: {
          base_material: string
          created_at: string | null
          finish_code: string | null
          id: string
          in_stock: boolean | null
          material_name: string
          notes: string | null
          surface_finish: string | null
          thickness_in: number | null
          thickness_mm: number
          updated_at: string | null
        }
        Insert: {
          base_material: string
          created_at?: string | null
          finish_code?: string | null
          id?: string
          in_stock?: boolean | null
          material_name: string
          notes?: string | null
          surface_finish?: string | null
          thickness_in?: number | null
          thickness_mm: number
          updated_at?: string | null
        }
        Update: {
          base_material?: string
          created_at?: string | null
          finish_code?: string | null
          id?: string
          in_stock?: boolean | null
          material_name?: string
          notes?: string | null
          surface_finish?: string | null
          thickness_in?: number | null
          thickness_mm?: number
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
      surface_finish_codes: {
        Row: {
          code: string
          description: string
        }
        Insert: {
          code: string
          description: string
        }
        Update: {
          code?: string
          description?: string
        }
        Relationships: []
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
      technology_classes: {
        Row: {
          code: string
          display_name: string
          hover_description: string
          id: string
          is_active: boolean | null
          materials: string
          price_tier: string
          short_name: string
          sort_order: number
          thumbnail_url: string | null
        }
        Insert: {
          code: string
          display_name: string
          hover_description: string
          id?: string
          is_active?: boolean | null
          materials: string
          price_tier: string
          short_name: string
          sort_order?: number
          thumbnail_url?: string | null
        }
        Update: {
          code?: string
          display_name?: string
          hover_description?: string
          id?: string
          is_active?: boolean | null
          materials?: string
          price_tier?: string
          short_name?: string
          sort_order?: number
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      ui_tooltips: {
        Row: {
          best_for: string | null
          category: string
          created_at: string | null
          id: string
          key: string
          label: string
          long_description: string | null
          not_ideal_for: string | null
          price_indicator: string | null
          short_description: string
          sort_order: number | null
          svg_illustration: string | null
        }
        Insert: {
          best_for?: string | null
          category: string
          created_at?: string | null
          id?: string
          key: string
          label: string
          long_description?: string | null
          not_ideal_for?: string | null
          price_indicator?: string | null
          short_description: string
          sort_order?: number | null
          svg_illustration?: string | null
        }
        Update: {
          best_for?: string | null
          category?: string
          created_at?: string | null
          id?: string
          key?: string
          label?: string
          long_description?: string | null
          not_ideal_for?: string | null
          price_indicator?: string | null
          short_description?: string
          sort_order?: number | null
          svg_illustration?: string | null
        }
        Relationships: []
      }
      verified_customers: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          id: string
          is_verified: boolean
          temp_pro_expires_at: string | null
          ui_mode: string | null
          user_role: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_verified?: boolean
          temp_pro_expires_at?: string | null
          ui_mode?: string | null
          user_role?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_verified?: boolean
          temp_pro_expires_at?: string | null
          ui_mode?: string | null
          user_role?: string | null
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
      zzz_legacy_projects: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          location_type: string | null
          name: string
          notes: string | null
          quote_number: string | null
          status: string
          updated_at: string | null
          user_email: string
          wall_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          location_type?: string | null
          name: string
          notes?: string | null
          quote_number?: string | null
          status?: string
          updated_at?: string | null
          user_email: string
          wall_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          location_type?: string | null
          name?: string
          notes?: string | null
          quote_number?: string | null
          status?: string
          updated_at?: string | null
          user_email?: string
          wall_type?: string | null
        }
        Relationships: []
      }
      zzz_legacy_signs: {
        Row: {
          created_at: string | null
          id: string
          profile_type: string | null
          project_id: string
          sort_order: number | null
          spec_data: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_type?: string | null
          project_id: string
          sort_order?: number | null
          spec_data?: Json | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_type?: string | null
          project_id?: string
          sort_order?: number | null
          spec_data?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "zzz_legacy_projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_application_queue: {
        Row: {
          auto_approved: boolean | null
          company_name: string | null
          created_at: string | null
          domain: string | null
          email: string | null
          estimated_volume: string | null
          id: string | null
          is_business_domain: boolean | null
          notes: string | null
          priority_score: number | null
          project_count: number | null
          referral_source: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role: string | null
          status: string | null
          volume_label: string | null
          website: string | null
        }
        Insert: {
          auto_approved?: boolean | null
          company_name?: string | null
          created_at?: string | null
          domain?: never
          email?: string | null
          estimated_volume?: string | null
          id?: string | null
          is_business_domain?: never
          notes?: string | null
          priority_score?: never
          project_count?: never
          referral_source?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          status?: string | null
          volume_label?: never
          website?: string | null
        }
        Update: {
          auto_approved?: boolean | null
          company_name?: string | null
          created_at?: string | null
          domain?: never
          email?: string | null
          estimated_volume?: string | null
          id?: string | null
          is_business_domain?: never
          notes?: string | null
          priority_score?: never
          project_count?: never
          referral_source?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          status?: string | null
          volume_label?: never
          website?: string | null
        }
        Relationships: []
      }
      portal_signs_display: {
        Row: {
          acrylic_face: string | null
          airtable_sign_id: string | null
          artwork_urls: string[] | null
          back_type: string | null
          created_at: string | null
          depth: string | null
          display_height: string | null
          finish: string | null
          height: string | null
          height_inches: number | null
          id: string | null
          is_complete: boolean | null
          lead_wires: string | null
          led_color: string | null
          metal_type: string | null
          mounting: string | null
          notes: string | null
          profile_code: string | null
          profile_type: string | null
          project_id: string | null
          sets: number | null
          sign_name: string | null
          sign_text: string | null
          sort_order: number | null
          spec_data: Json | null
          ul_label: string | null
          updated_at: string | null
          user_email: string | null
          wire_exit: string | null
        }
        Insert: {
          acrylic_face?: string | null
          airtable_sign_id?: string | null
          artwork_urls?: string[] | null
          back_type?: string | null
          created_at?: string | null
          depth?: string | null
          display_height?: never
          finish?: string | null
          height?: string | null
          height_inches?: number | null
          id?: string | null
          is_complete?: boolean | null
          lead_wires?: string | null
          led_color?: string | null
          metal_type?: string | null
          mounting?: string | null
          notes?: string | null
          profile_code?: string | null
          profile_type?: string | null
          project_id?: string | null
          sets?: number | null
          sign_name?: string | null
          sign_text?: string | null
          sort_order?: number | null
          spec_data?: Json | null
          ul_label?: string | null
          updated_at?: string | null
          user_email?: string | null
          wire_exit?: string | null
        }
        Update: {
          acrylic_face?: string | null
          airtable_sign_id?: string | null
          artwork_urls?: string[] | null
          back_type?: string | null
          created_at?: string | null
          depth?: string | null
          display_height?: never
          finish?: string | null
          height?: string | null
          height_inches?: number | null
          id?: string | null
          is_complete?: boolean | null
          lead_wires?: string | null
          led_color?: string | null
          metal_type?: string | null
          mounting?: string | null
          notes?: string | null
          profile_code?: string | null
          profile_type?: string | null
          project_id?: string | null
          sets?: number | null
          sign_name?: string | null
          sign_text?: string | null
          sort_order?: number | null
          spec_data?: Json | null
          ul_label?: string | null
          updated_at?: string | null
          user_email?: string | null
          wire_exit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_signs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_display: {
        Row: {
          airtable_id: string | null
          created_at: string | null
          display_name: string | null
          face_style: string | null
          id: string | null
          illustration_url: string | null
          is_active: boolean | null
          lighting_code: string | null
          name: string | null
          notes: string | null
          profile_code: string | null
          profile_name: string | null
          return_type: string | null
          technology: string | null
          updated_at: string | null
        }
        Insert: {
          airtable_id?: string | null
          created_at?: string | null
          display_name?: string | null
          face_style?: string | null
          id?: string | null
          illustration_url?: string | null
          is_active?: boolean | null
          lighting_code?: string | null
          name?: string | null
          notes?: string | null
          profile_code?: string | null
          profile_name?: string | null
          return_type?: string | null
          technology?: string | null
          updated_at?: string | null
        }
        Update: {
          airtable_id?: string | null
          created_at?: string | null
          display_name?: string | null
          face_style?: string | null
          id?: string | null
          illustration_url?: string | null
          is_active?: boolean | null
          lighting_code?: string | null
          name?: string | null
          notes?: string | null
          profile_code?: string | null
          profile_name?: string | null
          return_type?: string | null
          technology?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_summary: {
        Row: {
          complete_sign_count: number | null
          created_at: string | null
          id: string | null
          name: string | null
          quote_number: string | null
          sign_count: number | null
          status: string | null
          updated_at: string | null
          user_email: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_approve_application: {
        Args: {
          p_application_id: string
          p_notes?: string
          p_reviewer?: string
        }
        Returns: Json
      }
      admin_reject_application: {
        Args: {
          p_application_id: string
          p_notes?: string
          p_reviewer?: string
        }
        Returns: Json
      }
      archive_stale_projects: { Args: never; Returns: undefined }
      get_effective_user_role: { Args: { p_email: string }; Returns: string }
      get_my_account_id: { Args: never; Returns: string }
      get_or_create_contact: {
        Args: { p_email: string }
        Returns: {
          account_id: string
          contact_id: string
        }[]
      }
      get_project_for_pdf: { Args: { p_project_id: string }; Returns: Json }
      init_chat_session: {
        Args: { p_company_name?: string; p_email?: string }
        Returns: string
      }
      is_business_email: { Args: { p_email: string }; Returns: boolean }
      search_signage: {
        Args: {
          result_limit?: number
          search_lighting?: string[]
          search_materials?: string[]
          search_vibe?: string
        }
        Returns: {
          id: string
          image_url: string
          lighting: string[]
          materials: string[]
          mounting: string[]
          sign_profile: string
          sign_types: string[]
          vibe_description: string
        }[]
      }
      submit_pro_application: {
        Args: {
          p_company_name: string
          p_email: string
          p_estimated_volume?: string
          p_referral_source?: string
          p_role?: string
          p_website?: string
        }
        Returns: Json
      }
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
