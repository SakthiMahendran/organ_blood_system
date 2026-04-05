import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Box,
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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
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
const ORGAN_TYPES = [
  { value: 'heart', label: 'Heart (4h viability)' },
  { value: 'lungs', label: 'Lungs (6h viability)' },
  { value: 'small_intestine', label: 'Small Intestine (8h)' },
  { value: 'pancreas', label: 'Pancreas (12h viability)' },
  { value: 'liver', label: 'Liver (24h viability)' },
  { value: 'bone_marrow', label: 'Bone Marrow (24h)' },
  { value: 'kidney', label: 'Kidney (36h viability)' },
  { value: 'corneas', label: 'Corneas (7 days)' },
];

const EXPIRY_COLORS = { RED: 'error', AMBER: 'warning', GREEN: 'success', EXPIRED: 'error' };
const ORGAN_STATUS_COLORS = { CRITICAL: 'error', WARNING: 'warning', OK: 'success', EXPIRED: 'default' };

const AdminInventoryPage = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);

  // Blood inventory state
  const [inventory, setInventory] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState(null);
  const [wastageStats, setWastageStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Organ inventory state
  const [organSummary, setOrganSummary] = useState([]);
  const [organLoading, setOrganLoading] = useState(true);

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

  // Register organ unit dialog
  const [organRegisterOpen, setOrganRegisterOpen] = useState(false);
  const [organRegisterForm, setOrganRegisterForm] = useState({
    organ_type: 'kidney',
    blood_group: '',
    collection_datetime: new Date().toISOString().slice(0, 16),
    hospital_name: '',
    notes: '',
  });
  const [organRegistering, setOrganRegistering] = useState(false);

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

  const loadOrganSummary = async () => {
    setOrganLoading(true);
    try {
      const data = await bloodUnitService.getOrganUnitSummary();
      setOrganSummary(Array.isArray(data) ? data : []);
    } catch {
      setOrganSummary([]);
    } finally {
      setOrganLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    loadOrganSummary();
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

  const handleOrganRegister = async () => {
    if (!organRegisterForm.hospital_name.trim()) {
      showToast('Hospital name is required.', 'warning');
      return;
    }
    setOrganRegistering(true);
    try {
      await bloodUnitService.createOrganUnit(organRegisterForm);
      showToast('Organ unit registered successfully.', 'success');
      setOrganRegisterOpen(false);
      setOrganRegisterForm({
        organ_type: 'kidney',
        blood_group: '',
        collection_datetime: new Date().toISOString().slice(0, 16),
        hospital_name: '',
        notes: '',
      });
      loadOrganSummary();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to register organ unit.'), 'error');
    } finally {
      setOrganRegistering(false);
    }
  };

  if (error && inventory.length === 0) {
    return <ErrorState message={error} onRetry={loadAll} />;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Inventory</Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleRoundedIcon />}
          onClick={() => activeTab === 0 ? setRegisterOpen(true) : setOrganRegisterOpen(true)}
        >
          {activeTab === 0 ? 'Register Blood Unit' : 'Register Organ Unit'}
        </Button>
      </Stack>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
        <Tab label="Blood Inventory" />
        <Tab label="Organ Inventory" />
      </Tabs>

      {/* ─── Blood Inventory Tab ─── */}
      {activeTab === 0 && <><Grid2 container spacing={2}>
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

      </>}

      {/* ─── Organ Inventory Tab ─── */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          {organLoading ? (
            <ListSkeleton rows={8} />
          ) : organSummary.length === 0 ? (
            <Card><CardContent><Typography color="text.secondary" align="center">No organ units registered yet.</Typography></CardContent></Card>
          ) : (
            <>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <StatCard
                    title="Total Available"
                    value={organSummary.reduce((s, o) => s + o.available, 0)}
                    icon={VolunteerActivismRoundedIcon}
                    color="success"
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <StatCard
                    title="Critical Expiry (< 6h)"
                    value={organSummary.reduce((s, o) => s + o.critical_expiry, 0)}
                    icon={WarningAmberRoundedIcon}
                    color="error"
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <StatCard
                    title="Transplanted"
                    value={organSummary.reduce((s, o) => s + o.transplanted, 0)}
                    icon={InventoryRoundedIcon}
                    color="primary"
                  />
                </Grid2>
              </Grid2>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1.5 }}>Organ Inventory by Type</Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Organ Type</TableCell>
                        <TableCell align="right">Available</TableCell>
                        <TableCell align="right">Reserved</TableCell>
                        <TableCell align="right">Transplanted</TableCell>
                        <TableCell align="right">Expired</TableCell>
                        <TableCell align="center">Critical (&lt; 6h)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {organSummary.map((row) => (
                        <TableRow key={row.organ_type}>
                          <TableCell><Typography fontWeight={600} sx={{ textTransform: 'capitalize' }}>{row.organ_label}</Typography></TableCell>
                          <TableCell align="right">{row.available}</TableCell>
                          <TableCell align="right">{row.reserved}</TableCell>
                          <TableCell align="right">{row.transplanted}</TableCell>
                          <TableCell align="right">{row.expired}</TableCell>
                          <TableCell align="center">
                            {row.critical_expiry > 0 ? (
                              <Chip label={row.critical_expiry} color="error" size="small" />
                            ) : (
                              <Chip label="0" color="success" size="small" variant="outlined" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </Stack>
      )}

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
      {/* Register Organ Unit Dialog */}
      <Dialog open={organRegisterOpen} onClose={() => setOrganRegisterOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Organ Unit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Organ Type"
              value={organRegisterForm.organ_type}
              onChange={(e) => setOrganRegisterForm((prev) => ({ ...prev, organ_type: e.target.value }))}
              fullWidth
            >
              {ORGAN_TYPES.map((ot) => (
                <MenuItem key={ot.value} value={ot.value}>{ot.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Blood Group (optional)"
              value={organRegisterForm.blood_group}
              onChange={(e) => setOrganRegisterForm((prev) => ({ ...prev, blood_group: e.target.value }))}
              fullWidth
            >
              <MenuItem value="">— None —</MenuItem>
              {BLOOD_GROUPS.map((g) => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Collection Date & Time"
              type="datetime-local"
              value={organRegisterForm.collection_datetime}
              onChange={(e) => setOrganRegisterForm((prev) => ({ ...prev, collection_datetime: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: new Date().toISOString().slice(0, 16) }}
            />
            <TextField
              label="Hospital Name"
              value={organRegisterForm.hospital_name}
              onChange={(e) => setOrganRegisterForm((prev) => ({ ...prev, hospital_name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Notes (optional)"
              value={organRegisterForm.notes}
              onChange={(e) => setOrganRegisterForm((prev) => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrganRegisterOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleOrganRegister} disabled={organRegistering}>
            {organRegistering ? 'Registering...' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AdminInventoryPage;
