import 'dart:convert';

import 'package:limmat/models/water_data.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FirebaseService {
  //final FirebaseFirestore _db = FirebaseFirestore.instance;
  // current water data
  Future<void> saveData(WaterData data) async {
    final prefs = await SharedPreferences.getInstance();
    // Update local cache
    await prefs.setString('cachedData', jsonEncode(data.toJson()));
    await prefs.setString('lastUpdate', DateTime.now().toIso8601String());
  }

  Future<WaterData?> loadData() async {
    final now = DateTime.now();
    final thirtyMinutesAgo = now.subtract(const Duration(minutes: 30));
    final prefs = await SharedPreferences.getInstance();
    final cachedData = prefs.getString('cachedData');
    final lastUpdate = prefs.getString('lastUpdate');
    // Check local cache first
    if (cachedData != null &&
        lastUpdate != null &&
        DateTime.parse(lastUpdate).isAfter(thirtyMinutesAgo)) {
      return WaterData.fromJson(jsonDecode(cachedData));
    }
    return null;
  }

  // forecasted water data
  Future<void> saveForecastData(ForecastedWaterData data) async {
    final prefs = await SharedPreferences.getInstance();
    // Update local cache
    await prefs.setString('cachedForecastData', jsonEncode(data.toJson()));
    await prefs.setString(
        'lastForecastUpdate', DateTime.now().toIso8601String());
  }

  Future<ForecastedWaterData?> loadForecastData() async {
    final now = DateTime.now();
    final thirtyMinutesAgo = now.subtract(const Duration(minutes: 30));
    final prefs = await SharedPreferences.getInstance();
    final cachedData = prefs.getString('cachedForecastData');
    final lastUpdate = prefs.getString('lastForecastUpdate');
    // Check local cache first
    if (cachedData != null &&
        lastUpdate != null &&
        DateTime.parse(lastUpdate).isAfter(thirtyMinutesAgo)) {
      return ForecastedWaterData.fromJson(jsonDecode(cachedData));
    }
    return null;
  }
}
