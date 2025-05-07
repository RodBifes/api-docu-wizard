
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href?: string;
  items?: NavItem[];
}

const sidebarItems: NavItem[] = [
  {
    title: "Overview",
    href: "/",
  },
  {
    title: "API Reference",
    items: [
      {
        title: "Introduction",
        href: "/intro",
      },
      {
        title: "Authentication",
        href: "/auth",
      },
      {
        title: "Endpoints",
        items: [
          {
            title: "Products",
            href: "/endpoints/products",
          },
          {
            title: "Users",
            href: "/endpoints/users",
          },
          {
            title: "Orders",
            href: "/endpoints/orders",
          },
        ],
      },
    ],
  },
  {
    title: "Guides",
    items: [
      {
        title: "Getting Started",
        href: "/guides/getting-started",
      },
      {
        title: "API Best Practices",
        href: "/guides/best-practices",
      },
      {
        title: "Advanced Usage",
        href: "/guides/advanced",
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "FAQ",
        href: "/resources/faq",
      },
      {
        title: "Errors",
        href: "/resources/errors",
      },
      {
        title: "Sandbox",
        href: "/resources/sandbox",
      },
    ],
  },
];

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  useEffect(() => {
    // Update active item when location changes
    setActiveItem(location.pathname);
  }, [location.pathname]);

  return (
    <div className={cn("border-r bg-background", className)}>
      <ScrollArea className="h-full py-6">
        <div className="px-4">
          {sidebarItems.map((item, index) => (
            <div key={index} className="mb-4">
              {!item.items ? (
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start font-normal",
                    activeItem === item.href && "bg-accent"
                  )}
                  onClick={() => item.href && setActiveItem(item.href)}
                >
                  <Link to={item.href || "#"}>{item.title}</Link>
                </Button>
              ) : (
                <Accordion type="single" collapsible>
                  <AccordionItem value={`item-${index}`} className="border-none">
                    <AccordionTrigger className="py-1.5 text-base">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-1">
                        {item.items.map((subItem, subIndex) => (
                          !subItem.items ? (
                            <Button
                              key={subIndex}
                              variant="ghost"
                              asChild
                              className={cn(
                                "w-full justify-start pl-6 font-normal",
                                activeItem === subItem.href && "bg-accent"
                              )}
                              onClick={() => subItem.href && setActiveItem(subItem.href)}
                            >
                              <Link to={subItem.href || "#"}>{subItem.title}</Link>
                            </Button>
                          ) : (
                            <Accordion
                              key={subIndex}
                              type="single"
                              collapsible
                              className="pl-4"
                            >
                              <AccordionItem value={`subitem-${subIndex}`} className="border-none">
                                <AccordionTrigger className="py-1.5 text-sm">
                                  {subItem.title}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="flex flex-col gap-1">
                                    {subItem.items.map((nestedItem, nestedIndex) => (
                                      <Button
                                        key={nestedIndex}
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                          "w-full justify-start pl-8 font-normal",
                                          activeItem === nestedItem.href && "bg-accent"
                                        )}
                                        onClick={() => nestedItem.href && setActiveItem(nestedItem.href)}
                                      >
                                        <Link to={nestedItem.href || "#"}>{nestedItem.title}</Link>
                                      </Button>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
