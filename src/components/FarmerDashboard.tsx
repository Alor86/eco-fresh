import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  Trash2, 
  Check, 
  TrendingUp, 
  Layers, 
  MapPin, 
  Truck, 
  User, 
  Package, 
  X, 
  DollarSign, 
  LogOut, 
  Tag, 
  Wheat,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Product, Farmer, Order, User as UserType } from '../types';

interface FarmerDashboardProps {
  currentUser: UserType;
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Omit<Product, 'id' | 'farmerId' | 'farmerName'>) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: 'Pending' | 'Shipped' | 'Delivered') => void;
  onLogout: () => void;
  onSwitchToConsumer: () => void;
}

export default function FarmerDashboard({
  currentUser,
  products,
  orders,
  onAddProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onLogout,
  onSwitchToConsumer
}: FarmerDashboardProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  
  // New product form visibility
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('lb'); // default unit
  const [category, setCategory] = useState<Product['category']>('Vegetables');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('20');
  const [imagePreset, setImagePreset] = useState<string>('tomatoes');
  const [isOrganic, setIsOrganic] = useState(true);

  // Errors
  const [errorCode, setErrorCode] = useState('');

  // Preset Image links mapping
  const IMAGE_PRESETS: Record<string, string> = {
    tomatoes: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
    kale: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?auto=format&fit=crop&w=600&q=80',
    honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    milk: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    eggs: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80',
    berries: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
    bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    grains: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    millets: 'https://images.unsplash.com/photo-1574325131876-a7999788d8f0?auto=format&fit=crop&w=600&q=80'
  };

  // Farmer specific filter (look up products listed by this farmer name or ID if matching, or Silas initially if using demo farmer)
  const isDemoSilas = currentUser.email === 'silas@acresandoak.com';
  const farmerIdMatch = isDemoSilas ? 'f1' : (isDemoSilas ? 'f1' : 'f1'); // map silas to 'f1', defaults to 'f1' for simplicity to see products, or custom user id

  // Determine which items are ours
  // Let's filter products whose owner matches silas or this farmer's id/email.
  const myFarmerId = isDemoSilas ? 'f1' : currentUser.id;
  
  const myProducts = products.filter(p => p.farmerId === myFarmerId);

  // Filter orders containing items of this farmer
  // Let's analyze orders and extract the ones that contain items owned by our farmer id
  const myOrders = orders.filter(order => 
    order.items.some(item => item.farmerId === myFarmerId)
  );

  // Calculate Metrics
  const activeListingsCount = myProducts.length;
  
  // Total Revenue: sum of item value sold (where order does not necessarily have to be delivered, just placed)
  const totalSalesRevenue = orders.reduce((sum, order) => {
    // only count items in order belonging to our farmer
    const ourItemsTotal = order.items
      .filter(item => item.farmerId === myFarmerId)
      .reduce((s, item) => s + (item.price * item.quantity), 0);
    return sum + ourItemsTotal;
  }, 0);

  const pendingFulfillments = myOrders.filter(o => o.status === 'Pending').length;

  // System physical tab history & custom back/home/recents navigation
  const tabHistoryRef = React.useRef<('overview' | 'products' | 'orders')[]>(['overview']);

  React.useEffect(() => {
    const currentHist = tabHistoryRef.current;
    if (currentHist[currentHist.length - 1] !== activeTab) {
      if (currentHist.length > 1 && currentHist[currentHist.length - 2] === activeTab) {
        currentHist.pop();
      } else {
        currentHist.push(activeTab);
      }
    }
  }, [activeTab]);

  React.useEffect(() => {
    const handleSystemNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      const action = customEvent.detail?.action;
      if (!action) return;

      if (action === 'back') {
        if (showForm) {
          setShowForm(false);
          return;
        }

        const hist = tabHistoryRef.current;
        if (hist.length > 1) {
          const prevTab = hist[hist.length - 2];
          setActiveTab(prevTab);
        } else if (activeTab !== 'overview') {
          setActiveTab('overview');
        }
      } else if (action === 'home') {
        setShowForm(false);
        tabHistoryRef.current = ['overview'];
        setActiveTab('overview');
      } else if (action === 'recents') {
        setShowForm(false);
        setActiveTab('orders');
      }
    };

    window.addEventListener('system-navigation', handleSystemNav);
    return () => {
      window.removeEventListener('system-navigation', handleSystemNav);
    };
  }, [showForm, activeTab]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode('');

    if (!name.trim()) {
      setErrorCode('Produce Name is required.');
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setErrorCode('Provide a valid price.');
      return;
    }
    if (isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      setErrorCode('Provide a valid stock quantity.');
      return;
    }

    onAddProduct({
      name: name.trim(),
      price: parseFloat(price),
      unit: unit.trim() || 'lb',
      category: category,
      image: IMAGE_PRESETS[imagePreset] || IMAGE_PRESETS.vegetables,
      description: description.trim() || 'No description supplied. Grade-A handpicked fresh produce.',
      stock: parseInt(stock),
      isOrganic: isOrganic
    });

    // Reset Form
    setName('');
    setPrice('');
    setUnit('lb');
    setDescription('');
    setStock('20');
    setIsOrganic(true);
    setShowForm(false);
  };

  return (
    <div className="h-full bg-brand-bg flex flex-col font-sans select-none relative overflow-hidden">
      
      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-lg border border-orange-700">
              {currentUser.farmDetails?.farmName ? currentUser.farmDetails.farmName.charAt(0) : 'F'}
            </div>
            <div>
              <p className="text-xs text-orange-700 font-bold tracking-wider">FARMER PORTAL</p>
              <h3 className="text-base font-bold text-gray-950" id="farm-portal-heading">
                {currentUser.farmDetails?.farmName || 'My Harvest Farm'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToConsumer}
              id="switch-to-consumer-btn"
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-all"
            >
              Shop as Buyer
              <ChevronRight size={14} />
            </button>

            <button
              onClick={onLogout}
              id="logout-btn"
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content body */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 mt-4 flex-grow flex flex-col overflow-y-auto scrollbar-none pb-20">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            id="tab-overview"
            className={`pb-3 text-sm font-bold tracking-tight border-b-2 transition-all ${
              activeTab === 'overview' 
                ? 'border-orange-600 text-orange-700' 
                : 'border-transparent text-gray-400 hover:text-gray-800'
            }`}
          >
            Overview & Metrics
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            id="tab-my-products"
            className={`pb-3 text-sm font-bold tracking-tight border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'products' 
                ? 'border-orange-600 text-orange-700' 
                : 'border-transparent text-gray-400 hover:text-gray-800'
            }`}
          >
            Active Listings
            <span className="bg-orange-100 text-orange-850 text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono">
              {activeListingsCount}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            id="tab-my-orders"
            className={`pb-3 text-sm font-bold tracking-tight border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'orders' 
                ? 'border-orange-600 text-orange-700' 
                : 'border-transparent text-gray-400 hover:text-gray-800'
            }`}
          >
            Buyer Orders Hub
            {pendingFulfillments > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {pendingFulfillments}
              </span>
            )}
          </button>
        </div>

        {/* Content Screens */}
        {activeTab === 'overview' && (
          <div className="space-y-6" id="dashboard-overview">
            
            {/* Metas Bento Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                  <DollarSign size={24} className="stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Sales Revenue</p>
                  <h4 className="text-2xl font-extrabold font-display text-gray-900 mt-1">${totalSalesRevenue.toFixed(2)}</h4>
                  <p className="text-[10px] text-emerald-605 mt-0.5 font-semibold">Direct transparent earnings</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-emerald-700 flex items-center justify-center border border-green-100">
                  <Package size={22} className="stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Active Store Produce</p>
                  <h4 className="text-2xl font-extrabold font-display text-gray-900 mt-1">{activeListingsCount} listings</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Offered to marketplace</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                  <Truck size={22} className="stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Pending Shipment</p>
                  <h4 className="text-2xl font-extrabold font-display text-gray-900 mt-1">{pendingFulfillments} deliveries</h4>
                  <p className="text-[10px] text-red-605 mt-0.5 font-semibold">Awaiting packaging</p>
                </div>
              </div>
            </div>

            {/* Farm Profile story information */}
            <div className="bg-gradient-to-tr from-emerald-50/50 to-emerald-100/30 rounded-2xl p-6 border border-emerald-500/10 shadow-inner">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-display font-bold text-emerald-950 text-lg flex items-center gap-2">
                    <Wheat size={18} className="text-emerald-700" />
                    Verified Farmer Details
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {currentUser.farmDetails?.story || 'Growing premium food products with full ecological audit and zero pesticide residue.'}
                  </p>
                  
                  <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-gray-500">
                    <span className="flex items-center gap-1 text-emerald-800 uppercase tracking-widest font-bold">
                      <Sparkles size={12} className="text-emerald-700" />
                      Soil: Living Organic
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {currentUser.farmDetails?.location || 'Verdant Fields, OR'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('products');
                    setShowForm(true);
                  }}
                  id="list-produce-start-btn"
                  className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <PlusCircle size={15} />
                  List New Harvest
                </button>
              </div>
            </div>

            {/* Recent Orders Overview Panel */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display font-bold text-gray-950 text-[15px]">Recent Logistical Requests</h4>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-0.5"
                >
                  Manage all
                  <ChevronRight size={12} />
                </button>
              </div>

              {myOrders.length === 0 ? (
                <div className="py-8 text-center text-gray-400 font-medium text-sm">
                  You do not have any incoming orders yet. Place some orders on the Consumer Page!
                </div>
              ) : (
                <div className="divide-y divide-gray-150">
                  {myOrders.slice(-3).reverse().map(order => {
                    // Extract items listed by us
                    const ourItems = order.items.filter(item => item.farmerId === myFarmerId);
                    const itemValueSum = ourItems.reduce((s, it) => s + (it.price * it.quantity), 0);
                    
                    return (
                      <div key={order.id} className="py-3 flex items-center justify-between font-medium text-sm gap-4">
                        <div>
                          <p className="text-gray-900 font-semibold text-[13px]">{order.buyerName}</p>
                          <p className="text-xs text-gray-400 mt-0.5 font-normal">
                            {ourItems.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-display font-extrabold text-emerald-800 text-[14px]">${itemValueSum.toFixed(2)}</p>
                          <span className={`inline-block font-sans text-[10px] px-2 py-0.5 mt-0.5 text-center font-bold rounded-full ${
                            order.status === 'Delivered' 
                              ? 'bg-green-100 text-green-800' 
                              : order.status === 'Shipped' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-orange-100 text-orange-850 animate-pulse'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6" id="dashboard-listings">
            
            {/* List new segment */}
            <div className="flex justify-between items-center">
              <h4 className="font-display font-bold text-gray-900 text-base">Listed Produce Catalog</h4>
              
              <button
                onClick={() => setShowForm(!showForm)}
                id="toggle-add-product-form"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {showForm ? <X size={15} /> : <PlusCircle size={15} />}
                {showForm ? 'Cancel Form' : 'New Listing'}
              </button>
            </div>

            {/* Dynamic Product Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.98 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl p-5 border border-orange-500/10 shadow-md space-y-4 overflow-hidden"
                  id="add-produce-form-panel"
                >
                  <h3 className="font-display font-bold text-gray-900 text-[15px] border-b border-gray-100 pb-2 flex items-center gap-1.5 text-orange-800">
                    <Wheat size={16} />
                    Cultivate a New Listing
                  </h3>

                  {errorCode && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">
                      {errorCode}
                    </div>
                  )}

                  <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider" htmlFor="produce-name">
                        Produce Name
                      </label>
                      <input 
                        type="text" 
                        id="produce-name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Vine-Ripened Heirloom"
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 transition-all text-sm font-semibold outline-none text-gray-800 shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider" htmlFor="produce-price">
                          Price (USD)
                        </label>
                        <input 
                          type="text" 
                          id="produce-price" 
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g. 4.99"
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 transition-all text-sm font-semibold outline-none text-gray-800 shadow-inner"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider" htmlFor="produce-unit">
                          Sale Unit
                        </label>
                        <select 
                          id="produce-unit" 
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-3 transition-all text-sm font-semibold outline-none text-gray-800 shadow-inner"
                        >
                          <option value="lb">per lb</option>
                          <option value="bunch">bunch</option>
                          <option value="dozen">dozen</option>
                          <option value="16oz jar">16oz jar</option>
                          <option value="half-gal">half-gal</option>
                          <option value="pint">pint</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider" htmlFor="produce-category">
                          Category
                        </label>
                        <select 
                          id="produce-category" 
                          value={category}
                          onChange={(e) => setCategory(e.target.value as any)}
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-3 transition-all text-sm font-semibold outline-none text-gray-800 shadow-inner"
                        >
                          <option value="Vegetables">Vegetables</option>
                          <option value="Fruits">Fruits</option>
                          <option value="Dairy">Dairy</option>
                          <option value="Organic Eggs">Organic Eggs</option>
                          <option value="Bakery">Bakery</option>
                          <option value="Diary &amp; Eggs">Dairy &amp; Eggs</option>
                          <option value="Honey &amp; Sweets">Honey &amp; Sweets</option>
                          <option value="Grains &amp; Millets">Grains &amp; Millets</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider" htmlFor="produce-stock">
                          Initial Stock
                        </label>
                        <input 
                          type="number" 
                          id="produce-stock" 
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          placeholder="20"
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 transition-all text-sm font-semibold outline-none text-gray-800 shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Image preset dropdown */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Produce Image Setup
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.keys(IMAGE_PRESETS).map(key => (
                          <button
                            key={key}
                            type="button"
                            id={`image-preset-btn-${key}`}
                            onClick={() => setImagePreset(key)}
                            className={`py-1 text-[11px] font-bold rounded-lg border-2 transition-all capitalize ${
                              imagePreset === key 
                                ? 'bg-orange-55 border-orange-500 text-orange-950 shadow-sm font-extrabold' 
                                : 'bg-gray-50 border-gray-150 text-gray-500 hover:border-gray-200'
                            }`}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider" htmlFor="produce-desc">
                        Cultivated Description
                      </label>
                      <textarea 
                        id="produce-desc" 
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detail the fresh qualities, organic nature, harvest practices..."
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 transition-all text-sm font-semibold outline-none text-gray-800 shadow-inner resize-none"
                      />
                    </div>

                    {/* Organic quality check constraint */}
                    <div className="flex items-center gap-2 pt-2 md:col-span-2">
                      <input 
                        type="checkbox"
                        checked={isOrganic}
                        id="produce-is-organic"
                        onChange={(e) => setIsOrganic(e.target.checked)}
                        className="w-4 h-4 text-emerald-700 bg-gray-100 border-gray-300 rounded-sm focus:ring-emerald-600 focus:ring-2"
                      />
                      <label htmlFor="produce-is-organic" className="text-xs font-semibold text-gray-650 inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <Sparkles size={13} className="text-emerald-700 fill-emerald-50" />
                        Classify as Certified Organic State (Toggles badge for buyers)
                      </label>
                    </div>

                    <div className="pt-2 md:col-span-2">
                      <button
                        type="submit"
                        id="produce-submit-btn"
                        className="w-full bg-[#0f5238] hover:bg-[#0b3d29] text-white py-3.5 rounded-full text-xs uppercase tracking-widest font-extrabold shadow cursor-pointer transition-all active:scale-[0.982]"
                      >
                        Publish listing to marketplace
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List items */}
            {myProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center" id="empty-listings">
                <p className="text-gray-400 font-medium">You haven't published any items yet.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-3 text-[#0f5238] font-bold text-xs hover:underline"
                >
                  Create your first listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="my-products-grid">
                {myProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between" id={`listing-${product.id}`}>
                    <div className="relative aspect-video">
                      <img 
                        className="w-full h-full object-cover" 
                        alt={product.name}
                        src={product.image}
                      />
                      {product.isOrganic && (
                        <span className="absolute top-3 left-3 bg-emerald-600 text-white rounded-full py-1 px-2 text-[9px] font-extrabold tracking-widest uppercase">
                          ORGANIC
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{product.category}</span>
                          <span className="text-[10px] font-bold text-orange-950 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">Stock: {product.stock}</span>
                        </div>
                        <h5 className="font-display font-bold text-gray-900 text-sm mt-1 mb-1 truncate">{product.name}</h5>
                        <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{product.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-4">
                        <span className="font-display font-extrabold text-[15px] text-emerald-800">
                          ${product.price.toFixed(2)} <span className="text-gray-400 text-[10px] uppercase font-bold">/ {product.unit}</span>
                        </span>

                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          id={`delete-listing-btn-${product.id}`}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {activeTab === 'orders' && (
          <div className="max-w-3xl w-full mx-auto flex flex-col pt-2" id="dashboard-orders">
            <h3 className="font-display font-medium text-gray-950 text-base mb-4 flex items-center gap-2">
              <Truck size={18} className="text-orange-700" />
              Incoming Logistics Orders Fulfillments
            </h3>

            {myOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center" id="empty-farmer-orders">
                <p className="text-gray-400 font-medium">No order tickets have requested items from your ranch yet.</p>
                <p className="text-xs text-gray-400 mt-1">If you just checked out as a consumer, make sure the items you placed belong to Acres &amp; Oak Farm!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.slice().reverse().map(order => {
                  // our items within this order
                  const ourItems = order.items.filter(item => item.farmerId === myFarmerId);
                  const ourItemsSumValue = ourItems.reduce((s, x) => s + (x.price * x.quantity), 0);

                  return (
                    <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" id={`farmer-order-card-${order.id}`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-gray-400 uppercase">TICKET #{order.id}</span>
                            <span className="text-xs text-gray-400 font-medium">{order.date}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-1">
                            <User size={13} className="text-gray-400" />
                            <span className="text-sm font-semibold text-gray-750">{order.buyerName}</span>
                            <span className="text-xs text-gray-400">({order.buyerEmail})</span>
                          </div>
                        </div>

                        {/* Order action controllers */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full ${
                            order.status === 'Delivered' 
                              ? 'bg-transparent text-emerald-800' 
                              : order.status === 'Shipped' 
                                ? 'bg-transparent text-blue-800' 
                                : 'bg-transparent text-orange-850'
                          }`}>
                            Current: <span className="underline">{order.status}</span>
                          </span>

                          {order.status !== 'Delivered' && (
                            <button
                              onClick={() => {
                                const nextStatus = order.status === 'Pending' ? 'Shipped' : 'Delivered';
                                onUpdateOrderStatus(order.id, nextStatus);
                              }}
                              id={`update-status-btn-${order.id}`}
                              className={`text-xs font-bold py-1.5 px-3.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center gap-1 hover:shadow ${
                                order.status === 'Pending' 
                                  ? 'bg-[#0f5238] hover:bg-[#0b3d29] text-white' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {order.status === 'Pending' ? 'Ship Produce Package' : 'Mark as Delivered'}
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="py-3 space-y-2">
                        {ourItems.map((it, i) => (
                          <div key={i} className="flex justify-between items-center text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <span className="bg-orange-50 text-orange-950 font-bold px-2 py-0.5 rounded text-xs">
                                {it.quantity}x
                              </span>
                              <span className="text-gray-800">{it.productName}</span>
                            </div>
                            <span className="text-gray-400 text-xs">
                              ${it.price.toFixed(2)} / {it.unit}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-dashed border-gray-100 flex items-center justify-between text-xs text-gray-400 font-semibold uppercase font-mono">
                        <span>Fulfillment target log</span>
                        <div className="text-right">
                          <span className="text-gray-400 font-sans font-medium">Your value: </span>
                          <span className="font-display font-extrabold text-[15px] text-emerald-850 font-sans normal-case">${ourItemsSumValue.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
