import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import Auth from "../auth/Auth";
import { AppContext } from "../context/app-context";
import Spinner from "../components/common/Spinner";
import AdminSidebar from "../components/Sidebar/AdminSidebar";
import AdminHeader from "../components/Header/AdminHeader";

export default function DashboardLayout() {
  const { spinner } = useContext(AppContext);

  if (!Auth.isUserAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {spinner && <Spinner />}
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
