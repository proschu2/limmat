import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:limmat/models/water_data.dart';
import 'package:syncfusion_flutter_charts/charts.dart';

class ForecastLineChart extends StatelessWidget {
  final Map<String, WaterData> forecastData;

  const ForecastLineChart({super.key, required this.forecastData});

  @override
  Widget build(BuildContext context) {
    final DateFormat inputFormat = DateFormat('yyyy-MM-dd');
    final DateFormat outputFormat = DateFormat('dd.MM');
    final List<ChartData> speedSpots = forecastData.entries
        .map((entry) => ChartData(
            outputFormat.format(inputFormat.parse(entry.key)),
            entry.value.waterSpeed))
        .toList();
    final List<ChartData> heightSpots = forecastData.entries
        .map((entry) => ChartData(
            outputFormat.format(inputFormat.parse(entry.key)),
            entry.value.waterHeight))
        .toList();

    return SizedBox(
        width: 600,
        child: SfCartesianChart(
          primaryXAxis: const CategoryAxis(
            labelStyle: TextStyle(color: Colors.white),
            majorGridLines: MajorGridLines(width: 0),
            labelRotation: 45, // Tilt angle in degrees
          ),
          primaryYAxis: const NumericAxis(
              name: 'Speed',
              opposedPosition: false,
              majorGridLines: MajorGridLines(width: 0),
              interval: 5,
              labelStyle: TextStyle(color: Colors.lime),
              title: AxisTitle(
                text: 'Speed (m³/s)',
                textStyle: TextStyle(color: Colors.lime),
                alignment: ChartAlignment.center,
              )),
          axes: const <ChartAxis>[
            NumericAxis(
              name: 'Height',
              opposedPosition: true,
              majorGridLines: MajorGridLines(width: 0),
              interval: 0.1,
              labelStyle: TextStyle(color: Colors.amberAccent),
              title: AxisTitle(
                text: 'Δ Height (m)',
                textStyle: TextStyle(color: Colors.amberAccent),
              ),
            ),
          ],
          series: <CartesianSeries>[
            SplineSeries<ChartData, String>(
              dataSource: speedSpots,
              xValueMapper: (ChartData data, _) => data.x,
              yValueMapper: (ChartData data, _) => data.y,
              name: 'Speed',
              color: Colors.lime,
              width: 2,
              legendItemText: 'Speed',
              dashArray: const [2, 2],
            ),
            SplineSeries<ChartData, String>(
              dataSource: heightSpots,
              xValueMapper: (ChartData data, _) => data.x,
              yValueMapper: (ChartData data, _) => data.y,
              name: 'Height',
              color: Colors.amberAccent,
              width: 2,
              yAxisName: 'Height',
              dashArray: const [5, 5],
            ),
          ],
          tooltipBehavior: TooltipBehavior(enable: true),
          trackballBehavior: TrackballBehavior(
            lineColor: Colors.white,
            enable: true,
            activationMode: ActivationMode.singleTap,
            tooltipSettings: const InteractiveTooltip(
              enable: true,
              color: Colors.black,
              borderWidth: 1,
              borderColor: Colors.white,
            ),
            markerSettings: const TrackballMarkerSettings(
              markerVisibility: TrackballVisibilityMode.visible,
              width: 8,
              height: 8,
              borderWidth: 2,
              borderColor: Color.fromARGB(255, 206, 152, 152),
            ),
            lineType: TrackballLineType.vertical,
          ),
        ));
  }
}

class ChartData {
  final String x;
  final num y;

  ChartData(this.x, this.y);
}
