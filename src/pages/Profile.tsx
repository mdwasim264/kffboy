import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, LogOut, ShieldCheck, Bell } from "lucide-react";
import { showSuccess } from "@/utils/toast";

const Profile = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    showSuccess("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-8 text-center border-b rounded-b-[40px] shadow-sm">
        <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full mx-auto flex items-center justify-center mb-4 border-4 border-orange-50 overflow-hidden">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={48} />
          )}
        </div>
        <h1 className="text-2xl font-black text-gray-800">{user?.displayName || "Delivery Partner"}</h1>
        <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">
          ID: {user?.uid.slice(0, 8).toUpperCase() || "N/A"}
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 flex items-center gap-4 border-b border-gray-50">
            <Phone className="text-gray-400" size={20} />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</p>
              <p className="text-sm font-bold text-gray-800">{user?.phoneNumber || "Not Linked"}</p>
            </div>
          </div>
          <div className="p-4 flex items-center gap-4">
            <Mail className="text-gray-400" size={20} />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
              <p className="text-sm font-bold text-gray-800">{user?.email || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <span className="font-bold text-gray-700">Security Settings</span>
            </div>
            <Bell size={18} className="text-gray-300" />
          </button>
        </div>

        <Button 
          onClick={handleLogout}
          className="w-full h-14 bg-red-50 text-red-600 hover:bg-red-100 font-black text-lg rounded-2xl border-2 border-red-100 flex gap-2"
        >
          <LogOut size={20} /> LOGOUT
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;