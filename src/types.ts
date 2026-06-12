export interface Item {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  minStock: number
  price: number
  brand: string
  location: string
  condition: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
}
