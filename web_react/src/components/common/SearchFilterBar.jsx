import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { InputAdornment, MenuItem, Stack, TextField } from '@mui/material';

const SearchFilterBar = ({ onSearch, searchValue = '', searchPlaceholder = 'Search...', filters = [], filterValues = {}, onFilterChange }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
    {onSearch && (
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
        sx={{ minWidth: 240 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, opacity: 0.5 }} />
              </InputAdornment>
            ),
          },
        }}
      />
    )}

    {filters.map((filter) => (
      <TextField
        key={filter.name}
        select
        size="small"
        label={filter.label}
        value={filterValues[filter.name] || ''}
        onChange={(e) => onFilterChange?.(filter.name, e.target.value)}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All</MenuItem>
        {filter.options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
    ))}
  </Stack>
);

export default SearchFilterBar;
