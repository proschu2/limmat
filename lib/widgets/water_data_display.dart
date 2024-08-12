import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:limmat/models/water_data.dart';
import '../services/api_service.dart';
import '../services/firebase_service.dart';

class WaterDataDisplay extends StatefulWidget {
  final String title = 'LBG';

  const WaterDataDisplay({super.key});

  @override
  _WaterDataDisplayState createState() => _WaterDataDisplayState();
}

class _WaterDataDisplayState extends State<WaterDataDisplay> {
  final FirebaseService _firestoreService = FirebaseService();
  ApiService apiService = ApiService();
  WaterData? waterData;

  @override
  void initState() {
    super.initState();
    loadData();
  }

  Future<void> fetchData() async {
    WaterData data = await apiService.fetchWaterData();
    setState(() {
      waterData = data;
    });

    await _firestoreService.saveData(data);
  }

  Future<void> loadData() async {
    WaterData? data = await _firestoreService.loadData();
    if (data != null) {
      setState(() {
        waterData = data;
      });
    } else {
      print('loading from API');
      await fetchData();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Stack(children: [
      Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xC16AA9F1), // Light blue
              Color(0xC12179D8), // Blue
              Color(0xC1003F87), // Dark blue
            ],
          ),
        ),
      ),
      Scaffold(
        backgroundColor: Colors.transparent,
        body: RefreshIndicator(
          onRefresh: loadData,
          child: ListView(children: [
            Center(
              child: waterData == null
                  ? const CircularProgressIndicator()
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                          Padding(
                              padding: const EdgeInsets.all(64.0),
                              child: IntrinsicWidth(
                                  child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Icon(weatherIcons[waterData!.weatherCode],
                                      size: 48, color: Colors.white),
                                  const SizedBox(width: 32),
                                  Flexible(
                                      child: Text(
                                    waterData!.outsideTemperature?.toString() ??
                                        'N/A',
                                    style:
                                        Theme.of(context).textTheme.bodyLarge,
                                  )),
                                  const SizedBox(width: 12),
                                  Text('°C',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium),
                                ],
                              ))),
                          ...waterData!.toJson().entries.map((entry) {
                            if (['weatherCode', 'outsideTemperature']
                                .contains(entry.key)) {
                              return Container();
                            }
                            IconData icon;
                            String unit;
                            switch (entry.key) {
                              case 'waterTemperature':
                                icon = Icons.thermostat;
                                unit = '°C';
                                break;
                              case 'waterSpeed':
                                icon = Icons.speed;
                                unit = 'm³/s';
                                break;
                              case 'waterHeight':
                                icon = Icons.water;
                                unit = 'm';
                                break;
                              default:
                                icon = Icons.help;
                                unit = '';
                            }
                            return Padding(
                              padding: const EdgeInsets.all(64.0),
                              child: IntrinsicWidth(
                                  child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment
                                    .center, // Ensure vertical alignment

                                children: [
                                  Icon(
                                    icon,
                                    size: 64,
                                    color: Colors.white,
                                  ),
                                  const SizedBox(width: 32),
                                  Flexible(
                                      child: Text(
                                    entry.value.toString(),
                                    style:
                                        Theme.of(context).textTheme.bodyLarge,
                                  )),
                                  const SizedBox(width: 12),
                                  Text(unit,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium),
                                ],
                              )),
                            );
                          }).toList(),
                        ]),
            ),
          ]),
        ),
      ),
    ]));
  }
}
