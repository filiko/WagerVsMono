"use client";

import Link from "next/link";
import Image from "next/image";
import { MenuIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";
import { SignUpModal } from "@/components/modals/SignUpModal";
import { LoginModal } from "@/components/modals/LoginModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSidebar } from "@/components/layout/SidebarProvider";

export function Header() {
  const { user, logout } = useAuth();
  const [query, setQuery] = React.useState("");
  const [signUpOpen, setSignUpOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();

  return (
    <header className="sticky z-20 top-0 py-4 sm:py-6 w-full bg-[#16182c]">
      <div className="flex h-16 justify-between items-center gap-3 sm:gap-[88px] px-3 sm:px-6">
        <div className="flex gap-8">
          <button
            type="button"
            aria-label="Toggle menu"
            aria-controls="primary-sidebar"
            aria-expanded={sidebarOpen}
            onClick={toggleSidebar}
            className="inline-flex size-9 items-center justify-center rounded-md text-white/70 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          >
            <MenuIcon className="size-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon/logo.svg"
              alt="Logo"
              width={88}
              height={32}
              priority
            />
          </Link>
        </div>

        <div className="relative ml-2 hidden flex-1 items-center sm:flex">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="pl-9 h-12     text-white/90 placeholder:text-white/40 border-white/10 bg-white/5"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              {user.picture && (
                <Image
                  src={user.picture}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <Button
                onClick={logout}
                className="h-10 sm:h-12 w-auto sm:w-[128px] rounded-md bg-red-600 px-4 sm:px-5 text-white text-sm sm:text-base hover:bg-red-700"
              >
                Logout
              </Button>
            </div>
          ) : (
            <>
              <div className="navbar-connect-button-container navbar-glow-teal">
                <div className="navbar-connect-glow navbar-connect-glow-sm" />
                <div className="navbar-connect-main-button">
                  <div className="navbar-grain-overlay" />
                  <Button
                    onClick={() => setSignUpOpen(true)}
                    className="h-10 sm:h-12 w-auto sm:w-[128px] rounded-md bg-[#1FE6E5] px-4 sm:px-5 text-sm sm:text-base text-black hover:bg-[#1FE6E5]/90"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
              <div className="navbar-connect-button-container navbar-glow-purple">
                <div className="navbar-connect-glow navbar-connect-glow-sm" />
                <div className="navbar-connect-main-button">
                  <div className="navbar-grain-overlay" />
                  <Button
                    onClick={() => setLoginOpen(true)}
                    className="h-10 sm:h-12 w-auto sm:w-[128px] rounded-md bg-[#9A2BD8] px-4 sm:px-5 text-sm sm:text-base text-white hover:bg-[#9A2BD8]/90"
                  >
                    Login
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        <SignUpModal open={signUpOpen} onOpenChange={setSignUpOpen} />
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    </header>
  );
}
