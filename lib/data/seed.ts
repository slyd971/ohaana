import type { ServiceCategory } from '@/types/database'
import {
  UtensilsCrossed, Sparkles, Sailboat, Camera, Waves,
  Landmark, Scissors, Wand2, Heart, Map,
  type LucideIcon,
} from 'lucide-react'

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  chef_prive:   UtensilsCrossed,
  massage:      Sparkles,
  bateau:       Sailboat,
  photographe:  Camera,
  fitness:      Waves,
  culture:      Landmark,
  coiffure:     Scissors,
  maquillage:   Wand2,
  babysitter:   Heart,
  guide:        Map,
}

// ─── Photos lumineuses — lumière naturelle caribéenne, extérieur, tons chauds ─
const P = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=85&bri=8&sat=8`

const IMG = {
  // Chef en villa, lumière dorée naturelle — pas cuisine studio
  chef:       P('photo-1504674900247-0877df9cc836'),
  chefPlat:   P('photo-1555244162-803834f70033'),
  // Massage en plein air / terrasse vue mer
  massage:    P('photo-1519823551278-64ac92734fb1'),
  spa:        P('photo-1600334089648-b0d9d3028eb2'),
  // Catamaran — eaux turquoise Caraïbes
  catamaran:  P('photo-1500514966906-fe245eea9344'),
  catamaranSunset: P('photo-1502680390469-be75c86b636f'),
  // Photo lifestyle en extérieur
  photo:      P('photo-1531746020798-e6953c6e8e04'),
  beachPhoto: P('photo-1507525428034-b723cf961d3e'),
  // Yoga & fitness sur la plage au lever du soleil
  fitness:    P('photo-1599901860904-17e6ed7083a0'),
  beachYoga:  P('photo-1506126613408-eca07ce68773'),
  // Culture créole en plein air — marché, fête
  culture:    P('photo-1516450360452-9312f5e86fc7'),
  // Dégustation rhum en extérieur, plantation ensoleillée
  rhum:       P('photo-1551538827-9c037cb4f32a'),
  // Beauty en lumière naturelle
  coiffure:   P('photo-1562322140-8baeececf3df'),
  maquillage: P('photo-1487412912498-0447578fcca8'),
  // Villa & plage — lumineux, bleu turquoise
  villa:      P('photo-1566073771259-6a8506099945'),
  beach:      P('photo-1544551763-46a013bb70d5'),
  guadeloupe: P('photo-1559827260-dc66d52bef19'),
  tropique:   P('photo-1519046904884-53103b34b206'),
  guide:      P('photo-1488646953014-85cb44e25828'),
  cooking:    P('photo-1466637574441-749b8f19452f'),
}

export const CATEGORIES: ServiceCategory[] = [
  { id: 'cat-1', slug: 'chef_prive',  name_fr: 'Chef privé',         name_en: 'Private Chef',       icon: '🍽️', color: '#E8604A', sort_order: 1, is_active: true },
  { id: 'cat-2', slug: 'massage',     name_fr: 'Massage & spa',       name_en: 'Massage & Spa',      icon: '💆', color: '#2ABFB8', sort_order: 2, is_active: true },
  { id: 'cat-3', slug: 'bateau',      name_fr: 'Tour en bateau',      name_en: 'Boat Tour',          icon: '⛵', color: '#1A3D2B', sort_order: 3, is_active: true },
  { id: 'cat-4', slug: 'photographe', name_fr: 'Photographe',         name_en: 'Photographer',       icon: '📸', color: '#F5EDD8', sort_order: 4, is_active: true },
  { id: 'cat-5', slug: 'fitness',     name_fr: 'Coach fitness',       name_en: 'Fitness Coach',      icon: '🏋️', color: '#1C1C1E', sort_order: 5, is_active: true },
  { id: 'cat-6', slug: 'culture',     name_fr: 'Expérience culturelle', name_en: 'Cultural Experience', icon: '🎭', color: '#E8604A', sort_order: 6, is_active: true },
  { id: 'cat-7', slug: 'coiffure',    name_fr: 'Coiffure',            name_en: 'Hair Styling',       icon: '💇', color: '#2ABFB8', sort_order: 7, is_active: true },
  { id: 'cat-8', slug: 'maquillage',  name_fr: 'Maquillage',          name_en: 'Makeup',             icon: '💄', color: '#E8604A', sort_order: 8, is_active: true },
  { id: 'cat-9', slug: 'babysitter',  name_fr: 'Babysitter',          name_en: 'Babysitter',         icon: '👶', color: '#F5EDD8', sort_order: 9, is_active: true },
  { id: 'cat-10', slug: 'guide',      name_fr: 'Guide touristique',   name_en: 'Tour Guide',         icon: '🗺️', color: '#1A3D2B', sort_order: 10, is_active: true },
]

export const PROVIDERS = [
  {
    id: 'p-1', user_id: 'u-1',
    business_name: 'Chef Marcus',
    bio: 'Chef étoilé formé à Paris, revenu au pays pour sublimer la cuisine créole. Spécialiste du dîner en villa et des accords rhum-gastronomie.',
    bio_en: 'Michelin-trained chef who returned home to celebrate Creole cuisine. Specialist in villa dinners and rum-gastronomy pairings.',
    languages: ['fr', 'en'], certifications: ['CAP Cuisine', 'Certification Hygiène'],
    island: 'guadeloupe', phone: '+590 690 000 001', whatsapp: '+590690000001',
    stripe_account_id: null, stripe_onboarded: false, is_approved: true,
    avg_rating: 4.9, review_count: 47, created_at: '2024-01-01', updated_at: '2024-01-01',
    user: { full_name: 'Marcus Théophile', avatar_url: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=200&h=200&fit=crop' },
  },
  {
    id: 'p-2', user_id: 'u-2',
    business_name: 'Massage Madeleine',
    bio: 'Masseuse certifiée en thérapies caribéennes. Huiles essentielles locales, massage sur la plage ou dans votre villa.',
    bio_en: 'Certified therapist in Caribbean healing arts. Local essential oils, beach or villa massage.',
    languages: ['fr', 'en', 'es'], certifications: ['BPJEPS Bien-être'],
    island: 'guadeloupe', phone: '+590 690 000 002', whatsapp: '+590690000002',
    stripe_account_id: null, stripe_onboarded: false, is_approved: true,
    avg_rating: 4.8, review_count: 83, created_at: '2024-01-01', updated_at: '2024-01-01',
    user: { full_name: 'Madeleine Lacroix', avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop' },
  },
  {
    id: 'p-3', user_id: 'u-3',
    business_name: 'Capitaine Joël',
    bio: '15 ans de navigation aux Antilles. Catamaran privé jusqu\'à 8 personnes, coucher de soleil sur les îlets Pigeon, snorkeling.',
    bio_en: '15 years sailing the Caribbean. Private catamaran for up to 8, Pigeon Islands sunset, snorkeling.',
    languages: ['fr', 'en'], certifications: ['Capitaine 200', 'Brevet Sauvetage'],
    island: 'guadeloupe', phone: '+590 690 000 003', whatsapp: '+590690000003',
    stripe_account_id: null, stripe_onboarded: false, is_approved: true,
    avg_rating: 4.9, review_count: 124, created_at: '2024-01-01', updated_at: '2024-01-01',
    user: { full_name: 'Joël Beaumont', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  },
  {
    id: 'p-4', user_id: 'u-4',
    business_name: 'Studio Camille Photo',
    bio: 'Photographe lifestyle & couple. Shooting au lever du soleil sur la plage, en pirogue, dans les champs de canne — des images comme nulle part ailleurs.',
    bio_en: 'Lifestyle & couple photographer. Sunrise beach shoots, pirogue, sugarcane fields — images you can\'t get anywhere else.',
    languages: ['fr', 'en'], certifications: [],
    island: 'guadeloupe', phone: '+590 690 000 004', whatsapp: '+590690000004',
    stripe_account_id: null, stripe_onboarded: false, is_approved: true,
    avg_rating: 5.0, review_count: 36, created_at: '2024-01-01', updated_at: '2024-01-01',
    user: { full_name: 'Camille Desroses', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  },
  {
    id: 'p-5', user_id: 'u-5',
    business_name: 'Yoga & Fitness Keisha',
    bio: 'Coach certifiée yoga et fitness. Séances au bord de l\'eau à l\'aube, en groupe ou en privé. Spécialité : yoga coucher de soleil sur la plage.',
    bio_en: 'Certified yoga & fitness coach. Waterfront dawn sessions, group or private. Specialty: sunset beach yoga.',
    languages: ['fr', 'en'], certifications: ['200h Yoga Alliance', 'BPJEPS Fitness'],
    island: 'guadeloupe', phone: '+590 690 000 005', whatsapp: '+590690000005',
    stripe_account_id: null, stripe_onboarded: false, is_approved: true,
    avg_rating: 4.7, review_count: 29, created_at: '2024-01-01', updated_at: '2024-01-01',
    user: { full_name: 'Keisha Dantor', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
  },
  {
    id: 'p-6', user_id: 'u-6',
    business_name: 'Distillerie Mamie Rose',
    bio: 'Famille productrice de rhum depuis 4 générations. Visite et dégustation privée en distillerie, accord mets-rhum, vente directe.',
    bio_en: '4-generation rum-making family. Private distillery visit & tasting, food pairing, direct sales.',
    languages: ['fr', 'en', 'kr'], certifications: ['Label Rhum Agricole AOC'],
    island: 'guadeloupe', phone: '+590 690 000 006', whatsapp: '+590690000006',
    stripe_account_id: null, stripe_onboarded: false, is_approved: true,
    avg_rating: 4.8, review_count: 61, created_at: '2024-01-01', updated_at: '2024-01-01',
    user: { full_name: 'Marie-Rose Ladoucette', avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop' },
  },
  {
    id: 'p-7', user_id: 'u-7',
    business_name: 'Chef Clarisse',
    bio: 'Cours de cuisine créole dans ma cuisine ou dans votre villa. Recettes familiales transmises de génération en génération : accras, colombo, boudins créoles.',
    bio_en: 'Creole cooking classes at my home or your villa. Family recipes passed down through generations.',
    languages: ['fr'], certifications: ['CAP Cuisine'],
    island: 'guadeloupe', phone: '+590 690 000 007', whatsapp: '+590690000007',
    stripe_account_id: null, stripe_onboarded: false, is_approved: true,
    avg_rating: 4.9, review_count: 52, created_at: '2024-01-01', updated_at: '2024-01-01',
    user: { full_name: 'Clarisse Moreau', avatar_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop' },
  },
]

export const SERVICES = [
  {
    id: 's-1', provider_id: 'p-1', category_id: 'cat-1',
    title_fr: 'Dîner de chef en villa — Menu Créole Prestige',
    title_en: 'Private Villa Chef Dinner — Prestige Creole Menu',
    description_fr: 'Marcus prend possession de votre cuisine et transforme votre villa en restaurant étoilé. Menu 5 services avec produits locaux du marché, accord rhum agricole. Pour 2 à 8 personnes.',
    description_en: 'Marcus takes over your kitchen and turns your villa into a fine dining experience. 5-course menu with local market products, agricultural rum pairing. For 2 to 8 guests.',
    island: 'guadeloupe', price_cents: 18000, duration_min: 180,
    capacity_min: 2, capacity_max: 8,
    address: 'À domicile — Guadeloupe', latitude: 16.265, longitude: -61.551,
    is_active: true, is_featured: true,
    tags: ['luxe', 'gastronomie', 'villa', 'couple', 'famille'],
    avg_rating: 4.9, review_count: 47, booking_count: 89,
    created_at: '2024-01-01', updated_at: '2024-01-01',
    provider: PROVIDERS[0],
    images: [
      { id: 'i-1a', service_id: 's-1', url: IMG.chefPlat, alt_fr: 'Plat créole gastronomique', alt_en: 'Gourmet Creole dish', sort_order: 0, is_cover: true, created_at: '2024-01-01' },
      { id: 'i-1b', service_id: 's-1', url: IMG.chef, alt_fr: 'Chef Marcus en cuisine', alt_en: 'Chef Marcus cooking', sort_order: 1, is_cover: false, created_at: '2024-01-01' },
      { id: 'i-1c', service_id: 's-1', url: IMG.villa, alt_fr: 'Villa de luxe', alt_en: 'Luxury villa', sort_order: 2, is_cover: false, created_at: '2024-01-01' },
    ],
  },
  {
    id: 's-2', provider_id: 'p-2', category_id: 'cat-2',
    title_fr: 'Massage balinais sur la plage — 90 min',
    title_en: 'Balinese Beach Massage — 90 min',
    description_fr: 'Massage balinais avec huiles essentielles de vanille et ylang-ylang de Guadeloupe, directement sur votre plage ou dans votre villa. Une heure trente de pur lâcher-prise.',
    description_en: 'Balinese massage with local vanilla and ylang-ylang essential oils, on your beach or in your villa. 90 minutes of pure bliss.',
    island: 'guadeloupe', price_cents: 12000, duration_min: 90,
    capacity_min: 1, capacity_max: 2,
    address: 'À domicile ou sur plage — Guadeloupe', latitude: 16.200, longitude: -61.580,
    is_active: true, is_featured: true,
    tags: ['bien-être', 'couple', 'plage', 'relaxation'],
    avg_rating: 4.8, review_count: 83, booking_count: 156,
    created_at: '2024-01-01', updated_at: '2024-01-01',
    provider: PROVIDERS[1],
    images: [
      { id: 'i-2a', service_id: 's-2', url: IMG.massage, alt_fr: 'Massage bien-être', alt_en: 'Wellness massage', sort_order: 0, is_cover: true, created_at: '2024-01-01' },
      { id: 'i-2b', service_id: 's-2', url: IMG.beach, alt_fr: 'Plage de sable blanc', alt_en: 'White sand beach', sort_order: 1, is_cover: false, created_at: '2024-01-01' },
      { id: 'i-2c', service_id: 's-2', url: IMG.spa, alt_fr: 'Ambiance spa', alt_en: 'Spa atmosphere', sort_order: 2, is_cover: false, created_at: '2024-01-01' },
    ],
  },
  {
    id: 's-3', provider_id: 'p-3', category_id: 'cat-3',
    title_fr: 'Catamaran privé — Coucher de soleil & îlets Pigeon',
    title_en: 'Private Catamaran — Sunset & Pigeon Islands',
    description_fr: 'Naviguez en catamaran privé jusqu\'aux îlets Pigeon, snorkeling dans la réserve Cousteau, apéro créole à bord au coucher du soleil. Champagne inclus. Jusqu\'à 8 personnes.',
    description_en: 'Private catamaran to Pigeon Islands, snorkeling in the Cousteau Reserve, Creole aperitif on board at sunset. Champagne included. Up to 8 people.',
    island: 'guadeloupe', price_cents: 25000, duration_min: 240,
    capacity_min: 2, capacity_max: 8,
    address: 'Départ port de Bouillante', latitude: 16.130, longitude: -61.770,
    is_active: true, is_featured: true,
    tags: ['aventure', 'luxe', 'couple', 'famille', 'coucher de soleil'],
    avg_rating: 4.9, review_count: 124, booking_count: 210,
    created_at: '2024-01-01', updated_at: '2024-01-01',
    provider: PROVIDERS[2],
    images: [
      { id: 'i-3a', service_id: 's-3', url: IMG.catamaranSunset, alt_fr: 'Catamaran coucher de soleil', alt_en: 'Catamaran sunset', sort_order: 0, is_cover: true, created_at: '2024-01-01' },
      { id: 'i-3b', service_id: 's-3', url: IMG.catamaran, alt_fr: 'Navigation en mer des Caraïbes', alt_en: 'Sailing the Caribbean', sort_order: 1, is_cover: false, created_at: '2024-01-01' },
      { id: 'i-3c', service_id: 's-3', url: IMG.tropique, alt_fr: 'Îlets Pigeon', alt_en: 'Pigeon Islands', sort_order: 2, is_cover: false, created_at: '2024-01-01' },
    ],
  },
  {
    id: 's-4', provider_id: 'p-4', category_id: 'cat-4',
    title_fr: 'Shooting photo couple — Lever de soleil sur la plage',
    title_en: 'Couple Photoshoot — Sunrise on the Beach',
    description_fr: 'Réveillez-vous avant l\'aube pour une séance photo magique au lever du soleil. Camille capture votre complicité dans la lumière dorée des Caraïbes. Galerie HD livrée en 48h.',
    description_en: 'Wake up before dawn for a magical sunrise photoshoot. Camille captures your connection in the golden Caribbean light. HD gallery delivered in 48h.',
    island: 'guadeloupe', price_cents: 22000, duration_min: 120,
    capacity_min: 1, capacity_max: 4,
    address: 'Plage de la Datcha, Le Gosier', latitude: 16.200, longitude: -61.490,
    is_active: true, is_featured: false,
    tags: ['couple', 'luxe', 'souvenir', 'plage'],
    avg_rating: 5.0, review_count: 36, booking_count: 41,
    created_at: '2024-01-01', updated_at: '2024-01-01',
    provider: PROVIDERS[3],
    images: [
      { id: 'i-4a', service_id: 's-4', url: IMG.beachPhoto, alt_fr: 'Photo plage au lever du soleil', alt_en: 'Sunrise beach photo', sort_order: 0, is_cover: true, created_at: '2024-01-01' },
      { id: 'i-4b', service_id: 's-4', url: IMG.photo, alt_fr: 'Shooting couple', alt_en: 'Couple shoot', sort_order: 1, is_cover: false, created_at: '2024-01-01' },
    ],
  },
  {
    id: 's-5', provider_id: 'p-5', category_id: 'cat-5',
    title_fr: 'Yoga au coucher du soleil sur la plage',
    title_en: 'Sunset Beach Yoga',
    description_fr: 'Une heure de yoga doux face à la mer, accompagnée du bruit des vagues et des couleurs orangées du couchant. Tapis fourni. Débutants bienvenus.',
    description_en: 'One hour of gentle yoga facing the sea, accompanied by waves and sunset colors. Mat provided. Beginners welcome.',
    island: 'guadeloupe', price_cents: 4500, duration_min: 60,
    capacity_min: 1, capacity_max: 10,
    address: 'Plage de Sainte-Anne', latitude: 16.218, longitude: -61.380,
    is_active: true, is_featured: false,
    tags: ['bien-être', 'plage', 'relaxation', 'couple'],
    avg_rating: 4.7, review_count: 29, booking_count: 67,
    created_at: '2024-01-01', updated_at: '2024-01-01',
    provider: PROVIDERS[4],
    images: [
      { id: 'i-5a', service_id: 's-5', url: IMG.beachYoga, alt_fr: 'Yoga face à la mer', alt_en: 'Yoga facing the sea', sort_order: 0, is_cover: true, created_at: '2024-01-01' },
      { id: 'i-5b', service_id: 's-5', url: IMG.fitness, alt_fr: 'Séance fitness', alt_en: 'Fitness session', sort_order: 1, is_cover: false, created_at: '2024-01-01' },
    ],
  },
  {
    id: 's-6', provider_id: 'p-6', category_id: 'cat-6',
    title_fr: 'Dégustation rhum agricole — Distillerie familiale',
    title_en: 'Agricultural Rum Tasting — Family Distillery',
    description_fr: 'Plongez dans l\'histoire du rhum agricole AOC Guadeloupe. Visite de la distillerie, dégustation de 8 rhums, accord avec spécialités créoles. Un moment d\'authenticité rare.',
    description_en: 'Dive into the history of AOC Guadeloupe agricultural rum. Distillery tour, tasting of 8 rums, paired with Creole specialties. A rare authentic experience.',
    island: 'guadeloupe', price_cents: 8500, duration_min: 120,
    capacity_min: 2, capacity_max: 12,
    address: 'Distillerie Mamie Rose, Capesterre-Belle-Eau', latitude: 16.040, longitude: -61.565,
    is_active: true, is_featured: false,
    tags: ['culture', 'gastronomie', 'amis', 'couple'],
    avg_rating: 4.8, review_count: 61, booking_count: 98,
    created_at: '2024-01-01', updated_at: '2024-01-01',
    provider: PROVIDERS[5],
    images: [
      { id: 'i-6a', service_id: 's-6', url: IMG.rhum, alt_fr: 'Dégustation rhum', alt_en: 'Rum tasting', sort_order: 0, is_cover: true, created_at: '2024-01-01' },
      { id: 'i-6b', service_id: 's-6', url: IMG.culture, alt_fr: 'Culture créole', alt_en: 'Creole culture', sort_order: 1, is_cover: false, created_at: '2024-01-01' },
    ],
  },
  {
    id: 's-7', provider_id: 'p-7', category_id: 'cat-1',
    title_fr: 'Cours de cuisine créole — Accras, Colombo & Boudins',
    title_en: 'Creole Cooking Class — Accras, Colombo & Boudins',
    description_fr: 'Apprenez les secrets de la cuisine antillaise avec Clarisse. Marché le matin, cours l\'après-midi, déjeuner ensemble avec vos créations. Recettes à emporter.',
    description_en: 'Learn the secrets of Antillean cooking with Clarisse. Morning market, afternoon class, shared lunch with your creations. Recipes to take home.',
    island: 'guadeloupe', price_cents: 9500, duration_min: 180,
    capacity_min: 2, capacity_max: 6,
    address: 'Pointe-à-Pitre, Guadeloupe', latitude: 16.242, longitude: -61.535,
    is_active: true, is_featured: true,
    tags: ['culture', 'gastronomie', 'famille', 'amis'],
    avg_rating: 4.9, review_count: 52, booking_count: 73,
    created_at: '2024-01-01', updated_at: '2024-01-01',
    provider: PROVIDERS[6],
    images: [
      { id: 'i-7a', service_id: 's-7', url: IMG.cooking, alt_fr: 'Cours de cuisine créole', alt_en: 'Creole cooking class', sort_order: 0, is_cover: true, created_at: '2024-01-01' },
      { id: 'i-7b', service_id: 's-7', url: IMG.chefPlat, alt_fr: 'Plats créoles', alt_en: 'Creole dishes', sort_order: 1, is_cover: false, created_at: '2024-01-01' },
    ],
  },
  {
    id: 's-8', provider_id: 'p-2', category_id: 'cat-2',
    title_fr: 'Duo massage en villa — Aromathérapie caraïbe',
    title_en: 'Villa Couple Massage — Caribbean Aromatherapy',
    description_fr: 'Madeleine et son associée viennent dans votre villa pour un massage duo simultané. Aromathérapie avec huiles locales, ambiance bougies. Le luxe à domicile.',
    description_en: 'Madeleine and her associate come to your villa for a simultaneous couple massage. Aromatherapy with local oils, candlelit ambiance. Luxury at home.',
    island: 'guadeloupe', price_cents: 20000, duration_min: 90,
    capacity_min: 2, capacity_max: 2,
    address: 'À domicile — Guadeloupe', latitude: 16.200, longitude: -61.580,
    is_active: true, is_featured: false,
    tags: ['couple', 'luxe', 'bien-être', 'villa'],
    avg_rating: 4.9, review_count: 31, booking_count: 44,
    created_at: '2024-01-01', updated_at: '2024-01-01',
    provider: PROVIDERS[1],
    images: [
      { id: 'i-8a', service_id: 's-8', url: IMG.spa, alt_fr: 'Duo massage spa', alt_en: 'Couple spa massage', sort_order: 0, is_cover: true, created_at: '2024-01-01' },
      { id: 'i-8b', service_id: 's-8', url: IMG.villa, alt_fr: 'Villa de luxe', alt_en: 'Luxury villa', sort_order: 1, is_cover: false, created_at: '2024-01-01' },
    ],
  },
]

// ─── Sections homepage (IDs de services) ────────────────────────────────────
export const HOME_ROWS = [
  { key: 'popular',      label_fr: 'Expériences populaires',    label_en: 'Popular Experiences',  ids: ['s-3', 's-1', 's-2', 's-7', 's-4'] },
  { key: 'tonight',      label_fr: 'Disponible ce soir',        label_en: 'Available Tonight',    ids: ['s-5', 's-2', 's-6', 's-8'] },
  { key: 'privateChefs', label_fr: 'Chefs privés',              label_en: 'Private Chefs',        ids: ['s-1', 's-7'] },
  { key: 'wellness',     label_fr: 'Bien-être & spa',           label_en: 'Wellness & Spa',       ids: ['s-2', 's-8', 's-5'] },
  { key: 'couplesFav',   label_fr: 'Favoris des couples',       label_en: "Couples' Favorites",   ids: ['s-3', 's-4', 's-2', 's-8'] },
  { key: 'culture',      label_fr: 'Culture & vie locale',      label_en: 'Culture & Local Life', ids: ['s-6', 's-7'] },
  { key: 'sunset',       label_fr: 'Coucher de soleil',         label_en: 'Sunset',               ids: ['s-3', 's-5', 's-4'] },
]

export function getServiceById(id: string) {
  return SERVICES.find((s) => s.id === id) ?? null
}

export function getServicesByIds(ids: string[]) {
  return ids.map((id) => SERVICES.find((s) => s.id === id)).filter(Boolean) as typeof SERVICES
}
