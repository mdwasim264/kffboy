import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPin, Phone, Navigation, IndianRupee, CheckCircle2, Check } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [isUpdatingCash, setIsUpdatingCash] = useState(false);

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

    return () => {
      unsubscribeFirestore();
    };
  }, [id, navigate]);

  const updateStatus = async (newStatus: string) => {
    if (!id || !auth.currentUser) return;
    try {
      const orderRef = doc(firestore, "orders", id);
      const updateData: any = { status: newStatus };
      
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

  const handleCashCollected = async () => {
    if (!id || !auth.currentUser || order.cashCollected || isUpdatingCash) return;
    
    setIsUpdatingCash(true);
    try {
      const orderRef = doc(firestore, "orders", id);
      const updateData: any = { 
        cashCollected: true,
        cashCollectedAt: new Date()
      };

      if (!order.deliveryBoyId) {
        updateData.deliveryBoyId = auth.currentUser.uid;
        updateData.deliveryBoyName = auth.currentUser.displayName || "Partner";
      }

      await updateDoc(orderRef, updateData);
      showSuccess("Cash collection confirmed!");
    } catch (error) {
      showError("Failed to update cash status");
    } finally {
      setIsUpdatingCash(false);
    }
  };

  const formatFullAddress = (addr: any) => {
    if (!addr) return "No Address Provided";
    if (typeof addr === 'string') return addr;
    
    // Collect all possible address parts
    const parts = [
      addr.houseNo || addr.house || addr.flatNo || addr.building,
      addr.street || addr.road || addr.area,
      addr.landmark ? `Near ${addr.landmark}` : null,
      addr.city,
      addr.pincode || addr.zip
    ].filter(Boolean); // Remove empty/null values

    return parts.length > 0 ? parts.join(", ") : "Address details missing";
  };

  if (!order) return <div className="h-screen flex items-center justify-center font-black text-orange-600">LOADING ORDER...</div>;

  const items = order.items ? (Array.isArray(order.items) ? order.items : Object.values(order.items)) : [];
  const totalAmount = order.totalAmount || order.amount || order.total || items.reduce((acc: number, item: any) => {
    const price = Number(item.price || 0);
    const qty = Number(item.quantity || item.qty || 1);
    return acc + (price * qty);
  }, 0);

  const customerName = order.customerName || order.address?.name || "Customer";
  const customerPhone = order.address?.phone || order.phone || order.customerPhone || "";

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
                {formatFullAddress(order.address)}
              </p>
            </div>
            <Button 
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatFullAddress(order.address))}`, '_blank')}
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
                <span className="font-bold text-gray-800">₹{(Number(item.price) || 0) * (Number(item.quantity || item.qty) || 1)}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t flex justify-between items-center">
            <span className="text-lg font-black text-gray-800">Total Amount</span>
            <span className="text-2xl font-black text-orange-600">₹{totalAmount}</span>
          </div>
        </div>

        {(order.paymentMethod === "COD" || !order.paymentMethod) && (
          <button 
            onClick={handleCashCollected}
            disabled={order.cashCollected || isUpdatingCash}
            className={cn(
              "w-full p-4 rounded-2xl flex items-center gap-4 border-2 transition-all active:scale-95",
              order.cashCollected 
                ? "bg-green-50 border-green-200" 
                : "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm",
              order.cashCollected ? "bg-green-500" : "bg-yellow-400"
            )}>
              {order.cashCollected ? <Check size={24} strokeWidth={3} /> : <IndianRupee size={24} />}
            </div>
            <div className="text-left">
              <p className={cn(
                "text-xs font-bold uppercase",
                order.cashCollected ? "text-green-700" : "text-yellow-700"
              )}>
                {order.cashCollected ? "Cash Collected" : "Collect Cash"}
              </p>
              <p className={cn(
                "text-xl font-black",
                order.cashCollected ? "text-green-900" : "text-yellow-900"
              )}>
                ₹{totalAmount}
              </p>
            </div>
            {order.cashCollected && (
              <div className="ml-auto bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                CONFIRMED
              </div>
            )}
          </button>
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
            disabled={!order.cashCollected && (order.paymentMethod === "COD" || !order.paymentMethod)}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-green-200 flex gap-2 disabled:opacity-50"
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