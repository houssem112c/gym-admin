'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { videosAPI } from '@/lib/api';
import { Video, VideoCategory } from '@/types';

export default function VideosPage() {
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VideoCategory | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [videoForm, setVideoForm] = useState({
    categoryId: '',
    title: '',
    description: '',
    duration: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const fetchData = async () => {
    try {
      const [categoriesData, videosData] = await Promise.all([
        videosAPI.getCategories(),
        videosAPI.getAll(),
      ]);
      setCategories(categoriesData);
      setVideos(videosData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category handlers
  const handleOpenCategoryModal = (category?: VideoCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '' });
    }
    setShowCategoryModal(true);
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Generate slug from name (lowercase, replace spaces with hyphens)
      const slug = categoryForm.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

      const dataToSubmit = {
        ...categoryForm,
        slug,
      };

      if (editingCategory) {
        await videosAPI.updateCategory(editingCategory.id, dataToSubmit);
      } else {
        await videosAPI.createCategory(dataToSubmit);
      }
      await fetchData();
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will also delete all videos in this category.')) return;
    try {
      await videosAPI.deleteCategory(id);
      await fetchData();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      alert(error.message || 'Failed to delete category');
    }
  };

  // Video handlers
  const handleOpenVideoModal = (video?: Video) => {
    if (video) {
      setEditingVideo(video);
      setVideoForm({
        categoryId: video.categoryId.toString(),
        title: video.title,
        description: video.description,
        duration: video.duration?.toString() || '',
      });
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoPreview(video.url || '');
      setThumbnailPreview(video.thumbnail || '');
    } else {
      setEditingVideo(null);
      setVideoForm({
        categoryId: '',
        title: '',
        description: '',
        duration: '',
      });
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoPreview('');
      setThumbnailPreview('');
    }
    setShowVideoModal(true);
  };

  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that video file is provided for new videos
    if (!editingVideo && !videoFile) {
      alert('Please select a video file');
      return;
    }
    
    const formData = new FormData();
    formData.append('categoryId', videoForm.categoryId);
    formData.append('title', videoForm.title);
    formData.append('description', videoForm.description);
    if (videoForm.duration) {
      formData.append('duration', videoForm.duration);
    }
    
    // Add video file if selected
    if (videoFile) {
      formData.append('video', videoFile);
    }
    
    // Add thumbnail file if selected
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    try {
      if (editingVideo) {
        await videosAPI.update(editingVideo.id, formData);
      } else {
        await videosAPI.create(formData);
      }
      await fetchData();
      setShowVideoModal(false);
      setEditingVideo(null);
      setVideoFile(null);
      setThumbnailFile(null);
    } catch (error: any) {
      console.error('Failed to save video:', error);
      alert(error.message || 'Failed to save video');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await videosAPI.delete(id);
      await fetchData();
    } catch (error: any) {
      console.error('Failed to delete video:', error);
      alert(error.message || 'Failed to delete video');
    }
  };

  const getVideosByCategory = (categoryId: string) => {
    return videos.filter((v) => v.categoryId === categoryId);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdminNav />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white tracking-tight">Videos</h1>
              <p className="text-xl text-gray-300">Manage 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-bold"> video library</span> and categories
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleOpenCategoryModal()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
              >
                📁 Add Category
              </button>
              <button
                onClick={() => handleOpenVideoModal()}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
              >
                🎥 Add Video
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-300 font-medium">Loading video library...</p>
            </div>
          ) : (
            <>
              {/* Categories Section */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700 mb-12">
                <h2 className="text-3xl font-bold text-white mb-8">📁 Video Categories</h2>
                {categories.length === 0 ? (
                  <p className="text-gray-400 text-lg text-center py-12">🎬 No categories found. Add your first category!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded-xl p-6 hover:shadow-xl hover:border-primary-500 transition-all transform hover:-translate-y-1"
                      >
                        <h3 className="font-bold text-xl text-white mb-3">{category.name}</h3>
                        <p className="text-sm text-gray-300 mb-4">{category.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                            🎥 {getVideosByCategory(category.id).length} videos
                          </span>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleOpenCategoryModal(category)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 text-sm font-medium"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-500/25 text-sm font-medium"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos by Category */}
              {categories.map((category) => {
                const categoryVideos = getVideosByCategory(category.id);
                if (categoryVideos.length === 0) return null;

                return (
                  <div key={category.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700 mb-8">
                    <h2 className="text-3xl font-bold text-white mb-8">🎬 {category.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryVideos.map((video) => (
                        <div
                          key={video.id}
                          className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded-xl overflow-hidden hover:shadow-xl hover:border-primary-500 transition-all transform hover:-translate-y-2"
                        >
                          {video.thumbnail && (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-6">
                            <h3 className="font-bold text-xl text-white mb-3">{video.title}</h3>
                            <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                              {video.description}
                            </p>
                            {video.duration && (
                              <p className="text-xs text-gray-400 mb-4 bg-gray-800/50 px-3 py-1 rounded-full inline-block">
                                ⏱️ Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                              </p>
                            )}
                            <div className="flex gap-3">
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3 rounded-lg text-sm hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25 font-bold"
                              >
                                ▶️ Watch
                              </a>
                              <button
                                onClick={() => handleOpenVideoModal(video)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 text-sm font-medium"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteVideo(video.id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-500/25 text-sm font-medium"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {videos.length === 0 && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-20 text-center border border-gray-700">
                  <p className="text-gray-400 text-xl">🎬 No videos found. Add your first video!</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full p-8 border border-gray-700 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              {editingCategory ? '✏️ Edit Category' : '📁 Add New Category'}
            </h2>
            
            <form onSubmit={handleSubmitCategory} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  📂 Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Enter category name..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  📝 Description
                </label>
                <textarea
                  rows={4}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                  placeholder="Describe this category (optional)..."
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
                >
                  {editingCategory ? '✅ Update Category' : '🚀 Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 rounded-xl font-bold hover:from-gray-500 hover:to-gray-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              {editingVideo ? '✏️ Edit Video' : '🎥 Add New Video'}
            </h2>
            
            <form onSubmit={handleSubmitVideo} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  📂 Category *
                </label>
                <select
                  required
                  value={videoForm.categoryId}
                  onChange={(e) => setVideoForm({ ...videoForm, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  🎬 Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Enter video title..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  📝 Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                  placeholder="Describe the video content..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  🎥 Video File * {!editingVideo && '(Required for new videos)'}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  required={!editingVideo}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setVideoFile(file);
                      setVideoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {videoPreview && (
                  <div className="mt-4 bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                    <p className="text-gray-300 text-sm mb-2 font-semibold">📹 Video Preview:</p>
                    <video
                      src={videoPreview.startsWith('/uploads') ? `http://localhost:3001${videoPreview}` : videoPreview}
                      controls
                      className="w-full max-h-48 rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  🖼️ Thumbnail Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setThumbnailFile(file);
                      setThumbnailPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {thumbnailPreview && (
                  <div className="mt-4 bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                    <p className="text-gray-300 text-sm mb-2 font-semibold">🖼️ Thumbnail Preview:</p>
                    <img
                      src={thumbnailPreview.startsWith('/uploads') ? `http://localhost:3001${thumbnailPreview}` : thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full max-h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  ⏱️ Duration (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  value={videoForm.duration}
                  onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Video duration in seconds"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
                >
                  {editingVideo ? '✅ Update Video' : '🚀 Upload Video'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 rounded-xl font-bold hover:from-gray-500 hover:to-gray-600 transition-all transform hover:scale-105 shadow-lg"
                >
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
