import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const NewProjectModal = ({ open, onClose, onCreate }: NewProjectModalProps) => {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>New Project</AlertDialogTitle>
        </AlertDialogHeader>
        <Input
          autoFocus
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setName(''); onClose(); }}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCreate} disabled={!name.trim()}>
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NewProjectModal;
