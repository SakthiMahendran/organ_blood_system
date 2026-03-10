import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { IconButton, InputAdornment } from '@mui/material';
import { useState } from 'react';

import ControlledTextField from './ControlledTextField';

const ControlledPasswordField = ({ name, control, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <ControlledTextField
      name={name}
      control={control}
      type={showPassword ? 'text' : 'password'}
      autoComplete="current-password"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              edge="end"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={toggleVisibility}
            >
              {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

export default ControlledPasswordField;
