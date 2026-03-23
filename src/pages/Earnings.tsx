import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { IndianRupee, TrendingUp, Calendar } from "lucide-react";

const Earnings = () => {
  const earningsData = [
    { date: "Today", amount: 450, orders: 5 },
    { date: "Yesterday", amount: 820, orders: 9 },
    { date: "This Week", amount: 4200, orders: 42 },
    { date: "This Month", amount: 18500, orders: 180 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-orange-600 p-8 rounded-b-[40px] text-white shadow-xl">
        <p className="text-orange-100 font-bold uppercase tracking-widest text-xs mb-2">Total Balance</p>
        <h1 className="text-5xl font-black mb-6 flex items-center gap-2">
          <IndianRupee size={40} strokeWidth={3} /> 18,500
        </h1>
        <div className="flex gap-4">
          <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
            <TrendingUp size={16} /> +12% from last month
          </div>
        </div>
      </div>

      <div className="p-6 -mt-8 space-y-4">
        {earningsData.map((item, index) => (
          <Card key={index} className="p-5 border-none shadow-md rounded-3xl flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{item.date}</p>
                <p className="text-xs text-gray-500 font-medium">{item.orders} Orders Delivered</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-gray-800">₹{item.amount}</p>
              <p className="text-[10px] font-bold text-green-600 uppercase">Paid</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="p-6">
        <h3 className="font-black text-gray-800 mb-4">Recent Payouts</h3>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400 font-medium">No recent payouts found.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Earnings;