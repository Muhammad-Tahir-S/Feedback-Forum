import { CirclePlus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import CreatePostForm from './CreatePostForm';

const CreatePostButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CirclePlus className="fill-card/30" /> Create A New Post
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby="create-post-dialog">
        <CreatePostForm onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostButton;
