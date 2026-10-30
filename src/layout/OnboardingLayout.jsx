import { Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";
import Auth from "../auth/Auth";
import { AppContext } from "../context/app-context";
import Spinner from "../components/common/Spinner";

export default function OnboardingLayout() {
  const { spinner } = useContext(AppContext);

  if (Auth.isUserAuthenticated()) {
    return <Navigate to="/users" replace />;
  }

  return (
    <>
      {spinner && <Spinner />}
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              <span className="text-[#FFB703]">Purple Box</span> Sports
            </h1>
            <p className="mt-1 text-sm text-white/50">Admin Console</p>
          </div>
          <Outlet />
        </div>
      </div>
    </>
  );
}
