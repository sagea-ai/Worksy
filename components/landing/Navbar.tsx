"use client";

import { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { buttonVariants } from "../ui/button";
import { Menu } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import { LogoIcon } from "../Icons";
import Link from "next/link";

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: "#features",
    label: "Features",
  },
  {
    href: "#testimonials",
    label: "Testimonials",
  },
  {
    href: "#pricing",
    label: "Pricing",
  },
  {
    href: "#faq",
    label: "FAQ",
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
        <NavigationMenu className="mx-auto">
          <NavigationMenuList className="container h-14 px-4 w-screen flex justify-between ">
            <NavigationMenuItem className="font-bold flex">
              <a
                rel="noreferrer noopener"
                href="/"
                className="ml-2 font-bold text-xl flex"
              >
                Worksy
              </a>
            </NavigationMenuItem>
            <span className="flex md:hidden"></span>
            <nav className="hidden md:flex gap-2">
              <a href="#" className="text-[17px] font-medium hover:underline">
                Features
              </a>
              <a href="#" className="text-[17px] font-medium hover:underline">
                Testimonials
              </a>
              <a href="#" className="text-[17px] font-medium hover:underline">
                Pricing
              </a>
              <a href="#" className="text-[17px] font-medium hover:underline">
                FAQ
              </a>
            </nav>
            <span className="hidden md:flex gap-2">
              {isSignedIn ? (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/dashboard"
                    className="border border-black rounded px-2 py-1 text-[17px] font-medium hover:shadow-2xl hover:shadow-gray-400 transition-shadow duration-300 cursor-pointer bg-black text-white"
                  >
                    Dashboard
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <div className="border border-black rounded px-2 py-1 text-[17px] font-medium hover:shadow-2xl hover:shadow-gray-400 transition-shadow duration-300 cursor-pointer">
                      Sign In
                    </div>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <div className="bg-black text-white rounded px-2 py-1 text-[17px] font-medium hover:shadow-2xl hover:shadow-gray-400 transition-shadow duration-300 cursor-pointer">
                      Sign Up
                    </div>
                  </SignUpButton>
                </>
              )}
            </span>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
    );
  }
  return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-14 px-4 w-screen flex justify-between ">
          <NavigationMenuItem className="font-bold flex">
            <a
              rel="noreferrer noopener"
              href="/"
              className="ml-2 font-bold text-xl flex"
            >
              <LogoIcon />
              Worksy
            </a>
          </NavigationMenuItem>

          {/* mobile */}
          <span className="flex md:hidden">
            <ModeToggle />

            <Sheet
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <SheetTrigger className="px-2">
                <div onClick={() => setIsOpen(true)}>
                  <Menu className="flex md:hidden h-5 w-5" />
                  <span className="sr-only">Menu Icon</span>
                </div>
              </SheetTrigger>

              <SheetContent side={"left"}>
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">
                    Worksy
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  {routeList.map(({ href, label }: RouteProps) => (
                    <a
                      rel="noreferrer noopener"
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      {label}
                    </a>
                  ))}
                  {isSignedIn ? (
                    <div className="flex flex-col gap-2 w-full items-center">
                      <Link 
                        href="/dashboard"
                        className={`w-full text-center ${buttonVariants({
                          variant: "default",
                        })}`}
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <SignInButton mode="modal">
                        <div className={`w-full border text-center ${buttonVariants({
                          variant: "secondary",
                        })}`}>
                          Sign In
                        </div>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <div className={`w-full border text-center ${buttonVariants({
                          variant: "default",
                        })}`}>
                          Sign Up
                        </div>
                      </SignUpButton>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          {/* desktop */}
          <nav className="hidden md:flex gap-2">
            {routeList.map((route: RouteProps, i) => (
              <a
                rel="noreferrer noopener"
                href={route.href}
                key={i}
                className={`text-[17px] ${buttonVariants({
                  variant: "ghost",
                })}`}
              >
                {route.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex gap-2">
            {isSignedIn ? (
              <div className="flex items-center gap-2">
                <Link 
                  href="/dashboard"
                  className={buttonVariants({ variant: "default" })}
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <>
                <SignInButton mode="modal">
                  <div className={`border ${buttonVariants({ variant: "secondary" })}`}>
                    Sign In
                  </div>
                </SignInButton>
                <SignUpButton mode="modal">
                  <div className={`border ${buttonVariants({ variant: "default" })}`}>
                    Sign Up
                  </div>
                </SignUpButton>
              </>
            )}

            <ModeToggle />
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
