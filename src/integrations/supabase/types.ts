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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      bank_transactions: {
        Row: {
          amount_vnd: number
          content_raw: string
          created_at: string | null
          credit_account: string
          id: string
          matched_intent_id: string | null
          matched_user_phone: string | null
          paid_at: string
          processed_at: string | null
          txn_id: string
        }
        Insert: {
          amount_vnd: number
          content_raw: string
          created_at?: string | null
          credit_account: string
          id?: string
          matched_intent_id?: string | null
          matched_user_phone?: string | null
          paid_at: string
          processed_at?: string | null
          txn_id: string
        }
        Update: {
          amount_vnd?: number
          content_raw?: string
          created_at?: string | null
          credit_account?: string
          id?: string
          matched_intent_id?: string | null
          matched_user_phone?: string | null
          paid_at?: string
          processed_at?: string | null
          txn_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_matched_intent_id_fkey"
            columns: ["matched_intent_id"]
            isOneToOne: false
            referencedRelation: "payment_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          created_at: string | null
          expected_amount_vnd: number
          expires_at: string | null
          id: string
          payment_content: string
          status: string | null
          updated_at: string | null
          user_phone: string
          voucher_product_id: string | null
        }
        Insert: {
          created_at?: string | null
          expected_amount_vnd: number
          expires_at?: string | null
          id?: string
          payment_content: string
          status?: string | null
          updated_at?: string | null
          user_phone: string
          voucher_product_id?: string | null
        }
        Update: {
          created_at?: string | null
          expected_amount_vnd?: number
          expires_at?: string | null
          id?: string
          payment_content?: string
          status?: string | null
          updated_at?: string | null
          user_phone?: string
          voucher_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_intents_voucher_product_id_fkey"
            columns: ["voucher_product_id"]
            isOneToOne: false
            referencedRelation: "voucher_products"
            referencedColumns: ["id"]
          },
        ]
      }
      ran_ledger: {
        Row: {
          amount_ran: number
          balance_after: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_phone: string
        }
        Insert: {
          amount_ran: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_phone: string
        }
        Update: {
          amount_ran?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_phone?: string
        }
        Relationships: []
      }
      ran_wallets: {
        Row: {
          balance_ran: number | null
          created_at: string | null
          total_earned_ran: number | null
          total_spent_ran: number | null
          updated_at: string | null
          user_phone: string
        }
        Insert: {
          balance_ran?: number | null
          created_at?: string | null
          total_earned_ran?: number | null
          total_spent_ran?: number | null
          updated_at?: string | null
          user_phone: string
        }
        Update: {
          balance_ran?: number | null
          created_at?: string | null
          total_earned_ran?: number | null
          total_spent_ran?: number | null
          updated_at?: string | null
          user_phone?: string
        }
        Relationships: []
      }
      voucher_products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          payment_channel: string
          reward_ran: number
          sell_price_vnd: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          payment_channel?: string
          reward_ran: number
          sell_price_vnd: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          payment_channel?: string
          reward_ran?: number
          sell_price_vnd?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
