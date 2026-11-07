class KompasCountry {
  final String code;
  final String name;
  final String flag;
  final List<String> resorts;

  const KompasCountry({
    required this.code,
    required this.name,
    required this.flag,
    required this.resorts,
  });
}

const List<KompasCountry> kompasCountries = [
  KompasCountry(
    code: 'ALL',
    name: 'Barcha mamlakatlar',
    flag: '🌍',
    resorts: ['Barcha kurortlar'],
  ),
  KompasCountry(
    code: 'TR',
    name: 'Turkiya',
    flag: '🇹🇷',
    resorts: ['Barcha kurortlar', 'Antalya', 'Belek', 'Kemer', 'Alanya', 'Bodrum', 'Istanbul'],
  ),
  KompasCountry(
    code: 'EG',
    name: 'Misr',
    flag: '🇪🇬',
    resorts: ['Barcha kurortlar', 'Sharm El-Sheikh', 'Hurghada'],
  ),
  KompasCountry(
    code: 'AE',
    name: 'BAA',
    flag: '🇦🇪',
    resorts: ['Barcha kurortlar', 'Dubay (Palm)', 'Dubay (JBR/Marina)', 'Ras Al Khaimah'],
  ),
  KompasCountry(
    code: 'TH',
    name: 'Tailand',
    flag: '🇹🇭',
    resorts: ['Barcha kurortlar', 'Phuket', 'Pattaya'],
  ),
  KompasCountry(
    code: 'VN',
    name: 'Vetnam',
    flag: '🇻🇳',
    resorts: ['Barcha kurortlar', 'Phu Quoc', 'Nha Trang'],
  ),
  KompasCountry(
    code: 'CN',
    name: 'Xitoy',
    flag: '🇨🇳',
    resorts: ['Barcha kurortlar', 'Sanya (Hainan)'],
  ),
  KompasCountry(
    code: 'MV',
    name: 'Maldiv',
    flag: '🇲🇻',
    resorts: ['Barcha kurortlar', 'Male / Kaafu Atoll'],
  ),
  KompasCountry(
    code: 'ID',
    name: 'Indoneziya',
    flag: '🇮🇩',
    resorts: ['Barcha kurortlar', 'Bali'],
  ),
  KompasCountry(
    code: 'GE',
    name: 'Gruziya',
    flag: '🇬🇪',
    resorts: ['Barcha kurortlar', 'Batumi', 'Tbilisi'],
  ),
  KompasCountry(
    code: 'LK',
    name: 'Shri-Lanka',
    flag: '🇱🇰',
    resorts: ['Barcha kurortlar', 'Kolombo', 'Bentota'],
  ),
  KompasCountry(
    code: 'MY',
    name: 'Malayziya',
    flag: '🇲🇾',
    resorts: ['Barcha kurortlar', 'Kuala Lumpur', 'Langkawi'],
  ),
  KompasCountry(
    code: 'QA',
    name: 'Qatar',
    flag: '🇶🇦',
    resorts: ['Barcha kurortlar', 'Doha'],
  ),
  KompasCountry(
    code: 'SA',
    name: 'Saudiya Arabistoni',
    flag: '🇸🇦',
    resorts: ['Barcha kurortlar', 'Jidda', 'Makka', 'Madina', 'Riyoz'],
  ),
  KompasCountry(
    code: 'OM',
    name: 'Ummon',
    flag: '🇴🇲',
    resorts: ['Barcha kurortlar', 'Maskat', 'Salala'],
  ),
  KompasCountry(
    code: 'AZ',
    name: 'Ozarbayjon',
    flag: '🇦🇿',
    resorts: ['Barcha kurortlar', 'Boku', 'Shahdag'],
  ),
  KompasCountry(
    code: 'CY',
    name: 'Kipr',
    flag: '🇨🇾',
    resorts: ['Barcha kurortlar', 'Ayia Napa', 'Larnaka', 'Limassol'],
  ),
  KompasCountry(
    code: 'ME',
    name: 'Chernogoriya',
    flag: '🇲🇪',
    resorts: ['Barcha kurortlar', 'Budva', 'Kotor', 'Tivat'],
  ),
  KompasCountry(
    code: 'IT',
    name: 'Italiya',
    flag: '🇮🇹',
    resorts: ['Barcha kurortlar', 'Rim', 'Venetsiya', 'Milan'],
  ),
  KompasCountry(
    code: 'ES',
    name: 'Ispaniya',
    flag: '🇪🇸',
    resorts: ['Barcha kurortlar', 'Barselona', 'Madrid', 'Mayorka'],
  ),
  KompasCountry(
    code: 'FR',
    name: 'Fransiya',
    flag: '🇫🇷',
    resorts: ['Barcha kurortlar', 'Parij', 'Nitsa'],
  ),
  KompasCountry(
    code: 'CZ',
    name: 'Chexiya',
    flag: '🇨🇿',
    resorts: ['Barcha kurortlar', 'Praga', 'Karlovi Vari'],
  ),
  KompasCountry(
    code: 'JP',
    name: 'Yaponiya',
    flag: '🇯🇵',
    resorts: ['Barcha kurortlar', 'Tokio', 'Kioto', 'Osaka'],
  ),
  KompasCountry(
    code: 'KR',
    name: 'Janubiy Koreya',
    flag: '🇰🇷',
    resorts: ['Barcha kurortlar', 'Seul', 'Jeju'],
  ),
  KompasCountry(
    code: 'SC',
    name: 'Seyshel',
    flag: '🇸🇨',
    resorts: ['Barcha kurortlar', 'Mae', 'Praslin'],
  ),
  KompasCountry(
    code: 'MU',
    name: 'Mavrikiy',
    flag: '🇲🇺',
    resorts: ['Barcha kurortlar', 'Port-Lui'],
  ),
  KompasCountry(
    code: 'IN',
    name: 'Hindiston (Goa)',
    flag: '🇮🇳',
    resorts: ['Barcha kurortlar', 'Shimoliy Goa', 'Janubiy Goa'],
  ),
  KompasCountry(
    code: 'GR',
    name: 'Gretsiya',
    flag: '🇬🇷',
    resorts: ['Barcha kurortlar', 'Afina', 'Krit', 'Rodos', 'Santorini'],
  ),
  KompasCountry(
    code: 'UZ',
    name: "O'zbekiston",
    flag: '🇺🇿',
    resorts: ['Barcha kurortlar', 'Toshkent', 'Samarqand', 'Buxoro', 'Xiva', 'Zomin'],
  ),
];

