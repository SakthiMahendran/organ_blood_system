import { Controller } from 'react-hook-form';
import { FormControlLabel, Switch } from '@mui/material';

const ControlledSwitch = ({ name, control, label }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControlLabel
        label={label}
        control={<Switch checked={Boolean(field.value)} onChange={(event) => field.onChange(event.target.checked)} />}
      />
    )}
  />
);

export default ControlledSwitch;
