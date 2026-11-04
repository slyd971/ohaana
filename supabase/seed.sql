-- Demo data (originally generated from the former static catalogue; this file is now the source of truth).
-- Demo data only: every row is flagged is_demo = true. Remove with: select public.purge_demo_data();
-- Reference data (categories, cancellation policies) lives in migration 006, not here.

-- Providers (auth users, no password: they cannot sign in)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '7bc7b943-7e7f-4931-87fb-41040036b5ef', 'authenticated', 'authenticated', 'demo+p-1@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Marcus Théophile","avatar_url":"https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=200&h=200&fit=crop","business_name":"Chef Marcus","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', 'dfb40b2d-1847-4696-89f6-0d9ac6af8415', 'authenticated', 'authenticated', 'demo+p-2@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Madeleine Lacroix","avatar_url":"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop","business_name":"Massage Madeleine","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', 'ca2daf63-2b89-49cc-8704-eedb5202fbda', 'authenticated', 'authenticated', 'demo+p-4@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Camille Desroses","avatar_url":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop","business_name":"Studio Camille Photo","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', 'e33f4248-d8a4-48e7-82c0-461faf4103af', 'authenticated', 'authenticated', 'demo+p-5@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Keisha Dantor","avatar_url":"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop","business_name":"Yoga & Fitness Keisha","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '7e114dbb-12aa-4ae8-85e6-051a8161e211', 'authenticated', 'authenticated', 'demo+p-7@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Clarisse Moreau","avatar_url":"https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop","business_name":"Chef Clarisse","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', 'f872cae3-0d77-4b45-840a-9e5813ed1121', 'authenticated', 'authenticated', 'demo+p-9@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Isabelle Clémentine","avatar_url":"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop","business_name":"Bella Coiffure Créole","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '2f4aed28-ed60-43ad-893a-1c84b2e810e3', 'authenticated', 'authenticated', 'demo+p-11@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Sophie Montagne","avatar_url":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop","business_name":"Famille & Vacances Martinique","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '3906fe79-4310-45e4-86f3-5a297359259d', 'authenticated', 'authenticated', 'demo+p-12@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Kenzo Saint-Louis","avatar_url":"https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop","business_name":"DJ Kenzo Caraïbes","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', 'bd322cd3-4350-4c1d-8e5f-e35b6a2f071c', 'authenticated', 'authenticated', 'demo+p-13@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Léo Beauvais","avatar_url":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop","business_name":"Barman Léo — Cocktails à domicile","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', 'dab078e8-c73f-4092-8fcd-1d1e7abf74de', 'authenticated', 'authenticated', 'demo+p-14@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Rafael Cézanne","avatar_url":"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop","business_name":"Coach Rafael — Sport à domicile","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '104e9361-bebc-4ac3-86e7-d5755b3f5f63', 'authenticated', 'authenticated', 'demo+p-15@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Naomi Virgile","avatar_url":"https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop","business_name":"Naomi — Soins Beauté à domicile","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '4934aa3a-9265-451a-8e31-f34ce68eb077', 'authenticated', 'authenticated', 'demo+p-16@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Tiphanie Rosier","avatar_url":"https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop","business_name":"Tiphanie — Déco & Événements","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '40bd17a1-3a14-4050-8867-c875967e9924', 'authenticated', 'authenticated', 'demo+p-17@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Jérôme Céleste","avatar_url":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop","business_name":"Jérôme — Danses Antillaises","locale":"fr"}'::jsonb, now(), now());
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '0297752b-20c6-4a39-80dc-93aa92f065a4', 'authenticated', 'authenticated', 'demo+p-18@ohaana.test', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider","full_name":"Kaïssa Delphin","avatar_url":"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop","business_name":"Make-up by Kaïssa","locale":"fr"}'::jsonb, now(), now());

update public.users set is_demo = true where email like 'demo+%@ohaana.test';

-- Provider profiles
update public.provider_profiles set
  business_name = 'Chef Marcus', bio = 'Chef étoilé formé à Paris, revenu au pays pour sublimer la cuisine créole. Spécialiste du dîner à domicile et des accords rhum-gastronomie.', bio_en = 'Michelin-trained chef who returned home to celebrate Creole cuisine. Specialist in villa dinners and rum-gastronomy pairings.',
  languages = array['fr', 'en']::text[], certifications = array['CAP Cuisine', 'Certification Hygiène']::text[],
  island = 'guadeloupe'::public.island, phone = '+590 690 000 001', whatsapp = '+590690000001',
  is_approved = true, avg_rating = 4.9, review_count = 47, is_demo = true
where user_id = '7bc7b943-7e7f-4931-87fb-41040036b5ef';
update public.provider_profiles set
  business_name = 'Massage Madeleine', bio = 'Masseuse certifiée en thérapies caribéennes. Huiles essentielles locales, table professionnelle et ambiance spa directement chez vous.', bio_en = 'Certified therapist in Caribbean healing arts. Local essential oils, professional table and spa atmosphere directly in your villa.',
  languages = array['fr', 'en', 'es']::text[], certifications = array['BPJEPS Bien-être']::text[],
  island = 'guadeloupe'::public.island, phone = '+590 690 000 002', whatsapp = '+590690000002',
  is_approved = true, avg_rating = 4.8, review_count = 83, is_demo = true
where user_id = 'dfb40b2d-1847-4696-89f6-0d9ac6af8415';
update public.provider_profiles set
  business_name = 'Studio Camille Photo', bio = 'Photographe lifestyle & couple. Shooting à domicile, hôtel ou jardin privé — une séance élégante sans quitter votre lieu de séjour.', bio_en = 'Lifestyle & couple photographer. Villa, hotel or private garden shoots — an elegant session without leaving your stay.',
  languages = array['fr', 'en']::text[], certifications = '{}'::text[],
  island = 'guadeloupe'::public.island, phone = '+590 690 000 004', whatsapp = '+590690000004',
  is_approved = true, avg_rating = 5, review_count = 36, is_demo = true
where user_id = 'ca2daf63-2b89-49cc-8704-eedb5202fbda';
update public.provider_profiles set
  business_name = 'Yoga & Fitness Keisha', bio = 'Coach certifiée yoga et fitness. Séances privées sur votre terrasse, dans votre jardin ou chez vous. Tapis fournis, ambiance douce et sur mesure.', bio_en = 'Certified yoga & fitness coach. Private sessions on your terrace, garden or villa. Mats provided, soft tailored atmosphere.',
  languages = array['fr', 'en']::text[], certifications = array['200h Yoga Alliance', 'BPJEPS Fitness']::text[],
  island = 'guadeloupe'::public.island, phone = '+590 690 000 005', whatsapp = '+590690000005',
  is_approved = true, avg_rating = 4.7, review_count = 29, is_demo = true
