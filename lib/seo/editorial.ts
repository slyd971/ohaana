import type { Island } from '@/types/database'
import type { SeoLocale } from '@/lib/seo'

// Contenu éditorial des pages « île » et « île / catégorie ».
// ⚠ BROUILLON À RELIRE ET RÉÉCRIRE par l'équipe : ces textes servent de socle pour que chaque page ait un contenu propre
// dès le départ. Plus ils sont personnels et précis (lieux, saisons, anecdotes de prestataires), mieux ils se classeront.
// Aucun prix, aucune statistique ni aucune promesse chiffrée n'est écrit ici : ils viennent toujours des données réelles.

type L3 = Record<SeoLocale, string>

export interface IslandInfo {
  /** Segment d'URL. */
  slug: string
  db: Island
  name: L3
  /** « en Guadeloupe », « à Saint-Martin »… */
  in: L3
  areas: string[]
  blurb: L3
}

export const ISLANDS: IslandInfo[] = [
  {
    slug: 'guadeloupe',
    db: 'guadeloupe',
    name: { fr: 'Guadeloupe', en: 'Guadeloupe', es: 'Guadalupe' },
    in: { fr: 'en Guadeloupe', en: 'in Guadeloupe', es: 'en Guadalupe' },
    areas: ['Le Gosier', 'Saint-François', 'Sainte-Anne', 'Deshaies', 'Le Moule'],
    blurb: {
      fr: 'La Guadeloupe est un archipel aux deux visages : la Grande-Terre et ses plages de sable blanc, la Basse-Terre et sa forêt tropicale dominée par la Soufrière. Les voyageurs y séjournent le plus souvent en villa ou en gîte, parfois loin des restaurants et des instituts : les prestataires viennent jusqu’à vous.',
      en: 'Guadeloupe is an archipelago with two faces: Grande-Terre and its white-sand beaches, and Basse-Terre with its rainforest under the Soufrière volcano. Most visitors stay in a villa or a gîte, often far from restaurants and spas, so the providers come to you.',
      es: 'Guadalupe es un archipiélago con dos caras: Grande-Terre y sus playas de arena blanca, y Basse-Terre con su selva tropical bajo el volcán de la Soufrière. La mayoría de los viajeros se alojan en villas o gîtes, a menudo lejos de restaurantes y spas: los profesionales vienen a ti.',
    },
  },
  {
    slug: 'martinique',
    db: 'martinique',
    name: { fr: 'Martinique', en: 'Martinique', es: 'Martinica' },
    in: { fr: 'en Martinique', en: 'in Martinique', es: 'en Martinica' },
    areas: ['Les Trois-Îlets', 'Le Diamant', 'Sainte-Anne', 'Le François', 'Fort-de-France'],
    blurb: {
      fr: 'La Martinique, l’île aux fleurs, mêle plages du sud, mornes verdoyants et montagne Pelée. Sa cuisine créole et sa tradition du rhum en font une destination où l’on aime recevoir : villas, bungalows et maisons de vacances s’y prêtent aux repas, aux massages et aux soirées sur la terrasse.',
      en: 'Martinique, the island of flowers, combines southern beaches, green hills and Mount Pelée. Its Creole cuisine and rum tradition make it a place where people love to host: villas, bungalows and holiday homes suit meals, massages and evenings on the terrace.',
      es: 'Martinica, la isla de las flores, combina playas del sur, colinas verdes y el monte Pelée. Su cocina criolla y su tradición del ron la convierten en un destino donde se disfruta recibiendo: villas, bungalós y casas de vacaciones se prestan a comidas, masajes y veladas en la terraza.',
    },
  },
  {
    slug: 'saint-martin',
    db: 'saint_martin',
    name: { fr: 'Saint-Martin', en: 'Saint-Martin', es: 'San Martín' },
    in: { fr: 'à Saint-Martin', en: 'in Saint-Martin', es: 'en San Martín' },
    areas: ['Orient Bay', 'Grand-Case', 'Marigot', 'Baie Nettlé', 'Terres Basses'],
    blurb: {
      fr: 'Saint-Martin partage une petite île entre France et Pays-Bas, avec des plages réputées, une vie nocturne animée et une gastronomie reconnue autour de Grand-Case. Les séjours en villa y sont nombreux, et l’on y cherche volontiers une soirée soignée sans quitter sa terrasse.',
      en: 'Saint-Martin shares a small island between France and the Netherlands, with renowned beaches, lively nightlife and a respected food scene around Grand-Case. Villa stays are common, and visitors often want a polished evening without leaving their terrace.',
      es: 'San Martín comparte una pequeña isla entre Francia y los Países Bajos, con playas famosas, vida nocturna animada y una gastronomía reconocida en torno a Grand-Case. Abundan las estancias en villa y se busca a menudo una velada cuidada sin salir de la terraza.',
    },
  },
  {
    slug: 'saint-barth',
    db: 'saint_barth',
    name: { fr: 'Saint-Barthélemy', en: 'Saint Barthélemy', es: 'San Bartolomé' },
    in: { fr: 'à Saint-Barthélemy', en: 'in Saint Barthélemy', es: 'en San Bartolomé' },
    areas: ['Gustavia', 'Saint-Jean', 'Lorient', 'Grand Cul-de-Sac', 'Flamands'],
    blurb: {
      fr: 'Saint-Barthélemy, souvent appelée Saint-Barth, est une petite île très prisée pour ses villas haut de gamme et ses plages discrètes. La clientèle y attend un service précis et personnalisé, à domicile, sans avoir à organiser de longs déplacements sur des routes étroites.',
      en: 'Saint Barthélemy, often called St Barths, is a small island prized for its upscale villas and discreet beaches. Guests expect precise, personal service at home, without long trips along narrow roads.',
      es: 'San Bartolomé, a menudo llamada St Barths, es una pequeña isla muy apreciada por sus villas de alto nivel y sus playas discretas. Los huéspedes esperan un servicio preciso y personalizado en casa, sin largos desplazamientos por carreteras estrechas.',
    },
  },
]

