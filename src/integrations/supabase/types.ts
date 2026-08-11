export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      class_fee_settings: {
        Row: {
          class: Database["public"]["Enums"]["school_class"];
          monthly_fee: number;
          registration_fee: number;
          total_fee: number;
          updated_at: string;
        };
        Insert: {
          class: Database["public"]["Enums"]["school_class"];
          monthly_fee: number;
          registration_fee: number;
          total_fee: number;
          updated_at?: string;
        };
        Update: {
          class?: Database["public"]["Enums"]["school_class"];
          monthly_fee?: number;
          registration_fee?: number;
          total_fee?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery: {
        Row: {
          caption: string;
          created_at: string;
          id: string;
          image_url: string;
          storage_path: string | null;
        };
        Insert: {
          caption: string;
          created_at?: string;
          id?: string;
          image_url: string;
          storage_path?: string | null;
        };
        Update: {
          caption?: string;
          created_at?: string;
          id?: string;
          image_url?: string;
          storage_path?: string | null;
        };
        Relationships: [];
      };
      homework: {
        Row: {
          class: Database["public"]["Enums"]["school_class"];
          created_at: string;
          id: string;
          publish_date: string;
          text: string;
        };
        Insert: {
          class: Database["public"]["Enums"]["school_class"];
          created_at?: string;
          id?: string;
          publish_date?: string;
          text: string;
        };
        Update: {
          class?: Database["public"]["Enums"]["school_class"];
          created_at?: string;
          id?: string;
          publish_date?: string;
          text?: string;
        };
        Relationships: [];
      };
      lecture_links: {
        Row: {
          class: Database["public"]["Enums"]["lecture_class"];
          updated_at: string;
          url: string;
        };
        Insert: {
          class: Database["public"]["Enums"]["lecture_class"];
          updated_at?: string;
          url: string;
        };
        Update: {
          class?: Database["public"]["Enums"]["lecture_class"];
          updated_at?: string;
          url?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          about_text: string | null;
          address: string;
          created_at: string;
          id: string;
          logo_url: string | null;
          map_embed: string;
          map_link: string;
          phone: string;
          school_name: string;
          tagline: string;
          timings: string;
          updated_at: string;
          whatsapp: string;
        };
        Insert: {
          about_text?: string | null;
          address?: string;
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          map_embed?: string;
          map_link?: string;
          phone?: string;
          school_name?: string;
          tagline?: string;
          timings?: string;
          updated_at?: string;
          whatsapp?: string;
        };
        Update: {
          about_text?: string | null;
          address?: string;
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          map_embed?: string;
          map_link?: string;
          phone?: string;
          school_name?: string;
          tagline?: string;
          timings?: string;
          updated_at?: string;
          whatsapp?: string;
        };
        Relationships: [];
      };
      student_fee_payments: {
        Row: {
          apr_paid: boolean;
          aug_paid: boolean;
          dec_paid: boolean;
          feb_paid: boolean;
          fee_year: number;
          jan_paid: boolean;
          jul_paid: boolean;
          jun_paid: boolean;
          mar_paid: boolean;
          may_paid: boolean;
          nov_paid: boolean;
          oct_paid: boolean;
          registration_paid: boolean;
          sep_paid: boolean;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          apr_paid?: boolean;
          aug_paid?: boolean;
          dec_paid?: boolean;
          feb_paid?: boolean;
          fee_year?: number;
          jan_paid?: boolean;
          jul_paid?: boolean;
          jun_paid?: boolean;
          mar_paid?: boolean;
          may_paid?: boolean;
          nov_paid?: boolean;
          oct_paid?: boolean;
          registration_paid?: boolean;
          sep_paid?: boolean;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          apr_paid?: boolean;
          aug_paid?: boolean;
          dec_paid?: boolean;
          feb_paid?: boolean;
          fee_year?: number;
          jan_paid?: boolean;
          jul_paid?: boolean;
          jun_paid?: boolean;
          mar_paid?: boolean;
          may_paid?: boolean;
          nov_paid?: boolean;
          oct_paid?: boolean;
          registration_paid?: boolean;
          sep_paid?: boolean;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_fee_payments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: true;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          class: Database["public"]["Enums"]["school_class"];
          created_at: string;
          fee_months: boolean[];
          fee_year: number;
          id: string;
          name: string;
          phone: string;
          user_id: string | null;
        };
        Insert: {
          class: Database["public"]["Enums"]["school_class"];
          created_at?: string;
          fee_months?: boolean[];
          fee_year?: number;
          id?: string;
          name: string;
          phone: string;
          user_id?: string | null;
        };
        Update: {
          class?: Database["public"]["Enums"]["school_class"];
          created_at?: string;
          fee_months?: boolean[];
          fee_year?: number;
          id?: string;
          name?: string;
          phone?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      todays_learning: {
        Row: {
          class: Database["public"]["Enums"]["school_class"];
          created_at: string;
          id: string;
          publish_date: string;
          text: string;
        };
        Insert: {
          class: Database["public"]["Enums"]["school_class"];
          created_at?: string;
          id?: string;
          publish_date?: string;
          text: string;
        };
        Update: {
          class?: Database["public"]["Enums"]["school_class"];
          created_at?: string;
          id?: string;
          publish_date?: string;
          text?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_fee_year: { Args: never; Returns: number };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      my_class: {
        Args: never;
        Returns: Database["public"]["Enums"]["school_class"];
      };
      my_lecture_class: {
        Args: never;
        Returns: Database["public"]["Enums"]["lecture_class"];
      };
      sync_fee_year: { Args: never; Returns: undefined };
      sync_student_fee_year: { Args: never; Returns: undefined };
    };
    Enums: {
      app_role: "admin" | "parent";
      lecture_class:
        | "Nursery"
        | "LKG"
        | "UKG"
        | "Class 1"
        | "Class 2"
        | "Class 3"
        | "Class 4"
        | "Class 5"
        | "Class 6"
        | "Class 7"
        | "Class 8"
        | "Class 9"
        | "Class 10"
        | "Class 11"
        | "Class 12";
      school_class: "Play Group" | "NUR" | "LKG" | "UKG";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "parent"],
      lecture_class: [
        "Nursery",
        "LKG",
        "UKG",
        "Class 1",
        "Class 2",
        "Class 3",
        "Class 4",
        "Class 5",
        "Class 6",
        "Class 7",
        "Class 8",
        "Class 9",
        "Class 10",
        "Class 11",
        "Class 12",
      ],
      school_class: ["Play Group", "NUR", "LKG", "UKG"],
    },
  },
} as const;