where user_id = 'e33f4248-d8a4-48e7-82c0-461faf4103af';
update public.provider_profiles set
  business_name = 'Chef Clarisse', bio = 'Cours de cuisine créole dans ma cuisine ou chez vous. Recettes familiales transmises de génération en génération : accras, colombo, boudins créoles.', bio_en = 'Creole cooking classes at my home or your villa. Family recipes passed down through generations.',
  languages = array['fr']::text[], certifications = array['CAP Cuisine']::text[],
  island = 'guadeloupe'::public.island, phone = '+590 690 000 007', whatsapp = '+590690000007',
  is_approved = true, avg_rating = 4.9, review_count = 52, is_demo = true
where user_id = '7e114dbb-12aa-4ae8-85e6-051a8161e211';
update public.provider_profiles set
  business_name = 'Bella Coiffure Créole', bio = 'Spécialiste tresses africaines, locks et coiffures cérémoniales. Intervient à domicile pour mariages, anniversaires et événements.', bio_en = 'Specialist in African braids, locs and ceremonial hairstyles. Home and villa visits for weddings, birthdays and events.',
  languages = array['fr', 'en']::text[], certifications = array['CAP Coiffure']::text[],
  island = 'martinique'::public.island, phone = '+596 696 000 009', whatsapp = '+596696000009',
  is_approved = true, avg_rating = 4.9, review_count = 44, is_demo = true
where user_id = 'f872cae3-0d77-4b45-840a-9e5813ed1121';
update public.provider_profiles set
  business_name = 'Famille & Vacances Martinique', bio = 'Service de garde d''enfants certifié pour les familles en vacances. Activités créatives, jeux calmes et baby-sitting à domicile. Diplômée petite enfance.', bio_en = 'Certified childcare for families on vacation. Creative activities, quiet games and villa baby-sitting. Early childhood diploma.',
  languages = array['fr', 'en']::text[], certifications = array['CAP AEPE', 'Premiers Secours']::text[],
  island = 'martinique'::public.island, phone = '+596 696 000 011', whatsapp = '+596696000011',
  is_approved = true, avg_rating = 4.9, review_count = 33, is_demo = true
where user_id = '2f4aed28-ed60-43ad-893a-1c84b2e810e3';
update public.provider_profiles set
  business_name = 'DJ Kenzo Caraïbes', bio = 'DJ professionnel spécialisé ambiance caraïbéenne : zouk, reggae, kompa, afrobeat. Intervient à domicile ou sur terrasse privée pour soirées et anniversaires.', bio_en = 'Professional DJ specializing in Caribbean vibes: zouk, reggae, kompa, afrobeat. Available for villa parties and private terraces.',
  languages = array['fr', 'en', 'kr']::text[], certifications = '{}'::text[],
  island = 'guadeloupe'::public.island, phone = '+590 690 000 012', whatsapp = '+590690000012',
  is_approved = true, avg_rating = 4.8, review_count = 38, is_demo = true
where user_id = '3906fe79-4310-45e4-86f3-5a297359259d';
update public.provider_profiles set
  business_name = 'Barman Léo — Cocktails à domicile', bio = 'Barman expérimenté et passionné de rhum agricole. Crée des cocktails créoles sur mesure chez vous — ti-punch revisité, punch vieux, cocktails signature maison.', bio_en = 'Experienced barman passionate about agricultural rum. Creates custom Creole cocktails in your villa — reimagined ti-punch, aged punch, signature house cocktails.',
  languages = array['fr', 'en']::text[], certifications = array['CAP Barman', 'Sommelier Rhum']::text[],
  island = 'guadeloupe'::public.island, phone = '+590 690 000 013', whatsapp = '+590690000013',
  is_approved = true, avg_rating = 4.9, review_count = 27, is_demo = true
where user_id = 'bd322cd3-4350-4c1d-8e5f-e35b6a2f071c';
update public.provider_profiles set
  business_name = 'Coach Rafael — Sport à domicile', bio = 'Coach sportif certifié, spécialiste HIIT et functional training. Séances sur mesure chez vous, sur terrasse ou dans votre jardin. Matériel fourni, tous niveaux.', bio_en = 'Certified sports coach, HIIT and functional training specialist. Tailored sessions at your villa, terrace or garden. Equipment provided, all levels welcome.',
  languages = array['fr', 'en', 'es']::text[], certifications = array['BPJEPS Sport', 'HIIT Certified', 'Secourisme']::text[],
  island = 'guadeloupe'::public.island, phone = '+590 690 000 014', whatsapp = '+590690000014',
  is_approved = true, avg_rating = 4.8, review_count = 21, is_demo = true
where user_id = 'dab078e8-c73f-4092-8fcd-1d1e7abf74de';
update public.provider_profiles set
  business_name = 'Naomi — Soins Beauté à domicile', bio = 'Esthéticienne diplômée. Manucure, pédicure, soin du visage, épilation et modelage corps — tout le rituel beauté livré chez vous. Produits naturels locaux.', bio_en = 'Certified beautician. Manicure, pedicure, facial, waxing and body treatments — the full beauty ritual delivered to your villa. Local natural products.',
  languages = array['fr', 'en']::text[], certifications = array['CAP Esthétique', 'BP Esthétique']::text[],
  island = 'guadeloupe'::public.island, phone = '+590 690 000 015', whatsapp = '+590690000015',
  is_approved = true, avg_rating = 4.9, review_count = 41, is_demo = true
where user_id = '104e9361-bebc-4ac3-86e7-d5755b3f5f63';
update public.provider_profiles set
  business_name = 'Tiphanie — Déco & Événements', bio = 'Décoratrice événementielle spécialisée Caraïbes. Transforme votre espace en décor romantique, tropical ou prestige. Demande en mariage, anniversaire, baby shower.', bio_en = 'Event decorator specializing in the Caribbean. Transforms your villa into a romantic, tropical or prestige setting. Proposals, birthdays, baby showers.',
  languages = array['fr', 'en']::text[], certifications = array['BTS Design d''espace']::text[],
  island = 'guadeloupe'::public.island, phone = '+590 690 000 016', whatsapp = '+590690000016',
  is_approved = true, avg_rating = 5, review_count = 19, is_demo = true
