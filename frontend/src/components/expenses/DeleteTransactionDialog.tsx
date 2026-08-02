import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface DeleteTransactionDialogProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteTransactionDialog = ({
  open,
  title,
  onCancel,
  onConfirm,
}: DeleteTransactionDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        Delete Transaction
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          Are you sure you want to
          delete
          <strong> {title}</strong>?
        </DialogContentText>

        <DialogContentText
          sx={{ mt: 2 }}
        >
          This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>
          Cancel
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTransactionDialog;