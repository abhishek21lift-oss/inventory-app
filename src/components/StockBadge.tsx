interface StockBadgeProps {
  quantity: number
  minStock: number
}

export default function StockBadge({ quantity, minStock }: StockBadgeProps) {
  if (quantity === 0) return <span className="badge badge-red">Out of Stock</span>
  if (quantity <= minStock) return <span className="badge badge-yellow">Low Stock</span>
  return <span className="badge badge-green">{quantity} in Stock</span>
}
