import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { firestore, db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPin, Phone, Navigation, IndianRupee, CheckCircle2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [rtdbAddress, setRtdbAddress] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    
    const orderRef = doc(firestore, "orders", id);
    const unsubscribeFirestore = onSnapshot(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        setOrder({ id: snapshot.id, ...snapshot.data() });
      } else {
        showError("Order not found");
        navigate("/orders");
      }
    });

    const addressRef = ref(db, `orders/${id}/address`);
    const unsubscribeRTDB = onValue(addressRef, (snapshot) => {
      if (snapshot.exists()) {
        setRtdbAddress(snapshot.val());
      }
    });

    return () => {
      unsubscribeFirestore();
      unsubscribeRTDB();
    };
  }, [id, navigate]);

  const updateStatus = async (newStatus: string) => {
    if (!id || !auth.currentUser) return;
    try {
      const orderRef = doc(firestore, "orders", id);
      const updateData: any = { status: newStatus };
      
      // Agar order pick ho raha hai, toh delivery boy ki details add karo
      if (newStatus === "Picked") {
        updateData.deliveryBoyId = auth.currentUser.uid;
        updateData.deliveryBoyName = auth.currentUser.displayName || "Partner";
      }

      await updateDoc(orderRef, updateData);
      showSuccess(`Order status updated to ${newStatus}`);
    } catch (error) {
      showError("Failed to update status");
      console.error(error);
    }
  };

  const formatFullAddress = (addr: any) => {
    if (!addr) return "Loading Address...";
    if (typeof addr === 'string') return addr;
    return `${addr.street || ''}, ${addr.city || ''}, ${addr.pincode || ''}`.replace(/^, |, $/, '');
  };

  if (!order) return <div className="h-screen flex items-center justify-center font-black text-orange-600">LOADING ORDER...</div>;

  const customerName = order.customerName || rtdbAddress?.name || "Customer";
  const customerPhone = rtdbAddress?.phone || order.phone || "";
  const totalAmount = order.totalAmount || order.amount || 0;
  const items = order.items ? (Array.isArray(order.items) ? order.items : Object.values(order.items)) : [];

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="p-6 flex items-center gap-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black">Order Details</h1>
      </div>

      <div className="p-6 space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-gray-800">{customerName}</h2>
              <p className="text-gray-500 font-medium">{customerPhone}</p>
            </div>
            {customerPhone && (
              <a href={`tel:${customerPhone}`} className="p-4 bg-green-100 text-green-600 rounded-2xl">
                <Phone size={24} />
              </a>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="text-orange-600 shrink-0 mt-1" size={20} />
              <p className="text-sm font-medium text-gray-700 leading-relaxed">
                {formatFullAddress(rtdbAddress)}
              </p>
            </div>
            <Button 
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatFullAddress(rtdbAddress))}`, '_blank')}
              className="w-full bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold rounded-xl h-12 gap-2"
            >
              <Navigation size={18} /> OPEN IN GOOGLE MAPS
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-gray-800 uppercase tracking-wider text-sm">Order Items</h3>
          <div className="space-y-3">
            {items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded flex items-center justify-center text-xs font-bold">
                    {item.quantity || item.qty || 1}x
                  </span>
                  <span className="font-bold text-gray-700">{item.name || item.title}</span>
                </div>
                <span className="font-bold text-gray-800">₹{(item.price || 0) * (item.quantity || item.qty || 1)}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t flex justify-between items-center">
            <span className="text-lg font-black text-gray-800">Total Amount</span>
            <span className="text-2xl font-black text-orange-600">₹{totalAmount}</span>
          </div>
        </div>

        {(order.paymentMethod === "COD" || !order.paymentMethod) && (
          <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white">
              <IndianRupee size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-700 uppercase">Collect Cash</p>
              <p className="text-xl font-black text-yellow-900">₹{totalAmount}</p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {(order.status === "Pending" || !order.status) && (
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