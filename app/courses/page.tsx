'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { coursesAPI, categoriesAPI } from '@/lib/api';
import { Course } from '@/types';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineTag,
  HiOutlineVideoCamera,
  HiOutlinePhotograph,
  HiOutlineX
} from 'react-icons/hi';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    capacity: '',
    instructor: '',
    categoryId: '',
    videoUrl: '',
    thumbnail: '',
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchCourses = async () => {
    try {
      const data = await coursesAPI.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
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
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        duration: course.duration.toString(),
        capacity: course.capacity.toString(),
        instructor: course.instructor,
        categoryId: (course as any).categoryId || '',
        videoUrl: (course as any).videoUrl || '',
        thumbnail: (course as any).thumbnail || '',
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        duration: '',
        capacity: '',
        instructor: '',
        categoryId: '',
        videoUrl: '',
        thumbnail: '',
      });
    }
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoPreview(null);
    setThumbnailPreview(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setFormData({ ...formData, videoUrl: '' });
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setFormData({ ...formData, thumbnail: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('capacity', formData.capacity);
      formDataToSend.append('instructor', formData.instructor);
      formDataToSend.append('categoryId', formData.categoryId);

      if (videoFile) formDataToSend.append('video', videoFile);
      else if (formData.videoUrl) formDataToSend.append('videoUrl', formData.videoUrl);

      if (thumbnailFile) formDataToSend.append('thumbnail', thumbnailFile);
      else if (formData.thumbnail) formDataToSend.append('thumbnailUrl', formData.thumbnail);

      if (editingCourse) await coursesAPI.updateWithFiles(editingCourse.id, formDataToSend);
      else await coursesAPI.createWithFiles(formDataToSend);

      await fetchCourses();
      handleCloseModal();
    } catch (error: any) {
      alert(error.message || 'Failed to save course');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await coursesAPI.delete(id);
      await fetchCourses();
    } catch (error: any) {
      alert(error.message || 'Failed to delete course');
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Courses</h1>
              <p className="text-surface-400 mt-2 font-medium">Curate premium training programs and classes.</p>
            </div>
            <button onClick={() => handleOpenModal()} className="premium-button-primary">
              <HiOutlinePlus className="w-5 h-5" />
              Build Course
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
              <div className="w-12 h-12 border-4 border-surface-800 border-t-primary-500 rounded-full animate-spin mb-4"></div>
              <p className="text-surface-500 font-bold uppercase tracking-widest text-xs">Loading Syllabus...</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-10 animate-slide-up">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Program Title</th>
                    <th>Mentor / Coach</th>
                    <th>Metrics</th>
                    <th>Class Capacity</th>
                    <th className="text-right pr-10">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="group">
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-surface-900 border border-surface-800 overflow-hidden relative">
                            {(course as any).thumbnail ? (
                              <img src={(course as any).thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-surface-600 font-black">?</div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{course.title}</div>
                            <div className="text-[10px] font-bold text-surface-500 truncate max-w-[200px]">{course.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm font-semibold text-surface-300">
                        {course.instructor}
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-surface-400 text-xs font-bold">
                          <HiOutlineClock className="w-3.5 h-3.5 text-primary-500" />
                          {course.duration} MIN
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-surface-400 text-xs font-bold">
                          <HiOutlineUserGroup className="w-3.5 h-3.5 text-blue-500" />
                          {course.capacity} TOTAL
                        </div>
                      </td>
                      <td className="text-right pr-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => handleOpenModal(course)} className="p-2 bg-surface-900 text-white rounded-xl hover:bg-primary-500/20 hover:text-primary-500 transition-all border border-surface-800">
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(course.id)} className="p-2 bg-surface-900 text-white rounded-xl hover:bg-accent-500/20 hover:text-accent-500 transition-all border border-surface-800">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {courses.length === 0 && (
                <div className="text-center py-20 bg-surface-900/10 rounded-3xl border border-dashed border-surface-800">
                  <p className="text-surface-500 font-bold uppercase tracking-widest text-xs">No programs in curriculum</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Course Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-surface-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fade-in overflow-y-auto">
          <div className="glass-card w-full max-w-4xl p-10 relative my-8 animate-scale-in">
            <button onClick={handleCloseModal} className="absolute top-6 right-6 text-surface-500 hover:text-white transition-colors">
              <HiOutlineX className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                {editingCourse ? 'Engineering' : 'Architect'} Program
              </h2>
              <p className="text-surface-500 text-sm font-medium">Define the core metrics of your training curriculum.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <HiOutlineTag className="text-primary-500" /> Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="premium-input text-lg font-bold"
                    placeholder="Program Title"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Program Synthesis</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="premium-input resize-none"
                    placeholder="Provide a comprehensive breakdown..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <HiOutlineClock className="text-blue-400" /> Sync Time
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="premium-input"
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <HiOutlineUserGroup className="text-purple-400" /> Capacity
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="premium-input"
                      placeholder="Total"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Classification</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="premium-input appearance-none"
                  >
                    <option value="">Select Domain</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Assigned Mentor</label>
                  <input
                    type="text"
                    required
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="premium-input"
                    placeholder="Instructor Name"
                  />
                </div>

                {/* Asset Management */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <HiOutlineVideoCamera className="text-accent-400" /> Digital Twin (Video)
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="file"
                        accept="video/*"
                        id="video-upload"
                        onChange={handleVideoFileChange}
                        className="hidden"
                      />
                      <label htmlFor="video-upload" className="flex-1 px-4 py-3 bg-surface-900 border border-surface-800 rounded-2xl cursor-pointer hover:border-primary-500/50 transition-all flex items-center justify-center gap-2 text-xs font-bold text-surface-400">
                        {videoFile ? 'Video Linked' : 'Upload Data'}
                      </label>
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        disabled={!!videoFile}
                        className="flex-[2] premium-input py-3 text-xs"
                        placeholder="Direct URL Link"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <HiOutlinePhotograph className="text-teal-400" /> Interface (Thumbnail)
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        id="image-upload"
                        onChange={handleThumbnailFileChange}
                        className="hidden"
                      />
                      <label htmlFor="image-upload" className="flex-1 px-4 py-3 bg-surface-900 border border-surface-800 rounded-2xl cursor-pointer hover:border-primary-500/50 transition-all flex items-center justify-center gap-2 text-xs font-bold text-surface-400">
                        {thumbnailFile ? 'Asset Linked' : 'Upload Data'}
                      </label>
                      <input
                        type="url"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        disabled={!!thumbnailFile}
                        className="flex-[2] premium-input py-3 text-xs"
                        placeholder="Direct URL Link"
                      />
                    </div>
                    {(thumbnailPreview || formData.thumbnail) && (
                      <div className="w-full h-32 rounded-2xl overflow-hidden border border-surface-800 p-2">
                        <img src={thumbnailPreview || formData.thumbnail} className="w-full h-full object-cover rounded-xl opacity-60" alt="" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={uploading} className="premium-button-primary flex-1 h-14 uppercase tracking-widest text-xs">
                    {uploading ? 'Processing Architecture...' : editingCourse ? 'Modify Blueprint' : 'Authorize Blueprint'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
