import { CirclePlus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

import CreatePostForm from './CreatePostForm';

const CreatePostButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!user?.id) return;
        setIsOpen(open);
      }}
      modal={false}
    >
      <DialogTrigger asChild>
        <Button size="sm" disabled={!user?.id}>
          <CirclePlus className="fill-card/30" /> Create A New Post
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby="create-post-dialog">
        {user?.id ? <CreatePostForm onClose={() => setIsOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostButton;