String getCountryFlag(String codeOrName) {
  if (codeOrName.isEmpty) return '🌍';
  final clean = codeOrName.trim().toUpperCase();

  final exact = kompasCountries.firstWhere(
    (c) => c.code.toUpperCase() == clean || c.name.toUpperCase() == clean,
    orElse: () => const KompasCountry(code: '', name: '', flag: '', resorts: []),
  );
  if (exact.flag.isNotEmpty) return exact.flag;

  if (clean.contains('TURK') || clean.contains('ANTALYA') || clean.contains('KEMER') || clean.contains('BELEK') || clean.contains('ALANYA') || clean.contains('BODRUM') || clean.contains('ISTANBUL')) return '🇹🇷';
  if (clean.contains('MISR') || clean.contains('EGYPT') || clean.contains('SHARM') || clean.contains('HURGHADA') || clean.contains('QOHIRA') || clean.contains('CAIRO')) return '🇪🇬';
  if (clean.contains('BAA') || clean.contains('UAE') || clean.contains('DUBAY') || clean.contains('DUBAI') || clean.contains('ABU-DABI') || clean.contains('ABU DHABI')) return '🇦🇪';
  if (clean.contains('TAILAND') || clean.contains('THAILAND') || clean.contains('PHUKET') || clean.contains('BANGKOK') || clean.contains('PATTAYA')) return '🇹🇭';
  if (clean.contains('VETNAM') || clean.contains('VIETNAM') || clean.contains('PHU QUOC') || clean.contains('NHA TRANG')) return '🇻🇳';
  if (clean.contains('XITOY') || clean.contains('CHINA') || clean.contains('SANYA') || clean.contains('BEIJING')) return '🇨🇳';
  if (clean.contains('MALDIV') || clean.contains('MALDIVES') || clean.contains('MALE')) return '🇲🇻';
  if (clean.contains('INDONEZIYA') || clean.contains('INDONESIA') || clean.contains('BALI')) return '🇮🇩';
  if (clean.contains('GRUZIYA') || clean.contains('GEORGIA') || clean.contains('BATUMI') || clean.contains('TBILISI')) return '🇬🇪';
  if (clean.contains('SHRI-LANKA') || clean.contains('SRI LANKA') || clean.contains('KOLOMBO')) return '🇱🇰';
  if (clean.contains('MALAYZIYA') || clean.contains('MALAYSIA') || clean.contains('KUALA')) return '🇲🇾';
  if (clean.contains('QATAR') || clean.contains('DOHA')) return '🇶🇦';
  if (clean.contains('SAUDIYA') || clean.contains('SAUDI') || clean.contains('JIDDA') || clean.contains('MAKKA') || clean.contains('MADINA')) return '🇸🇦';
  if (clean.contains('UMMON') || clean.contains('OMAN') || clean.contains('MASKAT')) return '🇴🇲';
  if (clean.contains('OZARBAYJON') || clean.contains('AZERBAIJAN') || clean.contains('BOKU') || clean.contains('BAKU')) return '🇦🇿';
  if (clean.contains('KIPR') || clean.contains('CYPRUS')) return '🇨🇾';
  if (clean.contains('CHERNOGORIYA') || clean.contains('MONTENEGRO') || clean.contains('BUDVA')) return '🇲🇪';
  if (clean.contains('ITALIYA') || clean.contains('ITALY') || clean.contains('RIM') || clean.contains('ROME') || clean.contains('MILAN')) return '🇮🇹';
  if (clean.contains('ISPANIYA') || clean.contains('SPAIN') || clean.contains('MADRID') || clean.contains('BARSELONA')) return '🇪🇸';
  if (clean.contains('FRANSIYA') || clean.contains('FRANCE') || clean.contains('PARIJ') || clean.contains('PARIS')) return '🇫🇷';
  if (clean.contains('CHEXIYA') || clean.contains('CZECH') || clean.contains('PRAGA') || clean.contains('PRAGUE')) return '🇨🇿';
  if (clean.contains('YAPONIYA') || clean.contains('JAPAN') || clean.contains('TOKIO') || clean.contains('TOKYO')) return '🇯🇵';
  if (clean.contains('KOREYA') || clean.contains('KOREA') || clean.contains('SEUL') || clean.contains('SEOUL')) return '🇰🇷';
  if (clean.contains('SEYSHEL') || clean.contains('SEYCHELLES')) return '🇸🇨';
  if (clean.contains('MAVRIKIY') || clean.contains('MAURITIUS')) return '🇲🇺';
  if (clean.contains('HINDISTON') || clean.contains('INDIA') || clean.contains('GOA')) return '🇮🇳';
  if (clean.contains('GRETSIYA') || clean.contains('GREECE') || clean.contains('AFINA') || clean.contains('ATHENS')) return '🇬🇷';
  if (clean.contains("O'ZBEKISTON") || clean.contains('UZBEKISTAN') || clean.contains('TOSHKENT') || clean.contains('SAMARQAND') || clean.contains('BUXORO')) return '🇺🇿';

  return '🌍';
}
