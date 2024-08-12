import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../models/water_data.dart';

class ApiService {
  final String waterHeightUrl =
      'https://www.hydrodaten.admin.ch/plots/p_forecast/2099_p_forecast_de.json';
  final String waterSpeedUrl =
      'https://www.hydrodaten.admin.ch/plots/q_forecast/2099_q_forecast_de.json';
  final String waterStatusUrl =
      'https://www.hydrodaten.admin.ch/plots/p_q_7days/2099_p_q_7days_en.json';
  final String waterTemperatureUrl =
      'https://www.hydrodaten.admin.ch/plots/temperature_7days/2243_temperature_7days_en.json';

  final String weatherForecastUrl =
      'https://api.open-meteo.com/v1/forecast?latitude=47.392574&longitude=8.520825&current=temperature_2m,weather_code&daily=weather_code';

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
    final List<double> values = List<double>.from(
        correctLists['y'].map((item) => (item.toDouble() - 400.35)));
    final Map<String, num> averages =
        averageValuesByDate(dates, values, round: false);
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
    final Map<String, num> averages =
        averageValuesByDate(dates, values, round: true);
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
    final List<double> waterHeightValues = List<double>.from(
        waterHeightData['y']
            .map((item) => ((item.toDouble() - 400.35) * 100).round() / 100));
    final double waterHeight = waterHeightValues.last;

    return {'waterHeight': waterHeight, 'waterSpeed': waterSpeed};
  }

  Future<double> fetchWaterTemperature() async {
    final response = await fetchUrl(waterTemperatureUrl);
    final data = response['plot']['data'];
    return double.parse(data.first['y'].last.toStringAsFixed(1));
  }

  Future<WaterData> fetchWaterData() async {
    final waterStatus = await fetchWaterStatus();
    final waterTemperature = await fetchWaterTemperature();

    final weatherResponse = await fetchUrl(weatherForecastUrl);
    final num currentTemperature = weatherResponse['current']['temperature_2m'];
    final num currentWeatherCode = weatherResponse['current']['weather_code'];
    return WaterData(
        waterHeight: waterStatus['waterHeight'] ?? 0,
        waterSpeed: waterStatus['waterSpeed'] ?? 0,
        waterTemperature: waterTemperature,
        weatherCode: currentWeatherCode,
        outsideTemperature: currentTemperature);
  }

  Future<Map<String, WaterData>> fetchHistoricalWaterData() async {
    final waterHeight = await fetchWaterHeight();
    final waterSpeed = await fetchWaterSpeed();
    final double waterTemperature = await fetchWaterTemperature();

    Map<String, WaterData> waterData = {};

    for (int i = 0; i < waterHeight.length; i++) {
      String date = waterHeight.keys.elementAt(i);
      waterData[date] = WaterData(
          waterHeight: waterHeight.values.elementAt(i),
          waterSpeed: waterSpeed.values.elementAt(i),
          waterTemperature: waterTemperature);
    }

    return waterData;
  }

  Future<Map<String, int>> fetchWeatherForecastData() async {
    final response = await fetchUrl(weatherForecastUrl);
    final Map<String, dynamic> forecasts = response['daily'];
    final List<String> dates = List<String>.from(forecasts['time'] ?? []);
    final List<int> weatherCodes =
        List<int>.from(forecasts['weather_code'] ?? []);
    Map<String, int> weatherForecastData = {};
    for (int i = 0; i < dates.length; i++) {
      String date = dates[i];
      int weatherCode = weatherCodes[i];
      weatherForecastData[date] = weatherCode;
    }
    return weatherForecastData;
  }

  Future<ForecastedWaterData> fetchForecastedWaterData() async {
    final waterHeight = await fetchWaterHeight();
    final waterSpeed = await fetchWaterSpeed();
    final double waterTemperature = await fetchWaterTemperature();
    final weatherCodes = await fetchWeatherForecastData();

    Map<String, WaterData> forecastData = {};

    for (int i = 0; i < waterHeight.length; i++) {
      String date = waterHeight.keys.elementAt(i);
      forecastData[date] = WaterData(
          waterHeight: waterHeight.values.elementAt(i),
          waterSpeed: waterSpeed.values.elementAt(i),
          waterTemperature: waterTemperature);
      if (weatherCodes.containsKey(date)) {
        forecastData[date]!.weatherCode = weatherCodes[date]!;
      }
    }

    return ForecastedWaterData(forecastData: forecastData);
  }

  Map<String, num> averageValuesByDate(List<String> dates, List<num> values,
      {bool round = true}) {
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
      averageValues[date] =
          round ? (sum / count).round() : ((sum / count) * 100).round() / 100;
    });

    var sortedEntries = averageValues.entries.toList()
      ..sort((a, b) => a.key.compareTo(b.key));
    Map<String, num> sortedAverageValues = Map.fromEntries(sortedEntries);

    return sortedAverageValues;
  }
}

void main() async {
  ApiService apiService = ApiService();

  print(await apiService.fetchForecastedWaterData());
}
