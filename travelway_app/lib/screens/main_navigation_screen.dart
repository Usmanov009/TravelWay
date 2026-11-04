import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/app_provider.dart';
import '../utils/app_theme.dart';
import '../utils/flaticon_icons.dart';
import '../widgets/app_header.dart';
import 'search_screen.dart';
import 'explore_screen.dart';
import 'hot_deals_screen.dart';
import 'trips_screen.dart';
import 'profile_screen.dart';

class MainNavigationScreen extends StatelessWidget {
  const MainNavigationScreen({super.key});

  final List<Widget> _screens = const [
    SearchScreen(),
    ExploreScreen(),
    HotDealsScreen(),
    TripsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      body: Column(
        children: [
          // 1. Unified App Header (Exact Web Match)
          AppHeader(
            currentTabIndex: provider.currentTabIndex,
            onAvatarClick: () => provider.setTabIndex(4), // Go to profile
          ),

          // 2. Tab Body Viewport
          Expanded(
            child: IndexedStack(
              index: provider.currentTabIndex,
              children: _screens,
            ),
          ),
        ],
      ),

      // 3. Web-Aligned 5-Tab Bottom Navigation Bar
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.surfaceLight,
          border: Border(
            top: BorderSide(color: AppTheme.borderLight, width: 1),
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF0F172A).withOpacity(0.04),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(
                  index: 0,
                  icon: FlaticonIcons.search,
                  activeIcon: FlaticonIcons.search,
                  label: 'Qidiruv',
                  provider: provider,
                ),
                _buildNavItem(
                  index: 1,
                  icon: FlaticonIcons.exploreOutlined,
                  activeIcon: FlaticonIcons.explore,
                  label: 'Kashf etish',
                  provider: provider,
                ),
                _buildNavItem(
                  index: 2,
                  icon: FlaticonIcons.localFireDepartmentOutlined,
                  activeIcon: FlaticonIcons.localFireDepartment,
                  label: 'Qaynoq',
                  badgeText: 'HOT',
                  badgeColor: AppTheme.accentRed,
                  provider: provider,
                ),
                _buildNavItem(
                  index: 3,
                  icon: FlaticonIcons.luggageOutlined,
                  activeIcon: FlaticonIcons.luggage,
                  label: 'Turlarim',
                  counter: provider.bookings.length,
                  provider: provider,
                ),
                _buildNavItem(
                  index: 4,
                  icon: FlaticonIcons.personOutline,
                  activeIcon: FlaticonIcons.person,
                  label: 'Profil',
                  provider: provider,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
    String? badgeText,
    Color? badgeColor,
    int? counter,
    required AppProvider provider,
  }) {
    final isSelected = provider.currentTabIndex == index;

    return Expanded(
      child: InkWell(
        onTap: () => provider.setTabIndex(index),
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 3),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                clipBehavior: Clip.none,
                alignment: Alignment.center,
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    width: 48,
                    height: 30,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppTheme.primary.withOpacity(0.1)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      isSelected ? activeIcon : icon,
                      size: 20,
                      color: isSelected ? AppTheme.primary : AppTheme.textMuted,
                    ),
                  ),

                  // Pill Badge (e.g. HOT)
                  if (badgeText != null)
                    Positioned(
                      top: -5,
                      right: -8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 1,
                        ),
                        decoration: BoxDecoration(
                          color: badgeColor ?? AppTheme.accentRed,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          badgeText,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 7,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),

                  // Numeric Counter Badge
                  if (counter != null && counter > 0)
                    Positioned(
                      top: -4,
                      right: -8,
                      child: Container(
                        padding: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(
                          color: AppTheme.primary,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 14,
                          minHeight: 14,
                        ),
                        child: Text(
                          '$counter',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 3),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected ? AppTheme.primary : AppTheme.textMuted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
