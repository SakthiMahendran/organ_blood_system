import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';

const ControlledTextField = ({ name, control, rules, ...props }) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        {...props}
        fullWidth
        error={Boolean(fieldState.error)}
        helperText={fieldState.error?.message || props.helperText}
      />
    )}
  />
);

export default ControlledTextField;
