// Products page items, used only when /products.json can't be loaded (not shown on main page)
export const defaultProductsPageItems = {
  // Keep the old format for main page compatibility
  executiveDesks: [
    {
      id: 4,
      title: "Storage Cabinet",
      image: "/images/showroom-1.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 5,
      title: "Reception Desk",
      image: "/images/reception tan.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 6,
      title: "Standing Desk",
      image: "/images/showfacinggarage.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 7,
      title: "Lounge Seating",
      image: "/images/Showroomwglassboard.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 8,
      title: "File Cabinet",
      image: "/images/small desk.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 9,
      title: "Training Table",
      image: "/images/conference-room.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 28,
      title: "Bookshelf Unit",
      image: "/images/tanconf.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 29,
      title: "Mobile Pedestal",
      image: "/images/reception-area.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 30,
      title: "Privacy Screen",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    }
  ],
  battleTested: [
    {
      id: 14,
      title: "Pre-Owned Workstations",
      image: "/images/tanconf.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 16,
      title: "Used Training Tables",
      image: "/images/Showroomwglassboard.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 17,
      title: "Pre-Owned Filing Systems",
      image: "/images/reception tan.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 18,
      title: "Refurbished Reception Furniture",
      image: "/images/conference-room.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 31,
      title: "Used Conference Phones",
      image: "/images/showroom-2.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 32,
      title: "Pre-Owned Whiteboards",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 33,
      title: "Refurbished Storage Lockers",
      image: "/images/reception-area.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    }
  ],
  seating: [
    {
      id: 22,
      title: "Stacking Chairs",
      image: "/images/tanconf.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 23,
      title: "Big & Tall Chair",
      image: "/images/reception tan.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 24,
      title: "24/7 Task Chair",
      image: "/images/small desk.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 25,
      title: "Drafting Stools",
      image: "/images/showfacinggarage.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 26,
      title: "Guest Chairs",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 27,
      title: "Collaborative Seating",
      image: "/images/conference-room.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 34,
      title: "Bench Seating",
      image: "/images/Showroomwglassboard.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 35,
      title: "Kneeling Chair",
      image: "/images/showroom-1.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 36,
      title: "Ball Chair",
      image: "/images/reception-area.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    }
  ],
  // Also add kebab-case version for new products pages
  'executive-desks': [
    {
      id: 4,
      title: "Storage Cabinet",
      image: "/images/showroom-1.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 5,
      title: "Reception Desk",
      image: "/images/reception tan.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 6,
      title: "Standing Desk",
      image: "/images/showfacinggarage.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 7,
      title: "Lounge Seating",
      image: "/images/Showroomwglassboard.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 8,
      title: "File Cabinet",
      image: "/images/small desk.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 9,
      title: "Training Table",
      image: "/images/conference-room.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 28,
      title: "Bookshelf Unit",
      image: "/images/tanconf.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 29,
      title: "Mobile Pedestal",
      image: "/images/reception-area.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 30,
      title: "Privacy Screen",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    }
  ]
}

export function getProductsPageItems() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('foxbuilt-products-page')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved products page items:', e)
        return defaultProductsPageItems
      }
    }
  }
  return defaultProductsPageItems
}

export function saveProductsPageItems(products: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('foxbuilt-products-page', JSON.stringify(products))
  }
}

// Helper function to get products page items from published JSON
export async function getPublishedProductsPageItems() {
  try {
    const response = await fetch('/products.json', { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      if (data.products) {
        return { products: data.products, crops: data.productsCrops || {}, pageName: data.pageName }
      }
    }
  } catch (e) {
    console.log('No published products file, using defaults')
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('foxbuilt-products-page')
    const savedCrops = localStorage.getItem('foxbuilt-products-page-crops')
    if (saved) {
      try {
        const products = JSON.parse(saved)
        const crops = savedCrops ? JSON.parse(savedCrops) : {}
        return { products, crops }
      } catch (e) {
        console.error('Error parsing saved products:', e)
      }
    }
  }
  
  return { products: defaultProductsPageItems, crops: {} }
}