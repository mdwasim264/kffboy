import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { IndianRupee, Calendar, PackageCheck, Wallet } from "lucide-react";

const Earnings = () => {
  const [earnedOrders, setEarnedOrders] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ordersRef = collection(firestore, "orders");
    // Get all orders assigned to this delivery boy
    const q = query(
      ordersRef, 
      where("deliveryBoyId", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter orders that are either Delivered OR Cash is Collected
      const filtered = allOrders.filter((o: any) => o.status === "Delivered" || o.cashCollected === true);
      
      setEarnedOrders(filtered);
      
      const total = filtered.reduce((acc, curr: any) => {
        // Check all possible amount fields to be safe
        let amount = Number(curr.total || curr.totalAmount || curr.amount || 0);
        return acc + amount;
      }, 0);
      
      setTotalEarnings(total);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-orange-600 p-8 rounded-b-[40px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 -mr-10 -mt-10">
          <Wallet size={200} />
        </div>
        <p className="text-orange-100 font-bold uppercase tracking-widest text-xs mb-2 relative z-10">My Total Earnings</p>
        <h1 className="text-5xl font-black mb-6 flex items-center gap-2 relative z-10">
          <IndianRupee size={40} strokeWidth={3} /> {totalEarnings.toLocaleString()}
        </h1>
        <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2 relative z-10">
          <PackageCheck size={16} /> {earnedOrders.length} Successful Transactions
        </div>
      </div>

      <div className="p-6 space-y-4">
        <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2">
          <Wallet size={18} className="text-orange-600" /> Transaction History
        </h3>
        {earnedOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center">
            <p className="text-gray-400 font-medium">No earnings recorded yet.</p>
            <p className="text-xs text-gray-300 mt-1">Orders will appear here after cash collection or delivery.</p>
          </div>
        ) : (
          earnedOrders.map((order: any) => {
            const amount = Number(order.total || order.totalAmount || 0);
            return (
              <Card key={order.id} className="p-5 border-none shadow-md rounded-3xl flex items-center justify-between bg-white hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 font-medium">
                      {order.date || "Recently"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-gray-800">₹{amount}</p>
                  <p className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                    order.cashCollected ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {order.cashCollected ? 'Cash Collected' : 'Delivered'}
                  </p>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Earnings;