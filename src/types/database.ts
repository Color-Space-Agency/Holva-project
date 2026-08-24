export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          role: UserRole
          factory_id: string | null
          is_active: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          factory_id?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          factory_id?: string | null
          is_active?: boolean
        }
      }
      factories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          address: string | null
          phone: string | null
          telegram: string | null
          logo_url: string | null
          currency: string
          timezone: string
          language: string
          settings: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          address?: string | null
          phone?: string | null
          telegram?: string | null
          logo_url?: string | null
          currency?: string
          timezone?: string
          language?: string
          settings?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          address?: string | null
          phone?: string | null
          telegram?: string | null
          logo_url?: string | null
          currency?: string
          timezone?: string
          language?: string
          settings?: Json
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          created_by: string | null
          factory_id: string
          name: string
          sku: string
          barcode: string | null
          category_id: string | null
          description: string | null
          unit_id: string | null
          sales_price: number
          wholesale_price: number
          minimum_price: number
          packaging_type: string | null
          package_weight: number | null
          image_url: string | null
          status: ProductStatus
          deleted_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          factory_id: string
          name: string
          sku: string
          barcode?: string | null
          category_id?: string | null
          description?: string | null
          unit_id?: string | null
          sales_price?: number
          wholesale_price?: number
          minimum_price?: number
          packaging_type?: string | null
          package_weight?: number | null
          image_url?: string | null
          status?: ProductStatus
          deleted_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          factory_id?: string
          name?: string
          sku?: string
          barcode?: string | null
          category_id?: string | null
          description?: string | null
          unit_id?: string | null
          sales_price?: number
          wholesale_price?: number
          minimum_price?: number
          packaging_type?: string | null
          package_weight?: number | null
          image_url?: string | null
          status?: ProductStatus
          deleted_at?: string | null
        }
      }
      product_categories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          factory_id: string
          name: string
          description: string | null
          color: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          factory_id: string
          name: string
          description?: string | null
          color?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
        }
      }
      product_units: {
        Row: {
          id: string
          created_at: string
          factory_id: string
          name: string
          symbol: string
        }
        Insert: {
          id?: string
          created_at?: string
          factory_id: string
          name: string
          symbol: string
        }
        Update: {
          id?: string
          name?: string
          symbol?: string
        }
      }
      raw_materials: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          created_by: string | null
          factory_id: string
          name: string
          sku: string
          category_id: string | null
          unit_id: string | null
          supplier_id: string | null
          purchase_price: number
          minimum_stock: number
          maximum_stock: number
          current_stock: number
          status: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          factory_id: string
          name: string
          sku: string
          category_id?: string | null
          unit_id?: string | null
          supplier_id?: string | null
          purchase_price?: number
          minimum_stock?: number
          maximum_stock?: number
          current_stock?: number
          status?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          sku?: string
          category_id?: string | null
          unit_id?: string | null
          supplier_id?: string | null
          purchase_price?: number
          minimum_stock?: number
          maximum_stock?: number
          current_stock?: number
          status?: string
          deleted_at?: string | null
        }
      }
      raw_material_categories: {
        Row: {
          id: string
          created_at: string
          factory_id: string
          name: string
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          factory_id: string
          name: string
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
        }
      }
      raw_material_suppliers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          factory_id: string
          name: string
          phone: string | null
          address: string | null
          contact_person: string | null
          notes: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          factory_id: string
          name: string
          phone?: string | null
          address?: string | null
          contact_person?: string | null
          notes?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          address?: string | null
          contact_person?: string | null
          notes?: string | null
          is_active?: boolean
        }
      }
      recipes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          created_by: string | null
          factory_id: string
          product_id: string
          name: string
          version: number
          yield_quantity: number
          yield_unit_id: string | null
          instructions: string | null
          status: RecipeStatus
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          factory_id: string
          product_id: string
          name: string
          version?: number
          yield_quantity?: number
          yield_unit_id?: string | null
          instructions?: string | null
          status?: RecipeStatus
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          version?: number
          yield_quantity?: number
          yield_unit_id?: string | null
          instructions?: string | null
          status?: RecipeStatus
          is_active?: boolean
        }
      }
      recipe_items: {
        Row: {
          id: string
          created_at: string
          recipe_id: string
          raw_material_id: string
          quantity: number
          unit_id: string | null
          quantity_per_kg: number
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          recipe_id: string
          raw_material_id: string
          quantity: number
          unit_id?: string | null
          quantity_per_kg?: number
          notes?: string | null
        }
        Update: {
          id?: string
          quantity?: number
          unit_id?: string | null
          quantity_per_kg?: number
          notes?: string | null
        }
      }
      warehouses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          factory_id: string
          name: string
          type: WarehouseType
          address: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          factory_id: string
          name: string
          type?: WarehouseType
          address?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          type?: WarehouseType
          address?: string | null
          is_active?: boolean
        }
      }
      inventory: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          factory_id: string
          warehouse_id: string
          product_id: string | null
          raw_material_id: string | null
          item_type: InventoryItemType
          current_stock: number
          reserved_stock: number
          damaged_stock: number
          unit_id: string | null
          minimum_stock: number
          maximum_stock: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          factory_id: string
          warehouse_id: string
          product_id?: string | null
          raw_material_id?: string | null
          item_type: InventoryItemType
          current_stock?: number
          reserved_stock?: number
          damaged_stock?: number
          unit_id?: string | null
          minimum_stock?: number
          maximum_stock?: number
        }
        Update: {
          id?: string
          current_stock?: number
          reserved_stock?: number
          damaged_stock?: number
          minimum_stock?: number
          maximum_stock?: number
        }
      }
      inventory_movements: {
        Row: {
          id: string
          created_at: string
          created_by: string | null
          factory_id: string
          inventory_id: string
          movement_type: MovementType
          quantity: number
          unit_id: string | null
          from_warehouse_id: string | null
          to_warehouse_id: string | null
          reference_type: string | null
          reference_id: string | null
          reason: string | null
          notes: string | null
          before_stock: number
          after_stock: number
        }
        Insert: {
          id?: string
          created_at?: string
          created_by?: string | null
          factory_id: string
          inventory_id: string
          movement_type: MovementType
          quantity: number
          unit_id?: string | null
          from_warehouse_id?: string | null
          to_warehouse_id?: string | null
          reference_type?: string | null
          reference_id?: string | null
          reason?: string | null
          notes?: string | null
          before_stock: number
          after_stock: number
        }
        Update: {
          id?: string
        }
      }
      production_batches: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          created_by: string | null
          factory_id: string
          batch_number: string
          product_id: string
          recipe_id: string
          planned_quantity: number
          actual_quantity: number | null
          waste_quantity: number | null
          defect_quantity: number | null
          unit_id: string | null
          production_date: string
          start_time: string | null
          end_time: string | null
          status: ProductionStatus
          responsible_employee_id: string | null
          total_cost: number | null
          cost_per_unit: number | null
          efficiency: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          factory_id: string
          batch_number?: string
          product_id: string
          recipe_id: string
          planned_quantity: number
          actual_quantity?: number | null
          waste_quantity?: number | null
          defect_quantity?: number | null
          unit_id?: string | null
          production_date: string
          start_time?: string | null
          end_time?: string | null
          status?: ProductionStatus
          responsible_employee_id?: string | null
          total_cost?: number | null
          cost_per_unit?: number | null
          efficiency?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          actual_quantity?: number | null
          waste_quantity?: number | null
          defect_quantity?: number | null
          start_time?: string | null
          end_time?: string | null
          status?: ProductionStatus
          total_cost?: number | null
          cost_per_unit?: number | null
          efficiency?: number | null
          notes?: string | null
        }
      }
      production_consumption: {
        Row: {
          id: string
          created_at: string
          batch_id: string
          raw_material_id: string
          planned_quantity: number
          actual_quantity: number | null
          unit_id: string | null
          waste_quantity: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          batch_id: string
          raw_material_id: string
          planned_quantity: number
          actual_quantity?: number | null
          unit_id?: string | null
          waste_quantity?: number | null
        }
        Update: {
          id?: string
          actual_quantity?: number | null
          waste_quantity?: number | null
        }
      }
      departments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          factory_id: string
          name: string
          description: string | null
          manager_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          factory_id: string
          name: string
          description?: string | null
          manager_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          manager_id?: string | null
        }
      }
      positions: {
        Row: {
          id: string
          created_at: string
          factory_id: string
          department_id: string | null
          name: string
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          factory_id: string
          department_id?: string | null
          name: string
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
        }
      }
      employees: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          factory_id: string
          profile_id: string | null
          full_name: string
          phone: string | null
          email: string | null
          photo_url: string | null
          department_id: string | null
          position_id: string | null
          employment_date: string
          employment_status: EmploymentStatus
          salary_type: SalaryType
          salary_amount: number
          emergency_contact: string | null
          notes: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          factory_id: string
          profile_id?: string | null
          full_name: string
          phone?: string | null
          email?: string | null
          photo_url?: string | null
          department_id?: string | null
          position_id?: string | null
          employment_date: string
          employment_status?: EmploymentStatus
          salary_type?: SalaryType
          salary_amount?: number
          emergency_contact?: string | null
          notes?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          email?: string | null
          photo_url?: string | null
          department_id?: string | null
          position_id?: string | null
          employment_status?: EmploymentStatus
          salary_type?: SalaryType
          salary_amount?: number
          emergency_contact?: string | null
          notes?: string | null
          deleted_at?: string | null
        }
      }
      employee_attendance: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          factory_id: string
          employee_id: string
          date: string
          check_in: string | null
          check_out: string | null
          status: AttendanceStatus
          working_hours: number | null
          late_minutes: number | null
          notes: string | null
          recorded_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          factory_id: string
          employee_id: string
          date: string
          check_in?: string | null
          check_out?: string | null
          status?: AttendanceStatus
          working_hours?: number | null
          late_minutes?: number | null
          notes?: string | null
          recorded_by?: string | null
        }
        Update: {
          id?: string
          check_in?: string | null
          check_out?: string | null
          status?: AttendanceStatus
          working_hours?: number | null
          late_minutes?: number | null
          notes?: string | null
        }
      }
      employee_salary_records: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          factory_id: string
          employee_id: string
          period_month: number
          period_year: number
          base_salary: number
          worked_days: number
          worked_hours: number
          bonuses: number
          deductions: number
          advance_payments: number
          final_salary: number
          paid_amount: number
          remaining_amount: number
          payment_date: string | null
          status: SalaryStatus
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          factory_id: string
          employee_id: string
          period_month: number
          period_year: number
          base_salary: number
          worked_days?: number
          worked_hours?: number
          bonuses?: number
          deductions?: number
          advance_payments?: number
          final_salary: number
          paid_amount?: number
          remaining_amount?: number
          payment_date?: string | null
          status?: SalaryStatus
          notes?: string | null
        }
        Update: {
          id?: string
          bonuses?: number
          deductions?: number
          advance_payments?: number
          final_salary?: number
          paid_amount?: number
          remaining_amount?: number
          payment_date?: string | null
          status?: SalaryStatus
          notes?: string | null
        }
      }
      stores: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          created_by: string | null
          factory_id: string
          name: string
          phone: string | null
          address: string | null
          contact_person: string | null
          telegram: string | null
          notes: string | null
          payment_terms: string | null
          credit_limit: number
          current_balance: number
          status: StoreStatus
          deleted_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          factory_id: string
          name: string
          phone?: string | null
          address?: string | null
          contact_person?: string | null
          telegram?: string | null
          notes?: string | null
          payment_terms?: string | null
          credit_limit?: number
          current_balance?: number
          status?: StoreStatus
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          address?: string | null
          contact_person?: string | null
          telegram?: string | null
          notes?: string | null
          payment_terms?: string | null
          credit_limit?: number
          current_balance?: number
          status?: StoreStatus
          deleted_at?: string | null
        }
      }
      sales_agents: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          factory_id: string
          profile_id: string
          employee_id: string | null
          commission_rate: number
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          factory_id: string
          profile_id: string
          employee_id?: string | null
          commission_rate?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          commission_rate?: number
          is_active?: boolean
        }
      }
      agent_store_assignments: {
        Row: {
          id: string
          created_at: string
          agent_id: string
          store_id: string
          assigned_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          agent_id: string
          store_id: string
          assigned_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          is_active?: boolean
        }
      }
      agent_visits: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          agent_id: string
          store_id: string
          visit_date: string
          start_time: string | null
          end_time: string | null
          status: VisitStatus
          notes: string | null
          photo_url: string | null
          customer_feedback: string | null
          order_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          agent_id: string
          store_id: string
          visit_date?: string
          start_time?: string | null
          end_time?: string | null
          status?: VisitStatus
          notes?: string | null
          photo_url?: string | null
          customer_feedback?: string | null
          order_id?: string | null
        }
        Update: {
          id?: string
          end_time?: string | null
          status?: VisitStatus
          notes?: string | null
          photo_url?: string | null
          customer_feedback?: string | null
          order_id?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          created_by: string | null
          factory_id: string
          order_number: string
          store_id: string
          agent_id: string | null
          subtotal: number
          discount_amount: number
          total_amount: number
          paid_amount: number
          debt_amount: number
          payment_method: PaymentMethod | null
          payment_status: PaymentStatus
          status: OrderStatus
          notes: string | null
          delivery_date: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          factory_id: string
          order_number?: string
          store_id: string
          agent_id?: string | null
          subtotal?: number
          discount_amount?: number
          total_amount?: number
          paid_amount?: number
          debt_amount?: number
          payment_method?: PaymentMethod | null
          payment_status?: PaymentStatus
          status?: OrderStatus
          notes?: string | null
          delivery_date?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          subtotal?: number
          discount_amount?: number
          total_amount?: number
          paid_amount?: number
          debt_amount?: number
          payment_method?: PaymentMethod | null
          payment_status?: PaymentStatus
          status?: OrderStatus
          notes?: string | null
          delivery_date?: string | null
          deleted_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          discount_amount: number
          total_price: number
          unit_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          discount_amount?: number
          total_price: number
          unit_id?: string | null
        }
        Update: {
          id?: string
          quantity?: number
          unit_price?: number
          discount_amount?: number
          total_price?: number
        }
      }
      order_payments: {
        Row: {
          id: string
          created_at: string
          created_by: string | null
          order_id: string
          amount: number
          payment_method: PaymentMethod
          payment_date: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          created_by?: string | null
          order_id: string
          amount: number
          payment_method: PaymentMethod
          payment_date?: string
          notes?: string | null
        }
        Update: {
          id?: string
        }
      }
      order_status_history: {
        Row: {
          id: string
          created_at: string
          created_by: string | null
          order_id: string
          status: OrderStatus
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          created_by?: string | null
          order_id: string
          status: OrderStatus
          notes?: string | null
        }
        Update: {
          id?: string
        }
      }
      deliveries: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          created_by: string | null
          factory_id: string
          delivery_number: string
          order_id: string | null
          store_id: string
          total_amount: number
          delivery_date: string
          driver_name: string | null
          vehicle_info: string | null
          status: DeliveryStatus
          notes: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          factory_id: string
          delivery_number?: string
          order_id?: string | null
          store_id: string
          total_amount?: number
          delivery_date: string
          driver_name?: string | null
          vehicle_info?: string | null
          status?: DeliveryStatus
          notes?: string | null
          delivered_at?: string | null
        }
        Update: {
          id?: string
          delivery_date?: string
          driver_name?: string | null
          vehicle_info?: string | null
          status?: DeliveryStatus
          notes?: string | null
          delivered_at?: string | null
        }
      }
      delivery_items: {
        Row: {
          id: string
          created_at: string
          delivery_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          unit_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          delivery_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          unit_id?: string | null
        }
        Update: {
          id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      cash_registers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          factory_id: string
          name: string
          currency: string
          current_balance: number
          opening_balance: number
          is_open: boolean
          opened_by: string | null
          opened_at: string | null
          closed_by: string | null
          closed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          factory_id: string
          name: string
          currency?: string
          current_balance?: number
          opening_balance?: number
          is_open?: boolean
          opened_by?: string | null
          opened_at?: string | null
          closed_by?: string | null
          closed_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          current_balance?: number
          is_open?: boolean
          opened_by?: string | null
          opened_at?: string | null
          closed_by?: string | null
          closed_at?: string | null
        }
      }
      cash_transactions: {
        Row: {
          id: string
          created_at: string
          created_by: string | null
          factory_id: string
          register_id: string
          type: TransactionType
          amount: number
          category: string | null
          description: string | null
          payment_method: PaymentMethod
          reference_type: string | null
          reference_id: string | null
          before_balance: number
          after_balance: number
        }
        Insert: {
          id?: string
          created_at?: string
          created_by?: string | null
          factory_id: string
          register_id: string
          type: TransactionType
          amount: number
          category?: string | null
          description?: string | null
          payment_method?: PaymentMethod
          reference_type?: string | null
          reference_id?: string | null
          before_balance: number
          after_balance: number
        }
        Update: {
          id?: string
        }
      }
      expenses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          created_by: string | null
          factory_id: string
          category: ExpenseCategory
          amount: number
          description: string | null
          payment_method: PaymentMethod
          expense_date: string
          register_id: string | null
          reference_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          factory_id: string
          category: ExpenseCategory
          amount: number
          description?: string | null
          payment_method?: PaymentMethod
          expense_date?: string
          register_id?: string | null
          reference_id?: string | null
        }
        Update: {
          id?: string
          category?: ExpenseCategory
          amount?: number
          description?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          factory_id: string
          user_id: string | null
          title: string
          message: string
          type: NotificationType
          priority: NotificationPriority
          is_read: boolean
          reference_type: string | null
          reference_id: string | null
          read_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          factory_id: string
          user_id?: string | null
          title: string
          message: string
          type: NotificationType
          priority?: NotificationPriority
          is_read?: boolean
          reference_type?: string | null
          reference_id?: string | null
          read_at?: string | null
        }
        Update: {
          id?: string
          is_read?: boolean
          read_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          created_at: string
          factory_id: string | null
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          factory_id?: string | null
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
        }
      }
      agent_commissions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          factory_id: string
          agent_id: string
          period_month: number
          period_year: number
          total_sales: number
          commission_rate: number
          commission_amount: number
          paid_amount: number
          remaining_amount: number
          status: CommissionStatus
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          factory_id: string
          agent_id: string
          period_month: number
          period_year: number
          total_sales?: number
          commission_rate?: number
          commission_amount?: number
          paid_amount?: number
          remaining_amount?: number
          status?: CommissionStatus
        }
        Update: {
          id?: string
          total_sales?: number
          commission_amount?: number
          paid_amount?: number
          remaining_amount?: number
          status?: CommissionStatus
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      product_status: ProductStatus
      recipe_status: RecipeStatus
      warehouse_type: WarehouseType
      inventory_item_type: InventoryItemType
      movement_type: MovementType
      production_status: ProductionStatus
      employment_status: EmploymentStatus
      salary_type: SalaryType
      salary_status: SalaryStatus
      attendance_status: AttendanceStatus
      store_status: StoreStatus
      order_status: OrderStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      delivery_status: DeliveryStatus
      transaction_type: TransactionType
      expense_category: ExpenseCategory
      notification_type: NotificationType
      notification_priority: NotificationPriority
      visit_status: VisitStatus
      commission_status: CommissionStatus
    }
  }
}

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SALES_AGENT"
  | "WAREHOUSE_MANAGER"
  | "PRODUCTION_MANAGER"
  | "ACCOUNTANT"
  | "WORKER"

