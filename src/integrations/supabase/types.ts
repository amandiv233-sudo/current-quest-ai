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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_chat_sessions: {
        Row: {
          created_at: string
          id: string
          messages: Json
          session_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          session_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          session_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      current_affairs: {
        Row: {
          category: string
          content: string | null
          created_at: string
          exam_relevance: string[] | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          priority: string | null
          published_at: string
          source: string
          source_url: string | null
          subcategory: string | null
          summary: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          exam_relevance?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          priority?: string | null
          published_at: string
          source: string
          source_url?: string | null
          subcategory?: string | null
          summary: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          exam_relevance?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          priority?: string | null
          published_at?: string
          source?: string
          source_url?: string | null
          subcategory?: string | null
          summary?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      manual_mcqs: {
        Row: {
          category: string
          correct_answer: string
          created_at: string
          created_by: string | null
          difficulty: string | null
          exam_year: number | null
          explanation: string
          id: string
          is_active: boolean | null
          mcq_date: string | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          question_type: string | null
          subcategory: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category: string
          correct_answer: string
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          exam_year?: number | null
          explanation: string
          id?: string
          is_active?: boolean | null
          mcq_date?: string | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          question_type?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string
          correct_answer?: string
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          exam_year?: number | null
          explanation?: string
          id?: string
          is_active?: boolean | null
          mcq_date?: string | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          question_type?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      mock_tests: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          difficulty: string | null
          id: string
          is_public: boolean | null
          questions: Json
          time_limit: number | null
          title: string
          total_questions: number
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean | null
          questions: Json
          time_limit?: number | null
          title: string
          total_questions: number
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean | null
          questions?: Json
          time_limit?: number | null
          title?: string
          total_questions?: number
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          article_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "current_affairs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_test_attempts: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          score: number
          test_id: string | null
          time_taken: number | null
          total_questions: number
          user_id: string | null
        }
        Insert: {
          answers: Json
          completed_at?: string
          id?: string
          score: number
          test_id?: string | null
          time_taken?: number | null
          total_questions: number
          user_id?: string | null
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          score?: number
          test_id?: string | null
          time_taken?: number | null
          total_questions?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "mock_tests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_view_count: {
        Args: { article_id: string }
        Returns: undefined
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
