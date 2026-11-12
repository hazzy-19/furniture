// Aurelle Home - Navigation Menu Data Structure

export const rooms = [
  {
    id: 'living-room',
    label: 'Living room',
    path: '/shop/living-room',
    image: null,
    categories: [
      {
        id: 'living-room-sofas',
        label: 'Sofas',
        path: '/shop/living-room/sofas',
        image: null,
      },
      {
        id: 'living-room-sectionals',
        label: 'Sectionals',
        path: '/shop/living-room/sectionals',
        image: null,
      },
      {
        id: 'living-room-recliners',
        label: 'Recliners',
        path: '/shop/living-room/recliners',
        image: null,
      },
      {
        id: 'living-room-armchairs',
        label: 'Armchairs',
        path: '/shop/living-room/armchairs',
        image: null,
      },
      {
        id: 'living-room-coffee-tables',
        label: 'Coffee tables',
        path: '/shop/living-room/coffee-tables',
        image: null,
      },
      {
        id: 'living-room-tv-stands',
        label: 'TV stands',
        path: '/shop/living-room/tv-stands',
        image: null,
      },
    ],
    featured: {
      label: 'Zuri 3 Seater Sofa',
      path: '/shop/living-room/sofas',
      caption: 'Handcrafted hardwood framing in textured linen.',
    },
  },
  {
    id: 'dining',
    label: 'Dining',
    path: '/shop/dining',
    image: null,
    categories: [
      {
        id: 'dining-sets',
        label: 'Dining sets',
        path: '/shop/dining/dining-sets',
        image: null,
      },
      {
        id: 'dining-tables',
        label: 'Dining tables',
        path: '/shop/dining/dining-tables',
        image: null,
      },
      {
        id: 'dining-chairs',
        label: 'Dining chairs',
        path: '/shop/dining/dining-chairs',
        image: null,
      },
      {
        id: 'dining-sideboards',
        label: 'Sideboards',
        path: '/shop/dining/sideboards',
        image: null,
      },
    ],
    featured: {
      label: 'Mara 6 Seater Dining Set',
      path: '/shop/dining/dining-sets',
      caption: 'Sculpted timber dining table and matching chairs.',
    },
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    path: '/shop/bedroom',
    image: null,
    categories: [
      {
        id: 'bedroom-beds',
        label: 'Beds',
        path: '/shop/bedroom/beds',
        image: null,
      },
      {
        id: 'bedroom-wardrobes',
        label: 'Wardrobes',
        path: '/shop/bedroom/wardrobes',
        image: null,
      },
      {
        id: 'bedroom-dressers',
        label: 'Dressers',
        path: '/shop/bedroom/dressers',
        image: null,
      },
      {
        id: 'bedroom-nightstands',
        label: 'Nightstands',
        path: '/shop/bedroom/nightstands',
        image: null,
      },
      {
        id: 'bedroom-mattresses',
        label: 'Mattresses',
        path: '/shop/bedroom/mattresses',
        image: null,
      },
    ],
    featured: {
      label: 'Imani Upholstered Bed',
      path: '/shop/bedroom/beds',
      caption: 'Quiet elegance with a reinforced low-profile frame.',
    },
  },
  {
    id: 'decor',
    label: 'Decor',
    path: '/shop/decor',
    image: null,
    categories: [
      {
        id: 'decor-wall-art',
        label: 'Wall art',
        path: '/shop/decor/wall-art',
        image: null,
      },
      {
        id: 'decor-rugs',
        label: 'Rugs',
        path: '/shop/decor/rugs',
        image: null,
      },
      {
        id: 'decor-lighting',
        label: 'Lighting',
        path: '/shop/decor/lighting',
        image: null,
      },
      {
        id: 'decor-mirrors',
        label: 'Mirrors',
        path: '/shop/decor/mirrors',
        image: null,
      },
    ],
    featured: {
      label: 'Artisanal Wall Mirrors',
      path: '/shop/decor/mirrors',
      caption: 'Brushed brass and organic silhouette statement pieces.',
    },
  },
]

export const plainLinks = [
  { label: 'New and hot', path: '/new' },
  { label: 'Sale', path: '/sale', isHighlighted: true },
]
