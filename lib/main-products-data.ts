// Main page featured products - 3 items per category
export const defaultMainProducts = {
  new: [
    {
      id: 1,
      title: "Executive Desk Series",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 2,
      title: "Ergonomic Task Chair",
      image: "/images/reception-area.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 3,
      title: "Conference Table",
      image: "/images/tanconf.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    }
  ],
  battleTested: [
    {
      id: 10,
      title: "Pre-Owned Executive Desk",
      image: "/images/showroom-2.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 11,
      title: "Refurbished Conference Set",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 12,
      title: "Pre-Owned Task Chairs",
      image: "/images/reception-area.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    }
  ],
  seating: [
    {
      id: 19,
      title: "Executive Office Chair",
      image: "/images/showfacinggarage.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 20,
      title: "Ergonomic Mesh Chair",
      image: "/images/desk grey L showroom.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 21,
      title: "Conference Room Chairs",
      image: "/images/reception-area.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    }
  ]
}

export function getMainProducts() {
  if (typeof window !== 'undefined') {
    try {
      if (window.localStorage) {
        const saved = localStorage.getItem('foxbuilt-main-products')
        if (saved) {
          try {
            return JSON.parse(saved)
          } catch (e) {
            console.error('Error parsing saved main products:', e)
            return defaultMainProducts
          }
        }
      }
    } catch (e) {
      // localStorage might be blocked or unavailable
      console.error('localStorage access denied or unavailable:', e)
    }
  }
  return defaultMainProducts
}

export function saveMainProducts(products: any) {
  if (typeof window !== 'undefined') {
    try {
      if (window.localStorage) {
        localStorage.setItem('foxbuilt-main-products', JSON.stringify(products))
      }
    } catch (e) {
      console.error('localStorage access denied or unavailable:', e)
    }
  }
}

// Helper function to get main page products from published JSON
export async function getPublishedMainProducts() {
  try {
    const response = await fetch('/main-products.json', { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      if (data.products) {
        return { products: data.products, crops: data.crops || {} }
      }
    }
  } catch (e) {
    console.log('No published main products file, using defaults')
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      if (window.localStorage) {
        const saved = localStorage.getItem('foxbuilt-main-products')
        const savedCrops = localStorage.getItem('foxbuilt-main-crops')
        if (saved) {
          try {
            const products = JSON.parse(saved)
            const crops = savedCrops ? JSON.parse(savedCrops) : {}
            return { products, crops }
          } catch (e) {
            console.error('Error parsing saved main products:', e)
          }
        }
      }
    } catch (e) {
      console.error('localStorage access denied or unavailable:', e)
    }
  }
  
  return { products: defaultMainProducts, crops: {} }
}