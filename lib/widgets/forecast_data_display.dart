import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/water_data.dart';
import '../services/firebase_service.dart';
import 'forecast_data_table.dart';
import 'forecast_line_chart.dart';

class ForecastView extends StatefulWidget {
  const ForecastView({super.key});

  @override
  _ForecastViewState createState() => _ForecastViewState();
}

class _ForecastViewState extends State<ForecastView> {
  final FirebaseService _firestoreService = FirebaseService();
  final ApiService apiService = ApiService();

  ForecastedWaterData? forecastedWaterData;

  @override
  void initState() {
    if (mounted) {
      super.initState();
      loadData();
    }
  }

  Future<void> fetchData() async {
    ForecastedWaterData data = await apiService.fetchForecastedWaterData();

    setState(() {
      forecastedWaterData = data;
    });
    print('saving forecast data');
    _firestoreService.saveForecastData(data);
    print('forecast data saved');
  }

  Future<void> loadData() async {
    ForecastedWaterData? data = await _firestoreService.loadForecastData();
    if (data != null) {
      setState(() {
        forecastedWaterData = data;
      });
    } else {
      print('loading from API');
      await fetchData();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Colors.transparent,
        body: Padding(
            padding: const EdgeInsets.all(16),
            child: Center(
                child: forecastedWaterData == null
                    ? const CircularProgressIndicator()
                    : SingleChildScrollView(
                        child: Column(
                          //mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Center(
                                child: SizedBox(
                              height: 300,
                              child: ForecastLineChart(
                                  forecastData:
                                      forecastedWaterData!.forecastData),
                            )),
                            const SizedBox(height: 20),
                            Center(
                                child: SizedBox(
                              height: 350,
                              child: ForecastDataTable(
                                  forecastData:
                                      forecastedWaterData!.forecastData),
                            )),
                          ],
                        ),
                      ))));
  }
}
