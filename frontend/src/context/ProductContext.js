import React, { createContext, useState, useContext, useEffect } from 'react';

// --- HELPER: Generate dates relative to today ---
const getRelativeDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
};

// --- 1. DATA WITH DATES ---
const INITIAL_PRODUCTS = [
  // --- NEW ITEMS (Added 2 days ago) ---
  {
    id: 1,
    name: "Vintage Wash Denim Jacket",
    price: 85.00,
    category: "Clothing",
    subCategory: "Outerwear",
    image: "https://via.placeholder.com/300?text=Denim+Jacket",
    description: "A timeless classic featuring a distressed vintage wash.",
    dateAdded: getRelativeDate(2) // 💡 NEW
  },
  {
    id: 2,
    name: "Essential Crewneck T-Shirt",
    price: 25.00,
    category: "Clothing",
    subCategory: "Tops",
    image: "https://via.placeholder.com/300?text=White+Tee",
    description: "Premium heavyweight cotton t-shirt.",
    dateAdded: getRelativeDate(2)
  },
  {
    id: 3,
    name: "Slim-Fit Chino Pants",
    price: 55.00,
    category: "Clothing",
    subCategory: "Bottoms",
    image: "https://via.placeholder.com/300?text=Chinos",
    description: "Versatile trousers made with stretch-cotton twill.",
    dateAdded: getRelativeDate(2)
  },
  {
    id: 4,
    name: "Urban Canvas High-Tops",
    price: 65.00,
    category: "Shoes",
    subCategory: "Sneakers",
    image: "https://via.placeholder.com/300?text=High+Tops",
    description: "Street-style classic sneakers.",
    dateAdded: getRelativeDate(2)
  },
  {
    id: 5,
    name: "Polarized Aviator Sunglasses",
    price: 150.00,
    category: "Accessories",
    subCategory: "Eyewear",
    image: "https://via.placeholder.com/300?text=Aviators",
    description: "Gold-frame sunglasses with UV400 protection.",
    dateAdded: getRelativeDate(2)
  },
  {
    id: 6,
    name: "Oversized Knit Sweater",
    price: 60.00,
    category: "Clothing",
    subCategory: "Knitwear",
    image: "https://via.placeholder.com/300?text=Sweater",
    description: "Cozy, chunky knit sweater.",
    dateAdded: getRelativeDate(2)
  },

  // --- OLDER ITEMS (Added 30 days ago) ---
  {
    id: 7,
    name: "Classic Leather Loafers",
    price: 120.00,
    category: "Shoes",
    subCategory: "Formal",
    image: "https://via.placeholder.com/300?text=Loafers",
    description: "Genuine leather slip-on shoes.",
    dateAdded: getRelativeDate(2) // 💡 OLD
  },
  {
    id: 8,
    name: "Air-Mesh Running Shoes",
    price: 95.00,
    category: "Shoes",
    subCategory: "Athletic",
    image: "https://via.placeholder.com/300?text=Runners",
    description: "Lightweight and breathable footwear.",
    dateAdded: getRelativeDate(30)
  },
  {
    id: 9,
    name: "Suede Chelsea Boots",
    price: 110.00,
    category: "Shoes",
    subCategory: "Boots",
    image: "https://via.placeholder.com/300?text=Chelsea+Boots",
    description: "Stylish ankle boots with elastic side panels.",
    dateAdded: getRelativeDate(30)
  },
  {
    id: 10,
    name: "Comfort Slide Sandals",
    price: 30.00,
    category: "Shoes",
    subCategory: "Sandals",
    image: "https://via.placeholder.com/300?text=Slides",
    description: "Ergonomic footbed slides.",
    dateAdded: getRelativeDate(30)
  },
  {
    id: 11,
    name: "Performance Athletic Hoodie",
    price: 45.00,
    category: "Clothing",
    subCategory: "Activewear",
    image: "https://via.placeholder.com/300?text=Hoodie",
    description: "Moisture-wicking fabric with a sleek design.",
    dateAdded: getRelativeDate(30)
  },
  {
    id: 12,
    name: "Minimalist Leather Watch",
    price: 180.00,
    category: "Accessories",
    subCategory: "Watches",
    image: "https://via.placeholder.com/300?text=Watch",
    description: "Analog quartz watch with a genuine leather strap.",
    dateAdded: getRelativeDate(30)
  },
  {
    id: 13,
    name: "Canvas Weekender Bag",
    price: 75.00,
    category: "Accessories",
    subCategory: "Bags",
    image: "https://via.placeholder.com/300?text=Weekender",
    description: "Spacious duffel bag with leather accents.",
    dateAdded: getRelativeDate(30)
  },
  {
    id: 14,
    name: "Embroidered Baseball Cap",
    price: 28.00,
    category: "Accessories",
    subCategory: "Hats",
    image: "https://via.placeholder.com/300?text=Cap",
    description: "Adjustable cotton cap.",
    dateAdded: getRelativeDate(30)
  },
  {
    id: 15,
    name: "Full Grain Leather Belt",
    price: 40.00,
    category: "Accessories",
    subCategory: "Belts",
    image: "https://via.placeholder.com/300?text=Belt",
    description: "Durable leather belt with a brushed metal buckle.",
    dateAdded: getRelativeDate(30)
  }
];

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    // --- 2. INITIALIZE STATE ---
    const [products, setProducts] = useState(() => {
        try {
            // 💡 Changed key to force refresh for new date fields
            const savedProducts = localStorage.getItem('happyCart_products_v3'); 
            return savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS;
        } catch (error) {
            return INITIAL_PRODUCTS;
        }
    });

    // --- 3. SYNC TO LOCAL STORAGE ---
    useEffect(() => {
        localStorage.setItem('happyCart_products_v3', JSON.stringify(products));
    }, [products]);

    // --- 4. ACTIONS ---
    const addProduct = (newProduct) => {
        const currentIds = products.map(p => p.id);
        const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
        
        // 💡 Automatically add today's date for new products
        const productWithId = { 
            ...newProduct, 
            id: maxId + 1,
            dateAdded: new Date().toISOString() 
        };
        setProducts([productWithId, ...products]); 
    };

    const updateProduct = (id, updatedData) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const resetData = () => {
        setProducts(INITIAL_PRODUCTS);
        localStorage.removeItem('happyCart_products_v3');
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, resetData }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);