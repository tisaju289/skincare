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
      brands: {
        Row: {
          created_at: string
          id: string
          logo: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          image: string | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          image?: string | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          orders_count: number
          phone: string | null
          tier: Database["public"]["Enums"]["customer_tier"]
          total_spent: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          orders_count?: number
          phone?: string | null
          tier?: Database["public"]["Enums"]["customer_tier"]
          total_spent?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          orders_count?: number
          phone?: string | null
          tier?: Database["public"]["Enums"]["customer_tier"]
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          discount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          shipping: number
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          discount?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          shipping?: number
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          shipping?: number
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          image: string | null
          name: string
          price: number | null
          product_id: string
          sku: string | null
          sort_order: number
          stock: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          price?: number | null
          product_id: string
          sku?: string | null
          sort_order?: number
          stock?: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          price?: number | null
          product_id?: string
          sku?: string | null
          sort_order?: number
          stock?: number
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category_id: string | null
          color: string | null
          created_at: string
          description: string | null
          id: string
          image: string | null
          is_best_seller: boolean
          is_flash_sale: boolean
          is_new_arrival: boolean
          is_trending: boolean
          long_description: string | null
          name: string
          old_price: number | null
          price: number
          rating: number
          reviews_count: number
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock: number
          tag: string | null
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          is_best_seller?: boolean
          is_flash_sale?: boolean
          is_new_arrival?: boolean
          is_trending?: boolean
          long_description?: string | null
          name: string
          old_price?: number | null
          price?: number
          rating?: number
          reviews_count?: number
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          tag?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          is_best_seller?: boolean
          is_flash_sale?: boolean
          is_new_arrival?: boolean
          is_trending?: boolean
          long_description?: string | null
          name?: string
          old_price?: number | null
          price?: number
          rating?: number
          reviews_count?: number
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          tag?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          starts_at: string | null
          status: Database["public"]["Enums"]["promo_status"]
          type: Database["public"]["Enums"]["promo_type"]
          updated_at: string
          usage_count: number
          usage_limit: number | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["promo_status"]
          type?: Database["public"]["Enums"]["promo_type"]
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          value?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["promo_status"]
          type?: Database["public"]["Enums"]["promo_type"]
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          value?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
          user_name: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_name: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          announcement_bg: string
          announcement_enabled: boolean
          announcement_link: string | null
          announcement_text: string | null
          announcement_text_color: string
          business_address: string | null
          created_at: string
          currency: string
          delivery_partner: string | null
          facebook_url: string | null
          favicon_url: string | null
          footer_about: string | null
          footer_columns: Json | null
          footer_copyright: string | null
          free_shipping_threshold: number
          header_menus: Json
          hero_slides: Json
          home_sections: Json
          id: string
          instagram_url: string | null
          logo_url: string | null
          low_stock_threshold: number
          newsletter_button: string | null
          newsletter_enabled: boolean
          newsletter_subtitle: string | null
          newsletter_title: string | null
          notify_low_stock_email: boolean
          notify_order_email: boolean
          notify_order_sms: boolean
          og_image_url: string | null
          pay_bkash: boolean
          pay_card: boolean
          pay_cod: boolean
          pay_nagad: boolean
          phone: string | null
          product_badges: Json
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          shipping_flat_rate: number
          shipping_inside_dhaka: number
          shipping_outside_dhaka: number
          store_name: string
          support_email: string | null
          theme_green: string
          theme_magenta: string
          theme_pink: string
          theme_purple: string
          theme_teal: string
          timezone: string
          updated_at: string
          whatsapp_enabled: boolean
          whatsapp_label: string | null
          whatsapp_message: string | null
          whatsapp_number: string | null
          youtube_url: string | null
        }
        Insert: {
          announcement_bg?: string
          announcement_enabled?: boolean
          announcement_link?: string | null
          announcement_text?: string | null
          announcement_text_color?: string
          business_address?: string | null
          created_at?: string
          currency?: string
          delivery_partner?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          footer_about?: string | null
          footer_columns?: Json | null
          footer_copyright?: string | null
          free_shipping_threshold?: number
          header_menus?: Json
          hero_slides?: Json
          home_sections?: Json
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          low_stock_threshold?: number
          newsletter_button?: string | null
          newsletter_enabled?: boolean
          newsletter_subtitle?: string | null
          newsletter_title?: string | null
          notify_low_stock_email?: boolean
          notify_order_email?: boolean
          notify_order_sms?: boolean
          og_image_url?: string | null
          pay_bkash?: boolean
          pay_card?: boolean
          pay_cod?: boolean
          pay_nagad?: boolean
          phone?: string | null
          product_badges?: Json
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          shipping_flat_rate?: number
          shipping_inside_dhaka?: number
          shipping_outside_dhaka?: number
          store_name?: string
          support_email?: string | null
          theme_green?: string
          theme_magenta?: string
          theme_pink?: string
          theme_purple?: string
          theme_teal?: string
          timezone?: string
          updated_at?: string
          whatsapp_enabled?: boolean
          whatsapp_label?: string | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Update: {
          announcement_bg?: string
          announcement_enabled?: boolean
          announcement_link?: string | null
          announcement_text?: string | null
          announcement_text_color?: string
          business_address?: string | null
          created_at?: string
          currency?: string
          delivery_partner?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          footer_about?: string | null
          footer_columns?: Json | null
          footer_copyright?: string | null
          free_shipping_threshold?: number
          header_menus?: Json
          hero_slides?: Json
          home_sections?: Json
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          low_stock_threshold?: number
          newsletter_button?: string | null
          newsletter_enabled?: boolean
          newsletter_subtitle?: string | null
          newsletter_title?: string | null
          notify_low_stock_email?: boolean
          notify_order_email?: boolean
          notify_order_sms?: boolean
          og_image_url?: string | null
          pay_bkash?: boolean
          pay_card?: boolean
          pay_cod?: boolean
          pay_nagad?: boolean
          phone?: string | null
          product_badges?: Json
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          shipping_flat_rate?: number
          shipping_inside_dhaka?: number
          shipping_outside_dhaka?: number
          store_name?: string
          support_email?: string | null
          theme_green?: string
          theme_magenta?: string
          theme_pink?: string
          theme_purple?: string
          theme_teal?: string
          timezone?: string
          updated_at?: string
          whatsapp_enabled?: boolean
          whatsapp_label?: string | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      place_order: {
        Args: {
          p_address: string
          p_delivery_zone?: string
          p_email: string
          p_items: Json
          p_name: string
          p_notes?: string
          p_payment_method?: Database["public"]["Enums"]["payment_method"]
          p_phone: string
          p_promo_code?: string
        }
        Returns: string
      }
      submit_review: {
        Args: {
          p_comment: string
          p_product_slug: string
          p_rating: number
          p_user_name: string
        }
        Returns: undefined
      }
      subscribe_newsletter: { Args: { p_email: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      customer_tier: "vip" | "regular" | "new"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_method: "bkash" | "nagad" | "card" | "cod"
      product_status: "active" | "draft" | "out_of_stock" | "low_stock"
      promo_status: "active" | "scheduled" | "expired" | "disabled"
      promo_type: "percentage" | "fixed" | "shipping"
      review_status: "pending" | "approved" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
      customer_tier: ["vip", "regular", "new"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_method: ["bkash", "nagad", "card", "cod"],
      product_status: ["active", "draft", "out_of_stock", "low_stock"],
      promo_status: ["active", "scheduled", "expired", "disabled"],
      promo_type: ["percentage", "fixed", "shipping"],
      review_status: ["pending", "approved", "rejected"],
    },
  },
} as const
