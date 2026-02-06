import AdminNavbar from "@/components/admin/navbar";
import { useState } from "react";

const AdminLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-row min-h-screen">
      <div className="sticky top-0 h-screen z-10">
        <AdminNavbar onCollapse={(collapsed) => setIsCollapsed(collapsed)} />
      </div>
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </div>
    </div>
  )
};

export default AdminLayout;
