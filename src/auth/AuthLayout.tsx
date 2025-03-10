import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";

function AuthLayout() {
  return (
    <div className="flex h-[100dvh] w-[100dvw] flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <Link
          to="/"
          className="text-2xl font-bold text-primary hover:underline"
        >
          Featurebase
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Please sign in or create an account.
        </p>
      </div>

      <Card className="w-full min-h-0 flex-1 max-w-md border-border bg-card">
       
        <CardContent>
          <Outlet />
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthLayout;
