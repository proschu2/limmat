import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:limmat/widgets/main_view.dart';
import 'firebase_options.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  if (kIsWeb) {
    final String recaptchaSiteKey = dotenv.env['RECAPTCHA_SITE_KEY'] ?? '';
    print('Using reCAPTCHA v3 site key: $recaptchaSiteKey');

    if (recaptchaSiteKey.isNotEmpty) {
      await FirebaseAppCheck.instance.activate(
        webProvider: ReCaptchaV3Provider(recaptchaSiteKey),
      );
    }
  } else {
    print('No Web');
    await FirebaseAppCheck.instance
        .activate(androidProvider: AndroidProvider.playIntegrity);
  }

  runApp(const MyApp());
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
              color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
          bodyMedium: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.normal,
          ),
          headlineSmall: TextStyle(
              color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
        ),
      ),
      home: MainView(),
    );
  }
}
