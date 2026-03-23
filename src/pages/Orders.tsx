import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const ordersRef = ref(db, "orders");
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setOrders(orderList);
      } else {
        // Mock data for UI testing if Firebase is empty
        setOrders([
          { id: "KFF101", customerName: "Rahul Sharma", address: "Salt Lake, Sector 5, Kolkata", amount: 350, status: "Pending", distance: "2.5 km" },
          { id: "KFF102", customerName: "Priya Das", address: "Park Street, Kolkata", amount: 520, status: "Picked", distance: "4.1 km" },
          { id: "KFF103", customerName: "Amit Kumar", address: "Howrah Bridge Area", amount: 210, status: "Delivered", distance: "1.2 km" },
        ]);
      }
    });
  }, []);

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
        {filteredOrders.map((order) => (
          <Link to={`/order/${order.id}`} key={order.id}>
            <Card className="p-4 border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden relative">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-bold text-orange-600 mb-1">#{order.id}</p>
                  <h3 className="text-lg font-bold text-gray-800">{order.customerName}</h3>
                </div>
                <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                  order.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                  order.status === "Picked" ? "bg-blue-100 text-blue-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {order.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-gray-500">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <p className="text-sm line-clamp-1">{order.address}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                    <ChevronRight size={14} className="text-orange-500" />
                    {order.distance}
                  </div>
                  <div className="text-gray-800 text-sm font-black">
                    ₹{order.amount} (COD)
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-orange-50 text-orange-600 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <Phone size={16} /> Call
                </button>
                <button className="flex-1 bg-orange-600 text-white py-2 rounded-xl font-bold text-sm">
                  View Details
                </button>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Orders;