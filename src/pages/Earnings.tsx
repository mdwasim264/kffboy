import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { IndianRupee, Calendar, PackageCheck } from "lucide-react";

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
        let amount = Number(curr.totalAmount || curr.amount || curr.total || 0);
        
        // Fallback calculation if amount is 0
        if (amount === 0 && curr.items) {
          const items = Array.isArray(curr.items) ? curr.items : Object.values(curr.items);
          amount = items.reduce((sum: number, item: any) => {
            const p = Number(item.price || 0);
            const q = Number(item.quantity || item.qty || 1);
            return sum + (p * q);
          }, 0);
        }
        
        return acc + amount;
      }, 0);
      
      setTotalEarnings(total);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-orange-600 p-8 rounded-b-[40px] text-white shadow-xl">
        <p className="text-orange-100 font-bold uppercase tracking-widest text-xs mb-2">My Total Earnings</p>
        <h1 className="text-5xl font-black mb-6 flex items-center gap-2">
          <IndianRupee size={40} strokeWidth={3} /> {totalEarnings.toLocaleString()}
        </h1>
        <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2">
          <PackageCheck size={16} /> {earnedOrders.length} Successful Transactions
        </div>
      </div>

      <div className="p-6 space-y-4">
        <h3 className="font-black text-gray-800 mb-2">My Recent Earnings</h3>
        {earnedOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center">
            <p className="text-gray-400 font-medium">No earnings yet.</p>
          </div>
        ) : (
          earnedOrders.map((order: any) => {
            let amount = Number(order.totalAmount || order.amount || order.total || 0);
            if (amount === 0 && order.items) {
              const items = Array.isArray(order.items) ? order.items : Object.values(order.items);
              amount = items.reduce((sum: number, item: any) => sum + (Number(item.price || 0) * Number(item.quantity || item.qty || 1)), 0);
            }
            return (
              <Card key={order.id} className="p-5 border-none shadow-md rounded-3xl flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 font-medium">
                      {order.cashCollectedAt?.seconds 
                        ? new Date(order.cashCollectedAt.seconds * 1000).toLocaleDateString() 
                        : (order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recently')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-gray-800">₹{amount}</p>
                  <p className={`text-[10px] font-bold uppercase ${order.status === 'Delivered' ? 'text-green-600' : 'text-blue-600'}`}>
                    {order.status === 'Delivered' ? 'Delivered' : 'Cash Collected'}
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