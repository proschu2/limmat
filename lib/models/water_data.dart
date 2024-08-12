import 'package:flutter/material.dart';
import 'package:weather_icons/weather_icons.dart';

class WaterData {
  final num waterHeight;
  final num waterSpeed;
  final num waterTemperature;
  num weatherCode;
  num outsideTemperature;

  WaterData({
    required this.waterHeight,
    required this.waterSpeed,
    required this.waterTemperature,
    this.weatherCode = 0,
    this.outsideTemperature = 0,
  });

  factory WaterData.fromJson(Map<String, dynamic> json) {
    return WaterData(
      waterHeight: json['waterHeight'],
      waterSpeed: json['waterSpeed'],
      waterTemperature: json['waterTemperature'],
      weatherCode: json['weatherCode'] ?? 0,
      outsideTemperature: json['outsideTemperature'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'waterSpeed': waterSpeed,
      'waterTemperature': waterTemperature,
      'waterHeight': waterHeight,
      'weatherCode': weatherCode,
      'outsideTemperature': outsideTemperature,
    };
  }

  BoxedIcon get weatherIcon =>
      BoxedIcon(weatherIcons[weatherCode] ?? WeatherIcons.day_sunny,
          color: getWeatherColor(weatherCode));
}

Color getWeatherColor(num weatherCode) {
  if (weatherCode >= 50) {
    return Colors.red;
  }
  if (weatherCode >= 40) {
    return Colors.yellow;
  }
  return Colors.green;
}

Color getHeightColor(num waterHeight) {
  if (waterHeight <= -0.24 || waterHeight >= 0.79) {
    return Colors.red;
  }
  if (waterHeight <= 0.1 || waterHeight >= 0.45) {
    return Colors.yellow;
  }
  return Colors.green;
}

Color getSpeedColor(num waterSpeed) {
  if (waterSpeed <= 60 || waterSpeed >= 165) {
    return Colors.red;
  }
  if (waterSpeed <= 85 || waterSpeed >= 145) {
    return Colors.yellow;
  }
  return Colors.green;
}

final Map<int, IconData> weatherIcons = {
  0: WeatherIcons.day_sunny,
  1: WeatherIcons.day_sunny_overcast,
  2: WeatherIcons.day_sunny_overcast,
  3: WeatherIcons.day_sunny_overcast,
  45: WeatherIcons.fog,
  48: WeatherIcons.fog,
  51: WeatherIcons.rain,
  53: WeatherIcons.rain,
  55: WeatherIcons.rain,
  56: WeatherIcons.rain,
  57: WeatherIcons.rain,
  61: WeatherIcons.rain,
  63: WeatherIcons.rain,
  65: WeatherIcons.rain,
  66: WeatherIcons.rain,
  67: WeatherIcons.rain,
  71: WeatherIcons.snow,
  73: WeatherIcons.snow,
  75: WeatherIcons.snow,
  77: WeatherIcons.snow,
  80: WeatherIcons.showers,
  81: WeatherIcons.showers,
  82: WeatherIcons.showers,
  85: WeatherIcons.snow,
  86: WeatherIcons.snow,
  95: WeatherIcons.thunderstorm,
  96: WeatherIcons.thunderstorm,
  99: WeatherIcons.thunderstorm,
};

class ForecastedWaterData {
  final Map<String, WaterData> forecastData;

  ForecastedWaterData({required this.forecastData});

  factory ForecastedWaterData.fromJson(Map<String, dynamic> json) {
    final Map<String, WaterData> forecastData = {};
    for (final entry in json.entries) {
      forecastData[entry.key] =
          WaterData.fromJson(entry.value as Map<String, dynamic>);
    }
    return ForecastedWaterData(forecastData: forecastData);
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> json = {};
    for (final entry in forecastData.entries) {
      json[entry.key] = entry.value.toJson();
    }
    return json;
  }
}
