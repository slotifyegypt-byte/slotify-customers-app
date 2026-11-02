export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  "public": {
    Tables: {
      "attendance_events": {
        Row: {
          "at": string;
          "branch_id": string;
          "business_id": string;
          "created_at": string;
          "created_by": string | null;
          "employee_id": string;
          "id": string;
          "kind": Database["public"]["Enums"]["attendance_kind"];
          "note": string | null;
          "source": Database["public"]["Enums"]["attendance_source"];
        };
        ComputedFields: never;
        Insert: {
          "at"?: string;
          "branch_id": string;
          "business_id": string;
          "created_at"?: string;
          "created_by"?: string | null;
          "employee_id": string;
          "id"?: string;
          "kind": Database["public"]["Enums"]["attendance_kind"];
          "note"?: string | null;
          "source"?: Database["public"]["Enums"]["attendance_source"];
        };
        Update: {
          "at"?: string;
          "branch_id"?: string;
          "business_id"?: string;
          "created_at"?: string;
          "created_by"?: string | null;
          "employee_id"?: string;
          "id"?: string;
          "kind"?: Database["public"]["Enums"]["attendance_kind"];
          "note"?: string | null;
          "source"?: Database["public"]["Enums"]["attendance_source"];
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
      "booking_items": {
        Row: {
          "blocked_until": string;
          "booking_id": string;
          "branch_id": string;
          "business_id": string;
          "created_at": string;
          "employee_id": string | null;
          "employee_name": string | null;
          "ends_at": string;
          "id": string;
          "price": number;
          "service_id": string;
          "service_name": string;
          "starts_at": string;
          "status": Database["public"]["Enums"]["booking_status"];
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "blocked_until": string;
          "booking_id": string;
          "branch_id": string;
          "business_id": string;
          "created_at"?: string;
          "employee_id"?: string | null;
          "employee_name"?: string | null;
          "ends_at": string;
          "id"?: string;
          "price": number;
          "service_id": string;
          "service_name": string;
          "starts_at": string;
          "status": Database["public"]["Enums"]["booking_status"];
          "updated_at"?: string;
        };
        Update: {
          "blocked_until"?: string;
          "booking_id"?: string;
          "branch_id"?: string;
          "business_id"?: string;
          "created_at"?: string;
          "employee_id"?: string | null;
          "employee_name"?: string | null;
          "ends_at"?: string;
          "id"?: string;
          "price"?: number;
          "service_id"?: string;
          "service_name"?: string;
          "starts_at"?: string;
          "status"?: Database["public"]["Enums"]["booking_status"];
          "updated_at"?: string;
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
      "booking_messages": {
        Row: {
          "body": string;
          "booking_id": string;
          "created_at": string;
          "id": string;
          "read_at": string | null;
          "sender": Database["public"]["Enums"]["message_sender"];
          "sender_customer_id": string | null;
          "sender_employee_id": string | null;
        };
        ComputedFields: never;
        Insert: {
          "body": string;
          "booking_id": string;
          "created_at"?: string;
          "id"?: string;
          "read_at"?: string | null;
          "sender": Database["public"]["Enums"]["message_sender"];
          "sender_customer_id"?: string | null;
          "sender_employee_id"?: string | null;
        };
        Update: {
          "body"?: string;
          "booking_id"?: string;
          "created_at"?: string;
          "id"?: string;
          "read_at"?: string | null;
          "sender"?: Database["public"]["Enums"]["message_sender"];
          "sender_customer_id"?: string | null;
          "sender_employee_id"?: string | null;
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
      "bookings": {
        Row: {
          "branch_id": string;
          "business_id": string;
          "cancellation_reason": string | null;
          "cancelled_at": string | null;
          "cancelled_by": string | null;
          "created_at": string;
          "created_by_employee_id": string | null;
          "currency": string;
          "customer_id": string;
          "customer_note": string | null;
          "ends_at": string;
          "id": string;
          "reminder_sent_at": string | null;
          "source": Database["public"]["Enums"]["booking_source"];
          "starts_at": string;
          "status": Database["public"]["Enums"]["booking_status"];
          "total_price": number;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "branch_id": string;
          "business_id": string;
          "cancellation_reason"?: string | null;
          "cancelled_at"?: string | null;
          "cancelled_by"?: string | null;
          "created_at"?: string;
          "created_by_employee_id"?: string | null;
          "currency": string;
          "customer_id": string;
          "customer_note"?: string | null;
          "ends_at": string;
          "id"?: string;
          "reminder_sent_at"?: string | null;
          "source"?: Database["public"]["Enums"]["booking_source"];
          "starts_at": string;
          "status"?: Database["public"]["Enums"]["booking_status"];
          "total_price": number;
          "updated_at"?: string;
        };
        Update: {
          "branch_id"?: string;
          "business_id"?: string;
          "cancellation_reason"?: string | null;
          "cancelled_at"?: string | null;
          "cancelled_by"?: string | null;
          "created_at"?: string;
          "created_by_employee_id"?: string | null;
          "currency"?: string;
          "customer_id"?: string;
          "customer_note"?: string | null;
          "ends_at"?: string;
          "id"?: string;
          "reminder_sent_at"?: string | null;
          "source"?: Database["public"]["Enums"]["booking_source"];
          "starts_at"?: string;
          "status"?: Database["public"]["Enums"]["booking_status"];
          "total_price"?: number;
          "updated_at"?: string;
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
      "branch_hours": {
        Row: {
          "branch_id": string;
          "closes_at": string;
          "created_at": string;
          "day_of_week": number;
          "id": string;
          "opens_at": string;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "branch_id": string;
          "closes_at": string;
          "created_at"?: string;
          "day_of_week": number;
          "id"?: string;
          "opens_at": string;
          "updated_at"?: string;
        };
        Update: {
          "branch_id"?: string;
          "closes_at"?: string;
          "created_at"?: string;
          "day_of_week"?: number;
          "id"?: string;
          "opens_at"?: string;
          "updated_at"?: string;
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
        ];
      };
      "branch_photos": {
        Row: {
          "branch_id": string;
          "caption": string | null;
          "created_at": string;
          "id": string;
          "image_path": string;
          "sort_order": number;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "branch_id": string;
          "caption"?: string | null;
          "created_at"?: string;
          "id"?: string;
          "image_path": string;
          "sort_order"?: number;
          "updated_at"?: string;
        };
        Update: {
          "branch_id"?: string;
          "caption"?: string | null;
          "created_at"?: string;
          "id"?: string;
          "image_path"?: string;
          "sort_order"?: number;
          "updated_at"?: string;
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
        ];
      };
      "branch_services": {
        Row: {
          "branch_id": string;
          "business_id": string;
          "created_at": string;
          "is_active": boolean;
          "price": number | null;
          "service_id": string;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "branch_id": string;
          "business_id": string;
          "created_at"?: string;
          "is_active"?: boolean;
          "price"?: number | null;
          "service_id": string;
          "updated_at"?: string;
        };
        Update: {
          "branch_id"?: string;
          "business_id"?: string;
          "created_at"?: string;
          "is_active"?: boolean;
          "price"?: number | null;
          "service_id"?: string;
          "updated_at"?: string;
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
            foreignKeyName: "branch_services_service_id_business_id_fkey";
            columns: ["service_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      "branch_special_days": {
        Row: {
          "branch_id": string;
          "closes_at": string | null;
          "created_at": string;
          "date": string;
          "id": string;
          "is_closed": boolean;
          "opens_at": string | null;
          "reason": string | null;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "branch_id": string;
          "closes_at"?: string | null;
          "created_at"?: string;
          "date": string;
          "id"?: string;
          "is_closed"?: boolean;
          "opens_at"?: string | null;
          "reason"?: string | null;
          "updated_at"?: string;
        };
        Update: {
          "branch_id"?: string;
          "closes_at"?: string | null;
          "created_at"?: string;
          "date"?: string;
          "id"?: string;
          "is_closed"?: boolean;
          "opens_at"?: string | null;
          "reason"?: string | null;
          "updated_at"?: string;
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
        ];
      };
      "branch_stock": {
        Row: {
          "branch_id": string;
          "business_id": string;
          "cost_per_unit": number | null;
          "created_at": string;
          "id": string;
          "product_id": string;
          "qty_on_hand": number;
          "reorder_threshold": number;
          "sku": string | null;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "branch_id": string;
          "business_id": string;
          "cost_per_unit"?: number | null;
          "created_at"?: string;
          "id"?: string;
          "product_id": string;
          "qty_on_hand"?: number;
          "reorder_threshold"?: number;
          "sku"?: string | null;
          "updated_at"?: string;
        };
        Update: {
          "branch_id"?: string;
          "business_id"?: string;
          "cost_per_unit"?: number | null;
          "created_at"?: string;
          "id"?: string;
          "product_id"?: string;
          "qty_on_hand"?: number;
          "reorder_threshold"?: number;
          "sku"?: string | null;
          "updated_at"?: string;
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
            foreignKeyName: "branch_stock_product_id_business_id_fkey";
            columns: ["product_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      "branches": {
        Row: {
          "address": string | null;
          "amenities": (Database["public"]["Enums"]["amenity"])[];
          "business_id": string;
          "city": string | null;
          "country_code": string;
          "created_at": string;
          "description": string | null;
          "id": string;
          "latitude": number | null;
          "location": unknown;
          "longitude": number | null;
          "name": string;
          "phone": string | null;
          "rating_avg": number;
          "rating_count": number;
          "share_slug": string | null;
          "status": Database["public"]["Enums"]["branch_status"];
          "timezone": string;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "address"?: string | null;
          "amenities"?: (Database["public"]["Enums"]["amenity"])[];
          "business_id": string;
          "city"?: string | null;
          "country_code"?: string;
          "created_at"?: string;
          "description"?: string | null;
          "id"?: string;
          "latitude"?: number | null;
          "location"?: never;
          "longitude"?: number | null;
          "name": string;
          "phone"?: string | null;
          "rating_avg"?: number;
          "rating_count"?: number;
          "share_slug"?: string | null;
          "status"?: Database["public"]["Enums"]["branch_status"];
          "timezone"?: string;
          "updated_at"?: string;
        };
        Update: {
          "address"?: string | null;
          "amenities"?: (Database["public"]["Enums"]["amenity"])[];
          "business_id"?: string;
          "city"?: string | null;
          "country_code"?: string;
          "created_at"?: string;
          "description"?: string | null;
          "id"?: string;
          "latitude"?: number | null;
          "location"?: never;
          "longitude"?: number | null;
          "name"?: string;
          "phone"?: string | null;
          "rating_avg"?: number;
          "rating_count"?: number;
          "share_slug"?: string | null;
          "status"?: Database["public"]["Enums"]["branch_status"];
          "timezone"?: string;
          "updated_at"?: string;
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
      "business_categories": {
        Row: {
          "business_id": string;
          "category_id": string;
          "created_at": string;
          "is_primary": boolean;
        };
        ComputedFields: never;
        Insert: {
          "business_id": string;
          "category_id": string;
          "created_at"?: string;
          "is_primary"?: boolean;
        };
        Update: {
          "business_id"?: string;
          "category_id"?: string;
          "created_at"?: string;
          "is_primary"?: boolean;
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
      "businesses": {
        Row: {
          "country_code": string;
          "created_at": string;
          "currency": string;
          "description": string | null;
          "id": string;
          "logo_path": string | null;
          "name": string;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "country_code"?: string;
          "created_at"?: string;
          "currency"?: string;
          "description"?: string | null;
          "id"?: string;
          "logo_path"?: string | null;
          "name": string;
          "updated_at"?: string;
        };
        Update: {
          "country_code"?: string;
          "created_at"?: string;
          "currency"?: string;
          "description"?: string | null;
          "id"?: string;
          "logo_path"?: string | null;
          "name"?: string;
          "updated_at"?: string;
        };
        Relationships: [];
      };
      "categories": {
        Row: {
          "created_at": string;
          "description": string | null;
          "icon_path": string | null;
          "id": string;
          "is_active": boolean;
          "name": string;
          "slug": string;
          "sort_order": number;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "created_at"?: string;
          "description"?: string | null;
          "icon_path"?: string | null;
          "id"?: string;
          "is_active"?: boolean;
          "name": string;
          "slug": string;
          "sort_order"?: number;
          "updated_at"?: string;
        };
        Update: {
          "created_at"?: string;
          "description"?: string | null;
          "icon_path"?: string | null;
          "id"?: string;
          "is_active"?: boolean;
          "name"?: string;
          "slug"?: string;
          "sort_order"?: number;
          "updated_at"?: string;
        };
        Relationships: [];
      };
      "customers": {
        Row: {
          "avatar_path": string | null;
          "country_code": string;
          "created_at": string;
          "created_by_branch_id": string | null;
          "date_of_birth": string | null;
          "email": string | null;
          "first_name": string;
          "gender": Database["public"]["Enums"]["gender"] | null;
          "id": string;
          "last_name": string | null;
          "phone": string | null;
          "updated_at": string;
          "user_id": string | null;
        };
        ComputedFields: never;
        Insert: {
          "avatar_path"?: string | null;
          "country_code"?: string;
          "created_at"?: string;
          "created_by_branch_id"?: string | null;
          "date_of_birth"?: string | null;
          "email"?: string | null;
          "first_name": string;
          "gender"?: Database["public"]["Enums"]["gender"] | null;
          "id"?: string;
          "last_name"?: string | null;
          "phone"?: string | null;
          "updated_at"?: string;
          "user_id"?: string | null;
        };
        Update: {
          "avatar_path"?: string | null;
          "country_code"?: string;
          "created_at"?: string;
          "created_by_branch_id"?: string | null;
          "date_of_birth"?: string | null;
          "email"?: string | null;
          "first_name"?: string;
          "gender"?: Database["public"]["Enums"]["gender"] | null;
          "id"?: string;
          "last_name"?: string | null;
          "phone"?: string | null;
          "updated_at"?: string;
          "user_id"?: string | null;
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
        ];
      };
      "employee_branches": {
        Row: {
          "branch_id": string;
          "business_id": string;
          "created_at": string;
          "employee_id": string;
          "is_primary": boolean;
        };
        ComputedFields: never;
        Insert: {
          "branch_id": string;
          "business_id": string;
          "created_at"?: string;
          "employee_id": string;
          "is_primary"?: boolean;
        };
        Update: {
          "branch_id"?: string;
          "business_id"?: string;
          "created_at"?: string;
          "employee_id"?: string;
          "is_primary"?: boolean;
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
            foreignKeyName: "employee_branches_employee_id_business_id_fkey";
            columns: ["employee_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      "employee_documents": {
        Row: {
          "business_id": string;
          "category": Database["public"]["Enums"]["document_category"];
          "created_at": string;
          "employee_id": string | null;
          "expires_on": string | null;
          "file_path": string;
          "id": string;
          "name": string;
          "sign_status": Database["public"]["Enums"]["document_sign_status"];
          "signature_requested_at": string | null;
          "signed_at": string | null;
          "updated_at": string;
          "uploaded_by": string | null;
        };
        ComputedFields: never;
        Insert: {
          "business_id": string;
          "category": Database["public"]["Enums"]["document_category"];
          "created_at"?: string;
          "employee_id"?: string | null;
          "expires_on"?: string | null;
          "file_path": string;
          "id"?: string;
          "name": string;
          "sign_status"?: Database["public"]["Enums"]["document_sign_status"];
          "signature_requested_at"?: string | null;
          "signed_at"?: string | null;
          "updated_at"?: string;
          "uploaded_by"?: string | null;
        };
        Update: {
          "business_id"?: string;
          "category"?: Database["public"]["Enums"]["document_category"];
          "created_at"?: string;
          "employee_id"?: string | null;
          "expires_on"?: string | null;
          "file_path"?: string;
          "id"?: string;
          "name"?: string;
          "sign_status"?: Database["public"]["Enums"]["document_sign_status"];
          "signature_requested_at"?: string | null;
          "signed_at"?: string | null;
          "updated_at"?: string;
          "uploaded_by"?: string | null;
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
      "employee_hours": {
        Row: {
          "branch_id": string;
          "created_at": string;
          "day_of_week": number;
          "employee_id": string;
          "ends_at": string;
          "id": string;
          "starts_at": string;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "branch_id": string;
          "created_at"?: string;
          "day_of_week": number;
          "employee_id": string;
          "ends_at": string;
          "id"?: string;
          "starts_at": string;
          "updated_at"?: string;
        };
        Update: {
          "branch_id"?: string;
          "created_at"?: string;
          "day_of_week"?: number;
          "employee_id"?: string;
          "ends_at"?: string;
          "id"?: string;
          "starts_at"?: string;
          "updated_at"?: string;
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
      "employee_permissions": {
        Row: {
          "branch_id": string | null;
          "business_id": string;
          "employee_id": string;
          "granted_at": string;
          "granted_by": string | null;
          "id": string;
          "permission_key": string;
        };
        ComputedFields: never;
        Insert: {
          "branch_id"?: string | null;
          "business_id": string;
          "employee_id": string;
          "granted_at"?: string;
          "granted_by"?: string | null;
          "id"?: string;
          "permission_key": string;
        };
        Update: {
          "branch_id"?: string | null;
          "business_id"?: string;
          "employee_id"?: string;
          "granted_at"?: string;
          "granted_by"?: string | null;
          "id"?: string;
          "permission_key"?: string;
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
      "employee_special_days": {
        Row: {
          "branch_id": string | null;
          "created_at": string;
          "date": string;
          "employee_id": string;
          "ends_at": string | null;
          "id": string;
          "is_unavailable": boolean;
          "reason": string | null;
          "starts_at": string | null;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "branch_id"?: string | null;
          "created_at"?: string;
          "date": string;
          "employee_id": string;
          "ends_at"?: string | null;
          "id"?: string;
          "is_unavailable"?: boolean;
          "reason"?: string | null;
          "starts_at"?: string | null;
          "updated_at"?: string;
        };
        Update: {
          "branch_id"?: string | null;
          "created_at"?: string;
          "date"?: string;
          "employee_id"?: string;
          "ends_at"?: string | null;
          "id"?: string;
          "is_unavailable"?: boolean;
          "reason"?: string | null;
          "starts_at"?: string | null;
          "updated_at"?: string;
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
      "employees": {
        Row: {
          "avatar_path": string | null;
          "bio": string | null;
          "business_id": string;
          "created_at": string;
          "email": string | null;
          "first_name": string;
          "hire_date": string | null;
          "id": string;
          "is_owner": boolean;
          "job_title": string | null;
          "last_name": string | null;
          "phone": string | null;
          "status": Database["public"]["Enums"]["employee_status"];
          "updated_at": string;
          "user_id": string | null;
        };
        ComputedFields: never;
        Insert: {
          "avatar_path"?: string | null;
          "bio"?: string | null;
          "business_id": string;
          "created_at"?: string;
          "email"?: string | null;
          "first_name": string;
          "hire_date"?: string | null;
          "id"?: string;
          "is_owner"?: boolean;
          "job_title"?: string | null;
          "last_name"?: string | null;
          "phone"?: string | null;
          "status"?: Database["public"]["Enums"]["employee_status"];
          "updated_at"?: string;
          "user_id"?: string | null;
        };
        Update: {
          "avatar_path"?: string | null;
          "bio"?: string | null;
          "business_id"?: string;
          "created_at"?: string;
          "email"?: string | null;
          "first_name"?: string;
          "hire_date"?: string | null;
          "id"?: string;
          "is_owner"?: boolean;
          "job_title"?: string | null;
          "last_name"?: string | null;
          "phone"?: string | null;
          "status"?: Database["public"]["Enums"]["employee_status"];
          "updated_at"?: string;
          "user_id"?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employees_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      "favourites": {
        Row: {
          "branch_id": string;
          "created_at": string;
          "customer_id": string;
        };
        ComputedFields: never;
        Insert: {
          "branch_id": string;
          "created_at"?: string;
          "customer_id"?: string;
        };
        Update: {
          "branch_id"?: string;
          "created_at"?: string;
          "customer_id"?: string;
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
            foreignKeyName: "favourites_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      "notifications": {
        Row: {
          "body": string | null;
          "created_at": string;
          "customer_id": string | null;
          "data": NonNullable<Json>;
          "employee_id": string | null;
          "id": string;
          "pushed_at": string | null;
          "read_at": string | null;
          "title": string;
          "type": Database["public"]["Enums"]["notification_type"];
        };
        ComputedFields: never;
        Insert: {
          "body"?: string | null;
          "created_at"?: string;
          "customer_id"?: string | null;
          "data"?: NonNullable<Json>;
          "employee_id"?: string | null;
          "id"?: string;
          "pushed_at"?: string | null;
          "read_at"?: string | null;
          "title": string;
          "type"?: Database["public"]["Enums"]["notification_type"];
        };
        Update: {
          "body"?: string | null;
          "created_at"?: string;
          "customer_id"?: string | null;
          "data"?: NonNullable<Json>;
          "employee_id"?: string | null;
          "id"?: string;
          "pushed_at"?: string | null;
          "read_at"?: string | null;
          "title"?: string;
          "type"?: Database["public"]["Enums"]["notification_type"];
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
      "offer_categories": {
        Row: {
          "created_at": string;
          "ends_on": string | null;
          "id": string;
          "is_active": boolean;
          "name": string;
          "slug": string;
          "sort_order": number;
          "starts_on": string | null;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "created_at"?: string;
          "ends_on"?: string | null;
          "id"?: string;
          "is_active"?: boolean;
          "name": string;
          "slug": string;
          "sort_order"?: number;
          "starts_on"?: string | null;
          "updated_at"?: string;
        };
        Update: {
          "created_at"?: string;
          "ends_on"?: string | null;
          "id"?: string;
          "is_active"?: boolean;
          "name"?: string;
          "slug"?: string;
          "sort_order"?: number;
          "starts_on"?: string | null;
          "updated_at"?: string;
        };
        Relationships: [];
      };
      "offers": {
        Row: {
          "branch_id": string;
          "business_id": string;
          "category_id": string | null;
          "created_at": string;
          "description": string | null;
          "ends_on": string;
          "id": string;
          "image_path": string | null;
          "is_active": boolean;
          "offer_price": number | null;
          "original_price": number | null;
          "service_id": string | null;
          "starts_on": string;
          "title": string;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "branch_id": string;
          "business_id": string;
          "category_id"?: string | null;
          "created_at"?: string;
          "description"?: string | null;
          "ends_on": string;
          "id"?: string;
          "image_path"?: string | null;
          "is_active"?: boolean;
          "offer_price"?: number | null;
          "original_price"?: number | null;
          "service_id"?: string | null;
          "starts_on": string;
          "title": string;
          "updated_at"?: string;
        };
        Update: {
          "branch_id"?: string;
          "business_id"?: string;
          "category_id"?: string | null;
          "created_at"?: string;
          "description"?: string | null;
          "ends_on"?: string;
          "id"?: string;
          "image_path"?: string | null;
          "is_active"?: boolean;
          "offer_price"?: number | null;
          "original_price"?: number | null;
          "service_id"?: string | null;
          "starts_on"?: string;
          "title"?: string;
          "updated_at"?: string;
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
      "pay_settings": {
        Row: {
          "business_id": string;
          "commission_rate": number;
          "created_at": string;
          "employee_id": string;
          "hourly_rate": number | null;
          "monthly_salary": number | null;
          "overtime_multiplier": number;
          "pay_type": Database["public"]["Enums"]["pay_type"];
          "regular_hours_per_month": number;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "business_id": string;
          "commission_rate"?: number;
          "created_at"?: string;
          "employee_id": string;
          "hourly_rate"?: number | null;
          "monthly_salary"?: number | null;
          "overtime_multiplier"?: number;
          "pay_type"?: Database["public"]["Enums"]["pay_type"];
          "regular_hours_per_month"?: number;
          "updated_at"?: string;
        };
        Update: {
          "business_id"?: string;
          "commission_rate"?: number;
          "created_at"?: string;
          "employee_id"?: string;
          "hourly_rate"?: number | null;
          "monthly_salary"?: number | null;
          "overtime_multiplier"?: number;
          "pay_type"?: Database["public"]["Enums"]["pay_type"];
          "regular_hours_per_month"?: number;
          "updated_at"?: string;
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
      "payroll_adjustments": {
        Row: {
          "amount": number;
          "business_id": string;
          "created_at": string;
          "created_by": string | null;
          "id": string;
          "kind": Database["public"]["Enums"]["payroll_adjustment_kind"];
          "line_id": string;
          "note": string | null;
        };
        ComputedFields: never;
        Insert: {
          "amount": number;
          "business_id": string;
          "created_at"?: string;
          "created_by"?: string | null;
          "id"?: string;
          "kind": Database["public"]["Enums"]["payroll_adjustment_kind"];
          "line_id": string;
          "note"?: string | null;
        };
        Update: {
          "amount"?: number;
          "business_id"?: string;
          "created_at"?: string;
          "created_by"?: string | null;
          "id"?: string;
          "kind"?: Database["public"]["Enums"]["payroll_adjustment_kind"];
          "line_id"?: string;
          "note"?: string | null;
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
      "payroll_lines": {
        Row: {
          "adjustments_total": number;
          "base_pay": number;
          "branch_id": string;
          "business_id": string;
          "commission": number;
          "commission_revenue": number;
          "created_at": string;
          "employee_id": string;
          "employee_name": string;
          "flags": (string)[];
          "id": string;
          "leave_deduction": number;
          "overtime_hours": number;
          "overtime_pay": number;
          "paid_leave_days": number;
          "paid_leave_pay": number;
          "pay_type": Database["public"]["Enums"]["pay_type"] | null;
          "regular_hours": number;
          "run_id": string;
          "total_pay": number;
          "unpaid_leave_days": number;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "adjustments_total"?: number;
          "base_pay"?: number;
          "branch_id": string;
          "business_id": string;
          "commission"?: number;
          "commission_revenue"?: number;
          "created_at"?: string;
          "employee_id": string;
          "employee_name": string;
          "flags"?: (string)[];
          "id"?: string;
          "leave_deduction"?: number;
          "overtime_hours"?: number;
          "overtime_pay"?: number;
          "paid_leave_days"?: number;
          "paid_leave_pay"?: number;
          "pay_type"?: Database["public"]["Enums"]["pay_type"] | null;
          "regular_hours"?: number;
          "run_id": string;
          "total_pay"?: number;
          "unpaid_leave_days"?: number;
          "updated_at"?: string;
        };
        Update: {
          "adjustments_total"?: number;
          "base_pay"?: number;
          "branch_id"?: string;
          "business_id"?: string;
          "commission"?: number;
          "commission_revenue"?: number;
          "created_at"?: string;
          "employee_id"?: string;
          "employee_name"?: string;
          "flags"?: (string)[];
          "id"?: string;
          "leave_deduction"?: number;
          "overtime_hours"?: number;
          "overtime_pay"?: number;
          "paid_leave_days"?: number;
          "paid_leave_pay"?: number;
          "pay_type"?: Database["public"]["Enums"]["pay_type"] | null;
          "regular_hours"?: number;
          "run_id"?: string;
          "total_pay"?: number;
          "unpaid_leave_days"?: number;
          "updated_at"?: string;
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
      "payroll_runs": {
        Row: {
          "approved_at": string | null;
          "approved_by": string | null;
          "branch_id": string;
          "business_id": string;
          "created_at": string;
          "created_by": string | null;
          "id": string;
          "paid_at": string | null;
          "period_end": string;
          "period_start": string;
          "status": Database["public"]["Enums"]["payroll_run_status"];
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "approved_at"?: string | null;
          "approved_by"?: string | null;
          "branch_id": string;
          "business_id": string;
          "created_at"?: string;
          "created_by"?: string | null;
          "id"?: string;
          "paid_at"?: string | null;
          "period_end": string;
          "period_start": string;
          "status"?: Database["public"]["Enums"]["payroll_run_status"];
          "updated_at"?: string;
        };
        Update: {
          "approved_at"?: string | null;
          "approved_by"?: string | null;
          "branch_id"?: string;
          "business_id"?: string;
          "created_at"?: string;
          "created_by"?: string | null;
          "id"?: string;
          "paid_at"?: string | null;
          "period_end"?: string;
          "period_start"?: string;
          "status"?: Database["public"]["Enums"]["payroll_run_status"];
          "updated_at"?: string;
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
            foreignKeyName: "payroll_runs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      "permissions": {
        Row: {
          "area": string;
          "description": string | null;
          "key": string;
          "label": string;
          "requires": (string)[];
          "scope": string;
          "sort_order": number;
        };
        ComputedFields: never;
        Insert: {
          "area": string;
          "description"?: string | null;
          "key": string;
          "label": string;
          "requires"?: (string)[];
          "scope": string;
          "sort_order"?: number;
        };
        Update: {
          "area"?: string;
          "description"?: string | null;
          "key"?: string;
          "label"?: string;
          "requires"?: (string)[];
          "scope"?: string;
          "sort_order"?: number;
        };
        Relationships: [];
      };
      "product_categories": {
        Row: {
          "business_id": string;
          "created_at": string;
          "id": string;
          "name": string;
          "sort_order": number;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "business_id": string;
          "created_at"?: string;
          "id"?: string;
          "name": string;
          "sort_order"?: number;
          "updated_at"?: string;
        };
        Update: {
          "business_id"?: string;
          "created_at"?: string;
          "id"?: string;
          "name"?: string;
          "sort_order"?: number;
          "updated_at"?: string;
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
      "products": {
        Row: {
          "brand": string | null;
          "business_id": string;
          "category_id": string | null;
          "created_at": string;
          "description": string | null;
          "id": string;
          "image_path": string | null;
          "is_active": boolean;
          "name": string;
          "unit": string;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "brand"?: string | null;
          "business_id": string;
          "category_id"?: string | null;
          "created_at"?: string;
          "description"?: string | null;
          "id"?: string;
          "image_path"?: string | null;
          "is_active"?: boolean;
          "name": string;
          "unit"?: string;
          "updated_at"?: string;
        };
        Update: {
          "brand"?: string | null;
          "business_id"?: string;
          "category_id"?: string | null;
          "created_at"?: string;
          "description"?: string | null;
          "id"?: string;
          "image_path"?: string | null;
          "is_active"?: boolean;
          "name"?: string;
          "unit"?: string;
          "updated_at"?: string;
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
      "promoted_branches": {
        Row: {
          "branch_id": string;
          "created_at": string;
          "ends_on": string;
          "id": string;
          "note": string | null;
          "sort_order": number;
          "starts_on": string;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "branch_id": string;
          "created_at"?: string;
          "ends_on": string;
          "id"?: string;
          "note"?: string | null;
          "sort_order"?: number;
          "starts_on": string;
          "updated_at"?: string;
        };
        Update: {
          "branch_id"?: string;
          "created_at"?: string;
          "ends_on"?: string;
          "id"?: string;
          "note"?: string | null;
          "sort_order"?: number;
          "starts_on"?: string;
          "updated_at"?: string;
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
        ];
      };
      "push_tokens": {
        Row: {
          "app": Database["public"]["Enums"]["app_kind"];
          "created_at": string;
          "id": string;
          "last_seen_at": string;
          "platform": Database["public"]["Enums"]["device_platform"];
          "token": string;
          "user_id": string;
        };
        ComputedFields: never;
        Insert: {
          "app": Database["public"]["Enums"]["app_kind"];
          "created_at"?: string;
          "id"?: string;
          "last_seen_at"?: string;
          "platform": Database["public"]["Enums"]["device_platform"];
          "token": string;
          "user_id": string;
        };
        Update: {
          "app"?: Database["public"]["Enums"]["app_kind"];
          "created_at"?: string;
          "id"?: string;
          "last_seen_at"?: string;
          "platform"?: Database["public"]["Enums"]["device_platform"];
          "token"?: string;
          "user_id"?: string;
        };
        Relationships: [];
      };
      "reviews": {
        Row: {
          "booking_id": string;
          "branch_id": string;
          "comment": string | null;
          "created_at": string;
          "customer_id": string;
          "id": string;
          "rating": number;
          "replied_at": string | null;
          "replied_by": string | null;
          "reply": string | null;
          "reviewer_name": string | null;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "booking_id": string;
          "branch_id": string;
          "comment"?: string | null;
          "created_at"?: string;
          "customer_id": string;
          "id"?: string;
          "rating": number;
          "replied_at"?: string | null;
          "replied_by"?: string | null;
          "reply"?: string | null;
          "reviewer_name"?: string | null;
          "updated_at"?: string;
        };
        Update: {
          "booking_id"?: string;
          "branch_id"?: string;
          "comment"?: string | null;
          "created_at"?: string;
          "customer_id"?: string;
          "id"?: string;
          "rating"?: number;
          "replied_at"?: string | null;
          "replied_by"?: string | null;
          "reply"?: string | null;
          "reviewer_name"?: string | null;
          "updated_at"?: string;
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
      "segment_rules": {
        Row: {
          "created_at": string;
          "field": Database["public"]["Enums"]["segment_field"];
          "id": string;
          "operator": Database["public"]["Enums"]["segment_operator"];
          "segment_id": string;
          "value": number;
        };
        ComputedFields: never;
        Insert: {
          "created_at"?: string;
          "field": Database["public"]["Enums"]["segment_field"];
          "id"?: string;
          "operator": Database["public"]["Enums"]["segment_operator"];
          "segment_id": string;
          "value": number;
        };
        Update: {
          "created_at"?: string;
          "field"?: Database["public"]["Enums"]["segment_field"];
          "id"?: string;
          "operator"?: Database["public"]["Enums"]["segment_operator"];
          "segment_id"?: string;
          "value"?: number;
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
      "segments": {
        Row: {
          "business_id": string;
          "color": string | null;
          "created_at": string;
          "description": string | null;
          "id": string;
          "is_builtin": boolean;
          "match": Database["public"]["Enums"]["segment_match"];
          "name": string;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "business_id": string;
          "color"?: string | null;
          "created_at"?: string;
          "description"?: string | null;
          "id"?: string;
          "is_builtin"?: boolean;
          "match"?: Database["public"]["Enums"]["segment_match"];
          "name": string;
          "updated_at"?: string;
        };
        Update: {
          "business_id"?: string;
          "color"?: string | null;
          "created_at"?: string;
          "description"?: string | null;
          "id"?: string;
          "is_builtin"?: boolean;
          "match"?: Database["public"]["Enums"]["segment_match"];
          "name"?: string;
          "updated_at"?: string;
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
      "service_categories": {
        Row: {
          "business_id": string;
          "created_at": string;
          "id": string;
          "name": string;
          "sort_order": number;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "business_id": string;
          "created_at"?: string;
          "id"?: string;
          "name": string;
          "sort_order"?: number;
          "updated_at"?: string;
        };
        Update: {
          "business_id"?: string;
          "created_at"?: string;
          "id"?: string;
          "name"?: string;
          "sort_order"?: number;
          "updated_at"?: string;
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
      "service_employees": {
        Row: {
          "business_id": string;
          "created_at": string;
          "employee_id": string;
          "service_id": string;
        };
        ComputedFields: never;
        Insert: {
          "business_id": string;
          "created_at"?: string;
          "employee_id": string;
          "service_id": string;
        };
        Update: {
          "business_id"?: string;
          "created_at"?: string;
          "employee_id"?: string;
          "service_id"?: string;
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
      "service_products": {
        Row: {
          "business_id": string;
          "created_at": string;
          "is_required": boolean;
          "product_id": string;
          "qty_per_booking": number;
          "service_id": string;
          "sort_order": number;
        };
        ComputedFields: never;
        Insert: {
          "business_id": string;
          "created_at"?: string;
          "is_required"?: boolean;
          "product_id": string;
          "qty_per_booking"?: number;
          "service_id": string;
          "sort_order"?: number;
        };
        Update: {
          "business_id"?: string;
          "created_at"?: string;
          "is_required"?: boolean;
          "product_id"?: string;
          "qty_per_booking"?: number;
          "service_id"?: string;
          "sort_order"?: number;
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
      "services": {
        Row: {
          "archived_at": string | null;
          "booking_mode": Database["public"]["Enums"]["booking_mode"];
          "buffer_minutes": number;
          "business_id": string;
          "capacity": number | null;
          "category_id": string | null;
          "created_at": string;
          "description": string | null;
          "duration_minutes": number;
          "id": string;
          "image_path": string | null;
          "name": string;
          "price": number;
          "sort_order": number;
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "archived_at"?: string | null;
          "booking_mode"?: Database["public"]["Enums"]["booking_mode"];
          "buffer_minutes"?: number;
          "business_id": string;
          "capacity"?: number | null;
          "category_id"?: string | null;
          "created_at"?: string;
          "description"?: string | null;
          "duration_minutes": number;
          "id"?: string;
          "image_path"?: string | null;
          "name": string;
          "price": number;
          "sort_order"?: number;
          "updated_at"?: string;
        };
        Update: {
          "archived_at"?: string | null;
          "booking_mode"?: Database["public"]["Enums"]["booking_mode"];
          "buffer_minutes"?: number;
          "business_id"?: string;
          "capacity"?: number | null;
          "category_id"?: string | null;
          "created_at"?: string;
          "description"?: string | null;
          "duration_minutes"?: number;
          "id"?: string;
          "image_path"?: string | null;
          "name"?: string;
          "price"?: number;
          "sort_order"?: number;
          "updated_at"?: string;
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
      "stock_movements": {
        Row: {
          "booking_item_id": string | null;
          "branch_id": string;
          "branch_stock_id": string;
          "business_id": string;
          "created_at": string;
          "created_by": string | null;
          "id": string;
          "movement_type": Database["public"]["Enums"]["stock_movement_type"];
          "note": string | null;
          "qty_change": number;
          "supplier": string | null;
          "total_cost": number | null;
          "unit_cost": number | null;
        };
        ComputedFields: never;
        Insert: {
          "booking_item_id"?: string | null;
          "branch_id": string;
          "branch_stock_id": string;
          "business_id": string;
          "created_at"?: string;
          "created_by"?: string | null;
          "id"?: string;
          "movement_type": Database["public"]["Enums"]["stock_movement_type"];
          "note"?: string | null;
          "qty_change": number;
          "supplier"?: string | null;
          "total_cost"?: number | null;
          "unit_cost"?: number | null;
        };
        Update: {
          "booking_item_id"?: string | null;
          "branch_id"?: string;
          "branch_stock_id"?: string;
          "business_id"?: string;
          "created_at"?: string;
          "created_by"?: string | null;
          "id"?: string;
          "movement_type"?: Database["public"]["Enums"]["stock_movement_type"];
          "note"?: string | null;
          "qty_change"?: number;
          "supplier"?: string | null;
          "total_cost"?: number | null;
          "unit_cost"?: number | null;
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
      "support_tickets": {
        Row: {
          "admin_note": string | null;
          "app": Database["public"]["Enums"]["app_kind"];
          "created_at": string;
          "id": string;
          "message": string;
          "resolved_at": string | null;
          "status": Database["public"]["Enums"]["support_ticket_status"];
          "subject": string;
          "updated_at": string;
          "user_id": string;
        };
        ComputedFields: never;
        Insert: {
          "admin_note"?: string | null;
          "app": Database["public"]["Enums"]["app_kind"];
          "created_at"?: string;
          "id"?: string;
          "message": string;
          "resolved_at"?: string | null;
          "status"?: Database["public"]["Enums"]["support_ticket_status"];
          "subject": string;
          "updated_at"?: string;
          "user_id"?: string;
        };
        Update: {
          "admin_note"?: string | null;
          "app"?: Database["public"]["Enums"]["app_kind"];
          "created_at"?: string;
          "id"?: string;
          "message"?: string;
          "resolved_at"?: string | null;
          "status"?: Database["public"]["Enums"]["support_ticket_status"];
          "subject"?: string;
          "updated_at"?: string;
          "user_id"?: string;
        };
        Relationships: [];
      };
      "time_off_policies": {
        Row: {
          "business_id": string;
          "created_at": string;
          "days_per_year": number;
          "employee_id": string;
          "id": string;
          "leave_type": Database["public"]["Enums"]["leave_type"];
          "updated_at": string;
          "year": number;
        };
        ComputedFields: never;
        Insert: {
          "business_id": string;
          "created_at"?: string;
          "days_per_year": number;
          "employee_id": string;
          "id"?: string;
          "leave_type": Database["public"]["Enums"]["leave_type"];
          "updated_at"?: string;
          "year": number;
        };
        Update: {
          "business_id"?: string;
          "created_at"?: string;
          "days_per_year"?: number;
          "employee_id"?: string;
          "id"?: string;
          "leave_type"?: Database["public"]["Enums"]["leave_type"];
          "updated_at"?: string;
          "year"?: number;
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
      "time_off_requests": {
        Row: {
          "business_id": string;
          "created_at": string;
          "days": number;
          "employee_id": string;
          "ends_on": string;
          "id": string;
          "leave_type": Database["public"]["Enums"]["leave_type"];
          "note": string | null;
          "rejection_reason": string | null;
          "reviewed_at": string | null;
          "reviewed_by": string | null;
          "starts_on": string;
          "status": Database["public"]["Enums"]["time_off_status"];
          "updated_at": string;
        };
        ComputedFields: never;
        Insert: {
          "business_id": string;
          "created_at"?: string;
          "days": number;
          "employee_id": string;
          "ends_on": string;
          "id"?: string;
          "leave_type": Database["public"]["Enums"]["leave_type"];
          "note"?: string | null;
          "rejection_reason"?: string | null;
          "reviewed_at"?: string | null;
          "reviewed_by"?: string | null;
          "starts_on": string;
          "status"?: Database["public"]["Enums"]["time_off_status"];
          "updated_at"?: string;
        };
        Update: {
          "business_id"?: string;
          "created_at"?: string;
          "days"?: number;
          "employee_id"?: string;
          "ends_on"?: string;
          "id"?: string;
          "leave_type"?: Database["public"]["Enums"]["leave_type"];
          "note"?: string | null;
          "rejection_reason"?: string | null;
          "reviewed_at"?: string | null;
          "reviewed_by"?: string | null;
          "starts_on"?: string;
          "status"?: Database["public"]["Enums"]["time_off_status"];
          "updated_at"?: string;
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
    };
    Views: {
      "branch_cards": {
        Row: {
          "address": string | null;
          "amenities": (Database["public"]["Enums"]["amenity"])[];
          "branch_name": string;
          "business_id": string;
          "business_name": string;
          "category_slugs": (string)[] | null;
          "city": string | null;
          "country_code": string;
          "currency": string;
          "description": string | null;
          "id": string;
          "is_open_now": boolean | null;
          "latitude": number | null;
          "logo_path": string | null;
          "longitude": number | null;
          "phone": string | null;
          "rating_avg": number;
          "rating_count": number;
          "share_slug": string | null;
          "timezone": string;
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
      "branch_stock_status": {
        Row: {
          "branch_id": string;
          "brand": string | null;
          "business_id": string;
          "category_id": string | null;
          "cost_per_unit": number | null;
          "id": string;
          "image_path": string | null;
          "is_low_stock": boolean | null;
          "is_out_of_stock": boolean | null;
          "product_id": string;
          "product_name": string;
          "qty_on_hand": number;
          "reorder_threshold": number;
          "sku": string | null;
          "unit": string;
          "updated_at": string;
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
            foreignKeyName: "branch_stock_product_id_business_id_fkey";
            columns: ["product_id", "business_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id", "business_id"];
          },
        ];
      };
      "promoted_branch_cards": {
        Row: {
          "address": string | null;
          "amenities": (Database["public"]["Enums"]["amenity"])[];
          "branch_name": string;
          "business_id": string;
          "business_name": string;
          "category_slugs": (string)[] | null;
          "city": string | null;
          "country_code": string;
          "currency": string;
          "description": string | null;
          "id": string;
          "is_open_now": boolean | null;
          "latitude": number | null;
          "logo_path": string | null;
          "longitude": number | null;
          "phone": string | null;
          "promoted_until": string;
          "promotion_sort_order": number;
          "rating_avg": number;
          "rating_count": number;
          "share_slug": string | null;
          "timezone": string;
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
      "accept_invite": { Args: { "p_token": string }; Returns: Json };
      "add_attendance_event": {
        Args: {
          "p_at": string;
          "p_branch_id": string;
          "p_employee_id": string;
          "p_kind": Database["public"]["Enums"]["attendance_kind"];
          "p_note"?: string;
        };
        Returns: {
          "at": string;
          "branch_id": string;
          "business_id": string;
          "created_at": string;
          "created_by": string | null;
          "employee_id": string;
          "id": string;
          "kind": Database["public"]["Enums"]["attendance_kind"];
          "note": string | null;
          "source": Database["public"]["Enums"]["attendance_source"];
        };
        SetofOptions: {
          from: "*";
          to: "attendance_events";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      "add_payroll_adjustment": {
        Args: {
          "p_amount": number;
          "p_kind": Database["public"]["Enums"]["payroll_adjustment_kind"];
          "p_line_id": string;
          "p_note"?: string;
        };
        Returns: {
          "adjustments_total": number;
          "base_pay": number;
          "branch_id": string;
          "business_id": string;
          "commission": number;
          "commission_revenue": number;
          "created_at": string;
          "employee_id": string;
          "employee_name": string;
          "flags": (string)[];
          "id": string;
          "leave_deduction": number;
          "overtime_hours": number;
          "overtime_pay": number;
          "paid_leave_days": number;
          "paid_leave_pay": number;
          "pay_type": Database["public"]["Enums"]["pay_type"] | null;
          "regular_hours": number;
          "run_id": string;
          "total_pay": number;
          "unpaid_leave_days": number;
          "updated_at": string;
        };
        SetofOptions: {
          from: "*";
          to: "payroll_lines";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      "adjust_stock": {
        Args: { "p_note"?: string; "p_qty_change": number; "p_stock_id": string };
        Returns: {
          "branch_id": string;
          "business_id": string;
          "cost_per_unit": number | null;
          "created_at": string;
          "id": string;
          "product_id": string;
          "qty_on_hand": number;
          "reorder_threshold": number;
          "sku": string | null;
          "updated_at": string;
        };
        SetofOptions: {
          from: "*";
          to: "branch_stock";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      "am_i_platform_admin": { Args: Record<PropertyKey, never>; Returns: boolean };
      "analytics_bookings": {
        Args: { "p_branch_id": string; "p_from": string; "p_to": string };
        Returns: {
          "cancelled": number;
          "completed": number;
          "confirmed": number;
          "day": string;
          "no_show": number;
          "pending": number;
        }[];
      };
      "analytics_inventory_cost": { Args: { "p_branch_id": string; "p_from": string; "p_to": string }; Returns: Json };
      "analytics_next_up": {
        Args: { "p_branch_id": string; "p_limit"?: number };
        Returns: {
          "booking_id": string;
          "customer_first_name": string;
          "employee_id": string;
          "employee_name": string;
          "ends_at": string;
          "item_id": string;
          "service_name": string;
          "starts_at": string;
          "status": Database["public"]["Enums"]["booking_status"];
        }[];
      };
      "analytics_overview": { Args: { "p_branch_id": string }; Returns: Json };
      "analytics_peak_hours": {
        Args: { "p_branch_id": string; "p_from": string; "p_to": string };
        Returns: {
          "bookings": number;
          "day_of_week": number;
          "hour": number;
        }[];
      };
      "analytics_retention": { Args: { "p_branch_id": string; "p_from": string; "p_to": string }; Returns: Json };
      "analytics_revenue": {
        Args: { "p_branch_id": string; "p_from": string; "p_to": string };
        Returns: {
          "completed_items": number;
          "day": string;
          "revenue": number;
        }[];
      };
      "analytics_service_mix": {
        Args: { "p_branch_id": string; "p_from": string; "p_to": string };
        Returns: {
          "completed": number;
          "revenue": number;
          "service_id": string;
          "service_name": string;
        }[];
      };
      "analytics_staff_performance": {
        Args: { "p_branch_id": string; "p_from": string; "p_to": string };
        Returns: {
          "avg_rating": number;
          "cancelled": number;
          "completed": number;
          "employee_id": string;
          "employee_name": string;
          "no_show_rate": number;
          "no_shows": number;
          "revenue": number;
          "reviews": number;
        }[];
      };
      "analytics_staff_today": {
        Args: { "p_branch_id": string };
        Returns: {
          "booked_minutes": number;
          "bookings": number;
          "employee_id": string;
          "employee_name": string;
          "on_time_off": boolean;
          "scheduled_minutes": number;
        }[];
      };
      "archive_employee": { Args: { "p_employee_id": string }; Returns: undefined };
      "attendance_log": {
        Args: { "p_branch_id": string; "p_employee_id"?: string; "p_from": string; "p_to": string };
        Returns: {
          "clock_in": string;
          "clock_out": string;
          "day": string;
          "employee_id": string;
          "employee_name": string;
          "late_minutes": number;
          "left_early_minutes": number;
          "scheduled_end": string;
          "scheduled_minutes": number;
          "scheduled_start": string;
          "status": string;
          "worked_minutes": number;
        }[];
      };
      "availability_inputs": {
        Args: { "p_branch_id": string; "p_date": string; "p_employee_id"?: string; "p_service_id": string };
        Returns: Json;
      };
      "cancel_time_off": { Args: { "p_request_id": string }; Returns: undefined };
      "claim_pending_pushes": { Args: { "p_limit"?: number }; Returns: Json };
      "clock_in": {
        Args: { "p_branch_id": string };
        Returns: {
          "at": string;
          "branch_id": string;
          "business_id": string;
          "created_at": string;
          "created_by": string | null;
          "employee_id": string;
          "id": string;
          "kind": Database["public"]["Enums"]["attendance_kind"];
          "note": string | null;
          "source": Database["public"]["Enums"]["attendance_source"];
        };
        SetofOptions: {
          from: "*";
          to: "attendance_events";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      "clock_out": {
        Args: Record<PropertyKey, never>;
        Returns: {
          "at": string;
          "branch_id": string;
          "business_id": string;
          "created_at": string;
          "created_by": string | null;
          "employee_id": string;
          "id": string;
          "kind": Database["public"]["Enums"]["attendance_kind"];
          "note": string | null;
          "source": Database["public"]["Enums"]["attendance_source"];
        };
        SetofOptions: {
          from: "*";
          to: "attendance_events";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      "copy_branch_setup": { Args: { "p_from_branch_id": string; "p_to_branch_id": string }; Returns: Json };
      "copy_employee_permissions": {
        Args: { "p_employee_id": string; "p_from_branch_id": string; "p_to_branch_ids": (string)[] };
        Returns: undefined;
      };
      "create_booking": {
        Args: {
          "p_actor_user_id": string;
          "p_branch_id": string;
          "p_customer_note"?: string;
          "p_items": Json;
          "p_walk_in"?: Json;
        };
        Returns: Json;
      };
      "create_branch": { Args: { "p_branch": Json }; Returns: string };
      "create_business": {
        Args: { "p_branch": Json; "p_category_ids": (string)[]; "p_name": string; "p_owner"?: Json };
        Returns: Json;
      };
      "create_payroll_run": {
        Args: { "p_branch_id": string; "p_period_end": string; "p_period_start": string };
        Returns: string;
      };
      "decide_time_off": {
        Args: { "p_approve": boolean; "p_reason"?: string; "p_request_id": string };
        Returns: undefined;
      };
      "delete_attendance_event": { Args: { "p_event_id": string }; Returns: undefined };
      "delete_customer_account": { Args: { "p_user_id": string }; Returns: Json };
      "delete_payroll_run": { Args: { "p_run_id": string }; Returns: undefined };
      "forget_push_tokens": { Args: { "p_tokens": (string)[] }; Returns: number };
      "get_branch_customers": {
        Args: { "p_branch_id": string; "p_customer_ids"?: (string)[] };
        Returns: {
          "avatar_path": string;
          "customer_id": string;
          "first_name": string;
          "last_name": string;
          "phone": string;
        }[];
      };
      "get_branch_team": {
        Args: { "p_branch_id": string };
        Returns: {
          "avatar_path": string;
          "bio": string;
          "employee_id": string;
          "first_name": string;
          "job_title": string;
          "last_name": string;
          "service_ids": (string)[];
        }[];
      };
      "get_employee_permissions": { Args: { "p_employee_id": string }; Returns: Json };
      "get_invite_preview": { Args: { "p_token": string }; Returns: Json };
      "get_invite_status": { Args: { "p_employee_id": string }; Returns: Json };
      "get_my_partner_context": { Args: Record<PropertyKey, never>; Returns: Json };
      "get_review_stats": {
        Args: { "p_branch_id": string };
        Returns: {
          "average_rating": number;
          "rating_distribution": Json;
          "total_reviews": number;
        }[];
      };
      "get_segment_members": {
        Args: { "p_segment_id": string };
        Returns: {
          "customer_id": string;
          "email": string;
          "first_name": string;
          "last_name": string;
          "last_visit_days": number;
          "lifetime_spend": number;
          "phone": string;
          "visit_count": number;
        }[];
      };
      "get_segments": { Args: Record<PropertyKey, never>; Returns: Json };
      "get_time_off_balance": {
        Args: { "p_employee_id": string; "p_year"?: number };
        Returns: {
          "approved": number;
          "entitled": number;
          "leave_type": Database["public"]["Enums"]["leave_type"];
          "pending": number;
          "remaining": number;
        }[];
      };
      "invite_employee": {
        Args: {
          "p_branch_ids": (string)[];
          "p_first_name": string;
          "p_job_title"?: string;
          "p_last_name"?: string;
          "p_phone"?: string;
        };
        Returns: Json;
      };
      "mark_messages_read": { Args: { "p_booking_id": string }; Returns: number };
      "recalculate_payroll_run": { Args: { "p_run_id": string }; Returns: undefined };
      "regenerate_invite": { Args: { "p_employee_id": string }; Returns: Json };
      "register_push_token": {
        Args: {
          "p_app": Database["public"]["Enums"]["app_kind"];
          "p_platform": Database["public"]["Enums"]["device_platform"];
          "p_token": string;
        };
        Returns: undefined;
      };
      "remove_payroll_adjustment": {
        Args: { "p_adjustment_id": string };
        Returns: {
          "adjustments_total": number;
          "base_pay": number;
          "branch_id": string;
          "business_id": string;
          "commission": number;
          "commission_revenue": number;
          "created_at": string;
          "employee_id": string;
          "employee_name": string;
          "flags": (string)[];
          "id": string;
          "leave_deduction": number;
          "overtime_hours": number;
          "overtime_pay": number;
          "paid_leave_days": number;
          "paid_leave_pay": number;
          "pay_type": Database["public"]["Enums"]["pay_type"] | null;
          "regular_hours": number;
          "run_id": string;
          "total_pay": number;
          "unpaid_leave_days": number;
          "updated_at": string;
        };
        SetofOptions: {
          from: "*";
          to: "payroll_lines";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      "reply_to_review": { Args: { "p_reply": string; "p_review_id": string }; Returns: undefined };
      "request_document_signature": {
        Args: { "p_document_id": string };
        Returns: {
          "business_id": string;
          "category": Database["public"]["Enums"]["document_category"];
          "created_at": string;
          "employee_id": string | null;
          "expires_on": string | null;
          "file_path": string;
          "id": string;
          "name": string;
          "sign_status": Database["public"]["Enums"]["document_sign_status"];
          "signature_requested_at": string | null;
          "signed_at": string | null;
          "updated_at": string;
          "uploaded_by": string | null;
        };
        SetofOptions: {
          from: "*";
          to: "employee_documents";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      "request_time_off": {
        Args: {
          "p_ends_on": string;
          "p_leave_type": Database["public"]["Enums"]["leave_type"];
          "p_note"?: string;
          "p_starts_on": string;
        };
        Returns: string;
      };
      "reschedule_booking_item": {
        Args: { "p_actor_user_id": string; "p_employee_id"?: string; "p_item_id": string; "p_starts_at": string };
        Returns: Json;
      };
      "resolve_payroll_flag": {
        Args: { "p_flag": string; "p_line_id": string };
        Returns: {
          "adjustments_total": number;
          "base_pay": number;
          "branch_id": string;
          "business_id": string;
          "commission": number;
          "commission_revenue": number;
          "created_at": string;
          "employee_id": string;
          "employee_name": string;
          "flags": (string)[];
          "id": string;
          "leave_deduction": number;
          "overtime_hours": number;
          "overtime_pay": number;
          "paid_leave_days": number;
          "paid_leave_pay": number;
          "pay_type": Database["public"]["Enums"]["pay_type"] | null;
          "regular_hours": number;
          "run_id": string;
          "total_pay": number;
          "unpaid_leave_days": number;
          "updated_at": string;
        };
        SetofOptions: {
          from: "*";
          to: "payroll_lines";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      "restock_product": {
        Args: {
          "p_note"?: string;
          "p_qty": number;
          "p_stock_id": string;
          "p_supplier"?: string;
          "p_unit_cost"?: number;
        };
        Returns: {
          "branch_id": string;
          "business_id": string;
          "cost_per_unit": number | null;
          "created_at": string;
          "id": string;
          "product_id": string;
          "qty_on_hand": number;
          "reorder_threshold": number;
          "sku": string | null;
          "updated_at": string;
        };
        SetofOptions: {
          from: "*";
          to: "branch_stock";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      "revoke_invite": { Args: { "p_employee_id": string }; Returns: undefined };
      "save_segment": {
        Args: {
          "p_color"?: string;
          "p_description"?: string;
          "p_match"?: Database["public"]["Enums"]["segment_match"];
          "p_name": string;
          "p_rules": Json;
          "p_segment_id": string;
        };
        Returns: string;
      };
      "search_branches": {
        Args: {
          "p_category_slugs"?: (string)[];
          "p_lat"?: number;
          "p_limit"?: number;
          "p_lng"?: number;
          "p_min_rating"?: number;
          "p_offset"?: number;
          "p_open_on"?: string;
          "p_query"?: string;
          "p_radius_km"?: number;
        };
        Returns: {
          "address": string;
          "branch_name": string;
          "business_id": string;
          "business_name": string;
          "category_slugs": (string)[];
          "city": string;
          "description": string | null;
          "distance_km": number;
          "id": string;
          "is_open_now": boolean;
          "latitude": number;
          "logo_path": string;
          "longitude": number;
          "phone": string | null;
          "rating_avg": number;
          "rating_count": number;
          "timezone": string;
        }[];
      };
      "set_branch_status": {
        Args: { "p_branch_id": string; "p_status": Database["public"]["Enums"]["branch_status"] };
        Returns: undefined;
      };
      "set_employee_branches": { Args: { "p_branch_ids": (string)[]; "p_employee_id": string }; Returns: undefined };
      "set_employee_permissions": {
        Args: { "p_branch_id": string; "p_employee_id": string; "p_keys": (string)[] };
        Returns: (string)[];
      };
      "set_owner": { Args: { "p_employee_id": string; "p_is_owner": boolean }; Returns: undefined };
      "set_payroll_run_status": {
        Args: { "p_run_id": string; "p_status": Database["public"]["Enums"]["payroll_run_status"] };
        Returns: {
          "approved_at": string | null;
          "approved_by": string | null;
          "branch_id": string;
          "business_id": string;
          "created_at": string;
          "created_by": string | null;
          "id": string;
          "paid_at": string | null;
          "period_end": string;
          "period_start": string;
          "status": Database["public"]["Enums"]["payroll_run_status"];
          "updated_at": string;
        };
        SetofOptions: {
          from: "*";
          to: "payroll_runs";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      "sign_document": {
        Args: { "p_document_id": string };
        Returns: {
          "business_id": string;
          "category": Database["public"]["Enums"]["document_category"];
          "created_at": string;
          "employee_id": string | null;
          "expires_on": string | null;
          "file_path": string;
          "id": string;
          "name": string;
          "sign_status": Database["public"]["Enums"]["document_sign_status"];
          "signature_requested_at": string | null;
          "signed_at": string | null;
          "updated_at": string;
          "uploaded_by": string | null;
        };
        SetofOptions: {
          from: "*";
          to: "employee_documents";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      "track_product": {
        Args: {
          "p_branch_id": string;
          "p_product_id": string;
          "p_qty"?: number;
          "p_reorder_threshold"?: number;
          "p_sku"?: string;
          "p_unit_cost"?: number;
        };
        Returns: string;
      };
      "transition_booking": {
        Args: {
          "p_booking_id": string;
          "p_reason"?: string;
          "p_to_status": Database["public"]["Enums"]["booking_status"];
        };
        Returns: Json;
      };
    };
    Enums: {
      "amenity": "parking" | "card_payments" | "wheelchair_accessible" | "wifi" | "kids_friendly";
      "app_kind": "customer" | "partner";
      "attendance_kind": "clock_in" | "clock_out";
      "attendance_source": "app" | "manual";
      "booking_mode": "specialist" | "capacity";
      "booking_source": "app" | "staff";
      "booking_status": "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
      "branch_status": "draft" | "active" | "closed";
      "device_platform": "ios" | "android" | "web";
      "document_category": "contracts" | "certifications" | "identification" | "payslips" | "policies" | "others";
      "document_sign_status": "none" | "pending" | "signed";
      "employee_status": "invited" | "active" | "archived";
      "gender": "male" | "female";
      "leave_type": "annual" | "sick" | "emergency" | "unpaid" | "maternity" | "paternity" | "public_holiday";
      "message_sender": "customer" | "branch";
      "notification_type":
        | "booking_created"
        | "booking_confirmed"
        | "booking_rescheduled"
        | "booking_cancelled"
        | "booking_reminder"
        | "pickup_ready"
        | "message_received"
        | "review_received"
        | "time_off_decided"
        | "general";
      "pay_type": "hourly" | "salaried";
      "payroll_adjustment_kind": "bonus" | "deduction";
      "payroll_run_status": "draft" | "review" | "approved" | "paid";
      "segment_field": "lifetime_spend" | "visit_count" | "last_visit_days";
      "segment_match": "all" | "any";
      "segment_operator": "lt" | "lte" | "gt" | "gte" | "eq";
      "stock_movement_type": "restock" | "consumption" | "adjustment";
      "support_ticket_status": "open" | "in_progress" | "resolved";
      "time_off_status": "pending" | "approved" | "rejected" | "cancelled";
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof (
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]
    )
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? (
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]
  )[TableName] extends {
    Row: infer R;
  } ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    } ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  } ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    } ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  } ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    } ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  "public": {
    Enums: {
      "amenity": ["parking", "card_payments", "wheelchair_accessible", "wifi", "kids_friendly"],
      "app_kind": ["customer", "partner"],
      "attendance_kind": ["clock_in", "clock_out"],
      "attendance_source": ["app", "manual"],
      "booking_mode": ["specialist", "capacity"],
      "booking_source": ["app", "staff"],
      "booking_status": ["pending", "confirmed", "completed", "cancelled", "no_show"],
      "branch_status": ["draft", "active", "closed"],
      "device_platform": ["ios", "android", "web"],
      "document_category": ["contracts", "certifications", "identification", "payslips", "policies", "others"],
      "document_sign_status": ["none", "pending", "signed"],
      "employee_status": ["invited", "active", "archived"],
      "gender": ["male", "female"],
      "leave_type": ["annual", "sick", "emergency", "unpaid", "maternity", "paternity", "public_holiday"],
      "message_sender": ["customer", "branch"],
      "notification_type": [
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
      ],
      "pay_type": ["hourly", "salaried"],
      "payroll_adjustment_kind": ["bonus", "deduction"],
      "payroll_run_status": ["draft", "review", "approved", "paid"],
      "segment_field": ["lifetime_spend", "visit_count", "last_visit_days"],
      "segment_match": ["all", "any"],
      "segment_operator": ["lt", "lte", "gt", "gte", "eq"],
      "stock_movement_type": ["restock", "consumption", "adjustment"],
      "support_ticket_status": ["open", "in_progress", "resolved"],
      "time_off_status": ["pending", "approved", "rejected", "cancelled"],
    },
  },
} as const;
