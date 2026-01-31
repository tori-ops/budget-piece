-- Wedding Budget Tool - Complete Database Schema
-- Generated from Prisma schema for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Profiles table (user profile data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  is_planner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS profiles_display_name_idx ON profiles(display_name);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- RLS: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  wedding_date TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  purge_receipts_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'DRAFT',
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS events_created_by_user_id_idx ON events(created_by_user_id);

-- EventMembers table
CREATE TABLE IF NOT EXISTS event_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'HELPER_VIEWER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS event_members_event_id_idx ON event_members(event_id);
CREATE INDEX IF NOT EXISTS event_members_user_id_idx ON event_members(user_id);

-- UserEventState table
CREATE TABLE IF NOT EXISTS user_event_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  has_seen_intro BOOLEAN DEFAULT FALSE,
  seen_intro_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS user_event_states_event_id_idx ON user_event_states(event_id);
CREATE INDEX IF NOT EXISTS user_event_states_user_id_idx ON user_event_states(user_id);

-- BudgetScenarios table
CREATE TABLE IF NOT EXISTS budget_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  inputs JSONB DEFAULT '{}',
  total_budget_cents INTEGER DEFAULT 3000000,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, name)
);

CREATE INDEX IF NOT EXISTS budget_scenarios_event_id_idx ON budget_scenarios(event_id);
CREATE INDEX IF NOT EXISTS budget_scenarios_is_primary_idx ON budget_scenarios(is_primary);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID,
  name TEXT NOT NULL,
  "group" TEXT DEFAULT 'CORE',
  base_weight NUMERIC(10, 2) DEFAULT 0.30,
  is_global BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS categories_event_id_idx ON categories(event_id);
CREATE INDEX IF NOT EXISTS categories_is_global_idx ON categories(is_global);

-- EventCategories table
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, category_id)
);

CREATE INDEX IF NOT EXISTS event_categories_event_id_idx ON event_categories(event_id);
CREATE INDEX IF NOT EXISTS event_categories_category_id_idx ON event_categories(category_id);

-- CategoryAllocations table
CREATE TABLE IF NOT EXISTS category_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id UUID NOT NULL REFERENCES budget_scenarios(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  allocated_cents INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(scenario_id, category_id)
);

CREATE INDEX IF NOT EXISTS category_allocations_scenario_id_idx ON category_allocations(scenario_id);
CREATE INDEX IF NOT EXISTS category_allocations_category_id_idx ON category_allocations(category_id);

-- BudgetActions table
CREATE TABLE IF NOT EXISTS budget_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id UUID NOT NULL REFERENCES budget_scenarios(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  before_snapshot JSONB,
  after_snapshot JSONB NOT NULL,
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS budget_actions_scenario_id_idx ON budget_actions(scenario_id);
CREATE INDEX IF NOT EXISTS budget_actions_created_by_user_id_idx ON budget_actions(created_by_user_id);

-- Enable RLS (Row Level Security) - Optional, but recommended
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic - adjust as needed)
-- Allow users to read their own user record
CREATE POLICY "users_can_read_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow event members to read event details
CREATE POLICY "event_members_can_read" ON events
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM event_members WHERE event_id = events.id
    )
  );

-- Allow event members to read their membership
CREATE POLICY "event_members_can_read_membership" ON event_members
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to read their event state
CREATE POLICY "user_event_states_can_read" ON user_event_states
  FOR SELECT USING (auth.uid() = user_id);

-- Allow event members to read scenarios
CREATE POLICY "budget_scenarios_can_read" ON budget_scenarios
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM event_members WHERE event_id = budget_scenarios.event_id
    )
  );

-- Allow event members to read categories for their events
CREATE POLICY "event_categories_can_read" ON event_categories
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM event_members WHERE event_id = event_categories.event_id
    )
  );

-- Allow reading global categories
CREATE POLICY "categories_can_read_global" ON categories
  FOR SELECT USING (is_global = TRUE);

-- Allow event members to read allocations
CREATE POLICY "category_allocations_can_read" ON category_allocations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM event_members 
      WHERE event_id IN (
        SELECT event_id FROM budget_scenarios WHERE id = category_allocations.scenario_id
      )
    )
  );

-- Allow event members to read actions
CREATE POLICY "budget_actions_can_read" ON budget_actions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM event_members 
      WHERE event_id IN (
        SELECT event_id FROM budget_scenarios WHERE id = budget_actions.scenario_id
      )
    )
  );

-- Global categories seed data
INSERT INTO categories (name, "group", base_weight, is_global, event_id)
VALUES
  -- CORE
  ('Venue', 'CORE', 0.25, TRUE, NULL),
  ('Catering', 'CORE', 0.25, TRUE, NULL),
  ('Photography/Videography', 'CORE', 0.15, TRUE, NULL),
  ('Music/DJ/Entertainment', 'CORE', 0.12, TRUE, NULL),
  ('Florals & Decorations', 'CORE', 0.10, TRUE, NULL),
  ('Invitations & Paper', 'CORE', 0.05, TRUE, NULL),
  
  -- ADMIN
  ('Planning & Design', 'ADMIN', 0.08, TRUE, NULL),
  ('Permits & Insurance', 'ADMIN', 0.05, TRUE, NULL),
  ('Transportation', 'ADMIN', 0.05, TRUE, NULL),
  ('Ceremony Officiant', 'ADMIN', 0.02, TRUE, NULL),
  
  -- ENHANCEMENTS
  ('Hair & Makeup', 'ENHANCEMENTS', 0.08, TRUE, NULL),
  ('Wedding Attire', 'ENHANCEMENTS', 0.10, TRUE, NULL),
  ('Favors & Gifts', 'ENHANCEMENTS', 0.05, TRUE, NULL),
  ('Guest Accommodations', 'ENHANCEMENTS', 0.10, TRUE, NULL),
  ('Honeymoon', 'ENHANCEMENTS', 0.15, TRUE, NULL),
  
  -- SAFETY_NET
  ('Contingency (10%)', 'SAFETY_NET', 0.10, TRUE, NULL),
  ('Miscellaneous', 'SAFETY_NET', 0.05, TRUE, NULL)
ON CONFLICT DO NOTHING;
