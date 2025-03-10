import { BellIcon,MoonIcon, SunIcon } from "lucide-react";
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function App() {
  const [count, setCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with dark mode toggle */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">
            Shadcn + Tailwind Test
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <SunIcon className="h-5 w-5 text-amber-500" />
              <Switch 
                checked={isDarkMode} 
                onCheckedChange={toggleDarkMode} 
                id="dark-mode"
              />
              <MoonIcon className="h-5 w-5 text-indigo-500" />
            </div>
            <Button variant="outline" size="icon">
              <BellIcon className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Tabs component */}
        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="tailwind">Tailwind Features</TabsTrigger>
            <TabsTrigger value="counter">Counter</TabsTrigger>
          </TabsList>
          
          {/* Components Tab */}
          <TabsContent value="components" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Shadcn UI Components</CardTitle>
                <CardDescription>
                  Testing various components from the Shadcn UI library
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" />
                  <Label htmlFor="airplane-mode">Airplane Mode</Label>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  All components are working correctly if they're styled properly.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Tailwind Tab */}
          <TabsContent value="tailwind" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tailwind CSS Features</CardTitle>
                <CardDescription>
                  Testing various Tailwind CSS features and utilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Colors */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Colors</h3>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded bg-primary"></div>
                      <div className="w-10 h-10 rounded bg-secondary"></div>
                      <div className="w-10 h-10 rounded bg-accent"></div>
                      <div className="w-10 h-10 rounded bg-destructive"></div>
                    </div>
                  </div>
                  
                  {/* Typography */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Typography</h3>
                    <p className="text-xs">Extra Small</p>
                    <p className="text-sm">Small</p>
                    <p className="text-base">Base</p>
                    <p className="text-lg">Large</p>
                  </div>
                  
                  {/* Flex & Grid */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Flex & Grid</h3>
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                      <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Animations */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Animations</h3>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-purple-500 rounded-full animate-pulse"></div>
                      <div className="w-8 h-8 bg-pink-500 rounded-full animate-bounce"></div>
                      <div className="w-8 h-8 bg-indigo-500 rounded-full animate-spin"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Counter Tab */}
          <TabsContent value="counter" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Counter Example</CardTitle>
                <CardDescription>
                  The original counter example from the Vite template
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-4">{count}</div>
                  <Button 
                    onClick={() => setCount((count) => count + 1)}
                    className="animate-in zoom-in-50 duration-300"
                  >
                    Increment Count
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Click the button to increment the counter
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>
            Built with the latest versions of{" "}
            <a href="https://ui.shadcn.com" className="font-medium underline underline-offset-4" target="_blank" rel="noreferrer">
              shadcn/ui
            </a>{" "}
            and{" "}
            <a href="https://tailwindcss.com" className="font-medium underline underline-offset-4" target="_blank" rel="noreferrer">
              Tailwind CSS
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
