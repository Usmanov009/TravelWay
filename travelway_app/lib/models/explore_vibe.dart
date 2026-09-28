class ExploreVibe {
  final String id;
  final String vibe; // 'beach', 'culture', 'mountain', 'luxury'
  final String title;
  final String badge;
  final String count;
  final String priceFrom;
  final String destQuery;
  final String img;

  const ExploreVibe({
    required this.id,
    required this.vibe,
    required this.title,
    required this.badge,
    required this.count,
    required this.priceFrom,
    required this.destQuery,
    required this.img,
  });

  static const List<ExploreVibe> initialVibes = [
    ExploreVibe(
      id: 'v1',
      vibe: 'beach',
      title: 'Antalya Qaynoq Plyajlari',
      badge: 'Eng Ommabop',
      count: '142 ta mehmonxona',
      priceFrom: '\$480 dan',
      destQuery: 'Antalya, Turkiya',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    ),
    ExploreVibe(
      id: 'v2',
      vibe: 'culture',
      title: "Istanbul Tarixi & Bo'g'oz",
      badge: 'Tarixiy Joylar',
      count: '89 ta turpaket',
      priceFrom: '\$390 dan',
      destQuery: 'Istanbul, Turkiya',
      img: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop&q=80',
    ),
    ExploreVibe(
      id: 'v3',
      vibe: 'mountain',
      title: "Tbilisi & Kavkaz Tog'lari",
      badge: 'Vizasiz Mamlakat',
      count: "34 ta yo'nalish",
      priceFrom: '\$320 dan',
      destQuery: 'Tbilisi, Gruziya',
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    ),
    ExploreVibe(
      id: 'v4',
      vibe: 'luxury',
      title: 'Maldiv Suv Ustidagi Villalar',
      badge: 'Romantik',
      count: '27 ta orol kurorti',
      priceFrom: '\$1,199 dan',
      destQuery: 'Male, Maldiv orollari',
      img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop&q=80',
    ),
    ExploreVibe(
      id: 'v5',
      vibe: 'beach',
      title: 'Sharm ash-Shayx Marjon Rifi',
      badge: 'Dayving & Quyosh',
      count: '65 ta tur',
      priceFrom: '\$460 dan',
      destQuery: 'Sharm ash-Shayx, Misr',
      img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    ),
  ];
}
