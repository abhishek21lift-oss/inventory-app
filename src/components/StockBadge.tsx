interface StockBadgeProps {
  quantity: number
  minStock: number
}

export default function StockBadge({ quantity, minStock }: StockBadgeProps) {
  if (quantity === 0)
    return <span className="badge badge-red"><span className="w-1.5 h-1.5 rounded-full bg-[#ff375f] mr-1.5 animate-pulse" />Out of Stock</span>
  if (quantity <= minStock)
    return <span className="badge badge-yellow"><span className="w-1.5 h-1.5 rounded-full bg-[#ffd60a] mr-1.5" />Low Stock</span>
  return <span className="badge badge-green"><span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] mr-1.5" />In Stock</span>
}
