import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:limmat/models/water_data.dart';

class FirebaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  WaterData? _cachedData;
  DateTime? _lastUpdate;
  ForecastedWaterData? _cachedForecastData;
  DateTime? _lastForecastUpdate;
  // current water data
  Future<void> saveData(WaterData data) async {
    await _db.collection('waterData').doc('latest').set({
      ...data.toJson(),
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));

    // Update local cache
    _cachedData = data;
    _lastUpdate = DateTime.now();
  }

  Future<WaterData?> loadData() async {
    final now = DateTime.now();
    final thirtyMinutesAgo = now.subtract(const Duration(minutes: 30));
    // Check local cache first
    if (_cachedData != null &&
        _lastUpdate != null &&
        _lastUpdate!.isAfter(thirtyMinutesAgo)) {
      return _cachedData;
    }
    DocumentSnapshot snapshot =
        await _db.collection('waterData').doc('latest').get();
    if (snapshot.exists) {
      Map<String, dynamic> data = snapshot.data() as Map<String, dynamic>;
      final updateDate = data['updatedAt'].toDate();
      if (updateDate.isAfter(thirtyMinutesAgo)) {
        data.remove('updatedAt');
        _cachedData = WaterData.fromJson(data);
        _lastUpdate = updateDate;
        return _cachedData;
      }
    }
    return null;
  }

  // forecasted water data
  Future<void> saveForecastData(ForecastedWaterData data) async {
    await _db.collection('forecastedWaterData').doc('latest').set(
      {
        ...data.toJson(),
        'updatedAt': FieldValue.serverTimestamp(),
      },
    );

    // Update local cache
    _cachedForecastData = data;
    _lastForecastUpdate = DateTime.now();
  }

  Future<ForecastedWaterData?> loadForecastData() async {
    final now = DateTime.now();
    final thirtyMinutesAgo = now.subtract(const Duration(minutes: 30));
    // Check local cache first
    if (_cachedForecastData != null &&
        _lastForecastUpdate != null &&
        _lastForecastUpdate!.isAfter(thirtyMinutesAgo)) {
      return _cachedForecastData!;
    }
    DocumentSnapshot snapshot =
        await _db.collection('forecastedWaterData').doc('latest').get();
    if (snapshot.exists) {
      Map<String, dynamic> data = snapshot.data() as Map<String, dynamic>;
      final updateDate = data['updatedAt'].toDate();
      if (updateDate.isAfter(thirtyMinutesAgo)) {
        data.remove('updatedAt');
        Map<String, WaterData> forecastData = {};

        data.forEach((key, value) {
          forecastData[key] = WaterData.fromJson(value);
        });

        // Sort the forecastData map based on the keys
        final sortedForecastData = Map.fromEntries(forecastData.entries.toList()
          ..sort((a, b) => a.key.compareTo(b.key)));
        _cachedForecastData =
            ForecastedWaterData(forecastData: sortedForecastData);
        _lastForecastUpdate = updateDate;
        return _cachedForecastData!;
      }
    }
    return null;
  }
}
