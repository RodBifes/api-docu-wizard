
import React from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  useEffect(() => {
    // Show a success toast to indicate the page has been loaded
    toast({
      title: "Page Loaded",
      description: `You are now viewing the ${title || "documentation"} page.`,
      variant: "success",
    });
  }, [title, toast]);

  return (
    <div className="flex min-h-screen flex-col dark">
      <Navbar />
      <div className="flex flex-1">
        <div
          className={`${
            sidebarOpen ? "w-64 block" : "w-0 hidden"
          } transition-all duration-200 ease-in-out`}
        >
          <Sidebar className="h-[calc(100vh-4rem)]" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-3 top-20 md:hidden"
        >
          {sidebarOpen ? "←" : "→"}
        </Button>
        <main className="flex-1 p-6 md:p-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {title || location.pathname}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is a placeholder for the {title || location.pathname} documentation page.
                Content will be added soon.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default PlaceholderPage;
