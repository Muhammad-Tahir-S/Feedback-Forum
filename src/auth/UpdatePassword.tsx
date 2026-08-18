import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { MIN_PASSWORD_LENGTH, passwordMessage } from '@/auth/passwordPolicy';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z
  .object({
    password: z.string().min(MIN_PASSWORD_LENGTH, { message: passwordMessage }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const UpdatePassword: React.FC = () => {
  const { updatePassword, isPasswordRecovery, loading } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const [message, setMessage] = React.useState<string | null>(null);
  const [completed, setCompleted] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !isPasswordRecovery && !completed) {
      navigate('/auth/reset-password', {
        replace: true,
        state: { authError: 'Open the password reset link from your email to continue.' },
      });
    }
  }, [completed, isPasswordRecovery, loading, navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setMessage(null);

    const { error } = await updatePassword(values.password);

    if (error) {
      form.setError('password', {
        type: 'manual',
        message: error.message,
      });
    } else {
      setCompleted(true);
      setMessage('Password updated successfully.');
      setTimeout(() => {
        navigate('/posts');
      }, 2000);
    }
  };

  if (loading || (!isPasswordRecovery && !completed)) {
    return <p className="text-muted-foreground">Checking reset link...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-card-foreground">Update password</h2>
      <p className="text-muted-foreground">Enter your new password below to update your account.</p>

      {message && <div className="mt-4 rounded-md bg-green-100 p-3 text-sm text-green-800">{message}</div>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-card-foreground">New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-input text-card-foreground border-border"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-card-foreground">Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-input text-card-foreground border-border"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              'Update password'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UpdatePassword;
