import React, { useState, useEffect } from "react";
import Header from "components/Header";
import useBearStore from "store/store";
import axios from "axios";
import baseUrl from "utils/baseUrl";
import catchErrors from "utils/catchErrors";
import toast, { Toaster } from "react-hot-toast";
import cookie from "js-cookie";

function SettingsPage() {
  const user = useBearStore((state) => state.user);
  const setUser = useBearStore((state) => state.setUser);
  const isAuthenticated = useBearStore((state) => state.isAuthenticated);

  // Notification States
  const [popupSetting, setPopupSetting] = useState(user?.newMessagePopup || false);
  const [loadingPopup, setLoadingPopup] = useState(false);

  // Password States
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setPopupSetting(user.newMessagePopup);
    }
  }, [user]);

  const handlePopupChange = async () => {
    setLoadingPopup(true);
    try {
      await axios.post(`${baseUrl}/api/profile/settings/messagePopup`, {}, {
        headers: { Authorization: cookie.get("token") }
      });
      setPopupSetting(!popupSetting);
      setUser({ ...user, newMessagePopup: !popupSetting }); // Update store
      toast.success("Notification settings updated!");
    } catch (error) {
      toast.error(catchErrors(error));
    } finally {
      setLoadingPopup(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      return toast.error("New passwords do not match");
    }

    setLoadingPass(true);
    try {
      await axios.post(`${baseUrl}/api/profile/settings/password`,
        { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
        { headers: { Authorization: cookie.get("token") } }
      );
      toast.success("Password updated successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (error) {
      toast.error(catchErrors(error));
    } finally {
      setLoadingPass(false);
    }
  };

  if (!isAuthenticated) return <></>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header user={user} />
      <Toaster position="top-center" />

      <div className="max-w-2xl mx-auto pt-24 px-4 pb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
              <p className="text-gray-500 text-sm mt-1">Receive popup for new messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={popupSetting}
                onChange={handlePopupChange}
                disabled={loadingPopup}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${popupSetting ? 'peer-checked:bg-purple-600' : ''}`}></div>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Security</h2>

          <form onSubmit={submitPasswordChange}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loadingPass}
                className={`px-6 py-2 rounded-lg text-white font-medium bg-purple-600 hover:bg-purple-700 transition shadow-sm ${loadingPass ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loadingPass ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
