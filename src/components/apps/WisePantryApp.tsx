'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBasket, PlusCircle, Trash2, Loader2, X, Minus, Plus, Inbox, ArrowLeft, Building } from 'lucide-react'; // Added Building for supermarket icon
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { ShoppingItem } from '../../../types';
import Link from 'next/link';

const WisePantryApp: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState<string>('1');
  const [newItemSupermarket, setNewItemSupermarket] = useState(''); // State for new item's supermarket
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, loadingUser] = useAuthState(auth!);

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loadingUser) return;
    if (!user) {
       setIsLoading(false);
       setItems([]);
       return;
    }

    const fetchShoppingItems = async () => {
      setIsLoading(true);
      try {
        if (!db) {
          throw new Error("Firestore is not initialized.");
        }
        const itemsCollectionRef = collection(db, 'users', user.uid, 'shoppingItems');
        // Fetch without server-side ordering to avoid needing a composite index.
        const querySnapshot = await getDocs(itemsCollectionRef);
        const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingItem));

        // Sort on the client side to group by supermarket and then by name.
        const sortedItems = fetchedItems.sort((a, b) => {
          const marketA = a.supermarket || 'General';
          const marketB = b.supermarket || 'General';
          const marketCompare = marketA.localeCompare(marketB);
          if (marketCompare !== 0) return marketCompare;
          return a.name.localeCompare(b.name);
        });
        
        setItems(sortedItems);
      } catch (error) {
        console.error("Error fetching shopping items: ", error);
        toast({ title: "Error", description: "Could not fetch shopping items.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchShoppingItems();
  }, [mounted, user, loadingUser, toast]);

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !db) return;

    const quantity = parseInt(newItemQuantity, 10);
    if (!newItemName.trim() || isNaN(quantity) || quantity <= 0) {
      toast({ title: "Invalid Input", description: "Please enter a valid item name and a quantity greater than 0.", variant: "destructive" });
      return;
    }
    const supermarketValue = newItemSupermarket.trim() || 'General'; // Default to 'General' if empty

    const newItemData = {
      name: newItemName.trim(),
      quantity,
      purchased: false,
      supermarket: supermarketValue,
    };

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'shoppingItems'), newItemData);
      const newItemWithId: ShoppingItem = { id: docRef.id, ...newItemData };
      // Add to local state and sort (global sort is fine, grouping handles sections)
      setItems(prevItems => [...prevItems, newItemWithId].sort((a, b) => {
        const marketCompare = (a.supermarket || 'General').localeCompare(b.supermarket || 'General');
        if (marketCompare !== 0) return marketCompare;
        return a.name.localeCompare(b.name);
      }));
      setNewItemName('');
      setNewItemQuantity('1');
      setNewItemSupermarket(''); // Clear supermarket input
      toast({ title: "Item Added", description: `${newItemData.name} added to ${supermarketValue} list.` });
    } catch (error) {
      console.error("[WisePantryApp] Error adding item to Firestore: ", error);
      toast({ title: "Error", description: "Could not add item.", variant: "destructive" });
    }
  };

  const handleTogglePurchased = async (id: string) => {
    if (!user || !db) return;
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newPurchasedState = !item.purchased;
    const itemRef = doc(db, 'users', user.uid, 'shoppingItems', id);
    try {
      await updateDoc(itemRef, { purchased: newPurchasedState });
      setItems(prevItems =>
        prevItems.map(i =>
          i.id === id ? { ...i, purchased: newPurchasedState } : i
        )
      );
    } catch (error) {
      console.error("Error updating item purchased state: ", error);
      toast({ title: "Error", description: "Could not update item status.", variant: "destructive" });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!user || !db) return;
    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) return;

    const itemRef = doc(db, 'users', user.uid, 'shoppingItems', id);
    try {
      await deleteDoc(itemRef);
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      toast({ title: "Item Removed", description: `${itemToDelete.name} removed from your list.`, variant: "destructive" });
    } catch (error) {
      console.error("Error deleting item: ", error);
      toast({ title: "Error", description: "Could not delete item.", variant: "destructive" });
    }
  };

  const handleQuantityChange = async (id: string, change: number) => {
    if (!user || !db) return;
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) {
        return;
    }

    const itemRef = doc(db, 'users', user.uid, 'shoppingItems', id);
    try {
      await updateDoc(itemRef, { quantity: newQuantity });
      setItems(prevItems =>
        prevItems.map(i =>
          i.id === id ? { ...i, quantity: newQuantity } : i
        )
      );
    } catch (error) {
      console.error("Error updating item quantity: ", error);
      toast({ title: "Error", description: "Could not update item quantity.", variant: "destructive" });
    }
  };

  // Group items by supermarket
  const itemsBySupermarket = items.reduce((acc, item) => {
    const market = item.supermarket || 'General'; // Default for items without a supermarket
    if (!acc[market]) {
      acc[market] = [];
    }
    acc[market].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);


  if (!mounted || loadingUser || (isLoading && user)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 max-w-2xl text-center">
         <ShoppingBasket size={64} className="mx-auto mb-4 text-primary opacity-50" />
         <h1 className="text-3xl font-bold mb-4 text-muted-foreground">Welcome to WisePantry</h1>
         <p className="text-lg text-muted-foreground">Please log in to manage your shopping list.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-3xl bg-gradient-to-br from-background via-background to-muted/30 min-h-screen">
      <header className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12 border-b border-border pb-6">
        <div className="flex items-center text-primary mb-4 sm:mb-0">
          <ShoppingBasket size={36} className="mr-3 text-primary/80" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">WisePantry</h1>
        </div>
        <Link href="/" passHref>
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Launcher
          </Button>
        </Link>
      </header>

      {/* Add New Item Section */}
      <Card className="mb-8 shadow-xl rounded-xl border border-border/50 bg-card/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-primary font-semibold">Add New Item</CardTitle>
          <CardDescription>Enter item details. A new supermarket section will be created if it doesn't exist.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-muted-foreground mb-1.5">Item Name</label>
              <Input
                id="itemName"
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g., Organic Apples, Whole Milk"
                required
                className="w-full text-base sm:text-md py-2.5 px-4 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="itemSupermarket" className="block text-sm font-medium text-muted-foreground mb-1.5">Supermarket (optional)</label>
              <Input
                id="itemSupermarket"
                type="text"
                value={newItemSupermarket}
                onChange={(e) => setNewItemSupermarket(e.target.value)}
                placeholder="e.g., Trader Joe's, Costco (defaults to 'General')"
                className="w-full text-base sm:text-md py-2.5 px-4 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex gap-4 items-end">
              <div className="w-full sm:w-28">
                <label htmlFor="itemQuantity" className="block text-sm font-medium text-muted-foreground mb-1.5">Quantity</label>
                <Input
                  id="itemQuantity"
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  min="1"
                  required
                  className="w-full text-base sm:text-md py-2.5 px-4 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                />
              </div>
              <Button type="submit" className="flex-grow sm:flex-grow-0 whitespace-nowrap text-base sm:text-md py-3 sm:py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <PlusCircle size={18} className="mr-2" /> Add Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Shopping List Section */}
      <Card className="shadow-xl rounded-xl border border-border/30 bg-card/95 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-primary font-semibold">My Shopping Lists</CardTitle>
          <CardDescription>Items you need to buy, organized by supermarket. Click an item to mark it as purchased.</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
               <Inbox size={56} className="mx-auto mb-6 opacity-40"/>
              <p className="text-xl font-semibold mb-2">Your lists are refreshingly empty!</p>
              <p className="text-md max-w-xs mx-auto">Use the form above to add items and get your shopping organized.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(itemsBySupermarket).map(([supermarket, marketItems]) => (
                <Card key={supermarket} className="shadow-md rounded-lg border border-border/40 bg-card/80">
                  <CardHeader className="pb-3 pt-4 px-4 bg-secondary/20 rounded-t-lg">
                    <CardTitle className="text-lg flex items-center text-accent font-medium">
                      <Building size={20} className="mr-2 text-accent/70" />
                      {supermarket}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {marketItems.length === 0 ? (
                       <p className="text-sm text-muted-foreground">No items for {supermarket}.</p>
                    ) : (
                      <ul className="space-y-3">
                        {marketItems.map(item => (
                          <li
                            key={item.id}
                            className={`flex items-center gap-3 p-3.5 rounded-lg transition-all duration-300 ease-in-out border cursor-pointer group ${
                              item.purchased
                                ? 'bg-muted/60 border-transparent opacity-60 hover:opacity-75'
                                : 'bg-card hover:bg-secondary/20 border-border/30 hover:border-primary/40 hover:shadow-md'
                            }`}
                            onClick={() => handleTogglePurchased(item.id)}
                          >
                            <Checkbox
                              id={`item-${item.id}`}
                              checked={item.purchased}
                              aria-label={`Mark ${item.name} as ${item.purchased ? 'not purchased' : 'purchased'}`}
                              className={`transform scale-105 transition-transform duration-200 ${item.purchased ? 'border-transparent' : 'border-primary/50 group-hover:border-primary'}`}
                            />
                            <div className="flex-grow">
                              <span
                                className={`text-md font-medium transition-colors ${
                                  item.purchased ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-primary'
                                }`}
                              >
                                {item.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => { e.stopPropagation(); handleQuantityChange(item.id, -1); }}
                                  className={`h-7 w-7 rounded-full transition-all duration-200 ${item.quantity <= 1 || item.purchased ? 'opacity-30 cursor-not-allowed text-muted-foreground' : 'hover:bg-destructive/10 text-destructive hover:scale-105'}`}
                                  aria-label="Decrease quantity"
                                  disabled={item.quantity <= 1 || item.purchased}
                                >
                                    <Minus size={14} />
                                </Button>
                              <span className={`w-9 text-center px-1.5 py-0.5 text-xs font-semibold rounded-md tabular-nums ${item.purchased ? 'text-muted-foreground bg-transparent' : 'bg-primary/10 text-primary group-hover:bg-primary/15'}`}>
                                {item.quantity}
                              </span>
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => { e.stopPropagation(); handleQuantityChange(item.id, 1); }}
                                  className={`h-7 w-7 rounded-full transition-all duration-200 ${item.purchased ? 'opacity-30 cursor-not-allowed pointer-events-none text-muted-foreground' : 'hover:bg-primary/10 text-primary hover:scale-105'}`}
                                  aria-label="Increase quantity"
                                  disabled={item.purchased}
                                >
                                    <Plus size={14} />
                                </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                              className={`h-8 w-8 ml-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-200 hover:scale-105 ${item.purchased ? 'opacity-40' : 'group-hover:opacity-90'}`}
                              aria-label={`Delete ${item.name}`}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="text-center mt-16 py-8 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} WisePantry by Wise Launcher. Your smart shopping companion.
        </p>
      </footer>
    </div>
  );
};

export default WisePantryApp;
