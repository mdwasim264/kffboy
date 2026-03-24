import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { IndianRupee, Calendar, PackageCheck } from "lucide-react";

const Earnings = () => {
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const ordersRef = collection(firestore, "orders");
    const q = query(ordersRef, where("status", "==", "Delivered"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDeliveredOrders(orders);
      
      const total = orders.reduce((acc, curr: any) => acc + (Number(curr.totalAmount) || Number(curr.amount) || 0), 0);
      setTotalEarnings(total);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-orange-600 p-8 rounded-b-[40px] text-white shadow-xl">
        <p className="text-orange-100 font-bold uppercase tracking-widest text-xs mb-2">Total Earnings</p>
        <h1 className="text-5xl font-black mb-6 flex items-center gap-2">
          <IndianRupee size={40} strokeWidth={3} /> {totalEarnings.toLocaleString()}
        </h1>
        <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2">
          <PackageCheck size={16} /> {deliveredOrders.length} Orders Delivered
        </div>
      </div>

      <div className="p-6 space-y-4">
        <h3 className="font-black text-gray-800 mb-2">Recent Deliveries</h3>
        {deliveredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center">
            <p className="text-gray-400 font-medium">No delivered orders yet.</p>
          </div>
        ) : (
          deliveredOrders.map((order) => (
            <Card key={order.id} className="p-5 border-none shadow-md rounded-3xl flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Order #{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500 font-medium">
                    {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-gray-800">₹{order.totalAmount || order.amount || 0}</p>
                <p className="text-[10px] font-bold text-green-600 uppercase">Delivered</p>
              </div>
            </Card>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Earnings;