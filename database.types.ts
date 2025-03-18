export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
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
          post_id: string;
          user_id: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: string;
          post_id?: string;
          user_id: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: string;
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
          votes: string[];
          votes_count: number | null;
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
          user_id: string;
          votes?: string[];
          votes_count?: number | null;
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
          votes?: string[];
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
      votes: {
        Row: {
          created_at: string;
          id: string;
          post_id: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          post_id?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          post_id?: string;
          user_id?: string | null;
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
      posts_with_users: {
        Row: {
          board: string | null;
          bug_sources: string[] | null;
          comments_count: number | null;
          created_at: string | null;
          description: string | null;
          id: string | null;
          integrations: string[] | null;
          is_pinned: boolean | null;
          module: string | null;
          status: Database['public']['Enums']['status'] | null;
          title: string | null;
          user: Json | null;
          user_id: string | null;
          votes: string[] | null;
          votes_count: number | null;
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
      get_post_user: {
        Args: {
          post_id: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      status: 'pending' | 'planned' | 'in_progress' | 'completed' | 'rejected' | 'closed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views']) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes'] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
