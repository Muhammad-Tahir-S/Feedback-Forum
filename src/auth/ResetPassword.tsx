import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const ResetPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const [message, setMessage] = React.useState<string | null>(null);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setMessage(null);

    const { error } = await resetPassword(values.email);

    if (error) {
      form.setError("email", {
        type: "manual",
        message: error.message,
      });
    } else {
      setMessage("Check your email for the password reset link.");
      form.reset();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-card-foreground">Reset password</h2>
      <p className="text-muted-foreground">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {message && (
        <div className="mt-4 rounded-md bg-green-100 p-3 text-sm text-green-800">
          {message}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-card-foreground">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
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
                Sending reset link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link to="/auth/signin" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;
