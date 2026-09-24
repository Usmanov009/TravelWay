import React, { useState } from 'react';

interface FlutterCodeViewerProps {
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FlutterCodeViewer: React.FC<FlutterCodeViewerProps> = ({
  onClose,
  onShowToast
}) => {
  const [activeFile, setActiveFile] = useState<'main' | 'auth' | 'search' | 'explore' | 'hot'>('auth');
  const [copied, setCopied] = useState(false);

  const flutterCodes: Record<string, string> = {
    main: `// ==========================================
// TravelWay App — Flutter main.dart
// ==========================================
import 'package:flutter/material.dart';
import 'screens/auth_screen.dart';
import 'screens/search_screen.dart';
import 'screens/explore_screen.dart';
import 'screens/hot_deals_screen.dart';
import 'screens/trips_screen.dart';
import 'screens/profile_screen.dart';

void main() {
  runApp(const TravelWayApp());
}

class TravelWayApp extends StatelessWidget {
  const TravelWayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TravelWay',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0C1322),
        primaryColor: const Color(0xFFFF5B00),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFFF5B00),
          secondary: Color(0xFF00D2D3),
          surface: Color(0xFF142036),
        ),
        fontFamily: 'PlusJakartaSans',
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    SearchScreen(),
    ExploreScreen(),
    HotDealsScreen(),
    TripsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0A101D).withOpacity(0.95),
          border: const Border(top: BorderSide(color: Color(0xFF18263F), width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: Colors.transparent,
          selectedItemColor: const Color(0xFFFF5B00),
          unselectedItemColor: Colors.slate400,
          type: BottomNavigationBarType.fixed,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Qidiruv'),
            BottomNavigationBarItem(icon: Icon(Icons.explore_outlined), label: 'Kashf etish'),
            BottomNavigationBarItem(icon: Icon(Icons.local_fire_department), label: 'Qaynoq'),
            BottomNavigationBarItem(icon: Icon(Icons.luggage_outlined), label: 'Turlarim'),
            BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profil'),
          ],
        ),
      ),
    );
  }
}`,
    auth: `// ==========================================
// TravelWay Auth Screen — Flutter Implementation
// ==========================================
import 'package:flutter/material.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool isPhoneTab = true;
  bool isPasswordMode = false;
  bool rememberMe = true;
  final TextEditingController _phoneController = TextEditingController(text: '90 123-45-67');

  void _showOtpModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF111C30),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFF5B00).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.sms, color: Color(0xFFFF5B00)),
                      ),
                      const SizedBox(width: 10),
                      const Text('Tasdiqlash kodi', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                    ],
                  ),
                  IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF15233C),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFF5B00).withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Test SMS kodi: 7788', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF5B00)),
                      onPressed: () {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Muvaffaqiyatli kirdingiz! ✓')),
                        );
                      },
                      child: const Text('To\'ldirish'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _signInWithGoogle() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Google orqali kirilmoqda...')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0C1322),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () {}),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF142036),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              children: [
                Text('🇺🇿 UZ'),
                Icon(Icons.arrow_drop_down, size: 16),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Logo & Title
            Center(
              child: Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFFFF5B00), Color(0xFFFF8C42)]),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Center(
                  child: Text('TC', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text('TravelWay hisobiga kirish', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 4),
            const Text('Eng qulay turpaketlar va arzon charterlarga kirish', style: TextStyle(color: Colors.white70, fontSize: 12)),
            const SizedBox(height: 20),

            // Tabs Switcher
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFF111C30),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isPhoneTab ? const Color(0xFFFF5B00) : Colors.transparent,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => setState(() => isPhoneTab = true),
                      child: const Text('Telefon raqam'),
                    ),
                  ),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: !isPhoneTab ? const Color(0xFFFF5B00) : Colors.transparent,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => setState(() => isPhoneTab = false),
                      child: const Text('Email / TC-ID'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Phone Field
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF16233A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1F3150)),
              ),
              child: Row(
                children: [
                  const Text('🇺🇿 +998 ', style: TextStyle(fontWeight: FontWeight.bold)),
                  Expanded(
                    child: TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(border: InputBorder.none, hintText: '90 123-45-67'),
                    ),
                  ),
                  const Icon(Icons.check_circle, color: Colors.green, size: 18),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF5B00),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: _showOtpModal,
                child: const Text('Tasdiqlash kodini olish', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 16),

            // Google Fast Auth
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                side: const BorderSide(color: Color(0xFF1E2E48)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: _signInWithGoogle,
              icon: const Icon(Icons.account_circle_outlined, color: Colors.white),
              label: const Text('Google orqali tezkor kirish', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}`,
    search: `// ==========================================
// TravelWay Search & Booking Screen — Flutter
// ==========================================
import 'package:flutter/material.dart';

class TourPackageModel {
  final String title;
  final String location;
  final String tag;
  final int price;
  final double rating;
  final String imageUrl;

  TourPackageModel({
    required this.title,
    required this.location,
    required this.tag,
    required this.price,
    required this.rating,
    required this.imageUrl,
  });
}

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tours = [
      TourPackageModel(
        title: 'Rixos Premium Belek 5*',
        location: 'Antalya, Turkiya',
        tag: 'Ultra All Inclusive',
        price: 740,
        rating: 9.6,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      ),
      TourPackageModel(
        title: 'Atlantis The Royal 5*',
        location: 'Dubay, Palm Jumeirah',
        tag: 'Premium Luxury',
        price: 1250,
        rating: 9.8,
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      ),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0C1322),
      appBar: AppBar(
        title: const Text('TravelWay — Turpaketlar'),
        backgroundColor: const Color(0xFF0C1322),
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: tours.length,
        itemBuilder: (context, index) {
          final tour = tours[index];
          return Card(
            color: const Color(0xFF142036),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            margin: const EdgeInsets.only(bottom: 16),
            clipBehavior: Clip.antiAlias,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  children: [
                    Image.network(tour.imageUrl, height: 160, width: double.infinity, fit: BoxFit.cover),
                    Positioned(
                      top: 10,
                      left: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFF5B00),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(tour.tag, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    Positioned(
                      bottom: 10,
                      left: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black87,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text('★ \${tour.rating}', style: const TextStyle(color: Colors.amber, fontSize: 11)),
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(tour.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text(tour.location, style: const TextStyle(color: Colors.white60, fontSize: 11)),
                        ],
                      ),
                      Text('\$\${tour.price}', style: const TextStyle(color: Color(0xFFFF5B00), fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}`,
    explore: `// ==========================================
// TravelWay Explore Vibes — Flutter Screen
// ==========================================
import 'package:flutter/material.dart';

class ExploreScreen extends StatelessWidget {
  const ExploreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final vibes = [
      {'title': 'Antalya Qaynoq Plyajlari', 'price': '\$480 dan', 'badge': 'Eng Ommabop', 'img': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'},
      {'title': 'Istanbul Tarixi & Bo\\'g\\'oz', 'price': '\$390 dan', 'badge': 'Tarixiy Joylar', 'img': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800'},
      {'title': 'Tbilisi & Kavkaz Tog\\'lari', 'price': '\$320 dan', 'badge': 'Vizasiz Mamlakat', 'img': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0C1322),
      appBar: AppBar(title: const Text('Kashf etish'), backgroundColor: const Color(0xFF0C1322)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF1E3A8A), Color(0xFF312E81)]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Qayerga dam olishga boramiz?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                SizedBox(height: 4),
                Text('Vizasiz mamlakatlar va iliq dengizlar', style: TextStyle(color: Colors.white70, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ...vibes.map((v) => Card(
            color: const Color(0xFF142036),
            margin: const EdgeInsets.only(bottom: 12),
            clipBehavior: Clip.antiAlias,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Stack(
              children: [
                Image.network(v['img']!, height: 140, width: double.infinity, fit: BoxFit.cover),
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [Colors.black.withOpacity(0.8), Colors.transparent],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 12,
                  left: 12,
                  right: 12,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(v['title']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      Text(v['price']!, style: const TextStyle(color: Color(0xFFFF5B00), fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }
}`,
    hot: `// ==========================================
// TravelWay Hot Deals — Flutter Screen
// ==========================================
import 'package:flutter/material.dart';

class HotDealsScreen extends StatelessWidget {
  const HotDealsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0C1322),
      appBar: AppBar(title: const Text('Qaynoq Takliflar 🔥'), backgroundColor: const Color(0xFF0C1322)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Colors.red, Color(0xFFFF5B00)]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text('50% gacha tejash • Cheklangan vaqt', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
          ),
          const SizedBox(height: 16),
          // Hot item
          Card(
            color: const Color(0xFF142036),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  const Text('Antalya Kiris Resort 5* — -42% FLASH', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF5B00)),
                    onPressed: () {},
                    child: const Text('Ushbu narxda band qilish (\$495)'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(flutterCodes[activeFile]);
    setCopied(true);
    onShowToast('Flutter Dart kodi buferga nusxalandi! 📋', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a101d] text-slate-100 rounded-2xl overflow-hidden border border-[#1e2e48]">
      {/* Top bar with file selector & copy */}
      <div className="bg-[#111c30] p-3 border-b border-[#1c2c47] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
            💙
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Flutter / Dart Ekran Kodlari</h3>
            <p className="text-[10px] text-slate-400">iOS & Android uchun tayyor Flutter widgetlar</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 bg-[#ff5b00] hover:bg-[#e55200] text-white font-bold text-xs rounded-xl tap-bounce flex items-center gap-1.5 shadow"
            onClick={handleCopyCode}
            type="button"
          >
            <span>{copied ? '✓ Nusxa olindi' : 'Nusxa olish'}</span>
          </button>
          <button
            className="w-7 h-7 rounded-full bg-[#17253f] text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>
      </div>

      {/* File Tabs */}
      <div className="flex items-center gap-1 p-2 bg-[#0d1628] border-b border-[#18263f] overflow-x-auto no-scrollbar">
        {[
          { id: 'auth', label: 'auth_screen.dart (Kirish & Biometrik)' },
          { id: 'search', label: 'search_screen.dart (Qidiruv & Turlar)' },
          { id: 'explore', label: 'explore_screen.dart (Kashf etish)' },
          { id: 'hot', label: 'hot_deals_screen.dart (Qaynoq takliflar)' },
          { id: 'main', label: 'main.dart (Ilova tuzilishi)' },
        ].map((f) => (
          <button
            key={f.id}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap ${
              activeFile === f.id
                ? 'bg-[#ff5b00] text-white font-bold shadow'
                : 'text-slate-400 hover:text-white bg-[#142036]'
            }`}
            onClick={() => setActiveFile(f.id as any)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Code Viewer Container */}
      <div className="flex-1 p-3 overflow-auto bg-[#070c17] font-mono text-[11px] leading-relaxed text-slate-200">
        <pre className="whitespace-pre">{flutterCodes[activeFile]}</pre>
      </div>

      {/* Bottom helper */}
      <div className="p-2.5 bg-[#0f172a] border-t border-[#18263f] text-[11px] text-slate-400 flex items-center justify-between">
        <span>💡 Flutter loyihangizda foydalanish: <code className="text-[#ff5b00]">flutter create travelway</code></span>
        <button
          className="text-[#ff5b00] hover:underline font-semibold"
          onClick={handleCopyCode}
          type="button"
        >
          Kodni nusxalash
        </button>
      </div>
    </div>
  );
};
