import ManagerNavbar from "@/components/manager/navbar";
import { useState } from "react";

const ManagerLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-row">
      <aside className="sticky top-0 space-y-5 h-fit">
        <div>
          <ManagerNavbar
            onCollapse={(collapsed) => setIsCollapsed(collapsed)}
          />
        </div>
      </aside>
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default ManagerLayout;