where user_id = '4934aa3a-9265-451a-8e31-f34ce68eb077';
update public.provider_profiles set
  business_name = 'Jérôme — Danses Antillaises', bio = 'Professeur de danses caribéennes : zouk, gwoka, biguine, kompa. Cours privés chez vous ou sur votre terrasse, tous niveaux. Idéal pour couples et groupes.', bio_en = 'Caribbean dance teacher: zouk, gwoka, biguine, kompa. Private classes in your villa or on your terrace, all levels. Perfect for couples and groups.',
  languages = array['fr', 'en', 'kr']::text[], certifications = array['Diplômé Conservatoire de Danse']::text[],
  island = 'martinique'::public.island, phone = '+596 696 000 017', whatsapp = '+596696000017',
  is_approved = true, avg_rating = 4.8, review_count = 24, is_demo = true
where user_id = '40bd17a1-3a14-4050-8867-c875967e9924';
update public.provider_profiles set
  business_name = 'Make-up by Kaïssa', bio = 'Maquilleuse artistique certifiée. Soirées, mariages, cérémonies, shooting photo. Se déplace chez vous ou à l''hôtel avec son propre matériel professionnel.', bio_en = 'Certified artistic makeup artist. Evenings, weddings, ceremonies, photo shoots. Comes to your villa or hotel with professional equipment.',
  languages = array['fr', 'en']::text[], certifications = array['CAP Esthétique', 'Make-up Academy Paris']::text[],
  island = 'martinique'::public.island, phone = '+596 696 000 018', whatsapp = '+596696000018',
  is_approved = true, avg_rating = 5, review_count = 31, is_demo = true
where user_id = '0297752b-20c6-4a39-80dc-93aa92f065a4';

