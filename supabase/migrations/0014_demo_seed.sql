-- 0014_demo_seed.sql
-- Données de démonstration pour le Vibeathon 2026
-- NOTE : Ce script insère des données fictives pour la présentation.
--        Il est IDEMPOTENT : peut être rejoué sans erreur.

-- ============================================================
-- SEED : Profils de démonstration
-- (Les utilisateurs doivent d'abord exister dans auth.users)
-- On utilise do $$ pour ignorer les erreurs si les profils existent déjà
-- ============================================================
do $$
begin
  -- Profil : Agriculteur Kouassi
  insert into public.profiles (id, full_name, phone, role, activity_description)
  values (
    '00000000-0000-0000-0000-000000000001',
    'Kouassi Brou',
    '+2250701000001',
    'agriculteur',
    'Producteur de maïs et d''ignames à Bouaké. Vend ses résidus agricoles.'
  ) on conflict (id) do nothing;

  -- Profil : Éleveur
  insert into public.profiles (id, full_name, phone, role, activity_description)
  values (
    '00000000-0000-0000-0000-000000000002',
    'Diallo Mamadou',
    '+2250702000002',
    'eleveur',
    'Éleveur de bovins à Korhogo. Cherche du fourrage à bas prix.'
  ) on conflict (id) do nothing;

  -- Profil : Ménage
  insert into public.profiles (id, full_name, phone, role, activity_description)
  values (
    '00000000-0000-0000-0000-000000000003',
    'Adjoua Marie',
    '+2250703000003',
    'menage',
    'Habitante d''Abidjan-Cocody, trie ses déchets ménagers.'
  ) on conflict (id) do nothing;

  -- Profil : Recycleur
  insert into public.profiles (id, full_name, phone, role, activity_description)
  values (
    '00000000-0000-0000-0000-000000000004',
    'Koné Ibrahim',
    '+2250704000004',
    'recycleur',
    'Recycleur de plastiques PET et métaux. Basé à Yopougon.'
  ) on conflict (id) do nothing;

  -- Profil : Grossiste
  insert into public.profiles (id, full_name, phone, role, activity_description)
  values (
    '00000000-0000-0000-0000-000000000005',
    'N''Guessan Paul',
    '+2250705000005',
    'acheteur',
    'Grossiste en produits agricoles. Approvisionne les marchés d''Abidjan.'
  ) on conflict (id) do nothing;

exception when others then
  raise notice 'Seed profiles: %', SQLERRM;
end;
$$;

-- ============================================================
-- SEED : Annonces de démonstration
-- ============================================================
do $$
begin
  -- Annonce 1 : Fanes d'arachide
  insert into public.listings (
    id, owner_id, listing_type, category,
    title, description, price, quantity, unit,
    image_url, location, status
  ) values (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'vente', 'residu',
    'Fanes d''arachide séchées',
    'Lot de 500 kg de fanes d''arachide de qualité supérieure, séchées au soleil. Idéal pour le fourrage bovin.',
    2500, 500, 'kg',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    ST_MakePoint(-5.289, 6.827),
    'active'
  ) on conflict (id) do nothing;

  -- Annonce 2 : Tiges de maïs
  insert into public.listings (
    id, owner_id, listing_type, category,
    title, description, price, quantity, unit,
    image_url, location, status
  ) values (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'vente', 'residu',
    'Tiges de maïs fraîches',
    'Tiges de maïs fraîches, récoltées hier. Parfaites pour l''alimentation des bovins et caprins.',
    1500, 300, 'kg',
    'https://images.unsplash.com/photo-1601472544399-f95e4f6b55fb?w=400',
    ST_MakePoint(-5.290, 6.828),
    'active'
  ) on conflict (id) do nothing;

  -- Annonce 3 : Plastiques PET
  insert into public.listings (
    id, owner_id, listing_type, category,
    title, description, price, quantity, unit,
    image_url, location, status
  ) values (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'vente', 'residu',
    'Bouteilles PET triées',
    'Bouteilles en plastique PET propres et triées par couleur. Prêtes pour le recyclage.',
    800, 50, 'kg',
    'https://images.unsplash.com/photo-1576272531110-2a6e5b7a5c5b?w=400',
    ST_MakePoint(-3.980, 5.359),
    'active'
  ) on conflict (id) do nothing;

  -- Annonce 4 : Ignames fraîches (récolte)
  insert into public.listings (
    id, owner_id, listing_type, category,
    title, description, price, quantity, unit,
    image_url, location, status
  ) values (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'vente', 'recolte',
    'Ignames Florido',
    'Ignames variété Florido de gros calibre. Récolte de la semaine, fraîches et de qualité export.',
    450, 2000, 'kg',
    'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400',
    ST_MakePoint(-5.289, 6.827),
    'active'
  ) on conflict (id) do nothing;

  -- Annonce 5 : Besoin de fourrage (demande)
  insert into public.listings (
    id, owner_id, listing_type, category,
    title, description, price, quantity, unit,
    image_url, location, status
  ) values (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    'besoin', 'residu',
    'Recherche fourrage pour 50 bovins',
    'Je cherche du fourrage (fanes, tiges, paille) pour nourrir mon troupeau de 50 têtes. Besoin mensuel.',
    2000, 1000, 'kg',
    null,
    ST_MakePoint(-5.633, 9.458),
    'active'
  ) on conflict (id) do nothing;

exception when others then
  raise notice 'Seed listings: %', SQLERRM;
end;
$$;

-- ============================================================
-- SEED : Avis de démonstration
-- ============================================================
do $$
begin
  insert into public.reviews (reviewer_id, seller_id, listing_id, rating, comment)
  values (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    5,
    'Excellent fourrage ! Mes bovins ont adoré. Livraison rapide et vendeur très sérieux.'
  ) on conflict do nothing;

  insert into public.reviews (reviewer_id, seller_id, listing_id, rating, comment)
  values (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    4,
    'Bonne qualité de tri. Quelques impuretés mais dans l''ensemble correct.'
  ) on conflict do nothing;

exception when others then
  raise notice 'Seed reviews: %', SQLERRM;
end;
$$;
