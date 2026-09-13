import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/primary_button.dart';
import '../auth/screens/login_screen.dart';

class _OnboardData {
  final String title;
  final String subtitle;
  final String image;
  final double imageWidth;
  final double imageHeight;
  const _OnboardData(this.title, this.subtitle, this.image,
      {this.imageWidth = 309, this.imageHeight = 168});
}

const _pages = [
  _OnboardData(
      'Manage Your Pharmacy\nEffortlessly',
      'Track inventory, sales & orders in real-time from anywhere.',
      "assets/images/image 10.png",
      imageWidth: 309,
      imageHeight: 168),
  _OnboardData(
      'Scan & Dispense\nFaster',
      'Use QR code to dispense medicines quickly and accurately.',
      "assets/images/image 9.png",
      imageWidth: 183,
      imageHeight: 292),
  _OnboardData(
      'Monitor From\nAnywhere',
      'Stay updated with your pharmacy performance on the go.',
      "assets/images/image 11.png",
      imageWidth: 200,
      imageHeight: 200),
];

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _index = 0;

  void _goToLogin() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  void _next() {
    if (_index == _pages.length - 1) {
      _goToLogin();
    } else {
      _controller.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: TextButton(
                onPressed: _goToLogin,
                child: const Text('Skip',
                    style: TextStyle(color: AppColors.textGrey)),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _pages.length,
                onPageChanged: (i) => setState(() => _index = i),
                itemBuilder: (context, i) {
                  final page = _pages[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(28),
                          child: Image.asset(
                            page.image,
                            height: page.imageHeight,
                            width: page.imageWidth,
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(height: 32),
                        Text(
                          page.title,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          page.subtitle,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                              color: AppColors.textGrey, fontSize: 14),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_pages.length, (i) {
                final active = i == _index;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  height: 7,
                  width: active ? 20 : 7,
                  decoration: BoxDecoration(
                    color: active ? AppColors.success : AppColors.border,
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: PrimaryButton(
                label: _index == _pages.length - 1 ? 'Get Started' : 'Next',
                onPressed: _next,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
