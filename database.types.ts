export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
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
  public: {
    Tables: {
      boards: {
        Row: {
          id: string;
          name: string | null;
          value: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          value?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          value?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          content: string | null;
          created_at: string;
          id: string;
          parent_comment_id: string | null;
          post_id: string;
          user_id: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: string;
          parent_comment_id?: string | null;
          post_id?: string;
          user_id: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: string;
          parent_comment_id?: string | null;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts_with_users';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          board: string;
          bug_sources: string[] | null;
          comments_count: number;
          created_at: string;
          description: string | null;
          id: string;
          integrations: string[] | null;
          is_pinned: boolean | null;
          module: string | null;
          status: Database['public']['Enums']['status'];
          title: string | null;
          user_id: string;
          votes_count: number;
        };
        Insert: {
          board: string;
          bug_sources?: string[] | null;
          comments_count?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          integrations?: string[] | null;
          is_pinned?: boolean | null;
          module?: string | null;
          status?: Database['public']['Enums']['status'];
          title?: string | null;
          user_id?: string;
          votes_count?: number;
        };
        Update: {
          board?: string;
          bug_sources?: string[] | null;
          comments_count?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          integrations?: string[] | null;
          is_pinned?: boolean | null;
          module?: string | null;
          status?: Database['public']['Enums']['status'];
          title?: string | null;
          user_id?: string;
          votes_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'post_board_fkey';
            columns: ['board'];
            isOneToOne: false;
            referencedRelation: 'boards';
            referencedColumns: ['id'];
          },
        ];
      };
      votes: {
        Row: {
          created_at: string;
          id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          post_id: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'votes_post_id_fkey1';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'votes_post_id_fkey1';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts_with_users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      comments_with_users: {
        Row: {
          content: string | null;
          created_at: string | null;
          id: string | null;
          parent_comment_id: string | null;
          post_id: string | null;
          user: Json | null;
          user_id: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          id?: string | null;
          parent_comment_id?: string | null;
          post_id?: string | null;
          user?: never;
          user_id?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          id?: string | null;
          parent_comment_id?: string | null;
          post_id?: string | null;
          user?: never;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts_with_users';
            referencedColumns: ['id'];
          },
        ];
      };
      posts_with_users: {
        Row: {
          board: string | null;
          bug_sources: string[] | null;
          comments_count: number | null;
          created_at: string | null;
          description: string | null;
          has_voted: boolean | null;
          id: string | null;
          integrations: string[] | null;
          is_pinned: boolean | null;
          module: string | null;
          status: Database['public']['Enums']['status'] | null;
          title: string | null;
          user: Json | null;
          user_id: string | null;
          votes_count: number | null;
        };
        Insert: {
          board?: string | null;
          bug_sources?: string[] | null;
          comments_count?: number | null;
          created_at?: string | null;
          description?: string | null;
          has_voted?: never;
          id?: string | null;
          integrations?: string[] | null;
          is_pinned?: boolean | null;
          module?: string | null;
          status?: Database['public']['Enums']['status'] | null;
          title?: string | null;
          user?: never;
          user_id?: string | null;
          votes_count?: number | null;
        };
        Update: {
          board?: string | null;
          bug_sources?: string[] | null;
          comments_count?: number | null;
          created_at?: string | null;
          description?: string | null;
          has_voted?: never;
          id?: string | null;
          integrations?: string[] | null;
          is_pinned?: boolean | null;
          module?: string | null;
          status?: Database['public']['Enums']['status'] | null;
          title?: string | null;
          user?: never;
          user_id?: string | null;
          votes_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'post_board_fkey';
            columns: ['board'];
            isOneToOne: false;
            referencedRelation: 'boards';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      get_post_user: { Args: { post_id: string }; Returns: Json };
    };
    Enums: {
      status: 'pending' | 'planned' | 'in_progress' | 'completed' | 'rejected' | 'closed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      status: ['pending', 'planned', 'in_progress', 'completed', 'rejected', 'closed'],
    },
  },
} as const;
