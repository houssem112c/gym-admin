'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { productsAPI } from '@/lib/api';
import {
    HiOutlinePlus,
    HiOutlineSearch, HiOutlinePhotograph,
    HiOutlineTrash, HiOutlinePencil
} from 'react-icons/hi';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        pointsPrice: '',
        stock: '',
        category: '',
        image: null as File | null,
    });

    const fetchProducts = async () => {
        try {
            const data = await productsAPI.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newProduct.name);
            formData.append('description', newProduct.description);
            formData.append('price', newProduct.price.toString());
            if (newProduct.pointsPrice) {
                formData.append('pointsPrice', newProduct.pointsPrice.toString());
            }
            formData.append('stock', newProduct.stock.toString());
            formData.append('category', newProduct.category);
            if (newProduct.image) {
                formData.append('image', newProduct.image);
            }

            await productsAPI.createWithFiles(formData);
            setShowAddModal(false);
            setNewProduct({ name: '', description: '', price: '', pointsPrice: '', stock: '', category: '', image: null });
            fetchProducts();
        } catch (error: any) {
            alert(error.message || 'Failed to create product');
        }
    };

    const handleEditProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', selectedProduct.name);
            formData.append('description', selectedProduct.description || '');
            formData.append('price', selectedProduct.price.toString());
            if (selectedProduct.pointsPrice) {
                formData.append('pointsPrice', selectedProduct.pointsPrice.toString());
            } else {
                formData.append('pointsPrice', ''); // Clear points price if empty
            }
            formData.append('stock', selectedProduct.stock.toString());
            formData.append('category', selectedProduct.category || '');
            if (selectedProduct.imageFile) {
                formData.append('image', selectedProduct.imageFile);
            }

            await productsAPI.updateWithFiles(selectedProduct.id, formData);
            setShowEditModal(false);
            setSelectedProduct(null);
            fetchProducts();
        } catch (error: any) {
            alert(error.message || 'Failed to update product');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await productsAPI.delete(id);
            fetchProducts();
        } catch (error: any) {
            alert(error.message || 'delete failed');
        }
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen">
            <AdminNav />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Shop Center</h1>
                            <p className="text-surface-400 mt-2 font-medium">Manage product inventory and catalog.</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="premium-button-primary"
                        >
                            <HiOutlinePlus className="w-5 h-5" />
                            Add Product
                        </button>
                    </div>

                    {/* Search */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-4 h-14 relative flex items-center">
                            <HiOutlineSearch className="absolute left-5 text-surface-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="premium-input pl-14 h-full"
                            />
                        </div>
                    </div>

                    {/* Products Grid/Table */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                            <div className="w-12 h-12 border-4 border-surface-800 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-surface-500 font-bold uppercase tracking-widest text-xs">Loading Catalog...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="glass-card hover:border-primary-500/30 transition-all duration-300 group relative">
                                    <div className="aspect-video bg-surface-900 rounded-t-2xl relative overflow-hidden">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-surface-700">
                                                <HiOutlinePhotograph className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                                            {product.stock} in stock
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-white">{product.name}</h3>
                                            <div className="flex flex-col items-end">
                                                <span className="text-accent-400 font-black">${product.price}</span>
                                                {product.pointsPrice && (
                                                    <span className="text-primary-400 text-xs font-bold">{product.pointsPrice} XP</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-surface-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-surface-800">
                                            <span className="text-xs text-surface-500 font-bold uppercase tracking-wider">{product.category || 'Uncategorized'}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct({ ...product });
                                                        setShowEditModal(true);
                                                    }}
                                                    className="text-primary-500 hover:text-primary-400 transition-colors p-2"
                                                >
                                                    <HiOutlinePencil className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="text-red-500 hover:text-red-400 transition-colors p-2"
                                                >
                                                    <HiOutlineTrash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
                    <div className="glass-card w-full max-w-lg p-10 border border-surface-800 shadow-3xl animate-scale-in max-h-[90vh] overflow-y-auto">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-6">New Product</h2>
                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="premium-input"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="premium-input min-h-[100px]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        className="premium-input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Price (XP)</label>
                                    <input
                                        type="number"
                                        value={newProduct.pointsPrice}
                                        onChange={(e) => setNewProduct({ ...newProduct, pointsPrice: e.target.value })}
                                        className="premium-input"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        value={newProduct.stock}
                                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                        className="premium-input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Category</label>
                                    <input
                                        type="text"
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="premium-input"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Product Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setNewProduct({ ...newProduct, image: e.target.files[0] });
                                        }
                                    }}
                                    className="premium-input pt-2"
                                />
                                {newProduct.image && (
                                    <p className="text-xs text-primary-400 mt-2">Selected: {newProduct.image.name}</p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="premium-button-ghost flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="premium-button-primary flex-1"
                                >
                                    Create Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Product Modal */}
            {showEditModal && selectedProduct && (
                <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
                    <div className="glass-card w-full max-w-lg p-10 border border-surface-800 shadow-3xl animate-scale-in max-h-[90vh] overflow-y-auto">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-6">Edit Product</h2>
                        <form onSubmit={handleEditProduct} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    value={selectedProduct.name}
                                    onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                                    className="premium-input"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    value={selectedProduct.description || ''}
                                    onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                                    className="premium-input min-h-[100px]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={selectedProduct.price}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
                                        className="premium-input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Price (XP)</label>
                                    <input
                                        type="number"
                                        value={selectedProduct.pointsPrice || ''}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, pointsPrice: e.target.value })}
                                        className="premium-input"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        value={selectedProduct.stock}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: e.target.value })}
                                        className="premium-input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Category</label>
                                    <input
                                        type="text"
                                        value={selectedProduct.category || ''}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                                        className="premium-input"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Change Image (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setSelectedProduct({ ...selectedProduct, imageFile: e.target.files[0] });
                                        }
                                    }}
                                    className="premium-input pt-2"
                                />
                                {selectedProduct.imageFile && (
                                    <p className="text-xs text-primary-400 mt-2">Selected: {selectedProduct.imageFile.name}</p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedProduct(null);
                                    }}
                                    className="premium-button-ghost flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="premium-button-primary flex-1"
                                >
                                    Update Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
