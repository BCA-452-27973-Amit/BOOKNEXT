export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  bestseller?: boolean;
  language?: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}
