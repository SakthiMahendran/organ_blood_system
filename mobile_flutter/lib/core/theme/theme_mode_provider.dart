import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../services/service_providers.dart';

class ThemeModeController extends StateNotifier<ThemeMode> {
  ThemeModeController(this._storage) : super(ThemeMode.light) {
    _hydrate();
  }

  final FlutterSecureStorage _storage;
  static const _storageKey = 'obs_color_mode';

  Future<void> _hydrate() async {
    final stored = await _storage.read(key: _storageKey);
    if (stored == 'dark') {
      state = ThemeMode.dark;
    } else {
      state = ThemeMode.light;
    }
  }

  Future<void> setMode(ThemeMode mode) async {
    if (state == mode) {
      return;
    }

    state = mode;
    await _storage.write(
      key: _storageKey,
      value: mode == ThemeMode.dark ? 'dark' : 'light',
    );
  }

  Future<void> toggle() async {
    await setMode(state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark);
  }
}

final themeModeProvider =
    StateNotifierProvider<ThemeModeController, ThemeMode>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return ThemeModeController(storage);
});
