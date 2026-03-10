import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import {
  Button,
  Card,
  CardContent,
  Chip,
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
import { hospitalService } from '../../services/hospitalService';
import { getErrorMessage } from '../../utils/errorUtils';

const HospitalVerifyDonorsPage = () => {
  const { showToast } = useToast();

  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDonors = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await hospitalService.getPendingVerifications();
      setDonors(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to load pending donors.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDonors();
  }, []);

  const updateStatus = async (donorId, status) => {
    try {
      await hospitalService.updateVerification(donorId, status);
      showToast(`Donor ${status.toLowerCase()}.`, 'success');
      await loadDonors();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to update donor verification.'), 'error');
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadDonors} />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Verify Donors</Typography>
      <Card>
        <CardContent>
          {isLoading ? (
            <ListSkeleton rows={6} />
          ) : donors.length === 0 ? (
            <EmptyState
              icon={HowToRegRoundedIcon}
              title="No pending verifications"
              description="Donors awaiting identity and eligibility verification will appear here."
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Donor Name</TableCell>
                  <TableCell>Blood Group</TableCell>
                  <TableCell>Organ Willing</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {donors.map((donor) => (
                  <TableRow key={donor.id}>
                    <TableCell>{donor.donor_name}</TableCell>
                    <TableCell>{donor.blood_group}</TableCell>
                    <TableCell>{donor.organ_willing ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{donor.city}</TableCell>
                    <TableCell>
                      <Chip size="small" label={donor.verification_status} color="warning" />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" variant="contained" color="success" onClick={() => updateStatus(donor.id, 'VERIFIED')}>
                          Verify
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => updateStatus(donor.id, 'REJECTED')}>
                          Reject
                        </Button>
                      </Stack>
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

export default HospitalVerifyDonorsPage;
