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
    super.initState();
    loadData();
  }

  Future<void> fetchData() async {
    ForecastedWaterData data = await apiService.fetchForecastedWaterData();
    
    setState(() {
      forecastedWaterData = data;
    });

    await _firestoreService.saveForecastData(data);
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
        body: RefreshIndicator(
            onRefresh: loadData,
            child: ListView(children: [
              Center(
                child: forecastedWaterData == null
                    ? const CircularProgressIndicator()
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Center(
                              child: Container(
                            height: 300,
                            child: ForecastLineChart(
                                forecastData:
                                    forecastedWaterData!.forecastData),
                          )),
                          const SizedBox(height: 20),
                          Center(
                              child: Container(
                            height: 350,
                            child: ForecastDataTable(
                                forecastData:
                                    forecastedWaterData!.forecastData),
                          )),
                        ],
                      ),
              )
            ])));
  }
}
