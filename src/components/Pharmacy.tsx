import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  ShieldCheck,
  User,
  Ticket,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Medication, SaleItem, Token, Sale } from '../types';
import { supabaseService } from '../services/supabaseService';

export default function Pharmacy() {
  const [searchQuery, setSearchQuery] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'INSURANCE'>('CASH');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [medsData, tokensData] = await Promise.all([
          supabaseService.getMedications(),
          supabaseService.getTokens()
        ]);
        setMedications(medsData);
        setTokens(tokensData);
      } catch (error) {
        console.error('Error fetching pharmacy data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMedications = useMemo(() => {
    return medications.filter(med => 
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, medications]);

  const addToCart = (med: Medication) => {
    setCart(prev => {
      const existing = prev.find(item => item.medicationId === med.id);
      if (existing) {
        return prev.map(item => 
          item.medicationId === med.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { 
        medicationId: med.id, 
        name: med.name, 
        quantity: 1, 
        price: med.price, 
        total: med.price 
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.medicationId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.medicationId !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      const saleData: Omit<Sale, 'id'> = {
        items: cart,
        totalAmount: total,
        paymentMethod: paymentMethod,
        tokenNumber: selectedToken?.tokenNumber,
        patientName: selectedToken?.patientName || 'Walk-in',
        timestamp: new Date().toISOString(),
        status: 'COMPLETED'
      };

      await supabaseService.addSale(saleData);
      
      // Update local inventory (optional, could also refetch)
      const medsData = await supabaseService.getMedications();
      setMedications(medsData);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCart([]);
        setSelectedToken(null);
      }, 3000);
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left: Medication Selection */}
      <div className="flex-1 flex flex-col border-r border-gray-200">
        <div className="p-8 pb-4">
          <h2 className="text-3xl font-bold text-gray-900">Pharmacy Point of Sale</h2>
          <p className="text-gray-500 mt-1">Search and dispense medications to patients.</p>
        </div>

        <div className="px-8 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search medications by name, category, or barcode..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-gray-500 font-medium">Loading medications...</p>
            </div>
          ) : (
            filteredMedications.map((med) => (
              <button
                key={med.id}
                onClick={() => addToCart(med)}
                disabled={med.stock === 0}
                className={cn(
                  "bg-white p-5 rounded-2xl border border-gray-100 text-left hover:shadow-md transition-all group relative",
                  med.stock === 0 && "opacity-60 grayscale cursor-not-allowed"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {med.category}
                  </span>
                  <span className={cn(
                    "text-xs font-bold",
                    med.stock <= med.reorderThreshold ? "text-amber-600" : "text-emerald-600"
                  )}>
                    {med.stock} in stock
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                  {med.name}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{med.unit}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xl font-black text-gray-900">${med.price.toFixed(2)}</span>
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Current Order</h3>
          </div>
          <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {cart.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10" />
              </div>
              <p className="text-sm font-medium">Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.medicationId} className="flex gap-4 items-center animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex-1">
                  <h5 className="font-bold text-gray-900 text-sm">{item.name}</h5>
                  <p className="text-xs text-gray-500">${item.price.toFixed(2)} / unit</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                  <button 
                    onClick={() => updateQuantity(item.medicationId, -1)}
                    className="p-1 hover:bg-white rounded-lg transition-colors text-gray-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.medicationId, 1)}
                    className="p-1 hover:bg-white rounded-lg transition-colors text-gray-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.medicationId)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50/50 space-y-6 border-t border-gray-100">
          {/* Token Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Ticket className="w-3 h-3" /> Link to Token
            </label>
            <select 
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
              onChange={(e) => {
                const token = tokens.find(t => t.id === e.target.value);
                setSelectedToken(token || null);
              }}
              value={selectedToken?.id || ''}
            >
              <option value="">No Token (Walk-in)</option>
              {tokens.map(t => (
                <option key={t.id} value={t.id}>{t.tokenNumber} - {t.patientName}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <PaymentBtn 
                active={paymentMethod === 'CASH'} 
                onClick={() => setPaymentMethod('CASH')}
                icon={Banknote}
                label="Cash"
              />
              <PaymentBtn 
                active={paymentMethod === 'CARD'} 
                onClick={() => setPaymentMethod('CARD')}
                icon={CreditCard}
                label="Card"
              />
              <PaymentBtn 
                active={paymentMethod === 'INSURANCE'} 
                onClick={() => setPaymentMethod('INSURANCE')}
                icon={ShieldCheck}
                label="Insure"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax (5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-gray-900 pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || showSuccess}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3",
              showSuccess 
                ? "bg-emerald-500 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none"
            )}
          >
            {showSuccess ? (
              <>
                <CheckCircle2 className="w-6 h-6" />
                Order Completed
              </>
            ) : (
              <>
                Confirm Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentBtn({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
        active 
          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
          : "bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
  );
}
