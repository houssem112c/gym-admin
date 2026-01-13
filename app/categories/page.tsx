'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import MuscleBodyDiagram from '@/components/MuscleBodyDiagram';
import { categoriesAPI } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  muscleGroup?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '🏋️',
    muscleGroup: '',
  });

  const availableIcons = [
    '🏋️', '💪', '🤸', '🏃', '🚴', '🏊', '🧘', '🥊',
    '⚽', '🏀', '🎾', '🏓', '🏸', '🤾', '🏐', '🏈',
    '⛹️', '🤺', '🏇', '🔥', '💯', '⭐', '🎯', '🏆'
  ];

  const muscleGroups = [
    { value: 'upper-chest', label: 'Upper Chest' },
    { value: 'lower-chest', label: 'Lower Chest' },
    { value: 'upper-back', label: 'Upper Back (Traps)' },
    { value: 'mid-back', label: 'Mid Back (Lats)' },
    { value: 'lower-back', label: 'Lower Back' },
    { value: 'front-delts', label: 'Front Deltoids' },
    { value: 'side-delts', label: 'Side Deltoids' },
    { value: 'rear-delts', label: 'Rear Deltoids' },
    { value: 'biceps', label: 'Biceps' },
    { value: 'triceps', label: 'Triceps' },
    { value: 'forearms', label: 'Forearms' },
    { value: 'upper-abs', label: 'Upper Abs' },
    { value: 'lower-abs', label: 'Lower Abs' },
    { value: 'obliques', label: 'Obliques' },
    { value: 'glutes', label: 'Glutes' },
    { value: 'quads', label: 'Quadriceps' },
    { value: 'hamstrings', label: 'Hamstrings' },
    { value: 'calves', label: 'Calves' },
    { value: 'fullbody', label: 'Full Body' },
  ];

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
        muscleGroup: category.muscleGroup || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: '🏋️',
        muscleGroup: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare data: convert empty muscleGroup to null or undefined
      const submitData = {
        ...formData,
        muscleGroup: formData.muscleGroup?.trim() || null,
      };
      
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, submitData);
      } else {
        await categoriesAPI.create(submitData);
      }
      await fetchCategories();
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also affect all courses in this category.')) return;

    try {
      await categoriesAPI.delete(id);
      await fetchCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      alert(error.message || 'Failed to delete category');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdminNav />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white tracking-tight">Categories</h1>
              <p className="text-xl text-gray-300">Organize your 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-bold"> course categories</span>
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
            >
              ➕ Add Category
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-300 font-medium">Loading categories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 hover:shadow-3xl transition-all transform hover:scale-105"
                  style={{ borderTopColor: category.color }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-110 shadow-lg shadow-blue-500/25"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-110 shadow-lg shadow-red-500/25"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3">{category.description}</p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created</span>
                        <span>{new Date(category.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {categories.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <div className="text-6xl mb-4">🏷️</div>
                  <p className="text-gray-400 text-lg">No categories found. Create your first category!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 border border-gray-700 shadow-2xl my-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center sticky top-0 bg-gradient-to-br from-gray-800 to-gray-900 py-2 z-10">
              {editingCategory ? '✏️ Edit Category' : '➕ Add New Category'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  🏷️ Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Enter category name..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  📝 Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                  placeholder="Describe this category..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    🎨 Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-12 bg-gray-700 border border-gray-600 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    🎯 Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto bg-gray-700 border border-gray-600 rounded-xl p-2">
                    {availableIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`p-2 rounded-lg text-xl hover:bg-gray-600 transition-all ${
                          formData.icon === icon ? 'bg-primary-600 shadow-lg' : 'bg-gray-800'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Muscle Group Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  💪 Target Muscle Group
                </label>
                <select
                  value={formData.muscleGroup}
                  onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="">Select muscle group...</option>
                  {muscleGroups.map((group) => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
                {formData.muscleGroup && (
                  <div className="mt-4 bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                    <h4 className="text-sm font-bold text-gray-300 mb-3 text-center">Muscle Target Preview</h4>
                    <div className="flex justify-center">
                      <MuscleBodyDiagram selectedMuscle={formData.muscleGroup} highlightColor={formData.color} />
                    </div>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <h4 className="text-sm font-bold text-gray-300 mb-3">📱 Preview</h4>
                <div 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700"
                  style={{ borderTopColor: formData.color }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: formData.color + '20', color: formData.color }}
                    >
                      {formData.icon}
                    </div>
                    <h5 className="text-lg font-bold text-white">{formData.name || 'Category Name'}</h5>
                  </div>
                  <p className="text-gray-400 text-sm">{formData.description || 'Category description...'}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 sticky bottom-0 bg-gradient-to-br from-gray-800 to-gray-900 pb-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 md:py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25">
                  {editingCategory ? '✅ Update Category' : '🚀 Create Category'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 md:py-4 rounded-xl font-bold hover:from-gray-500 hover:to-gray-600 transition-all transform hover:scale-105 shadow-lg">
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}