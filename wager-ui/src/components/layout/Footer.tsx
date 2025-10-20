export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[rgb(14,14,16)] text-white/60">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-6 text-sm sm:px-6">
        <p>© {new Date().getFullYear()} Wager UI. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-white">
            Privacy
          </a>
          <a href="#" className="hover:text-white">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
