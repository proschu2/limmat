import 'package:flutter/material.dart';
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
    if (mounted) {
      super.initState();
      loadData();
    }
  }

  Future<void> fetchData() async {
    WaterData data = await apiService.fetchWaterData();
    setState(() {
      waterData = data;
    });

    _firestoreService.saveData(data);
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
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: Center(
            child: waterData == null
                ? const CircularProgressIndicator()
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                        WaterDataItem(
                            icon: weatherIcons[waterData!.weatherCode]!,
                            value: waterData!.outsideTemperature.toString() ??
                                'N/A',
                            unit: '°C'),
                        ...waterData!.toJson().entries.map((entry) {
                          if (['weatherCode', 'outsideTemperature']
                              .contains(entry.key)) {
                            return const SizedBox.shrink();
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
                          return WaterDataItem(
                              icon: icon,
                              value: entry.value.toString(),
                              unit: unit);
                        }),
                      ]),
          ),
        ),
      ),
    ]));
  }
}

class WaterDataItem extends StatelessWidget {
  final IconData icon;
  final String value;
  final String unit;

  const WaterDataItem(
      {required this.icon, required this.value, required this.unit, super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Icon(icon, size: 32, color: Colors.white),
        const SizedBox(width: 24),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(width: 12),
        Text(
          unit,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ],
    );
  }
}
