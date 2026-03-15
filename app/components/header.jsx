import { LayoutDashboard } from "lucide-react"
import Image from "next/image"

export default function Header({ title = "Dashboard", icon: Icon = LayoutDashboard }) {
  return (
    <header className="flex items-center justify-between p-12 py-2 border-b border-gray-800 z-10">
      <div className="flex items-center space-x-4">
        <Icon className="w-6 h-6 text-white" />
        <h1 className="text-white text-xl font-semibold">{title}</h1>
      </div>

      {/* UNICALL Logo */}
      <div className="flex items-center">
        <Image
          src="/logo.svg"
          alt="Unicall Logo"
          width={40}
          height={40}
          className="w-22 h-22"
        />
      </div>
    </header>
  )
}
