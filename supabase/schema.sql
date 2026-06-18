-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references categories(id),
  is_active boolean default true
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  amway_code text unique not null,
  name text,
  brand text,
  description text,
  category_id uuid references categories(id),
  source_price numeric,
  selling_price numeric,
  markup_override numeric,
  image_urls text[],
  amway_url text,
  is_active boolean default true,
  stock_status text default 'inStock',
  last_synced_at timestamptz,
  created_at timestamptz default now()
);

-- Global settings (e.g. global markup %)
create table if not exists settings (
  key text primary key,
  value text
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_email text,
  shipping_address jsonb,
  items jsonb,
  subtotal numeric,
  total numeric,
  stripe_payment_intent_id text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Seed default settings
insert into settings (key, value) values ('global_markup', '30') on conflict (key) do nothing;

-- Seed categories
-- Top-level categories
insert into categories (name, slug) values ('Nutrition', 'nutrition') on conflict (slug) do nothing;
insert into categories (name, slug) values ('Beauty', 'beauty') on conflict (slug) do nothing;
insert into categories (name, slug) values ('Home', 'home') on conflict (slug) do nothing;
insert into categories (name, slug) values ('Personal Care', 'personal-care') on conflict (slug) do nothing;

-- Nutrition subcategories
insert into categories (name, slug, parent_id)
  select 'Targeted Food Supplements', 'targeted-food-supplements', id from categories where slug = 'nutrition'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Foundational Food Supplements', 'foundational-food-supplements', id from categories where slug = 'nutrition'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Weight Management', 'weight-management', id from categories where slug = 'nutrition'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Personalised Solutions For You', 'personalised-solutions-for-you', id from categories where slug = 'nutrition'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Food & Beverages', 'food-beverages', id from categories where slug = 'nutrition'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Sports Nutrition', 'sports-nutrition', id from categories where slug = 'nutrition'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Active Lifestyle', 'active-lifestyle', id from categories where slug = 'nutrition'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Accessories Nutrition', 'accessories-nutrition', id from categories where slug = 'nutrition'
  on conflict (slug) do nothing;

-- Beauty subcategories
insert into categories (name, slug, parent_id)
  select 'Make-up', 'make-up', id from categories where slug = 'beauty'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Skincare', 'skincare', id from categories where slug = 'beauty'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Accessories Beauty', 'accessories-beauty', id from categories where slug = 'beauty'
  on conflict (slug) do nothing;

-- Home subcategories
insert into categories (name, slug, parent_id)
  select 'Household Products', 'household-products', id from categories where slug = 'home'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Home Tech', 'home-tech', id from categories where slug = 'home'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Cookware', 'cookware', id from categories where slug = 'home'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Water Treatment', 'water-treatment', id from categories where slug = 'home'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Air Treatment', 'air-treatment', id from categories where slug = 'home'
  on conflict (slug) do nothing;

-- Personal Care subcategories
insert into categories (name, slug, parent_id)
  select 'Bath & Body', 'bath-body', id from categories where slug = 'personal-care'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Hair Care', 'hair-care', id from categories where slug = 'personal-care'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Men''s Care', 'mens-care', id from categories where slug = 'personal-care'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Oral Care', 'oral-care', id from categories where slug = 'personal-care'
  on conflict (slug) do nothing;

insert into categories (name, slug, parent_id)
  select 'Deodorants', 'deodorants', id from categories where slug = 'personal-care'
  on conflict (slug) do nothing;
