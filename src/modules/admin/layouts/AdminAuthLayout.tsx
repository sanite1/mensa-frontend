// AdminAuthLayout: the a-root frame for the admin sign in page, no sidebar.
import { Outlet } from 'react-router-dom'

export function AdminAuthLayout() {
  return (
    <div className="a-root">
      <Outlet />
    </div>
  )
}
