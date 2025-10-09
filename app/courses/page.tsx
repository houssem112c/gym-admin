'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { coursesAPI } from '@/lib/api';
import { Course } from '@/types';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    capacity: '',
    instructor: '',
  });

  const fetchCourses = async () => {
    try {
      const data = await coursesAPI.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      alert('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
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
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        duration: '',
        capacity: '',
        instructor: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      title: formData.title,
      description: formData.description,
      duration: parseInt(formData.duration),
      capacity: parseInt(formData.capacity),
      instructor: formData.instructor,
    };

    try {
      if (editingCourse) {
        await coursesAPI.update(editingCourse.id, data);
      } else {
        await coursesAPI.create(data);
      }
      await fetchCourses();
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save course:', error);
      alert(error.message || 'Failed to save course');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await coursesAPI.delete(id);
      await fetchCourses();
    } catch (error: any) {
      console.error('Failed to delete course:', error);
      alert(error.message || 'Failed to delete course');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdminNav />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white tracking-tight">Courses</h1>
              <p className="text-xl text-gray-300">Manage all 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-bold"> gym courses</span>
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
            >
              ➕ Add Course
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-300 font-medium">Loading courses...</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-8 py-4 text-right text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-700/50 transition-all">
                      <td className="px-8 py-6">
                        <div className="text-sm font-medium text-white">{course.title}</div>
                        <div className="text-sm text-gray-400">{course.description}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-300">
                        {course.instructor}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-300">
                        {course.duration} min
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-300">
                        {course.capacity} people
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleOpenModal(course)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-500/25 font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {courses.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg">🏋️ No courses found. Add your first course!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full p-8 border border-gray-700 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              {editingCourse ? '✏️ Edit Course' : '➕ Add New Course'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  📚 Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Enter course title..."
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
                  placeholder="Describe what this course covers..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    ⏱️ Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    👥 Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  👨‍🏫 Instructor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Enter instructor name..."
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
                >
                  {editingCourse ? '✅ Update Course' : '🚀 Create Course'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
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
