import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:limmat/widgets/main_view.dart';
import 'firebase_options.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  try {
    WidgetsFlutterBinding.ensureInitialized();

    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    if (kIsWeb) {
      await dotenv.load(isOptional: true);
      const String recaptchaSiteKey =
          String.fromEnvironment('RECAPTCHA_SITE_KEY');

      if (recaptchaSiteKey.isNotEmpty) {
        await FirebaseAppCheck.instance.activate(
          webProvider: ReCaptchaV3Provider(recaptchaSiteKey),
        );
      }
    } else {
      await FirebaseAppCheck.instance
          .activate(androidProvider: AndroidProvider.playIntegrity);
    }

    runApp(const MyApp());
  } catch (e) {
    print(e);
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LBG',
      theme: ThemeData(
        fontFamily: 'PPGatwick',
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          titleTextStyle: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(
              color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
          bodyMedium: TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.normal,
          ),
          headlineSmall: TextStyle(
              color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
        ),
      ),
      home: const MainView(),
    );
  }
}
