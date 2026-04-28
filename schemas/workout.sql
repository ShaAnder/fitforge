-- =============================================
-- FitForge Workouts Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- Main workouts table
create table workouts (
  id uuid default uuid_generate_v4() primary key,
  
  -- Link to the authenticated user
  user_id uuid references auth.users on delete cascade not null,
  
  -- When the workout happened
  date timestamp with time zone default now() not null,
  
  -- Full workout data stored as JSONB (very flexible)
  exercises jsonb not null,
  
  -- For easy charting and stats
  total_volume numeric default 0,
  
  -- Optional notes for the whole session
  notes text,
  
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table workouts enable row level security;

-- Users can only see and modify their own workouts
create policy "Users can only access their own workouts"
  on workouts for all
  using (auth.uid() = user_id);

-- Optional: Index for better performance
create index workouts_user_id_idx on workouts(user_id);
create index workouts_date_idx on workouts(date);