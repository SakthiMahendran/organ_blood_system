import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material';

const ConfirmDialog = ({ open, title, description, confirmLabel = 'Confirm', onCancel, onConfirm }) => (
  <Dialog
    open={open}
    onClose={onCancel}
    maxWidth="xs"
    fullWidth
    slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)' } } }}
  >
    <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText sx={{ fontSize: '0.875rem' }}>{description}</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Stack direction="row" spacing={1}>
        <Button onClick={onCancel} sx={{ fontWeight: 600 }}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          {confirmLabel}
        </Button>
      </Stack>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
