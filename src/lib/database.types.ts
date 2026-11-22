export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      advance_installments: {
        Row: {
          advance_id: string;
          amount: number;
          due_month: string;
          employee_id: string;
          id: string;
          run_id: string | null;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          advance_id: string;
          amount: number;
          due_month: string;
          employee_id: string;
          id?: string;
          run_id?: string | null;
          status?: string;
        };
        Update: {
          advance_id?: string;
          amount?: number;
          due_month?: string;
          employee_id?: string;
          id?: string;
          run_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "advance_installments_advance_id_fkey";
            columns: ["advance_id"];
            isOneToOne: false;
            referencedRelation: "employee_advances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "advance_installments_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "advance_installments_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "payroll_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      assistant_messages: {
        Row: {
          blocks: NonNullable<Json>;
          content: string;
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["assistant_role"];
          seq: number;
          thread_id: string;
        };
        ComputedFields: never;
        Insert: {
          blocks?: NonNullable<Json>;
          content: string;
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["assistant_role"];
          seq?: never;
          thread_id: string;
        };
        Update: {
          blocks?: NonNullable<Json>;
          content?: string;
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["assistant_role"];
          seq?: never;
          thread_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assistant_messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "assistant_threads";
            referencedColumns: ["id"];
          },
        ];
      };
      assistant_threads: {
        Row: {
          branch_id: string;
          created_at: string;
          employee_id: string;
          id: string;
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          created_at?: string;
          employee_id: string;
          id?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          created_at?: string;
          employee_id?: string;
          id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assistant_threads_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assistant_threads_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assistant_threads_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assistant_threads_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assistant_threads_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance_events: {
        Row: {
          at: string;
          auto_closed: boolean;
          branch_id: string;
          business_id: string;
          created_at: string;
          created_by: string | null;
          employee_id: string;
          id: string;
          kind: Database["public"]["Enums"]["attendance_kind"];
          note: string | null;
          source: Database["public"]["Enums"]["attendance_source"];
        };
        ComputedFields: never;
        Insert: {
          at?: string;
          auto_closed?: boolean;
          branch_id: string;
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          employee_id: string;
          id?: string;
          kind: Database["public"]["Enums"]["attendance_kind"];
          note?: string | null;
          source?: Database["public"]["Enums"]["attendance_source"];
        };
        Update: {
          at?: string;
          auto_closed?: boolean;
          branch_id?: string;
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          employee_id?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["attendance_kind"];
          note?: string | null;
          source?: Database["public"]["Enums"]["attendance_source"];
        };
        Relationships: [
          {
            foreignKeyName: "attendance_events_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "attendance_events_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "attendance_events_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "attendance_events_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "attendance_events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_events_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      automation_runs: {
        Row: {
          automation_key: string;
          business_id: string;
          created_at: string;
          customer_id: string;
          dedupe_key: string;
          id: string;
          notification_id: string | null;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          automation_key: string;
          business_id: string;
          created_at?: string;
          customer_id: string;
          dedupe_key: string;
          id?: string;
          notification_id?: string | null;
          status: string;
        };
        Update: {
          automation_key?: string;
          business_id?: string;
          created_at?: string;
          customer_id?: string;
          dedupe_key?: string;
          id?: string;
          notification_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "automation_runs_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "automation_runs_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "automation_runs_notification_id_fkey";
            columns: ["notification_id"];
            isOneToOne: false;
            referencedRelation: "notifications";
            referencedColumns: ["id"];
          },
        ];
      };
      automations: {
        Row: {
          body_ar: string;
          body_en: string;
          business_id: string;
          channel: string;
          delay_hours: number;
          enabled: boolean;
          key: string;
          title_ar: string;
          title_en: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          body_ar: string;
          body_en: string;
          business_id: string;
          channel?: string;
          delay_hours?: number;
          enabled?: boolean;
          key: string;
          title_ar: string;
          title_en: string;
          updated_at?: string;
        };
        Update: {
          body_ar?: string;
          body_en?: string;
          business_id?: string;
          channel?: string;
          delay_hours?: number;
          enabled?: boolean;
          key?: string;
          title_ar?: string;
          title_en?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "automations_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_items: {
        Row: {
          blocked_until: string;
          booking_id: string;
          branch_id: string;
          business_id: string;
          created_at: string;
          employee_id: string | null;
          employee_name: string | null;
          ends_at: string;
          id: string;
          price: number;
          service_id: string;
          service_name: string;
          starts_at: string;
          status: Database["public"]["Enums"]["booking_status"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          blocked_until: string;
          booking_id: string;
          branch_id: string;
          business_id: string;
          created_at?: string;
          employee_id?: string | null;
          employee_name?: string | null;
          ends_at: string;
          id?: string;
          price: number;
          service_id: string;
          service_name: string;
          starts_at: string;
          status: Database["public"]["Enums"]["booking_status"];
          updated_at?: string;
        };
        Update: {
          blocked_until?: string;
          booking_id?: string;
          branch_id?: string;
          business_id?: string;
          created_at?: string;
          employee_id?: string | null;
          employee_name?: string | null;
          ends_at?: string;
          id?: string;
          price?: number;
          service_id?: string;
          service_name?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_branch_id_fkey";
            columns: ["booking_id", "branch_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "branch_id"];
          },
          {
            foreignKeyName: "booking_items_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "booking_items_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "booking_items_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "booking_items_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "booking_items_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "booking_items_service_id_business_id_fkey";
            columns: ["service_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      booking_messages: {
        Row: {
          body: string;
          booking_id: string;
          created_at: string;
          id: string;
          read_at: string | null;
          sender: Database["public"]["Enums"]["message_sender"];
          sender_customer_id: string | null;
          sender_employee_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          body: string;
          booking_id: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          sender: Database["public"]["Enums"]["message_sender"];
          sender_customer_id?: string | null;
          sender_employee_id?: string | null;
        };
        Update: {
          body?: string;
          booking_id?: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          sender?: Database["public"]["Enums"]["message_sender"];
          sender_customer_id?: string | null;
          sender_employee_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "booking_messages_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_messages_sender_customer_id_fkey";
            columns: ["sender_customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_messages_sender_employee_id_fkey";
            columns: ["sender_employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          branch_id: string;
          business_id: string;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          created_at: string;
          created_by_employee_id: string | null;
          currency: string;
          customer_id: string;
          customer_note: string | null;
          ends_at: string;
          id: string;
          reminder_sent_at: string | null;
          source: Database["public"]["Enums"]["booking_source"];
          starts_at: string;
          status: Database["public"]["Enums"]["booking_status"];
          total_price: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          business_id: string;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          created_by_employee_id?: string | null;
          currency: string;
          customer_id: string;
          customer_note?: string | null;
          ends_at: string;
          id?: string;
          reminder_sent_at?: string | null;
          source?: Database["public"]["Enums"]["booking_source"];
          starts_at: string;
          status?: Database["public"]["Enums"]["booking_status"];
          total_price: number;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          business_id?: string;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          created_by_employee_id?: string | null;
          currency?: string;
          customer_id?: string;
          customer_note?: string | null;
          ends_at?: string;
          id?: string;
          reminder_sent_at?: string | null;
          source?: Database["public"]["Enums"]["booking_source"];
          starts_at?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          total_price?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "bookings_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "bookings_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "bookings_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "bookings_created_by_employee_id_fkey";
            columns: ["created_by_employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      branch_hours: {
        Row: {
          branch_id: string;
          closes_at: string;
          created_at: string;
          day_of_week: number;
          id: string;
          opens_at: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          closes_at: string;
          created_at?: string;
          day_of_week: number;
          id?: string;
          opens_at: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          closes_at?: string;
          created_at?: string;
          day_of_week?: number;
          id?: string;
          opens_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "branch_hours_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "branch_hours_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "branch_hours_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "branch_hours_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
        ];
      };
      branch_photos: {
        Row: {
          branch_id: string;
          caption: string | null;
          created_at: string;
          id: string;
          image_path: string;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          caption?: string | null;
          created_at?: string;
          id?: string;
          image_path: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          caption?: string | null;
          created_at?: string;
          id?: string;
          image_path?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "branch_photos_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "branch_photos_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "branch_photos_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "branch_photos_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
        ];
      };
      branch_services: {
        Row: {
          branch_id: string;
          business_id: string;
          created_at: string;
          is_active: boolean;
          price: number | null;
          service_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          business_id: string;
          created_at?: string;
          is_active?: boolean;
          price?: number | null;
          service_id: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          business_id?: string;
          created_at?: string;
          is_active?: boolean;
          price?: number | null;
          service_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "branch_services_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "branch_services_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "branch_services_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "branch_services_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "branch_services_service_id_business_id_fkey";
            columns: ["service_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      branch_special_days: {
        Row: {
          branch_id: string;
          closes_at: string | null;
          created_at: string;
          date: string;
          id: string;
          is_closed: boolean;
          opens_at: string | null;
          reason: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          closes_at?: string | null;
          created_at?: string;
          date: string;
          id?: string;
          is_closed?: boolean;
          opens_at?: string | null;
          reason?: string | null;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          closes_at?: string | null;
          created_at?: string;
          date?: string;
          id?: string;
          is_closed?: boolean;
          opens_at?: string | null;
          reason?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "branch_special_days_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "branch_special_days_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "branch_special_days_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "branch_special_days_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
        ];
      };
      branch_stock: {
        Row: {
          branch_id: string;
          business_id: string;
          cost_per_unit: number | null;
          created_at: string;
          id: string;
          product_id: string;
          qty_on_hand: number;
          reorder_threshold: number;
          sku: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          business_id: string;
          cost_per_unit?: number | null;
          created_at?: string;
          id?: string;
          product_id: string;
          qty_on_hand?: number;
          reorder_threshold?: number;
          sku?: string | null;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          business_id?: string;
          cost_per_unit?: number | null;
          created_at?: string;
          id?: string;
          product_id?: string;
          qty_on_hand?: number;
          reorder_threshold?: number;
          sku?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "branch_stock_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "branch_stock_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "branch_stock_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "branch_stock_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "branch_stock_product_id_business_id_fkey";
            columns: ["product_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      branches: {
        Row: {
          address: string | null;
          amenities: Database["public"]["Enums"]["amenity"][];
          business_id: string;
          city: string | null;
          country_code: string;
          created_at: string;
          description: string | null;
          id: string;
          latitude: number | null;
          location: unknown;
          longitude: number | null;
          name: string;
          phone: string | null;
          rating_avg: number;
          rating_count: number;
          share_slug: string | null;
          status: Database["public"]["Enums"]["branch_status"];
          timezone: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          address?: string | null;
          amenities?: Database["public"]["Enums"]["amenity"][];
          business_id: string;
          city?: string | null;
          country_code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          latitude?: number | null;
          location?: never;
          longitude?: number | null;
          name: string;
          phone?: string | null;
          rating_avg?: number;
          rating_count?: number;
          share_slug?: string | null;
          status?: Database["public"]["Enums"]["branch_status"];
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          amenities?: Database["public"]["Enums"]["amenity"][];
          business_id?: string;
          city?: string | null;
          country_code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          latitude?: number | null;
          location?: never;
          longitude?: number | null;
          name?: string;
          phone?: string | null;
          rating_avg?: number;
          rating_count?: number;
          share_slug?: string | null;
          status?: Database["public"]["Enums"]["branch_status"];
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "branches_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      broadcasts: {
        Row: {
          audience_count: number;
          body: string;
          business_id: string;
          channel: string;
          created_at: string;
          created_by: string | null;
          error: string | null;
          id: string;
          scheduled_at: string | null;
          segment_id: string | null;
          segment_name: string;
          sent_at: string | null;
          status: string;
          template_id: string | null;
          title: string;
        };
        ComputedFields: never;
        Insert: {
          audience_count: number;
          body: string;
          business_id: string;
          channel?: string;
          created_at?: string;
          created_by?: string | null;
          error?: string | null;
          id?: string;
          scheduled_at?: string | null;
          segment_id?: string | null;
          segment_name: string;
          sent_at?: string | null;
          status?: string;
          template_id?: string | null;
          title: string;
        };
        Update: {
          audience_count?: number;
          body?: string;
          business_id?: string;
          channel?: string;
          created_at?: string;
          created_by?: string | null;
          error?: string | null;
          id?: string;
          scheduled_at?: string | null;
          segment_id?: string | null;
          segment_name?: string;
          sent_at?: string | null;
          status?: string;
          template_id?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "broadcasts_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "broadcasts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "broadcasts_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "segments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "broadcasts_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "message_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      business_categories: {
        Row: {
          business_id: string;
          category_id: string;
          created_at: string;
          is_primary: boolean;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          category_id: string;
          created_at?: string;
          is_primary?: boolean;
        };
        Update: {
          business_id?: string;
          category_id?: string;
          created_at?: string;
          is_primary?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "business_categories_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "business_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      business_clients: {
        Row: {
          acquired_at: string;
          alert: string | null;
          anonymised_at: string | null;
          business_id: string;
          created_at: string;
          custom: NonNullable<Json>;
          customer_id: string;
          first_source: string;
          language: string | null;
          preferred_employee_id: string | null;
          preferred_staff_gender: string | null;
          tags: string[];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          acquired_at?: string;
          alert?: string | null;
          anonymised_at?: string | null;
          business_id: string;
          created_at?: string;
          custom?: NonNullable<Json>;
          customer_id: string;
          first_source: string;
          language?: string | null;
          preferred_employee_id?: string | null;
          preferred_staff_gender?: string | null;
          tags?: string[];
          updated_at?: string;
        };
        Update: {
          acquired_at?: string;
          alert?: string | null;
          anonymised_at?: string | null;
          business_id?: string;
          created_at?: string;
          custom?: NonNullable<Json>;
          customer_id?: string;
          first_source?: string;
          language?: string | null;
          preferred_employee_id?: string | null;
          preferred_staff_gender?: string | null;
          tags?: string[];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_clients_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "business_clients_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "business_clients_preferred_employee_id_fkey";
            columns: ["preferred_employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      businesses: {
        Row: {
          closed_at: string | null;
          country_code: string;
          created_at: string;
          currency: string;
          description: string | null;
          id: string;
          logo_path: string | null;
          name: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          closed_at?: string | null;
          country_code?: string;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          logo_path?: string | null;
          name: string;
          updated_at?: string;
        };
        Update: {
          closed_at?: string | null;
          country_code?: string;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          logo_path?: string | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      campaign_recipients: {
        Row: {
          broadcast_id: string;
          channel: string;
          created_at: string;
          customer_id: string;
          id: string;
          notification_id: string | null;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          broadcast_id: string;
          channel: string;
          created_at?: string;
          customer_id: string;
          id?: string;
          notification_id?: string | null;
          status: string;
        };
        Update: {
          broadcast_id?: string;
          channel?: string;
          created_at?: string;
          customer_id?: string;
          id?: string;
          notification_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_broadcast_id_fkey";
            columns: ["broadcast_id"];
            isOneToOne: false;
            referencedRelation: "broadcasts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_recipients_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_recipients_notification_id_fkey";
            columns: ["notification_id"];
            isOneToOne: false;
            referencedRelation: "notifications";
            referencedColumns: ["id"];
          },
        ];
      };
      candidates: {
        Row: {
          business_id: string;
          created_at: string;
          email: string | null;
          hired_employee_id: string | null;
          id: string;
          name: string;
          notes: string | null;
          opening_id: string;
          phone: string | null;
          stage: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          email?: string | null;
          hired_employee_id?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          opening_id: string;
          phone?: string | null;
          stage?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          email?: string | null;
          hired_employee_id?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          opening_id?: string;
          phone?: string | null;
          stage?: string;
        };
        Relationships: [
          {
            foreignKeyName: "candidates_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "candidates_hired_employee_id_fkey";
            columns: ["hired_employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "candidates_opening_id_fkey";
            columns: ["opening_id"];
            isOneToOne: false;
            referencedRelation: "job_openings";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          description_i18n: NonNullable<Json>;
          icon_path: string | null;
          id: string;
          is_active: boolean;
          name: string;
          name_i18n: NonNullable<Json>;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string | null;
          description_i18n?: NonNullable<Json>;
          icon_path?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          name_i18n?: NonNullable<Json>;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          description_i18n?: NonNullable<Json>;
          icon_path?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          name_i18n?: NonNullable<Json>;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      client_consents: {
        Row: {
          business_id: string;
          channel: string;
          created_at: string;
          customer_id: string;
          granted: boolean;
          id: string;
          recorded_by: string | null;
          source: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          channel: string;
          created_at?: string;
          customer_id: string;
          granted: boolean;
          id?: string;
          recorded_by?: string | null;
          source: string;
        };
        Update: {
          business_id?: string;
          channel?: string;
          created_at?: string;
          customer_id?: string;
          granted?: boolean;
          id?: string;
          recorded_by?: string | null;
          source?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_consents_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_consents_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_consents_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      client_events: {
        Row: {
          branch_id: string | null;
          business_id: string;
          customer_id: string;
          data: NonNullable<Json>;
          id: string;
          kind: string;
          occurred_at: string;
          ref_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          branch_id?: string | null;
          business_id: string;
          customer_id: string;
          data?: NonNullable<Json>;
          id?: string;
          kind: string;
          occurred_at?: string;
          ref_id?: string | null;
        };
        Update: {
          branch_id?: string | null;
          business_id?: string;
          customer_id?: string;
          data?: NonNullable<Json>;
          id?: string;
          kind?: string;
          occurred_at?: string;
          ref_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_events_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_events_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_events_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_events_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_events_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_events_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      client_field_defs: {
        Row: {
          business_id: string;
          id: string;
          key: string;
          label: string;
          label_ar: string | null;
          options: string[];
          position: number;
          template: string | null;
          type: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          id?: string;
          key: string;
          label: string;
          label_ar?: string | null;
          options?: string[];
          position?: number;
          template?: string | null;
          type: string;
        };
        Update: {
          business_id?: string;
          id?: string;
          key?: string;
          label?: string;
          label_ar?: string | null;
          options?: string[];
          position?: number;
          template?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_field_defs_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      client_ledger: {
        Row: {
          booking_id: string | null;
          branch_id: string | null;
          business_id: string;
          cash_amount: number;
          created_at: string;
          created_by: string | null;
          credit_delta: number;
          customer_id: string;
          id: string;
          kind: string;
          meta: NonNullable<Json>;
          method: string | null;
          note: string | null;
          ref_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          booking_id?: string | null;
          branch_id?: string | null;
          business_id: string;
          cash_amount?: number;
          created_at?: string;
          created_by?: string | null;
          credit_delta?: number;
          customer_id: string;
          id?: string;
          kind: string;
          meta?: NonNullable<Json>;
          method?: string | null;
          note?: string | null;
          ref_id?: string | null;
        };
        Update: {
          booking_id?: string | null;
          branch_id?: string | null;
          business_id?: string;
          cash_amount?: number;
          created_at?: string;
          created_by?: string | null;
          credit_delta?: number;
          customer_id?: string;
          id?: string;
          kind?: string;
          meta?: NonNullable<Json>;
          method?: string | null;
          note?: string | null;
          ref_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_ledger_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_ledger_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_ledger_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_ledger_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_ledger_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_ledger_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_ledger_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_ledger_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      client_notes: {
        Row: {
          author_id: string | null;
          body: string;
          business_id: string;
          created_at: string;
          customer_id: string;
          id: string;
        };
        ComputedFields: never;
        Insert: {
          author_id?: string | null;
          body: string;
          business_id: string;
          created_at?: string;
          customer_id: string;
          id?: string;
        };
        Update: {
          author_id?: string | null;
          body?: string;
          business_id?: string;
          created_at?: string;
          customer_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_notes_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_notes_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_notes_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      client_package_uses: {
        Row: {
          booking_id: string | null;
          client_package_id: string;
          id: string;
          note: string | null;
          used_at: string;
          used_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          booking_id?: string | null;
          client_package_id: string;
          id?: string;
          note?: string | null;
          used_at?: string;
          used_by?: string | null;
        };
        Update: {
          booking_id?: string | null;
          client_package_id?: string;
          id?: string;
          note?: string | null;
          used_at?: string;
          used_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_package_uses_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_package_uses_client_package_id_fkey";
            columns: ["client_package_id"];
            isOneToOne: false;
            referencedRelation: "client_packages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_package_uses_used_by_fkey";
            columns: ["used_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      client_packages: {
        Row: {
          business_id: string;
          created_at: string;
          customer_id: string;
          expires_at: string | null;
          id: string;
          name: string;
          package_id: string | null;
          price_paid: number;
          sessions_remaining: number;
          sessions_total: number;
          sold_by: string | null;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          customer_id: string;
          expires_at?: string | null;
          id?: string;
          name: string;
          package_id?: string | null;
          price_paid: number;
          sessions_remaining: number;
          sessions_total: number;
          sold_by?: string | null;
          status?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          customer_id?: string;
          expires_at?: string | null;
          id?: string;
          name?: string;
          package_id?: string | null;
          price_paid?: number;
          sessions_remaining?: number;
          sessions_total?: number;
          sold_by?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_packages_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_packages_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_packages_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "packages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_packages_sold_by_fkey";
            columns: ["sold_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      client_referrals: {
        Row: {
          business_id: string;
          created_at: string;
          referred_customer_id: string;
          referrer_customer_id: string;
          rewarded_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          referred_customer_id: string;
          referrer_customer_id: string;
          rewarded_at?: string | null;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          referred_customer_id?: string;
          referrer_customer_id?: string;
          rewarded_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_referrals_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_referrals_referred_customer_id_fkey";
            columns: ["referred_customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_referrals_referrer_customer_id_fkey";
            columns: ["referrer_customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      client_tasks: {
        Row: {
          business_id: string;
          created_at: string;
          created_by: string | null;
          customer_id: string;
          done_at: string | null;
          done_by: string | null;
          due_at: string | null;
          id: string;
          kind: string;
          ref_id: string | null;
          title: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          customer_id: string;
          done_at?: string | null;
          done_by?: string | null;
          due_at?: string | null;
          id?: string;
          kind: string;
          ref_id?: string | null;
          title: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          customer_id?: string;
          done_at?: string | null;
          done_by?: string | null;
          due_at?: string | null;
          id?: string;
          kind?: string;
          ref_id?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_tasks_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_tasks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_tasks_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_tasks_done_by_fkey";
            columns: ["done_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      commission_clawbacks: {
        Row: {
          amount: number;
          employee_id: string;
          item_id: string;
          run_id: string;
        };
        ComputedFields: never;
        Insert: {
          amount: number;
          employee_id: string;
          item_id: string;
          run_id: string;
        };
        Update: {
          amount?: number;
          employee_id?: string;
          item_id?: string;
          run_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "commission_clawbacks_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commission_clawbacks_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "payroll_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      commission_entries: {
        Row: {
          accrued_at: string;
          amount: number;
          booking_id: string | null;
          booking_total: number;
          business_id: string;
          created_at: string;
          currency: string;
          id: string;
          kind: Database["public"]["Enums"]["commission_entry_kind"];
          note: string | null;
          rate: number;
          statement_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          accrued_at?: string;
          amount: number;
          booking_id?: string | null;
          booking_total?: number;
          business_id: string;
          created_at?: string;
          currency: string;
          id?: string;
          kind?: Database["public"]["Enums"]["commission_entry_kind"];
          note?: string | null;
          rate?: number;
          statement_id?: string | null;
        };
        Update: {
          accrued_at?: string;
          amount?: number;
          booking_id?: string | null;
          booking_total?: number;
          business_id?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["commission_entry_kind"];
          note?: string | null;
          rate?: number;
          statement_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "commission_entries_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commission_entries_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commission_entries_statement_id_fkey";
            columns: ["statement_id"];
            isOneToOne: false;
            referencedRelation: "commission_statements";
            referencedColumns: ["id"];
          },
        ];
      };
      commission_rules: {
        Row: {
          business_id: string;
          category_id: string | null;
          created_at: string;
          id: string;
          rate: number;
          service_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          category_id?: string | null;
          created_at?: string;
          id?: string;
          rate: number;
          service_id?: string | null;
        };
        Update: {
          business_id?: string;
          category_id?: string | null;
          created_at?: string;
          id?: string;
          rate?: number;
          service_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "commission_rules_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commission_rules_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      commission_statements: {
        Row: {
          bookings_count: number;
          business_id: string;
          commission_amount: number;
          created_at: string;
          currency: string;
          due_at: string;
          gross_amount: number;
          id: string;
          issued_at: string;
          last_reminded_at: string | null;
          note: string | null;
          paid_at: string | null;
          paid_method: string | null;
          paid_reference: string | null;
          period_end: string;
          period_start: string;
          reminders_sent: number;
          status: Database["public"]["Enums"]["commission_statement_status"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          bookings_count?: number;
          business_id: string;
          commission_amount: number;
          created_at?: string;
          currency: string;
          due_at: string;
          gross_amount?: number;
          id?: string;
          issued_at?: string;
          last_reminded_at?: string | null;
          note?: string | null;
          paid_at?: string | null;
          paid_method?: string | null;
          paid_reference?: string | null;
          period_end: string;
          period_start: string;
          reminders_sent?: number;
          status?: Database["public"]["Enums"]["commission_statement_status"];
          updated_at?: string;
        };
        Update: {
          bookings_count?: number;
          business_id?: string;
          commission_amount?: number;
          created_at?: string;
          currency?: string;
          due_at?: string;
          gross_amount?: number;
          id?: string;
          issued_at?: string;
          last_reminded_at?: string | null;
          note?: string | null;
          paid_at?: string | null;
          paid_method?: string | null;
          paid_reference?: string | null;
          period_end?: string;
          period_start?: string;
          reminders_sent?: number;
          status?: Database["public"]["Enums"]["commission_statement_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "commission_statements_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      commission_tiers: {
        Row: {
          business_id: string;
          id: string;
          min_revenue: number;
          rate: number;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          id?: string;
          min_revenue: number;
          rate: number;
        };
        Update: {
          business_id?: string;
          id?: string;
          min_revenue?: number;
          rate?: number;
        };
        Relationships: [
          {
            foreignKeyName: "commission_tiers_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      company_holidays: {
        Row: {
          branch_id: string | null;
          business_id: string;
          created_at: string;
          date: string;
          id: string;
          name: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id?: string | null;
          business_id: string;
          created_at?: string;
          date: string;
          id?: string;
          name: string;
        };
        Update: {
          branch_id?: string | null;
          business_id?: string;
          created_at?: string;
          date?: string;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_holidays_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_holidays_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_holidays_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_holidays_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_holidays_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      crm_audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          business_id: string;
          created_at: string;
          customer_id: string | null;
          details: NonNullable<Json>;
          id: string;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          actor_id?: string | null;
          business_id: string;
          created_at?: string;
          customer_id?: string | null;
          details?: NonNullable<Json>;
          id?: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          business_id?: string;
          created_at?: string;
          customer_id?: string | null;
          details?: NonNullable<Json>;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crm_audit_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_audit_log_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      crm_category_intervals: {
        Row: {
          business_id: string;
          category_id: string;
          interval_days: number;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          category_id: string;
          interval_days: number;
        };
        Update: {
          business_id?: string;
          category_id?: string;
          interval_days?: number;
        };
        Relationships: [
          {
            foreignKeyName: "crm_category_intervals_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_category_intervals_category_id_business_id_fkey";
            columns: ["category_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "service_categories";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      crm_settings: {
        Row: {
          at_risk_factor: number;
          business_id: string;
          default_interval_days: number;
          lapsed_days: number;
          lost_days: number;
          loyal_visits: number;
          rebook_window_days: number;
          updated_at: string;
          vip_spend: number;
        };
        ComputedFields: never;
        Insert: {
          at_risk_factor?: number;
          business_id: string;
          default_interval_days?: number;
          lapsed_days?: number;
          lost_days?: number;
          loyal_visits?: number;
          rebook_window_days?: number;
          updated_at?: string;
          vip_spend?: number;
        };
        Update: {
          at_risk_factor?: number;
          business_id?: string;
          default_interval_days?: number;
          lapsed_days?: number;
          lost_days?: number;
          loyal_visits?: number;
          rebook_window_days?: number;
          updated_at?: string;
          vip_spend?: number;
        };
        Relationships: [
          {
            foreignKeyName: "crm_settings_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: true;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      customer_blocks: {
        Row: {
          blocked_business_id: string | null;
          blocked_customer_id: string | null;
          created_at: string;
          customer_id: string;
          id: string;
        };
        Insert: {
          blocked_business_id?: string | null;
          blocked_customer_id?: string | null;
          created_at?: string;
          customer_id: string;
          id?: string;
        };
        Update: {
          blocked_business_id?: string | null;
          blocked_customer_id?: string | null;
          created_at?: string;
          customer_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_blocks_blocked_business_id_fkey";
            columns: ["blocked_business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customer_blocks_blocked_customer_id_fkey";
            columns: ["blocked_customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customer_blocks_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      customers: {
        Row: {
          avatar_path: string | null;
          country_code: string;
          created_at: string;
          created_by_branch_id: string | null;
          date_of_birth: string | null;
          email: string | null;
          first_name: string;
          gender: Database["public"]["Enums"]["gender"] | null;
          id: string;
          last_name: string | null;
          phone: string | null;
          updated_at: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          avatar_path?: string | null;
          country_code?: string;
          created_at?: string;
          created_by_branch_id?: string | null;
          date_of_birth?: string | null;
          email?: string | null;
          first_name: string;
          gender?: Database["public"]["Enums"]["gender"] | null;
          id?: string;
          last_name?: string | null;
          phone?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          avatar_path?: string | null;
          country_code?: string;
          created_at?: string;
          created_by_branch_id?: string | null;
          date_of_birth?: string | null;
          email?: string | null;
          first_name?: string;
          gender?: Database["public"]["Enums"]["gender"] | null;
          id?: string;
          last_name?: string | null;
          phone?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "customers_created_by_branch_id_fkey";
            columns: ["created_by_branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customers_created_by_branch_id_fkey";
            columns: ["created_by_branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customers_created_by_branch_id_fkey";
            columns: ["created_by_branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customers_created_by_branch_id_fkey";
            columns: ["created_by_branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
        ];
      };
      discount_offers: {
        Row: {
          active: boolean;
          business_id: string;
          code: string;
          created_at: string;
          id: string;
          kind: string;
          max_uses: number | null;
          min_spend: number;
          name: string;
          per_client_limit: number | null;
          segment_id: string | null;
          service_id: string | null;
          valid_from: string | null;
          valid_to: string | null;
          value: number;
        };
        ComputedFields: never;
        Insert: {
          active?: boolean;
          business_id: string;
          code: string;
          created_at?: string;
          id?: string;
          kind: string;
          max_uses?: number | null;
          min_spend?: number;
          name: string;
          per_client_limit?: number | null;
          segment_id?: string | null;
          service_id?: string | null;
          valid_from?: string | null;
          valid_to?: string | null;
          value: number;
        };
        Update: {
          active?: boolean;
          business_id?: string;
          code?: string;
          created_at?: string;
          id?: string;
          kind?: string;
          max_uses?: number | null;
          min_spend?: number;
          name?: string;
          per_client_limit?: number | null;
          segment_id?: string | null;
          service_id?: string | null;
          valid_from?: string | null;
          valid_to?: string | null;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "discount_offers_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "discount_offers_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "segments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "discount_offers_service_id_business_id_fkey";
            columns: ["service_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      discount_redemptions: {
        Row: {
          amount_off: number;
          booking_id: string | null;
          business_id: string;
          created_at: string;
          customer_id: string;
          discount_id: string;
          id: string;
          redeemed_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          amount_off: number;
          booking_id?: string | null;
          business_id: string;
          created_at?: string;
          customer_id: string;
          discount_id: string;
          id?: string;
          redeemed_by?: string | null;
        };
        Update: {
          amount_off?: number;
          booking_id?: string | null;
          business_id?: string;
          created_at?: string;
          customer_id?: string;
          discount_id?: string;
          id?: string;
          redeemed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "discount_redemptions_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "discount_redemptions_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "discount_redemptions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "discount_redemptions_discount_id_fkey";
            columns: ["discount_id"];
            isOneToOne: false;
            referencedRelation: "discount_offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "discount_redemptions_redeemed_by_fkey";
            columns: ["redeemed_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      document_templates: {
        Row: {
          body_ar: string;
          body_en: string;
          key: string;
          name_ar: string;
          name_en: string;
        };
        ComputedFields: never;
        Insert: {
          body_ar: string;
          body_en: string;
          key: string;
          name_ar: string;
          name_en: string;
        };
        Update: {
          body_ar?: string;
          body_en?: string;
          key?: string;
          name_ar?: string;
          name_en?: string;
        };
        Relationships: [];
      };
      employee_advances: {
        Row: {
          amount: number;
          business_id: string;
          created_at: string;
          decided_at: string | null;
          decided_by: string | null;
          decision_note: string | null;
          employee_id: string;
          first_month: string;
          id: string;
          installments: number;
          reason: string | null;
          requested_by: string | null;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          amount: number;
          business_id: string;
          created_at?: string;
          decided_at?: string | null;
          decided_by?: string | null;
          decision_note?: string | null;
          employee_id: string;
          first_month: string;
          id?: string;
          installments: number;
          reason?: string | null;
          requested_by?: string | null;
          status?: string;
        };
        Update: {
          amount?: number;
          business_id?: string;
          created_at?: string;
          decided_at?: string | null;
          decided_by?: string | null;
          decision_note?: string | null;
          employee_id?: string;
          first_month?: string;
          id?: string;
          installments?: number;
          reason?: string | null;
          requested_by?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_advances_decided_by_fkey";
            columns: ["decided_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_advances_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "employee_advances_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_branches: {
        Row: {
          branch_id: string;
          business_id: string;
          created_at: string;
          employee_id: string;
          is_primary: boolean;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          business_id: string;
          created_at?: string;
          employee_id: string;
          is_primary?: boolean;
        };
        Update: {
          branch_id?: string;
          business_id?: string;
          created_at?: string;
          employee_id?: string;
          is_primary?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "employee_branches_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "employee_branches_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "employee_branches_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "employee_branches_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "employee_branches_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      employee_checklists: {
        Row: {
          business_id: string;
          created_at: string;
          employee_id: string;
          id: string;
          items: NonNullable<Json>;
          kind: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          employee_id: string;
          id?: string;
          items?: NonNullable<Json>;
          kind: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          employee_id?: string;
          id?: string;
          items?: NonNullable<Json>;
          kind?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_checklists_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      employee_documents: {
        Row: {
          business_id: string;
          category: Database["public"]["Enums"]["document_category"];
          created_at: string;
          delete_reason: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          employee_id: string | null;
          expires_on: string | null;
          file_path: string;
          id: string;
          name: string;
          sign_status: Database["public"]["Enums"]["document_sign_status"];
          signature_requested_at: string | null;
          signed_at: string | null;
          source: string;
          updated_at: string;
          uploaded_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          category: Database["public"]["Enums"]["document_category"];
          created_at?: string;
          delete_reason?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          employee_id?: string | null;
          expires_on?: string | null;
          file_path: string;
          id?: string;
          name: string;
          sign_status?: Database["public"]["Enums"]["document_sign_status"];
          signature_requested_at?: string | null;
          signed_at?: string | null;
          source?: string;
          updated_at?: string;
          uploaded_by?: string | null;
        };
        Update: {
          business_id?: string;
          category?: Database["public"]["Enums"]["document_category"];
          created_at?: string;
          delete_reason?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          employee_id?: string | null;
          expires_on?: string | null;
          file_path?: string;
          id?: string;
          name?: string;
          sign_status?: Database["public"]["Enums"]["document_sign_status"];
          signature_requested_at?: string | null;
          signed_at?: string | null;
          source?: string;
          updated_at?: string;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employee_documents_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_documents_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_documents_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_goals: {
        Row: {
          actual_manual: number | null;
          business_id: string;
          created_at: string;
          created_by: string | null;
          employee_id: string;
          id: string;
          kpi: string;
          period_end: string;
          period_start: string;
          target: number;
          title: string;
        };
        ComputedFields: never;
        Insert: {
          actual_manual?: number | null;
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          employee_id: string;
          id?: string;
          kpi: string;
          period_end: string;
          period_start: string;
          target: number;
          title: string;
        };
        Update: {
          actual_manual?: number | null;
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          employee_id?: string;
          id?: string;
          kpi?: string;
          period_end?: string;
          period_start?: string;
          target?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_goals_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_goals_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      employee_hours: {
        Row: {
          branch_id: string;
          break_minutes: number;
          created_at: string;
          day_of_week: number;
          employee_id: string;
          ends_at: string;
          id: string;
          starts_at: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          break_minutes?: number;
          created_at?: string;
          day_of_week: number;
          employee_id: string;
          ends_at: string;
          id?: string;
          starts_at: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          break_minutes?: number;
          created_at?: string;
          day_of_week?: number;
          employee_id?: string;
          ends_at?: string;
          id?: string;
          starts_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_hours_employee_id_branch_id_fkey";
            columns: ["employee_id", "branch_id"];
            isOneToOne: false;
            referencedRelation: "employee_branches";
            referencedColumns: ["employee_id", "branch_id"];
          },
        ];
      };
      employee_permissions: {
        Row: {
          branch_id: string | null;
          business_id: string;
          employee_id: string;
          granted_at: string;
          granted_by: string | null;
          id: string;
          permission_key: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id?: string | null;
          business_id: string;
          employee_id: string;
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          permission_key: string;
        };
        Update: {
          branch_id?: string | null;
          business_id?: string;
          employee_id?: string;
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          permission_key?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_permissions_employee_id_branch_id_fkey";
            columns: ["employee_id", "branch_id"];
            isOneToOne: false;
            referencedRelation: "employee_branches";
            referencedColumns: ["employee_id", "branch_id"];
          },
          {
            foreignKeyName: "employee_permissions_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "employee_permissions_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_permissions_permission_key_fkey";
            columns: ["permission_key"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["key"];
          },
        ];
      };
      employee_private: {
        Row: {
          bank_account_enc: string | null;
          bank_name: string | null;
          business_id: string;
          employee_id: string;
          national_id_enc: string | null;
          updated_at: string;
          wallet_number_enc: string | null;
        };
        ComputedFields: never;
        Insert: {
          bank_account_enc?: string | null;
          bank_name?: string | null;
          business_id: string;
          employee_id: string;
          national_id_enc?: string | null;
          updated_at?: string;
          wallet_number_enc?: string | null;
        };
        Update: {
          bank_account_enc?: string | null;
          bank_name?: string | null;
          business_id?: string;
          employee_id?: string;
          national_id_enc?: string | null;
          updated_at?: string;
          wallet_number_enc?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employee_private_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      employee_special_days: {
        Row: {
          branch_id: string | null;
          break_minutes: number;
          created_at: string;
          date: string;
          employee_id: string;
          ends_at: string | null;
          id: string;
          is_unavailable: boolean;
          reason: string | null;
          starts_at: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id?: string | null;
          break_minutes?: number;
          created_at?: string;
          date: string;
          employee_id: string;
          ends_at?: string | null;
          id?: string;
          is_unavailable?: boolean;
          reason?: string | null;
          starts_at?: string | null;
          updated_at?: string;
        };
        Update: {
          branch_id?: string | null;
          break_minutes?: number;
          created_at?: string;
          date?: string;
          employee_id?: string;
          ends_at?: string | null;
          id?: string;
          is_unavailable?: boolean;
          reason?: string | null;
          starts_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_special_days_employee_id_branch_id_fkey";
            columns: ["employee_id", "branch_id"];
            isOneToOne: false;
            referencedRelation: "employee_branches";
            referencedColumns: ["employee_id", "branch_id"];
          },
          {
            foreignKeyName: "employee_special_days_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      employees: {
        Row: {
          address: string | null;
          archive_reason: string | null;
          archived_at: string | null;
          avatar_path: string | null;
          bio: string | null;
          business_id: string;
          certifications: string[];
          contract_end: string | null;
          contract_start: string | null;
          created_at: string;
          date_of_birth: string | null;
          department: string | null;
          email: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relation: string | null;
          employment_type: string | null;
          first_name: string;
          gender: string | null;
          hire_date: string | null;
          hr_notes: string | null;
          id: string;
          is_owner: boolean;
          is_system: boolean;
          job_title: string | null;
          languages: string[];
          last_name: string | null;
          last_working_day: string | null;
          legal_name_ar: string | null;
          legal_name_en: string | null;
          manager_id: string | null;
          marital_status: string | null;
          nationality: string | null;
          personal_email: string | null;
          phone: string | null;
          probation_end: string | null;
          provides_services: boolean;
          skills: string[];
          social_insurance_no: string | null;
          status: Database["public"]["Enums"]["employee_status"];
          updated_at: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          address?: string | null;
          archive_reason?: string | null;
          archived_at?: string | null;
          avatar_path?: string | null;
          bio?: string | null;
          business_id: string;
          certifications?: string[];
          contract_end?: string | null;
          contract_start?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          department?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relation?: string | null;
          employment_type?: string | null;
          first_name: string;
          gender?: string | null;
          hire_date?: string | null;
          hr_notes?: string | null;
          id?: string;
          is_owner?: boolean;
          is_system?: boolean;
          job_title?: string | null;
          languages?: string[];
          last_name?: string | null;
          last_working_day?: string | null;
          legal_name_ar?: string | null;
          legal_name_en?: string | null;
          manager_id?: string | null;
          marital_status?: string | null;
          nationality?: string | null;
          personal_email?: string | null;
          phone?: string | null;
          probation_end?: string | null;
          provides_services?: boolean;
          skills?: string[];
          social_insurance_no?: string | null;
          status?: Database["public"]["Enums"]["employee_status"];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          address?: string | null;
          archive_reason?: string | null;
          archived_at?: string | null;
          avatar_path?: string | null;
          bio?: string | null;
          business_id?: string;
          certifications?: string[];
          contract_end?: string | null;
          contract_start?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          department?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relation?: string | null;
          employment_type?: string | null;
          first_name?: string;
          gender?: string | null;
          hire_date?: string | null;
          hr_notes?: string | null;
          id?: string;
          is_owner?: boolean;
          is_system?: boolean;
          job_title?: string | null;
          languages?: string[];
          last_name?: string | null;
          last_working_day?: string | null;
          legal_name_ar?: string | null;
          legal_name_en?: string | null;
          manager_id?: string | null;
          marital_status?: string | null;
          nationality?: string | null;
          personal_email?: string | null;
          phone?: string | null;
          probation_end?: string | null;
          provides_services?: boolean;
          skills?: string[];
          social_insurance_no?: string | null;
          status?: Database["public"]["Enums"]["employee_status"];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employees_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employees_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      favourites: {
        Row: {
          branch_id: string;
          created_at: string;
          customer_id: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          created_at?: string;
          customer_id?: string;
        };
        Update: {
          branch_id?: string;
          created_at?: string;
          customer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favourites_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favourites_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favourites_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favourites_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favourites_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      gift_cards: {
        Row: {
          balance: number;
          business_id: string;
          buyer_customer_id: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          expires_at: string | null;
          id: string;
          initial_amount: number;
          method: string | null;
          note: string | null;
          recipient_name: string | null;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          balance: number;
          business_id: string;
          buyer_customer_id?: string | null;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          initial_amount: number;
          method?: string | null;
          note?: string | null;
          recipient_name?: string | null;
          status?: string;
        };
        Update: {
          balance?: number;
          business_id?: string;
          buyer_customer_id?: string | null;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          initial_amount?: number;
          method?: string | null;
          note?: string | null;
          recipient_name?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gift_cards_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gift_cards_buyer_customer_id_fkey";
            columns: ["buyer_customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gift_cards_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      hr_audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          business_id: string;
          created_at: string;
          details: NonNullable<Json>;
          entity: string | null;
          entity_id: string | null;
          id: string;
          subject_employee_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          actor_id?: string | null;
          business_id: string;
          created_at?: string;
          details?: NonNullable<Json>;
          entity?: string | null;
          entity_id?: string | null;
          id?: string;
          subject_employee_id?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          business_id?: string;
          created_at?: string;
          details?: NonNullable<Json>;
          entity?: string | null;
          entity_id?: string | null;
          id?: string;
          subject_employee_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "hr_audit_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hr_audit_log_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hr_audit_log_subject_employee_id_fkey";
            columns: ["subject_employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      hr_records: {
        Row: {
          acknowledged_at: string | null;
          business_id: string;
          created_at: string;
          details: string | null;
          employee_id: string;
          id: string;
          issued_by: string | null;
          issued_on: string;
          kind: string;
          title: string;
        };
        ComputedFields: never;
        Insert: {
          acknowledged_at?: string | null;
          business_id: string;
          created_at?: string;
          details?: string | null;
          employee_id: string;
          id?: string;
          issued_by?: string | null;
          issued_on?: string;
          kind: string;
          title: string;
        };
        Update: {
          acknowledged_at?: string | null;
          business_id?: string;
          created_at?: string;
          details?: string | null;
          employee_id?: string;
          id?: string;
          issued_by?: string | null;
          issued_on?: string;
          kind?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hr_records_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "hr_records_issued_by_fkey";
            columns: ["issued_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      hr_reminder_log: {
        Row: {
          entity_id: string;
          kind: string;
          recipient_id: string;
          sent_on: string;
        };
        ComputedFields: never;
        Insert: {
          entity_id: string;
          kind: string;
          recipient_id: string;
          sent_on?: string;
        };
        Update: {
          entity_id?: string;
          kind?: string;
          recipient_id?: string;
          sent_on?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hr_reminder_log_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      hr_settings: {
        Row: {
          allow_early_payroll: boolean;
          auto_close_after_minutes: number | null;
          business_id: string;
          creator_cannot_approve: boolean;
          late_grace_minutes: number;
          max_daily_hours: number;
          max_deduction_pct: number | null;
          max_weekly_hours: number;
          min_session_minutes: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          allow_early_payroll?: boolean;
          auto_close_after_minutes?: number | null;
          business_id: string;
          creator_cannot_approve?: boolean;
          late_grace_minutes?: number;
          max_daily_hours?: number;
          max_deduction_pct?: number | null;
          max_weekly_hours?: number;
          min_session_minutes?: number;
          updated_at?: string;
        };
        Update: {
          allow_early_payroll?: boolean;
          auto_close_after_minutes?: number | null;
          business_id?: string;
          creator_cannot_approve?: boolean;
          late_grace_minutes?: number;
          max_daily_hours?: number;
          max_deduction_pct?: number | null;
          max_weekly_hours?: number;
          min_session_minutes?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hr_settings_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: true;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      job_openings: {
        Row: {
          branch_id: string | null;
          business_id: string;
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          status: string;
          title: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id?: string | null;
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          status?: string;
          title: string;
        };
        Update: {
          branch_id?: string | null;
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          status?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_openings_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_openings_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_openings_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_openings_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_openings_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_openings_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      leave_policy_rules: {
        Row: {
          business_id: string;
          carry_over_cap: number;
          days_per_year: number;
          document_after_days: number | null;
          id: string;
          leave_type: Database["public"]["Enums"]["leave_type"];
          min_years: number;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          carry_over_cap?: number;
          days_per_year: number;
          document_after_days?: number | null;
          id?: string;
          leave_type: Database["public"]["Enums"]["leave_type"];
          min_years?: number;
        };
        Update: {
          business_id?: string;
          carry_over_cap?: number;
          days_per_year?: number;
          document_after_days?: number | null;
          id?: string;
          leave_type?: Database["public"]["Enums"]["leave_type"];
          min_years?: number;
        };
        Relationships: [
          {
            foreignKeyName: "leave_policy_rules_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      loyalty_cards: {
        Row: {
          business_id: string;
          code: string;
          created_at: string;
          customer_id: string;
          id: string;
          last_activity_at: string;
          program_id: string;
          rewards_available: number;
          rewards_redeemed: number;
          stamps: number;
          stamps_total: number;
          updated_at: string;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          code?: string;
          created_at?: string;
          customer_id: string;
          id?: string;
          last_activity_at?: string;
          program_id: string;
          rewards_available?: number;
          rewards_redeemed?: number;
          stamps?: number;
          stamps_total?: number;
          updated_at?: string;
          version?: number;
        };
        Update: {
          business_id?: string;
          code?: string;
          created_at?: string;
          customer_id?: string;
          id?: string;
          last_activity_at?: string;
          program_id?: string;
          rewards_available?: number;
          rewards_redeemed?: number;
          stamps?: number;
          stamps_total?: number;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "loyalty_cards_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_cards_program_id_business_id_fkey";
            columns: ["program_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "loyalty_programs";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      loyalty_events: {
        Row: {
          booking_id: string | null;
          branch_id: string | null;
          business_id: string;
          card_id: string;
          created_at: string;
          employee_id: string | null;
          id: string;
          kind: Database["public"]["Enums"]["loyalty_event_kind"];
          note: string | null;
          rewards_delta: number;
          stamps_delta: number;
        };
        ComputedFields: never;
        Insert: {
          booking_id?: string | null;
          branch_id?: string | null;
          business_id: string;
          card_id: string;
          created_at?: string;
          employee_id?: string | null;
          id?: string;
          kind: Database["public"]["Enums"]["loyalty_event_kind"];
          note?: string | null;
          rewards_delta?: number;
          stamps_delta?: number;
        };
        Update: {
          booking_id?: string | null;
          branch_id?: string | null;
          business_id?: string;
          card_id?: string;
          created_at?: string;
          employee_id?: string | null;
          id?: string;
          kind?: Database["public"]["Enums"]["loyalty_event_kind"];
          note?: string | null;
          rewards_delta?: number;
          stamps_delta?: number;
        };
        Relationships: [
          {
            foreignKeyName: "loyalty_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_events_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_events_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_events_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_events_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_events_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_events_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "loyalty_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_events_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      loyalty_programs: {
        Row: {
          auto_stamp: boolean;
          birthday_stamps: number;
          brand_color: string;
          business_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          join_code: string;
          min_booking_total: number;
          name: string;
          referral_stamps: number;
          reward_description: string | null;
          reward_service_id: string | null;
          reward_title: string;
          stamps_required: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          auto_stamp?: boolean;
          birthday_stamps?: number;
          brand_color?: string;
          business_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          join_code?: string;
          min_booking_total?: number;
          name: string;
          referral_stamps?: number;
          reward_description?: string | null;
          reward_service_id?: string | null;
          reward_title: string;
          stamps_required: number;
          updated_at?: string;
        };
        Update: {
          auto_stamp?: boolean;
          birthday_stamps?: number;
          brand_color?: string;
          business_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          join_code?: string;
          min_booking_total?: number;
          name?: string;
          referral_stamps?: number;
          reward_description?: string | null;
          reward_service_id?: string | null;
          reward_title?: string;
          stamps_required?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loyalty_programs_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: true;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_programs_reward_service_fkey";
            columns: ["reward_service_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      loyalty_tiers: {
        Row: {
          business_id: string;
          id: string;
          min_stamps_total: number;
          name: string;
          perk: string | null;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          id?: string;
          min_stamps_total: number;
          name: string;
          perk?: string | null;
        };
        Update: {
          business_id?: string;
          id?: string;
          min_stamps_total?: number;
          name?: string;
          perk?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "loyalty_tiers_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      message_outbox: {
        Row: {
          body: string;
          business_id: string;
          channel: string;
          created_at: string;
          customer_id: string;
          error: string | null;
          id: string;
          origin: string;
          origin_id: string | null;
          sent_at: string | null;
          status: string;
          title: string | null;
          to_phone: string;
        };
        ComputedFields: never;
        Insert: {
          body: string;
          business_id: string;
          channel: string;
          created_at?: string;
          customer_id: string;
          error?: string | null;
          id?: string;
          origin: string;
          origin_id?: string | null;
          sent_at?: string | null;
          status?: string;
          title?: string | null;
          to_phone: string;
        };
        Update: {
          body?: string;
          business_id?: string;
          channel?: string;
          created_at?: string;
          customer_id?: string;
          error?: string | null;
          id?: string;
          origin?: string;
          origin_id?: string | null;
          sent_at?: string | null;
          status?: string;
          title?: string | null;
          to_phone?: string;
        };
        Relationships: [
          {
            foreignKeyName: "message_outbox_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "message_outbox_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      message_templates: {
        Row: {
          body: string;
          business_id: string;
          channel: string;
          created_at: string;
          id: string;
          is_system: boolean;
          key: string | null;
          language: string;
          name: string;
          title: string;
        };
        ComputedFields: never;
        Insert: {
          body: string;
          business_id: string;
          channel?: string;
          created_at?: string;
          id?: string;
          is_system?: boolean;
          key?: string | null;
          language?: string;
          name: string;
          title: string;
        };
        Update: {
          body?: string;
          business_id?: string;
          channel?: string;
          created_at?: string;
          id?: string;
          is_system?: boolean;
          key?: string | null;
          language?: string;
          name?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "message_templates_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          customer_id: string | null;
          data: NonNullable<Json>;
          employee_id: string | null;
          id: string;
          pushed_at: string | null;
          read_at: string | null;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
        };
        ComputedFields: never;
        Insert: {
          body?: string | null;
          created_at?: string;
          customer_id?: string | null;
          data?: NonNullable<Json>;
          employee_id?: string | null;
          id?: string;
          pushed_at?: string | null;
          read_at?: string | null;
          title: string;
          type?: Database["public"]["Enums"]["notification_type"];
        };
        Update: {
          body?: string | null;
          created_at?: string;
          customer_id?: string | null;
          data?: NonNullable<Json>;
          employee_id?: string | null;
          id?: string;
          pushed_at?: string | null;
          read_at?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["notification_type"];
        };
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      offer_categories: {
        Row: {
          created_at: string;
          ends_on: string | null;
          id: string;
          is_active: boolean;
          name: string;
          name_i18n: NonNullable<Json>;
          slug: string;
          sort_order: number;
          starts_on: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          ends_on?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          name_i18n?: NonNullable<Json>;
          slug: string;
          sort_order?: number;
          starts_on?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_on?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          name_i18n?: NonNullable<Json>;
          slug?: string;
          sort_order?: number;
          starts_on?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      offers: {
        Row: {
          branch_id: string;
          business_id: string;
          category_id: string | null;
          created_at: string;
          description: string | null;
          ends_on: string;
          id: string;
          image_path: string | null;
          is_active: boolean;
          offer_price: number | null;
          original_price: number | null;
          service_id: string | null;
          starts_on: string;
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          business_id: string;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          ends_on: string;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          offer_price?: number | null;
          original_price?: number | null;
          service_id?: string | null;
          starts_on: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          business_id?: string;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          ends_on?: string;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          offer_price?: number | null;
          original_price?: number | null;
          service_id?: string | null;
          starts_on?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "offers_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "offers_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "offers_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "offers_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "offers_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "offer_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_service_same_business_fkey";
            columns: ["service_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      one_on_ones: {
        Row: {
          author_id: string | null;
          business_id: string;
          created_at: string;
          employee_id: string;
          held_on: string;
          id: string;
          notes: string;
        };
        ComputedFields: never;
        Insert: {
          author_id?: string | null;
          business_id: string;
          created_at?: string;
          employee_id: string;
          held_on: string;
          id?: string;
          notes: string;
        };
        Update: {
          author_id?: string | null;
          business_id?: string;
          created_at?: string;
          employee_id?: string;
          held_on?: string;
          id?: string;
          notes?: string;
        };
        Relationships: [
          {
            foreignKeyName: "one_on_ones_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "one_on_ones_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      packages: {
        Row: {
          active: boolean;
          business_id: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          price: number;
          service_id: string | null;
          sessions: number;
          validity_days: number | null;
        };
        ComputedFields: never;
        Insert: {
          active?: boolean;
          business_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          price: number;
          service_id?: string | null;
          sessions: number;
          validity_days?: number | null;
        };
        Update: {
          active?: boolean;
          business_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          price?: number;
          service_id?: string | null;
          sessions?: number;
          validity_days?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "packages_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "packages_service_id_business_id_fkey";
            columns: ["service_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      pay_settings: {
        Row: {
          business_id: string;
          commission_rate: number;
          created_at: string;
          employee_id: string;
          hourly_rate: number | null;
          monthly_salary: number | null;
          overtime_multiplier: number;
          overtime_policy: string;
          pay_type: Database["public"]["Enums"]["pay_type"];
          product_commission_rate: number;
          regular_hours_per_month: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          commission_rate?: number;
          created_at?: string;
          employee_id: string;
          hourly_rate?: number | null;
          monthly_salary?: number | null;
          overtime_multiplier?: number;
          overtime_policy?: string;
          pay_type?: Database["public"]["Enums"]["pay_type"];
          product_commission_rate?: number;
          regular_hours_per_month?: number;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          commission_rate?: number;
          created_at?: string;
          employee_id?: string;
          hourly_rate?: number | null;
          monthly_salary?: number | null;
          overtime_multiplier?: number;
          overtime_policy?: string;
          pay_type?: Database["public"]["Enums"]["pay_type"];
          product_commission_rate?: number;
          regular_hours_per_month?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pay_settings_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      payroll_adjustments: {
        Row: {
          amount: number;
          business_id: string;
          category: string;
          created_at: string;
          created_by: string | null;
          id: string;
          kind: Database["public"]["Enums"]["payroll_adjustment_kind"];
          line_id: string;
          note: string | null;
        };
        ComputedFields: never;
        Insert: {
          amount: number;
          business_id: string;
          category?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          kind: Database["public"]["Enums"]["payroll_adjustment_kind"];
          line_id: string;
          note?: string | null;
        };
        Update: {
          amount?: number;
          business_id?: string;
          category?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          kind?: Database["public"]["Enums"]["payroll_adjustment_kind"];
          line_id?: string;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_adjustments_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payroll_adjustments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payroll_adjustments_line_id_fkey";
            columns: ["line_id"];
            isOneToOne: false;
            referencedRelation: "payroll_lines";
            referencedColumns: ["id"];
          },
        ];
      };
      payroll_hour_overrides: {
        Row: {
          approved_by: string | null;
          created_at: string;
          employee_id: string;
          hours: number;
          note: string | null;
          run_id: string;
        };
        ComputedFields: never;
        Insert: {
          approved_by?: string | null;
          created_at?: string;
          employee_id: string;
          hours: number;
          note?: string | null;
          run_id: string;
        };
        Update: {
          approved_by?: string | null;
          created_at?: string;
          employee_id?: string;
          hours?: number;
          note?: string | null;
          run_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_hour_overrides_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payroll_hour_overrides_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payroll_hour_overrides_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "payroll_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      payroll_lines: {
        Row: {
          adjustments_total: number;
          advance_deduction: number;
          banked_hours: number;
          base_pay: number;
          branch_id: string;
          business_id: string;
          commission: number;
          commission_clawback: number;
          commission_detail: NonNullable<Json>;
          commission_revenue: number;
          cost_shared: boolean;
          created_at: string;
          employee_id: string;
          employee_name: string;
          employer_cost: number;
          fallback_hours: number;
          flags: string[];
          id: string;
          income_tax: number;
          leave_deduction: number;
          net_pay: number;
          overtime_hours: number;
          overtime_pay: number;
          overtime_policy: string | null;
          paid_leave_days: number;
          paid_leave_pay: number;
          pay_type: Database["public"]["Enums"]["pay_type"] | null;
          payment_method: string | null;
          payment_status: string;
          product_commission: number;
          regular_hours: number;
          run_id: string;
          si_employee: number;
          si_employer: number;
          stamp_solidarity: number;
          statutory_configured: boolean;
          total_pay: number;
          unpaid_leave_days: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          adjustments_total?: number;
          advance_deduction?: number;
          banked_hours?: number;
          base_pay?: number;
          branch_id: string;
          business_id: string;
          commission?: number;
          commission_clawback?: number;
          commission_detail?: NonNullable<Json>;
          commission_revenue?: number;
          cost_shared?: boolean;
          created_at?: string;
          employee_id: string;
          employee_name: string;
          employer_cost?: number;
          fallback_hours?: number;
          flags?: string[];
          id?: string;
          income_tax?: number;
          leave_deduction?: number;
          net_pay?: number;
          overtime_hours?: number;
          overtime_pay?: number;
          overtime_policy?: string | null;
          paid_leave_days?: number;
          paid_leave_pay?: number;
          pay_type?: Database["public"]["Enums"]["pay_type"] | null;
          payment_method?: string | null;
          payment_status?: string;
          product_commission?: number;
          regular_hours?: number;
          run_id: string;
          si_employee?: number;
          si_employer?: number;
          stamp_solidarity?: number;
          statutory_configured?: boolean;
          total_pay?: number;
          unpaid_leave_days?: number;
          updated_at?: string;
        };
        Update: {
          adjustments_total?: number;
          advance_deduction?: number;
          banked_hours?: number;
          base_pay?: number;
          branch_id?: string;
          business_id?: string;
          commission?: number;
          commission_clawback?: number;
          commission_detail?: NonNullable<Json>;
          commission_revenue?: number;
          cost_shared?: boolean;
          created_at?: string;
          employee_id?: string;
          employee_name?: string;
          employer_cost?: number;
          fallback_hours?: number;
          flags?: string[];
          id?: string;
          income_tax?: number;
          leave_deduction?: number;
          net_pay?: number;
          overtime_hours?: number;
          overtime_pay?: number;
          overtime_policy?: string | null;
          paid_leave_days?: number;
          paid_leave_pay?: number;
          pay_type?: Database["public"]["Enums"]["pay_type"] | null;
          payment_method?: string | null;
          payment_status?: string;
          product_commission?: number;
          regular_hours?: number;
          run_id?: string;
          si_employee?: number;
          si_employer?: number;
          stamp_solidarity?: number;
          statutory_configured?: boolean;
          total_pay?: number;
          unpaid_leave_days?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_lines_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "payroll_lines_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "payroll_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      payroll_rule_sets: {
        Row: {
          business_id: string;
          created_at: string;
          created_by: string | null;
          effective_from: string;
          holiday_work_premium_pct: number;
          id: string;
          name: string;
          notes: string | null;
          si_employee_pct: number;
          si_employer_pct: number;
          si_max_base: number | null;
          si_min_base: number;
          solidarity_pct: number;
          stamp_pct: number;
          tax_brackets: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          effective_from: string;
          holiday_work_premium_pct?: number;
          id?: string;
          name?: string;
          notes?: string | null;
          si_employee_pct?: number;
          si_employer_pct?: number;
          si_max_base?: number | null;
          si_min_base?: number;
          solidarity_pct?: number;
          stamp_pct?: number;
          tax_brackets?: NonNullable<Json>;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          effective_from?: string;
          holiday_work_premium_pct?: number;
          id?: string;
          name?: string;
          notes?: string | null;
          si_employee_pct?: number;
          si_employer_pct?: number;
          si_max_base?: number | null;
          si_min_base?: number;
          solidarity_pct?: number;
          stamp_pct?: number;
          tax_brackets?: NonNullable<Json>;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_rule_sets_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payroll_rule_sets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      payroll_run_snapshots: {
        Row: {
          business_id: string;
          created_at: string;
          run_id: string;
          snapshot: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          run_id: string;
          snapshot: NonNullable<Json>;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          run_id?: string;
          snapshot?: NonNullable<Json>;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_run_snapshots_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: true;
            referencedRelation: "payroll_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      payroll_runs: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          branch_id: string;
          business_id: string;
          created_at: string;
          created_by: string | null;
          id: string;
          paid_at: string | null;
          period_end: string;
          period_start: string;
          status: Database["public"]["Enums"]["payroll_run_status"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          branch_id: string;
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          paid_at?: string | null;
          period_end: string;
          period_start: string;
          status?: Database["public"]["Enums"]["payroll_run_status"];
          updated_at?: string;
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          branch_id?: string;
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          paid_at?: string | null;
          period_end?: string;
          period_start?: string;
          status?: Database["public"]["Enums"]["payroll_run_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_runs_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payroll_runs_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "payroll_runs_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "payroll_runs_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "payroll_runs_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "payroll_runs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      payslips: {
        Row: {
          branch_id: string;
          business_id: string;
          employee_id: string;
          generated_at: string;
          id: string;
          line_id: string;
          period_end: string;
          period_start: string;
          run_id: string;
          snapshot: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          business_id: string;
          employee_id: string;
          generated_at?: string;
          id?: string;
          line_id: string;
          period_end: string;
          period_start: string;
          run_id: string;
          snapshot: NonNullable<Json>;
        };
        Update: {
          branch_id?: string;
          business_id?: string;
          employee_id?: string;
          generated_at?: string;
          id?: string;
          line_id?: string;
          period_end?: string;
          period_start?: string;
          run_id?: string;
          snapshot?: NonNullable<Json>;
        };
        Relationships: [
          {
            foreignKeyName: "payslips_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payslips_line_id_fkey";
            columns: ["line_id"];
            isOneToOne: true;
            referencedRelation: "payroll_lines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payslips_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "payroll_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      performance_reviews: {
        Row: {
          business_id: string;
          created_at: string;
          cycle_id: string | null;
          due_on: string | null;
          employee_id: string;
          id: string;
          kind: string;
          manager_at: string | null;
          manager_id: string | null;
          manager_notes: string | null;
          manager_rating: number | null;
          self_at: string | null;
          self_notes: string | null;
          self_rating: number | null;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          cycle_id?: string | null;
          due_on?: string | null;
          employee_id: string;
          id?: string;
          kind?: string;
          manager_at?: string | null;
          manager_id?: string | null;
          manager_notes?: string | null;
          manager_rating?: number | null;
          self_at?: string | null;
          self_notes?: string | null;
          self_rating?: number | null;
          status?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          cycle_id?: string | null;
          due_on?: string | null;
          employee_id?: string;
          id?: string;
          kind?: string;
          manager_at?: string | null;
          manager_id?: string | null;
          manager_notes?: string | null;
          manager_rating?: number | null;
          self_at?: string | null;
          self_notes?: string | null;
          self_rating?: number | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "performance_reviews_cycle_id_fkey";
            columns: ["cycle_id"];
            isOneToOne: false;
            referencedRelation: "review_cycles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "performance_reviews_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "performance_reviews_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      permissions: {
        Row: {
          area: string;
          description: string | null;
          key: string;
          label: string;
          requires: string[];
          scope: string;
          sort_order: number;
        };
        ComputedFields: never;
        Insert: {
          area: string;
          description?: string | null;
          key: string;
          label: string;
          requires?: string[];
          scope: string;
          sort_order?: number;
        };
        Update: {
          area?: string;
          description?: string | null;
          key?: string;
          label?: string;
          requires?: string[];
          scope?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          created_at: string;
          currency: string;
          description: string | null;
          entitlements: NonNullable<Json>;
          features: string[];
          id: string;
          interval: string;
          is_active: boolean;
          is_popular: boolean;
          max_branches: number | null;
          max_team: number | null;
          name: string;
          price_minor: number;
          slug: string;
          sort_order: number;
          tier: string;
          trial_days: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          currency?: string;
          description?: string | null;
          entitlements?: NonNullable<Json>;
          features?: string[];
          id?: string;
          interval: string;
          is_active?: boolean;
          is_popular?: boolean;
          max_branches?: number | null;
          max_team?: number | null;
          name: string;
          price_minor: number;
          slug: string;
          sort_order?: number;
          tier: string;
          trial_days?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          description?: string | null;
          entitlements?: NonNullable<Json>;
          features?: string[];
          id?: string;
          interval?: string;
          is_active?: boolean;
          is_popular?: boolean;
          max_branches?: number | null;
          max_team?: number | null;
          name?: string;
          price_minor?: number;
          slug?: string;
          sort_order?: number;
          tier?: string;
          trial_days?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_categories: {
        Row: {
          business_id: string;
          created_at: string;
          id: string;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          id?: string;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_categories_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      product_sales: {
        Row: {
          amount: number;
          branch_id: string;
          business_id: string;
          created_at: string;
          created_by: string | null;
          employee_id: string;
          id: string;
          note: string | null;
          product_id: string | null;
          product_name: string;
          sold_on: string;
        };
        ComputedFields: never;
        Insert: {
          amount: number;
          branch_id: string;
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          employee_id: string;
          id?: string;
          note?: string | null;
          product_id?: string | null;
          product_name: string;
          sold_on: string;
        };
        Update: {
          amount?: number;
          branch_id?: string;
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          employee_id?: string;
          id?: string;
          note?: string | null;
          product_id?: string | null;
          product_name?: string;
          sold_on?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_sales_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_sales_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_sales_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_sales_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_sales_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_sales_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_sales_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          brand: string | null;
          business_id: string;
          category_id: string | null;
          created_at: string;
          description: string | null;
          id: string;
          image_path: string | null;
          is_active: boolean;
          name: string;
          unit: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          brand?: string | null;
          business_id: string;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          name: string;
          unit?: string;
          updated_at?: string;
        };
        Update: {
          brand?: string | null;
          business_id?: string;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          name?: string;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_same_business_fkey";
            columns: ["category_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      promoted_branches: {
        Row: {
          branch_id: string;
          created_at: string;
          ends_on: string;
          id: string;
          note: string | null;
          order_id: string | null;
          placement: string;
          sort_order: number;
          starts_on: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          created_at?: string;
          ends_on: string;
          id?: string;
          note?: string | null;
          order_id?: string | null;
          placement?: string;
          sort_order?: number;
          starts_on: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          created_at?: string;
          ends_on?: string;
          id?: string;
          note?: string | null;
          order_id?: string | null;
          placement?: string;
          sort_order?: number;
          starts_on?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "promoted_branches_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promoted_branches_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promoted_branches_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promoted_branches_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promoted_branches_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "promotion_orders";
            referencedColumns: ["id"];
          },
        ];
      };
      promoted_offers: {
        Row: {
          created_at: string;
          ends_on: string;
          id: string;
          note: string | null;
          offer_id: string;
          order_id: string | null;
          sort_order: number;
          starts_on: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          ends_on: string;
          id?: string;
          note?: string | null;
          offer_id: string;
          order_id?: string | null;
          sort_order?: number;
          starts_on: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_on?: string;
          id?: string;
          note?: string | null;
          offer_id?: string;
          order_id?: string | null;
          sort_order?: number;
          starts_on?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "promoted_offers_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promoted_offers_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "promoted_offer_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promoted_offers_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "promotion_orders";
            referencedColumns: ["id"];
          },
        ];
      };
      promotion_orders: {
        Row: {
          amount: number;
          branch_id: string;
          business_id: string;
          category_id: string | null;
          created_at: string;
          created_by: string | null;
          currency: string;
          days: number;
          ends_on: string;
          hold_expires_at: string | null;
          id: string;
          note: string | null;
          offer_id: string | null;
          paid_at: string | null;
          placement: string;
          price_per_day: number;
          provider: string | null;
          provider_ref: string | null;
          rate_id: string | null;
          starts_on: string;
          status: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          amount: number;
          branch_id: string;
          business_id: string;
          category_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency: string;
          days: number;
          ends_on: string;
          hold_expires_at?: string | null;
          id?: string;
          note?: string | null;
          offer_id?: string | null;
          paid_at?: string | null;
          placement: string;
          price_per_day: number;
          provider?: string | null;
          provider_ref?: string | null;
          rate_id?: string | null;
          starts_on: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          branch_id?: string;
          business_id?: string;
          category_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          days?: number;
          ends_on?: string;
          hold_expires_at?: string | null;
          id?: string;
          note?: string | null;
          offer_id?: string | null;
          paid_at?: string | null;
          placement?: string;
          price_per_day?: number;
          provider?: string | null;
          provider_ref?: string | null;
          rate_id?: string | null;
          starts_on?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "promotion_orders_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promotion_orders_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promotion_orders_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promotion_orders_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promotion_orders_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promotion_orders_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "offer_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promotion_orders_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promotion_orders_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promotion_orders_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "promoted_offer_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promotion_orders_rate_id_fkey";
            columns: ["rate_id"];
            isOneToOne: false;
            referencedRelation: "promotion_rates";
            referencedColumns: ["id"];
          },
        ];
      };
      promotion_rates: {
        Row: {
          category_id: string | null;
          created_at: string;
          currency: string;
          id: string;
          is_active: boolean;
          label: string;
          max_days: number;
          max_slots: number | null;
          min_days: number;
          placement: string;
          price_per_day: number;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          category_id?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          is_active?: boolean;
          label: string;
          max_days?: number;
          max_slots?: number | null;
          min_days?: number;
          placement: string;
          price_per_day: number;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          is_active?: boolean;
          label?: string;
          max_days?: number;
          max_slots?: number | null;
          min_days?: number;
          placement?: string;
          price_per_day?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "promotion_rates_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "offer_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      push_tokens: {
        Row: {
          app: Database["public"]["Enums"]["app_kind"];
          created_at: string;
          id: string;
          last_seen_at: string;
          platform: Database["public"]["Enums"]["device_platform"];
          token: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          app: Database["public"]["Enums"]["app_kind"];
          created_at?: string;
          id?: string;
          last_seen_at?: string;
          platform: Database["public"]["Enums"]["device_platform"];
          token: string;
          user_id: string;
        };
        Update: {
          app?: Database["public"]["Enums"]["app_kind"];
          created_at?: string;
          id?: string;
          last_seen_at?: string;
          platform?: Database["public"]["Enums"]["device_platform"];
          token?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      queue_tickets: {
        Row: {
          booking_id: string | null;
          branch_id: string;
          business_id: string;
          called_at: string | null;
          called_by: string | null;
          customer_id: string | null;
          customer_name: string | null;
          due_at: string | null;
          employee_id: string | null;
          finished_at: string | null;
          id: string;
          issued_at: string;
          issued_by: string | null;
          number: number;
          queue_date: string;
          served_by: string | null;
          status: Database["public"]["Enums"]["queue_ticket_status"];
        };
        Insert: {
          booking_id?: string | null;
          branch_id: string;
          business_id: string;
          called_at?: string | null;
          called_by?: string | null;
          customer_id?: string | null;
          customer_name?: string | null;
          due_at?: string | null;
          employee_id?: string | null;
          finished_at?: string | null;
          id?: string;
          issued_at?: string;
          issued_by?: string | null;
          number: number;
          queue_date: string;
          served_by?: string | null;
          status?: Database["public"]["Enums"]["queue_ticket_status"];
        };
        Update: {
          booking_id?: string | null;
          branch_id?: string;
          business_id?: string;
          called_at?: string | null;
          called_by?: string | null;
          customer_id?: string | null;
          customer_name?: string | null;
          due_at?: string | null;
          employee_id?: string | null;
          finished_at?: string | null;
          id?: string;
          issued_at?: string;
          issued_by?: string | null;
          number?: number;
          queue_date?: string;
          served_by?: string | null;
          status?: Database["public"]["Enums"]["queue_ticket_status"];
        };
        Relationships: [
          {
            foreignKeyName: "queue_tickets_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "queue_tickets_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "queue_tickets_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "queue_tickets_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "queue_tickets_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "queue_tickets_called_by_fkey";
            columns: ["called_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "queue_tickets_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "queue_tickets_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "queue_tickets_issued_by_fkey";
            columns: ["issued_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "queue_tickets_served_by_fkey";
            columns: ["served_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      report_schedules: {
        Row: {
          business_id: string;
          created_at: string;
          created_by: string | null;
          frequency: string;
          id: string;
          last_sent_on: string | null;
          recipient_ids: string[];
          report: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          frequency: string;
          id?: string;
          last_sent_on?: string | null;
          recipient_ids?: string[];
          report: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          frequency?: string;
          id?: string;
          last_sent_on?: string | null;
          recipient_ids?: string[];
          report?: string;
        };
        Relationships: [
          {
            foreignKeyName: "report_schedules_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "report_schedules_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      review_cycles: {
        Row: {
          business_id: string;
          created_at: string;
          created_by: string | null;
          due_on: string;
          id: string;
          name: string;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          due_on: string;
          id?: string;
          name: string;
          status?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          due_on?: string;
          id?: string;
          name?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_cycles_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_cycles_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          booking_id: string;
          branch_id: string;
          comment: string | null;
          created_at: string;
          customer_id: string;
          id: string;
          rating: number;
          replied_at: string | null;
          replied_by: string | null;
          reply: string | null;
          reviewer_name: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          booking_id: string;
          branch_id: string;
          comment?: string | null;
          created_at?: string;
          customer_id: string;
          id?: string;
          rating: number;
          replied_at?: string | null;
          replied_by?: string | null;
          reply?: string | null;
          reviewer_name?: string | null;
          updated_at?: string;
        };
        Update: {
          booking_id?: string;
          branch_id?: string;
          comment?: string | null;
          created_at?: string;
          customer_id?: string;
          id?: string;
          rating?: number;
          replied_at?: string | null;
          replied_by?: string | null;
          reply?: string | null;
          reviewer_name?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_branch_id_fkey";
            columns: ["booking_id", "branch_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "branch_id"];
          },
          {
            foreignKeyName: "reviews_booking_id_customer_id_fkey";
            columns: ["booking_id", "customer_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "customer_id"];
          },
          {
            foreignKeyName: "reviews_replied_by_fkey";
            columns: ["replied_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      rota_shifts: {
        Row: {
          branch_id: string;
          break_minutes: number;
          business_id: string;
          created_at: string;
          created_by: string | null;
          date: string;
          employee_id: string | null;
          ends_at: string;
          id: string;
          note: string | null;
          starts_at: string;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          branch_id: string;
          break_minutes?: number;
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          date: string;
          employee_id?: string | null;
          ends_at: string;
          id?: string;
          note?: string | null;
          starts_at: string;
          status?: string;
        };
        Update: {
          branch_id?: string;
          break_minutes?: number;
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          date?: string;
          employee_id?: string | null;
          ends_at?: string;
          id?: string;
          note?: string | null;
          starts_at?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rota_shifts_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rota_shifts_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rota_shifts_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rota_shifts_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rota_shifts_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rota_shifts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rota_shifts_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      segment_rules: {
        Row: {
          created_at: string;
          field: Database["public"]["Enums"]["segment_field"];
          id: string;
          operator: Database["public"]["Enums"]["segment_operator"];
          segment_id: string;
          text_value: string | null;
          value: number | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          field: Database["public"]["Enums"]["segment_field"];
          id?: string;
          operator: Database["public"]["Enums"]["segment_operator"];
          segment_id: string;
          text_value?: string | null;
          value?: number | null;
        };
        Update: {
          created_at?: string;
          field?: Database["public"]["Enums"]["segment_field"];
          id?: string;
          operator?: Database["public"]["Enums"]["segment_operator"];
          segment_id?: string;
          text_value?: string | null;
          value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "segment_rules_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "segments";
            referencedColumns: ["id"];
          },
        ];
      };
      segment_snapshots: {
        Row: {
          day: string;
          member_count: number;
          segment_id: string;
        };
        ComputedFields: never;
        Insert: {
          day: string;
          member_count: number;
          segment_id: string;
        };
        Update: {
          day?: string;
          member_count?: number;
          segment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "segment_snapshots_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "segments";
            referencedColumns: ["id"];
          },
        ];
      };
      segments: {
        Row: {
          business_id: string;
          color: string | null;
          created_at: string;
          description: string | null;
          id: string;
          is_builtin: boolean;
          match: Database["public"]["Enums"]["segment_match"];
          name: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          color?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_builtin?: boolean;
          match?: Database["public"]["Enums"]["segment_match"];
          name: string;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          color?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_builtin?: boolean;
          match?: Database["public"]["Enums"]["segment_match"];
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "segments_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      service_categories: {
        Row: {
          business_id: string;
          created_at: string;
          id: string;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          id?: string;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_categories_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      service_employees: {
        Row: {
          business_id: string;
          created_at: string;
          employee_id: string;
          service_id: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          employee_id: string;
          service_id: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          employee_id?: string;
          service_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_employees_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "service_employees_service_id_business_id_fkey";
            columns: ["service_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      service_products: {
        Row: {
          business_id: string;
          created_at: string;
          is_required: boolean;
          product_id: string;
          qty_per_booking: number;
          service_id: string;
          sort_order: number;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          is_required?: boolean;
          product_id: string;
          qty_per_booking?: number;
          service_id: string;
          sort_order?: number;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          is_required?: boolean;
          product_id?: string;
          qty_per_booking?: number;
          service_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "service_products_product_id_business_id_fkey";
            columns: ["product_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "service_products_service_id_business_id_fkey";
            columns: ["service_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      services: {
        Row: {
          archived_at: string | null;
          booking_mode: Database["public"]["Enums"]["booking_mode"];
          buffer_minutes: number;
          business_id: string;
          capacity: number | null;
          category_id: string | null;
          created_at: string;
          description: string | null;
          duration_minutes: number;
          id: string;
          image_path: string | null;
          name: string;
          price: number;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          booking_mode?: Database["public"]["Enums"]["booking_mode"];
          buffer_minutes?: number;
          business_id: string;
          capacity?: number | null;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes: number;
          id?: string;
          image_path?: string | null;
          name: string;
          price: number;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          booking_mode?: Database["public"]["Enums"]["booking_mode"];
          buffer_minutes?: number;
          business_id?: string;
          capacity?: number | null;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          image_path?: string | null;
          name?: string;
          price?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "services_category_same_business_fkey";
            columns: ["category_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "service_categories";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      shift_swaps: {
        Row: {
          business_id: string;
          created_at: string;
          id: string;
          requester_id: string;
          shift_id: string;
          status: string;
          target_id: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          id?: string;
          requester_id: string;
          shift_id: string;
          status?: string;
          target_id: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          id?: string;
          requester_id?: string;
          shift_id?: string;
          status?: string;
          target_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shift_swaps_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shift_swaps_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shift_swaps_shift_id_fkey";
            columns: ["shift_id"];
            isOneToOne: false;
            referencedRelation: "rota_shifts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shift_swaps_target_id_fkey";
            columns: ["target_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      shift_templates: {
        Row: {
          break_minutes: number;
          business_id: string;
          ends_at: string;
          id: string;
          name: string;
          starts_at: string;
        };
        ComputedFields: never;
        Insert: {
          break_minutes?: number;
          business_id: string;
          ends_at: string;
          id?: string;
          name: string;
          starts_at: string;
        };
        Update: {
          break_minutes?: number;
          business_id?: string;
          ends_at?: string;
          id?: string;
          name?: string;
          starts_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shift_templates_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      stock_movements: {
        Row: {
          booking_item_id: string | null;
          branch_id: string;
          branch_stock_id: string;
          business_id: string;
          created_at: string;
          created_by: string | null;
          id: string;
          movement_type: Database["public"]["Enums"]["stock_movement_type"];
          note: string | null;
          qty_change: number;
          reason: string | null;
          supplier: string | null;
          total_cost: number | null;
          unit_cost: number | null;
        };
        ComputedFields: never;
        Insert: {
          booking_item_id?: string | null;
          branch_id: string;
          branch_stock_id: string;
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          movement_type: Database["public"]["Enums"]["stock_movement_type"];
          note?: string | null;
          qty_change: number;
          reason?: string | null;
          supplier?: string | null;
          total_cost?: number | null;
          unit_cost?: number | null;
        };
        Update: {
          booking_item_id?: string | null;
          branch_id?: string;
          branch_stock_id?: string;
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          movement_type?: Database["public"]["Enums"]["stock_movement_type"];
          note?: string | null;
          qty_change?: number;
          reason?: string | null;
          supplier?: string | null;
          total_cost?: number | null;
          unit_cost?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "stock_movements_booking_item_id_fkey";
            columns: ["booking_item_id"];
            isOneToOne: false;
            referencedRelation: "booking_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_movements_branch_stock_id_fkey";
            columns: ["branch_stock_id"];
            isOneToOne: false;
            referencedRelation: "branch_stock";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_movements_branch_stock_id_fkey";
            columns: ["branch_stock_id"];
            isOneToOne: false;
            referencedRelation: "branch_stock_status";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_movements_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          business_id: string;
          created_at: string;
          current_period_end: string | null;
          extra_seats: number;
          grace_reminder_sent_for: string | null;
          id: string;
          note: string | null;
          plan_id: string | null;
          provider: string | null;
          provider_ref: string | null;
          reminder_sent_for: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          current_period_end?: string | null;
          extra_seats?: number;
          grace_reminder_sent_for?: string | null;
          id?: string;
          note?: string | null;
          plan_id?: string | null;
          provider?: string | null;
          provider_ref?: string | null;
          reminder_sent_for?: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          current_period_end?: string | null;
          extra_seats?: number;
          grace_reminder_sent_for?: string | null;
          id?: string;
          note?: string | null;
          plan_id?: string | null;
          provider?: string | null;
          provider_ref?: string | null;
          reminder_sent_for?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: true;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      support_tickets: {
        Row: {
          admin_note: string | null;
          app: Database["public"]["Enums"]["app_kind"];
          created_at: string;
          id: string;
          message: string;
          resolved_at: string | null;
          status: Database["public"]["Enums"]["support_ticket_status"];
          subject: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          admin_note?: string | null;
          app: Database["public"]["Enums"]["app_kind"];
          created_at?: string;
          id?: string;
          message: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["support_ticket_status"];
          subject: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          admin_note?: string | null;
          app?: Database["public"]["Enums"]["app_kind"];
          created_at?: string;
          id?: string;
          message?: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["support_ticket_status"];
          subject?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      time_off_policies: {
        Row: {
          business_id: string;
          created_at: string;
          days_per_year: number;
          employee_id: string;
          id: string;
          leave_type: Database["public"]["Enums"]["leave_type"];
          updated_at: string;
          year: number;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          created_at?: string;
          days_per_year: number;
          employee_id: string;
          id?: string;
          leave_type: Database["public"]["Enums"]["leave_type"];
          updated_at?: string;
          year: number;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          days_per_year?: number;
          employee_id?: string;
          id?: string;
          leave_type?: Database["public"]["Enums"]["leave_type"];
          updated_at?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "time_off_policies_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      time_off_requests: {
        Row: {
          attachment_path: string | null;
          business_id: string;
          created_at: string;
          days: number;
          employee_id: string;
          ends_on: string;
          exceeds_balance: boolean;
          half_day: boolean;
          hours: number | null;
          id: string;
          leave_type: Database["public"]["Enums"]["leave_type"];
          note: string | null;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          starts_on: string;
          status: Database["public"]["Enums"]["time_off_status"];
          updated_at: string;
          working_days: number | null;
        };
        ComputedFields: never;
        Insert: {
          attachment_path?: string | null;
          business_id: string;
          created_at?: string;
          days: number;
          employee_id: string;
          ends_on: string;
          exceeds_balance?: boolean;
          half_day?: boolean;
          hours?: number | null;
          id?: string;
          leave_type: Database["public"]["Enums"]["leave_type"];
          note?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          starts_on: string;
          status?: Database["public"]["Enums"]["time_off_status"];
          updated_at?: string;
          working_days?: number | null;
        };
        Update: {
          attachment_path?: string | null;
          business_id?: string;
          created_at?: string;
          days?: number;
          employee_id?: string;
          ends_on?: string;
          exceeds_balance?: boolean;
          half_day?: boolean;
          hours?: number | null;
          id?: string;
          leave_type?: Database["public"]["Enums"]["leave_type"];
          note?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          starts_on?: string;
          status?: Database["public"]["Enums"]["time_off_status"];
          updated_at?: string;
          working_days?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "time_off_requests_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "time_off_requests_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      trainings: {
        Row: {
          business_id: string;
          completed_on: string | null;
          created_at: string;
          document_id: string | null;
          employee_id: string;
          expires_on: string | null;
          id: string;
          name: string;
          provider: string | null;
        };
        ComputedFields: never;
        Insert: {
          business_id: string;
          completed_on?: string | null;
          created_at?: string;
          document_id?: string | null;
          employee_id: string;
          expires_on?: string | null;
          id?: string;
          name: string;
          provider?: string | null;
        };
        Update: {
          business_id?: string;
          completed_on?: string | null;
          created_at?: string;
          document_id?: string | null;
          employee_id?: string;
          expires_on?: string | null;
          id?: string;
          name?: string;
          provider?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trainings_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "employee_documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trainings_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      wallet_apple_registrations: {
        Row: {
          card_id: string;
          created_at: string;
          device_id: string;
          push_token: string;
          pushed_version: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          card_id: string;
          created_at?: string;
          device_id: string;
          push_token: string;
          pushed_version?: number;
          updated_at?: string;
        };
        Update: {
          card_id?: string;
          created_at?: string;
          device_id?: string;
          push_token?: string;
          pushed_version?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallet_apple_registrations_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "loyalty_cards";
            referencedColumns: ["id"];
          },
        ];
      };
      wallet_google_passes: {
        Row: {
          card_id: string;
          created_at: string;
          synced_version: number;
        };
        ComputedFields: never;
        Insert: {
          card_id: string;
          created_at?: string;
          synced_version?: number;
        };
        Update: {
          card_id?: string;
          created_at?: string;
          synced_version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "wallet_google_passes_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: true;
            referencedRelation: "loyalty_cards";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      branch_cards: {
        Row: {
          address: string | null;
          amenities: Database["public"]["Enums"]["amenity"][];
          branch_name: string;
          business_id: string;
          business_name: string;
          category_slugs: string[] | null;
          city: string | null;
          country_code: string;
          currency: string;
          description: string | null;
          id: string;
          is_open_now: boolean | null;
          latitude: number | null;
          logo_path: string | null;
          longitude: number | null;
          phone: string | null;
          rating_avg: number;
          rating_count: number;
          share_slug: string | null;
          timezone: string;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "branches_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      branch_stock_status: {
        Row: {
          branch_id: string;
          brand: string | null;
          business_id: string;
          category_id: string | null;
          cost_per_unit: number | null;
          id: string;
          image_path: string | null;
          is_low_stock: boolean | null;
          is_out_of_stock: boolean | null;
          product_id: string;
          product_name: string;
          qty_on_hand: number;
          reorder_threshold: number;
          sku: string | null;
          unit: string;
          updated_at: string;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "branch_stock_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "branch_stock_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "branch_stock_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "branch_stock_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "branch_stock_product_id_business_id_fkey";
            columns: ["product_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      promoted_branch_cards: {
        Row: {
          address: string | null;
          amenities: Database["public"]["Enums"]["amenity"][];
          branch_name: string;
          business_id: string;
          business_name: string;
          category_slugs: string[] | null;
          city: string | null;
          country_code: string;
          currency: string;
          description: string | null;
          id: string;
          is_open_now: boolean | null;
          latitude: number | null;
          logo_path: string | null;
          longitude: number | null;
          phone: string | null;
          promoted_until: string;
          promotion_sort_order: number;
          rating_avg: number;
          rating_count: number;
          share_slug: string | null;
          timezone: string;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "branches_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      promoted_offer_cards: {
        Row: {
          branch_id: string;
          branch_name: string;
          business_id: string;
          business_name: string;
          category_id: string | null;
          category_slugs: string[] | null;
          currency: string;
          description: string | null;
          ends_on: string;
          id: string;
          image_path: string | null;
          offer_price: number | null;
          original_price: number | null;
          promotion_sort_order: number | null;
          rating_avg: number;
          starts_on: string;
          title: string;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "offers_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "offers_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "offers_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "offers_branch_id_business_id_fkey";
            columns: ["branch_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "search_promoted_branch_cards";
            referencedColumns: ["id", "business_id"];
          },
          {
            foreignKeyName: "offers_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "offer_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      search_promoted_branch_cards: {
        Row: {
          address: string | null;
          amenities: Database["public"]["Enums"]["amenity"][];
          branch_name: string;
          business_id: string;
          business_name: string;
          category_slugs: string[] | null;
          city: string | null;
          country_code: string;
          currency: string;
          description: string | null;
          id: string;
          is_open_now: boolean | null;
          latitude: number | null;
          logo_path: string | null;
          longitude: number | null;
          phone: string | null;
          promoted_until: string;
          promotion_sort_order: number;
          rating_avg: number;
          rating_count: number;
          share_slug: string | null;
          timezone: string;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "branches_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      accept_invite: { Args: { p_token: string }; Returns: Json };
      acknowledge_hr_record: {
        Args: { p_record_id: string };
        Returns: undefined;
      };
      add_attendance_event: {
        Args: {
          p_at: string;
          p_branch_id: string;
          p_employee_id: string;
          p_kind: Database["public"]["Enums"]["attendance_kind"];
          p_note?: string;
        };
        Returns: {
          at: string;
          auto_closed: boolean;
          branch_id: string;
          business_id: string;
          created_at: string;
          created_by: string | null;
          employee_id: string;
          id: string;
          kind: Database["public"]["Enums"]["attendance_kind"];
          note: string | null;
          source: Database["public"]["Enums"]["attendance_source"];
        };
        SetofOptions: {
          from: "*";
          to: "attendance_events";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      add_attendance_shift: {
        Args: {
          p_branch_id: string;
          p_clock_in: string;
          p_clock_out: string;
          p_employee_id: string;
          p_note: string;
        };
        Returns: Json;
      };
      add_client_note: {
        Args: { p_body: string; p_customer_id: string };
        Returns: string;
      };
      add_client_task: {
        Args: { p_customer_id: string; p_due_at?: string; p_title: string };
        Returns: string;
      };
      add_hr_record: {
        Args: {
          p_details: string;
          p_employee_id: string;
          p_issued_on?: string;
          p_kind: string;
          p_title: string;
        };
        Returns: string;
      };
      add_loyalty_stamp: {
        Args: { p_branch_id: string; p_code: string; p_note?: string };
        Returns: Json;
      };
      add_one_on_one: {
        Args: { p_employee_id: string; p_held_on: string; p_notes: string };
        Returns: string;
      };
      add_payroll_adjustment: {
        Args: {
          p_amount: number;
          p_category?: string;
          p_kind: Database["public"]["Enums"]["payroll_adjustment_kind"];
          p_line_id: string;
          p_note?: string;
        };
        Returns: {
          adjustments_total: number;
          advance_deduction: number;
          banked_hours: number;
          base_pay: number;
          branch_id: string;
          business_id: string;
          commission: number;
          commission_clawback: number;
          commission_detail: NonNullable<Json>;
          commission_revenue: number;
          cost_shared: boolean;
          created_at: string;
          employee_id: string;
          employee_name: string;
          employer_cost: number;
          fallback_hours: number;
          flags: string[];
          id: string;
          income_tax: number;
          leave_deduction: number;
          net_pay: number;
          overtime_hours: number;
          overtime_pay: number;
          overtime_policy: string | null;
          paid_leave_days: number;
          paid_leave_pay: number;
          pay_type: Database["public"]["Enums"]["pay_type"] | null;
          payment_method: string | null;
          payment_status: string;
          product_commission: number;
          regular_hours: number;
          run_id: string;
          si_employee: number;
          si_employer: number;
          stamp_solidarity: number;
          statutory_configured: boolean;
          total_pay: number;
          unpaid_leave_days: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "payroll_lines";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      add_store_credit: {
        Args: {
          p_amount: number;
          p_customer_id: string;
          p_method?: string;
          p_note?: string;
        };
        Returns: string;
      };
      adjust_stock: {
        Args: {
          p_note?: string;
          p_qty_change: number;
          p_reason?: string;
          p_stock_id: string;
        };
        Returns: {
          branch_id: string;
          business_id: string;
          cost_per_unit: number | null;
          created_at: string;
          id: string;
          product_id: string;
          qty_on_hand: number;
          reorder_threshold: number;
          sku: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "branch_stock";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      adjust_store_credit: {
        Args: { p_customer_id: string; p_delta: number; p_note: string };
        Returns: string;
      };
      admin_add_note: {
        Args: {
          p_body: string;
          p_business_id?: string;
          p_customer_id?: string;
        };
        Returns: string;
      };
      admin_add_placement: {
        Args: {
          p_branch_id: string;
          p_ends_on: string;
          p_note?: string;
          p_offer_id: string;
          p_placement: string;
          p_starts_on: string;
        };
        Returns: string;
      };
      admin_adjust_commission: {
        Args: { p_amount: number; p_business_id: string; p_note: string };
        Returns: string;
      };
      admin_announcement_audience: {
        Args: {
          p_audience: string;
          p_business_id?: string;
          p_customer_id?: string;
        };
        Returns: Json;
      };
      admin_billing_overview: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      admin_cancel_promotion_order: {
        Args: { p_note?: string; p_order_id: string; p_refunded?: boolean };
        Returns: undefined;
      };
      admin_comp_business: {
        Args: { p_business_id: string; p_note?: string; p_until?: string };
        Returns: undefined;
      };
      admin_dashboard: { Args: Record<PropertyKey, never>; Returns: Json };
      admin_delete_note: { Args: { p_id: string }; Returns: undefined };
      admin_delete_review: {
        Args: { p_reason: string; p_review_id: string };
        Returns: Json;
      };
      admin_end_subscription: {
        Args: { p_business_id: string; p_note?: string };
        Returns: undefined;
      };
      admin_get_booking: { Args: { p_booking_id: string }; Returns: Json };
      admin_get_business: { Args: { p_business_id: string }; Returns: Json };
      admin_get_customer: { Args: { p_customer_id: string }; Returns: Json };
      admin_get_settings: { Args: Record<PropertyKey, never>; Returns: Json };
      admin_grant_trial: {
        Args: { p_business_id: string; p_days: number; p_tier?: string };
        Returns: undefined;
      };
      admin_health: { Args: Record<PropertyKey, never>; Returns: Json };
      admin_insights: { Args: { p_days?: number }; Returns: Json };
      admin_list_activity: {
        Args: {
          p_business_id?: string;
          p_limit?: number;
          p_offset?: number;
          p_search?: string;
        };
        Returns: Json;
      };
      admin_list_announcements: { Args: { p_limit?: number }; Returns: Json };
      admin_list_billing_events: {
        Args: { p_business_id?: string; p_limit?: number };
        Returns: Json;
      };
      admin_list_bookings: {
        Args: {
          p_business_id?: string;
          p_from?: string;
          p_limit?: number;
          p_offset?: number;
          p_search?: string;
          p_source?: string;
          p_status?: string;
          p_to?: string;
        };
        Returns: Json;
      };
      admin_list_businesses: {
        Args: {
          p_filter?: string;
          p_limit?: number;
          p_offset?: number;
          p_search?: string;
        };
        Returns: Json;
      };
      admin_list_customers: {
        Args: {
          p_filter?: string;
          p_limit?: number;
          p_offset?: number;
          p_search?: string;
          p_sort?: string;
        };
        Returns: Json;
      };
      admin_list_notes: {
        Args: { p_business_id?: string; p_customer_id?: string };
        Returns: Json;
      };
      admin_list_placements: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      admin_list_promotion_orders: {
        Args: { p_limit?: number; p_status?: string };
        Returns: Json;
      };
      admin_list_reviews: {
        Args: {
          p_limit?: number;
          p_offset?: number;
          p_rating?: string;
          p_replied?: string;
          p_search?: string;
        };
        Returns: Json;
      };
      admin_list_statements: {
        Args: { p_limit?: number; p_status?: string };
        Returns: Json;
      };
      admin_list_tickets: { Args: { p_status?: string }; Returns: Json };
      admin_log_action: {
        Args: {
          p_action: string;
          p_business_id?: string;
          p_details?: Json;
          p_summary: string;
          p_target_id?: string;
          p_target_type?: string;
        };
        Returns: undefined;
      };
      admin_pulse: { Args: Record<PropertyKey, never>; Returns: Json };
      admin_record_manual_payment: {
        Args: {
          p_business_id: string;
          p_extra_seats?: number;
          p_plan_id: string;
          p_reference?: string;
        };
        Returns: string;
      };
      admin_remove_placement: {
        Args: { p_id: string; p_kind: string };
        Returns: undefined;
      };
      admin_run_billing_cycle: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      admin_search: { Args: { p_limit?: number; p_q: string }; Returns: Json };
      admin_send_announcement: {
        Args: {
          p_audience: string;
          p_body: string;
          p_business_id?: string;
          p_customer_id?: string;
          p_title: string;
        };
        Returns: Json;
      };
      admin_set_commission_rate: {
        Args: { p_business_id: string; p_note?: string; p_rate: number };
        Returns: undefined;
      };
      admin_set_extra_seats: {
        Args: { p_business_id: string; p_extra_seats: number };
        Returns: undefined;
      };
      admin_settle_statement: {
        Args: {
          p_method: string;
          p_reference?: string;
          p_statement_id: string;
        };
        Returns: undefined;
      };
      admin_update_settings: { Args: { p_changes: Json }; Returns: Json };
      admin_waive_statement: {
        Args: { p_note?: string; p_statement_id: string };
        Returns: undefined;
      };
      am_i_platform_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      analytics_bookings: {
        Args: { p_branch_id: string; p_from: string; p_to: string };
        Returns: {
          cancelled: number;
          completed: number;
          confirmed: number;
          day: string;
          no_show: number;
          pending: number;
        }[];
      };
      analytics_inventory_cost: {
        Args: { p_branch_id: string; p_from: string; p_to: string };
        Returns: Json;
      };
      analytics_next_up: {
        Args: { p_branch_id: string; p_limit?: number };
        Returns: {
          booking_id: string;
          customer_first_name: string;
          employee_id: string;
          employee_name: string;
          ends_at: string;
          item_id: string;
          service_name: string;
          starts_at: string;
          status: Database["public"]["Enums"]["booking_status"];
        }[];
      };
      analytics_overview: { Args: { p_branch_id: string }; Returns: Json };
      analytics_peak_hours: {
        Args: { p_branch_id: string; p_from: string; p_to: string };
        Returns: {
          bookings: number;
          day_of_week: number;
          hour: number;
        }[];
      };
      analytics_retention: {
        Args: { p_branch_id: string; p_from: string; p_to: string };
        Returns: Json;
      };
      analytics_revenue: {
        Args: { p_branch_id: string; p_from: string; p_to: string };
        Returns: {
          completed_items: number;
          day: string;
          revenue: number;
        }[];
      };
      analytics_service_mix: {
        Args: { p_branch_id: string; p_from: string; p_to: string };
        Returns: {
          completed: number;
          revenue: number;
          service_id: string;
          service_name: string;
        }[];
      };
      analytics_staff_performance: {
        Args: { p_branch_id: string; p_from: string; p_to: string };
        Returns: {
          avg_rating: number;
          cancelled: number;
          completed: number;
          employee_id: string;
          employee_name: string;
          no_show_rate: number;
          no_shows: number;
          revenue: number;
          reviews: number;
        }[];
      };
      analytics_staff_today: {
        Args: { p_branch_id: string };
        Returns: {
          booked_minutes: number;
          bookings: number;
          employee_id: string;
          employee_name: string;
          on_time_off: boolean;
          scheduled_minutes: number;
        }[];
      };
      anonymise_client: { Args: { p_customer_id: string }; Returns: undefined };
      apply_billing_payment: {
        Args: {
          p_amount_minor?: number;
          p_business_id: string;
          p_currency?: string;
          p_event_id: string;
          p_extra_seats?: number;
          p_paid: boolean;
          p_payload: Json;
          p_plan_id: string;
          p_provider: string;
          p_provider_ref: string;
        };
        Returns: string;
      };
      apply_client_template: {
        Args: { p_template: string };
        Returns: undefined;
      };
      apply_commission_payment: {
        Args: {
          p_amount_minor: number;
          p_business_id: string;
          p_currency: string;
          p_event_id: string;
          p_paid: boolean;
          p_payload: Json;
          p_provider: string;
          p_provider_ref: string;
          p_statement_id: string;
        };
        Returns: string;
      };
      apply_discount: {
        Args: {
          p_base_amount: number;
          p_booking_id?: string;
          p_code: string;
          p_customer_id: string;
        };
        Returns: Json;
      };
      apply_leave_policies: { Args: { p_year: number }; Returns: number };
      apply_promotion_payment: {
        Args: {
          p_amount_minor: number;
          p_business_id: string;
          p_currency: string;
          p_event_id: string;
          p_order_id: string;
          p_paid: boolean;
          p_payload: Json;
          p_provider: string;
          p_provider_ref: string;
        };
        Returns: string;
      };
      approve_scheduled_hours: {
        Args: { p_line_id: string; p_note?: string };
        Returns: {
          adjustments_total: number;
          advance_deduction: number;
          banked_hours: number;
          base_pay: number;
          branch_id: string;
          business_id: string;
          commission: number;
          commission_clawback: number;
          commission_detail: NonNullable<Json>;
          commission_revenue: number;
          cost_shared: boolean;
          created_at: string;
          employee_id: string;
          employee_name: string;
          employer_cost: number;
          fallback_hours: number;
          flags: string[];
          id: string;
          income_tax: number;
          leave_deduction: number;
          net_pay: number;
          overtime_hours: number;
          overtime_pay: number;
          overtime_policy: string | null;
          paid_leave_days: number;
          paid_leave_pay: number;
          pay_type: Database["public"]["Enums"]["pay_type"] | null;
          payment_method: string | null;
          payment_status: string;
          product_commission: number;
          regular_hours: number;
          run_id: string;
          si_employee: number;
          si_employer: number;
          stamp_solidarity: number;
          statutory_configured: boolean;
          total_pay: number;
          unpaid_leave_days: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "payroll_lines";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      archive_employee: {
        Args: {
          p_employee_id: string;
          p_last_working_day?: string;
          p_reason?: string;
        };
        Returns: undefined;
      };
      attendance_log: {
        Args: {
          p_branch_id: string;
          p_employee_id?: string;
          p_from: string;
          p_to: string;
        };
        Returns: {
          clock_in: string;
          clock_out: string;
          day: string;
          employee_id: string;
          employee_name: string;
          late_minutes: number;
          left_early_minutes: number;
          needs_review: boolean;
          scheduled_end: string;
          scheduled_minutes: number;
          scheduled_start: string;
          sessions: Json;
          status: string;
          worked_minutes: number;
        }[];
      };
      availability_inputs: {
        Args: {
          p_branch_id: string;
          p_date: string;
          p_employee_id?: string;
          p_service_id: string;
        };
        Returns: Json;
      };
      block_business: {
        Args: { p_branch_id: string };
        Returns: {
          blocked_business_id: string | null;
          blocked_customer_id: string | null;
          created_at: string;
          customer_id: string;
          id: string;
        };
        SetofOptions: {
          from: "*";
          to: "customer_blocks";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      block_reviewer: {
        Args: { p_review_id: string };
        Returns: {
          blocked_business_id: string | null;
          blocked_customer_id: string | null;
          created_at: string;
          customer_id: string;
          id: string;
        };
        SetofOptions: {
          from: "*";
          to: "customer_blocks";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      can_switch_to_plan: { Args: { p_plan_id: string }; Returns: Json };
      cancel_advance: { Args: { p_advance_id: string }; Returns: undefined };
      cancel_campaign: { Args: { p_campaign_id: string }; Returns: undefined };
      cancel_client_package: {
        Args: { p_client_package_id: string; p_refund_to_credit?: boolean };
        Returns: number;
      };
      cancel_promotion_order: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
      cancel_time_off: { Args: { p_request_id: string }; Returns: undefined };
      claim_open_shift: { Args: { p_shift_id: string }; Returns: undefined };
      claim_pending_emails: { Args: { p_limit?: number }; Returns: Json };
      claim_pending_pushes: { Args: { p_limit?: number }; Returns: Json };
      clock_in: {
        Args: { p_branch_id: string };
        Returns: {
          at: string;
          auto_closed: boolean;
          branch_id: string;
          business_id: string;
          created_at: string;
          created_by: string | null;
          employee_id: string;
          id: string;
          kind: Database["public"]["Enums"]["attendance_kind"];
          note: string | null;
          source: Database["public"]["Enums"]["attendance_source"];
        };
        SetofOptions: {
          from: "*";
          to: "attendance_events";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      clock_out: {
        Args: Record<PropertyKey, never>;
        Returns: {
          at: string;
          auto_closed: boolean;
          branch_id: string;
          business_id: string;
          created_at: string;
          created_by: string | null;
          employee_id: string;
          id: string;
          kind: Database["public"]["Enums"]["attendance_kind"];
          note: string | null;
          source: Database["public"]["Enums"]["attendance_source"];
        };
        SetofOptions: {
          from: "*";
          to: "attendance_events";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      close_business: { Args: { p_confirm_name: string }; Returns: Json };
      complete_client_task: {
        Args: { p_done?: boolean; p_task_id: string };
        Returns: undefined;
      };
      copy_branch_setup: {
        Args: { p_from_branch_id: string; p_to_branch_id: string };
        Returns: Json;
      };
      copy_employee_permissions: {
        Args: {
          p_employee_id: string;
          p_from_branch_id: string;
          p_to_branch_ids: string[];
        };
        Returns: undefined;
      };
      copy_rota_week: {
        Args: {
          p_branch_id: string;
          p_from_monday: string;
          p_to_monday: string;
        };
        Returns: number;
      };
      correct_stock_cost: {
        Args: { p_note?: string; p_stock_id: string; p_unit_cost: number };
        Returns: {
          branch_id: string;
          business_id: string;
          cost_per_unit: number | null;
          created_at: string;
          id: string;
          product_id: string;
          qty_on_hand: number;
          reorder_threshold: number;
          sku: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "branch_stock";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      count_stock: {
        Args: {
          p_counted: number;
          p_note?: string;
          p_reason?: string;
          p_stock_id: string;
        };
        Returns: {
          branch_id: string;
          business_id: string;
          cost_per_unit: number | null;
          created_at: string;
          id: string;
          product_id: string;
          qty_on_hand: number;
          reorder_threshold: number;
          sku: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "branch_stock";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_booking: {
        Args: {
          p_actor_user_id: string;
          p_branch_id: string;
          p_customer_note?: string;
          p_items: Json;
          p_walk_in?: Json;
        };
        Returns: Json;
      };
      create_branch: { Args: { p_branch: Json }; Returns: string };
      create_business: {
        Args: {
          p_branch: Json;
          p_category_ids: string[];
          p_name: string;
          p_owner?: Json;
        };
        Returns: Json;
      };
      create_client: {
        Args: {
          p_branch_id: string;
          p_date_of_birth?: string;
          p_email?: string;
          p_first_name: string;
          p_gender?: Database["public"]["Enums"]["gender"];
          p_last_name?: string;
          p_phone?: string;
        };
        Returns: string;
      };
      create_payroll_run: {
        Args: {
          p_branch_id: string;
          p_period_end: string;
          p_period_start: string;
        };
        Returns: string;
      };
      create_promotion_order: {
        Args: {
          p_branch_id: string;
          p_days: number;
          p_offer_id: string;
          p_placement: string;
          p_starts_on: string;
        };
        Returns: Json;
      };
      create_segment_tasks: {
        Args: { p_segment_id: string; p_title: string };
        Returns: number;
      };
      create_staff_member: {
        Args: {
          p_branch_ids: string[];
          p_first_name: string;
          p_hire_date?: string;
          p_job_title?: string;
          p_last_name?: string;
          p_phone?: string;
        };
        Returns: string;
      };
      decide_advance: {
        Args: { p_advance_id: string; p_approve: boolean; p_note?: string };
        Returns: undefined;
      };
      decide_shift_swap: {
        Args: { p_approve: boolean; p_swap_id: string };
        Returns: undefined;
      };
      decide_time_off: {
        Args: {
          p_approve: boolean;
          p_override?: boolean;
          p_reason?: string;
          p_request_id: string;
        };
        Returns: undefined;
      };
      delete_attendance_event: {
        Args: { p_event_id: string; p_reason?: string };
        Returns: undefined;
      };
      delete_client_note: { Args: { p_note_id: string }; Returns: undefined };
      delete_customer_account: { Args: { p_user_id: string }; Returns: Json };
      delete_document: {
        Args: { p_document_id: string; p_reason?: string };
        Returns: undefined;
      };
      delete_goal: { Args: { p_goal_id: string }; Returns: undefined };
      delete_message_template: {
        Args: { p_template_id: string };
        Returns: undefined;
      };
      delete_partner_account: { Args: { p_user_id: string }; Returns: Json };
      delete_payroll_rule_set: { Args: { p_id: string }; Returns: undefined };
      delete_payroll_run: { Args: { p_run_id: string }; Returns: undefined };
      delete_product_sale: { Args: { p_id: string }; Returns: undefined };
      delete_report_schedule: { Args: { p_id: string }; Returns: undefined };
      delete_rota_shift: { Args: { p_id: string }; Returns: undefined };
      delete_shift_template: { Args: { p_id: string }; Returns: undefined };
      delete_training: { Args: { p_id: string }; Returns: undefined };
      distribute_tips: {
        Args: { p_rule: string; p_run_id: string; p_total: number };
        Returns: number;
      };
      export_clients: {
        Args: { p_branch_id?: string };
        Returns: {
          acquired_at: string;
          date_of_birth: string;
          email: string;
          first_name: string;
          first_source: string;
          gender: Database["public"]["Enums"]["gender"];
          last_name: string;
          last_visit_at: string;
          lifecycle: string;
          phone: string;
          spend: number;
          tags: string[];
          visits: number;
        }[];
      };
      export_segment: {
        Args: { p_segment_id: string };
        Returns: {
          email: string;
          first_name: string;
          last_name: string;
          last_visit_at: string;
          lifecycle: string;
          phone: string;
          spend: number;
          tags: string[];
          visits: number;
        }[];
      };
      find_duplicate_clients: {
        Args: Record<PropertyKey, never>;
        Returns: {
          clients: Json;
          phone_digits: string;
        }[];
      };
      forget_push_tokens: { Args: { p_tokens: string[] }; Returns: number };
      get_automations: {
        Args: Record<PropertyKey, never>;
        Returns: {
          body_ar: string;
          body_en: string;
          channel: string;
          delay_hours: number;
          enabled: boolean;
          key: string;
          last_sent_at: string;
          rebooked_30d: number;
          sent_30d: number;
          title_ar: string;
          title_en: string;
        }[];
      };
      get_branch_closure_impact: {
        Args: { p_branch_id: string };
        Returns: Json;
      };
      get_branch_customers: {
        Args: { p_branch_id: string; p_customer_ids?: string[] };
        Returns: {
          avatar_path: string;
          customer_id: string;
          first_name: string;
          last_name: string;
          phone: string;
        }[];
      };
      get_branch_reviews: {
        Args: { p_branch_id: string; p_limit?: number };
        Returns: {
          booking_id: string;
          comment: string;
          created_at: string;
          customer_id: string;
          customer_name: string;
          id: string;
          open_task_id: string;
          rating: number;
          replied_at: string;
          reply: string;
          reviewer_name: string;
          services: string[];
          staff: string[];
          visited_at: string;
        }[];
      };
      get_branch_team: {
        Args: { p_branch_id: string };
        Returns: {
          avatar_path: string;
          bio: string;
          employee_id: string;
          first_name: string;
          job_title: string;
          last_name: string;
          service_ids: string[];
        }[];
      };
      get_broadcasts: {
        Args: Record<PropertyKey, never>;
        Returns: {
          audience_count: number;
          body: string;
          created_at: string;
          id: string;
          segment_id: string;
          segment_name: string;
          sent_by_name: string;
          title: string;
        }[];
      };
      get_business_clients: {
        Args: {
          p_branch_id?: string;
          p_lifecycle?: string;
          p_limit?: number;
          p_offset?: number;
          p_search?: string;
          p_sort?: string;
          p_source?: string;
          p_tag?: string;
        };
        Returns: {
          acquired_at: string;
          alert: string;
          avg_spend: number;
          cancelled: number;
          created_at: string;
          customer_id: string;
          days_since_last: number;
          editable: boolean;
          email: string;
          expected_interval_days: number;
          first_name: string;
          first_source: string;
          has_app: boolean;
          last_name: string;
          last_visit_at: string;
          lifecycle: string;
          next_booking_at: string;
          no_shows: number;
          overdue_days: number;
          phone: string;
          rewards_ready: number;
          spend: number;
          tags: string[];
          total_count: number;
          visits: number;
        }[];
      };
      get_campaigns: {
        Args: Record<PropertyKey, never>;
        Returns: {
          audience_count: number;
          body: string;
          channel: string;
          created_at: string;
          delivered: number;
          id: string;
          read: number;
          rebooked: number;
          scheduled_at: string;
          segment_id: string;
          segment_name: string;
          sent_at: string;
          sent_by_name: string;
          skipped: number;
          status: string;
          template_id: string;
          title: string;
        }[];
      };
      get_channel_status: { Args: Record<PropertyKey, never>; Returns: Json };
      get_checklist: {
        Args: { p_employee_id: string; p_kind: string };
        Returns: Json;
      };
      get_client_fields: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          key: string;
          label: string;
          label_ar: string;
          options: string[];
          position: number;
          template: string;
          type: string;
        }[];
      };
      get_client_ledger: {
        Args: { p_customer_id: string; p_limit?: number };
        Returns: {
          booking_id: string;
          by_name: string;
          cash_amount: number;
          created_at: string;
          credit_delta: number;
          id: string;
          kind: string;
          meta: Json;
          method: string;
          note: string;
        }[];
      };
      get_client_money: { Args: { p_customer_id: string }; Returns: Json };
      get_client_notes: {
        Args: { p_customer_id: string };
        Returns: {
          author_id: string;
          author_name: string;
          body: string;
          created_at: string;
          id: string;
        }[];
      };
      get_client_packages: {
        Args: { p_customer_id: string };
        Returns: {
          created_at: string;
          expires_at: string;
          id: string;
          name: string;
          price_paid: number;
          sessions_remaining: number;
          sessions_total: number;
          status: string;
        }[];
      };
      get_client_profile: { Args: { p_customer_id: string }; Returns: Json };
      get_client_tags: {
        Args: Record<PropertyKey, never>;
        Returns: {
          clients: number;
          tag: string;
        }[];
      };
      get_client_tasks: {
        Args: { p_customer_id?: string; p_include_done?: boolean };
        Returns: {
          created_at: string;
          customer_id: string;
          customer_name: string;
          done_at: string;
          due_at: string;
          id: string;
          kind: string;
          title: string;
        }[];
      };
      get_client_timeline: {
        Args: { p_before?: string; p_customer_id: string; p_limit?: number };
        Returns: {
          branch_id: string;
          data: Json;
          id: string;
          kind: string;
          occurred_at: string;
          ref_id: string;
        }[];
      };
      get_clients: {
        Args: {
          p_branch_id: string;
          p_limit?: number;
          p_offset?: number;
          p_search?: string;
        };
        Returns: {
          created_at: string;
          customer_id: string;
          date_of_birth: string;
          editable: boolean;
          email: string;
          first_name: string;
          gender: Database["public"]["Enums"]["gender"];
          has_app: boolean;
          last_name: string;
          phone: string;
          total_count: number;
        }[];
      };
      get_commission_lines: {
        Args: { p_statement_id?: string };
        Returns: {
          accrued_at: string;
          amount: number;
          booking_id: string;
          booking_starts_at: string;
          booking_total: number;
          currency: string;
          customer_first_name: string;
          entry_id: string;
          kind: Database["public"]["Enums"]["commission_entry_kind"];
          note: string;
          rate: number;
        }[];
      };
      get_crm_actions: { Args: Record<PropertyKey, never>; Returns: Json };
      get_crm_audit: {
        Args: { p_limit?: number };
        Returns: {
          action: string;
          actor_name: string;
          created_at: string;
          customer_id: string;
          details: Json;
          id: string;
        }[];
      };
      get_crm_insights: {
        Args: { p_branch_id?: string; p_months?: number };
        Returns: Json;
      };
      get_crm_settings: { Args: Record<PropertyKey, never>; Returns: Json };
      get_discounts: {
        Args: Record<PropertyKey, never>;
        Returns: {
          active: boolean;
          amount_off: number;
          code: string;
          id: string;
          kind: string;
          max_uses: number;
          min_spend: number;
          name: string;
          per_client_limit: number;
          segment_id: string;
          service_id: string;
          uses: number;
          valid_from: string;
          valid_to: string;
          value: number;
        }[];
      };
      get_employee_permissions: {
        Args: { p_employee_id: string };
        Returns: Json;
      };
      get_employee_private: {
        Args: { p_employee_id: string; p_reveal?: boolean };
        Returns: Json;
      };
      get_employee_profile: { Args: { p_employee_id: string }; Returns: Json };
      get_former_employee: { Args: { p_employee_id: string }; Returns: Json };
      get_gift_cards: {
        Args: { p_status?: string };
        Returns: {
          balance: number;
          buyer_name: string;
          code: string;
          created_at: string;
          expires_at: string;
          id: string;
          initial_amount: number;
          recipient_name: string;
          status: string;
        }[];
      };
      get_hours_change_impact: {
        Args: { p_branch_id: string; p_hours: Json };
        Returns: Json;
      };
      get_hr_settings: {
        Args: Record<PropertyKey, never>;
        Returns: {
          allow_early_payroll: boolean;
          auto_close_after_minutes: number | null;
          business_id: string;
          creator_cannot_approve: boolean;
          late_grace_minutes: number;
          max_daily_hours: number;
          max_deduction_pct: number | null;
          max_weekly_hours: number;
          min_session_minutes: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "hr_settings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      get_invite_preview: { Args: { p_token: string }; Returns: Json };
      get_invite_status: { Args: { p_employee_id: string }; Returns: Json };
      get_loyalty_members: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string };
        Returns: {
          card_id: string;
          customer_name: string;
          last_activity_at: string;
          rewards_available: number;
          rewards_redeemed: number;
          stamps: number;
          stamps_total: number;
          total_count: number;
        }[];
      };
      get_loyalty_program: { Args: Record<PropertyKey, never>; Returns: Json };
      get_loyalty_tiers: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          min_stamps_total: number;
          name: string;
          perk: string;
        }[];
      };
      get_message_templates: {
        Args: Record<PropertyKey, never>;
        Returns: {
          body: string;
          channel: string;
          id: string;
          is_system: boolean;
          key: string;
          language: string;
          name: string;
          title: string;
        }[];
      };
      get_my_billing: { Args: Record<PropertyKey, never>; Returns: Json };
      get_my_blocks: {
        Args: never;
        Returns: {
          block_id: string;
          branch_ids: string[];
          created_at: string;
          kind: string;
          name: string;
        }[];
      };
      get_my_commission: { Args: Record<PropertyKey, never>; Returns: Json };
      get_my_loyalty_cards: { Args: Record<PropertyKey, never>; Returns: Json };
      get_my_partner_context: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_my_promotions: { Args: Record<PropertyKey, never>; Returns: Json };
      get_my_queue_ticket: {
        Args: { p_booking_id: string };
        Returns: {
          ahead: number;
          called_at: string;
          due_at: string;
          employee_name: string;
          status: Database["public"]["Enums"]["queue_ticket_status"];
          ticket_id: string;
          ticket_number: number;
        }[];
      };
      get_packages: {
        Args: { p_include_archived?: boolean };
        Returns: {
          active: boolean;
          description: string;
          id: string;
          name: string;
          price: number;
          service_id: string;
          service_name: string;
          sessions: number;
          sold: number;
          validity_days: number;
        }[];
      };
      get_queue: {
        Args: { p_branch_id: string };
        Returns: {
          booking_id: string;
          call_place: number;
          called_at: string;
          customer_name: string;
          due_at: string;
          employee_id: string;
          employee_name: string;
          finished_at: string;
          issued_at: string;
          served_by: string;
          served_by_name: string;
          status: Database["public"]["Enums"]["queue_ticket_status"];
          ticket_id: string;
          ticket_number: number;
        }[];
      };
      get_queue_expected: {
        Args: { p_branch_id: string };
        Returns: {
          booking_id: string;
          customer_name: string;
          employee_id: string;
          employee_name: string;
          ends_at: string;
          services: string;
          starts_at: string;
          status: Database["public"]["Enums"]["booking_status"];
        }[];
      };
      get_review_stats: {
        Args: { p_branch_id: string };
        Returns: {
          average_rating: number;
          rating_distribution: Json;
          total_reviews: number;
        }[];
      };
      get_segment_audience: {
        Args: { p_segment_id: string };
        Returns: {
          customer_id: string;
          email: string;
          first_name: string;
          has_app: boolean;
          last_name: string;
          last_visit_at: string;
          lifecycle: string;
          phone: string;
          push_ok: boolean;
          sms_ok: boolean;
          spend: number;
          tags: string[];
          visits: number;
          whatsapp_ok: boolean;
        }[];
      };
      get_segment_members: {
        Args: { p_segment_id: string };
        Returns: {
          customer_id: string;
          email: string;
          first_name: string;
          last_name: string;
          last_visit_days: number;
          lifetime_spend: number;
          phone: string;
          visit_count: number;
        }[];
      };
      get_segments: { Args: Record<PropertyKey, never>; Returns: Json };
      get_service_coverage: {
        Args: { p_branch_id: string };
        Returns: {
          providers: number;
          service_id: string;
          service_name: string;
        }[];
      };
      get_time_off_balance: {
        Args: { p_employee_id: string; p_year?: number };
        Returns: {
          approved: number;
          entitled: number;
          leave_type: Database["public"]["Enums"]["leave_type"];
          pending: number;
          remaining: number;
        }[];
      };
      hire_candidate: {
        Args: {
          p_branch_ids: string[];
          p_candidate_id: string;
          p_hire_date: string;
          p_job_title?: string;
        };
        Returns: string;
      };
      hr_report_attendance: {
        Args: { p_branch_id: string; p_from: string; p_to: string };
        Returns: {
          absent_days: number;
          employee_name: string;
          late_days: number;
          late_minutes: number;
          scheduled_days: number;
          worked_minutes: number;
        }[];
      };
      hr_report_commission: {
        Args: { p_from: string; p_to: string };
        Returns: {
          clawback: number;
          commission: number;
          employee_name: string;
          month: string;
          net_commission: number;
        }[];
      };
      hr_report_document_expiry: {
        Args: { p_days?: number };
        Returns: {
          category: Database["public"]["Enums"]["document_category"];
          days_left: number;
          document_name: string;
          employee_name: string;
          expires_on: string;
        }[];
      };
      hr_report_headcount: {
        Args: Record<PropertyKey, never>;
        Returns: {
          branch_name: string;
          department: string;
          employment_type: string;
          people: number;
        }[];
      };
      hr_report_leave_liability: {
        Args: { p_year?: number };
        Returns: {
          daily_rate: number;
          employee_name: string;
          liability: number;
          remaining_days: number;
        }[];
      };
      hr_report_overtime: {
        Args: { p_from: string; p_to: string };
        Returns: {
          banked_hours: number;
          employee_name: string;
          overtime_hours: number;
          overtime_pay: number;
        }[];
      };
      hr_report_payroll_cost: {
        Args: { p_from: string; p_to: string };
        Returns: {
          branch_name: string;
          department: string;
          employer_cost: number;
          gross: number;
          net: number;
          people: number;
        }[];
      };
      hr_report_turnover: {
        Args: { p_months?: number };
        Returns: {
          headcount_end: number;
          joined: number;
          left_count: number;
          month: string;
        }[];
      };
      import_clients: {
        Args: { p_branch_id: string; p_rows: Json };
        Returns: Json;
      };
      invite_employee: {
        Args: {
          p_branch_ids: string[];
          p_email?: string;
          p_first_name: string;
          p_job_title?: string;
          p_last_name?: string;
          p_phone?: string;
        };
        Returns: Json;
      };
      join_loyalty_program: { Args: { p_join_code: string }; Returns: Json };
      leave_encashment: { Args: { p_employee_id: string }; Returns: Json };
      list_advances: {
        Args: { p_employee_id?: string };
        Returns: {
          amount: number;
          created_at: string;
          decision_note: string;
          deducted: number;
          employee_id: string;
          employee_name: string;
          first_month: string;
          id: string;
          installments: number;
          reason: string;
          remaining: number;
          status: string;
        }[];
      };
      list_candidates: {
        Args: { p_opening_id?: string };
        Returns: {
          created_at: string;
          email: string;
          hired_employee_id: string;
          id: string;
          name: string;
          notes: string;
          opening_id: string;
          opening_title: string;
          phone: string;
          stage: string;
        }[];
      };
      list_deleted_documents: {
        Args: Record<PropertyKey, never>;
        Returns: {
          category: Database["public"]["Enums"]["document_category"];
          delete_reason: string;
          deleted_at: string;
          deleted_by_name: string;
          employee_id: string;
          id: string;
          name: string;
          owner_name: string;
          restorable_until: string;
        }[];
      };
      list_former_employees: {
        Args: Record<PropertyKey, never>;
        Returns: {
          archive_reason: string;
          archived_at: string;
          hire_date: string;
          id: string;
          job_title: string;
          last_working_day: string;
          name: string;
        }[];
      };
      list_goals: {
        Args: { p_employee_id: string };
        Returns: {
          actual: number;
          id: string;
          kpi: string;
          manual: boolean;
          period_end: string;
          period_start: string;
          target: number;
          title: string;
        }[];
      };
      list_hr_audit: {
        Args: { p_employee_id?: string; p_limit?: number };
        Returns: {
          action: string;
          actor_name: string;
          created_at: string;
          details: Json;
          entity: string;
          id: string;
          subject_name: string;
        }[];
      };
      list_hr_records: {
        Args: { p_employee_id: string };
        Returns: {
          acknowledged_at: string;
          details: string;
          id: string;
          issued_by_name: string;
          issued_on: string;
          kind: string;
          title: string;
        }[];
      };
      list_hr_reminders: {
        Args: Record<PropertyKey, never>;
        Returns: {
          days_left: number;
          due_on: string;
          employee_id: string;
          employee_name: string;
          kind: string;
          label: string;
        }[];
      };
      list_invites: {
        Args: Record<PropertyKey, never>;
        Returns: {
          created_at: string;
          email: string;
          employee_id: string;
          expires_at: string;
          job_title: string;
          name: string;
          phone: string;
          status: string;
        }[];
      };
      list_job_openings: {
        Args: Record<PropertyKey, never>;
        Returns: {
          branch_id: string;
          branch_name: string;
          candidates: number;
          created_at: string;
          description: string;
          id: string;
          status: string;
          title: string;
        }[];
      };
      list_one_on_ones: {
        Args: { p_employee_id: string };
        Returns: {
          author_name: string;
          held_on: string;
          id: string;
          notes: string;
        }[];
      };
      list_product_sales: {
        Args: { p_branch_id: string; p_from: string; p_to: string };
        Returns: {
          amount: number;
          employee_id: string;
          employee_name: string;
          id: string;
          note: string;
          product_name: string;
          sold_on: string;
        }[];
      };
      list_report_schedules: {
        Args: Record<PropertyKey, never>;
        Returns: {
          frequency: string;
          id: string;
          last_sent_on: string;
          recipients: number;
          report: string;
        }[];
      };
      list_reviews: {
        Args: { p_employee_id?: string };
        Returns: {
          cycle_name: string;
          due_on: string;
          employee_id: string;
          employee_name: string;
          id: string;
          kind: string;
          manager_name: string;
          manager_notes: string;
          manager_rating: number;
          self_notes: string;
          self_rating: number;
          status: string;
        }[];
      };
      list_trainings: {
        Args: { p_employee_id: string };
        Returns: {
          completed_on: string;
          document_id: string;
          document_name: string;
          expires_on: string;
          id: string;
          name: string;
          provider: string;
          status: string;
        }[];
      };
      lookup_loyalty_card: { Args: { p_code: string }; Returns: Json };
      mark_email_failed: {
        Args: { p_error: string; p_id: string };
        Returns: undefined;
      };
      mark_email_sent: {
        Args: { p_id: string; p_provider_id: string };
        Returns: undefined;
      };
      mark_messages_read: { Args: { p_booking_id: string }; Returns: number };
      merge_clients: {
        Args: { p_keep: string; p_remove: string };
        Returns: undefined;
      };
      move_candidate: {
        Args: { p_id: string; p_stage: string };
        Returns: undefined;
      };
      my_month_summary: {
        Args: { p_from: string; p_to: string };
        Returns: Json;
      };
      payroll_business_summary: {
        Args: { p_from: string; p_to: string };
        Returns: {
          base_pay: number;
          branches: number;
          employee_id: string;
          employee_name: string;
          run_ids: string[];
          total_pay: number;
        }[];
      };
      payroll_cost_by_month: {
        Args: { p_months?: number };
        Returns: {
          branch_id: string;
          branch_name: string;
          employer_cost: number;
          gross: number;
          month: string;
          net: number;
          people: number;
        }[];
      };
      payroll_payment_batch: {
        Args: { p_run_id: string };
        Returns: {
          account: string;
          bank_name: string;
          employee_name: string;
          line_id: string;
          net_pay: number;
          payment_method: string;
          payment_status: string;
          wallet: string;
        }[];
      };
      pending_approvers: {
        Args: Record<PropertyKey, never>;
        Returns: {
          approver_id: string;
          approver_name: string;
          request_id: string;
        }[];
      };
      performance_staff: {
        Args: { p_branch_id: string; p_from: string; p_to: string };
        Returns: {
          avg_rating: number;
          booked_minutes: number;
          cancelled: number;
          completed: number;
          employee_id: string;
          employee_name: string;
          no_show_rate: number;
          no_shows: number;
          revenue: number;
          reviews: number;
          scheduled_minutes: number;
          utilisation: number;
        }[];
      };
      preview_time_off: {
        Args: {
          p_ends_on: string;
          p_leave_type: Database["public"]["Enums"]["leave_type"];
          p_starts_on: string;
        };
        Returns: Json;
      };
      publish_rota: {
        Args: { p_branch_id: string; p_week_start: string };
        Returns: number;
      };
      queue_call: {
        Args: {
          p_branch_id: string;
          p_employee_id?: string;
          p_ticket_id?: string;
        };
        Returns: {
          booking_id: string | null;
          branch_id: string;
          business_id: string;
          called_at: string | null;
          called_by: string | null;
          customer_id: string | null;
          customer_name: string | null;
          due_at: string | null;
          employee_id: string | null;
          finished_at: string | null;
          id: string;
          issued_at: string;
          issued_by: string | null;
          number: number;
          queue_date: string;
          served_by: string | null;
          status: Database["public"]["Enums"]["queue_ticket_status"];
        };
        SetofOptions: {
          from: "*";
          to: "queue_tickets";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      queue_check_in_booking: {
        Args: { p_booking_id: string };
        Returns: {
          booking_id: string | null;
          branch_id: string;
          business_id: string;
          called_at: string | null;
          called_by: string | null;
          customer_id: string | null;
          customer_name: string | null;
          due_at: string | null;
          employee_id: string | null;
          finished_at: string | null;
          id: string;
          issued_at: string;
          issued_by: string | null;
          number: number;
          queue_date: string;
          served_by: string | null;
          status: Database["public"]["Enums"]["queue_ticket_status"];
        };
        SetofOptions: {
          from: "*";
          to: "queue_tickets";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      queue_customer_check_in: {
        Args: {
          p_booking_id: string;
          p_latitude?: number;
          p_longitude?: number;
        };
        Returns: {
          booking_id: string | null;
          branch_id: string;
          business_id: string;
          called_at: string | null;
          called_by: string | null;
          customer_id: string | null;
          customer_name: string | null;
          due_at: string | null;
          employee_id: string | null;
          finished_at: string | null;
          id: string;
          issued_at: string;
          issued_by: string | null;
          number: number;
          queue_date: string;
          served_by: string | null;
          status: Database["public"]["Enums"]["queue_ticket_status"];
        };
        SetofOptions: {
          from: "*";
          to: "queue_tickets";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      queue_finish: {
        Args: {
          p_status: Database["public"]["Enums"]["queue_ticket_status"];
          p_ticket_id: string;
        };
        Returns: {
          booking_id: string | null;
          branch_id: string;
          business_id: string;
          called_at: string | null;
          called_by: string | null;
          customer_id: string | null;
          customer_name: string | null;
          due_at: string | null;
          employee_id: string | null;
          finished_at: string | null;
          id: string;
          issued_at: string;
          issued_by: string | null;
          number: number;
          queue_date: string;
          served_by: string | null;
          status: Database["public"]["Enums"]["queue_ticket_status"];
        };
        SetofOptions: {
          from: "*";
          to: "queue_tickets";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      queue_issue_ticket: {
        Args: { p_branch_id: string; p_customer_name?: string };
        Returns: {
          booking_id: string | null;
          branch_id: string;
          business_id: string;
          called_at: string | null;
          called_by: string | null;
          customer_id: string | null;
          customer_name: string | null;
          due_at: string | null;
          employee_id: string | null;
          finished_at: string | null;
          id: string;
          issued_at: string;
          issued_by: string | null;
          number: number;
          queue_date: string;
          served_by: string | null;
          status: Database["public"]["Enums"]["queue_ticket_status"];
        };
        SetofOptions: {
          from: "*";
          to: "queue_tickets";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      quote_plan_checkout: {
        Args: { p_extra_seats?: number; p_plan_id: string };
        Returns: Json;
      };
      quote_promotion: {
        Args: {
          p_branch_id: string;
          p_days: number;
          p_offer_id: string;
          p_placement: string;
          p_starts_on: string;
        };
        Returns: Json;
      };
      rate_limit_hit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number };
        Returns: boolean;
      };
      recalculate_payroll_run: {
        Args: { p_run_id: string };
        Returns: undefined;
      };
      record_payment: {
        Args: {
          p_amount: number;
          p_booking_id?: string;
          p_branch_id?: string;
          p_customer_id: string;
          p_method: string;
          p_note?: string;
          p_use_credit?: number;
        };
        Returns: string;
      };
      record_product_sale: {
        Args: {
          p_amount: number;
          p_branch_id: string;
          p_employee_id: string;
          p_note?: string;
          p_product_id?: string;
          p_product_name: string;
          p_sold_on?: string;
        };
        Returns: string;
      };
      redeem_gift_card: {
        Args: { p_amount?: number; p_code: string; p_customer_id: string };
        Returns: number;
      };
      redeem_loyalty_reward: {
        Args: { p_branch_id: string; p_code: string };
        Returns: Json;
      };
      regenerate_invite: { Args: { p_employee_id: string }; Returns: Json };
      register_push_token: {
        Args: {
          p_app: Database["public"]["Enums"]["app_kind"];
          p_platform: Database["public"]["Enums"]["device_platform"];
          p_token: string;
        };
        Returns: undefined;
      };
      remove_company_holiday: {
        Args: { p_branch_id?: string; p_date: string };
        Returns: undefined;
      };
      remove_payroll_adjustment: {
        Args: { p_adjustment_id: string };
        Returns: {
          adjustments_total: number;
          advance_deduction: number;
          banked_hours: number;
          base_pay: number;
          branch_id: string;
          business_id: string;
          commission: number;
          commission_clawback: number;
          commission_detail: NonNullable<Json>;
          commission_revenue: number;
          cost_shared: boolean;
          created_at: string;
          employee_id: string;
          employee_name: string;
          employer_cost: number;
          fallback_hours: number;
          flags: string[];
          id: string;
          income_tax: number;
          leave_deduction: number;
          net_pay: number;
          overtime_hours: number;
          overtime_pay: number;
          overtime_policy: string | null;
          paid_leave_days: number;
          paid_leave_pay: number;
          pay_type: Database["public"]["Enums"]["pay_type"] | null;
          payment_method: string | null;
          payment_status: string;
          product_commission: number;
          regular_hours: number;
          run_id: string;
          si_employee: number;
          si_employer: number;
          stamp_solidarity: number;
          statutory_configured: boolean;
          total_pay: number;
          unpaid_leave_days: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "payroll_lines";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      render_candidate_offer: {
        Args: {
          p_candidate_id: string;
          p_lang?: string;
          p_start_date?: string;
        };
        Returns: string;
      };
      render_document_template: {
        Args: { p_employee_id: string; p_key: string; p_lang?: string };
        Returns: string;
      };
      reply_to_review: {
        Args: { p_reply: string; p_review_id: string };
        Returns: undefined;
      };
      request_advance: {
        Args: {
          p_amount: number;
          p_employee_id?: string;
          p_first_month: string;
          p_installments: number;
          p_reason?: string;
        };
        Returns: string;
      };
      request_document_signature: {
        Args: { p_document_id: string };
        Returns: {
          business_id: string;
          category: Database["public"]["Enums"]["document_category"];
          created_at: string;
          delete_reason: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          employee_id: string | null;
          expires_on: string | null;
          file_path: string;
          id: string;
          name: string;
          sign_status: Database["public"]["Enums"]["document_sign_status"];
          signature_requested_at: string | null;
          signed_at: string | null;
          source: string;
          updated_at: string;
          uploaded_by: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "employee_documents";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      request_shift_swap: {
        Args: { p_shift_id: string; p_target_id: string };
        Returns: string;
      };
      request_time_off: {
        Args: {
          p_allow_exceed?: boolean;
          p_attachment_path?: string;
          p_ends_on: string;
          p_half_day?: boolean;
          p_hours?: number;
          p_leave_type: Database["public"]["Enums"]["leave_type"];
          p_note?: string;
          p_starts_on: string;
        };
        Returns: string;
      };
      reschedule_booking_item: {
        Args: {
          p_actor_user_id: string;
          p_employee_id?: string;
          p_item_id: string;
          p_starts_at: string;
        };
        Returns: Json;
      };
      reset_loyalty_join_code: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      resolve_payroll_flag: {
        Args: { p_flag: string; p_line_id: string };
        Returns: {
          adjustments_total: number;
          advance_deduction: number;
          banked_hours: number;
          base_pay: number;
          branch_id: string;
          business_id: string;
          commission: number;
          commission_clawback: number;
          commission_detail: NonNullable<Json>;
          commission_revenue: number;
          cost_shared: boolean;
          created_at: string;
          employee_id: string;
          employee_name: string;
          employer_cost: number;
          fallback_hours: number;
          flags: string[];
          id: string;
          income_tax: number;
          leave_deduction: number;
          net_pay: number;
          overtime_hours: number;
          overtime_pay: number;
          overtime_policy: string | null;
          paid_leave_days: number;
          paid_leave_pay: number;
          pay_type: Database["public"]["Enums"]["pay_type"] | null;
          payment_method: string | null;
          payment_status: string;
          product_commission: number;
          regular_hours: number;
          run_id: string;
          si_employee: number;
          si_employer: number;
          stamp_solidarity: number;
          statutory_configured: boolean;
          total_pay: number;
          unpaid_leave_days: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "payroll_lines";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      respond_shift_swap: {
        Args: { p_accept: boolean; p_swap_id: string };
        Returns: undefined;
      };
      restock_product: {
        Args: {
          p_note?: string;
          p_qty: number;
          p_stock_id: string;
          p_supplier?: string;
          p_unit_cost?: number;
        };
        Returns: {
          branch_id: string;
          business_id: string;
          cost_per_unit: number | null;
          created_at: string;
          id: string;
          product_id: string;
          qty_on_hand: number;
          reorder_threshold: number;
          sku: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "branch_stock";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      restore_document: { Args: { p_document_id: string }; Returns: undefined };
      revoke_invite: { Args: { p_employee_id: string }; Returns: undefined };
      save_automation: {
        Args: {
          p_body_ar?: string;
          p_body_en?: string;
          p_channel?: string;
          p_delay_hours?: number;
          p_enabled: boolean;
          p_key: string;
          p_title_ar?: string;
          p_title_en?: string;
        };
        Returns: undefined;
      };
      save_candidate: {
        Args: {
          p_email: string;
          p_id?: string;
          p_name: string;
          p_notes: string;
          p_opening_id: string;
          p_phone: string;
        };
        Returns: string;
      };
      save_client_fields: { Args: { p_fields: Json }; Returns: undefined };
      save_commission_rules: {
        Args: { p_rules: Json; p_tiers: Json };
        Returns: undefined;
      };
      save_crm_settings: { Args: { p_settings: Json }; Returns: undefined };
      save_discount: {
        Args: {
          p_active?: boolean;
          p_code: string;
          p_discount_id: string;
          p_kind: string;
          p_max_uses?: number;
          p_min_spend?: number;
          p_name: string;
          p_per_client_limit?: number;
          p_segment_id?: string;
          p_service_id?: string;
          p_valid_from?: string;
          p_valid_to?: string;
          p_value: number;
        };
        Returns: string;
      };
      save_goal: {
        Args: {
          p_actual_manual?: number;
          p_employee_id: string;
          p_from: string;
          p_id?: string;
          p_kpi: string;
          p_target: number;
          p_title: string;
          p_to: string;
        };
        Returns: string;
      };
      save_job_opening: {
        Args: {
          p_branch_id: string;
          p_description: string;
          p_id?: string;
          p_status?: string;
          p_title: string;
        };
        Returns: string;
      };
      save_leave_policy_rules: { Args: { p_rules: Json }; Returns: undefined };
      save_loyalty_extras: {
        Args: {
          p_birthday_stamps: number;
          p_referral_stamps: number;
          p_reward_service_id?: string;
        };
        Returns: Json;
      };
      save_loyalty_program: {
        Args: {
          p_auto_stamp?: boolean;
          p_brand_color: string;
          p_is_active: boolean;
          p_min_booking_total: number;
          p_name: string;
          p_reward_description: string;
          p_reward_title: string;
          p_stamps_required: number;
        };
        Returns: Json;
      };
      save_loyalty_tiers: { Args: { p_tiers: Json }; Returns: undefined };
      save_message_template: {
        Args: {
          p_body: string;
          p_channel: string;
          p_language: string;
          p_name: string;
          p_template_id: string;
          p_title: string;
        };
        Returns: string;
      };
      save_package: {
        Args: {
          p_active?: boolean;
          p_description: string;
          p_name: string;
          p_package_id: string;
          p_price: number;
          p_service_id?: string;
          p_sessions: number;
          p_validity_days?: number;
        };
        Returns: string;
      };
      save_pay_settings: {
        Args: {
          p_commission_rate: number;
          p_employee_id: string;
          p_hourly_rate: number;
          p_monthly_salary: number;
          p_overtime_multiplier: number;
          p_overtime_policy?: string;
          p_pay_type: Database["public"]["Enums"]["pay_type"];
          p_product_commission_rate?: number;
          p_regular_hours: number;
        };
        Returns: {
          business_id: string;
          commission_rate: number;
          created_at: string;
          employee_id: string;
          hourly_rate: number | null;
          monthly_salary: number | null;
          overtime_multiplier: number;
          overtime_policy: string;
          pay_type: Database["public"]["Enums"]["pay_type"];
          product_commission_rate: number;
          regular_hours_per_month: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "pay_settings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      save_payroll_rule_set: {
        Args: {
          p_effective_from: string;
          p_holiday_work_premium_pct: number;
          p_name: string;
          p_notes?: string;
          p_si_employee_pct: number;
          p_si_employer_pct: number;
          p_si_max_base: number;
          p_si_min_base: number;
          p_solidarity_pct: number;
          p_stamp_pct: number;
          p_tax_brackets: Json;
        };
        Returns: string;
      };
      save_report_schedule: {
        Args: {
          p_frequency: string;
          p_recipient_ids: string[];
          p_report: string;
        };
        Returns: string;
      };
      save_rota_shift: {
        Args: {
          p_branch_id: string;
          p_break?: number;
          p_date: string;
          p_employee_id: string;
          p_ends: string;
          p_id?: string;
          p_note?: string;
          p_starts: string;
        };
        Returns: string;
      };
      save_segment: {
        Args: {
          p_color?: string;
          p_description?: string;
          p_match?: Database["public"]["Enums"]["segment_match"];
          p_name: string;
          p_rules: Json;
          p_segment_id: string;
        };
        Returns: string;
      };
      save_shift_template: {
        Args: {
          p_break?: number;
          p_ends: string;
          p_id?: string;
          p_name: string;
          p_starts: string;
        };
        Returns: string;
      };
      save_training: {
        Args: {
          p_completed_on: string;
          p_document_id?: string;
          p_employee_id: string;
          p_expires_on: string;
          p_id?: string;
          p_name: string;
          p_provider: string;
        };
        Returns: string;
      };
      schedule_week_check: {
        Args: { p_branch_id: string; p_week_start: string };
        Returns: {
          days_worked: number;
          employee_id: string;
          employee_name: string;
          no_rest_day: boolean;
          over_daily: boolean;
          over_weekly: boolean;
          overlap: boolean;
          total_minutes: number;
        }[];
      };
      search_branches: {
        Args: {
          p_category_slugs?: string[];
          p_lat?: number;
          p_limit?: number;
          p_lng?: number;
          p_min_rating?: number;
          p_offset?: number;
          p_open_on?: string;
          p_query?: string;
          p_radius_km?: number;
        };
        Returns: {
          address: string;
          branch_name: string;
          business_id: string;
          business_name: string;
          category_slugs: string[];
          city: string;
          description: string;
          distance_km: number;
          id: string;
          is_open_now: boolean;
          latitude: number;
          logo_path: string;
          longitude: number;
          phone: string;
          rating_avg: number;
          rating_count: number;
          timezone: string;
        }[];
      };
      search_hr_audit: {
        Args: {
          p_action?: string;
          p_employee_id?: string;
          p_from?: string;
          p_limit?: number;
          p_offset?: number;
          p_to?: string;
        };
        Returns: {
          action: string;
          actor_name: string;
          created_at: string;
          details: Json;
          entity: string;
          id: string;
          subject_name: string;
        }[];
      };
      seed_egypt_holidays: { Args: { p_year: number }; Returns: number };
      sell_gift_card: {
        Args: {
          p_amount: number;
          p_buyer_customer_id?: string;
          p_method: string;
          p_note?: string;
          p_recipient_name?: string;
          p_valid_days?: number;
        };
        Returns: Json;
      };
      sell_package: {
        Args: {
          p_branch_id?: string;
          p_customer_id: string;
          p_method: string;
          p_package_id: string;
          p_price?: number;
          p_use_credit?: number;
        };
        Returns: string;
      };
      send_broadcast: {
        Args: { p_body: string; p_segment_id: string; p_title: string };
        Returns: Json;
      };
      send_campaign: {
        Args: {
          p_body: string;
          p_channel?: string;
          p_scheduled_at?: string;
          p_segment_id: string;
          p_template_id?: string;
          p_title: string;
        };
        Returns: Json;
      };
      send_test_campaign: {
        Args: { p_body: string; p_title: string };
        Returns: undefined;
      };
      set_branch_status: {
        Args: {
          p_branch_id: string;
          p_confirm?: boolean;
          p_notify?: boolean;
          p_status: Database["public"]["Enums"]["branch_status"];
        };
        Returns: Json;
      };
      set_client_consent: {
        Args: {
          p_channel: string;
          p_customer_id: string;
          p_granted: boolean;
          p_source: string;
        };
        Returns: undefined;
      };
      set_client_details: {
        Args: {
          p_alert?: string;
          p_custom?: Json;
          p_customer_id: string;
          p_language?: string;
          p_preferred_employee_id?: string;
          p_preferred_staff_gender?: string;
        };
        Returns: undefined;
      };
      set_client_referrer: {
        Args: { p_customer_id: string; p_referrer_id: string };
        Returns: undefined;
      };
      set_client_tags: {
        Args: { p_customer_id: string; p_tags: string[] };
        Returns: string[];
      };
      set_company_holiday: {
        Args: { p_branch_id?: string; p_date: string; p_name: string };
        Returns: undefined;
      };
      set_employee_branches: {
        Args: { p_branch_ids: string[]; p_employee_id: string };
        Returns: undefined;
      };
      set_employee_permissions: {
        Args: { p_branch_id: string; p_employee_id: string; p_keys: string[] };
        Returns: string[];
      };
      set_employee_private: {
        Args: {
          p_bank_account: string;
          p_bank_name: string;
          p_employee_id: string;
          p_national_id: string;
          p_wallet_number: string;
        };
        Returns: undefined;
      };
      set_line_payment: {
        Args: { p_line_id: string; p_method?: string; p_status: string };
        Returns: {
          adjustments_total: number;
          advance_deduction: number;
          banked_hours: number;
          base_pay: number;
          branch_id: string;
          business_id: string;
          commission: number;
          commission_clawback: number;
          commission_detail: NonNullable<Json>;
          commission_revenue: number;
          cost_shared: boolean;
          created_at: string;
          employee_id: string;
          employee_name: string;
          employer_cost: number;
          fallback_hours: number;
          flags: string[];
          id: string;
          income_tax: number;
          leave_deduction: number;
          net_pay: number;
          overtime_hours: number;
          overtime_pay: number;
          overtime_policy: string | null;
          paid_leave_days: number;
          paid_leave_pay: number;
          pay_type: Database["public"]["Enums"]["pay_type"] | null;
          payment_method: string | null;
          payment_status: string;
          product_commission: number;
          regular_hours: number;
          run_id: string;
          si_employee: number;
          si_employer: number;
          stamp_solidarity: number;
          statutory_configured: boolean;
          total_pay: number;
          unpaid_leave_days: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "payroll_lines";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      set_owner: {
        Args: { p_employee_id: string; p_is_owner: boolean };
        Returns: undefined;
      };
      set_payroll_run_status: {
        Args: {
          p_reason?: string;
          p_run_id: string;
          p_status: Database["public"]["Enums"]["payroll_run_status"];
        };
        Returns: {
          approved_at: string | null;
          approved_by: string | null;
          branch_id: string;
          business_id: string;
          created_at: string;
          created_by: string | null;
          id: string;
          paid_at: string | null;
          period_end: string;
          period_start: string;
          status: Database["public"]["Enums"]["payroll_run_status"];
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "payroll_runs";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      set_provides_services: {
        Args: { p_employee_id: string; p_provides: boolean };
        Returns: undefined;
      };
      sign_document: {
        Args: { p_document_id: string };
        Returns: {
          business_id: string;
          category: Database["public"]["Enums"]["document_category"];
          created_at: string;
          delete_reason: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          employee_id: string | null;
          expires_on: string | null;
          file_path: string;
          id: string;
          name: string;
          sign_status: Database["public"]["Enums"]["document_sign_status"];
          signature_requested_at: string | null;
          signed_at: string | null;
          source: string;
          updated_at: string;
          uploaded_by: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "employee_documents";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      staffing_suggestions: {
        Args: { p_branch_id: string; p_from: string; p_to: string };
        Returns: {
          avg_bookings: number;
          day_of_week: number;
          hour: number;
          staffed: number;
          understaffed: boolean;
        }[];
      };
      start_checklist: {
        Args: { p_employee_id: string; p_kind: string };
        Returns: string;
      };
      start_free_trial: { Args: { p_plan_id: string }; Returns: Json };
      start_probation_review: {
        Args: { p_employee_id: string };
        Returns: string;
      };
      start_review_cycle: {
        Args: { p_due_on: string; p_employee_ids?: string[]; p_name: string };
        Returns: string;
      };
      submit_manager_review: {
        Args: { p_notes: string; p_rating: number; p_review_id: string };
        Returns: undefined;
      };
      submit_self_review: {
        Args: { p_notes: string; p_rating: number; p_review_id: string };
        Returns: undefined;
      };
      toggle_checklist_item: {
        Args: { p_checklist_id: string; p_done: boolean; p_key: string };
        Returns: Json;
      };
      track_product: {
        Args: {
          p_branch_id: string;
          p_product_id: string;
          p_qty?: number;
          p_reorder_threshold?: number;
          p_sku?: string;
          p_unit_cost?: number;
        };
        Returns: string;
      };
      transition_booking: {
        Args: {
          p_booking_id: string;
          p_reason?: string;
          p_to_status: Database["public"]["Enums"]["booking_status"];
        };
        Returns: Json;
      };
      unblock: { Args: { p_block_id: string }; Returns: undefined };
      update_client: {
        Args: {
          p_customer_id: string;
          p_date_of_birth?: string;
          p_email?: string;
          p_first_name: string;
          p_gender?: Database["public"]["Enums"]["gender"];
          p_last_name?: string;
          p_phone?: string;
        };
        Returns: undefined;
      };
      update_employee_profile: {
        Args: { p: Json; p_employee_id: string };
        Returns: undefined;
      };
      update_hr_settings: {
        Args: {
          p_allow_early_payroll: boolean;
          p_auto_close_after_minutes?: number;
          p_creator_cannot_approve: boolean;
          p_late_grace_minutes?: number;
          p_max_daily_hours?: number;
          p_max_deduction_pct: number;
          p_max_weekly_hours: number;
          p_min_session_minutes: number;
        };
        Returns: {
          allow_early_payroll: boolean;
          auto_close_after_minutes: number | null;
          business_id: string;
          creator_cannot_approve: boolean;
          late_grace_minutes: number;
          max_daily_hours: number;
          max_deduction_pct: number | null;
          max_weekly_hours: number;
          min_session_minutes: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "hr_settings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      use_package_session: {
        Args: {
          p_booking_id?: string;
          p_client_package_id: string;
          p_note?: string;
        };
        Returns: number;
      };
      void_gift_card: { Args: { p_gift_card_id: string }; Returns: undefined };
      wallet_apple_drop_device: {
        Args: { p_device_id: string; p_push_token: string };
        Returns: undefined;
      };
      wallet_apple_register: {
        Args: { p_card_id: string; p_device_id: string; p_push_token: string };
        Returns: undefined;
      };
      wallet_apple_serials: {
        Args: { p_device_id: string; p_since: string };
        Returns: {
          card_id: string;
          updated_at: string;
        }[];
      };
      wallet_apple_unregister: {
        Args: { p_card_id: string; p_device_id: string };
        Returns: undefined;
      };
      wallet_card_by_id: { Args: { p_card_id: string }; Returns: Json };
      wallet_card_for_user: {
        Args: { p_card_id: string; p_user_id: string };
        Returns: Json;
      };
      wallet_google_register: {
        Args: { p_card_id: string };
        Returns: undefined;
      };
      wallet_mark_synced: {
        Args: {
          p_card_id: string;
          p_device_id: string;
          p_kind: string;
          p_version: number;
        };
        Returns: undefined;
      };
      wallet_pending_sync: {
        Args: { p_limit: number };
        Returns: {
          card_id: string;
          device_id: string;
          kind: string;
          push_token: string;
          version: number;
        }[];
      };
    };
    Enums: {
      amenity:
        | "parking"
        | "card_payments"
        | "wheelchair_accessible"
        | "wifi"
        | "kids_friendly"
        | "pet_friendly"
        | "instapay";
      app_kind: "customer" | "partner";
      assistant_role: "user" | "assistant";
      attendance_kind: "clock_in" | "clock_out";
      attendance_source: "app" | "manual";
      booking_mode: "specialist" | "capacity";
      booking_source: "app" | "staff";
      booking_status:
        "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
      branch_status: "draft" | "active" | "closed";
      commission_entry_kind: "booking" | "adjustment";
      commission_statement_status: "issued" | "overdue" | "paid" | "waived";
      device_platform: "ios" | "android" | "web";
      document_category:
        | "contracts"
        | "certifications"
        | "identification"
        | "payslips"
        | "policies"
        | "others";
      document_sign_status: "none" | "pending" | "signed";
      employee_status: "invited" | "active" | "archived";
      gender: "male" | "female";
      leave_type:
        | "annual"
        | "sick"
        | "emergency"
        | "unpaid"
        | "maternity"
        | "paternity"
        | "public_holiday";
      loyalty_event_kind: "earn" | "stamp" | "redeem";
      message_sender: "customer" | "branch";
      notification_type:
        | "booking_created"
        | "booking_confirmed"
        | "booking_rescheduled"
        | "booking_cancelled"
        | "booking_reminder"
        | "pickup_ready"
        | "message_received"
        | "review_received"
        | "time_off_decided"
        | "general"
        | "queue_checked_in"
        | "queue_called";
      pay_type: "hourly" | "salaried";
      payroll_adjustment_kind: "bonus" | "deduction";
      payroll_run_status: "draft" | "review" | "approved" | "paid";
      queue_ticket_status:
        "waiting" | "serving" | "done" | "no_show" | "cancelled";
      segment_field:
        | "lifetime_spend"
        | "visit_count"
        | "last_visit_days"
        | "no_show_count"
        | "cancelled_count"
        | "avg_spend"
        | "days_since_first_visit"
        | "upcoming_bookings"
        | "rewards_ready"
        | "overdue_days"
        | "birthday_in_days"
        | "lifecycle"
        | "first_source"
        | "tag"
        | "consent";
      segment_match: "all" | "any";
      segment_operator: "lt" | "lte" | "gt" | "gte" | "eq" | "neq";
      stock_movement_type: "restock" | "consumption" | "adjustment";
      subscription_status:
        "trialing" | "active" | "past_due" | "canceled" | "comped";
      support_ticket_status: "open" | "in_progress" | "resolved";
      time_off_status: "pending" | "approved" | "rejected" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
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
      amenity: [
        "parking",
        "card_payments",
        "wheelchair_accessible",
        "wifi",
        "kids_friendly",
        "pet_friendly",
        "instapay",
      ],
      app_kind: ["customer", "partner"],
      assistant_role: ["user", "assistant"],
      attendance_kind: ["clock_in", "clock_out"],
      attendance_source: ["app", "manual"],
      booking_mode: ["specialist", "capacity"],
      booking_source: ["app", "staff"],
      booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      branch_status: ["draft", "active", "closed"],
      commission_entry_kind: ["booking", "adjustment"],
      commission_statement_status: ["issued", "overdue", "paid", "waived"],
      device_platform: ["ios", "android", "web"],
      document_category: [
        "contracts",
        "certifications",
        "identification",
        "payslips",
        "policies",
        "others",
      ],
      document_sign_status: ["none", "pending", "signed"],
      employee_status: ["invited", "active", "archived"],
      gender: ["male", "female"],
      leave_type: [
        "annual",
        "sick",
        "emergency",
        "unpaid",
        "maternity",
        "paternity",
        "public_holiday",
      ],
      loyalty_event_kind: ["earn", "stamp", "redeem"],
      message_sender: ["customer", "branch"],
      notification_type: [
        "booking_created",
        "booking_confirmed",
        "booking_rescheduled",
        "booking_cancelled",
        "booking_reminder",
        "pickup_ready",
        "message_received",
        "review_received",
        "time_off_decided",
        "general",
        "queue_checked_in",
        "queue_called",
      ],
      pay_type: ["hourly", "salaried"],
      payroll_adjustment_kind: ["bonus", "deduction"],
      payroll_run_status: ["draft", "review", "approved", "paid"],
      queue_ticket_status: [
        "waiting",
        "serving",
        "done",
        "no_show",
        "cancelled",
      ],
      segment_field: [
        "lifetime_spend",
        "visit_count",
        "last_visit_days",
        "no_show_count",
        "cancelled_count",
        "avg_spend",
        "days_since_first_visit",
        "upcoming_bookings",
        "rewards_ready",
        "overdue_days",
        "birthday_in_days",
        "lifecycle",
        "first_source",
        "tag",
        "consent",
      ],
      segment_match: ["all", "any"],
      segment_operator: ["lt", "lte", "gt", "gte", "eq", "neq"],
      stock_movement_type: ["restock", "consumption", "adjustment"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "comped",
      ],
      support_ticket_status: ["open", "in_progress", "resolved"],
      time_off_status: ["pending", "approved", "rejected", "cancelled"],
    },
  },
} as const;
