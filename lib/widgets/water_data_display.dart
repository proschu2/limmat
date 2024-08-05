import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import '../services/api_service.dart';
import '../services/firebase_service.dart';

class WaterDataDisplay extends StatefulWidget {
  final String title;

  const WaterDataDisplay({super.key, required this.title});

  @override
  _WaterDataDisplayState createState() => _WaterDataDisplayState();
}

class _WaterDataDisplayState extends State<WaterDataDisplay> {
  final FirebaseService _firestoreService = FirebaseService();
  ApiService apiService = ApiService();
  Map<String, num> waterData = {};

  @override
  void initState() {
    super.initState();
    loadData();
  }

  Future<void> fetchData() async {
    Map<String, num> data = await apiService.fetchWaterData();
    setState(() {
      waterData = data;
    });

    await _firestoreService.saveData(data);
  }

  Future<void> loadData() async {
    Map<String, num>? data = await _firestoreService.loadData();
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
              Color.fromARGB(255, 106, 169, 241), // Light blue
              Color.fromARGB(255, 33, 121, 216), // Blue
              Color.fromARGB(255, 0, 63, 135), // Dark blue
            ],
          ),
        ),
      ),
      Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          title:
              Text(widget.title, style: Theme.of(context).textTheme.bodyLarge),
          /* actions: [
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: fetchData,
                ),
              ], */
        ),
        body: RefreshIndicator(
          onRefresh: loadData,
          child: ListView(children: [
            Center(
              child: waterData.isEmpty
                  ? const CircularProgressIndicator()
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: waterData.entries.map((entry) {
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
                          padding: const EdgeInsets.all(32.0),
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
                                style: Theme.of(context).textTheme.bodyLarge,
                              )),
                              const SizedBox(width: 8),
                              Text(unit,
                                  style:
                                      Theme.of(context).textTheme.bodyMedium),
                            ],
                          )),
                        );
                      }).toList(),
                    ),
            ),
          ]),
        ),
      ),
    ]));
  }
}