-- Services
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  '50c67550-383b-4a73-8a76-6aac9acaf0da', (select id from public.provider_profiles where user_id = '7bc7b943-7e7f-4931-87fb-41040036b5ef'),
  '00000000-0000-4000-8000-000000000c01', 'Dîner de chef à domicile — Menu Créole Prestige', 'Private Chef Dinner at Home — Prestige Creole Menu', 'Cena de chef a domicilio — Menú Criollo Prestige',
  'Marcus s''installe dans votre cuisine et transforme votre espace en restaurant étoilé. Menu 5 services avec produits frais locaux, accords rhum agricole, service en salle inclus. Une table créole gastronomique comme nulle part ailleurs.', 'Marcus takes over your kitchen and turns your villa into a Michelin-style experience. 5-course menu with fresh local produce, agricultural rum pairings, full table service included.', 'Marcus se instala en tu cocina y transforma tu villa en un restaurante de estrella. Menú de 5 servicios con productos frescos locales, maridajes de rhum agricole, servicio en sala incluido. Una mesa criolla gastronómica como ninguna otra.',
  'diner-de-chef-a-domicile-menu-creole-prestige', 'private-chef-dinner-at-home-prestige-creole-menu', 'cena-de-chef-a-domicilio-menu-criollo-prestige',
  'guadeloupe'::public.island, 18000, 'per_person', 180, 2, 8,
  'À domicile — Guadeloupe', 16.265, -61.551, true, true, 'published', array['gastronomie', 'villa', 'couple', 'famille']::text[],
  4.9, 47, 89, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  'e46afda9-5132-4cc3-8384-791fc792b3a8', (select id from public.provider_profiles where user_id = 'dfb40b2d-1847-4696-89f6-0d9ac6af8415'),
  '00000000-0000-4000-8000-000000000c02', 'Massage balinais à domicile — Rituel détente privé', 'Balinese Home Massage — Private Relaxation Ritual', 'Masaje balinés a domicilio — Ritual de relajación privado',
  'Madeleine se déplace directement chez vous. Huiles essentielles de vanille et ylang-ylang de Guadeloupe, table de massage professionnelle, ambiance bougies. Une heure trente de pur lâcher-prise au bord des eaux turquoise.', 'Madeleine comes directly to you. Local vanilla and ylang-ylang essential oils, professional massage table, candlelit ambiance. 90 minutes of pure bliss by turquoise waters.', 'Madeleine se desplaza directamente a tu alojamiento. Aceites esenciales de vainilla y ylang-ylang de Guadalupe, camilla de masaje profesional, ambiente de velas. Una hora y media de puro descanso al borde de las aguas turquesa.',
  'massage-balinais-a-domicile-rituel-detente-prive', 'balinese-home-massage-private-relaxation-ritual', 'masaje-balines-a-domicilio-ritual-de-relajacion-privado',
  'guadeloupe'::public.island, 12000, 'per_person', 90, 1, 2,
  'À domicile — Guadeloupe', 16.2, -61.58, true, true, 'published', array['bien-être', 'couple', 'villa', 'relaxation']::text[],
  4.8, 83, 156, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  'c8ef5789-3aa4-4201-8f4a-308d23744bf1', (select id from public.provider_profiles where user_id = 'ca2daf63-2b89-49cc-8704-eedb5202fbda'),
  '00000000-0000-4000-8000-000000000c03', 'Shooting photo à domicile — Couple & famille', 'Home Photoshoot — Couple & Family', 'Sesión de fotos a domicilio — Pareja y familia',
  'Camille vient chez vous ou à votre hôtel pour capturer votre complicité dans une lumière naturelle. Terrasse, jardin, piscine ou intérieur selon votre envie. Galerie HD livrée sous 48h — des images que vous garderez toute une vie.', 'Camille comes to your villa or hotel to capture your connection in natural light. Terrace, garden, pool or interiors as you wish. HD gallery in 48h — images you''ll keep forever.', 'Camille viene a tu villa o hotel para capturar vuestra complicidad con luz natural. Terraza, jardín, piscina o interior según tus deseos. Galería HD entregada en 48h — imágenes que guardarás toda la vida.',
  'shooting-photo-a-domicile-couple-famille', 'home-photoshoot-couple-family', 'sesion-de-fotos-a-domicilio-pareja-y-familia',
  'guadeloupe'::public.island, 22000, 'per_person', 120, 1, 4,
  'À domicile — Guadeloupe', 16.2, -61.49, true, false, 'published', array['couple', 'souvenir', 'villa']::text[],
  5, 36, 41, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  '7ae31d9e-3e3a-43fb-878a-afcc4e3aaf80', (select id from public.provider_profiles where user_id = 'e33f4248-d8a4-48e7-82c0-461faf4103af'),
  '00000000-0000-4000-8000-000000000c04', 'Yoga privé à domicile — Terrasse ou jardin', 'Private Yoga at Home — Terrace or Garden', 'Yoga privado a domicilio — Terraza o jardín',
  'Keisha vient chez vous pour une heure de yoga doux sur votre terrasse, dans votre jardin ou au bord de votre piscine. Tapis fournis, respiration guidée, rythme adapté à votre groupe.', 'Keisha comes to your villa for gentle yoga on your terrace, garden or by your pool. Mats provided, guided breathing, pace tailored to your group.', 'Keisha viene a tu villa para una hora de yoga suave en tu terraza, jardín o junto a tu piscina. Esterillas incluidas, respiración guiada, ritmo adaptado a tu grupo.',
  'yoga-prive-a-domicile-terrasse-ou-jardin', 'private-yoga-at-home-terrace-or-garden', 'yoga-privado-a-domicilio-terraza-o-jardin',
  'guadeloupe'::public.island, 4500, 'per_person', 60, 1, 8,
  'À domicile — Guadeloupe', 16.218, -61.38, true, false, 'published', array['bien-être', 'villa', 'relaxation', 'couple']::text[],
  4.7, 29, 67, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  '9c74580b-8fc9-4e63-8664-6205ecd75641', (select id from public.provider_profiles where user_id = '7e114dbb-12aa-4ae8-85e6-051a8161e211'),
  '00000000-0000-4000-8000-000000000c01', 'Cours de cuisine créole — Accras, Colombo & Boudins', 'Creole Cooking Class — Accras, Colombo & Boudins', 'Clase de cocina criolla — Accras, Colombo & Boudins',
  'Clarisse débarque dans votre cuisine avec ses épices, ses recettes de famille et son rire communicatif. Cours privé, préparation guidée, déjeuner ensemble avec vos créations. Vous repartez avec les recettes — et les souvenirs.', 'Clarisse arrives in your kitchen with her spices, family recipes and infectious laugh. Private class, guided preparation, shared lunch. You leave with recipes and memories.', 'Clarisse llega a tu cocina con sus especias, sus recetas familiares y su risa contagiosa. Clase privada, preparación guiada, almuerzo compartido con tus creaciones. Te vas con las recetas — y con los recuerdos.',
  'cours-de-cuisine-creole-accras-colombo-boudins', 'creole-cooking-class-accras-colombo-boudins', 'clase-de-cocina-criolla-accras-colombo-boudins',
  'guadeloupe'::public.island, 9500, 'per_person', 180, 2, 6,
  'À domicile — Guadeloupe', 16.242, -61.535, true, true, 'published', array['culture', 'gastronomie', 'famille', 'amis']::text[],
  4.9, 52, 73, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  'ee241a25-5614-46e3-8aae-ef1b020e783f', (select id from public.provider_profiles where user_id = 'dfb40b2d-1847-4696-89f6-0d9ac6af8415'),
  '00000000-0000-4000-8000-000000000c02', 'Duo massage à domicile — Aromathérapie caraïbe', 'Home Couple Massage — Caribbean Aromatherapy', 'Masaje duo a domicilio — Aromaterapia caribeña',
  'Madeleine et son associée viennent chez vous pour un massage duo simultané. Huiles essentielles locales, bougies, musique douce. Le luxe absolu à domicile — sans jamais quitter votre bulle caribéenne.', 'Madeleine and her partner come to your villa for a simultaneous couple massage. Local essential oils, candles, soft music. Absolute luxury at home — never leaving your Caribbean bubble.', 'Madeleine y su socia vienen a tu villa para un masaje en pareja simultáneo. Aceites esenciales locales, velas, música suave. El lujo absoluto en casa — sin salir nunca de tu burbuja caribeña.',
  'duo-massage-a-domicile-aromatherapie-caraibe', 'home-couple-massage-caribbean-aromatherapy', 'masaje-duo-a-domicilio-aromaterapia-caribena',
  'guadeloupe'::public.island, 20000, 'per_person', 90, 2, 2,
  'À domicile — Guadeloupe', 16.2, -61.58, true, false, 'published', array['couple', 'bien-être', 'villa']::text[],
  4.9, 31, 44, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  'ef64a950-920f-4464-869c-799136671e6c', (select id from public.provider_profiles where user_id = 'f872cae3-0d77-4b45-840a-9e5813ed1121'),
  '00000000-0000-4000-8000-000000000c05', 'Tresses africaines & coiffure créole à domicile', 'African Braids & Creole Hair Styling — Home Visit', 'Trenzas africanas & peinado criollo a domicilio',
  'Isabelle se déplace chez vous ou à votre hôtel en Martinique. Box braids, knotless, cornrows, coiffures de cérémonie. Cheveux naturels spécialité maison. Résultat garanti, confort total.', 'Isabelle comes to your villa or hotel in Martinique. Box braids, knotless, cornrows, ceremony styles. Natural hair our specialty. Guaranteed results, total comfort.', 'Isabelle se desplaza a tu villa o hotel en Martinica. Box braids, knotless, cornrows, peinados de ceremonia. Cabello natural, nuestra especialidad. Resultado garantizado, confort total.',
  'tresses-africaines-coiffure-creole-a-domicile', 'african-braids-creole-hair-styling-home-visit', 'trenzas-africanas-peinado-criollo-a-domicilio',
  'martinique'::public.island, 8000, 'per_person', 150, 1, 3,
  'À domicile — Martinique', 14.666, -61.022, true, true, 'published', array['beauté', 'coiffure', 'cérémonie', 'villa']::text[],
  4.9, 44, 62, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  'b45a8e20-840f-4912-803b-927825f74e04', (select id from public.provider_profiles where user_id = '2f4aed28-ed60-43ad-893a-1c84b2e810e3'),
  '00000000-0000-4000-8000-000000000c07', 'Babysitter certifiée — Garde à domicile', 'Certified Babysitter — Home Childcare', 'Niñera certificada — Cuidado infantil a domicilio',
  'Sophie garde vos enfants (0–12 ans) chez vous pendant que vous profitez des Caraïbes. Jeux créatifs, activités calmes, histoires. Disponible soir et journée. Premiers secours certifiés.', 'Sophie looks after your children (0–12) in your villa while you enjoy the Caribbean. Creative games, quiet activities, stories. Days and evenings. First aid certified.', 'Sophie cuida a tus hijos (0–12 años) en tu villa mientras disfrutas del Caribe. Juegos creativos, actividades tranquilas, cuentos. Disponible días y noches. Primeros auxilios certificados.',
  'babysitter-certifiee-garde-a-domicile', 'certified-babysitter-home-childcare', 'ninera-certificada-cuidado-infantil-a-domicilio',
  'martinique'::public.island, 2500, 'per_person', 180, 1, 4,
  'À domicile — Martinique', 14.666, -61.022, true, false, 'published', array['famille', 'enfants', 'soirée', 'villa']::text[],
  4.9, 33, 51, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  '599b8d7c-2e70-48c5-8ef8-8fd11409153b', (select id from public.provider_profiles where user_id = '7bc7b943-7e7f-4931-87fb-41040036b5ef'),
  '00000000-0000-4000-8000-000000000c01', 'Brunch créole en terrasse — Menu terroir Marcus', 'Creole Terrace Brunch — Marcus Terroir Menu', 'Brunch criollo en terraza — Menú terroir Marcus',
  'Marcus compose un brunch créole gastronomique sur votre terrasse vue mer. Jus de fruits frais des îles, accras dorés, bokits généreusement garnis, ti-punch de bienvenue. Le dimanche antillais comme jamais.', 'Marcus prepares a gourmet Creole brunch on your sea-view villa terrace. Fresh island fruit juices, golden accras, loaded bokits, welcome ti-punch. Sunday done Antillean-style.', 'Marcus prepara un brunch criollo gastronómico en tu terraza con vistas al mar. Zumos de frutas frescas de las islas, accras dorados, bokits generosamente rellenos, ti-punch de bienvenida. El domingo antillano como nunca.',
  'brunch-creole-en-terrasse-menu-terroir-marcus', 'creole-terrace-brunch-marcus-terroir-menu', 'brunch-criollo-en-terraza-menu-terroir-marcus',
  'guadeloupe'::public.island, 9500, 'per_person', 120, 2, 10,
  'Sur votre terrasse — Guadeloupe', 16.265, -61.551, true, false, 'published', array['gastronomie', 'brunch', 'vue mer', 'famille']::text[],
  4.8, 28, 35, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  '042420ef-f4b6-42b3-8662-b4f8ee9c9d9c', (select id from public.provider_profiles where user_id = 'ca2daf63-2b89-49cc-8704-eedb5202fbda'),
  '00000000-0000-4000-8000-000000000c03', 'Shooting famille à domicile — Décor caribéen sur mesure', 'Family Photoshoot at Home — Custom Caribbean Setting', 'Sesión fotográfica familiar — Decorado caribeño personalizado',
  'Camille vient chez vous ou à votre hôtel pour capturer les rires et la complicité de votre famille. Terrasse, jardin tropical, piscine ou intérieur lumineux. Galerie 80+ photos retouchées en 5 jours.', 'Camille comes to your villa or hotel to capture your family''s laughter and connection. Terrace, tropical garden, pool or bright interiors. 80+ retouched photos in 5 days.', 'Camille viene a tu villa o hotel para capturar las risas y la complicidad de tu familia. Terraza, jardín tropical, piscina o interior luminoso. Galería de 80+ fotos retocadas en 5 días.',
  'shooting-famille-a-domicile-decor-caribeen-sur-mesure', 'family-photoshoot-at-home-custom-caribbean-setting', 'sesion-fotografica-familiar-decorado-caribeno-personalizado',
  'guadeloupe'::public.island, 28000, 'per_person', 180, 2, 8,
  'À domicile — Guadeloupe', 16.13, -61.77, true, false, 'published', array['famille', 'souvenir', 'villa', 'enfants']::text[],
  5, 22, 27, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  'f4b79c7e-dd2d-45eb-8d0e-07671390943d', (select id from public.provider_profiles where user_id = '4934aa3a-9265-451a-8e31-f34ce68eb077'),
  '00000000-0000-4000-8000-000000000c0b', 'Décoration romantique à domicile — Surprise sur mesure', 'Romantic Home Decoration — Custom Surprise', 'Decoración romántica a domicilio — Sorpresa a medida',
  'Tiphanie transforme votre espace en décor de rêve pendant votre absence. Pétales de fleurs tropicales, bougies, guirlandes lumineuses, table dressée pour deux. Idéal pour une demande en mariage, un anniversaire ou une nuit de noces.', 'Tiphanie transforms your villa into a dream setting while you''re away. Tropical flower petals, candles, fairy lights, table set for two. Perfect for proposals, birthdays or wedding nights.', 'Tiphanie transforma tu espacio en un decorado de ensueño durante tu ausencia. Pétalos de flores tropicales, velas, guirnaldas luminosas, mesa puesta para dos. Ideal para una pedida de mano, un cumpleaños o una noche de bodas.',
  'decoration-romantique-a-domicile-surprise-sur-mesure', 'romantic-home-decoration-custom-surprise', 'decoracion-romantica-a-domicilio-sorpresa-a-medida',
  'guadeloupe'::public.island, 15000, 'per_person', 120, 1, 1,
  'À domicile — Guadeloupe', 16.265, -61.551, true, true, 'published', array['couple', 'villa', 'cérémonie']::text[],
  5, 19, 24, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  '2f6f30c4-fa0b-4c50-8e2a-d6234670481b', (select id from public.provider_profiles where user_id = '3906fe79-4310-45e4-86f3-5a297359259d'),
  '00000000-0000-4000-8000-000000000c08', 'DJ & ambiance musicale live à domicile', 'DJ & Live Music Vibes — Home Party', 'DJ & ambiente musical en directo a domicilio',
  'Kenzo installe sa sono chez vous ou sur votre terrasse et crée une ambiance caribéenne sur mesure. Zouk, reggae, afrobeat, kompa — selon votre humeur. Soirée mémorable garantie dès le coucher du soleil.', 'Kenzo sets up his sound system in your villa or terrace and creates a tailored Caribbean atmosphere. Zouk, reggae, afrobeat, kompa — whatever your mood. Guaranteed memorable evening from sunset.', 'Kenzo instala su equipo de sonido en tu villa o terraza y crea un ambiente caribeño a medida. Zouk, reggae, afrobeat, kompa — según tu estado de ánimo. Noche memorable garantizada desde la puesta de sol.',
  'dj-ambiance-musicale-live-a-domicile', 'dj-live-music-vibes-home-party', 'dj-ambiente-musical-en-directo-a-domicilio',
  'guadeloupe'::public.island, 25000, 'per_person', 240, 5, 30,
  'À domicile — Guadeloupe', 16.265, -61.551, true, true, 'published', array['soirée', 'amis', 'coucher de soleil']::text[],
  4.8, 38, 47, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  '8b3e55f9-f128-4095-8cd3-6651e56191ef', (select id from public.provider_profiles where user_id = 'bd322cd3-4350-4c1d-8e5f-e35b6a2f071c'),
  '00000000-0000-4000-8000-000000000c09', 'Cocktails créoles à domicile — Masterclass mixologie', 'Creole Cocktails at Home — Mixology Masterclass', 'Cócteles criollos a domicilio — Masterclass de mixología',
  'Léo rapporte ses rhums, ses sirops maison et ses épices des îles directement chez vous. Il vous apprend les secrets du ti-punch parfait, du punch vieux arrangé et de 3 cocktails signatures caribéens. Idéal en groupe ou en couple.', 'Léo brings his rums, house-made syrups and island spices to your villa. He teaches you the secrets of the perfect ti-punch, aged punch and 3 signature Caribbean cocktails. Perfect for groups or couples.', 'Léo trae sus rones, sus siropes caseros y sus especias isleñas directamente a tu villa. Te enseña los secretos del ti-punch perfecto, del punch vieux arrangé y de 3 cócteles caribeños de autor. Ideal en grupo o en pareja.',
  'cocktails-creoles-a-domicile-masterclass-mixologie', 'creole-cocktails-at-home-mixology-masterclass', 'cocteles-criollos-a-domicilio-masterclass-de-mixologia',
  'guadeloupe'::public.island, 8000, 'per_person', 90, 2, 10,
  'À domicile — Guadeloupe', 16.265, -61.551, true, false, 'published', array['gastronomie', 'culture', 'amis', 'couple']::text[],
  4.9, 27, 33, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  'fa0d9947-de40-497e-855c-dc7da79bffe9', (select id from public.provider_profiles where user_id = 'dab078e8-c73f-4092-8fcd-1d1e7abf74de'),
  '00000000-0000-4000-8000-000000000c0a', 'Personal training à domicile — HIIT & fitness sur mesure', 'Home Personal Training — Custom HIIT & Fitness', 'Entrenamiento personal a domicilio — HIIT & fitness a medida',
  'Rafael vient avec tout le matériel directement chez vous, sur votre terrasse ou dans votre jardin. Séance HIIT, circuit training, stretching ou renforcement musculaire selon vos objectifs. Sudation garantie, bonne humeur incluse.', 'Rafael brings all the equipment directly to your villa, terrace or garden. HIIT session, circuit training, stretching or strength work based on your goals. Sweating guaranteed, good vibes included.', 'Rafael viene con todo el material directamente a tu villa, terraza o jardín. Sesión de HIIT, circuit training, estiramientos o fuerza según tus objetivos. Sudor garantizado, buen humor incluido.',
  'personal-training-a-domicile-hiit-fitness-sur-mesure', 'home-personal-training-custom-hiit-fitness', 'entrenamiento-personal-a-domicilio-hiit-fitness-a-medida',
  'guadeloupe'::public.island, 6000, 'per_person', 60, 1, 4,
  'À domicile — Guadeloupe', 16.265, -61.551, true, false, 'published', array['bien-être', 'sport', 'villa', 'couple']::text[],
  4.8, 21, 29, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  'ffac66ae-9f19-45d2-8d60-02b8c0ba06a4', (select id from public.provider_profiles where user_id = '104e9361-bebc-4ac3-86e7-d5755b3f5f63'),
  '00000000-0000-4000-8000-000000000c06', 'Soins beauté complets à domicile — Mani, pédi & soin visage', 'Full Beauty Treatment at Home — Mani, Pedi & Facial', 'Tratamientos de belleza completos a domicilio — Mani, pedi & facial',
  'Naomi arrive chez vous avec tout son matériel professionnel. Manucure, pédicure semi-permanent, soin du visage aux produits naturels locaux, modelage du corps. L''intégralité d''un institut de beauté, chez vous, face à la mer.', 'Naomi arrives at your villa with all her professional equipment. Manicure, semi-permanent pedicure, natural local ingredient facial, body treatment. A full beauty salon experience, at home, facing the sea.', 'Naomi llega a tu villa con todo su equipo profesional. Manicura, pedicura semipermanente, tratamiento facial con productos naturales locales, modelado corporal. La experiencia completa de un instituto de belleza, en casa, frente al mar.',
  'soins-beaute-complets-a-domicile-mani-pedi-soin-visage', 'full-beauty-treatment-at-home-mani-pedi-facial', 'tratamientos-de-belleza-completos-a-domicilio-mani-pedi-facial',
  'guadeloupe'::public.island, 11000, 'per_person', 150, 1, 2,
  'À domicile — Guadeloupe', 16.265, -61.551, true, false, 'published', array['beauté', 'bien-être', 'villa', 'couple']::text[],
  4.9, 41, 53, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  'f52db870-6781-4dc6-8829-2323e550fbbd', (select id from public.provider_profiles where user_id = '40bd17a1-3a14-4050-8867-c875967e9924'),
  '00000000-0000-4000-8000-000000000c0c', 'Cours de danses antillaises à domicile — Zouk & Gwoka', 'Caribbean Dance Class at Home — Zouk & Gwoka', 'Clase de danzas antillanas a domicilio — Zouk & Gwoka',
  'Jérôme se déplace chez vous ou sur votre terrasse pour un cours de danses caribéennes convivial. Zouk, biguine, gwoka, kompa — à deux ou en groupe. Rires, sueur et fierté de repartir avec les bases.', 'Jérôme comes to your villa or terrace for a fun Caribbean dance class. Zouk, biguine, gwoka, kompa — as a couple or group. Laughter, sweat and the pride of leaving with the basics.', 'Jérôme se desplaza a tu villa o terraza para una clase de danzas caribeñas animada. Zouk, biguine, gwoka, kompa — en pareja o en grupo. Risas, sudor y el orgullo de irte con las bases aprendidas.',
  'cours-de-danses-antillaises-a-domicile-zouk-gwoka', 'caribbean-dance-class-at-home-zouk-gwoka', 'clase-de-danzas-antillanas-a-domicilio-zouk-gwoka',
  'martinique'::public.island, 7500, 'per_person', 90, 2, 12,
  'À domicile — Martinique', 14.666, -61.022, true, false, 'published', array['culture', 'couple', 'amis', 'famille']::text[],
  4.8, 24, 31, true, '2024-01-01', '2024-01-01'
);
insert into public.services (
  id, provider_id, category_id, title_fr, title_en, title_es, description_fr, description_en, description_es,
  slug_fr, slug_en, slug_es, island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, status, tags, avg_rating, review_count, booking_count,
  is_demo, created_at, updated_at
) values (
  '211dfeec-4c66-41bf-81df-5d25304138e9', (select id from public.provider_profiles where user_id = '0297752b-20c6-4a39-80dc-93aa92f065a4'),
  '00000000-0000-4000-8000-000000000c06', 'Maquillage artiste à domicile — Soirée, mariage & cérémonie', 'Artist Makeup at Home — Evenings, Weddings & Ceremonies', 'Maquillaje artístico a domicilio — Noches, bodas & ceremonias',
  'Kaïssa se déplace avec son vanity complet chez vous ou à l''hôtel. Maquillage soirée, mariage, shooting photo ou cérémonie. Peau préparée, résultat longue tenue. Elle sait magnifier tous les types de carnation.', 'Kaïssa travels with her complete kit to your villa or hotel. Evening, wedding, photoshoot or ceremony makeup. Prepared skin, long-lasting result. She knows how to enhance all skin tones.', 'Kaïssa viaja con su maletín completo a tu villa o hotel. Maquillaje de noche, boda, sesión fotográfica o ceremonia. Piel preparada, resultado de larga duración. Sabe resaltar todo tipo de carnación.',
  'maquillage-artiste-a-domicile-soiree-mariage-ceremonie', 'artist-makeup-at-home-evenings-weddings-ceremonies', 'maquillaje-artistico-a-domicilio-noches-bodas-ceremonias',
  'martinique'::public.island, 9000, 'per_person', 90, 1, 4,
  'À domicile — Martinique', 14.666, -61.022, true, true, 'published', array['beauté', 'cérémonie', 'villa', 'soirée']::text[],
  5, 31, 39, true, '2024-01-01', '2024-01-01'
);

