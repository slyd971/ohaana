-- Ohaana — Migration 006 : données de référence (réelles, PAS des données de démo)
-- UUID stables pour pouvoir y faire référence depuis le seed et le code.

insert into public.cancellation_policies (id, code, name_fr, name_en, name_es, rules, is_default) values
  ('00000000-0000-4000-8000-0000000000a1', 'flexible',
   'Flexible', 'Flexible', 'Flexible',
   '[{"hours_before":48,"refund_pct":100},{"hours_before":24,"refund_pct":50},{"hours_before":0,"refund_pct":0}]', true),
  ('00000000-0000-4000-8000-0000000000a2', 'moderate',
   'Modérée', 'Moderate', 'Moderada',
   '[{"hours_before":96,"refund_pct":100},{"hours_before":48,"refund_pct":50},{"hours_before":0,"refund_pct":0}]', false),
  ('00000000-0000-4000-8000-0000000000a3', 'strict',
   'Stricte', 'Strict', 'Estricta',
   '[{"hours_before":168,"refund_pct":100},{"hours_before":72,"refund_pct":50},{"hours_before":0,"refund_pct":0}]', false)
on conflict (code) do nothing;

insert into public.service_categories (id, slug, name_fr, name_en, name_es, icon, color, sort_order) values
  ('00000000-0000-4000-8000-000000000c01', 'chef_prive',  'Chef.fe privé.e',     'Private Chef',     'Chef privado',          '🍽️', '#E8604A', 1),
  ('00000000-0000-4000-8000-000000000c02', 'massage',     'Massage & spa',       'Massage & Spa',    'Masaje y spa',          '💆', '#2ABFB8', 2),
  ('00000000-0000-4000-8000-000000000c03', 'photographe', 'Photographe',         'Photographer',     'Fotógrafo',             '📸', '#F5EDD8', 3),
  ('00000000-0000-4000-8000-000000000c04', 'fitness',     'Coach fitness',       'Fitness Coach',    'Entrenador fitness',    '🏋️', '#1C1C1E', 4),
  ('00000000-0000-4000-8000-000000000c05', 'coiffure',    'Coiffure',            'Hair Styling',     'Peluquería',            '💇', '#2ABFB8', 5),
  ('00000000-0000-4000-8000-000000000c06', 'maquillage',  'Maquillage',          'Makeup',           'Maquillaje',            '💄', '#E8604A', 6),
  ('00000000-0000-4000-8000-000000000c07', 'babysitter',  'Garde d''enfants',    'Childcare',        'Cuidado de niños',      '👶', '#F5EDD8', 7),
  ('00000000-0000-4000-8000-000000000c08', 'musique',     'DJ & musique live',   'DJ & Live Music',  'DJ y música en vivo',   '🎵', '#1A3D2B', 8),
  ('00000000-0000-4000-8000-000000000c09', 'bar',         'Bar & mixologie',     'Bar & Mixology',   'Bar y coctelería',      '🍹', '#2ABFB8', 9),
  ('00000000-0000-4000-8000-000000000c0a', 'sport',       'Sport & coaching',    'Sport & Coaching', 'Deporte y coaching',    '💪', '#1A3D2B', 10),
  ('00000000-0000-4000-8000-000000000c0b', 'evenement',   'Déco & événements',   'Decor & Events',   'Decoración y eventos',  '🎉', '#E8604A', 11),
  ('00000000-0000-4000-8000-000000000c0c', 'danse',       'Danse & culture',     'Dance & Culture',  'Danza y cultura',       '💃', '#E8604A', 12)
on conflict (slug) do nothing;
