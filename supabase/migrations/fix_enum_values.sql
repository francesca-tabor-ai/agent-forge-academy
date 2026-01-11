-- Manual fix: Add missing enum values to offer_category
-- Run this in Supabase SQL Editor BEFORE running the seed migration
-- This must be run in a separate transaction from the seed migration

-- Add 'database' enum value
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'database' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'offer_category')
    ) THEN
        ALTER TYPE offer_category ADD VALUE 'database';
    END IF;
END $$;

-- Add 'vector_database' enum value
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'vector_database' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'offer_category')
    ) THEN
        ALTER TYPE offer_category ADD VALUE 'vector_database';
    END IF;
END $$;

-- Add 'ai_llm' enum value
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'ai_llm' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'offer_category')
    ) THEN
        ALTER TYPE offer_category ADD VALUE 'ai_llm';
    END IF;
END $$;

-- Add 'observability' enum value
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'observability' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'offer_category')
    ) THEN
        ALTER TYPE offer_category ADD VALUE 'observability';
    END IF;
END $$;

-- Add 'analytics' enum value
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'analytics' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'offer_category')
    ) THEN
        ALTER TYPE offer_category ADD VALUE 'analytics';
    END IF;
END $$;

-- Add 'ml_tools' enum value
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'ml_tools' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'offer_category')
    ) THEN
        ALTER TYPE offer_category ADD VALUE 'ml_tools';
    END IF;
END $$;