-- Service images
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('a0f9ee94-ede6-4e56-8e08-1607bc59e72d', '50c67550-383b-4a73-8a76-6aac9acaf0da', '/photos/chef-marcus.jpeg', 'Chef Marcus en cuisine', 'Chef Marcus cooking', 'Chef Marcus cooking', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('ca2ae19d-c95d-44ad-86e9-fb304eddc6d4', '50c67550-383b-4a73-8a76-6aac9acaf0da', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Chef Marcus en cuisine', 'Chef Marcus cooking', 'Chef Marcus cooking', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('eddeb05e-4cba-4d57-85b4-eefa27bcb13a', '50c67550-383b-4a73-8a76-6aac9acaf0da', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Villa de luxe', 'Luxury villa', 'Luxury villa', 2, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('84ffeff2-36e3-421e-896c-9a06ba7a908c', 'e46afda9-5132-4cc3-8384-791fc792b3a8', '/photos/masseuse-ingrid.jpeg', 'Masseuse Ingrid à domicile', 'Masseuse Ingrid home visit', 'Masseuse Ingrid home visit', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('833c8912-3e7d-4754-834d-5f117d0ac87c', 'e46afda9-5132-4cc3-8384-791fc792b3a8', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Villa privée', 'Private villa', 'Private villa', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('efa356f5-bf77-4007-82f1-108c7098a613', 'e46afda9-5132-4cc3-8384-791fc792b3a8', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Ambiance spa', 'Spa atmosphere', 'Spa atmosphere', 2, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('069673eb-fdcf-41cc-8b14-192a2339451d', 'c8ef5789-3aa4-4201-8f4a-308d23744bf1', '/photos/photographe-william.jpeg', 'Photographe William en action', 'Photographer William at work', 'Photographer William at work', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('65bf53cf-bdf0-4524-8443-008c8fd91e0c', 'c8ef5789-3aa4-4201-8f4a-308d23744bf1', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Shooting couple', 'Couple shoot', 'Couple shoot', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('a15cd30d-a00b-4285-87d1-b1be59bee978', '7ae31d9e-3e3a-43fb-878a-afcc4e3aaf80', '/photos/yoga-plage-tropicale.jpeg', 'Yoga au coucher de soleil sous les palmiers', 'Sunset yoga under palm trees', 'Sunset yoga under palm trees', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('7ead9b19-0620-4996-8c19-cae5b89d804a', '7ae31d9e-3e3a-43fb-878a-afcc4e3aaf80', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Yoga à domicile', 'Yoga at home', 'Yoga at home', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('be2955b7-6a4e-4134-8443-c6ad14d8dec1', '9c74580b-8fc9-4e63-8664-6205ecd75641', '/photos/chef-cuisto-muriel.jpeg', 'Chef Muriel — cours de cuisine créole', 'Chef Muriel — Creole cooking class', 'Chef Muriel — Creole cooking class', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('0405e6b7-8b52-4b3e-8f6f-14e4d27bb4ff', '9c74580b-8fc9-4e63-8664-6205ecd75641', 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Plats créoles', 'Creole dishes', 'Creole dishes', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('60537e5e-24d2-41b3-8f94-56dbac8366dc', 'ee241a25-5614-46e3-8aae-ef1b020e783f', '/photos/masseuse-ingrid.jpeg', 'Masseuse Ingrid — duo aromathérapie', 'Masseuse Ingrid — couple aromatherapy', 'Masseuse Ingrid — couple aromatherapy', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('b44d1a62-f728-4de7-8d5e-611fc898ac6a', 'ee241a25-5614-46e3-8aae-ef1b020e783f', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Villa de luxe', 'Luxury villa', 'Luxury villa', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('28c81f06-ee83-4a55-84f7-11d0e49910ef', 'ef64a950-920f-4464-869c-799136671e6c', '/photos/coiffure-tresses.jpeg', 'Tresses africaines à domicile', 'African braids home visit', 'African braids home visit', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('a9cc5641-c063-42b4-8790-ea617fcadd68', 'ef64a950-920f-4464-869c-799136671e6c', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Coiffure créole', 'Creole hairstyle', 'Creole hairstyle', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('3562d0fa-86d7-4b7b-8117-a96f8066bb0a', 'b45a8e20-840f-4912-803b-927825f74e04', '/photos/babysitter-villa.jpeg', 'Babysitter avec enfants à domicile', 'Babysitter with children at villa', 'Babysitter with children at villa', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('5f6ffefe-82d2-4437-8b26-7b296e6ae96d', 'b45a8e20-840f-4912-803b-927825f74e04', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Activités enfants à domicile', 'Kids activities at home', 'Kids activities at home', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('b4474e03-5166-4686-869a-ac9a386b4db9', '599b8d7c-2e70-48c5-8ef8-8fd11409153b', '/photos/chef-marcus.jpeg', 'Chef Marcus — brunch créole en terrasse', 'Chef Marcus — Creole terrace brunch', 'Chef Marcus — Creole terrace brunch', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('70245fa2-b952-4b4e-8fb5-d2cbe68954f8', '599b8d7c-2e70-48c5-8ef8-8fd11409153b', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Villa vue mer', 'Sea view villa', 'Sea view villa', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('ca34f739-6a79-4b80-80f0-e21c640b7dd3', '042420ef-f4b6-42b3-8662-b4f8ee9c9d9c', '/photos/photographe-william.jpeg', 'Photographe William — shooting famille', 'Photographer William — family shoot', 'Photographer William — family shoot', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('2e2e6b9c-0ce4-48df-82db-3ef36368e31b', '042420ef-f4b6-42b3-8662-b4f8ee9c9d9c', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Photo famille en villa', 'Family villa photo', 'Family villa photo', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('0e36ea4b-b71c-4c9b-822a-82169ecf74fd', 'f4b79c7e-dd2d-45eb-8d0e-07671390943d', '/photos/deco-romantique-villa.jpeg', 'Table romantique décorée fleurs et bougies', 'Romantic table with flowers and candles', 'Romantic table with flowers and candles', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('92df92d8-e33b-43cc-80e3-0bb597970572', 'f4b79c7e-dd2d-45eb-8d0e-07671390943d', 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Fleurs tropicales', 'Tropical flowers', 'Tropical flowers', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('9cb017d5-259e-414a-8d53-845a01d6150d', '2f6f30c4-fa0b-4c50-8e2a-d6234670481b', '/photos/dj-soiree-villa.jpeg', 'DJ Kenzo — soirée lumières villa', 'DJ Kenzo — villa party lights', 'DJ Kenzo — villa party lights', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('8c679c05-be6b-4453-89e9-b74495b7938c', '2f6f30c4-fa0b-4c50-8e2a-d6234670481b', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Soirée à domicile', 'Home party', 'Home party', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('2a988f7d-b7d9-409d-8d4e-de227394ad44', '8b3e55f9-f128-4095-8cd3-6651e56191ef', '/photos/barmaid-yael.jpeg', 'Barman Yaël — masterclass cocktails créoles', 'Barman Yaël — Creole cocktail masterclass', 'Barman Yaël — Creole cocktail masterclass', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('2aa012a6-5c43-4785-863c-baed5e6966af', '8b3e55f9-f128-4095-8cd3-6651e56191ef', 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Rhum arrangé à domicile', 'Home rum tasting', 'Home rum tasting', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('f142fb4c-373b-46ea-8adb-9a7f248d2dce', 'fa0d9947-de40-497e-855c-dc7da79bffe9', '/photos/coach-sportif-eric.jpeg', 'Coach Éric — HIIT sur la plage', 'Coach Eric — beach HIIT session', 'Coach Eric — beach HIIT session', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('6f464898-66cd-4510-8dcf-6d6798d348a0', 'fa0d9947-de40-497e-855c-dc7da79bffe9', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Séance fitness', 'Fitness session', 'Fitness session', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('23224f64-4771-4acb-8a8d-8ab0e83397db', 'ffac66ae-9f19-45d2-8d60-02b8c0ba06a4', '/photos/soins-beaute-naomi.jpeg', 'Soins ongles professionnels à domicile', 'Professional nail care at villa', 'Professional nail care at villa', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('b3fdf968-a6e7-4909-815a-58876513a681', 'ffac66ae-9f19-45d2-8d60-02b8c0ba06a4', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Maquillage professionnel', 'Professional makeup', 'Professional makeup', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('4701d08e-4bff-4eac-8400-f45a97498b90', 'f52db870-6781-4dc6-8829-2323e550fbbd', '/photos/danse-caribeenne.jpeg', 'Couple dansant au bord de la mer', 'Couple dancing by the sea', 'Couple dancing by the sea', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('af5520d5-ed32-4272-8904-503b82039a42', 'f52db870-6781-4dc6-8829-2323e550fbbd', 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Danse en couple', 'Couple dancing', 'Couple dancing', 1, false);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('b44a673b-c527-41b1-8284-e0f8e37da1f0', '211dfeec-4c66-41bf-81df-5d25304138e9', '/photos/maquillage-artiste.jpeg', 'Maquilleuse Kaïssa à domicile', 'Makeup artist Kaïssa at villa', 'Makeup artist Kaïssa at villa', 0, true);
insert into public.service_images (id, service_id, url, alt_fr, alt_en, alt_es, sort_order, is_cover)
values ('8e85ed26-3185-4e7c-8dbc-59ddf35cfdc5', '211dfeec-4c66-41bf-81df-5d25304138e9', 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&h=600&fit=crop&q=85&bri=8&sat=8', 'Séance maquillage', 'Makeup session', 'Makeup session', 1, false);

-- Availability: next 90 days, same start times as the booking UI. Slot length = service duration.
insert into public.availability_slots (service_id, date, start_time, end_time)
select s.id, d::date, t, (t + make_interval(mins => coalesce(s.duration_min, 60)))::time
from public.services s
cross join generate_series(current_date + 1, current_date + 90, interval '1 day') d
cross join unnest(array['09:00','10:00','11:00','14:00','15:00','16:00','18:00','19:00','20:00']::time[]) t
where s.is_demo
  and extract(epoch from t) / 60 + coalesce(s.duration_min, 60) <= 1439;

