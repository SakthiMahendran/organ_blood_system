import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
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

import UrgencyChip from '../../components/common/UrgencyChip';
import { useEffect, useState } from 'react';

import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ListSkeleton from '../../components/common/ListSkeleton';
import { useToast } from '../../contexts/ToastContext';
import { donorService } from '../../services/donorService';
import { formatDateTime } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/errorUtils';

const DonorMatchesPage = () => {
  const { showToast } = useToast();

  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMatches = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await donorService.getMatches();
      setMatches(Array.isArray(result) ? result : []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to load matches.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleResponse = async (matchId, responseValue) => {
    try {
      await donorService.respondToMatch(matchId, responseValue);
      showToast(`Match ${responseValue.toLowerCase()}.`, 'success');
      await loadMatches();
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to submit response.'), 'error');
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadMatches} />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">My Matches</Typography>
      <Card>
        <CardContent>
          {isLoading ? (
            <ListSkeleton rows={6} />
          ) : matches.length === 0 ? (
            <EmptyState
              icon={FavoriteRoundedIcon}
              title="No matches found"
              description="Your matching results will appear here when hospitals run the matching process."
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request</TableCell>
                  <TableCell>Need</TableCell>
                  <TableCell>Urgency</TableCell>
                  <TableCell>Hospital</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Matched At</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matches.map((item) => {
                  const req = item.request_details;
                  const need = req
                    ? req.request_type === 'BLOOD'
                      ? req.blood_group || 'Blood'
                      : req.organ_type || 'Organ'
                    : '-';
                  return (
                  <TableRow key={item.id}>
                    <TableCell>#{item.request}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{need}</TableCell>
                    <TableCell>{req?.urgency ? <UrgencyChip urgency={req.urgency} size="small" /> : '-'}</TableCell>
                    <TableCell>{req?.hospital_name || '-'}</TableCell>
                    <TableCell>{Math.round(item.match_score)}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.donor_response}
                        color={item.donor_response === 'ACCEPTED' ? 'success' : item.donor_response === 'DECLINED' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(item.created_at)}</TableCell>
                    <TableCell align="right">
                      {item.donor_response === 'PENDING' ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" color="success" variant="contained" onClick={() => handleResponse(item.id, 'ACCEPTED')}>
                            Accept
                          </Button>
                          <Button size="small" color="error" variant="outlined" onClick={() => handleResponse(item.id, 'DECLINED')}>
                            Decline
                          </Button>
                        </Stack>
                      ) : item.donor_response === 'ACCEPTED' ? (
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                          Contact hospital
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.disabled">Declined</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default DonorMatchesPage;
