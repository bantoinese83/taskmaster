import Link from "next/link"
import { APP_NAME } from "@/lib/constants"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {currentYear} {APP_NAME}. All rights reserved.
          </p>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Help
          </Link>
        </nav>
      </div>
    </footer>
  )
}
