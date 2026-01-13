'use client';

import { useState, useEffect } from 'react';
import AdminNav from '@/components/AdminNav';
import { storiesAPI, categoriesAPI } from '@/lib/api';
import { Story, Category } from '@/types';

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    caption: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const fetchStories = async () => {
    try {
      const data = await storiesAPI.getAll();
      setStories(data);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      alert('Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchStories();
    fetchCategories();
  }, []);

  const handleOpenModal = (story?: Story) => {
    if (story) {
      setEditingStory(story);
      setFormData({
        categoryId: story.categoryId,
        caption: story.caption || '',
      });
      setFilePreview(story.mediaUrl);
      setSelectedFile(null);
    } else {
      setEditingStory(null);
      setFormData({
        categoryId: '',
        caption: '',
      });
      setFilePreview('');
      setSelectedFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStory(null);
    setFilePreview('');
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingStory && !selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    
    try {
      const submitFormData = new FormData();
      submitFormData.append('categoryId', formData.categoryId);
      submitFormData.append('caption', formData.caption);
      
      if (selectedFile) {
        submitFormData.append('file', selectedFile);
      }

      if (editingStory) {
        await storiesAPI.update(editingStory.id, {
          categoryId: formData.categoryId,
          caption: formData.caption,
        });
      } else {
        await storiesAPI.uploadStory(submitFormData);
      }
      
      await fetchStories();
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save story:', error);
      alert(error.message || 'Failed to save story');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      await storiesAPI.delete(id);
      await fetchStories();
    } catch (error: any) {
      console.error('Failed to delete story:', error);
      alert(error.message || 'Failed to delete story');
    }
  };

  const getMediaType = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    return ['mp4', 'mov', 'avi', 'webm'].includes(ext || '') ? 'video' : 'image';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdminNav />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white tracking-tight">Stories</h1>
              <p className="text-xl text-gray-300">
                Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-bold">story content</span>
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
            >
              ➕ Add Story
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-300 font-medium">Loading stories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stories.map((story) => (
                <div 
                  key={story.id} 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 hover:shadow-3xl transition-all transform hover:scale-105"
                >
                  <div className="relative aspect-[9/16] bg-gray-700">
                    {getMediaType(story.mediaUrl) === 'video' ? (
                      <video 
                        src={story.mediaUrl} 
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img 
                        src={story.mediaUrl} 
                        alt={story.caption || 'Story'} 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleOpenModal(story)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-110 shadow-lg shadow-blue-500/25"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-110 shadow-lg shadow-red-500/25"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-primary-400 bg-primary-400/10 px-2 py-1 rounded">
                        {story.category?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {story.duration}s
                      </span>
                    </div>
                    {story.caption && (
                      <p className="text-sm text-gray-400 line-clamp-2">{story.caption}</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                      <span>{story.mediaType}</span>
                      <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {stories.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-gray-400 text-lg">No stories found. Create your first story!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full p-8 border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              {editingStory ? '✏️ Edit Story' : '➕ Add New Story'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  📂 Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="">Select a category...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {!editingStory && (
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    📷 Media File * (Image or Video)
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600 file:cursor-pointer"
                  />
                  {filePreview && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-gray-600">
                      {selectedFile?.type.startsWith('video/') ? (
                        <video 
                          src={filePreview} 
                          className="w-full max-h-64 object-contain bg-black"
                          controls
                        />
                      ) : (
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          className="w-full max-h-64 object-contain bg-black"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  💬 Caption
                </label>
                <textarea
                  rows={3}
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                  placeholder="Add a caption for your story..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : editingStory ? 'Update Story' : 'Create Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
