-- Supabase schema for Wedeption (expanded)
create extension if not exists "pgcrypto";

create table if not exists users (
  id text primary key,
  role text,
  name text,
  email text,
  phone text,
  is_phone_verified boolean default false,
  profile_pic text,
  created_at timestamptz default now()
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id),
  business_name text,
  category text,
  city text,
  services jsonb,
  short_desc text,
  gst_number text,
  verified boolean default false,
  subscription_level text,
  priority_rank int default 0,
  created_at timestamptz default now()
);

create table if not exists vendor_portfolio (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id),
  media_url text,
  media_type text,
  caption text,
  is_promoted boolean default false,
  approved boolean default false,
  likes int default 0,
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id),
  user_id text references users(id),
  contact_phone text,
  name text,
  event_date date,
  budget_range text,
  details jsonb,
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id),
  plan text,
  price int,
  start_date timestamptz,
  end_date timestamptz,
  status text,
  razorpay_subscription_id text,
  created_at timestamptz default now()
);

-- Example policy snippets (enable RLS in Supabase UI and add policies)
-- create policy "users can view own" on users for select using (auth.uid() = id);
-- create policy "vendor owner" on vendors for all using (auth.uid() = user_id);

create table if not exists ai_plans (id uuid primary key default gen_random_uuid(), user_id text, budget text, city text, guests int, plan text, created_at timestamptz default now());
create table if not exists user_credits (user_id text primary key, credits int default 5);


-- Extended vendor fields for identity & business details
alter table if exists vendors
  add column if not exists contact_person text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists whatsapp text,
  add column if not exists business_address text,
  add column if not exists years_experience int,
  add column if not exists price_range jsonb,
  add column if not exists website text,
  add column if not exists instagram text,
  add column if not exists facebook text,
  add column if not exists youtube text,
  add column if not exists brand_description text,
  add column if not exists why_choose text,
  add column if not exists deals text,
  add column if not exists identity_verified boolean default false,
  add column if not exists identity_doc_url text,
  add column if not exists gst_number text,
  add column if not exists pan_number text,
  add column if not exists other_services text;

-- Ensure portfolio table can store video links
alter table if exists vendor_portfolio
  add column if not exists external_links text;



-- Reviews & Ratings
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id),
  user_id text references users(id),
  rating int check (rating >= 1 and rating <= 5),
  review_text text,
  photos jsonb,
  verified_booking boolean default false,
  approved boolean default false,
  created_at timestamptz default now()
);

-- Availability calendar for vendors (monthly blocking)
create table if not exists vendor_availability (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id),
  date date,
  status text, -- 'available' | 'booked' | 'blocked'
  notes text,
  created_at timestamptz default now()
);

-- Cities table
create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  state text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Categories/Services table
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  icon text,
  is_active boolean default true,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Insert cities
insert into cities (name, state) values
  ('Gwalior', 'Madhya Pradesh'),
  ('Jabalpur', 'Madhya Pradesh'),
  ('Ujjain', 'Madhya Pradesh'),
  ('Sagar', 'Madhya Pradesh'),
  ('Rewa', 'Madhya Pradesh'),
  ('Satna', 'Madhya Pradesh'),
  ('Ratlam', 'Madhya Pradesh'),
  ('Dewas', 'Madhya Pradesh'),
  ('Chhindwara', 'Madhya Pradesh'),
  ('Khandwa', 'Madhya Pradesh'),
  ('Khargone', 'Madhya Pradesh'),
  ('Morena', 'Madhya Pradesh'),
  ('Bhind', 'Madhya Pradesh'),
  ('Shivpuri', 'Madhya Pradesh'),
  ('Vidisha', 'Madhya Pradesh'),
  ('Mandsaur', 'Madhya Pradesh'),
  ('Neemuch', 'Madhya Pradesh'),
  ('Shahdol', 'Madhya Pradesh'),
  ('Singrauli', 'Madhya Pradesh'),
  ('Burhanpur', 'Madhya Pradesh'),
  ('Betul', 'Madhya Pradesh'),
  ('Sehore', 'Madhya Pradesh'),
  ('Hoshangabad', 'Madhya Pradesh'),
  ('Katni', 'Madhya Pradesh'),
  ('Indore', 'Madhya Pradesh'),
  ('Bhopal', 'Madhya Pradesh')
on conflict (name) do nothing;

-- Insert categories
insert into categories (name, display_order) values
  ('Venues', 1),
  ('Decorators', 2),
  ('Photographers', 3),
  ('Videographers', 4),
  ('Makeup Artists', 5),
  ('Mehendi Artists', 6),
  ('DJs', 7),
  ('Bands', 8),
  ('Music & Entertainment', 9),
  ('Choreographers', 10),
  ('Caterers', 11),
  ('Cake Artists', 12),
  ('Bartenders', 13),
  ('Invitation Designers', 14),
  ('Gifts & Favours', 15),
  ('Bridal Wear', 16),
  ('Groom Wear', 17),
  ('Clothes Designers', 18),
  ('Jewellery', 19),
  ('Accessories', 20),
  ('Pandits/Priests', 21),
  ('Transportation', 22),
  ('Honeymoon Packages', 23),
  ('Entertainment Artists', 24)
on conflict (name) do nothing;
