import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Check, Search, PackageOpen } from "lucide-react";

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const fetchItems = async () => {
    try {
      const res = await axios.get("/items/");
      setItems(res.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setDescription(item.description || "");
      setPrice(item.price.toString());
    } else {
      setEditingItem(null);
      setName("");
      setDescription("");
      setPrice("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingItem(null);
      setName("");
      setDescription("");
      setPrice("");
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
      name, 
      description: description.trim() === "" ? null : description,
      price: parseFloat(price) 
    };

    try {
      if (editingItem) {
        await axios.put(`/items/${editingItem.id}`, payload);
      } else {
        await axios.post("/items/", payload);
      }
      fetchItems();
      closeModal();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item. Check console for details.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`/items/${id}`);
        setItems(items.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 -right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 tracking-tight">
              Inventory Manager
            </h1>
            <p className="text-slate-400 mt-2">Manage your products with style and ease.</p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all border border-white/10"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add New Item
          </motion.button>
        </header>

        <div className="mb-8 relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search items by name or description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent block pl-11 p-3.5 transition-all outline-none"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 hover:border-purple-500/50 rounded-3xl p-6 group transition-all duration-300 shadow-xl overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full transition-all group-hover:bg-purple-500/10 pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <h3 className="text-xl font-bold text-slate-100 truncate pr-2">{item.name}</h3>
                    <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-bold border border-blue-500/20 whitespace-nowrap shadow-inner">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-sm line-clamp-3 mb-6 min-h-[3.75rem] relative z-10">
                    {item.description || "No description provided."}
                  </p>
                  
                  <div className="flex justify-end gap-2 border-t border-slate-800 pt-4 relative z-10">
                    <button 
                      onClick={() => openModal(item)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl border-dashed">
            <PackageOpen size={64} className="text-slate-700 mb-4" strokeWidth={1} />
            <h3 className="text-xl font-medium text-slate-300">No items found</h3>
            <p className="text-slate-500 mt-2 text-center max-w-sm">
              {search ? "We couldn't find anything matching your search." : "Your inventory is currently empty. Add your first item!"}
            </p>
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="mt-4 text-purple-400 hover:text-purple-300 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">
                  {editingItem ? "Edit Item" : "Create New Item"}
                </h2>
                <button 
                  onClick={closeModal}
                  className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block px-4 py-3 outline-none transition-all"
                    placeholder="e.g. Wireless Headphones"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Price</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500">$</span>
                    </div>
                    <input 
                      type="number" 
                      required 
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-8 pr-4 py-3 outline-none transition-all"
                      placeholder="99.99"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Description (Optional)</label>
                  <textarea 
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block px-4 py-3 outline-none transition-all resize-none"
                    placeholder="Brief details about the item..."
                  ></textarea>
                </div>
                
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] flex justify-center items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:opacity-90 transition-opacity font-medium shadow-lg shadow-purple-500/20"
                  >
                    <Check size={18} />
                    {editingItem ? "Save Changes" : "Create Item"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
