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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          password_hash: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password_hash: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password_hash?: string
        }
        Relationships: []
      }
      ai_feedback: {
        Row: {
          ai_classification: string | null
          category: string
          created_at: string
          id: string
          platform_id: string | null
          platform_name: string | null
          resolved: boolean
          teacher_message: string
        }
        Insert: {
          ai_classification?: string | null
          category?: string
          created_at?: string
          id?: string
          platform_id?: string | null
          platform_name?: string | null
          resolved?: boolean
          teacher_message: string
        }
        Update: {
          ai_classification?: string | null
          category?: string
          created_at?: string
          id?: string
          platform_id?: string | null
          platform_name?: string | null
          resolved?: boolean
          teacher_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_feedback_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          created_at: string
          data: Json
          file_url: string | null
          grade_level: string
          id: string
          kind: string
          lesson: string | null
          platform_id: string
          title: string
          unit: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          data?: Json
          file_url?: string | null
          grade_level: string
          id?: string
          kind: string
          lesson?: string | null
          platform_id: string
          title: string
          unit?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          file_url?: string | null
          grade_level?: string
          id?: string
          kind?: string
          lesson?: string | null
          platform_id?: string
          title?: string
          unit?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          answers: Json
          created_at: string
          exam_id: string
          id: string
          platform_id: string
          score: number
          student_id: string
          total: number
        }
        Insert: {
          answers?: Json
          created_at?: string
          exam_id: string
          id?: string
          platform_id: string
          score?: number
          student_id: string
          total?: number
        }
        Update: {
          answers?: Json
          created_at?: string
          exam_id?: string
          id?: string
          platform_id?: string
          score?: number
          student_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          code: string
          config: Json
          created_at: string
          dashboard_password: string | null
          deleted_at: string | null
          deleted_reason: string | null
          gate_mode: string
          grade_levels: Json
          id: string
          live_active: boolean
          live_cover_url: string | null
          live_started_at: string | null
          live_title: string | null
          live_url: string | null
          package_price: number
          package_students: number
          payment_status: string
          platform_admin_email: string | null
          platform_admin_password: string | null
          requested_students: number | null
          requested_tier: string | null
          slug: string
          stage: string
          status: string
          subject: string
          teacher_name: string
          teacher_phone: string
          template_tier: string
          updated_at: string
          upgrade_request: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          code: string
          config?: Json
          created_at?: string
          dashboard_password?: string | null
          deleted_at?: string | null
          deleted_reason?: string | null
          gate_mode?: string
          grade_levels?: Json
          id?: string
          live_active?: boolean
          live_cover_url?: string | null
          live_started_at?: string | null
          live_title?: string | null
          live_url?: string | null
          package_price?: number
          package_students?: number
          payment_status?: string
          platform_admin_email?: string | null
          platform_admin_password?: string | null
          requested_students?: number | null
          requested_tier?: string | null
          slug: string
          stage: string
          status?: string
          subject: string
          teacher_name: string
          teacher_phone: string
          template_tier?: string
          updated_at?: string
          upgrade_request?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          code?: string
          config?: Json
          created_at?: string
          dashboard_password?: string | null
          deleted_at?: string | null
          deleted_reason?: string | null
          gate_mode?: string
          grade_levels?: Json
          id?: string
          live_active?: boolean
          live_cover_url?: string | null
          live_started_at?: string | null
          live_title?: string | null
          live_url?: string | null
          package_price?: number
          package_students?: number
          payment_status?: string
          platform_admin_email?: string | null
          platform_admin_password?: string | null
          requested_students?: number | null
          requested_tier?: string | null
          slug?: string
          stage?: string
          status?: string
          subject?: string
          teacher_name?: string
          teacher_phone?: string
          template_tier?: string
          updated_at?: string
          upgrade_request?: string | null
        }
        Relationships: []
      }
      rooty_actions: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          payload: Json | null
          platform_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          payload?: Json | null
          platform_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          payload?: Json | null
          platform_id?: string
        }
        Relationships: []
      }
      student_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_used: boolean
          platform_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_used?: boolean
          platform_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_used?: boolean
          platform_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_codes_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          access_code: string
          created_at: string
          full_name: string
          grade_level: string
          id: string
          phone: string
          platform_id: string
        }
        Insert: {
          access_code: string
          created_at?: string
          full_name: string
          grade_level: string
          id?: string
          phone: string
          platform_id: string
        }
        Update: {
          access_code?: string
          created_at?: string
          full_name?: string
          grade_level?: string
          id?: string
          phone?: string
          platform_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
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
