export const defaultProducts = {
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
    },
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
    },
    {
      id: 13,
      title: "Refurbished Storage Units",
      image: "/images/showroom-1.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 14,
      title: "Pre-Owned Workstations",
      image: "/images/tanconf.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 15,
      title: "Refurbished Reception Desk",
      image: "/images/reception tan.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 16,
      title: "Pre-Owned Lounge Set",
      image: "/images/Showroomwglassboard.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 17,
      title: "Refurbished Training Tables",
      image: "/images/conference-room.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 18,
      title: "Pre-Owned Executive Suite",
      image: "/images/showfacinggarage.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    }
  ],
  seating: [
    {
      id: 19,
      title: "Ergonomic Office Chairs",
      image: "/images/reception-area.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 20,
      title: "Executive Leather Chairs",
      image: "/images/showroom-2.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 21,
      title: "Conference Room Chairs",
      image: "/images/tanconf.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 22,
      title: "Reception Area Seating",
      image: "/images/reception tan.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 23,
      title: "Task Chairs",
      image: "/images/small desk.jpg",
      description: "",
      features: [],
      price: "Request pricing"
    },
    {
      id: 24,
      title: "Lounge Chairs",
      image: "/images/Showroomwglassboard.jpg",
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
    }
  ]
}

export function getProducts() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('foxbuilt-products')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved products:', e)
        return defaultProducts
      }
    }
  }
  return defaultProducts
}

export function saveProducts(products: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('foxbuilt-products', JSON.stringify(products))
  }
}

// Helper function to get products for products page
export async function getProductsPageItems() {
  // First try to fetch from the published products.json file
  try {
    const response = await fetch('/products.json', { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      if (data.products) {
        // Get crops from productsCrops or extract from products
        const productCrops: any = data.productsCrops || {}
        
        // Also check for embedded imageCrop in products
        Object.values(data.products).forEach((categoryProducts: any) => {
          categoryProducts.forEach((product: any) => {
            if (product.imageCrop && product.image) {
              productCrops[product.image] = product.imageCrop
            }
          })
        })
        
        return { products: data.products, crops: productCrops }
      }
    }
  } catch (e) {
    console.log('No published products file, using defaults')
  }
  
  // Fallback to localStorage for preview
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('foxbuilt-products-page')
    const savedCrops = localStorage.getItem('foxbuilt-products-page-crops')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const crops = savedCrops ? JSON.parse(savedCrops) : {}
        return {
          products: {
            new: parsed.new || [],
            battleTested: parsed.battleTested || [],
            seating: parsed.seating || []
          },
          crops
        }
      } catch (e) {
        console.error('Error parsing saved products:', e)
      }
    }
  }
  
  // Return default products if nothing saved
  return {
    products: defaultProducts,
    crops: {}
  }
}