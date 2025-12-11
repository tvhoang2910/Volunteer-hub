import ManagerNavbar from "@/components/manager/navbar";
import { useState } from "react";

const ManagerLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (

    <div className="flex flex-row">
      <div>
        <ManagerNavbar onCollapse={(collapsed) => setIsCollapsed(collapsed)} />
      </div>
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </div>
    </div>
  );
};

export default ManagerLayout;
