/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, Product, Farmer, Order, OrderItem } from './types';
import { INITIAL_PRODUCTS, INITIAL_FARMERS } from './data';
import AuthScreen from './components/AuthScreen';
import ConsumerDashboard from './components/ConsumerDashboard';
import FarmerDashboard from './components/FarmerDashboard';
import MobileFrame from './components/MobileFrame';

export default function App() {
  // Session, products, and orders persistent state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load state from LocalStorage on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('harvest_direct_user');
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }

    const cachedProducts = localStorage.getItem('harvest_direct_products');
    let loadedProducts: Product[] = [];
    if (cachedProducts) {
      try {
        const parsed = JSON.parse(cachedProducts) as Product[];
        const parsedIds = new Set(parsed.map(p => p.id));
        const missingProducts = INITIAL_PRODUCTS.filter(p => !parsedIds.has(p.id));
        if (missingProducts.length > 0) {
          loadedProducts = [...parsed, ...missingProducts];
          localStorage.setItem('harvest_direct_products', JSON.stringify(loadedProducts));
        } else {
          loadedProducts = parsed;
        }
      } catch (e) {
        loadedProducts = INITIAL_PRODUCTS;
        localStorage.setItem('harvest_direct_products', JSON.stringify(INITIAL_PRODUCTS));
      }
    } else {
      loadedProducts = INITIAL_PRODUCTS;
      localStorage.setItem('harvest_direct_products', JSON.stringify(INITIAL_PRODUCTS));
    }
    setProducts(loadedProducts);

    const cachedFarmers = localStorage.getItem('harvest_direct_farmers');
    let loadedFarmers: Farmer[] = [];
    if (cachedFarmers) {
      try {
        const parsed = JSON.parse(cachedFarmers) as Farmer[];
        const parsedIds = new Set(parsed.map(f => f.id));
        const missingFarmers = INITIAL_FARMERS.filter(f => !parsedIds.has(f.id));
        if (missingFarmers.length > 0) {
          loadedFarmers = [...parsed, ...missingFarmers];
          localStorage.setItem('harvest_direct_farmers', JSON.stringify(loadedFarmers));
        } else {
          loadedFarmers = parsed;
        }
      } catch (e) {
        loadedFarmers = INITIAL_FARMERS;
        localStorage.setItem('harvest_direct_farmers', JSON.stringify(INITIAL_FARMERS));
      }
    } else {
      loadedFarmers = INITIAL_FARMERS;
      localStorage.setItem('harvest_direct_farmers', JSON.stringify(INITIAL_FARMERS));
    }
    setFarmers(loadedFarmers);

    const cachedOrders = localStorage.getItem('harvest_direct_orders');
    if (cachedOrders) {
      setOrders(JSON.parse(cachedOrders));
    } else {
      const initialOrders: Order[] = [
        {
          id: '87955',
          buyerName: 'Alex Rivers',
          buyerEmail: 'alex@example.com',
          date: 'OCT 12, 2023',
          status: 'Delivered',
          total: 124.90,
          items: [
            { productId: 'p6', productName: 'Wildflower Honey', price: 14.00, quantity: 2, unit: 'jar', farmerId: 'f2' },
            { productId: 'p1', productName: 'Heirloom Ruby Tomatoes', price: 4.58, quantity: 5, unit: 'lb', farmerId: 'f1' },
            { productId: 'p3', productName: 'Artisan Dairy Pair', price: 18.50, quantity: 4, unit: 'pack', farmerId: 'f2' }
          ]
        },
        {
          id: '88104',
          buyerName: 'Alex Rivers',
          buyerEmail: 'alex@example.com',
          date: 'OCT 18, 2023',
          status: 'Cancelled',
          total: 18.20,
          items: [
            { productId: 'p2', productName: 'Super Greens Bundle', price: 12.00, quantity: 1, unit: 'bundle', farmerId: 'f2' },
            { productId: 'p1', productName: 'Heirloom Ruby Tomatoes', price: 4.50, quantity: 1, unit: 'lb', farmerId: 'f1' },
            { productId: 'p4', productName: 'Rainbow Carrots', price: 1.70, quantity: 1, unit: 'ea', farmerId: 'f3' }
          ]
        },
        {
          id: '88219',
          buyerName: 'Alex Rivers',
          buyerEmail: 'alex@example.com',
          date: 'OCT 24, 2023',
          status: 'Delivered',
          total: 42.50,
          items: [
            { productId: 'p5', productName: 'Rainier Cherries', price: 7.00, quantity: 2, unit: 'lb', farmerId: 'f4' },
            { productId: 'p1', productName: 'Heirloom Ruby Tomatoes', price: 4.50, quantity: 4, unit: 'lb', farmerId: 'f1' },
            { productId: 'p4', productName: 'Rainbow Carrots', price: 3.50, quantity: 3, unit: 'ea', farmerId: 'f3' }
          ]
        },
        // Seed for active reviewer as well for perfect testing
        {
          id: '87955',
          buyerName: 'Alex Rivers',
          buyerEmail: 'alorsilver86@gmail.com',
          date: 'OCT 12, 2023',
          status: 'Delivered',
          total: 124.90,
          items: [
            { productId: 'p6', productName: 'Wildflower Honey', price: 14.00, quantity: 2, unit: 'jar', farmerId: 'f2' },
            { productId: 'p1', productName: 'Heirloom Ruby Tomatoes', price: 4.58, quantity: 5, unit: 'lb', farmerId: 'f1' },
            { productId: 'p3', productName: 'Artisan Dairy Pair', price: 18.50, quantity: 4, unit: 'pack', farmerId: 'f2' }
          ]
        },
        {
          id: '88104',
          buyerName: 'Alex Rivers',
          buyerEmail: 'alorsilver86@gmail.com',
          date: 'OCT 18, 2023',
          status: 'Cancelled',
          total: 18.20,
          items: [
            { productId: 'p2', productName: 'Super Greens Bundle', price: 12.00, quantity: 1, unit: 'bundle', farmerId: 'f2' },
            { productId: 'p1', productName: 'Heirloom Ruby Tomatoes', price: 4.50, quantity: 1, unit: 'lb', farmerId: 'f1' },
            { productId: 'p4', productName: 'Rainbow Carrots', price: 1.70, quantity: 1, unit: 'ea', farmerId: 'f3' }
          ]
        },
        {
          id: '88219',
          buyerName: 'Alex Rivers',
          buyerEmail: 'alorsilver86@gmail.com',
          date: 'OCT 24, 2023',
          status: 'Delivered',
          total: 42.50,
          items: [
            { productId: 'p5', productName: 'Rainier Cherries', price: 7.00, quantity: 2, unit: 'lb', farmerId: 'f4' },
            { productId: 'p1', productName: 'Heirloom Ruby Tomatoes', price: 4.50, quantity: 4, unit: 'lb', farmerId: 'f1' },
            { productId: 'p4', productName: 'Rainbow Carrots', price: 3.50, quantity: 3, unit: 'ea', farmerId: 'f3' }
          ]
        }
      ];
      setOrders(initialOrders);
      localStorage.setItem('harvest_direct_orders', JSON.stringify(initialOrders));
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('harvest_direct_user', JSON.stringify(user));

    // If user is a farmer and not included in state, save them as a registered Farmer
    if (user.role === 'farmer' && user.farmDetails) {
      setFarmers(prev => {
        const exists = prev.some(f => f.id === user.id);
        if (!exists) {
          const newFarmer: Farmer = {
            id: user.id,
            name: user.name,
            farmName: user.farmDetails.farmName,
            location: user.farmDetails.location,
            story: user.farmDetails.story,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', // generic high-quality avatar
            rating: 5.0,
            joinedDate: 'Joined Today'
          };
          const updated = [...prev, newFarmer];
          localStorage.setItem('harvest_direct_farmers', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('harvest_direct_user');
  };

  const handlePlaceOrder = (items: Omit<OrderItem, 'farmerId'>[]) => {
    if (!currentUser) return;

    // Look up parent farmer ID from products for each item to route properly
    const routedItems: OrderItem[] = items.map(item => {
      const matchProduct = products.find(p => p.id === item.productId);
      return {
        ...item,
        farmerId: matchProduct ? matchProduct.farmerId : 'f1' // default back to Acres & Oak f1
      };
    });

    const basketTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder: Order = {
      id: 'ord_' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      buyerName: currentUser.name,
      buyerEmail: currentUser.email,
      items: routedItems,
      total: basketTotal,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending'
    };

    // Deduct stock
    setProducts(prev => {
      const updated = prev.map(prod => {
        const purchased = items.find(it => it.productId === prod.id);
        if (purchased) {
          return { ...prod, stock: Math.max(0, prod.stock - purchased.quantity) };
        }
        return prod;
      });
      localStorage.setItem('harvest_direct_products', JSON.stringify(updated));
      return updated;
    });

    // Save Order
    setOrders(prev => {
      const updated = [...prev, newOrder];
      localStorage.setItem('harvest_direct_orders', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddProduct = (newProductDetails: Omit<Product, 'id' | 'farmerId' | 'farmerName'>) => {
    if (!currentUser) return;

    const myFarmerId = currentUser.email === 'silas@acresandoak.com' ? 'f1' : currentUser.id;
    const myFarmName = currentUser.farmDetails?.farmName || 'Meadow View Dairy';

    const newProduct: Product = {
      ...newProductDetails,
      id: 'prod_' + Math.random().toString(36).substr(2, 6),
      farmerId: myFarmerId,
      farmerName: myFarmName
    };

    setProducts(prev => {
      const updated = [...prev, newProduct];
      localStorage.setItem('harvest_direct_products', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      localStorage.setItem('harvest_direct_products', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'Pending' | 'Shipped' | 'Delivered') => {
    setOrders(prev => {
      const updated = prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      );
      localStorage.setItem('harvest_direct_orders', JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle role in the header to preview the other side of the app!
  const handleSwitchToFarmer = () => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      role: 'farmer',
      farmDetails: currentUser.farmDetails || {
        farmName: 'Acres & Oak Farm',
        location: 'Hill Country, TX',
        story: 'Permaculture and native cover crops model organic farm.'
      }
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('harvest_direct_user', JSON.stringify(updatedUser));
  };

  const handleSwitchToConsumer = () => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      role: 'consumer'
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('harvest_direct_user', JSON.stringify(updatedUser));
  };

  return (
    <MobileFrame>
      {!currentUser ? (
        <AuthScreen onSuccess={handleAuthSuccess} />
      ) : currentUser.role === 'consumer' ? (
        <ConsumerDashboard 
          currentUser={currentUser}
          products={products}
          farmers={farmers}
          orders={orders}
          onPlaceOrder={handlePlaceOrder}
          onLogout={handleLogout}
          onSwitchToFarmer={handleSwitchToFarmer}
        />
      ) : (
        <FarmerDashboard 
          currentUser={currentUser}
          products={products}
          orders={orders}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onLogout={handleLogout}
          onSwitchToConsumer={handleSwitchToConsumer}
        />
      )}
    </MobileFrame>
  );
}
