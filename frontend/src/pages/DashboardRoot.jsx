import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function DashboardRoot() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    pharmacy: user?.pharmacyName || "",
    title: user?.role === "owner" ? "Pharmacy Owner" : "Pharmacy Employee",
    bio: "",
    avatar: null,
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="pharma-main">
        <TopBar profileData={profileData} />
        <div className="pharma-content">
          <Outlet context={{ profileData, setProfileData }} />
        </div>
      </div>
    </div>
  );
}
