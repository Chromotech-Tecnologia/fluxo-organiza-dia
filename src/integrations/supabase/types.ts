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
      daily_reports: {
        Row: {
          completed_tasks: number | null
          completion_rate: number | null
          created_at: string
          date: string
          forwarded_tasks: number | null
          id: string
          observations: string | null
          pending_tasks: number | null
          total_tasks: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_tasks?: number | null
          completion_rate?: number | null
          created_at?: string
          date: string
          forwarded_tasks?: number | null
          id?: string
          observations?: string | null
          pending_tasks?: number | null
          total_tasks?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_tasks?: number | null
          completion_rate?: number | null
          created_at?: string
          date?: string
          forwarded_tasks?: number | null
          id?: string
          observations?: string | null
          pending_tasks?: number | null
          total_tasks?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          active: boolean
          created_at: string
          department: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          updated_at: string | null
          welcome_shown: boolean | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
          welcome_shown?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          welcome_shown?: boolean | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          level: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          level?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          level?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_shares: {
        Row: {
          created_at: string
          id: string
          owner_user_id: string
          shared_with_user_id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_user_id: string
          shared_with_user_id: string
          task_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_user_id?: string
          shared_with_user_id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_shares_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_person_id: string | null
          assigned_team_member_id: string | null
          category: string | null
          completion_history: Json | null
          concluded_at: string | null
          created_at: string
          custom_time_minutes: number | null
          delegated_by_user_id: string | null
          delivery_dates: string[] | null
          description: string | null
          forward_count: number | null
          forward_history: Json | null
          id: string
          is_concluded: boolean | null
          is_external_delegation: boolean | null
          is_forwarded: boolean | null
          is_routine: boolean | null
          observations: string | null
          order_index: number | null
          priority: string
          routine_config: Json | null
          scheduled_date: string
          status: string
          sub_items: Json | null
          task_order: number | null
          time_investment: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_person_id?: string | null
          assigned_team_member_id?: string | null
          category?: string | null
          completion_history?: Json | null
          concluded_at?: string | null
          created_at?: string
          custom_time_minutes?: number | null
          delegated_by_user_id?: string | null
          delivery_dates?: string[] | null
          description?: string | null
          forward_count?: number | null
          forward_history?: Json | null
          id?: string
          is_concluded?: boolean | null
          is_external_delegation?: boolean | null
          is_forwarded?: boolean | null
          is_routine?: boolean | null
          observations?: string | null
          order_index?: number | null
          priority?: string
          routine_config?: Json | null
          scheduled_date: string
          status?: string
          sub_items?: Json | null
          task_order?: number | null
          time_investment?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_person_id?: string | null
          assigned_team_member_id?: string | null
          category?: string | null
          completion_history?: Json | null
          concluded_at?: string | null
          created_at?: string
          custom_time_minutes?: number | null
          delegated_by_user_id?: string | null
          delivery_dates?: string[] | null
          description?: string | null
          forward_count?: number | null
          forward_history?: Json | null
          id?: string
          is_concluded?: boolean | null
          is_external_delegation?: boolean | null
          is_forwarded?: boolean | null
          is_routine?: boolean | null
          observations?: string | null
          order_index?: number | null
          priority?: string
          routine_config?: Json | null
          scheduled_date?: string
          status?: string
          sub_items?: Json | null
          task_order?: number | null
          time_investment?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_team_member_id_fkey"
            columns: ["assigned_team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_collaborations: {
        Row: {
          collaborator_user_id: string
          created_at: string
          id: string
          is_active: boolean
          owner_user_id: string
          team_member_id: string
          updated_at: string
        }
        Insert: {
          collaborator_user_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          owner_user_id: string
          team_member_id: string
          updated_at?: string
        }
        Update: {
          collaborator_user_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          owner_user_id?: string
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_collaborations_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string
          id: string
          invitation_token: string
          invited_at: string
          recipient_email: string
          recipient_user_id: string | null
          sender_user_id: string
          status: Database["public"]["Enums"]["invitation_status"]
          team_member_id: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_at?: string
          recipient_email: string
          recipient_user_id?: string | null
          sender_user_id: string
          status?: Database["public"]["Enums"]["invitation_status"]
          team_member_id?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_at?: string
          recipient_email?: string
          recipient_user_id?: string | null
          sender_user_id?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          team_member_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          collaborator_user_id: string | null
          created_at: string
          department: string | null
          email: string | null
          hire_date: string | null
          id: string
          is_external_collaborator: boolean | null
          name: string
          notes: string | null
          phone: string | null
          project_ids: string[] | null
          projects: Json | null
          role: string | null
          skill_ids: string[] | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          collaborator_user_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          is_external_collaborator?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          project_ids?: string[] | null
          projects?: Json | null
          role?: string | null
          skill_ids?: string[] | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          collaborator_user_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          is_external_collaborator?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          project_ids?: string[] | null
          projects?: Json | null
          role?: string | null
          skill_ids?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_permanent: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          trial_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_permanent?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          trial_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_permanent?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          trial_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_collaboration_account_status: { Args: never; Returns: undefined }
      debug_auth_context: {
        Args: never
        Returns: {
          current_user_id: string
          has_admin_role: boolean
          is_admin_result: boolean
          user_role: string
        }[]
      }
      get_trial_days_remaining: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_user_in_trial: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      invitation_status: "pending" | "accepted" | "rejected" | "expired"
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
    Enums: {
      app_role: ["admin", "user"],
      invitation_status: ["pending", "accepted", "rejected", "expired"],
    },
  },
} as const
