'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface ShoppingItem {
  name: string
  qty: string
  category: string
  checked: boolean
}

interface ShoppingList {
  id: string
  title: string
  items: ShoppingItem[]
  created_at: string
}

export default function ShoppingPage() {
  const family = useAppStore((s) => s.family)
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')

  useEffect(() => {
    if (!family) { setLoading(false); return }
    fetchLists()
  }, [family])

  async function fetchLists() {
    const res = await fetch('/api/shopping-lists')
    const data = await res.json()
    setLists(data || [])
    setLoading(false)
  }

  async function addItem(listId: string) {
    if (!newItem.trim()) return
    const list = lists.find((l) => l.id === listId)
    if (!list) return

    const updatedItems = [...list.items, { name: newItem, qty: '', category: 'General', checked: false }]
    await fetch('/api/shopping-lists', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: listId, items: updatedItems }),
    })
    setLists(lists.map((l) => l.id === listId ? { ...l, items: updatedItems } : l))
    setNewItem('')
  }

  async function toggleItem(listId: string, idx: number) {
    const list = lists.find((l) => l.id === listId)
    if (!list) return

    const updatedItems = list.items.map((item, i) =>
      i === idx ? { ...item, checked: !item.checked } : item
    )
    await fetch('/api/shopping-lists', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: listId, items: updatedItems }),
    })
    setLists(lists.map((l) => l.id === listId ? { ...l, items: updatedItems } : l))
  }

  async function createList() {
    const res = await fetch('/api/shopping-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Shopping List', items: [] }),
    })
    if (res.ok) {
      toast.success('List created!')
      fetchLists()
    }
  }

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shopping Lists</h1>
        <Button onClick={createList}><Plus className="h-4 w-4 mr-2" /> New List</Button>
      </div>

      {lists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No shopping lists</p>
            <p className="text-muted-foreground mb-4">Create a list or generate one from a meal plan.</p>
            <Button onClick={createList}><Plus className="h-4 w-4 mr-2" /> Create List</Button>
          </CardContent>
        </Card>
      ) : (
        lists.map((list) => (
          <Card key={list.id}>
            <CardHeader><CardTitle>{list.title}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {list.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleItem(list.id, idx)}
                  />
                  <span className={`flex-1 ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                    {item.qty && `${item.qty} `}{item.name}
                  </span>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Add item..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem(list.id)}
                />
                <Button size="sm" onClick={() => addItem(list.id)}><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
