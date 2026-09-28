import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:travelway_app/main.dart';
import 'package:travelway_app/providers/app_provider.dart';

void main() {
  testWidgets('TravelWay app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AppProvider()),
        ],
        child: const TravelWayApp(),
      ),
    );

    expect(find.text('Qidiruv'), findsWidgets);
  });
}
