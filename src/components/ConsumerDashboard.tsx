import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingBag, 
  Check, 
  MapPin, 
  Star, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  Clock, 
  CheckCircle, 
  Truck,
  LogOut,
  ChevronRight,
  ArrowRight,
  Mic,
  Menu,
  Sparkles,
  Calendar,
  User,
  ShieldCheck,
  CreditCard,
  Settings,
  Pencil,
  Home,
  Briefcase,
  ArrowLeft,
  Clock as ClockIcon
} from 'lucide-react';
import { Product, Farmer, CartItem, Order, User as UserType } from '../types';

const synonymMap: { [key: string]: string[] } = {
  tomato: ['tomato', 'tomatoe', 'tomatoes', 'tomatos', 'tamatar', 'tamator', 'tomat'],
  potato: ['potato', 'potatoe', 'potatoes', 'potatos', 'aloo', 'alu', 'batata'],
  millet: ['millet', 'millets', 'bajra', 'ragi', 'jowar', 'foxtail', 'kodo', 'barnyard', 'proso', 'little millet', 'finger millet', 'pearl millet', 'sorghum'],
  rice: ['rice', 'ric', 'chawal', 'basmati', 'sonamasuri', 'sonamasoori', 'paddy', 'indrayani', 'kolam'],
  brinjal: ['brinjal', 'brinjals', 'eggplant', 'eggplants', 'aubergine', 'baingan', 'baingun', 'vankaya'],
  okra: ['okra', 'okras', 'ladyfinger', 'ladyfinger', 'lady fingers', 'lady finger', 'bhindi', 'bhendi', 'bendakaya'],
  spinach: ['spinach', 'spinaches', 'palak', 'greens', 'green leafy', 'keerai'],
  coriander: ['coriander', 'cilantro', 'dhaniya', 'kothmiri', 'kothmir'],
  onion: ['onion', 'onions', 'pyaaz', 'pyaz', 'kanda'],
  garlic: ['garlic', 'lahsun', 'lehsun', 'lasun'],
  ginger: ['ginger', 'adrak', 'adrakh'],
  chilli: ['chilli', 'chili', 'chillies', 'chilles', 'mirchi', 'mirch', 'green chilli', 'red chilli'],
  cauliflower: ['cauliflower', 'gobi', 'gobhi', 'patta gobi'],
  cabbage: ['cabbage', 'cabbages', 'patta gobi', 'bandh gobi'],
  carrot: ['carrot', 'carrots', 'gajar'],
  cucumber: ['cucumber', 'cucumbers', 'kheera', 'kakdi'],
  wheat: ['wheat', 'gehu', 'atta', 'flour'],
  grain: ['grain', 'grains', 'millet', 'millets', 'rice', 'wheat', 'bajra', 'ragi', 'jowar'],
  bean: ['bean', 'beans', 'french beans', 'farasbi', 'lobiya']
};

export function smartMatch(query: string, name: string, description: string, farmerName: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  const n = name.toLowerCase();
  const d = description.toLowerCase();
  const f = farmerName.toLowerCase();

  // 1. Direct contains check
  if (n.includes(q) || d.includes(q) || f.includes(q)) {
    return true;
  }

  // 2. Lookup keys and check aliases
  for (const [key, aliases] of Object.entries(synonymMap)) {
    const queryMatchesKey = q.includes(key) || key.includes(q) || aliases.some(alias => q.includes(alias) || alias.includes(q));
    if (queryMatchesKey) {
      const nameMatchesKey = n.includes(key) || d.includes(key) || aliases.some(alias => n.includes(alias) || d.includes(alias));
      if (nameMatchesKey) {
        return true;
      }
    }
  }

  // 3. Fallback word-by-word comparison
  const queryWords = q.split(/\s+/).filter(w => w.length > 2);
  if (queryWords.length > 0) {
    return queryWords.every(word => {
      if (n.includes(word) || d.includes(word) || f.includes(word)) return true;
      for (const [key, aliases] of Object.entries(synonymMap)) {
        if (key.includes(word) || aliases.some(alias => alias.includes(word))) {
          if (n.includes(key) || d.includes(key) || aliases.some(alias => n.includes(alias) || d.includes(alias))) {
            return true;
          }
        }
      }
      return false;
    });
  }

  return false;
}

interface ConsumerDashboardProps {
  currentUser: UserType;
  products: Product[];
  farmers: Farmer[];
  orders: Order[];
  onPlaceOrder: (items: { productId: string; productName: string; price: number; quantity: number; unit: string; farmerId: string }[]) => void;
  onLogout: () => void;
  onSwitchToFarmer: () => void;
}

