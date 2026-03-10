import {
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import { useToast } from '../../contexts/ToastContext';
import { adminService } from '../../services/adminService';
import { formatDateTime } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/errorUtils';

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'SUSPENDED'];

const AdminHospitalsPage = () => {
  const { showToast } = useToast();

  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHospitals = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminService.getHospitals();
      setHospitals(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to load hospitals.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const updateStatus = async (hospitalId, status) => {
    try {
      await adminService.updateHospitalStatus(hospitalId, status);
      showToast('Hospital status updated.', 'success');
      await loadHospitals();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to update hospital.'), 'error');
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadHospitals} />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Manage Hospitals</Typography>

      <Card>
        <CardContent>
          {isLoading ? (
            <ListSkeleton rows={8} />
          ) : hospitals.length === 0 ? (
            <EmptyState title="No hospitals found" description="Hospitals will appear here once registered." />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>License</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Update</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell>{hospital.name}</TableCell>
                    <TableCell>{hospital.license_id}</TableCell>
                    <TableCell>{hospital.city}, {hospital.state}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={hospital.approval_status}
                        color={hospital.approval_status === 'APPROVED' ? 'success' : hospital.approval_status === 'SUSPENDED' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(hospital.created_at)}</TableCell>
                    <TableCell align="right">
                      <Select
                        size="small"
                        value={hospital.approval_status}
                        onChange={(event) => updateStatus(hospital.id, event.target.value)}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AdminHospitalsPage;
