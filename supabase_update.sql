-- =====================================================
-- Thomas Health Pro - Database Extensions
-- Ejecutar en el Editor SQL de Supabase
-- =====================================================

-- 1. Actualizar tabla anthropometry
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='anthropometry' AND column_name='height_cm') THEN
        ALTER TABLE anthropometry ADD COLUMN height_cm DECIMAL(5,2) DEFAULT 170.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='anthropometry' AND column_name='gender') THEN
        ALTER TABLE anthropometry ADD COLUMN gender TEXT DEFAULT 'male';
    END IF;
END $$;

-- 2. Tabla para planes de dieta
CREATE TABLE IF NOT EXISTS public.health_diets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_name TEXT NOT NULL,
    meals JSONB NOT NULL, -- Estructura de 7 días
    calories_target INTEGER,
    macros_target JSONB, -- {protein, carbs, fats}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla para planes de entrenamiento
CREATE TABLE IF NOT EXISTS public.health_workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_name TEXT NOT NULL,
    exercises JSONB NOT NULL, -- Lista de ejercicios por día/rutina
    difficulty TEXT DEFAULT 'intermediate',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla para registro de logs
CREATE TABLE IF NOT EXISTS public.health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    log_type TEXT NOT NULL, -- 'meal_completion', 'workout_completion'
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Seguridad (RLS)
ALTER TABLE public.health_diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Daniel (usuario único 000...001)
DROP POLICY IF EXISTS "Users can view own diets" ON public.health_diets;
CREATE POLICY "Users can view own diets" ON public.health_diets FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001');
DROP POLICY IF EXISTS "Users can insert own diets" ON public.health_diets;
CREATE POLICY "Users can insert own diets" ON public.health_diets FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');
DROP POLICY IF EXISTS "Users can update own diets" ON public.health_diets;
CREATE POLICY "Users can update own diets" ON public.health_diets FOR UPDATE USING (user_id = '00000000-0000-0000-0000-000000000001');

DROP POLICY IF EXISTS "Users can view own workouts" ON public.health_workouts;
CREATE POLICY "Users can view own workouts" ON public.health_workouts FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001');
DROP POLICY IF EXISTS "Users can insert own workouts" ON public.health_workouts;
CREATE POLICY "Users can insert own workouts" ON public.health_workouts FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');

DROP POLICY IF EXISTS "Users can view own logs" ON public.health_logs;
CREATE POLICY "Users can view own logs" ON public.health_logs FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001');
DROP POLICY IF EXISTS "Users can insert own logs" ON public.health_logs;
CREATE POLICY "Users can insert own logs" ON public.health_logs FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');