export default function ConsumerDashboard({
  currentUser,
  products,
  farmers,
  orders,
  onPlaceOrder,
  onLogout,
  onSwitchToFarmer
}: ConsumerDashboardProps) {
  // Navigation Tabs (Home, Browse, Orders, Profile, Cart, Address Picker, Live Tracking)
  const [activeTab, setActiveTab] = useState<'home' | 'browse' | 'orders' | 'profile' | 'cart' | 'address_picker' | 'live_tracking'>('home');
  const [farmerTip, setFarmerTip] = useState<number>(2.00);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(1);
  const [addressSearchQuery, setAddressSearchQuery] = useState<string>('');
  const [isAddressVoiceListening, setIsAddressVoiceListening] = useState<boolean>(false);
  const [addressVoiceStatus, setAddressVoiceStatus] = useState<string>('Listening...');
  const [selectedTrackedOrder, setSelectedTrackedOrder] = useState<Order | null>(null);

  // Delivery simulation coordinates (for high-fidelity moving bike interaction)
  const [deliveryCoord, setDeliveryCoord] = useState({ x: -40, y: -20, progressStep: 0 });
  React.useEffect(() => {
    if (activeTab !== 'live_tracking') return;
    
    const interval = setInterval(() => {
      setDeliveryCoord(prev => {
        const nextStep = prev.progressStep + 0.5;
        // Make bicycle slowly cycle along route path: oscillate between offset -80 and 80 X with a smooth sine-wave height deviation
        const progressMod = (nextStep % 100) / 100;
        const startX = -85;
        const endX = 75;
        const xOffset = startX + progressMod * (endX - startX);
        const yOffset = -35 + progressMod * 65 + Math.sin(progressMod * Math.PI * 2) * 12;
        return {
          progressStep: nextStep,
          x: xOffset,
          y: yOffset
        };
      });
    }, 150);
    
    return () => clearInterval(interval);
  }, [activeTab]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('Tomatoes');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  
  // Browse specific filters
  const [distanceFilter, setDistanceFilter] = useState<boolean>(false); // Default to '< 15 miles' active as in reference layout
  const [sortByPrice, setSortByPrice] = useState<'none' | 'lowToHigh' | 'highToLow'>('none');
  const [sortByPopularity, setSortByPopularity] = useState<boolean>(false);
  const [feedLimit, setFeedLimit] = useState<number>(8);
  const [addedFeedbackId, setAddedFeedbackId] = useState<string | null>(null);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<boolean>(false);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string>('');

  // Modals / Highlights state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceQueryExecuted, setVoiceQueryExecuted] = useState(false);
  const [voiceSearchText, setVoiceSearchText] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGreenValleyStoryOpen, setIsGreenValleyStoryOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Live Driver Marcus Chat state
  const [isChattingWithMarcus, setIsChattingWithMarcus] = useState<boolean>(false);
  const [marcusMessages, setMarcusMessages] = useState<{ sender: 'me' | 'marcus'; text: string; time: string }[]>([
    { sender: 'marcus', text: "Hey! I'm on my way with your organic farm harvest. Just crossed Southeast Division St!", time: "2:33 PM" }
  ]);
  const [chatInputText, setChatInputText] = useState<string>('');
  const [trackingTimeRemaining, setTrackingTimeRemaining] = useState<number>(12);

  // Profile Specific State
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // High-fidelity Order History & Harvest Voice Companion States
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);
  const [showAssistantPopup, setShowAssistantPopup] = useState(false);
  const [assistantText, setAssistantText] = useState("");
  const [isAssistantReading, setIsAssistantReading] = useState(false);

  // System physical tab history & custom back/home/recents navigation
  const tabHistory = React.useRef<string[]>(['home']);

  React.useEffect(() => {
    const currentHist = tabHistory.current;
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
        // 1. Close overlay modals or popup sheets first
        if (isCartOpen) {
          setIsCartOpen(false);
          return;
        }
        if (selectedProduct) {
          setSelectedProduct(null);
          return;
        }
        if (selectedFarmer) {
          setSelectedFarmer(null);
          return;
        }
        if (isCalendarOpen) {
          setIsCalendarOpen(false);
          return;
        }
        if (isGreenValleyStoryOpen) {
          setIsGreenValleyStoryOpen(false);
          return;
        }
        if (isEditProfileOpen) {
          setIsEditProfileOpen(false);
          return;
        }
        if (isAddressesOpen) {
          setIsAddressesOpen(false);
          return;
        }
        if (isPaymentsOpen) {
          setIsPaymentsOpen(false);
          return;
        }
        if (isSettingsModalOpen) {
          setIsSettingsModalOpen(false);
          return;
        }
        if (selectedOrderDetail) {
          setSelectedOrderDetail(null);
          return;
        }
        if (selectedTrackedOrder) {
          setSelectedTrackedOrder(null);
          return;
        }
        if (showAssistantPopup) {
          setShowAssistantPopup(false);
          return;
        }
        if (isChattingWithMarcus) {
          setIsChattingWithMarcus(false);
          return;
        }

        // 2. Tab history pop
        const hist = tabHistory.current;
        if (hist.length > 1) {
          const prevTab = hist[hist.length - 2];
          setActiveTab(prevTab as any);
          triggerNotification(`Back to ${prevTab}`);
        } else if (activeTab !== 'home') {
          // Fallback if the history was somehow lost or cleared
          setActiveTab('home');
          triggerNotification('Back to Home');
        } else {
          // If we are already on home tab:
          if (selectedCategory !== 'All' || searchQuery !== '') {
            setSelectedCategory('All');
            setSearchQuery('');
            triggerNotification("Cleared filters");
          } else {
            triggerNotification("Already on Home page");
          }
        }
      } else if (action === 'home') {
        // Reset category and search to initial state on home click
        setSelectedCategory('All');
        setSearchQuery('');
        
        // Close modals too
        setIsCartOpen(false);
        setSelectedProduct(null);
        setSelectedFarmer(null);
        setIsCalendarOpen(false);
        setIsGreenValleyStoryOpen(false);
        setIsEditProfileOpen(false);
        setIsAddressesOpen(false);
        setIsPaymentsOpen(false);
        setIsSettingsModalOpen(false);
        setSelectedOrderDetail(null);
        setSelectedTrackedOrder(null);
        setShowAssistantPopup(false);
        setIsChattingWithMarcus(false);

        tabHistory.current = ['home'];
        setActiveTab('home');
        triggerNotification('Home Screen');
      } else if (action === 'recents') {
        // Open the recent orders page / tab
        setIsCartOpen(false);
        setSelectedProduct(null);
        setSelectedFarmer(null);
        setSelectedOrderDetail(null);
        setSelectedTrackedOrder(null);
        
        setActiveTab('orders');
        triggerNotification('Recent Orders / Map');
      }
    };

    window.addEventListener('system-navigation', handleSystemNav);
    return () => {
      window.removeEventListener('system-navigation', handleSystemNav);
    };
  }, [
    isCartOpen, selectedProduct, selectedFarmer, isCalendarOpen, isGreenValleyStoryOpen,
    isEditProfileOpen, isAddressesOpen, isPaymentsOpen, isSettingsModalOpen,
    selectedOrderDetail, selectedTrackedOrder, showAssistantPopup, isChattingWithMarcus,
    selectedCategory, searchQuery, activeTab
  ]);

  const [profileName, setProfileName] = useState(() => {
    if (currentUser?.email === 'alex@example.com' || currentUser?.name === 'alex' || (currentUser?.name && currentUser.name.toLowerCase().includes('alex'))) {
      return 'Alex Rivers';
    }
    return currentUser?.name || 'Alex Rivers';
  });

  const [profileAvatar, setProfileAvatar] = useState(() => {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-EoImchOp9T3r3oMgNGOzi5m84d2W3eUFVOK4KedbVrfM9W7bpGFnzjQef9zz7TOw6EJIOKdl8IzarFzZGJF32k-sMaoraLHl5vuVD9gP1uODIMCp-mqD8m9oc4Q53VAoS5pD6OgLz5HBd3Qcmonc7VEsfo4g3htCvgCByp3KovZztM91ME6wigePnRQmTu5-sPYsx6mEdQGgbdAir7M4jk3jgC02w4b_4YpxeTZ3hrClKfkrweTWbntYq2EHSdsoxoRs0kArcWBJ';
  });

  const [addressesList, setAddressesList] = useState<string[]>([
    'Harvest Hub 12: 452 Farmer\'s Lane, Portland, OR',
    'Home Dropoff: 789 Maple Ave, Portland, OR'
  ]);
  const [newAddress, setNewAddress] = useState('');

  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'Visa', last4: '4421', isDefault: true }
  ]);
  const [newCardNameStr, setNewCardNameStr] = useState('');
  const [newCardNumStr, setNewCardNumStr] = useState('');

  const [profileSettings, setProfileSettings] = useState({
    ecoAlerts: true,
    localNotifications: true,
    deliverySMS: true
  });

  // Categories scroller
  const displayCategories = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Organic Eggs', 'Grains & Millets'];

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  // Find product images dynamically with hardcoded high-fidelity fallback values for starting seeds
  const getProductImage = (productId: string) => {
    if (productId === 'p5') { // Rainier Cherries
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfTqgmB5NwFnanwd48x72WLKS6SEg6EQnm5guQZ03Wu0ih3kTm4htyGwqcWrA1tkzn2mOZojZcYi2-9OhX9UD0pATmBZuT3hefy59fx6CeR8jgmbU_8-CmuZ-q6bCVsxrAWAsgTRdEMYzNRpg_oQAVOT6slwa3Yd74aPAsqVIulkvFOz7dpnurjk0KoYMF7KP1WouZNZcsxw0fuc2645fGV16CZszNbH9ki5O0l5pOBSC7kbULV_se3tWQHJF1rUX7A8METsiahk35';
    }
    if (productId === 'p4') { // Rainbow Carrots / Potato / Organic root
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDM0kgl1qQmVPpDet2vXN3PoxsDRe-DJ2MQz8Fue2ozf9_1snkJDKaslQbBfLRFj1Rc5izsPSIeBNIutBTRi3I6_9I5U93ZG1Z1o9Bec540m3PRFV2Hun3Yruf6B4hJDjI2X44uSK00q4Vbztb80B2iqRUzpdop3O9Iv4GsAg9m8hVBDCeQKLZCRuf5BwXtqNw0iez3sUkFd7eKt-YUWs2vS0jPhy1pfv8rziCI4Zn7R0TxiuC1AuwAJvvU5yotLdgUDD5u7k6ir4aS';
    }
    if (productId === 'p2') { // Salad Greens
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7qLbcqE8sxqOh6Aqa2q8KcbpmHBp-m4BU9o-9-5_wenPECgTdrTZ4V_ytzlPSwxvfzb9F9MgVSurrX6Rr0dbV3jr2SGo3rQdvPn2DUwA2xJ3WrOKPFTtxxA43_GhCtPxVFMiWAN06fy6xuR0Q6JtQtn-F-Y879hhdzsX6pM1C0qupTvBffR6LNO2tB1KYly_PEM9AnmiNJxLKOmULmpGg4MVDxrdVPj1cFq9TCw7yiN1tdC-iK_2rv-2u61EDHofCSekEfhqWDIVW';
    }
    if (productId === 'p6') { // Honey
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUFZ-ZuayrdyEBtzfs-9lECnLOlz7K5YCL3y5LwMSnhSAry_komVjSMuvu_1PpN91hUGn3n9OmO_autQUT9aaUD2fcISyQFIDdUn4PFYFkjIV-nePj-C9iol0xSHU80fyYFJasowFUXQMHSy5kd6qFlpocuyz3u_V05ACBvIAg8VYN9mMkHqc7KYLCHHQ-CTx9ne1ShbAT0CdpRN7NiVtEZCdTnWmey8y10mzsRwX82beLEXz475sVVnpjfQ7Rsn_8z9H60zBrWaEW';
    }
    if (productId === 'p1') { // Tomatoes
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHV3n5ziAGSUac7m-2GiPCV06vXNukzriglu_a1mDx0-MgFsk4lnwvQ1EPm1w58RN1kqexqY2puXHfDaJ7PCQLlHjRpu2MnsYdRODiEnBf5K3op5B9tuLeydnhAGwRTtqu461kxhZxiY3g4ISzlQoI054ksd3rYUgY8s3YVb_u9okuLZ6uq6pOEO4aHE8H83Z3b14hQ2WkYi71ab2vKe3HOdvhvNRbdlpL8NBfUD_-CfLuTTl2qoD-xwwGOLRePu0QGPvOrcxozynv';
    }
    const found = products.find(p => p.id === productId);
    return found?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfTqgmB5NwFnanwd48x72WLKS6SEg6EQnm5guQZ03Wu0ih3kTm4htyGwqcWrA1tkzn2mOZojZcYi2-9OhX9UD0pATmBZuT3hefy59fx6CeR8jgmbU_8-CmuZ-q6bCVsxrAWAsgTRdEMYzNRpg_oQAVOT6slwa3Yd74aPAsqVIulkvFOz7dpnurjk0KoYMF7KP1WouZNZcsxw0fuc2645fGV16CZszNbH9ki5O0l5pOBSC7kbULV_se3tWQHJF1rUX7A8METsiahk35';
  };

  // Reorder items completely workable logic
  const handleReorderItems = (order: Order) => {
    const itemsToAdd: CartItem[] = [];
    order.items.forEach(orderItem => {
      const matchedProduct = products.find(p => p.id === orderItem.productId);
      if (matchedProduct) {
        itemsToAdd.push({
          id: matchedProduct.id,
          product: matchedProduct,
          quantity: orderItem.quantity
        });
      }
    });

    if (itemsToAdd.length > 0) {
      setCart(prev => {
        const updated = [...prev];
        itemsToAdd.forEach(newItem => {
          const idx = updated.findIndex(i => i.id === newItem.id);
          if (idx > -1) {
            updated[idx].quantity += newItem.quantity;
          } else {
            updated.push(newItem);
          }
        });
        return updated;
      });
      setIsCartOpen(true);
      triggerNotification(`Added all items from Order #${order.id} to your Cart!`);
    } else {
      triggerNotification("Product is currently unavailable or out of stock.");
    }
  };

  // Speaks details of last order out loud using browser SpeechSynthesis custom voice setup
  const handleAssistantSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const lastOrder = buyerOrders[buyerOrders.length - 1];
    let spokenText = "";
    let displayText = "";

    if (lastOrder) {
      const itemsList = lastOrder.items.map(i => `${i.quantity} of ${i.productName}`).join(', ');
      displayText = `Hello ${profileName}! I am your Harvest AI Companion. Let me describe your last order (#${lastOrder.id}) placed on ${lastOrder.date}: It contains ${itemsList} for a total billing of $${lastOrder.total.toFixed(2)}. This order is marked as ${lastOrder.status} and was delivered directly to your designated hub dropping. It is grown sustainably under full coverage bio-transparency.`;
      spokenText = `Hello ${profileName}, I am your Harvest AI Companion. Let me describe your last order, number ${lastOrder.id}, placed on ${lastOrder.date}. It contains: ${itemsList}, for a total of ${lastOrder.total.toFixed(2)} dollars. This order is marked as ${lastOrder.status} and was delivered directly to your designated farm hub drop. Everything was grown sustainably with complete organic transparency. Can I assist with a quick reorder for today?`;
    } else {
      displayText = `Hello ${profileName}! You haven't placed any direct orders yet, but I am ready to summarize them for you as soon as you have raw farm-direct receipts. Tap our home catalog tab to browse the sunrise harvests!`;
      spokenText = `Hello ${profileName}, You haven't placed any direct orders yet, but I am ready to summarize them for you as soon as you have direct organic receipts. Tap our home catalog tab to browse the fresh harvests!`;
    }

    setAssistantText(displayText);
    setShowAssistantPopup(true);
    setIsAssistantReading(true);

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.onend = () => setIsAssistantReading(false);
      utterance.onerror = () => setIsAssistantReading(false);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setIsAssistantReading(false);
      }, 6000);
    }
  };

  // Filter products cleanly matching interactive states
  const filteredProducts = products.filter(product => {
    const matchesSearch = smartMatch(searchQuery, product.name, product.description, product.farmerName);
    
    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Organic Eggs') {
        matchesCategory = product.isOrganic === true && (product.category === 'Dairy' || product.name.toLowerCase().includes('egg'));
      } else if (selectedCategory === 'Dairy') {
        matchesCategory = product.category === 'Dairy' && !product.name.toLowerCase().includes('egg');
      } else {
        matchesCategory = product.category.toLowerCase().includes(selectedCategory.toLowerCase());
      }
    }
    
    const matchesOrganic = !onlyOrganic || product.isOrganic;
    return matchesSearch && matchesCategory && matchesOrganic;
  });

  const groupedCartItems = cart.reduce((groups, item) => {
    const fId = item.product.farmerId;
    if (!groups[fId]) {
      const parentFarmer = farmers.find(f => f.id === fId);
      groups[fId] = {
        farmer: parentFarmer || {
          id: fId,
          name: item.product.farmerName,
          farmName: item.product.farmerName,
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
          joinedDate: '',
          location: 'Local Region',
          story: 'Local sustainable producer',
          rating: 4.8
        },
        items: []
      };
    }
    groups[fId].items.push(item);
    return groups;
  }, {} as Record<string, { farmer: Farmer; items: CartItem[] }>);

  // Cart Functions
  const toCartItemFormat = (prod: Product) => {
    return { id: prod.id, product: prod, quantity: 1 };
  };

  const addToCartById = (productId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        triggerNotification(`Updated quantity of ${product.name} in Box!`);
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      triggerNotification(`Added ${product.name} to Box!`);
      return [...prev, toCartItemFormat(product)];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    triggerNotification("Removed item from Box");
  };

  const handleAddressVoiceClick = () => {
    if (isAddressVoiceListening) {
      setIsAddressVoiceListening(false);
      return;
    }
    setIsAddressVoiceListening(true);
    setAddressVoiceStatus('Go ahead, say "Deliver to Laurelwood"...');
    
    setTimeout(() => {
      setAddressVoiceStatus('Analyzing speech patterns... 🎙️');
    }, 1200);

    setTimeout(() => {
      const voiceDetectedAddress = '1248 SW Laurelwood Blvd, Apt 4C';
      setAddressVoiceStatus(`Matching: "${voiceDetectedAddress}"`);
      
      setAddressesList(prev => {
        if (!prev.includes(voiceDetectedAddress)) {
          return [...prev, voiceDetectedAddress];
        }
        return prev;
      });
      
      setTimeout(() => {
        setAddressesList(prev => {
          const foundIdx = prev.indexOf(voiceDetectedAddress);
          if (foundIdx !== -1) {
            setSelectedAddressIndex(foundIdx);
          }
          return prev;
        });
        setIsAddressVoiceListening(false);
        triggerNotification(`Voice updated delivery location!`);
      }, 700);
    }, 2400);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const itemsToSubmit = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      unit: item.product.unit,
      farmerId: item.product.farmerId
    }));

    const mockOrderId = 'HD' + Math.floor(100000 + Math.random() * 900000);
    onPlaceOrder(itemsToSubmit);
    setLastPlacedOrderId(mockOrderId);
    setCart([]);
    setIsCartOpen(false);
    setOrderCompleted(true);
  };

  const getProductFarmer = (farmerId: string): Farmer | undefined => {
    return farmers.find(f => f.id === farmerId);
  };

  // Voice command action trigger
  const runVoiceCommand = (phrase: string) => {
    setVoiceSearchText(phrase);
    setVoiceQueryExecuted(true);
    setTimeout(() => {
      setIsVoiceActive(false);
      setVoiceQueryExecuted(false);
      setVoiceSearchText('');
      
      // Auto-filter based on voice sentence
      if (phrase.includes('organic') || phrase.includes('salad') || phrase.includes('greens')) {
        setSearchQuery('greens');
        setSelectedCategory('Vegetables');
        setOnlyOrganic(true);
        triggerNotification('AI Guide auto-applied filters: Vegetables & Organic');
      } else if (phrase.includes('honey') || phrase.includes('wildflower')) {
        setSearchQuery('Honey');
        setSelectedCategory('All');
        triggerNotification('AI Guide searched: Wildflower Honey');
      } else {
        setSearchQuery(phrase);
        triggerNotification(`AI Guide searched for "${phrase}"`);
      }
    }, 1200);
  };

  // Find Thomas Wayne
  const thomasWayneFarmer = farmers.find(f => f.id === 'f2') || farmers[0];

  const buyerOrders = orders.filter(o => o.buyerEmail === currentUser.email);

  return (
    <div className="h-full bg-[#f8f9fa] text-[#191c1d] font-body-md select-none flex flex-col justify-between relative overflow-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] bg-[#0f5238] text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-2 border border-emerald-800"
          >
            <Check size={14} className="text-emerald-300 stroke-[3]" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TopAppBar */}
      <header className="sticky top-0 w-full z-40 flex justify-between items-center px-4 h-16 bg-white shadow-sm border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setActiveTab('profile');
              triggerNotification("Opened settings & farm connection portal");
            }}
            className="w-10 h-10 active:scale-95 transition-transform duration-150 rounded-full overflow-hidden shadow-sm border border-emerald-600/20 bg-[#eef1ed] flex-shrink-0 flex items-center justify-center p-0.5 cursor-pointer"
            title="Profile"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
              <circle cx="50" cy="50" r="48" fill="#e2efe0"/>
              <circle cx="50" cy="38" r="20" fill="#2d6a4f"/>
              <path d="M15,82 C15,62 30,58 50,58 C70,58 85,62 85,82 Z" fill="#0f5238"/>
              <path d="M28,30 Q50,15 72,30 Z" fill="#7d562d"/>
              <rect x="23" y="27" width="54" height="4" rx="2" fill="#7d562d"/>
            </svg>
          </button>
          <span 
            className="font-headline-lg-mobile text-[#0f5238] tracking-tight cursor-pointer select-none font-bold text-xl ml-1"
            onClick={() => setActiveTab('home')}
          >
            Harvest Direct
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#0f5238] rounded-full relative active:scale-95 transition-all duration-150 flex items-center justify-center border border-emerald-100 cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingBag size={20} className="stroke-[2.5]" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ba1a1a] text-white rounded-full flex items-center justify-center text-[10px] font-bold border border-white shadow-xs">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Dynamic Tab Views */}
      <div className="flex-grow w-full overflow-y-auto overflow-x-hidden relative scrollbar-none pb-28">
        {activeTab === 'home' && (
          <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
            {/* Search Input Box with Integrated Voice Assistant Button */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-[#404943]" />
              </div>
              <input 
                className="block w-full pl-11 pr-22 py-3.5 bg-[#f3f4f5] border-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0f5238] rounded-2xl text-[#191c1d] placeholder-[#404943] text-sm font-sans shadow-inner transition-all cursor-pointer text-left" 
                placeholder="Search fresh produce, farmers..." 
                type="text"
                value={searchQuery}
                onFocus={() => setActiveTab('browse')}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveTab('browse');
                }}
              />
              <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                {searchQuery && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVoiceActive(true);
                    triggerNotification("Voice Assistant activated!");
                  }}
                  className="p-2 bg-[#0f5238]/10 hover:bg-[#0f5238]/20 text-[#0f5238] rounded-full active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  title="Speak to AI Assistant"
                >
                  <Mic size={15} className="stroke-[#0f5238] fill-none" />
                </button>
              </div>
            </div>

            {/* Category Chips horizontal scroller */}
            <section className="flex gap-2.5 overflow-x-auto hide-scrollbar py-1 -mx-4 px-4 select-none">
              {displayCategories.map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <button 
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSearchQuery('');
                      if (cat === 'All') {
                        setActiveTab('home');
                      } else {
                        setActiveTab('browse');
                      }
                      triggerNotification(cat === 'All' ? 'Showing all categories' : `Navigating to ${cat}`);
                    }}
                    className={`flex-shrink-0 px-5 py-2 rounded-full font-sans text-xs font-semibold shadow-sm transition-all ${
                      isActive 
                        ? 'bg-[#0f5238] text-white' 
                        : 'bg-[#e7e8e9] text-[#404943] hover:bg-[#e1e3e4]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </section>

            {/* Seasonal Highlights Section - Bento Style */}
            <section className="space-y-3 pt-1">
              <div className="flex justify-between items-end">
                <h2 className="text-lg font-bold font-sans text-[#0f5238]">Seasonal Highlights</h2>
                <button 
                  onClick={() => setIsCalendarOpen(true)}
                  className="text-[#0f5238] text-xs font-semibold hover:underline flex items-center gap-1"
                >
                  <Calendar size={13} />
                  View Calendar
                </button>
              </div>

              {/* Bento Grid layout */}
              <div className="grid grid-cols-1 gap-4">
                {/* Large Highlight Card - Heirloom Ruby Tomatoes */}
                <div className="group relative h-[300px] rounded-2xl overflow-hidden shadow-md active:scale-[0.98] transition-all border border-gray-100 flex flex-col justify-end">
                  <img 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt="Heirloom Ruby Tomatoes" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAucmkLo0q8bBsrBKVs5gM8UW5SRlMJiwPjyK1O3rUsjBUOIZxQkiukq3yxe-mt7Cldw96VS8TgrhxZc1S_fnEmZOFviDkylQ5Th1rSV2SfAYDG4gsCAV_lKPtuUezJvkEuv53p2CvXoLCHfOaotfvLnXNUlZKBs2MGyykJIvRdAwXicURBj0vCJaVXJbexbjV1TRvy-Cl8cS4J709AR3-m_tZfIKxW2nD64uzSMY8UgT0XqumsVKq0z-SOX-22eaqoiQmPwJ5ytF0k"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"></div>
                  
                  {/* Peak tag corner */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-[#7d562d] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      In Peak Season
                    </span>
                  </div>

                  <div className="relative z-10 p-5 text-white space-y-1.5">
                    <h3 className="text-xl font-bold font-sans tracking-tight">Heirloom Ruby Tomatoes</h3>
                    <p className="text-xs text-white/85 line-clamp-2">Grown at Hillside Farm by Farmer Elias. Extra sweet, vine-ripened.</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-bold text-lg font-sans">$4.50/lb</span>
                      <button 
                        onClick={() => addToCartById('p1')}
                        className="bg-white text-[#0f5238] hover:bg-emerald-50 px-5.5 py-1.5 rounded-full text-xs font-bold shadow active:scale-95 transition-transform"
                      >
                        Add to Box
                      </button>
                    </div>
                  </div>
                </div>

                {/* Secondary Bento Pair row */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Super Greens card */}
                  <div 
                    onClick={() => {
                      addToCartById('p11');
                      triggerNotification('Super Greens Bundle added to box!');
                    }}
                    className="relative h-[155px] rounded-2xl overflow-hidden shadow-sm group cursor-pointer border border-gray-100 flex flex-col justify-end p-4"
                  >
                    <img 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt="Super Greens Bundle" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3m-ADQpYlQVh9rPFkYoNNTfxZkZPu20B06YXIurFCnyDXrTTqovmmMqQoIohSgs_t_WoY-XY8H6kTOAJy2sOKAr9Jm7bFjCqfNkBGGtm6wwdv-lLxVySDi2JZVi-3hsBae270e7Cej5R8wy8S65T4NhO93G2leqCNcm1xgc9x4H0W75Jex_s0ydF6S3KxpG1z1-wT3212moIrnkmDPg2TCjYca_ZASGEw3Maj0rcNaJTygQgOhqyPv5YfX9zB4ncZHCt4UH7T817u"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="relative z-10 text-white">
                      <h4 className="text-sm font-bold font-sans truncate">Super Greens Bundle</h4>
                      <p className="text-[11px] text-white/90 font-medium">$12.00 • Farm Fresh</p>
                    </div>
                  </div>

                  {/* Artisan Dairy Pair card */}
                  <div 
                    onClick={() => {
                      addToCartById('p17');
                      triggerNotification('Artisan Goat Milk Cheese added to box!');
                    }}
                    className="relative h-[155px] rounded-2xl overflow-hidden shadow-sm group cursor-pointer border border-gray-100 flex flex-col justify-end p-4"
                  >
                    <img 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt="Artisan Goat Milk Cheese" 
                      src="https://images.unsplash.com/photo-1486299267070-8382e214434b?auto=format&fit=crop&w=350&q=80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="relative z-10 text-white">
                      <h4 className="text-sm font-bold font-sans truncate">Artisan Goat Cheese</h4>
                      <p className="text-[11px] text-white/90 font-medium">$8.50 • Limited Supply</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Local Harvest Product Grid */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-sans text-[#0f5238]">Local Harvest</h2>
                <button 
                  onClick={() => {
                    setOnlyOrganic(!onlyOrganic);
                    triggerNotification(onlyOrganic ? "Organic filter turned OFF" : "Organic filter turned ON - showing non-chemical yields");
                  }}
                  className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    onlyOrganic 
                      ? 'bg-[#005337] text-white border-[#005337]' 
                      : 'text-[#0f5238] border-[#0f5238]/20 bg-[#f8f9fa] hover:bg-gray-100'
                  }`}
                >
                  <Sparkles size={12} className={onlyOrganic ? "text-emerald-300 fill-emerald-300" : ""} />
                  {onlyOrganic ? 'Organic Only' : 'Filter Organic'}
                </button>
              </div>

              {/* Feed Grid (2-column layout requested on mobile screenshot) */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <p className="text-[#404943] text-sm">No local harvest found matching the criteria.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setOnlyOrganic(false); }}
                    className="text-xs font-bold text-[#0f5238] underline mt-2"
                  >
                    Reset Search View
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5" id="products-grid">
                  {filteredProducts.map(product => {
                    const itemQty = cart.find(item => item.id === product.id)?.quantity || 0;
                    
                    return (
                      <div 
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between border border-gray-100 hover:shadow-md transition-shadow duration-300 cursor-pointer"
                      >
                        {/* Image wrap with absolute tag */}
                        <div className="relative aspect-square bg-[#f3f4f5]">
                          <img 
                            className="w-full h-full object-cover" 
                            alt={product.name} 
                            src={product.image}
                          />

                          {/* Top corner condition badges */}
                          {product.isOrganic && (
                            <span className="absolute top-2 left-2 bg-[#ffca98] text-[#7a532a] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                              Organic
                            </span>
                          )}

                          {!product.isOrganic && product.price > 10 && (
                            <span className="absolute top-2 left-2 bg-[#98ebc0] text-[#005236] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                              Today's Pick
                            </span>
                          )}

                          {!product.isOrganic && product.price <= 10 && (
                            <span className="absolute top-2 left-2 bg-[#ffdad6] text-[#ba1a1a] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                              Selling Fast
                            </span>
                          )}
                        </div>

                        {/* Product details */}
                        <div className="p-3 flex flex-col flex-grow justify-between bg-white text-left">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 text-gray-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238]"></span>
                              <p className="text-[10px] font-semibold truncate leading-none">{product.farmerName}</p>
                            </div>
                            <h3 className="font-bold text-sm text-[#191c1d] leading-snug line-clamp-1">{product.name}</h3>
                          </div>

                          <div className="pt-2 mt-2 border-t border-gray-50 flex items-center justify-between">
                            <span className="font-sans font-bold text-sm text-[#0f5238]">${product.price.toFixed(2)}/{product.unit}</span>
                            
                            <button 
                              onClick={(e) => addToCartById(product.id, e)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow active:scale-95 transition-all ${
                                itemQty > 0 
                                  ? 'bg-[#7d562d] hover:bg-[#623f18]' 
                                  : 'bg-[#0f5238] hover:bg-[#2d6a4f]'
                              }`}
                            >
                              {itemQty > 0 ? (
                                <span className="text-xs font-bold">{itemQty}</span>
                              ) : (
                                <Plus size={14} className="stroke-[3]" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Farmer Thomas Wayne Spotlight Section (Level 3 Elevation) */}
            <section className="bg-white rounded-3xl p-5 shadow-[0_12px_32px_rgba(45,106,79,0.06)] border border-emerald-500/5 mt-4 text-left">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-[#0f5238] overflow-hidden shadow-md">
                    <img 
                      className="w-full h-full object-cover" 
                      alt="Farmer Thomas Wayne" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpScf4Db8psdWxsPx5TMFNZng2V4Om5bZzHvwRNP6g6g3_IgSPi4mmOdzedVAvDmnaFmQOzm2WfM3xlrxOsRunp6qmT-RLXJneD_r0v0vsb0UB1s0QD9-o5m1tq_Q33vTKVcaNK3P7L6gb_97EXeSeMw0Cb2vaxTISqgWmKacFjlNbMIv9Lr2T17vMVjHawgugqAvkbHafUdyh6yi8GA2XVVByHX2tfiUqt2DIncoRAKzVgUYpdTNIovAJMMBv79P3upVwSlYS1nr0"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#0f5238] text-white p-1 rounded-full shadow-md border border-white">
                    <ShieldCheck size={14} className="fill-white text-[#0f5238]" />
                  </div>
                </div>

                <div className="space-y-1 w-full">
                  <h3 className="text-base font-bold text-[#0f5238] font-sans">Farmer Thomas Wayne</h3>
                  <span className="inline-block px-3 py-0.5 bg-[#85d7ad] text-[#005236] rounded-full text-[9px] font-bold uppercase tracking-wider">
                    VERIFIED SOURCE
                  </span>
                  <p className="text-xs text-[#404943] leading-relaxed italic max-w-sm pt-2">
                    "Our family has been farming the Green Valley for three generations. We use regenerative practices that prioritize soil health and absolute freshness. When you buy our chard, it was in the ground just six hours ago."
                  </p>
                </div>

                <button 
                  onClick={() => setIsGreenValleyStoryOpen(true)}
                  className="text-xs font-bold text-[#0f5238] hover:text-[#2d6a4f] flex items-center justify-center gap-1 hover:gap-1.5 transition-all pt-2 select-none"
                >
                  Read the Green Valley Story
                  <ArrowRight size={13} />
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Browse / Search Results Tab matching mobile reference design */}
        {activeTab === 'browse' && (
          <div className="px-4 py-4 space-y-5 max-w-lg mx-auto text-left pb-24">
            
            {/* Search input with back navigation to Home */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={16} className="text-[#404943]" />
                </div>
                <input 
                  className="block w-full pl-10 pr-22 py-3 bg-[#f3f4f5] border-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0f5238] rounded-2xl text-[#191c1d] placeholder-[#404943] text-sm font-sans shadow-inner transition-all text-left" 
                  placeholder="Search fresh local harvest..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                  {searchQuery && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsVoiceActive(true);
                      triggerNotification("Voice Assistant activated!");
                    }}
                    className="p-2 bg-[#0f5238]/10 hover:bg-[#0f5238]/20 text-[#0f5238] rounded-full active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    title="Speak to AI Assistant"
                  >
                    <Mic size={14} className="stroke-[#0f5238] fill-none" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Category Chips for Browse */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 py-1.5 select-none border-b border-gray-100 bg-white shadow-xs">
              {displayCategories.map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <button 
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSearchQuery('');
                      if (cat === 'All') {
                        setActiveTab('home');
                      }
                      triggerNotification(cat === 'All' ? 'Navigating to Home' : `Showing category: ${cat}`);
                    }}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full font-sans text-xs font-bold transition-all border ${
                      isActive 
                        ? 'bg-[#0f5238] text-white border-transparent' 
                        : 'bg-gray-100 text-[#404943] border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            {/* Dynamic Search Context Header */}
            {(() => {
              // Apply filters dynamically matching data
              const searchLower = searchQuery.toLowerCase().trim();
              let filtered = products.filter(p => {
                const matchesSearch = smartMatch(searchQuery, p.name, p.description, p.farmerName);
                
                const matchesOrganic = !onlyOrganic || p.isOrganic;
                
                // All our premium local farmers are sustainably located within 15 miles of the community hub
                const matchesDistance = !distanceFilter || true;
                
                let matchesCategory = true;
                if (selectedCategory !== 'All') {
                  const catStr = p.category as string;
                  if (selectedCategory === 'Organic Eggs') {
                    matchesCategory = catStr === 'Organic Eggs' || (p.isOrganic === true && (catStr === 'Dairy' || catStr === 'Dairy & Eggs' || p.name.toLowerCase().includes('egg')));
                  } else if (selectedCategory === 'Dairy') {
                    matchesCategory = catStr === 'Dairy' || ((catStr === 'Dairy' || catStr === 'Dairy & Eggs') && !p.name.toLowerCase().includes('egg'));
                  } else {
                    matchesCategory = catStr.toLowerCase().includes(selectedCategory.toLowerCase()) || 
                                      selectedCategory.toLowerCase().includes(catStr.toLowerCase());
                  }
                }
                
                return matchesSearch && matchesOrganic && matchesDistance && matchesCategory;
              });

              if (sortByPrice === 'lowToHigh') {
                filtered = [...filtered].sort((a, b) => a.price - b.price);
              } else if (sortByPrice === 'highToLow') {
                filtered = [...filtered].sort((a, b) => b.price - a.price);
              }

              if (sortByPopularity) {
                // Popular items have more stock or custom weights
                filtered = [...filtered].sort((a, b) => b.stock - a.stock);
              }

              const visibleProducts = filtered.slice(0, feedLimit);

              return (
                <div className="space-y-4 pt-1">
                  
                  {/* Results Text and Active chips */}
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <p className="font-sans text-[10px] font-extrabold text-[#0f5238] uppercase tracking-widest">Search Results</p>
                      <h2 className="font-sans font-extrabold text-2xl text-gray-950 tracking-tight mt-0.5">
                        {searchQuery ? `"${searchQuery}"` : selectedCategory !== 'All' ? `${selectedCategory}` : "Fresh Harvest"}
                      </h2>
                      <p className="font-sans text-xs text-gray-500 font-medium">Found {filtered.length} varieties from local sustainable farms</p>
                    </div>

                    {/* Filter chips tray */}
                    {(onlyOrganic || distanceFilter || sortByPrice !== 'none' || sortByPopularity || selectedCategory !== 'All') && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5 select-none">
                        {selectedCategory !== 'All' && (
                          <span className="bg-[#e7e8e9] text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-gray-200">
                            Category: {selectedCategory}
                            <button onClick={() => setSelectedCategory('All')} className="hover:text-red-500 cursor-pointer">
                              <X size={12} />
                            </button>
                          </span>
                        )}
                        {onlyOrganic && (
                          <span className="bg-[#e7e8e9] text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                            Organic 
                            <button onClick={() => setOnlyOrganic(false)} className="hover:text-red-500 cursor-pointer">
                              <X size={12} />
                            </button>
                          </span>
                        )}
                        {distanceFilter && (
                          <span className="bg-[#e7e8e9] text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                            &lt; 15 miles
                            <button onClick={() => setDistanceFilter(false)} className="hover:text-red-500 cursor-pointer">
                              <X size={12} />
                            </button>
                          </span>
                        )}
                        {sortByPrice !== 'none' && (
                          <span className="bg-[#e7e8e9] text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                            Price: {sortByPrice === 'lowToHigh' ? 'Low to High' : 'High to Low'}
                            <button onClick={() => setSortByPrice('none')} className="hover:text-red-500 cursor-pointer">
                              <X size={12} />
                            </button>
                          </span>
                        )}
                        {sortByPopularity && (
                          <span className="bg-[#e7e8e9] text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                            Popularity
                            <button onClick={() => setSortByPopularity(false)} className="hover:text-red-500 cursor-pointer">
                              <X size={12} />
                            </button>
                          </span>
                        )}
                        <button 
                          onClick={() => {
                            setOnlyOrganic(false);
                            setDistanceFilter(false);
                            setSortByPrice('none');
                            setSortByPopularity(false);
                            setSelectedCategory('All');
                          }} 
                          className="text-[#0f5238] font-extrabold text-[10px] hover:underline hover:decoration-2 pl-1 cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Empty State */}
                  {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm py-12 space-y-2">
                       <p className="text-gray-400 text-sm">No farm crops found matching your filters.</p>
                       <button 
                         onClick={() => {
                           setSearchQuery('');
                           setOnlyOrganic(false);
                           setDistanceFilter(false);
                           setSortByPrice('none');
                           setSortByPopularity(false);
                           setSelectedCategory('All');
                         }}
                         className="bg-[#0f5238] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[#2d6a4f] shadow-sm transition-all cursor-pointer"
                       >
                         Reset Search Filters
                       </button>
                    </div>
                  ) : (
                    /* Products Grid matching layout exactly */
                    <div className="grid grid-cols-2 gap-3.5 select-none">
                      {visibleProducts.map(product => {
                        const isFeedbackActive = addedFeedbackId === product.id;
                        
                        // Map specific catalog status tags matching search results mockups
                        let itemBadge: string | null = null;
                        if (product.id === 'p1') itemBadge = "ORGANIC";
                        else if (product.id === 'p2') itemBadge = "LOCAL PICK";
                        else if (product.id === 'p3') itemBadge = "ORGANIC";
                        else if (product.id === 'p5') itemBadge = "IN SEASON";
                        else if (product.id === 'p7') itemBadge = "ORGANIC";
                        else if (product.id === 'p8') itemBadge = "TOP RATED";
                        
                        return (
                          <div 
                            key={product.id}
                            onClick={() => setSelectedProduct(product)}
                            className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_12px_rgba(45,106,79,0.06)] hover:shadow-[0_8px_20px_rgba(45,106,79,0.12)] transition-all flex flex-col justify-between border border-gray-100 cursor-pointer relative"
                          >
                            {/* Product photo display */}
                            <div className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
                              <img 
                                alt={product.name} 
                                className="w-full h-full object-cover" 
                                src={product.image}
                              />
                              
                              {itemBadge && (
                                <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider ${
                                  itemBadge === 'ORGANIC' 
                                    ? 'bg-[#ffca98] text-[#7a532a]' 
                                    : itemBadge === 'LOCAL PICK' 
                                      ? 'bg-[#b1f0ce] text-[#005236]' 
                                      : itemBadge === 'IN SEASON'
                                        ? 'bg-[#b1f0ce] text-[#0e5138]'
                                        : 'bg-[#ffca98] text-[#7a532a]'
                                }`}>
                                  {itemBadge}
                                </span>
                              )}
                              
                              {/* Pill Add button matching the exact round green '+' and momentary check design */}
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addToCartById(product.id, e);
                                  setAddedFeedbackId(product.id);
                                  setTimeout(() => setAddedFeedbackId(null), 1500);
                                }}
                                className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full shadow-md active:scale-90 transition-all flex items-center justify-center cursor-pointer ${
                                  isFeedbackActive 
                                    ? 'bg-[#005236] text-[#b1f0ce] scale-105' 
                                    : 'bg-[#0f5238] hover:bg-[#2d6a4f] text-white'
                                }`}
                              >
                                {isFeedbackActive ? (
                                  <span className="material-symbols-outlined text-[15px] font-black leading-none">check</span>
                                ) : (
                                  <span className="material-symbols-outlined text-[15px] font-black leading-none">plus</span>
                                )}
                              </button>
                            </div>
                            
                            {/* Card text details */}
                            <div className="p-3.5 flex flex-col justify-between flex-grow text-left">
                              <div className="space-y-0.5">
                                <p className="font-sans text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">
                                  {product.farmerName}
                                </p>
                                <h3 className="font-sans font-bold text-sm text-[#191c1d] leading-snug line-clamp-1">
                                  {product.name}
                                </h3>
                              </div>
                              
                              <div className="pt-2 border-t border-gray-50 flex items-center justify-between mt-2.5">
                                <span className="font-sans font-extrabold text-[#0e5138] text-sm leading-none">
                                  ${product.price.toFixed(2)}
                                  <span className="text-[10px] text-gray-400 font-semibold font-sans">/{product.unit}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Top Rated Tomato Farmer Spotlight Bento Box */}
                  <section className="my-6 text-left pt-2">
                    <h2 className="font-sans font-extrabold text-sm text-gray-950 mb-3.5 tracking-tight px-1 uppercase tracking-widest text-[#0e5138]">
                      Top Rated Farmer for Tomatoes
                    </h2>
                    
                    <div className="bg-[#2d6a4f] text-[#a8e7c5] rounded-[24px] p-5.5 flex flex-col relative overflow-hidden shadow-md border border-emerald-800/10 text-left">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>
                      
                      <div className="z-10 space-y-3.5">
                        <span className="bg-[#7d562d] text-white px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase inline-block">
                          FARMER OF THE MONTH
                        </span>
                        
                        <h3 className="font-sans font-bold text-white text-lg tracking-tight leading-none">
                          Oak Creek Sustainable Farm
                        </h3>
                        
                        <p className="font-sans text-[#a8e7c5] text-[11px] leading-relaxed max-w-sm">
                          "Our tomatoes are heirloom-only, soil-grown, and picked at the peak of ripeness for the highest lycopene content and incredible flavor."
                        </p>
                        
                        <div className="flex items-center gap-3.5 pt-1.5 pb-2">
                          <button 
                            onClick={() => {
                              const ocf = farmers.find(f => f.id === 'f4') || {
                                id: 'f4',
                                name: 'Oak Creek Sustainable Farm',
                                farmName: 'Oak Creek Sustainable Farm',
                                location: 'Oak Creek Valley',
                                story: 'Our family operates bountiful slope orchards and sustainable tomato patches. Our heirloom-only, soil-grown crops are picked at the peak of ripeness...',
                                avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6nSU4sq8hmsFvwnnYXr6yzZTDHnZKqSji87pbsUuvbJQ8RIgAieoE7NmYVucC0yten_xbbjHA06KB17EiiSqeoXdaWflPptqt82Sz3vyORDTjg3aJTCfSnOUwrXbjfZqUDRq9hGinea_1hQ0TPh7untNs33inClyv76UpAls742xIDRJ2wJOvQnPwIstcjCOVymzLRHTQrsdrDHYXIyc9hyPFkDKVQcsKy_Kw06sIjwq7PXaVvKTLH1zW7ojZF2zYSAzg_B_MnjlG',
                                rating: 4.9,
                                joinedDate: 'Joined Jun 2022'
                              };
                              setSelectedFarmer(ocf as any);
                            }}
                            className="bg-[#a8e7c5] hover:bg-[#b1f0ce] text-[#2d6a4f] px-4 py-2 rounded-full text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                          >
                            Visit Farm Profile
                          </button>
                          
                          <div className="flex items-center gap-1 text-white bg-white/10 px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-xs select-none">
                            <span className="material-symbols-outlined text-[13px] leading-none text-[#ffca98]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span>4.9</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Circle image portrait with border of light tone */}
                      <div className="flex justify-center pt-4 select-none">
                        <div className="w-36 h-36 rounded-full border-4 border-white/25 overflow-hidden shadow-md flex-shrink-0 bg-[#a8e7c5]/5">
                          <img 
                            alt="Oak Creek Farmer Portrait" 
                            className="w-full h-full object-cover" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6nSU4sq8hmsFvwnnYXr6yzZTDHnZKqSji87pbsUuvbJQ8RIgAieoE7NmYVucC0yten_xbbjHA06KB17EiiSqeoXdaWflPptqt82Sz3vyORDTjg3aJTCfSnOUwrXbjfZqUDRq9hGinea_1hQ0TPh7untNs33inClyv76UpAls742xIDRJ2wJOvQnPwIstcjCOVymzLRHTQrsdrDHYXIyc9hyPFkDKVQcsKy_Kw06sIjwq7PXaVvKTLH1zW7ojZF2zYSAzg_B_MnjlG"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Load More Button */}
                  {filtered.length > 0 && (
                    <div className="flex justify-center pt-3 select-none">
                      {feedLimit < filtered.length ? (
                        <button 
                          onClick={() => {
                            setFeedLimit(prev => prev + 4);
                            triggerNotification("Loaded additional local items and reviews!");
                          }}
                          className="px-7 py-2.5 rounded-full border border-[#0f5238] text-[#0f5238] hover:bg-[#0f5238]/5 transition-all active:scale-95 font-sans font-bold text-[11px] uppercase tracking-wider cursor-pointer"
                        >
                          Load More Results
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
                          Showing all local varieties
                        </span>
                      )}
                    </div>
                  )}

                </div>
              );
            })()}

          </div>
        )}

        {/* Orders History Tab */}
        {activeTab === 'orders' && (
          <div className="px-4 py-4 space-y-5 max-w-lg mx-auto text-left pb-24 font-sans leading-relaxed">
            
            {/* Header section matching lookup */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('profile')}
                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0f5238] rounded-full active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-emerald-100/50"
                title="Back to Profile"
              >
                <ArrowLeft size={18} className="stroke-[2.5]" />
              </button>
              <h2 className="text-[#191c1d] font-bold text-xl font-sans tracking-tight">Order History</h2>
              <span className="text-[#404943] text-xs font-bold bg-gray-100 hover:bg-gray-200/70 px-3 py-1 rounded-full transition-all ml-auto">
                {buyerOrders.length} Orders
              </span>
            </div>

            {/* Premium Harvest Voice Assistant Mic card banner */}
            <div className="bg-[#2d6a4f] text-[#a8e7c5] p-4.5 rounded-2xl flex items-center justify-between shadow-[0_4px_12px_rgba(45,106,79,0.12)] border border-[#0f5238]/10 text-left">
              <div className="flex-1 pr-3">
                <p className="font-sans font-bold text-sm text-white mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#a8e7c5] fill-[#a8e7c5]" />
                  Harvest Assistant
                </p>
                <p className="font-sans text-[#a8e7c5] text-[11px] leading-relaxed">
                  "Describe my last order" to get a detailed summary of your recent produce. Tap microphone helper suggestion.
                </p>
              </div>
              <button 
                onClick={() => handleAssistantSpeak()}
                className="bg-[#a8e7c5] hover:bg-[#b1f0ce] text-[#2d6a4f] p-2.5 rounded-full shadow active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                <Mic className="text-[#2d6a4f] fill-[#2d6a4f]" size={18} />
              </button>
            </div>

            {buyerOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm py-12 space-y-3">
                <p className="text-gray-400 text-sm">You haven't placed any direct orders yet.</p>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="bg-[#0f5238] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[#2d6a4f] shadow-sm transition-all"
                >
                  Order Fresh Harvest Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {buyerOrders.slice().reverse().map((order) => (
                  <div key={order.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4 text-left">
                    
                    {/* Card Header row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-0.5">{order.date}</p>
                        <h4 className="font-sans font-bold text-base text-gray-950">Order #{order.id}</h4>
                      </div>
                      <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                        order.status === 'Delivered' 
                          ? 'bg-[#a0f4c8] text-[#005236]' 
                          : order.status === 'Cancelled'
                            ? 'bg-[#e1e3e4] text-[#404943]'
                            : 'bg-[#ffdcbd] text-[#2c1600]'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Image avatars circle strip, spacing, custom billing */}
                    <div className="flex items-center justify-between gap-3 select-none">
                      <div className="flex items-center">
                        <div className="flex -space-x-3.5">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="w-11 h-11 rounded-full border-2 border-white bg-gray-50 overflow-hidden shadow-sm flex-shrink-0">
                              <img 
                                className="w-full h-full object-cover" 
                                alt={item.productName} 
                                src={getProductImage(item.productId)}
                              />
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="w-11 h-11 rounded-full border-2 border-white bg-[#e3e4e6] flex items-center justify-center text-[#404943] text-xs font-extrabold shadow-sm flex-shrink-0">
                              +{order.items.length - 2}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dotted Connection divider lines */}
                      <div className="flex-1 border-b border-dotted border-gray-300 mx-2 h-0" />

                      {/* Price tag */}
                      <p className={`font-sans font-extrabold text-lg text-right ${order.status === 'Cancelled' ? 'text-gray-400 line-through opacity-70' : 'text-[#0f5238]'}`}>
                        ${order.total.toFixed(2)}
                      </p>
                    </div>

                    {/* Workable action buttons section matching specs */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {order.status === 'Cancelled' ? (
                        <button 
                          disabled
                          className="py-2.5 rounded-full border border-gray-200 text-gray-300 text-xs font-bold font-sans cursor-not-allowed opacity-50 text-center uppercase tracking-wider"
                        >
                          Details
                        </button>
                      ) : (
                        <button 
                          onClick={() => setSelectedOrderDetail(order)}
                          className="py-2.5 rounded-full border border-[#0f5238] text-[#0f5238] hover:bg-[#0f5238]/5 text-xs font-bold font-sans transition-all text-center uppercase tracking-wider active:scale-95 cursor-pointer"
                        >
                          Details
                        </button>
                      )}

                      <button 
                        onClick={() => handleReorderItems(order)}
                        className={`py-2.5 rounded-full text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer uppercase tracking-wider ${
                          order.status === 'Cancelled'
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            : 'bg-[#0f5238] hover:bg-[#2d6a4f] text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px] leading-none">rebase_edit</span>
                        Reorder
                      </button>
                    </div>

                    {order.status !== 'Cancelled' && (
                      <button 
                        onClick={() => {
                          setSelectedTrackedOrder(order);
                          setActiveTab('live_tracking');
                          triggerNotification(`Opening tracking for Order #${order.id}`);
                        }}
                        className="w-full py-2.5 mt-1 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-[#0f5238]/90 text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer border border-[#0f5238]/10 text-center"
                      >
                        <span className="material-symbols-outlined text-[17px] leading-none text-[#2d6a4f] font-black animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>pedal_bike</span>
                        <span className="font-sans font-extrabold text-[11px] uppercase tracking-wider">Track Delivery Live</span>
                      </button>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cart Page / Your Harvest Basket Tab matching reference design */}
        {activeTab === 'cart' && (
          <div className="px-4 py-4 space-y-6 max-w-lg lg:max-w-screen-xl mx-auto text-left pb-24">
            {/* Cart Title and Info */}
            <section className="mb-4">
              <div className="flex flex-col gap-1">
                <span className="font-sans text-[10px] text-[#7d562d] font-extrabold uppercase tracking-widest block leading-none">Review Items</span>
                <div className="flex items-end justify-between gap-4">
                  <h2 className="font-sans font-extrabold text-2xl text-[#191c1d] tracking-tight leading-none mt-1">Your Harvest Basket</h2>
                  <p className="font-sans text-xs text-gray-500 font-medium">
                    {cart.reduce((s, i) => s + i.quantity, 0)} {cart.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'items'} from {Object.keys(groupedCartItems).length} {Object.keys(groupedCartItems).length === 1 ? 'farm' : 'farms'}
                  </p>
                </div>
              </div>
            </section>

            {cart.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-gray-100 p-8 text-center shadow-sm py-16 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0f5238] flex items-center justify-center mx-auto border border-emerald-100 animate-pulse">
                  <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-gray-900 text-base">Your Basket is Empty</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">You haven't selected any farm-fresh local items yet. Explore the harvest to find organic tomatoes, fruits, and greens!</p>
                </div>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="bg-[#0f5238] text-white px-6 py-2.5 rounded-full text-xs font-sans font-bold hover:bg-[#2d6a4f] shadow-sm transition-all cursor-pointer"
                >
                  Browse Fresh Harvest
                </button>
              </div>
            ) : (
              /* Bento Layout for Cart Items */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Column: Items grouped by farm */}
                <div className="lg:col-span-2 space-y-5">
                  {Object.values(groupedCartItems).map(({ farmer, items }) => (
                    <div key={farmer.id} className="bg-white rounded-[20px] shadow-[0_4px_12px_rgba(45,106,79,0.06)] overflow-hidden border border-gray-100 text-left">
                      
                      {/* Farm Header Panel */}
                      <div className="bg-emerald-50/40 px-4 py-3 flex items-center gap-2.5 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-full border-2 border-[#0f5238]/30 overflow-hidden bg-white flex-shrink-0">
                          <img 
                            alt={farmer.name} 
                            className="w-full h-full object-cover" 
                            src={farmer.avatar}
                          />
                        </div>
                        <div className="text-left flex-grow">
                          <h3 className="font-sans font-extrabold text-[#0f5238] text-sm leading-tight">{farmer.farmName}</h3>
                          <p className="text-[9px] text-[#7d562d] font-bold font-sans uppercase tracking-widest">{farmer.location || 'Local Fields'}</p>
                        </div>
                        <span className="bg-[#a0f4c8]/60 text-[#002113] px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider scale-95 origin-right">
                          Verified Source
                        </span>
                      </div>

                      {/* Items Row list */}
                      <div className="p-4 space-y-4">
                        {items.map((item, idx) => (
                          <div key={item.id}>
                            <div className="flex gap-4 items-center">
                              {/* Product Thumbnail image */}
                              <div className="w-18 h-18 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                <img 
                                  alt={item.product.name} 
                                  className="w-full h-full object-cover" 
                                  src={item.product.image}
                                />
                              </div>

                              {/* Middle specifications */}
                              <div className="flex-grow min-w-0 text-left">
                                <h4 className="font-sans font-bold text-sm text-[#191c1d] leading-snug truncate">{item.product.name}</h4>
                                <p className="font-sans text-[11.5px] text-gray-400 font-medium mt-0.5">
                                  {item.product.isOrganic ? 'Organic • ' : ''}{item.product.unit} pack • ${item.product.price.toFixed(2)}/{item.product.unit}
                                </p>
                                
                                {/* Controller buttons */}
                                <div className="flex items-center gap-2.5 mt-2.5">
                                  <button 
                                    onClick={() => updateCartQuantity(item.id, -1)}
                                    className="w-7 h-7 rounded-full bg-gray-50 text-gray-600 hover:text-[#0f5238] hover:bg-gray-100 flex items-center justify-center active:scale-95 transition-all border border-gray-100 shadow-xs cursor-pointer"
                                  >
                                    <Minus size={11} className="stroke-[3]" />
                                  </button>
                                  <span className="font-sans font-extrabold text-[#191c1d] text-xs w-5 text-center">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateCartQuantity(item.id, 1)}
                                    className="w-7 h-7 rounded-full bg-gray-50 text-gray-600 hover:text-[#0f5238] hover:bg-gray-100 flex items-center justify-center active:scale-95 transition-all border border-gray-100 shadow-xs cursor-pointer"
                                  >
                                    <Plus size={11} className="stroke-[3]" />
                                  </button>
                                </div>
                              </div>

                              {/* Right Pricing statistics & erase */}
                              <div className="text-right flex flex-col justify-between items-end self-stretch py-0.5">
                                <p className="font-sans font-extrabold text-[#0f5238] text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
                                <button 
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-gray-400 hover:text-red-500 hover:scale-105 active:scale-90 p-1 rounded-full transition-all cursor-pointer"
                                >
                                  <Trash2 size={13} className="text-gray-400" />
                                </button>
                              </div>
                            </div>

                            {idx < items.length - 1 && (
                              <hr className="border-gray-50 mt-4" />
                            )}
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}

                  {/* Voice Commands Suggestion Chips matches mockup style */}
                  <div className="flex flex-col gap-2 pt-2.5 text-left select-none">
                    <span className="font-sans font-extrabold text-[9px] text-[#7d562d] uppercase tracking-widest leading-none">Voice Shortcuts</span>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => {
                          setIsVoiceActive(true);
                          setTimeout(() => runVoiceCommand("Read my cart"), 600);
                        }}
                        className="bg-gray-100 hover:bg-gray-200/80 text-[#0f5238] px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px] font-bold">volume_up</span>
                        <span className="font-sans font-bold text-[11px]">"Read my cart"</span>
                      </button>
                      <button 
                        onClick={() => {
                          setIsVoiceActive(true);
                          const tomatoItem = cart.find(i => i.product.name.toLowerCase().includes('tomato'));
                          if (tomatoItem) {
                            setTimeout(() => {
                              removeFromCart(tomatoItem.id);
                              setIsVoiceActive(false);
                            }, 1000);
                          } else {
                            setTimeout(() => runVoiceCommand("Clear my whole cart"), 600);
                          }
                        }}
                        className="bg-gray-100 hover:bg-gray-200/80 text-[#0f5238] px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px] font-bold">delete_sweep</span>
                        <span className="font-sans font-bold text-[11px]">"Remove tomatoes"</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Summary & Checkout Details */}
                <aside className="space-y-4 lg:sticky lg:top-24">
                  <div className="bg-white p-5 rounded-[24px] shadow-[0_8px_24px_rgba(45,106,79,0.06)] border border-emerald-500/5 text-left">
                    <h3 className="font-sans font-extrabold text-[#191c1d] text-base mb-4 tracking-tight">Order Summary</h3>
                    
                    <div className="space-y-3 mb-5 text-left">
                      <div className="flex justify-between font-sans text-xs text-gray-500 font-semibold">
                        <span>Subtotal</span>
                        <span>${getCartTotal().toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between font-sans text-xs text-gray-500 font-semibold">
                        <span>Delivery Fee</span>
                        <span className="text-[#0f5238] font-bold uppercase tracking-wide text-[10px]">FREE</span>
                      </div>

                      {/* Farmer Support Tip Section with customizable options as a premium tier experience */}
                      <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                        <div className="flex justify-between font-sans text-xs text-gray-500 font-semibold">
                          <span>Farmer Support Tip</span>
                          <span className="text-[#191c1d] font-bold">${farmerTip.toFixed(2)}</span>
                        </div>
                        {/* Interactive tip adjustment pills */}
                        <div className="grid grid-cols-4 gap-1 pt-1 select-none">
                          {[0, 2, 5, 10].map(tipOption => (
                            <button
                              key={tipOption}
                              onClick={() => {
                                setFarmerTip(tipOption);
                                triggerNotification(`Farmer support tip updated to $${tipOption.toFixed(2)}`);
                              }}
                              className={`text-center py-1.5 rounded-lg text-[10px] font-extrabold transition-all border cursor-pointer ${
                                farmerTip === tipOption
                                  ? 'bg-[#0f5238] text-white border-transparent shadow-sm'
                                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
                              }`}
                            >
                              ${tipOption.toFixed(0)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <hr className="border-gray-100 my-4" />
                      
                      <div className="flex justify-between items-baseline">
                        <span className="font-sans font-extrabold text-[#191c1d] text-sm">Grand Total</span>
                        <span className="font-sans font-black text-2xl text-[#0f5238]">${(getCartTotal() + farmerTip).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Checkout CTA button */}
                    <button 
                      onClick={() => {
                        handleCheckout();
                        triggerNotification("Redirected you to secure checkout!");
                      }} 
                      className="w-full bg-[#0f5238] hover:bg-[#2d6a4f] text-white py-3.5 rounded-2xl font-sans font-bold text-xs tracking-wide active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/10 cursor-pointer"
                    >
                      Proceed to Checkout
                      <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
                    </button>
                    
                    <div className="mt-4 flex items-center gap-1.5 justify-center text-gray-400 font-sans text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-[13px]">verified_user</span>
                      <span>Secure payment powered by Harvest Direct</span>
                    </div>
                  </div>

                  {/* Farmer Impact Bento Story Card matching reference design */}
                  <div className="bg-[#ffca98]/20 border border-[#ffca98]/10 p-4.5 rounded-[20px] text-left">
                    <div className="flex gap-2.5 items-start">
                      <span className="material-symbols-outlined text-[#7a532a] text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                      <div className="space-y-1">
                        <p className="font-sans font-extrabold text-[#7a532a] text-xs">Your Impact</p>
                        <p className="font-sans text-[#7a532a] text-[11px] font-medium leading-relaxed">
                          This order supports {Object.keys(groupedCartItems).length} local growing {Object.keys(groupedCartItems).length === 1 ? 'family' : 'families'} and saves approx. {(cart.reduce((sum, item) => sum + item.quantity, 0) * 3).toFixed(1)}kg of CO2 compared to retail shipping.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>

              </div>
            )}

          </div>
        )}

        {/* Address Picker Tab */}
        {activeTab === 'address_picker' && (
          <div className="px-4 py-4 space-y-6 max-w-lg mx-auto text-left pb-24 font-sans leading-relaxed">
            
            {/* Custom Header Area resembling ref design TopAppBar */}
            <section className="flex items-center justify-between mb-4 mt-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="p-2 text-[#0f5238] active:scale-95 transition-transform duration-150 rounded-full hover:bg-emerald-50"
                >
                  <ArrowLeft size={22} className="stroke-[2.5]" />
                </button>
                <div className="text-left">
                  <span className="font-sans text-[10px] text-[#7d562d] font-extrabold uppercase tracking-widest block leading-none">Settings Tab</span>
                  <h2 className="font-sans font-extrabold text-xl text-[#191c1d] tracking-tight leading-none mt-1">Select Delivery Address</h2>
                </div>
              </div>
              <button 
                onClick={handleAddressVoiceClick}
                className={`p-2.5 rounded-full transition-all duration-150 relative ${
                  isAddressVoiceListening ? 'bg-red-50 text-red-600 animate-pulse' : 'text-[#0f5238] bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <Mic size={18} className="stroke-[2.5]" />
              </button>
            </section>

            {/* AI Voice Assistant Prompt matching reference design */}
            <section className="flex flex-col items-center">
              <div className="bg-emerald-50/40 p-6 rounded-3xl border border-emerald-100/40 w-full mb-1 relative overflow-hidden text-center shadow-xs">
                <div className="absolute -right-6 -top-6 opacity-5 select-none pointer-events-none">
                  <span className="material-symbols-outlined text-[130px]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                </div>
                <p className="font-sans font-extrabold text-lg text-[#0f5238] mb-4 leading-tight max-w-sm mx-auto">
                  "Where should we deliver your fresh harvest today?"
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 select-none">
                  <button 
                    onClick={handleAddressVoiceClick}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer ${
                      isAddressVoiceListening 
                        ? 'bg-red-500 text-white animate-pulse shadow-red-500/10' 
                        : 'bg-[#0f5238] text-white shadow-emerald-800/15 hover:bg-[#2d6a4f]'
                    }`}
                    style={{ animationDuration: '2s' }}
                  >
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                  </button>
                  <div className="text-left">
                    <p className={`font-sans text-xs font-extrabold ${isAddressVoiceListening ? 'text-red-500 animate-pulse' : 'text-[#7d562d]'}`}>
                      {isAddressVoiceListening ? 'Simulated AI listening...' : 'AI Voice Assistant ready!'}
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium max-w-[200px] leading-tight mt-0.5">
                      {isAddressVoiceListening ? addressVoiceStatus : 'Click microphone or say "Deliver to Laurelwood" to test voice input.'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Search Bar matching mockup design */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
              <input 
                type="text"
                placeholder="Search or type a new address..."
                value={addressSearchQuery}
                onChange={(e) => setAddressSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && addressSearchQuery.trim()) {
                    const typed = addressSearchQuery.trim();
                    setAddressesList(prev => [...prev, typed]);
                    setSelectedAddressIndex(addressesList.length);
                    setAddressSearchQuery('');
                    triggerNotification(`Saved custom address: "${typed}"`);
                  }
                }}
                className="w-full pl-11 pr-16 py-4 bg-white rounded-2xl border border-gray-100 shadow-xs focus:ring-2 focus:ring-[#0f5238] font-sans text-sm text-on-background placeholder:text-gray-400 outline-none transition-all"
              />
              <button 
                onClick={() => {
                  if (addressSearchQuery.trim()) {
                    const typed = addressSearchQuery.trim();
                    setAddressesList(prev => [...prev, typed]);
                    setSelectedAddressIndex(addressesList.length);
                    setAddressSearchQuery('');
                    triggerNotification(`Saved custom address: "${typed}"`);
                  }
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-[#0f5238] hover:bg-[#2d6a4f] text-white px-3.5 py-1.5 rounded-xl text-[11px] font-sans font-extrabold transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                Find & Add
              </button>
            </div>

            {/* Mini Map Section matching high-fidelity reference design */}
            <section className="overflow-hidden rounded-3xl shadow-[0_6px_16px_rgba(45,106,79,0.06)] bg-white border border-gray-100">
              <div className="h-44 w-full relative">
                <img 
                  className="w-full h-full object-cover opacity-95" 
                  alt="Minimalist digital suburban map"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiBS2E-rW3IICGrYPtn9NZAE1xAi5-Drz3yCHNZyCIkxsPrv12uApSk-ZzyXduQOwHGZx8CRUQwud6KBNVsXKrrbTUeuiR-MTNN6col0tG-g1E6V5Uh5L-02tZTy2dDZog-VHL6TkWaugWv_n6WGzEe8EnLP23GKpnzezubjy4jpFr4A6e_mzWFqupdLodPwLaxw2C31No7Lac6EtokKvj8he5W31KQXAx7lqt-klgq_uySfXLgBP83HgSfBS0kwDBUD43cb4izhwK"
                />
                
                {/* Floating Map Controls */}
                <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
                  <button 
                    onClick={() => triggerNotification("Centered GPS alignment on mobile")}
                    className="bg-white p-2 text-xs rounded-xl shadow-md text-[#0f5238] active:scale-90 transition-transform cursor-pointer flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px] block">my_location</span>
                  </button>
                  <button 
                    onClick={() => triggerNotification("Zoom level updated")}
                    className="bg-white p-2 text-xs rounded-xl shadow-md text-[#0f5238] active:scale-90 transition-transform cursor-pointer flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px] block">add</span>
                  </button>
                </div>

                {/* Current Location Badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-xs flex items-center gap-2 border border-emerald-500/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0f5238]"></span>
                  </span>
                  <span className="font-sans font-bold text-[10px] text-[#0f5238] uppercase tracking-wider">Current Location</span>
                </div>
              </div>

              <div className="p-4 flex justify-between items-start bg-white border-t border-gray-50">
                <div className="text-left">
                  <h3 className="font-sans font-extrabold text-[#191c1d] text-sm">Portland, SE Division St</h3>
                  <p className="font-sans text-xs text-gray-400 font-semibold mt-0.5">Your GPS indicates you are here</p>
                </div>
                <button 
                  onClick={() => triggerNotification("Re-mapping coordinates details...")}
                  className="text-[#0f5238] font-sans text-xs font-extrabold hover:underline cursor-pointer"
                >
                  Refine
                </button>
              </div>
            </section>

            {/* Saved Places List matching design */}
            <section className="space-y-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-sans font-black text-base text-[#191c1d] tracking-tight">Saved Places</h3>
                <button 
                  onClick={() => {
                    const customAddressName = prompt("Enter a new delivery address:") || "";
                    if (customAddressName.trim()) {
                      setAddressesList(prev => [...prev, customAddressName.trim()]);
                      setSelectedAddressIndex(addressesList.length);
                      triggerNotification(`Saved custom address: "${customAddressName.trim()}"`);
                    }
                  }}
                  className="text-[#0f5238] font-sans font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">add_circle</span>
                  Add New
                </button>
              </div>

              <div className="space-y-3">
                {addressesList.map((addr, idx) => {
                  const isSelected = selectedAddressIndex === idx;
                  
                  // Decide which icon to use
                  let iconComponent = <MapPin size={20} className="text-[#0f5238]" />;
                  let addressTitle = "Saved Address";
                  let addressDetail = addr;

                  if (addr.toLowerCase().includes('home')) {
                    iconComponent = <Home size={20} className="text-[#0f5238]" />;
                    addressTitle = "Home";
                    addressDetail = addr.replace(/^Home Dropoff:\s*/i, '').replace(/^Home:\s*/i, '');
                  } else if (addr.toLowerCase().includes('work') || addr.toLowerCase().includes('office')) {
                    iconComponent = <Briefcase size={20} className="text-[#7d562d]" />;
                    addressTitle = "Work";
                    addressDetail = addr.replace(/^Work:\s*/i, '').replace(/^Office:\s*/i, '');
                  } else if (addr.toLowerCase().includes('mother') || addr.toLowerCase().includes('baker') || addr.toLowerCase().includes('history')) {
                    iconComponent = <ClockIcon size={20} className="text-gray-500" />;
                    addressTitle = "Mother's House";
                    addressDetail = addr.replace(/^Mother's House:\s*/i, '').replace(/^Mother:\s*/i, '');
                  } else if (addr.toLowerCase().includes('hub') || addr.toLowerCase().includes('lane')) {
                    iconComponent = <ShieldCheck size={20} className="text-emerald-700" />;
                    const parts = addr.split(':');
                    addressTitle = parts[0] || "Harvest Hub";
                    addressDetail = parts[1]?.trim() || addr;
                  }

                  return (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSelectedAddressIndex(idx);
                        triggerNotification(`Delivery spot set to: ${addressTitle}`);
                      }}
                      className={`group flex items-center p-4 bg-white rounded-2xl border-[2.5px] transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'border-[#0f5238] bg-[#0f5238]/[0.02] shadow-[0_4px_12px_rgba(15,82,56,0.06)]' 
                          : 'border-[#bfc9c1]/10 bg-white/70 hover:border-gray-200 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center mr-4 transition-transform group-hover:scale-105 ${
                        isSelected 
                          ? 'bg-[#0f5238] text-white shadow-md shadow-emerald-950/15' 
                          : 'bg-[#ffca98]/15 text-[#7a532a]'
                      }`}>
                        {React.cloneElement(iconComponent, { className: isSelected ? 'text-white' : iconComponent.props.className })}
                      </div>
                      
                      <div className="flex-grow min-w-0 text-left">
                        <h4 className="font-sans font-extrabold text-sm text-[#191c1d] flex items-center gap-2">
                          {addressTitle}
                          {isSelected && (
                            <span className="bg-[#a0f4c8] text-[#002113] text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full scale-90 tracking-wide origin-left">
                              Active
                            </span>
                          )}
                        </h4>
                        <p className="font-sans text-[11.5px] text-gray-400 font-medium truncate mt-0.5 leading-none">
                          {addressDetail}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`material-symbols-outlined text-[20px] transition-all ${
                          isSelected ? 'text-[#0f5238] font-black' : 'text-gray-300'
                        }`}>
                          {isSelected ? 'check_circle' : 'chevron_right'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* CTA Confirm Location button */}
            <button 
              onClick={() => {
                const currentPlaceStr = addressesList[selectedAddressIndex]?.split(':')[0] || addressesList[selectedAddressIndex] || "Selected Location";
                triggerNotification(`Confirmed shipping destination: ${currentPlaceStr}!`);
                setActiveTab('profile');
              }} 
              className="w-full bg-[#0f5238] hover:bg-[#2d6a4f] text-white py-4 rounded-full font-sans font-bold text-sm tracking-wide active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/10 cursor-pointer mt-2"
            >
              Confirm Location
              <span className="material-symbols-outlined text-sm font-black">check_circle</span>
            </button>
            
          </div>
        )}

        {/* Live Delivery Partner Location Tab */}
        {activeTab === 'live_tracking' && (
          <div className="px-4 py-4 space-y-6 max-w-lg mx-auto text-left pb-24 font-sans leading-relaxed">
            
            {/* Custom Header Bar resembling TopAppBar */}
            <section className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="p-2 text-[#0f5238] active:scale-95 transition-transform duration-150 rounded-full hover:bg-emerald-50"
                >
                  <ArrowLeft size={22} className="stroke-[2.5]" stroke="#0f5238" />
                </button>
                <div className="text-left">
                  <span className="font-sans text-[10px] text-[#7d562d] font-extrabold uppercase tracking-widest block leading-none">Order Tracking</span>
                  <h2 className="font-sans font-extrabold text-xl text-[#191c1d] tracking-tight leading-none mt-1">Live Delivery Map</h2>
                </div>
              </div>
              <button 
                onClick={() => {
                  triggerNotification("Activating Voice Assistant intercom...");
                  handleAddressVoiceClick();
                }}
                className={`p-2.5 rounded-full transition-all duration-150 relative ${
                  isAddressVoiceListening ? 'bg-red-50 text-red-600 animate-pulse' : 'text-[#0f5238] bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <Mic size={18} className="stroke-[2.5]" />
              </button>
            </section>

            {/* Simulated Live Map Canvas with moving cyclist */}
            <section className="overflow-hidden rounded-[32px] shadow-[0_8px_24px_rgba(45,106,79,0.06)] bg-white border border-gray-100 relative">
              <div className="h-[360px] w-full relative bg-[#eef1ed] overflow-hidden select-none">
                {/* Clean Suburban Map Image Mockup */}
                <img 
                  className="w-full h-full object-cover opacity-90 transition-opacity duration-300 pointer-events-none" 
                  alt="Minimalist high-fidelity digital delivery route map"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDznCkVz1EHUViSEuSoqGG452j0Mcbu42Nw42V9X79Jn4HNacu8I0ykpKPTiqubohYT7u5Oq83WPp8-fu9wOy6r2l_K3c8geG7H8kDrOjlA5Tuz1KnQJO9OZQftLECpqfbrJdCDcj4O5BDqtbIBhmgTQrnImpZ8134TaNLIWzNLu_tpPzkC5JudSuPRKun4UlVmEGjnzqlpQwKWTOZK6mF68zOmVCActT1mEximXs4J4tKXKs4gqIsY2FcoI1hH6ub2HMK3n2tD5XD0"
                />

                {/* Simulated Path SVG Drawing */}
                <svg className="absolute inset-0 pointer-events-none w-full h-full" viewBox="0 0 400 360" preserveAspectRatio="none">
                  {/* Route highlight line */}
                  <path 
                    d="M 50 120 C 130 150, 180 110, 260 210 S 330 250, 310 260" 
                    fill="none" 
                    stroke="#2d6a4f" 
                    strokeWidth="4.5" 
                    strokeLinecap="round" 
                    strokeDasharray="8 6" 
                    className="opacity-70 animate-[dash_4s_linear_infinite]" 
                  />
                </svg>

                {/* Interactive Compass / Navigation Path Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                  <button 
                    onClick={() => {
                      setDeliveryCoord(prev => ({ ...prev, progressStep: 0, x: -85, y: -35 }));
                      triggerNotification("Recalibrating GPS path alignment...");
                    }}
                    className="bg-white hover:bg-gray-50 p-2.5 rounded-2xl shadow-lg text-[#0f5238] active:scale-90 transition-transform cursor-pointer flex items-center justify-center border border-gray-100"
                    title="Recenter GPS"
                  >
                    <span className="material-symbols-outlined text-[20px] block">my_location</span>
                  </button>
                  <button 
                    onClick={() => {
                      triggerNotification("Zooming location perspective...");
                    }}
                    className="bg-white hover:bg-gray-50 p-2.5 rounded-2xl shadow-lg text-[#0f5238] active:scale-90 transition-transform cursor-pointer flex items-center justify-center border border-gray-100"
                    title="Zoom in Map"
                  >
                    <span className="material-symbols-outlined text-[20px] block">add_circle</span>
                  </button>
                </div>

                {/* Floating Destination Home Pin */}
                <div className="absolute" style={{ right: '23%', bottom: '26%' }}>
                  <div className="relative">
                    <span className="absolute -inset-2.5 bg-emerald-500/20 rounded-full animate-ping h-11 w-11"></span>
                    <div className="relative bg-[#7d562d] text-white p-2.5 rounded-full shadow-md border-[2.5px] border-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] block" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                    </div>
                  </div>
                  <div className="mt-1 bg-white border border-gray-100 shadow-sm px-2 py-0.5 rounded-lg text-[9px] font-extrabold text-gray-800 tracking-tight whitespace-nowrap text-center">
                    Your Address
                  </div>
                </div>

                {/* Simulated Live Moving Bicycle Indicator along the street coordinates */}
                <div 
                  className="absolute transition-all duration-300 ease-out"
                  style={{ 
                    left: '52%', 
                    top: '44%',
                    transform: `translate(calc(-50% + ${deliveryCoord.x}px), calc(-50% + ${deliveryCoord.y}px))` 
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    <div className="bg-[#0f5238] hover:bg-[#2d6a4f] text-white p-3 rounded-full shadow-xl border-[2.5px] border-white flex items-center justify-center cursor-pointer transition-transform duration-100 hover:scale-110 active:scale-90">
                      <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>pedal_bike</span>
                    </div>
                    
                    <div className="mt-1.5 bg-white shadow-md border border-gray-100/60 px-2.5 py-0.5 rounded-full text-[9px] font-black text-[#0f5238] flex items-center gap-1 uppercase tracking-wider select-none">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Active Live
                    </div>
                  </div>
                </div>

                {/* Harvest Voice Assistant Top Intercom Banner */}
                <div className="absolute top-4 left-4 right-4 z-10">
                  <div className="bg-[#2d6a4f]/95 backdrop-blur-md text-[#a8e7c5] p-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/20 text-left">
                    <div className="relative flex-shrink-0">
                      <span className="absolute inset-0 bg-emerald-400/30 rounded-full animate-ping"></span>
                      <div className="relative bg-[#0f5238] text-white p-2 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] block animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-black text-amber-200 block mt-0.5">Harvest Assistant Intercom</span>
                      <p className="font-sans font-bold text-white text-[12px] leading-tight">
                        "Your harvest container is {(trackingTimeRemaining * 0.12).toFixed(2)} miles away on Division St!"
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Map footer address details */}
              <div className="p-4 flex justify-between items-center bg-white border-t border-gray-50">
                <div className="text-left">
                  <h3 className="font-sans font-black text-[#191c1d] text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0f5238] text-[18px]">location_on</span>
                    {addressesList[selectedAddressIndex]?.replace(/^Home Dropoff:\s*/i, '').replace(/^Home:\s*/i, '') || "Portland Courier Hub"}
                  </h3>
                  <p className="font-sans text-[11px] text-gray-400 font-semibold mt-0.5">Marcus is pedaling towards this verified spot</p>
                </div>
                <span className="bg-emerald-50 border border-emerald-100 text-[#0f5238] text-[10px] font-black uppercase px-2.5 py-1 rounded-xl">
                  GPS Active
                </span>
              </div>
            </section>

            {/* Live Progress Card */}
            <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_16px_rgba(45,106,79,0.03)] space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-sans font-extrabold text-2xl text-gray-900 tracking-tight">
                      Arriving in {trackingTimeRemaining} mins
                    </h2>
                    {/* Time remaining fast-track interactive testing controller buttons */}
                    <div className="flex items-center bg-gray-50 border border-gray-150 rounded-xl overflow-hidden scale-95">
                      <button 
                        onClick={() => {
                          if (trackingTimeRemaining > 1) {
                            setTrackingTimeRemaining(t => t - 1);
                            triggerNotification("Advanced courier travel progress!");
                          } else {
                            triggerNotification("Courier is right outside!");
                          }
                        }}
                        className="p-1 px-2.5 text-xs text-semibold text-[#0f5238] hover:bg-emerald-50 active:scale-95 text-center cursor-pointer font-bold font-mono"
                        title="Simulate travel fast-foward"
                      >
                        -1m
                      </button>
                      <button 
                        onClick={() => {
                          setTrackingTimeRemaining(t => t + 2);
                          triggerNotification("Delayed courier simulation!");
                        }}
                        className="p-1 px-2 text-xs text-semibold text-gray-500 hover:bg-gray-150 active:scale-95 text-center cursor-pointer border-l border-gray-150 font-bold font-mono"
                        title="Simulate delay"
                      >
                        +2m
                      </button>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-gray-400 font-semibold flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[14px]">distance</span>
                    <span>1.4 miles away</span>
                    <span className="text-gray-300">•</span>
                    <span>Estimating 2:45 PM arrivals</span>
                  </p>
                </div>
                <div className="bg-[#a0f4c8] text-[#002113] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-xs tracking-wider">
                  On Time
                </div>
              </div>

              {/* Four Step High Fidelity Progress Line */}
              <div className="relative pt-2">
                {/* Horizontal Bar back */}
                <div className="absolute top-5 left-3.5 right-3.5 h-[3px] bg-gray-100 -translate-y-1/2 rounded-full" />
                {/* Animated Green progress line depending on simulation time */}
                <div 
                  className="absolute top-5 left-3.5 h-[3.5px] bg-[#0f5238] -translate-y-1/2 rounded-full transition-all duration-500" 
                  style={{ width: trackingTimeRemaining <= 2 ? '95%' : trackingTimeRemaining <= 6 ? '68%' : '68%' }}
                />

                <div className="relative flex justify-between">
                  {/* Step 1: Harvested */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#0f5238] text-white border-2 border-white shadow-md flex items-center justify-center z-10 transition-all">
                      <span className="material-symbols-outlined text-xs font-bold">check</span>
                    </div>
                    <span className="font-sans text-[10px] font-bold text-gray-400 mt-2.5 tracking-tight uppercase">Harvested</span>
                  </div>

                  {/* Step 2: Packed */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#0f5238] text-white border-2 border-white shadow-md flex items-center justify-center z-10 transition-all">
                      <span className="material-symbols-outlined text-xs font-bold">check</span>
                    </div>
                    <span className="font-sans text-[10px] font-bold text-gray-400 mt-2.5 tracking-tight uppercase">Packed</span>
                  </div>

                  {/* Step 3: En Route */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#0f5238] text-white border-4 border-emerald-500/10 shadow-lg flex items-center justify-center z-10 animate-pulse">
                      <span className="material-symbols-outlined text-xs font-black">pedal_bike</span>
                    </div>
                    <span className="font-sans text-[10.5px] font-black text-[#0f5238] mt-2.5 tracking-tight uppercase">En Route</span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 transition-all ${
                      trackingTimeRemaining <= 1 ? 'bg-[#0f5238] text-white' : 'bg-gray-100 text-gray-300'
                    }`}>
                      <span className="material-symbols-outlined text-xs">home</span>
                    </div>
                    <span className={`font-sans text-[10px] font-bold mt-2.5 tracking-tight uppercase ${
                      trackingTimeRemaining <= 1 ? 'text-[#0f5238] font-black' : 'text-gray-300'
                    }`}>Delivered</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Courier Profile & Interactive Live Chat */}
            <section className="bg-white rounded-3xl p-4.5 border border-gray-100 shadow-[0_4px_16px_rgba(45,106,79,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5 text-left">
                  <div className="relative">
                    <div className="w-13 h-13 rounded-full border-2 border-[#0f5238] overflow-hidden shadow-md">
                      <img 
                        alt="Delivery partner Marcus Wilson portrait" 
                        className="w-full h-full object-cover" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAe45nNH0pwT7cH2TbvdheJavqcJPDzf3e-oUs7s2I9xKQTB9TwToEuAnsq_mtGF2zjZFoLR0lDjDXXr7gSipl0YQ9caF3XON6JuxsZrlNTKO2OSNf1XL3CG0e7-mGckqfSIEXXvP0kJ2VgBBvFCnxZBmK2i9dABntBlVVBuGQETpLNdB0OLUfFaq6imqlaEUorkQdBg3YvNF6aV8aBiOe7TmDubUHEkF353i9rtBeb8NvNpCHEexZYCL26zPsMBBsJ-9xMZZuaRq9n"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-[#7d562d] text-white p-1 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[9px] block font-black leading-none">verified</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-gray-950 text-base leading-tight">Marcus Wilson</h3>
                    <div className="flex items-center gap-1 mt-0.5 select-none text-left">
                      <span className="material-symbols-outlined text-[13px] text-amber-500 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-sans text-[11px] text-gray-500 font-semibold">4.9 • Verified Farm Courier</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsChattingWithMarcus(prev => !prev);
                    triggerNotification(isChattingWithMarcus ? "Intercom chat closed" : "Opened secure courier chat!");
                  }}
                  className={`px-4 py-2.5 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border ${
                    isChattingWithMarcus 
                      ? 'bg-amber-50 border-amber-200 text-[#7a532a]' 
                      : 'bg-[#0f5238] hover:bg-[#2d6a4f] text-white border-transparent shadow-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm font-black">chat</span>
                  {isChattingWithMarcus ? 'Close Chat' : 'Contact'}
                </button>
              </div>

              {/* Chat Tray Slide-down segment inside high-fidelity screen */}
              {isChattingWithMarcus && (
                <div className="mt-2 border-t border-gray-100 pt-3 text-left space-y-3.5 bg-gray-50/50 p-3 rounded-2xl border border-gray-50 animate-in slide-in-from-top-3 duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-100/50">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Secure Direct Intercom Connection</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>

                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-0.5">
                    {marcusMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[85%] ${msg.sender === 'me' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className={`p-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                          msg.sender === 'me' 
                            ? 'bg-[#0f5238] text-white rounded-tr-none' 
                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[8.5px] text-gray-400 font-semibold mt-0.5 px-1">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Suggestion prompt helpers to type verbal queries instantly */}
                  <div className="flex flex-wrap gap-1.5 select-none pt-1">
                    <button 
                      onClick={() => {
                        const txt = "Where are you currently?";
                        setChatInputText(txt);
                      }}
                      className="bg-white hover:bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-lg border border-gray-150 cursor-pointer"
                    >
                      "Where are you?"
                    </button>
                    <button 
                      onClick={() => {
                        const txt = "Are the eggs safe?";
                        setChatInputText(txt);
                      }}
                      className="bg-white hover:bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-lg border border-gray-150 cursor-pointer"
                    >
                      "Are the eggs safe?"
                    </button>
                    <button 
                      onClick={() => {
                        const txt = "Thank you Marcus!";
                        setChatInputText(txt);
                      }}
                      className="bg-white hover:bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-lg border border-gray-150 cursor-pointer"
                    >
                      "Thank you!"
                    </button>
                  </div>

                  {/* Chat input keyboard and button */}
                  <div className="flex gap-1.5 items-center relative">
                    <input 
                      type="text"
                      placeholder="Type a secure message to Marcus..."
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatInputText.trim()) {
                          const input = chatInputText.trim();
                          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          setMarcusMessages(prev => [...prev, { sender: 'me', text: input, time: timestamp }]);
                          setChatInputText('');
                          
                          // Simulated Response generator
                          setTimeout(() => {
                            let responseText = "Awesome! I am pedaling as fast as I can to bring your organic goods fresh from the soil. Let me know if you have any special gate codes or drop-off guidelines!";
                            
                            const normalized = input.toLowerCase();
                            if (normalized.includes('where') || normalized.includes('how far') || normalized.includes('location')) {
                              responseText = "Hey! Just turned off Southeast 12th near Laurelwood Blvd. I'm hitting a tiny bit of red light but should see you in about 5 minutes!";
                            } else if (normalized.includes('egg') || normalized.includes('safe') || normalized.includes('broken')) {
                              responseText = "Absolutely! I packed them in a custom insulated paper nest near the center of the crate so they do not slide around at all. Pristine eggs guaranteed!";
                            } else if (normalized.includes('thank') || normalized.includes('thanks') || normalized.includes('cool')) {
                              responseText = "You're very welcome! Supporting sustainable backyard farming like you do is the best part of my daily courier route.";
                            }
                            
                            setMarcusMessages(prev => [...prev, { sender: 'marcus', text: responseText, time: timestamp }]);
                            triggerNotification("Received answer from Marcus! 💬");
                          }, 1200);
                        }
                      }}
                      className="w-full bg-white border border-gray-150 rounded-xl pr-14 pl-3 py-2.5 text-xs focus:ring-2 focus:ring-[#0f5238] focus:border-[#0f5238] outline-none text-gray-800 placeholder:text-gray-400"
                    />
                    <button 
                      onClick={() => {
                        if (chatInputText.trim()) {
                          const input = chatInputText.trim();
                          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          setMarcusMessages(prev => [...prev, { sender: 'me', text: input, time: timestamp }]);
                          setChatInputText('');
                          
                          // Simulated Response generator
                          setTimeout(() => {
                            let responseText = "Awesome! I am pedaling as fast as I can to bring your organic goods fresh from the soil. Let me know if you have any special gate codes or drop-off guidelines!";
                            
                            const normalized = input.toLowerCase();
                            if (normalized.includes('where') || normalized.includes('how far') || normalized.includes('location')) {
                              responseText = "Hey! Just turned off Southeast 12th near Laurelwood Blvd. I'm hitting a tiny bit of red light but should see you in about 5 minutes!";
                            } else if (normalized.includes('egg') || normalized.includes('safe') || normalized.includes('broken')) {
                              responseText = "Absolutely! I packed them in a custom insulated paper nest near the center of the crate so they do not slide around at all. Pristine eggs guaranteed!";
                            } else if (normalized.includes('thank') || normalized.includes('thanks') || normalized.includes('cool')) {
                              responseText = "You're very welcome! Supporting sustainable backyard farming like you do is the best part of my daily courier route.";
                            }
                            
                            setMarcusMessages(prev => [...prev, { sender: 'marcus', text: responseText, time: timestamp }]);
                            triggerNotification("Received answer from Marcus! 💬");
                          }, 1200);
                        }
                      }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#0f5238] text-white hover:bg-[#2d6a4f] rounded-lg cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px] block leading-none">send</span>
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Tracked items detailed product lists */}
            <section className="space-y-3.5">
              <h3 className="font-sans font-black text-sm text-[#191c1d] uppercase tracking-wider px-1">
                Harvest Container Contents
              </h3>

              <div className="space-y-3">
                {(() => {
                  // If high-fidelity selected order is active, list its real items. Else list the seed items.
                  if (selectedTrackedOrder && selectedTrackedOrder.items && selectedTrackedOrder.items.length > 0) {
                    return selectedTrackedOrder.items.map((item, idx) => {
                      // Lookup a product thumbnail image or fallback nicely
                      return (
                        <div key={idx} className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-gray-150 shadow-xs text-left">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                              <img 
                                alt={item.productName} 
                                className="w-full h-full object-cover" 
                                src={getProductImage(item.productId)}
                              />
                            </div>
                            <div>
                              <h4 className="font-sans font-bold text-sm text-gray-950">{item.productName}</h4>
                              <p className="font-sans text-[11px] text-gray-400 font-medium">Quantity: {item.quantity} x {item.unit}</p>
                            </div>
                          </div>
                          <span className="font-sans font-extrabold text-sm text-[#0f5238]">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    });
                  } else {
                    // Pre-seeded items matching the high-fidelity mockups of the reference page
                    return (
                      <>
                        {/* Mock item 1: Fresh Leafy Kale */}
                        <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-gray-150 shadow-xs text-left">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0f5238] flex items-center justify-center border border-emerald-100 flex-shrink-0">
                              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                            </div>
                            <div>
                              <h4 className="font-sans font-bold text-sm text-gray-950">Organic Green Curly Kale</h4>
                              <p className="font-sans text-[11px] text-gray-400 font-medium">Quantity: 2 Bunches (Direct Harvest)</p>
                            </div>
                          </div>
                          <span className="font-sans font-extrabold text-sm text-[#0f5238]">$5.90</span>
                        </div>

                        {/* Mock item 2: Organic Fuji Apples */}
                        <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-gray-150 shadow-xs text-left">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#7d562d] flex items-center justify-center border border-orange-100 flex-shrink-0">
                              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
                            </div>
                            <div>
                              <h4 className="font-sans font-bold text-sm text-gray-950">Organic Honeycrisp Apples</h4>
                              <p className="font-sans text-[11px] text-gray-400 font-medium">Quantity: 3 lbs (Riverbend Orchards)</p>
                            </div>
                          </div>
                          <span className="font-sans font-extrabold text-sm text-[#0f5238]">$6.75</span>
                        </div>

                        {/* Mock item 3: Pasture Raised Organic Eggs */}
                        <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-gray-150 shadow-xs text-left">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100/50 flex-shrink-0">
                              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>egg</span>
                            </div>
                            <div>
                              <h4 className="font-sans font-bold text-sm text-gray-950">Pastured Farmyard Eggs</h4>
                              <p className="font-sans text-[11px] text-gray-400 font-medium">Quantity: 1 Dozen (Pristine Grade A)</p>
                            </div>
                          </div>
                          <span className="font-sans font-extrabold text-sm text-[#0f5238]">$4.50</span>
                        </div>
                      </>
                    );
                  }
                })()}
              </div>
            </section>

          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-md mx-auto text-left pb-24 px-4">
            {/* Profile Hero Section */}
            <section className="flex flex-col items-center py-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-[#0f5238] p-1 overflow-hidden shadow-lg bg-white">
                  <img 
                    alt={profileName} 
                    className="w-full h-full object-cover rounded-full" 
                    src={profileAvatar}
                  />
                </div>
                <button 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="absolute bottom-1 right-1 bg-[#0f5238] text-white p-2 rounded-full shadow-md active:scale-90 hover:bg-[#2d6a4f] transition-all"
                >
                  <Pencil size={18} />
                </button>
              </div>
              <h2 className="mt-4 text-[#191c1d] font-bold text-xl">{profileName}</h2>
              <p className="text-xs text-[#404943] font-medium">Member since October 2023</p>
            </section>

            {/* Sustainability Impact Bento Grid */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-[#404943] px-1 uppercase tracking-wider">Sustainability Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#0f5238] to-[#106d4b] col-span-2 p-6 rounded-2xl text-white shadow-[0_4px_12px_rgba(45,106,79,0.12)] relative overflow-hidden">
                  <div className="relative z-10 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">Total Carbon Saved</p>
                    <p className="text-4xl font-extrabold font-sans mt-1.5 text-white">42.8 kg</p>
                    <p className="text-xs mt-3 opacity-80 leading-relaxed font-sans">
                      Equivalent to planting 2.1 trees this year by sourcing from local farmers.
                    </p>
                  </div>
                  <span className="absolute -right-4 -bottom-4 opacity-10 text-white pointer-events-none">
                    <Sparkles size={120} className="fill-white" />
                  </span>
                </div>

                <div className="bg-[#f3f4f5] p-4 rounded-xl border border-[#bfc9c1]/30 flex flex-col justify-between h-32 shadow-sm text-left">
                  <Truck size={22} className="text-[#0f5238]" />
                  <div>
                    <p className="text-lg font-extrabold font-sans text-[#0f5238]">124 km</p>
                    <p className="text-[11px] font-medium text-gray-500">Avg. Travel Distance</p>
                  </div>
                </div>

                <div className="bg-[#f3f4f5] p-4 rounded-xl border border-[#bfc9c1]/30 flex flex-col justify-between h-32 shadow-sm text-left">
                  <span className="text-xl">🌿</span>
                  <div>
                    <p className="text-lg font-extrabold font-sans text-emerald-800">Organic</p>
                    <p className="text-[11px] font-medium text-gray-500">92% of Cart</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Settings & Information */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-[#404943] px-1 uppercase tracking-wider">Account &amp; Details</h3>
              
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-150">
                {/* Order History */}
                <button 
                  onClick={() => {
                    setActiveTab('orders');
                    triggerNotification("Opened past order receipts");
                  }}
                  className="w-full flex items-center justify-between p-4 active:bg-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#b1f0ce]/55 p-2.5 rounded-xl text-[#0f5238]">
                      <span className="material-symbols-outlined text-[20px] font-extrabold block">receipt_long</span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-[#191c1d]">Order History</p>
                      <p className="text-xs text-gray-400 font-medium">View receipts ({orders.length} total)</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
                <div className="h-[1px] bg-gray-100 mx-4"></div>

                {/* Saved Addresses */}
                <button 
                  onClick={() => setActiveTab('address_picker')}
                  className="w-full flex items-center justify-between p-4 active:bg-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#2d6a4f]/10 p-2.5 rounded-xl text-[#0f5238]">
                      <MapPin size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-[#191c1d]">Saved Addresses</p>
                      <p className="text-xs text-gray-400 font-medium">{addressesList.length} locations saved</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
                <div className="h-[1px] bg-gray-100 mx-4"></div>

                {/* Payment Methods */}
                <button 
                  onClick={() => setIsPaymentsOpen(true)}
                  className="w-full flex items-center justify-between p-4 active:bg-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#ffca98]/20 p-2.5 rounded-xl text-[#7d562d]">
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-[#191c1d]">Payment Methods</p>
                      <p className="text-xs text-gray-400 font-medium">
                        {paymentMethods.length > 0 ? `${paymentMethods[0].type} ending in ${paymentMethods[0].last4}` : 'No credit card connected'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
                <div className="h-[1px] bg-gray-100 mx-4"></div>

                {/* Account Settings */}
                <button 
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="w-full flex items-center justify-between p-4 active:bg-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-2.5 rounded-xl text-gray-600">
                      <Settings size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-[#191c1d]">Account Settings</p>
                      <p className="text-xs text-gray-400 font-medium">Security, Notifications, Privacy</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>

                {/* Switch to Farmer panel capability */}
                {currentUser.role === 'farmer' || currentUser.email === 'silas@acresandoak.com' || currentUser.email === 'thomas@wayne.com' ? (
                  <>
                    <div className="h-[1px] bg-gray-100 mx-4"></div>
                    <button 
                      onClick={onSwitchToFarmer}
                      className="w-full flex items-center justify-between p-4 active:bg-emerald-50 hover:bg-emerald-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-emerald-100 p-2.5 rounded-xl text-[#0f5238]">
                          <CheckCircle size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm text-[#0f5238]">Switch to Farm Panel</p>
                          <p className="text-xs text-emerald-600 font-medium">Manage harvest inventories</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#0f5238]" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="h-[1px] bg-gray-100 mx-4"></div>
                    <button 
                      onClick={() => {
                        currentUser.role = 'farmer';
                        onSwitchToFarmer();
                        triggerNotification("Upgraded account to Farm Supplier mode!");
                      }}
                      className="w-full flex items-center justify-between p-4 active:bg-amber-50 hover:bg-amber-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-100/60 p-2.5 rounded-xl text-[#7d562d]">
                          <CheckCircle size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm text-[#7d562d]">Supply Local Produce</p>
                          <p className="text-xs text-amber-600 font-medium font-sans">Connect your farm setup</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#7d562d]" />
                    </button>
                  </>
                )}
              </div>
            </section>

            {/* Help & Support */}
            <section className="pb-12 text-left">
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-4 text-[#ba1a1a] font-bold text-sm hover:bg-red-50/50 rounded-xl transition-all"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </section>

            {/* AI Assistant Prompt Bubble (Overlayed above Nav) */}
            {isAssistantOpen && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm sm:max-w-[370px] z-40">
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-emerald-500/15 flex items-center gap-4 text-left">
                  <div className="relative flex-shrink-0">
                    <div className="bg-[#0f5238] text-white w-10 h-10 rounded-full flex items-center justify-center animate-pulse">
                      <Sparkles size={18} className="fill-white" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] text-[#0f5238] uppercase font-extrabold tracking-wider font-sans">Harvest Assistant</p>
                    <p className="text-xs text-gray-700 font-medium">"Hi {profileName.split(' ')[0]}! Want help setting up a recurring order or updating your delivery window?"</p>
                  </div>
                  <button 
                    onClick={() => setIsAssistantOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-out Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="absolute inset-0 z-50 overflow-hidden select-none">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Sidebar drawer container wrapper */}
            <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 27, stiffness: 220 }}
                className="w-screen max-w-sm bg-white flex flex-col justify-between shadow-2xl h-full border-l border-gray-100 relative"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white text-left">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-[#0f5238] stroke-[2.5]" />
                    <h3 className="font-sans font-bold text-[#0f5238] text-base">Your Field Box</h3>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Items container list */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3.5 bg-gray-50/40">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center text-gray-400 py-20 px-4 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag size={24} className="text-gray-300 stroke-[1.8]" />
                      </div>
                      <p className="font-bold text-gray-500 text-sm">Your box is completely empty!</p>
                      <p className="text-xs text-gray-400">Explore some freshly cut local tomatoes, cherries and greens above.</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="bg-[#0f5238] text-white text-xs font-bold py-2 px-5 rounded-full shadow hover:bg-[#2d6a4f] transition-all"
                      >
                        Browse Produce
                      </button>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100" id={`cart-item-${item.id}`}>
                        <img 
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0" 
                          alt={item.product.name}
                          src={item.product.image}
                        />

                        <div className="flex-grow min-w-0 text-left">
                          <h4 className="font-bold text-gray-900 text-xs truncate leading-snug">{item.product.name}</h4>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.product.farmerName}</p>
                          <span className="font-bold text-xs text-[#0f5238] font-sans mt-1 block">
                            ${item.product.price.toFixed(2)} <span className="text-gray-400 text-[10px] font-normal">/{item.product.unit}</span>
                          </span>
                        </div>

                        <div className="flex flex-col items-end justify-between self-stretch">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-all"
                          >
                            <Trash2 size={12} />
                          </button>

                          {/* Minus/Plus controller */}
                          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full p-0.5">
                            <button
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="p-0.5 text-gray-500 hover:text-[#0f5238]"
                            >
                              <Minus size={9} className="stroke-[3]" />
                            </button>
                            <span className="text-[11px] font-bold text-gray-800 w-4.5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="p-0.5 text-gray-500 hover:text-[#0f5238]"
                            >
                              <Plus size={9} className="stroke-[3]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotals & click actions */}
                {cart.length > 0 && (
                  <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="space-y-1.5 mb-4 text-left">
                      <div className="flex justify-between text-[11px] font-medium text-gray-500">
                        <span>Items Subtotal</span>
                        <span>${getCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-medium text-gray-400 border-b border-gray-100 pb-2">
                        <span>Direct Farm Delivery</span>
                        <span className="text-emerald-700 font-bold uppercase tracking-wider text-[9px]">Free</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5">
                        <span>Grand Total</span>
                        <span className="font-sans font-bold text-base text-[#0f5238]">${getCartTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-[#0f5238] hover:bg-[#2d6a4f] text-white py-3 rounded-full font-bold text-xs shadow-md transition-all uppercase tracking-widest active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      Place Secure Order
                      <ArrowRight size={13} />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>



      {/* AI Voice Overlay Dialog */}
      <AnimatePresence>
        {isVoiceActive && (
          <div className="absolute inset-0 bg-[#0f5238]/30 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 shadow-2xl max-w-sm w-full space-y-6"
            >
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#0f5238]/20 rounded-full animate-ping"></div>
                <div className="absolute inset-3 bg-[#0f5238]/40 rounded-full animate-pulse"></div>
                <div className="relative bg-[#0f5238] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
                  <Mic size={24} className="fill-white" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[#0f5238] font-sans">Harvest AI Listening...</h2>
                <p className="text-gray-500 text-xs font-medium">Click a helper suggestion below to search verbally:</p>
              </div>

              <div className="space-y-2 pt-1 text-left">
                <button 
                  onClick={() => runVoiceCommand("Find me some fresh organic greens for a salad")}
                  className="w-full text-left bg-emerald-50 hover:bg-emerald-100 p-3 rounded-xl border border-emerald-100 text-xs font-semibold text-[#0f5238] transition-colors"
                >
                  "Find me some fresh organic greens for a salad"
                </button>
                <button 
                  onClick={() => runVoiceCommand("Get Wildflower Honey")}
                  className="w-full text-left bg-emerald-50 hover:bg-emerald-100 p-3 rounded-xl border border-emerald-100 text-xs font-semibold text-[#0f5238] transition-colors"
                >
                  "Show wildflower honey from amber hives"
                </button>
              </div>

              {voiceQueryExecuted && (
                <div className="bg-emerald-100 text-[#005337] py-2 px-4 rounded-xl text-xs font-bold font-mono animate-pulse">
                  Recognized: "{voiceSearchText}"
                </div>
              )}

              <button 
                onClick={() => setIsVoiceActive(false)}
                className="w-full py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs font-sans tracking-wide transition-colors uppercase"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Seasonal Harvest Calendar Modal */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="text-[#0f5238]" size={18} />
                  <h3 className="font-sans font-bold text-[#0f5238] text-base">Seasonal Peak Schedule</h3>
                </div>
                <button 
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <p className="text-[#404943] leading-relaxed">
                  Our farmers harvest produce at their biological sweetest. Here are the true peak cycles for our core inventory:
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 font-semibold text-center text-gray-700">
                  <div className="bg-[#b1f0ce] text-[#002114] p-2.5 rounded-xl">
                    <span className="block text-[10px] uppercase text-[#005236] tracking-wider">Late Spring (Current)</span>
                    <span className="font-bold">Ruby Tomatoes</span>
                    <span className="block text-[9px] font-normal">Hillside Elias</span>
                  </div>
                  <div className="bg-[#ffdcbd] text-[#2c1600] p-2.5 rounded-xl">
                    <span className="block text-[10px] uppercase text-[#623f18] tracking-wider">Early Summer</span>
                    <span className="font-bold">Rainier Cherries</span>
                    <span className="block text-[9px] font-normal">Oak Creek Ridge</span>
                  </div>
                  <div className="bg-emerald-50 text-[#005337] p-2.5 rounded-xl col-span-2">
                    <span className="block text-[10px] uppercase text-emerald-800 tracking-wider">Year-Round Bio-Staples</span>
                    <span className="font-bold">Organic Rainbow Carrots & Sourdough Loaf</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsCalendarOpen(false)}
                className="w-full py-2.5 rounded-full bg-[#0f5238] hover:bg-[#2d6a4f] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Green Valley Story Modal */}
      <AnimatePresence>
        {isGreenValleyStoryOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-left space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-sans font-bold text-[#0f5238] text-base">The Green Valley Legacy</h3>
                <button 
                  onClick={() => setIsGreenValleyStoryOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-gray-600">
                <img 
                  className="w-full h-32 object-cover rounded-xl shadow-inner mb-3" 
                  alt="Lush green valley" 
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=500&q=80"
                />

                <p>
                  Thomas Wayne and his community farm in Green Valley with absolute bio-transparency. They apply carbon trapping, companion planting cover crops, and slow solar composting.
                </p>
                <p>
                  This regenerative system keeps chemical trace elements at absolute zero while feeding natural microbial living soil. The result is nutrient-dense, vitamin-rich chard, kale, spinach, and honey.
                </p>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-[11px] font-semibold text-emerald-800">
                  🌱 100% Zero Synthetic Additives Used & Verified Source!
                </div>
              </div>

              <button 
                onClick={() => setIsGreenValleyStoryOpen(false)}
                className="w-full py-2.5 rounded-full bg-[#0f5238] hover:bg-[#2d6a4f] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Close Story
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Card Click Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full relative z-10 border border-gray-100 flex flex-col justify-start max-h-[80vh]"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm shadow z-20 p-1.5 text-gray-500 hover:text-black rounded-full transition-all border border-gray-100"
              >
                <X size={15} />
              </button>

              <div className="overflow-y-auto text-left">
                <div className="relative aspect-video w-full bg-gray-50">
                  <img 
                    className="w-full h-full object-cover" 
                    alt={selectedProduct.name}
                    src={selectedProduct.image}
                  />
                  {selectedProduct.isOrganic && (
                    <span className="absolute bottom-3 left-3 bg-[#b1f0ce] text-[#002114] rounded-full py-1 px-3 text-[9px] font-bold tracking-wider uppercase shadow">
                      Organic
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3.5">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{selectedProduct.category}</span>
                      <h3 className="font-sans font-bold text-gray-950 text-base mt-0.5 tracking-tight">{selectedProduct.name}</h3>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-sans font-bold text-[#0f5238] text-base">
                        ${selectedProduct.price.toFixed(2)}
                      </div>
                      <span className="text-gray-400 text-[10px] font-semibold">/ {selectedProduct.unit}</span>
                    </div>
                  </div>

                  <p className="text-[#404943] text-xs leading-relaxed bg-[#f8f9fa] p-3 rounded-xl border border-gray-100 font-medium">
                    {selectedProduct.description}
                  </p>

                  {/* Farmer profile link */}
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] text-[#0f5238] font-bold">Provided by: {selectedProduct.farmerName}</span>
                    </div>
                    <button 
                      onClick={() => {
                        const frm = getProductFarmer(selectedProduct.farmerId) || thomasWayneFarmer;
                        setSelectedFarmer(frm);
                        setSelectedProduct(null);
                      }}
                      className="text-[10px] font-bold underline text-emerald-800"
                    >
                      View Farm Group
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[10px] text-gray-400 font-semibold">
                    In Stock: {selectedProduct.stock} units
                  </div>

                  <button
                    onClick={() => {
                      addToCartById(selectedProduct.id);
                      setSelectedProduct(null);
                    }}
                    className="bg-[#0f5238] hover:bg-[#2d6a4f] text-white py-2 px-5 rounded-full font-bold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} className="stroke-[3]" />
                    Add to Box
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Farmer Story Modal */}
      <AnimatePresence>
        {selectedFarmer && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFarmer(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full relative z-10 border border-gray-100 p-5 flex flex-col justify-start text-left"
            >
              <button 
                onClick={() => setSelectedFarmer(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black hover:bg-gray-100 p-1 rounded-full transition-all"
              >
                <X size={15} />
              </button>

              <div className="flex flex-col items-center text-center mt-3 space-y-2">
                <img 
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#0f5238] shadow-md"
                  alt={selectedFarmer.name}
                  src={selectedFarmer.avatar}
                />
                
                <h4 className="font-sans font-bold text-base text-gray-950">{selectedFarmer.name}</h4>
                <div className="font-sans text-[#7d562d] text-xs flex items-center gap-1 leading-none">
                  <MapPin size={11} />
                  {selectedFarmer.farmName} • {selectedFarmer.location}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-bold tracking-wider pt-1">
                  <ShieldCheck size={13} className="text-emerald-700" />
                  Verified Agricultural Origin
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4 text-center">
                <p className="text-gray-500 text-xs leading-relaxed italic px-2 font-medium">
                  "{selectedFarmer.story}"
                </p>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex justify-between text-[10px] text-gray-400 font-mono mt-4">
                  <span>Registered: 2023</span>
                  <span>Produce Rating: ★ {selectedFarmer.rating}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedFarmer(null)}
                className="mt-5 w-full bg-[#0f5238] text-white text-xs font-bold py-2.5 rounded-full transition-all text-center uppercase tracking-widest cursor-pointer"
              >
                Close Story
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Complete Success Overlay - styled neatly as a receipt */}
      <AnimatePresence>
        {orderCompleted && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setOrderCompleted(false); setActiveTab('orders'); }}
            />

            {/* Receipt Modal Box */}
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              className="bg-white rounded-3xl p-5 shadow-2xl max-w-sm w-full relative z-10 border border-gray-100 text-center flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100 mb-3 animate-bounce">
                <CheckCircle size={26} className="stroke-[2.5]" />
              </div>

              <h3 className="font-sans font-bold text-[#0f5238] text-lg">Safe Checkout Placed!</h3>
              <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-bold">Order ID: {lastPlacedOrderId}</p>
              
              <p className="text-xs text-gray-500 font-medium leading-relaxed mt-2.5 px-2">
                Your direct farm purchase is routed securely. Our local farmer partners are packages prepping your high-freshness items now.
              </p>

              <div className="mt-4 w-full border-t border-dashed border-gray-200 pt-3 text-left font-mono text-xs text-gray-500 space-y-1 bg-[#f8f9fa] p-3 rounded-xl border border-gray-100">
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-emerald-700 font-bold">Free Farm Courier</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="bg-[#ffca98] text-[#7a532a] px-1.5 py-0.5 rounded-full font-bold font-sans text-[8px] uppercase tracking-wide">Processing Hub</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-1.5 font-sans mt-1">
                  <span>Total Bill:</span>
                  <span className="text-emerald-800 font-bold">${orders[orders.length - 1]?.total.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              <div className="mt-5 w-full space-y-2">
                <button
                  onClick={() => {
                    const latest = orders[orders.length - 1] || null;
                    setSelectedTrackedOrder(latest);
                    setOrderCompleted(false);
                    setActiveTab('live_tracking');
                    triggerNotification("Opening Live Delivery Track Map!");
                  }}
                  className="w-full bg-[#0f5238] hover:bg-[#2d6a4f] text-white py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm font-black animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>pedal_bike</span>
                  Track Delivery Live
                </button>

                <button
                  onClick={() => {
                    setOrderCompleted(false);
                    setActiveTab('orders');
                  }}
                  className="w-full border border-gray-200 text-gray-500 hover:bg-gray-50 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all text-center cursor-pointer"
                >
                  Go to Order History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Account Settings Modal (Profile Tab) */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-left space-y-4 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 font-sans">
                <div className="flex items-center gap-2 text-[#0f5238]">
                  <Settings size={18} />
                  <h3 className="font-bold text-base">Account Preferences</h3>
                </div>
                <button 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800">Sustainability & Eco Alerts</p>
                    <p className="text-[10px] text-gray-400">Receive reports on local carbon savings milestones</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={profileSettings.ecoAlerts} 
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, ecoAlerts: e.target.checked }))}
                    className="rounded text-[#0f5238] focus:ring-[#0f5238] w-4.5 h-4.5 cursor-pointer accent-[#0f5238]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800">Weekly Farmer Digests</p>
                    <p className="text-[10px] text-gray-400">Stories and spotlights from community farmers</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={profileSettings.localNotifications} 
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, localNotifications: e.target.checked }))}
                    className="rounded text-[#0f5238] focus:ring-[#0f5238] w-4.5 h-4.5 cursor-pointer accent-[#0f5238]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800">Delivery Status updates (SMS)</p>
                    <p className="text-[10px] text-gray-400">Real-time alerts when fresh boxes leave the farm</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={profileSettings.deliverySMS} 
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, deliverySMS: e.target.checked }))}
                    className="rounded text-[#0f5238] focus:ring-[#0f5238] w-4.5 h-4.5 cursor-pointer accent-[#0f5238]"
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  setIsSettingsModalOpen(false);
                  triggerNotification("Preferences and settings verified successfully!");
                }}
                className="w-full py-2.5 rounded-full bg-[#0f5238] hover:bg-[#2d6a4f] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Save Preferences
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Payment Methods Modal (Profile Tab) */}
      <AnimatePresence>
        {isPaymentsOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-left space-y-4 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 font-sans">
                <div className="flex items-center gap-2 text-[#7d562d]">
                  <CreditCard size={18} />
                  <h3 className="font-bold text-base">Secured Field Wallets</h3>
                </div>
                <button 
                  onClick={() => {
                    setIsPaymentsOpen(false);
                    setNewCardNameStr('');
                    setNewCardNumStr('');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Simulated Green and Gold Card details */}
                <div className="bg-gradient-to-tr from-[#7d562d] to-[#ffca98] rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
                  <div className="absolute right-3 top-3 opacity-20">
                    <CreditCard size={48} className="text-white" />
                  </div>
                  <div className="space-y-4 text-left">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider opacity-85">Card Holder</p>
                      <p className="text-xs font-bold tracking-wide">{profileName.toUpperCase()}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider opacity-85">Card Number</p>
                        <p className="text-sm font-semibold tracking-widest font-mono">•••• •••• •••• {paymentMethods[0]?.last4 || '4421'}</p>
                      </div>
                      <span className="text-xs font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded">Visa</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Add a New Secured Card</span>
                  <input
                    type="text"
                    required
                    placeholder="Card Holder Name (e.g. Alex Rivers)"
                    value={newCardNameStr}
                    onChange={(e) => setNewCardNameStr(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#7d562d]"
                  />
                  <input
                    type="text"
                    maxLength={16}
                    required
                    placeholder="16-Digit Card Number"
                    value={newCardNumStr}
                    onChange={(e) => setNewCardNumStr(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#7d562d]"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setIsPaymentsOpen(false);
                    setNewCardNameStr('');
                    setNewCardNumStr('');
                  }}
                  className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-500 text-xs font-bold transition-colors hover:bg-gray-50 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (!newCardNumStr || newCardNumStr.length < 4) {
                      triggerNotification("Please output a valid Credit Card number");
                      return;
                    }
                    const updated = [...paymentMethods, {
                      id: Date.now().toString(),
                      type: 'Card',
                      last4: newCardNumStr.substring(newCardNumStr.length - 4),
                      isDefault: false
                    }];
                    setPaymentMethods(updated);
                    setNewCardNameStr('');
                    setNewCardNumStr('');
                    triggerNotification("Added secure payment method successfully!");
                  }}
                  className="flex-1 py-2.5 rounded-full bg-[#7d562d] hover:bg-[#623f18] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Add Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Saved Addresses Modal (Profile Tab) */}
      <AnimatePresence>
        {isAddressesOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-left space-y-4 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 font-sans">
                <div className="flex items-center gap-2 text-[#0f5238]">
                  <MapPin size={18} />
                  <h3 className="font-bold text-base">Your Delivery Hubs</h3>
                </div>
                <button 
                  onClick={() => {
                    setIsAddressesOpen(false);
                    setNewAddress('');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto">
                {addressesList.map((addr, index) => (
                  <div key={index} className="bg-[#f8f9fa] p-3 rounded-xl border border-gray-100 text-xs text-gray-700 font-medium flex justify-between items-center">
                    <span className="truncate pr-2">{addr}</span>
                    <button 
                      onClick={() => {
                        if (addressesList.length <= 1) {
                          triggerNotification("Please keep at least 1 delivery addresses");
                          return;
                        }
                        setAddressesList(prev => prev.filter((_, i) => i !== index));
                        triggerNotification("Address removed");
                      }}
                      className="text-red-500 hover:text-red-700 text-[10px] font-bold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Add a New Hub</span>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Hub Code / Location Details"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="flex-1 text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0f5238]"
                  />
                  <button 
                    onClick={() => {
                      if (!newAddress.trim()) {
                        triggerNotification("Details can not build empty");
                        return;
                      }
                      setAddressesList(prev => [...prev, newAddress.trim()]);
                      setNewAddress('');
                      triggerNotification("Location successfully connected!");
                    }}
                    className="bg-[#0f5238] hover:bg-[#2d6a4f] text-white px-4 rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setIsAddressesOpen(false)}
                className="w-full py-2.5 rounded-full bg-[#0f5238] hover:bg-[#2d6a4f] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Close Addresses
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Details Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-left space-y-4 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 font-sans">
                <div className="flex items-center gap-2 text-[#0f5238]">
                  <Pencil size={18} />
                  <h3 className="font-bold text-base">Edit Member Info</h3>
                </div>
                <button 
                  onClick={() => setIsEditProfileOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                  <input 
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0f5238] font-medium text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Avatar Image URL</label>
                  <input 
                    type="text"
                    value={profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    placeholder="Image URL"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0f5238] font-medium text-gray-800 text-[11px]"
                  />
                  <span className="text-[9px] text-gray-400 mt-1 block">Specify any public HTTP URL to update photo instantly.</span>
                </div>
              </div>

              <div className="flex gap-2 font-sans">
                <button 
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-500 text-xs font-bold transition-colors hover:bg-gray-50 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setIsEditProfileOpen(false);
                    triggerNotification("Profile details updated successfully!");
                  }}
                  className="flex-1 py-2.5 rounded-full bg-[#0f5238] hover:bg-[#2d6a4f] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Details Receipt Modal */}
      <AnimatePresence>
        {selectedOrderDetail && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 select-none">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderDetail(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full relative z-10 border border-gray-100 flex flex-col p-5 space-y-4 max-h-[85vh] text-left"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400">Transaction Summary</span>
                  <h3 className="font-sans font-bold text-[#0f5238] text-base leading-none">Order Details</h3>
                </div>
                <button 
                  onClick={() => setSelectedOrderDetail(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto space-y-3.5 pr-0.5">
                <div className="bg-[#f8f9fa] rounded-2xl p-3 border border-gray-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Receipt Code:</span>
                    <span className="font-mono font-bold text-gray-800">#{selectedOrderDetail.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium font-sans">Harvest Date:</span>
                    <span className="font-semibold text-gray-800 uppercase text-[10px]">{selectedOrderDetail.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Fulfillment Courier:</span>
                    <span className="font-bold text-[#0f5238]">Free Farm Courier</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Status:</span>
                    <span className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[9px] font-bold ${
                      selectedOrderDetail.status === 'Delivered' 
                        ? 'bg-[#a0f4c8] text-[#005236]' 
                        : selectedOrderDetail.status === 'Cancelled'
                          ? 'bg-[#e1e3e4] text-[#404943]'
                          : 'bg-[#ffdcbd] text-[#2c1600]'
                    }`}>
                      {selectedOrderDetail.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block px-1">Seeded Products</span>
                  <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-1">
                    {selectedOrderDetail.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 bg-[#fdfdfd] border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shadow-sm flex-shrink-0">
                            <img 
                              alt={item.productName} 
                              className="w-full h-full object-cover" 
                              src={getProductImage(item.productId)}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{item.productName}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center bg-white">
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold leading-none mb-1">Delivered Hub Drop</span>
                  <span className="text-[11px] font-bold text-gray-700 block max-w-[200px] truncate leading-tight">
                    {addressesList[selectedAddressIndex] || "Home Dropoff: 789 Maple Ave"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] block font-semibold leading-none mb-1">Total Paid</span>
                  <span className="text-base font-extrabold text-[#0f5238] block leading-none">
                    ${selectedOrderDetail.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedOrderDetail.status !== 'Cancelled' && (
                  <button 
                    onClick={() => {
                      setSelectedOrderDetail(null);
                      handleReorderItems(selectedOrderDetail);
                    }}
                    className="flex-1 py-2.5 rounded-full bg-[#0f5238] hover:bg-[#2d6a4f] text-white text-xs font-bold font-sans transition-all text-center uppercase tracking-wider active:scale-95 cursor-pointer"
                  >
                    Reorder Box
                  </button>
                )}
                <button 
                  onClick={() => setSelectedOrderDetail(null)}
                  className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold font-sans transition-all text-center uppercase tracking-wider active:scale-95 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Harvest Assistant Voice Modal overlay */}
      <AnimatePresence>
        {showAssistantPopup && (
          <div className="absolute inset-0 bg-[#0f5238]/20 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-6 shadow-2xl max-w-sm w-full border border-emerald-50 text-center space-y-4"
            >
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div className={`absolute inset-0 bg-[#2d6a4f]/15 rounded-full ${isAssistantReading ? 'animate-ping' : ''}`}></div>
                <div className="relative bg-[#2d6a4f] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                  <Mic size={20} className="fill-white" />
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <h3 className="font-sans font-bold text-[#0f5238] text-base">Harvest Voice Advisor</h3>
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                  {isAssistantReading ? "🔊 Speaking Out Loud..." : "🔇 Readout Finished"}
                </p>
              </div>

              {isAssistantReading && (
                <div className="flex justify-center items-end gap-1 h-6">
                  <span className="w-1 bg-[#2d6a4f] rounded-full animate-[bounce_0.8s_infinite_100ms] h-3"></span>
                  <span className="w-1 bg-[#2d6a4f] rounded-full animate-[bounce_0.8s_infinite_200ms] h-5"></span>
                  <span className="w-1 bg-[#2d6a4f] rounded-full animate-[bounce_0.8s_infinite_300ms] h-2"></span>
                  <span className="w-1 bg-[#2d6a4f] rounded-full animate-[bounce_0.8s_infinite_100ms] h-4"></span>
                  <span className="w-1 bg-[#2d6a4f] rounded-full animate-[bounce_0.8s_infinite_400ms] h-5"></span>
                  <span className="w-1 bg-[#2d6a4f] rounded-full animate-[bounce_0.8s_infinite_200ms] h-3"></span>
                </div>
              )}

              <div className="bg-emerald-50/50 p-4 rounded-2xl text-left border border-emerald-100/40">
                <p className="text-xs text-gray-700 leading-relaxed font-sans font-medium text-justify">
                  {assistantText}
                </p>
              </div>

              <div className="flex gap-2">
                {buyerOrders.length > 0 && (
                  <button 
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      }
                      setIsAssistantReading(false);
                      setShowAssistantPopup(false);
                      handleReorderItems(buyerOrders[buyerOrders.length - 1]);
                    }}
                    className="flex-1 py-2 rounded-full bg-[#0f5238] hover:bg-[#2d6a4f] text-white text-xs font-bold uppercase transition-colors"
                  >
                    Quick Reorder
                  </button>
                )}
                <button 
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    setIsAssistantReading(false);
                    setShowAssistantPopup(false);
                  }}
                  className="flex-1 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase transition-colors text-center cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
