import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          className="text-lg font-bold tracking-tight"
          to="/"
          onClick={closeMenu}
        >
          Shortly
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            to="/login"
          >
            Log in
          </Link>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            to="/register"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="inline-flex size-9 items-center justify-center rounded-md border md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              to="/login"
              onClick={closeMenu}
            >
              Log in
            </Link>
            <Link
              className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
              to="/register"
              onClick={closeMenu}
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
