import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/nav_items.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../services/api_parser.dart';
import '../../data/models/inventory_item.dart';
import '../../data/repositories/inventory_repository.dart';

class AdminInventoryScreen extends ConsumerStatefulWidget {
  const AdminInventoryScreen({super.key});

  @override
  ConsumerState<AdminInventoryScreen> createState() =>
      _AdminInventoryScreenState();
}

class _AdminInventoryScreenState extends ConsumerState<AdminInventoryScreen> {
  bool _loading = false;
  int? _updatingIndex;
  List<InventoryItem> _items = const <InventoryItem>[];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final repo = await ref.read(inventoryRepositoryProvider.future);
      final items = await repo.fetchInventory();
      setState(() => _items = items);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(ApiParser.extractMessage(error,
                fallback: 'Inventory fetch failed.'))),
      );
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _update(InventoryItem item, int index) async {
    final unitsController = TextEditingController(text: item.units.toString());
    final thresholdController =
        TextEditingController(text: item.threshold.toString());

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Update ${item.bloodGroup} Inventory'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: unitsController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Units'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: thresholdController,
                keyboardType: TextInputType.number,
                decoration:
                    const InputDecoration(labelText: 'Low Alert Threshold'),
              ),
            ],
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel')),
            FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Save')),
          ],
        );
      },
    );

    if (confirmed != true) return;

    setState(() => _updatingIndex = index);

    try {
      final units = int.tryParse(unitsController.text.trim());
      final threshold = int.tryParse(thresholdController.text.trim());

      if (units == null || units < 0) {
        throw 'Invalid units value';
      }

      final repo = await ref.read(inventoryRepositoryProvider.future);
      final updated = await repo.updateInventory(
        bloodGroup: item.bloodGroup,
        units: units,
        threshold: threshold,
      );

      setState(() {
        _items = _items
            .map((entry) =>
                entry.bloodGroup == updated.bloodGroup ? updated : entry)
            .toList(growable: false);
      });
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(ApiParser.extractMessage(error,
                fallback: 'Inventory update failed.'))),
      );
    } finally {
      unitsController.dispose();
      thresholdController.dispose();
      if (mounted) {
        setState(() => _updatingIndex = null);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Blood Inventory',
      navItems: AppNavItems.admin,
      currentRoute: '/admin/inventory',
      onRefresh: _load,
      body: _loading
          ? const Center(
              child: Padding(
                  padding: EdgeInsets.all(24),
                  child: CircularProgressIndicator()))
          : _items.isEmpty
              ? const EmptyStateWidget(
                  title: 'No Inventory Data',
                  message: 'No blood inventory records available.')
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, index) {
                    final item = _items[index];
                    final busy = _updatingIndex == index;

                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: item.isLow
                                    ? const Color(0xFFFFECEC)
                                    : const Color(0xFFE9F6EF),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                item.bloodGroup,
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Units: ${item.units}',
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleMedium),
                                  Text('Threshold: ${item.threshold}'),
                                  Text(
                                      'Updated: ${AppFormatters.dateTime(item.updatedAt)}'),
                                  if (item.isLow)
                                    Text(
                                      'Low inventory alert',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                              color: const Color(0xFFC62828)),
                                    ),
                                ],
                              ),
                            ),
                            IconButton(
                              tooltip: 'Update inventory',
                              onPressed:
                                  busy ? null : () => _update(item, index),
                              icon: busy
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2),
                                    )
                                  : const Icon(Icons.edit_outlined),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