export interface CategoryInfo {
  /** Slug en base (service_categories.slug). */
  dbSlug: string
  /** Segment d'URL. */
  slug: string
  /** Titre « à domicile » : « Chef privé à domicile ». */
  head: L3
  /** Nom court au singulier, pour les phrases. */
  noun: L3
  blurb: L3
}

export const CATEGORIES: CategoryInfo[] = [
  {
    dbSlug: 'chef_prive', slug: 'chef-prive',
    head: { fr: 'Chef privé à domicile', en: 'Private chef at your villa', es: 'Chef privado en tu villa' },
    noun: { fr: 'chef privé', en: 'private chef', es: 'chef privado' },
    blurb: {
      fr: 'Un chef privé prépare le repas dans votre cuisine ou sur votre terrasse : menu créole, poisson du jour, barbecue ou dîner gastronomique. Vous choisissez le menu avec lui, il s’occupe des courses, de la cuisson et du service, et vous profitez de vos invités.',
      en: 'A private chef cooks in your kitchen or on your terrace: a Creole menu, the catch of the day, a barbecue or a fine-dining dinner. You agree the menu together, and the chef handles shopping, cooking and service while you enjoy your guests.',
      es: 'Un chef privado cocina en tu cocina o en tu terraza: menú criollo, pescado del día, barbacoa o cena gastronómica. Acordáis el menú juntos y el chef se ocupa de las compras, la cocina y el servicio mientras tú disfrutas de tus invitados.',
    },
  },
  {
    dbSlug: 'massage', slug: 'massage-a-domicile',
    head: { fr: 'Massage à domicile', en: 'Massage at your villa', es: 'Masaje en tu villa' },
    noun: { fr: 'masseur', en: 'massage therapist', es: 'masajista' },
    blurb: {
      fr: 'Une praticienne ou un praticien installe sa table dans votre jardin, au bord de la piscine ou dans une chambre. Massage relaxant, drainant ou sportif : on se détend sans prendre la route, avec le bruit des vagues ou des grenouilles pour tout fond sonore.',
      en: 'A therapist sets up a table in your garden, by the pool or in a bedroom. Relaxing, draining or sports massage: you unwind without hitting the road, with the sound of waves or tree frogs as the only background.',
      es: 'Un profesional instala su camilla en tu jardín, junto a la piscina o en una habitación. Masaje relajante, drenante o deportivo: te relajas sin coger la carretera, con el sonido de las olas o de las ranas como único fondo.',
    },
  },
  {
    dbSlug: 'photographe', slug: 'photographe',
    head: { fr: 'Photographe pour votre séjour', en: 'Photographer for your stay', es: 'Fotógrafo para tu estancia' },
    noun: { fr: 'photographe', en: 'photographer', es: 'fotógrafo' },
    blurb: {
      fr: 'Un photographe local vous accompagne pour une séance en couple, en famille ou entre amis : lever de soleil sur la plage, pause dans la végétation, demande en mariage ou simple souvenir de vacances. Il connaît les lieux et la lumière aux meilleures heures.',
      en: 'A local photographer joins you for a couples, family or friends shoot: sunrise on the beach, a pause among the greenery, a proposal or simply a holiday keepsake. They know the places and the light at the best hours.',
      es: 'Un fotógrafo local te acompaña en una sesión en pareja, en familia o con amigos: amanecer en la playa, un alto entre la vegetación, una pedida de mano o un simple recuerdo de vacaciones. Conoce los lugares y la luz en las mejores horas.',
    },
  },
  {
    dbSlug: 'fitness', slug: 'coach-fitness',
    head: { fr: 'Coach fitness à domicile', en: 'Fitness coach at your villa', es: 'Entrenador fitness en tu villa' },
    noun: { fr: 'coach', en: 'coach', es: 'entrenador' },
    blurb: {
      fr: 'Un coach adapte la séance à votre niveau et à votre lieu : renforcement musculaire dans le jardin, cardio sur la plage, yoga au lever du jour. Pas besoin de salle ni de matériel, il vient avec ce qu’il faut.',
      en: 'A coach tailors the session to your level and your location: strength work in the garden, cardio on the beach, yoga at sunrise. No gym or equipment needed, the coach brings what is required.',
      es: 'Un entrenador adapta la sesión a tu nivel y a tu lugar: fuerza en el jardín, cardio en la playa, yoga al amanecer. No hace falta gimnasio ni material, el entrenador trae lo necesario.',
    },
  },
  {
    dbSlug: 'coiffure', slug: 'coiffure-a-domicile',
    head: { fr: 'Coiffure à domicile', en: 'Hair styling at your villa', es: 'Peluquería en tu villa' },
    noun: { fr: 'coiffeur', en: 'hair stylist', es: 'peluquero' },
    blurb: {
      fr: 'Un coiffeur se déplace pour une coupe, un brushing ou une coiffure de cérémonie. Pratique avant un mariage, un dîner ou une séance photo, surtout quand le salon le plus proche est à une heure de route.',
      en: 'A stylist comes to you for a cut, a blow-dry or a ceremony style. Handy before a wedding, a dinner or a photo session, especially when the nearest salon is an hour away.',
      es: 'Un peluquero se desplaza para un corte, un peinado o un recogido de ceremonia. Práctico antes de una boda, una cena o una sesión de fotos, sobre todo si el salón más cercano está a una hora.',
    },
  },
  {
    dbSlug: 'maquillage', slug: 'maquillage',
    head: { fr: 'Maquillage à domicile', en: 'Makeup at your villa', es: 'Maquillaje en tu villa' },
    noun: { fr: 'maquilleur', en: 'makeup artist', es: 'maquillador' },
    blurb: {
      fr: 'Une maquilleuse ou un maquilleur prépare votre look pour la soirée, la cérémonie ou la séance photo, avec des produits qui tiennent à la chaleur et à l’humidité des Antilles. Le rendez-vous a lieu chez vous, à l’heure qui vous convient.',
      en: 'A makeup artist prepares your look for the evening, a ceremony or a photo session, with products that hold up in Caribbean heat and humidity. The appointment takes place at your place, at a time that suits you.',
      es: 'Un maquillador prepara tu look para la velada, la ceremonia o la sesión de fotos, con productos que resisten el calor y la humedad del Caribe. La cita tiene lugar en tu casa, a la hora que te convenga.',
    },
  },
  {
    dbSlug: 'babysitter', slug: 'garde-d-enfants',
    head: { fr: 'Garde d’enfants à domicile', en: 'Childcare at your villa', es: 'Cuidado de niños en tu villa' },
    noun: { fr: 'baby-sitter', en: 'babysitter', es: 'niñera' },
    blurb: {
      fr: 'Une personne de confiance garde vos enfants pendant que vous dînez dehors ou profitez d’une soirée à deux. Elle vient dans votre hébergement, où les enfants sont chez eux, et vous précisez à l’avance les horaires, les repas et les habitudes du coucher.',
      en: 'A trusted person looks after your children while you dine out or enjoy an evening for two. They come to your accommodation, where the children feel at home, and you agree timings, meals and bedtime routines in advance.',
      es: 'Una persona de confianza cuida de tus hijos mientras cenas fuera o disfrutas de una velada en pareja. Viene a tu alojamiento, donde los niños están en su entorno, y acordáis de antemano los horarios, las comidas y la hora de acostarse.',
    },
  },
  {
    dbSlug: 'musique', slug: 'dj',
    head: { fr: 'DJ et musique live', en: 'DJ and live music', es: 'DJ y música en vivo' },
    noun: { fr: 'DJ ou musicien', en: 'DJ or musician', es: 'DJ o músico' },
    blurb: {
      fr: 'Un DJ ou un musicien anime votre soirée sur la terrasse : anniversaire, enterrement de vie de jeune fille, repas entre amis. Zouk, compas, dancehall ou sélection plus internationale, la playlist s’adapte à vos invités.',
      en: 'A DJ or musician brings your terrace party to life: a birthday, a hen or stag do, a meal with friends. Zouk, compas, dancehall or a more international selection, the playlist adapts to your guests.',
      es: 'Un DJ o un músico anima tu fiesta en la terraza: cumpleaños, despedida, comida con amigos. Zouk, compas, dancehall o una selección más internacional, la lista se adapta a tus invitados.',
    },
  },
  {
    dbSlug: 'bar', slug: 'bar-mixologie',
    head: { fr: 'Barman et mixologie à domicile', en: 'Bartender and mixology at your villa', es: 'Barman y coctelería en tu villa' },
    noun: { fr: 'barman', en: 'bartender', es: 'barman' },
    blurb: {
      fr: 'Un barman prépare des cocktails à la carte : punchs de la région, rhums arrangés, créations sans alcool. Il apporte le matériel et le savoir-faire, et transforme votre terrasse en bar éphémère le temps d’une soirée.',
      en: 'A bartender mixes cocktails to order: regional punches, infused rums, alcohol-free creations. They bring the equipment and the know-how, turning your terrace into a pop-up bar for the evening.',
      es: 'Un barman prepara cócteles a la carta: ponches de la región, rones macerados, creaciones sin alcohol. Aporta el material y el oficio y convierte tu terraza en un bar efímero durante la velada.',
    },
  },
  {
    dbSlug: 'sport', slug: 'sport-coaching',
    head: { fr: 'Sport et coaching', en: 'Sport and coaching', es: 'Deporte y coaching' },
    noun: { fr: 'coach sportif', en: 'sports coach', es: 'entrenador deportivo' },
    blurb: {
      fr: 'Initiation ou perfectionnement, un coach vous fait pratiquer une activité sportive sur place : paddle, randonnée, natation, préparation physique. Les séances sont pensées pour la chaleur et pour votre niveau.',
      en: 'Whether you are starting out or improving, a coach takes you through a sport on site: paddleboarding, hiking, swimming, fitness training. Sessions are designed for the heat and for your level.',
      es: 'Ya sea iniciación o perfeccionamiento, un entrenador te guía en una actividad deportiva sobre el terreno: paddle, senderismo, natación, preparación física. Las sesiones se adaptan al calor y a tu nivel.',
    },
  },
  {
    dbSlug: 'evenement', slug: 'deco-evenements',
    head: { fr: 'Décoration et événements à domicile', en: 'Decor and events at your villa', es: 'Decoración y eventos en tu villa' },
    noun: { fr: 'décorateur', en: 'event decorator', es: 'decorador de eventos' },
    blurb: {
      fr: 'Un professionnel de l’événementiel installe la décoration d’un anniversaire, d’une demande en mariage ou d’un dîner de gala : fleurs, tables, lumières, mobilier. Il s’occupe du montage et du démontage pour que vous n’ayez rien à gérer.',
      en: 'An events professional sets up the decor for a birthday, a proposal or a gala dinner: flowers, tables, lighting, furniture. They handle setup and takedown so you have nothing to manage.',
      es: 'Un profesional de eventos instala la decoración de un cumpleaños, una pedida de mano o una cena de gala: flores, mesas, luces, mobiliario. Se encarga del montaje y el desmontaje para que no tengas nada que gestionar.',
    },
  },
  {
    dbSlug: 'danse', slug: 'danse-culture',
    head: { fr: 'Danse et culture locale', en: 'Dance and local culture', es: 'Danza y cultura local' },
    noun: { fr: 'professeur de danse', en: 'dance teacher', es: 'profesor de danza' },
    blurb: {
      fr: 'Un danseur ou une danseuse vous initie aux rythmes des Antilles : zouk, gwoka, biguine. Séance en groupe pour un anniversaire ou cours à deux, c’est une façon vivante de découvrir la culture locale sans quitter votre hébergement.',
      en: 'A dancer introduces you to the rhythms of the Antilles: zouk, gwoka, biguine. A group session for a birthday or a lesson for two is a lively way to discover local culture without leaving your accommodation.',
      es: 'Un bailarín te inicia en los ritmos de las Antillas: zouk, gwoka, biguine. Una sesión en grupo para un cumpleaños o una clase para dos es una forma viva de descubrir la cultura local sin salir de tu alojamiento.',
    },
  },
]

export const islandBySlug = (slug: string) => ISLANDS.find((i) => i.slug === slug) ?? null
export const islandByDb = (db: string) => ISLANDS.find((i) => i.db === db) ?? null
export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug) ?? null
export const categoryByDb = (dbSlug: string) => CATEGORIES.find((c) => c.dbSlug === dbSlug) ?? null
