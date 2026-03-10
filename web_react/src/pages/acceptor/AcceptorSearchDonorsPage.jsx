import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import {
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import EmptyState from '../../components/common/EmptyState';
import ListSkeleton from '../../components/common/ListSkeleton';
import ControlledSelect from '../../components/forms/ControlledSelect';
import ControlledTextField from '../../components/forms/ControlledTextField';
import { useToast } from '../../contexts/ToastContext';
import { acceptorService } from '../../services/acceptorService';
import { getErrorMessage } from '../../utils/errorUtils';
import { BLOOD_GROUP_OPTIONS, ORGAN_TYPE_OPTIONS } from '../../utils/options';

const AcceptorSearchDonorsPage = () => {
  const { showToast } = useToast();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useAiRanking, setUseAiRanking] = useState(true);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      type: 'blood',
      blood_group: '',
      organ: '',
      city: '',
      state: '',
      urgency: 'MEDIUM',
    },
  });

  const searchType = watch('type');

  const onSearch = handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      const params = {
        type: values.type,
        city: values.city || undefined,
        state: values.state || undefined,
        urgency: values.urgency || 'MEDIUM',
        blood_group: values.type === 'blood' ? values.blood_group || undefined : undefined,
        organ: values.type === 'organ' ? values.organ || undefined : undefined,
        organ_type: values.type === 'organ' ? values.organ || undefined : undefined,
      };

      const data = useAiRanking
        ? await acceptorService.searchDonorCandidates(params)
        : await acceptorService.searchDonors(params);

      setResults(Array.isArray(data) ? data : []);
    } catch (apiError) {
      showToast(getErrorMessage(apiError, 'Failed to search donors.'), 'error');
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Search Donors</Typography>

      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSearch}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <ControlledSelect
                  name="type"
                  control={control}
                  label="Type"
                  options={[
                    { value: 'blood', label: 'Blood' },
                    { value: 'organ', label: 'Organ' },
                  ]}
                />
              </Grid2>

              {searchType === 'blood' ? (
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <ControlledSelect
                    name="blood_group"
                    control={control}
                    label="Blood Group"
                    options={BLOOD_GROUP_OPTIONS}
                  />
                </Grid2>
              ) : (
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <ControlledSelect name="organ" control={control} label="Organ Type" options={ORGAN_TYPE_OPTIONS} />
                </Grid2>
              )}

              <Grid2 size={{ xs: 12, md: 3 }}>
                <ControlledTextField name="city" control={control} label="City" />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <ControlledTextField name="state" control={control} label="State" />
              </Grid2>

              <Grid2 size={{ xs: 12, md: 3 }}>
                <ControlledSelect
                  name="urgency"
                  control={control}
                  label="Urgency"
                  options={[
                    { value: 'LOW', label: 'Low' },
                    { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HIGH', label: 'High' },
                    { value: 'CRITICAL', label: 'Critical' },
                  ]}
                />
              </Grid2>
            </Grid2>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
              <FormControlLabel
                control={<Switch checked={useAiRanking} onChange={(event) => setUseAiRanking(event.target.checked)} />}
                label={(
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <AutoAwesomeRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Use AI ranking (compatibility + confidence)</Typography>
                  </Stack>
                )}
              />

              <Button type="submit" variant="contained" startIcon={<SearchRoundedIcon />}>
                Search
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Search Results
          </Typography>

          {isLoading ? (
            <ListSkeleton rows={6} />
          ) : results.length === 0 ? (
            <EmptyState
              title="No donors found"
              description="Try changing filters like city, state, blood group, or organ type."
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Blood Group</TableCell>
                  <TableCell>Organ Types</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>AI Score</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((item) => {
                  const status = item.verification_status && item.availability_status
                    ? `${item.verification_status}/${item.availability_status}`
                    : item.status || '-';

                  const location = [item.city, item.state].filter(Boolean).join(', ') || '-';
                  const aiScore = item.compatibility_score != null ? Math.round(item.compatibility_score) : '-';
                  const confidence = item.confidence != null ? `${Math.round(item.confidence)}%` : '-';
                  const reason = Array.isArray(item.reasons) ? item.reasons.join(' | ') : '-';

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.name || '-'}</TableCell>
                      <TableCell>{item.blood_group || '-'}</TableCell>
                      <TableCell>{item.organ_types?.join(', ') || item.organ_type || '-'}</TableCell>
                      <TableCell>{location}</TableCell>
                      <TableCell>
                        <Chip size="small" label={status} color="primary" />
                      </TableCell>
                      <TableCell>{aiScore}</TableCell>
                      <TableCell>{confidence}</TableCell>
                      <TableCell>{reason}</TableCell>
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

export default AcceptorSearchDonorsPage;
