
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "./ModeToggle";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">API Docu Wizard</h1>
        </div>
        <div className="ml-4 flex items-center">
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Docs
            </Link>
            <Link to="/generator" className="text-sm font-medium transition-colors hover:text-primary">
              Generate API
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex md:w-80">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documentation..."
                className="w-full rounded-md bg-background pl-8 md:w-80"
              />
            </div>
          </div>
          <ModeToggle />
          <Button variant="outline" className="ml-2">Sign In</Button>
          <Button className="ml-2">Get Started</Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
