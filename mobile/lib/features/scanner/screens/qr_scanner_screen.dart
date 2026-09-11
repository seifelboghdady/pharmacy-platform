import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:iconsax/iconsax.dart';
import '../../../core/constants/app_colors.dart';
import '../cubit/scanner_cubit.dart';
import '../cubit/scanner_state.dart';
import 'scan_result_screen.dart';

class QrScannerScreen extends StatelessWidget {
  const QrScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ScannerCubit(),
      child: const _ScannerView(),
    );
  }
}

class _ScannerView extends StatefulWidget {
  const _ScannerView();

  @override
  State<_ScannerView> createState() => _ScannerViewState();
}

class _ScannerViewState extends State<_ScannerView> {
  final MobileScannerController _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
  );
  bool _handled = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture, ScannerCubit cubit) {
    if (_handled) return;
    final barcode = capture.barcodes.firstOrNull;
    final code = barcode?.rawValue;
    if (code == null || code.isEmpty) return;
    _handled = true;
    _controller.stop();
    cubit.lookupCode(code);
  }

  void _enterCodeManually(BuildContext context, ScannerCubit cubit) async {
    final controller = TextEditingController();
    final code = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Enter Code Manually'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Medicine barcode'),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(context, controller.text),
              child: const Text('Submit')),
        ],
      ),
    );
    if (code != null && code.isNotEmpty && context.mounted) {
      cubit.lookupCode(code);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text('Scan Medicine',
            style: TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Iconsax.flash_1, color: Colors.white),
            onPressed: () => _controller.toggleTorch(),
          ),
        ],
      ),
      body: BlocConsumer<ScannerCubit, ScannerState>(
        listener: (context, state) {
          if (state.status == ScannerStatus.notFound) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Medicine not found')),
            );
            setState(() => _handled = false);
            _controller.start();
          } else if (state.status == ScannerStatus.found &&
              state.medicine != null) {
            Navigator.of(context)
                .pushReplacement(
                  MaterialPageRoute(
                    builder: (_) => ScanResultScreen(medicine: state.medicine!),
                  ),
                )
                .then((_) => context.read<ScannerCubit>().reset());
          }
        },
        builder: (context, state) {
          final cubit = context.read<ScannerCubit>();
          return Stack(
            children: [
              MobileScanner(
                controller: _controller,
                onDetect: (capture) => _onDetect(capture, cubit),
                errorBuilder: (context, error, child) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.camera_alt_outlined,
                            color: Colors.white54,
                            size: 64,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            error.errorCode == MobileScannerErrorCode.permissionDenied
                                ? 'Camera permission denied.\nPlease allow camera access from Settings.'
                                : 'Camera error: ${error.errorDetails?.message ?? 'Unknown error'}',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 20),
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: const BorderSide(color: Colors.white38),
                            ),
                            icon: const Icon(Icons.refresh),
                            onPressed: () => _controller.start(),
                            label: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              Container(color: Colors.black.withOpacity(0.35)),
              Column(
                children: [
                  const SizedBox(height: 12),
                  const Text(
                    'Align the barcode/QR within the frame',
                    style: TextStyle(color: Colors.white70),
                  ),
                  Expanded(
                    child: Center(
                      child: Container(
                        height: 260,
                        width: 260,
                        decoration: BoxDecoration(
                          color: Colors.transparent,
                          border:
                              Border.all(color: AppColors.success, width: 3),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: state.status == ScannerStatus.scanning
                            ? const Center(
                                child: CircularProgressIndicator(
                                    color: AppColors.success))
                            : null,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white38),
                        backgroundColor: Colors.black26,
                      ),
                      icon: const Icon(Iconsax.edit),
                      onPressed: () => _enterCodeManually(context, cubit),
                      label: const Text('Enter Code Manually'),
                    ),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}

extension _FirstOrNull<T> on List<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
