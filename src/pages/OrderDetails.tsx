import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPin, Phone, Navigation, IndianRupee, CheckCircle2 } from "lucide-react";
import { showSuccess } from "@/utils/toast";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const orderRef = ref(db, `orders/${id}`);
    onValue(orderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOrder({ id, ...data });
      } else {
        // Mock for UI
        setOrder({
          id,
          customerName: "Rahul Sharma",
          phone: "+91 9876543210",
          address: "Salt Lake, Sector 5, Kolkata, West Bengal 700091",
          items: [
            { name: "Chicken Roll", qty: 2, price: 120 },
            { name: "Egg Mughlai", qty: 1, price: 110 }
          ],
          amount: 350,
          status: "Pending",
          paymentType: "COD"
        });
      }
    });
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    await update(ref(db, `orders/${id}`), { status: newStatus });
    showSuccess(`Order status updated to ${newStatus}`);
  };

  if (!order) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black">Order Details</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Customer Info */}
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-gray-800">{order.customerName}</h2>
              <p className="text-gray-500 font-medium">{order.phone}</p>
            </div>
            <a href={`tel:${order.phone}`} className="p-4 bg-green-100 text-green-600 rounded-2xl">
              <Phone size={24} />
            </a>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="text-orange-600 shrink-0 mt-1" size={20} />
              <p className="text-sm font-medium text-gray-700 leading-relaxed">{order.address}</p>
            </div>
            <Button className="w-full bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold rounded-xl h-12 gap-2">
              <Navigation size={18} /> OPEN IN GOOGLE MAPS
            </Button>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <h3 className="font-black text-gray-800 uppercase tracking-wider text-sm">Order Items</h3>
          <div className="space-y-3">
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded flex items-center justify-center text-xs font-bold">
                    {item.qty}x
                  </span>
                  <span className="font-bold text-gray-700">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t flex justify-between items-center">
            <span className="text-lg font-black text-gray-800">Total Amount</span>
            <span className="text-2xl font-black text-orange-600">₹{order.amount}</span>
          </div>
        </div>

        {/* COD Alert */}
        {order.paymentType === "COD" && (
          <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white">
              <IndianRupee size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-700 uppercase">Collect Cash</p>
              <p className="text-xl font-black text-yellow-900">₹{order.amount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {order.status === "Pending" && (
          <Button 
            onClick={() => updateStatus("Picked")}
            className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-orange-200"
          >
            ACCEPT & PICK ORDER
          </Button>
        )}
        {order.status === "Picked" && (
          <Button 
            onClick={() => updateStatus("Out for Delivery")}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-blue-200"
          >
            START DELIVERY
          </Button>
        )}
        {order.status === "Out for Delivery" && (
          <Button 
            onClick={() => updateStatus("Delivered")}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-green-200 flex gap-2"
          >
            <CheckCircle2 /> MARK AS DELIVERED
          </Button>
        )}
        {order.status === "Delivered" && (
          <div className="text-center p-4 bg-green-50 text-green-700 font-black rounded-2xl border-2 border-green-200">
            ORDER DELIVERED SUCCESSFULLY!
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;