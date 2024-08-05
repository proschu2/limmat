import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

class ApiService {
  final String waterHeightUrl =
      'https://www.hydrodaten.admin.ch/plots/p_forecast/2099_p_forecast_de.json';
  final String waterSpeedUrl =
      'https://www.hydrodaten.admin.ch/plots/q_forecast/2099_q_forecast_de.json';
  final String waterStatusUrl =
      'https://www.hydrodaten.admin.ch/plots/p_q_7days/2099_p_q_7days_en.json';
  final String waterTemperatureUrl =
      'https://www.hydrodaten.admin.ch/plots/temperature_7days/2243_temperature_7days_en.json';

  Future<dynamic> fetchUrl(String url) async {
    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print(response.statusCode);
        throw Exception('Failed to load data from API');
      }
    } catch (e) {
      throw Exception('Failed to load data from API: $e');
    }
  }

  Future<dynamic> fetchWaterHeight() async {
    final response = await fetchUrl(waterHeightUrl);
    final data = response['plot']['data'];
    final correctLists =
        data.firstWhere((element) => element['name'] == 'Median');
    final List<String> dates = List<String>.from(correctLists['x']);
    final List<double> values =
        List<double>.from(correctLists['y'].map((item) => item.toDouble()));
    final Map<String, num> averages = averageValuesByDate(dates, values);
    return averages;
  }

  Future<Map<String, num>> fetchWaterSpeed() async {
    final response = await fetchUrl(waterSpeedUrl);
    final data = response['plot']['data'];
    final correctLists =
        data.firstWhere((element) => element['name'] == 'Median');
    final List<String> dates = List<String>.from(correctLists['x']);
    final List<int> values = List<int>.from(
        correctLists['y'].map((item) => item.toDouble().round()));
    final Map<String, num> averages = averageValuesByDate(dates, values);
    return averages;
  }

  Future<Map<String, num>> fetchWaterStatus() async {
    final response = await fetchUrl(waterStatusUrl);
    final data = response['plot']['data'];
    final waterSpeedData =
        data.firstWhere((element) => element['name'] == 'Discharge');
    final List<int> waterSpeedValues = List<int>.from(
        waterSpeedData['y'].map((item) => item.toDouble().round()));
    final int waterSpeed = waterSpeedValues.last;

    final waterHeightData =
        data.firstWhere((element) => element['name'] == 'Water level');
    final List<int> waterHeightValues = List<int>.from(
        waterHeightData['y'].map((item) => item.toDouble().round()));
    final int waterHeight = waterHeightValues.last;

    return {'waterSpeed': waterSpeed, 'waterHeight': waterHeight};
  }

  Future<double> fetchWaterTemperature() async {
    final response = await fetchUrl(waterTemperatureUrl);
    final data = response['plot']['data'];
    return double.parse(data.first['y'].last.toStringAsFixed(1));
  }

  Future<Map<String, num>> fetchWaterData() async {
    final waterStatus = await fetchWaterStatus();
    final waterTemperature = await fetchWaterTemperature();
    return {'waterTemperature': waterTemperature, ...waterStatus};
  }

  Map<String, num> averageValuesByDate(List<String> dates, List<num> values) {
    // Initialize a Map to store the sum of values and the count of occurrences for each date
    Map<String, List<num>> dateToValuesMap = {};

    DateFormat dateFormat = DateFormat('yyyy-MM-dd');
    // Iterate through the lists of dates and values
    for (int i = 0; i < dates.length; i++) {
      DateTime dateTime = DateTime.parse(dates[i]);

      String date = dateFormat.format(dateTime);
      num value = values[i];

      // Update the Map with the sum of values and the count of occurrences
      if (!dateToValuesMap.containsKey(date)) {
        dateToValuesMap[date] = [value, 1]; // [sum, count]
      } else {
        dateToValuesMap[date]?[0] += value;
        dateToValuesMap[date]?[1] += 1;
      }
    }

    // Calculate the average values for each date
    Map<String, num> averageValues = {};
    dateToValuesMap.forEach((date, sumAndCount) {
      num sum = sumAndCount[0];
      int count = sumAndCount[1].toInt();
      averageValues[date] = (sum / count).round();
    });

    var sortedEntries = averageValues.entries.toList()
      ..sort((a, b) => a.key.compareTo(b.key));
    Map<String, num> sortedAverageValues = Map.fromEntries(sortedEntries);

    return sortedAverageValues;
  }
}

void main() async {
  ApiService apiService = ApiService();

  print(await apiService.fetchWaterData());
}
