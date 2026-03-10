import {
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../utils/errorUtils';

const AdminInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editUnits, setEditUnits] = useState('');
  const [editThreshold, setEditThreshold] = useState('');
  const [saving, setSaving] = useState(false);

  const loadInventory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminService.getInventory();
      setInventory(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to load inventory.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleEdit = (item) => {
    setEditItem(item);
    setEditUnits(String(item.units));
    setEditThreshold(String(item.threshold));
  };

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const updated = await adminService.updateInventory(editItem.blood_group, {
        units: parseInt(editUnits, 10),
        threshold: parseInt(editThreshold, 10),
      });
      setInventory((prev) =>
        prev.map((item) => (item.blood_group === editItem.blood_group ? updated : item)),
      );
      setEditItem(null);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to update inventory.'));
    } finally {
      setSaving(false);
    }
  };

  if (error && inventory.length === 0) {
    return <ErrorState message={error} onRetry={loadInventory} />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Blood Inventory</Typography>

      <Card>
        <CardContent>
          {isLoading ? (
            <ListSkeleton rows={8} />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Blood Group</TableCell>
                  <TableCell align="right">Units Available</TableCell>
                  <TableCell align="right">Low-Stock Threshold</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((item) => {
                  const isLow = item.units <= item.threshold;
                  return (
                    <TableRow key={item.blood_group}>
                      <TableCell>
                        <Typography fontWeight={600}>{item.blood_group}</Typography>
                      </TableCell>
                      <TableCell align="right">{item.units}</TableCell>
                      <TableCell align="right">{item.threshold}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={isLow ? 'Low Stock' : 'Adequate'}
                          color={isLow ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => handleEdit(item)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Update {editItem?.blood_group} Inventory</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Units Available"
              type="number"
              value={editUnits}
              onChange={(e) => setEditUnits(e.target.value)}
              fullWidth
            />
            <TextField
              label="Low-Stock Threshold"
              type="number"
              value={editThreshold}
              onChange={(e) => setEditThreshold(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AdminInventoryPage;
