import React, { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import SectionTitle from './SectionTitle';

interface DataPoint {
  time: number;
  price: number;
}

const TradingSimulator: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [balance, setBalance] = useState(1000.00);
  const [shares, setShares] = useState(0);

  // Initialize data
  useEffect(() => {
    // Start flat at 100 to give a clear baseline
    const initialData = Array.from({ length: 50 }, (_, i) => ({
      time: i,
      price: 100 
    }));
    setData(initialData);
    setCurrentPrice(100);
  }, []);

  // Live simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const lastPrice = prevData[prevData.length - 1].price;
        const change = (Math.random() - 0.5) * 3; // Random walk
        const newPrice = Math.max(10, lastPrice + change);
        
        const newData = [...prevData.slice(1), { time: Date.now(), price: newPrice }];
        setCurrentPrice(newPrice);
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBuy = () => {
    if (balance >= currentPrice) {
      setBalance(prev => prev - currentPrice);
      setShares(prev => prev + 1);
    }
  };

  const handleSell = () => {
    if (shares > 0) {
      setBalance(prev => prev + currentPrice);
      setShares(prev => prev - 1);
    }
  };

  const isProfit = currentPrice >= 100;

  // Calculate the offset for the gradient split (Green above 100, Red below 100)
  const gradientOffset = () => {
    if (data.length === 0) return 0;
    const prices = data.map(d => d.price);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
  
    if (max <= 100) return 0;
    if (min >= 100) return 1;
  
    return (max - 100) / (max - min);
  };
  
  const off = gradientOffset();

  return (
    <div className="py-20 px-4 bg-black">
      <SectionTitle title="محاكي التداول" />

      <div className="max-w-4xl mx-auto bg-[#0e121b] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-gray-800 p-2 rounded-lg">
               <Activity className="text-cyan-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">محاكي التداول</h3>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-64 w-full bg-gradient-to-b from-[#0e121b] to-[#050a10] relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="#4ade80" stopOpacity={1} />
                  <stop offset={off} stopColor="#f87171" stopOpacity={1} />
                </linearGradient>
              </defs>
              <YAxis domain={['auto', 'auto']} hide />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="url(#splitColor)" 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="absolute top-4 left-4 text-gray-500 text-xs">Live Market Data</div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-[#11151f]">
          {/* Balance */}
          <div className="bg-[#1a1f2e] p-4 rounded-xl border border-gray-700 text-center">
            <p className="text-gray-400 text-sm mb-1">الرصيد</p>
            <p className="text-2xl font-bold text-white">${balance.toFixed(2)}</p>
          </div>

          {/* Price */}
          <div className="bg-[#1a1f2e] p-4 rounded-xl border border-gray-700 text-center">
            <p className="text-gray-400 text-sm mb-1">سعر السهم</p>
            <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
               <span>${currentPrice.toFixed(2)}</span>
               {isProfit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
          </div>

          {/* Stocks */}
          <div className="bg-[#1a1f2e] p-4 rounded-xl border border-gray-700 text-center">
            <p className="text-gray-400 text-sm mb-1">الأسهم</p>
            <p className="text-2xl font-bold text-white">{shares}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-6 grid grid-cols-2 gap-4 border-t border-gray-800">
          <button 
            onClick={handleSell}
            disabled={shares === 0}
            className={`py-3 rounded-lg font-bold text-white transition-all ${
              shares === 0 ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            بيع
          </button>
          <button 
            onClick={handleBuy}
            disabled={balance < currentPrice}
            className={`py-3 rounded-lg font-bold text-white transition-all ${
              balance < currentPrice ? 'bg-gray-800 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            شراء
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingSimulator;