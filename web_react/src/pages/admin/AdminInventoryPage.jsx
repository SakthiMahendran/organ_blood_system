import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useEffect, useState } from 'react';

import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import StatCard from '../../components/common/StatCard';
import { useToast } from '../../contexts/ToastContext';
import { adminService } from '../../services/adminService';
import { bloodUnitService } from '../../services/bloodUnitService';
import { getErrorMessage } from '../../utils/errorUtils';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENT_TYPES = [
  { value: 'whole_blood', label: 'Whole Blood (35 days)' },
  { value: 'packed_rbc', label: 'Packed RBCs (42 days)' },
  { value: 'platelets', label: 'Platelets (5 days)' },
  { value: 'ffp', label: 'Fresh Frozen Plasma (1 year)' },
];

const EXPIRY_COLORS = { RED: 'error', AMBER: 'warning', GREEN: 'success', EXPIRED: 'error' };

const AdminInventoryPage = () => {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState(null);
  const [wastageStats, setWastageStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit dialog state
  const [editItem, setEditItem] = useState(null);
  const [editUnits, setEditUnits] = useState('');
  const [editThreshold, setEditThreshold] = useState('');
  const [saving, setSaving] = useState(false);

  // Register blood unit dialog
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    blood_group: 'O+',
    component_type: 'whole_blood',
    collection_date: new Date().toISOString().split('T')[0],
    hospital_name: '',
  });
  const [registering, setRegistering] = useState(false);

  const loadAll = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [inventoryData, alertsData, wastageData] = await Promise.all([
        adminService.getInventory(),
        bloodUnitService.getExpiryAlerts().catch(() => null),
        bloodUnitService.getWastageStats().catch(() => null),
      ]);
      setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      setExpiryAlerts(alertsData);
      setWastageStats(wastageData);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to load inventory.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
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
      showToast(getErrorMessage(apiError, 'Failed to update inventory.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await bloodUnitService.createBloodUnit(registerForm);
      showToast('Blood unit registered successfully.', 'success');
      setRegisterOpen(false);
      setRegisterForm({
        blood_group: 'O+',
        component_type: 'whole_blood',
        collection_date: new Date().toISOString().split('T')[0],
        hospital_name: '',
      });
      loadAll();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to register blood unit.'), 'error');
    } finally {
      setRegistering(false);
    }
  };

  if (error && inventory.length === 0) {
    return <ErrorState message={error} onRetry={loadAll} />;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Blood Inventory</Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleRoundedIcon />}
          onClick={() => setRegisterOpen(true)}
        >
          Register Blood Unit
        </Button>
      </Stack>

      {/* ─── Expiry Alerts Summary ─── */}
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Expiring < 3 Days"
            value={expiryAlerts?.red_count ?? '-'}
            icon={WarningAmberRoundedIcon}
            color="error"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Expiring 3-7 Days"
            value={expiryAlerts?.amber_count ?? '-'}
            icon={WarningAmberRoundedIcon}
            color="warning"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Healthy Stock"
            value={expiryAlerts?.green_count ?? '-'}
            icon={InventoryRoundedIcon}
            color="success"
          />
        </Grid2>
      </Grid2>

      {/* ─── Wastage Stats ─── */}
      {wastageStats && (
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Total Units Tracked"
              value={wastageStats.total_units}
              icon={InventoryRoundedIcon}
              color="primary"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Expired Units"
              value={wastageStats.expired}
              icon={DeleteSweepRoundedIcon}
              color="error"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Wastage Rate"
              value={`${wastageStats.wastage_rate}%`}
              icon={DeleteSweepRoundedIcon}
              color={wastageStats.wastage_rate > 10 ? 'error' : 'warning'}
            />
          </Grid2>
        </Grid2>
      )}

      {/* ─── Near-Expiry Units Table ─── */}
      {expiryAlerts?.red?.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" color="error.main" sx={{ mb: 1.5 }}>
              Units Expiring Within 3 Days
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Unit ID</TableCell>
                  <TableCell>Blood Group</TableCell>
                  <TableCell>Component</TableCell>
                  <TableCell>Hospital</TableCell>
                  <TableCell>Collected</TableCell>
                  <TableCell>Expires</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expiryAlerts.red.map((unit) => (
                  <TableRow key={unit.id} sx={{ bgcolor: 'error.main', '& td': { color: 'error.contrastText' } }}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{String(unit.unit_id).slice(0, 8)}</TableCell>
                    <TableCell><strong>{unit.blood_group}</strong></TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{unit.component_type?.replace('_', ' ')}</TableCell>
                    <TableCell>{unit.hospital_name}</TableCell>
                    <TableCell>{unit.collection_date}</TableCell>
                    <TableCell>{unit.expiry_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ─── Aggregate Inventory ─── */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Aggregate Inventory</Typography>
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

      {/* Edit Inventory Dialog */}
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

      {/* Register Blood Unit Dialog */}
      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Blood Unit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Blood Group"
              value={registerForm.blood_group}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, blood_group: e.target.value }))}
              fullWidth
            >
              {BLOOD_GROUPS.map((g) => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Component Type"
              value={registerForm.component_type}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, component_type: e.target.value }))}
              fullWidth
            >
              {COMPONENT_TYPES.map((ct) => (
                <MenuItem key={ct.value} value={ct.value}>{ct.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Collection Date"
              type="date"
              value={registerForm.collection_date}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, collection_date: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hospital Name"
              value={registerForm.hospital_name}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, hospital_name: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRegister} disabled={registering}>
            {registering ? 'Registering...' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AdminInventoryPage;
