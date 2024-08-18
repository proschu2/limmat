import 'package:flutter/material.dart';
import 'water_data_display.dart';
import 'forecast_data_display.dart';

class MainView extends StatelessWidget {
  const MainView({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        body: Stack(
          children: [
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
              appBar: AppBar(
                title: Center(
                  child:
                      Text('LBG', style: Theme.of(context).textTheme.bodyLarge),
                ),
                bottom: const TabBar(
                  tabs: [
                    Tab(
                      icon: Icon(
                        Icons.water_drop,
                        size: 32,
                      ),
                    ),
                    Tab(
                      icon: Icon(Icons.show_chart, size: 32),
                    ),
                  ],
                  indicatorColor: Color(0xFF003F88), // Color of the indicator
                  labelColor: Color(0xFF003F88), // Color of the selected tab
                  unselectedLabelColor:
                      Colors.white, // Color of the unselected tabs
                ),
              ),
              body: const TabBarView(
                children: [
                  WaterDataDisplay(),
                  ForecastView(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
