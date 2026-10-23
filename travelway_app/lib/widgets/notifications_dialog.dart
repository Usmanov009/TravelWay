import 'package:flutter/material.dart';
import '../utils/app_theme.dart';

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String time;
  final String category;
  final IconData icon;
  final Color iconColor;
  bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.time,
    required this.category,
    required this.icon,
    required this.iconColor,
    this.isRead = false,
  });
}

class NotificationsModal extends StatefulWidget {
  const NotificationsModal({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const NotificationsModal(),
    );
  }

  @override
  State<NotificationsModal> createState() => _NotificationsModalState();
}

class _NotificationsModalState extends State<NotificationsModal> {
  static final List<NotificationItem> _defaultNotifications = [
    NotificationItem(
      id: 'notif_1',
      title: 'Maldiv va Dubay turlariga 30% chegirmalar!',
      message: 'Ushbu haftada Maldiv va Dubay yo\'nalishlaridagi barcha lyuks mehmonxonalarga maxsus narxlar e\'lon qilindi.',
      time: '15 daqiqa oldin',
      category: 'Chegirma',
      icon: Icons.local_fire_department,
      iconColor: AppTheme.accentRed,
      isRead: false,
    ),
    NotificationItem(
      id: 'notif_2',
      title: 'Yangi yo\'nalish: Vetnam & Tailand',
      message: 'Fukuk va Pxuket orollariga to\'g\'ridan-to\'g\'ri qulay charter reyslar ochildi. Bron qilishga ulgurib qoling!',
      time: 'Bugun, 09:45',
      category: 'Parvozlar',
      icon: Icons.flight_takeoff,
      iconColor: AppTheme.accentSky,
      isRead: false,
    ),
    NotificationItem(
      id: 'notif_3',
      title: 'Telegram Bot orqali ro\'yxatdan o\'tish',
      message: '@mytravelwaybot orqali telefon raqamingizni tasdiqlang va hisobingizga bir zumda kiring.',
      time: 'Kecha, 18:20',
      category: 'Tizim',
      icon: Icons.send_rounded,
      iconColor: AppTheme.primary,
      isRead: true,
    ),
    NotificationItem(
      id: 'notif_4',
      title: 'Antalya mavsumi boshlanmoqda',
      message: 'Turkiya sohillariga eng qulay All Inclusive paketlar va 5* mehmonxonalar uchun erta band qilish ochildi.',
      time: '3 kun oldin',
      category: 'Tavsiya',
      icon: Icons.beach_access,
      iconColor: AppTheme.accentGold,
      isRead: true,
    ),
  ];

  late List<NotificationItem> _notifications;

  @override
  void initState() {
    super.initState();
    _notifications = List.from(_defaultNotifications);
  }

  void _markAllAsRead() {
    setState(() {
      for (final n in _notifications) {
        n.isRead = true;
      }
    });
  }

  void _clearAll() {
    setState(() {
      _notifications.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 6),
              width: 38,
              height: 4,
              decoration: BoxDecoration(
                color: AppTheme.borderDark,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 8, 12, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.notifications_active, color: AppTheme.primary, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Bildirishnomalar',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textMain,
                          ),
                        ),
                        Text(
                          unreadCount > 0 ? '$unreadCount ta yangi xabar' : 'Barchasi ko\'rildi',
                          style: TextStyle(
                            fontSize: 11,
                            color: unreadCount > 0 ? AppTheme.accentSky : AppTheme.textSub,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Row(
                  children: [
                    if (_notifications.isNotEmpty && unreadCount > 0)
                      TextButton(
                        onPressed: _markAllAsRead,
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text(
                          'O\'qilgan',
                          style: TextStyle(fontSize: 12, color: AppTheme.primary, fontWeight: FontWeight.bold),
                        ),
                      ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppTheme.textSub, size: 20),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppTheme.borderDark),

          // Notifications List
          Expanded(
            child: _notifications.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(18),
                          decoration: BoxDecoration(
                            color: AppTheme.subtleDark,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.notifications_none, size: 40, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 14),
                        const Text(
                          'Hozircha bildirishnomalar yo\'q',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.textMain),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Eng so\'nggi chegirmalar va yangiliklar shu yerda chiqadi',
                          style: TextStyle(fontSize: 12, color: AppTheme.textSub),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    itemCount: _notifications.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = _notifications[index];
                      return Dismissible(
                        key: ValueKey(item.id),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          decoration: BoxDecoration(
                            color: AppTheme.accentRed.withOpacity(0.8),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(Icons.delete_outline, color: Colors.white, size: 22),
                        ),
                        onDismissed: (_) {
                          setState(() {
                            _notifications.removeAt(index);
                          });
                        },
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              item.isRead = true;
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: item.isRead ? AppTheme.subtleDark : AppTheme.subtleDark.withOpacity(0.8),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: item.isRead ? AppTheme.borderDark : AppTheme.primary.withOpacity(0.4),
                                width: item.isRead ? 1 : 1.5,
                              ),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Icon
                                Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: item.iconColor.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(item.icon, color: item.iconColor, size: 20),
                                ),
                                const SizedBox(width: 12),

                                // Texts
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: item.iconColor.withOpacity(0.15),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              item.category,
                                              style: TextStyle(
                                                color: item.iconColor,
                                                fontSize: 9,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                          Row(
                                            children: [
                                              Text(
                                                item.time,
                                                style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
                                              ),
                                              if (!item.isRead) ...[
                                                const SizedBox(width: 6),
                                                Container(
                                                  width: 6,
                                                  height: 6,
                                                  decoration: const BoxDecoration(
                                                    color: AppTheme.primary,
                                                    shape: BoxShape.circle,
                                                  ),
                                                ),
                                              ],
                                            ],
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        item.title,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                          color: item.isRead ? AppTheme.textMain : Colors.white,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        item.message,
                                        style: const TextStyle(fontSize: 11, color: AppTheme.textSub, height: 1.3),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),

          // Footer (clear all button)
          if (_notifications.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 6, 16, 16),
              child: SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: _clearAll,
                  style: TextButton.styleFrom(
                    foregroundColor: AppTheme.textMuted,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  child: const Text(
                    'Barcha bildirishnomalarni tozalash',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
