import { useState, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, auth, firestore } from "@/lib/firebase";
import BottomNav from "@/components/BottomNav";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Package, CheckCircle, Clock, IndianRupee } from "lucide-react";

const Dashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState({
    assigned: 0,
    delivered: 0,
    pending: 0,
    earnings: 0
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Online Status from RTDB
    const statusRef = ref(db, `delivery_boys/${user.uid}/online`);
    onValue(statusRef, (snapshot) => {
      setIsOnline(snapshot.val() || false);
    });

    // 2. Real Stats from Firestore
    const ordersRef = collection(firestore, "orders");
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      
      const assigned = docs.filter(d => d.status === "Pending" || d.status === "Picked").length;
      const delivered = docs.filter(d => d.status === "Delivered").length;
      const pending = docs.filter(d => d.status === "Out for Delivery").length;
      const earnings = docs
        .filter(d => d.status === "Delivered")
        .reduce((acc, curr) => acc + (Number(curr.totalAmount) || Number(curr.amount) || 0), 0);

      setStats({ assigned, delivered, pending, earnings });
    });

    return () => unsubscribe();
  }, []);

  const toggleOnline = async (checked: boolean) => {
    const user = auth.currentUser;
    if (!user) return;
    await update(ref(db, `delivery_boys/${user.uid}`), { online: checked });
    setIsOnline(checked);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-orange-600 p-6 rounded-b-[32px] shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-white text-xl font-bold italic">KFF PARTNER</h1>
            <p className="text-orange-100 text-sm">Namaste, {auth.currentUser?.displayName || 'Partner'}!</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 p-2 rounded-full px-4">
            <span className="text-white text-xs font-bold">{isOnline ? "ONLINE" : "OFFLINE"}</span>
            <Switch 
              checked={isOnline} 
              onCheckedChange={toggleOnline}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-white/10 border-none backdrop-blur-md text-white">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee size={16} />
              <span className="text-xs font-medium">Total Earnings</span>
            </div>
            <p className="text-2xl font-black">₹{stats.earnings}</p>
          </Card>
          <Card className="p-4 bg-white/10 border-none backdrop-blur-md text-white">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} />
              <span className="text-xs font-medium">Delivered</span>
            </div>
            <p className="text-2xl font-black">{stats.delivered}</p>
          </Card>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Live Summary</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Orders to Pick</p>
                <p className="text-xl font-bold text-gray-800">{stats.assigned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Out for Delivery</p>
                <p className="text-xl font-bold text-gray-800">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;