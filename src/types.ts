export interface Farmer {
  id: string;
  name: string;
  farmName: string;
  location: string;
  story: string;
  avatar: string;
  rating: number;
  joinedDate: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: 'Vegetables' | 'Fruits' | 'Dairy' | 'Bakery' | 'Organic Eggs' | 'Dairy & Eggs' | 'Honey & Sweets' | 'Grains & Millets';
  image: string;
  description: string;
  farmerId: string;
  farmerName: string;
  stock: number;
  isOrganic?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'consumer' | 'farmer';
  farmDetails?: {
    farmName: string;
    location: string;
    story: string;
  };
}

export interface CartItem {
  id: string; // matches product id
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  farmerId: string;
}

export interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
}
