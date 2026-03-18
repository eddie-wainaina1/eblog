// Admin section: strips the public Navigation/Footer injected by root layout
// by wrapping in a full-height container. The root layout still provides
// ThemeRegistry, so MUI is available here.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
