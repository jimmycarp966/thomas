import Sidebar from '@/components/Sidebar'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background dark flex">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto bg-background-dark relative">
        <div className="relative z-10 max-w-[1400px] mx-auto p-8 md:p-12 flex flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  )
}
