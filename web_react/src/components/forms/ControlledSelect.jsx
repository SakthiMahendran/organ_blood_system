import { Controller } from 'react-hook-form';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';

const ControlledSelect = ({ name, label, control, options, multiple = false }) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <FormControl fullWidth error={Boolean(fieldState.error)}>
        <InputLabel>{label}</InputLabel>
        <Select {...field} label={label} multiple={multiple}>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {fieldState.error ? <FormHelperText>{fieldState.error.message}</FormHelperText> : null}
      </FormControl>
    )}
  />
);

export default ControlledSelect;
