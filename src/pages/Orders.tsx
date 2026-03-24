import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetching from Firestore 'orders' collection
    const ordersRef = collection(firestore, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(orderList);
    }, (error) => {
      console.error("Error fetching orders from Firestore:", error);
    });

    return () => unsubscribe();
  }, []);

  const formatAddress = (addr: any) => {
    if (!addr) return "No Address";
    if (typeof addr === 'string') return addr;
    return `${addr.street || ''}, ${addr.city || ''}`.replace(/^, /, '');
  };

  const filteredOrders = filter === "All" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-6 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-black text-gray-800 mb-4">My Orders</h1>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["All", "Pending", "Picked", "Delivered"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                filter === f ? "bg-orange-600 text-white shadow-md" : "bg-gray-100 text-gray-500"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold">No orders found</div>
        ) : (
          filteredOrders.map((order) => (
            <Card 
              key={order.id} 
              onClick={() => navigate(`/order/${order.id}`)}
              className="p-4 border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden relative cursor-pointer active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-bold text-orange-600 mb-1">#{order.id.slice(-6).toUpperCase()}</p>
                  <h3 className="text-lg font-bold text-gray-800">{order.customerName || order.address?.name || "Customer"}</h3>
                </div>
                <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                  order.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                  order.status === "Picked" ? "bg-blue-100 text-blue-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {order.status || "Pending"}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-gray-500">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <p className="text-sm line-clamp-1">{formatAddress(order.address)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-gray-800 text-sm font-black">
                    ₹{order.totalAmount || order.amount || 0} ({order.paymentMethod || "COD"})
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <a 
                  href={`tel:${order.address?.phone || order.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-orange-50 text-orange-600 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors"
                >
                  <Phone size={16} /> Call
                </a>
                <div className="flex-1 bg-orange-600 text-white py-2 rounded-xl font-bold text-sm text-center">
                  View Details
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Orders;