export type ProductStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED"
export type RecipeStatus = "DRAFT" | "ACTIVE" | "ARCHIVED"
export type WarehouseType = "RAW_MATERIALS" | "FINISHED_GOODS" | "GENERAL"
export type InventoryItemType = "PRODUCT" | "RAW_MATERIAL"
export type MovementType = "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT" | "WASTE" | "PRODUCTION"
export type ProductionStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
export type EmploymentStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "TERMINATED"
export type SalaryType = "MONTHLY" | "DAILY" | "HOURLY" | "PERFORMANCE"
export type SalaryStatus = "DRAFT" | "APPROVED" | "PAID" | "PARTIALLY_PAID"
export type AttendanceStatus = "PRESENT" | "CHECKED_OUT" | "LATE" | "ABSENT_EXCUSED" | "ABSENT_UNEXCUSED" | "VACATION"
export type StoreStatus = "ACTIVE" | "INACTIVE" | "BLOCKED"
export type OrderStatus = "DRAFT" | "CONFIRMED" | "PREPARING" | "READY" | "DELIVERING" | "DELIVERED" | "CANCELLED"
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE"
export type PaymentMethod = "CASH" | "CARD" | "BANK" | "OTHER"
export type DeliveryStatus = "PENDING" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED" | "CANCELLED"
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER"
export type ExpenseCategory = "RAW_MATERIALS" | "SALARY" | "RENT" | "ELECTRICITY" | "TRANSPORT" | "PACKAGING" | "MAINTENANCE" | "OTHER"
export type NotificationType = "LOW_STOCK" | "NEW_ORDER" | "ORDER_STATUS" | "ORDER_DELIVERED" | "PAYMENT_RECEIVED" | "STORE_DEBT" | "OVERDUE_DEBT" | "PRODUCTION_COMPLETED" | "PRODUCTION_ISSUE" | "EMPLOYEE_ABSENT" | "EMPLOYEE_LATE" | "SALARY_DUE"
export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type VisitStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
export type CommissionStatus = "PENDING" | "APPROVED" | "PAID"
