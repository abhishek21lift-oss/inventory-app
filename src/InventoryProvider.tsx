import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react'
import type { Item, Category } from './types'
import * as api from './api'

interface State {
  items: Item[]
  categories: Category[]
}

type Action =
  | { type: 'SET_INITIAL'; payload: State }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_INITIAL':
      return action.payload
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] }
    case 'UPDATE_ITEM':
      return { ...state, items: state.items.map(i => i.id === action.payload.id ? action.payload : i) }
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) }
    default:
      return state
  }
}

interface ContextType {
  state: State
  dispatch: React.Dispatch<Action>
  loading: boolean
}

const InventoryContext = createContext<ContextType | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], categories: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.fetchItems(), api.fetchCategories()])
      .then(([items, categories]) => {
        dispatch({ type: 'SET_INITIAL', payload: { items, categories } })
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <InventoryContext.Provider value={{ state, dispatch, loading }}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider')
  return ctx
}
