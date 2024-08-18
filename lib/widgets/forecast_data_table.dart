import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/water_data.dart';
import 'dart:math';

class ForecastDataTable extends StatelessWidget {
  final Map<String, WaterData> forecastData;

  ForecastDataTable({super.key, required this.forecastData});

  final List<IconData> weatherIcons = [
    Icons.wb_sunny,
    Icons.cloud,
    Icons.water_drop_rounded
  ];

  Icon _getRandomWeatherIcon() {
    final random = Random();
    return Icon(
      weatherIcons[random.nextInt(weatherIcons.length)],
      color: Colors.white,
    );
  }

  @override
  Widget build(BuildContext context) {
    final DateFormat inputFormat = DateFormat('yyyy-MM-dd');
    final DateFormat outputFormat = DateFormat('dd.MM');
    return Container(
      padding: const EdgeInsets.all(8.0), // Minimal padding
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          columnSpacing: 24.0, // Minimal column spacing
          columns: const [
            DataColumn(
                label: Text(
              'Date',
              style: TextStyle(color: Colors.white),
            )),
            DataColumn(
                label: Text(
                  'Speed',
                  style: TextStyle(color: Colors.white),
                ),
                numeric: true),
            DataColumn(
                label: Text(
                  'Δ Height',
                  style: TextStyle(color: Colors.white),
                ),
                numeric: true),
            DataColumn(
                label: Text(
              'Weather',
              style: TextStyle(color: Colors.white),
            )),
          ],
          rows: forecastData.entries.map((entry) {
            final dayMonth = outputFormat.format(inputFormat
                .parse(entry.key)); // Extract day and month in dd.mm format
            final speed = entry.value.waterSpeed.toString() ?? 'N/A';
            final height = entry.value.waterHeight.toString() ?? 'N/A';
            final weatherIcon = entry.value.weatherIcon;

            return DataRow(cells: [
              DataCell(Text(dayMonth)),
              DataCell(Text(
                speed,
                style: TextStyle(
                  color: getSpeedColor(entry.value.waterSpeed),
                ),
              )),
              DataCell(Text(
                height,
                style:
                    TextStyle(color: getHeightColor(entry.value.waterHeight)),
              )),
              DataCell(Center(child: weatherIcon))
            ]);
          }).toList(),
        ),
      ),
    );
  }
}
