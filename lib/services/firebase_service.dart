import 'package:cloud_firestore/cloud_firestore.dart';

class FirebaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  Map<String, num>? _cachedData;
  DateTime? _lastUpdate;

  Future<void> saveData(Map<String, num> data) async {
    await _db.collection('waterData').doc('latest').set({
      ...data,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));

    // Update local cache
    _cachedData = data;
    _lastUpdate = DateTime.now();
  }

  Future<Map<String, num>?> loadData() async {
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
        _cachedData = data.map((key, value) => MapEntry(key, value as num));
        _lastUpdate = updateDate;
        return _cachedData;
      }
    }
    return null;
  }
}
