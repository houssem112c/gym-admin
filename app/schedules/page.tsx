'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { coursesAPI } from '@/lib/api';
import { Course, CourseSchedule } from '@/types';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SchedulesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDaySchedules, setSelectedDaySchedules] = useState<CourseSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<CourseSchedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<CourseSchedule | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    coachName: '',
    startTime: '',
    endTime: '',
    isRecurring: false,
    dayOfWeek: '',
  });

  const fetchData = async () => {
    try {
      const coursesData = await coursesAPI.getAll();
      setCourses(coursesData);

      // Fetch all schedules for all courses
      const allSchedules: CourseSchedule[] = [];
      for (const course of coursesData) {
        const courseSchedules = await coursesAPI.getSchedules(course.id);
        allSchedules.push(...courseSchedules);
      }
      setSchedules(allSchedules);
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getSessionsForDate = (date: Date): CourseSchedule[] => {
    if (!date) return [];
    
    const dayOfWeek = date.getDay();
    // Create date string using local date components (not UTC) to match the selected calendar date
    const dateStr = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
    
    return schedules.filter(schedule => {
      // Check if it's a recurring session on this day of week
      if (schedule.isRecurring && schedule.dayOfWeek === dayOfWeek) {
        return true;
      }
      
      // Check if it's a specific date session
      if (schedule.specificDate) {
        const specificDate = new Date(schedule.specificDate);
        // Extract just the date part in UTC to avoid timezone issues
        const specificDateStr = specificDate.getUTCFullYear() + '-' + 
          String(specificDate.getUTCMonth() + 1).padStart(2, '0') + '-' + 
          String(specificDate.getUTCDate()).padStart(2, '0');
        return specificDateStr === dateStr;
      }
      
      return false;
    });
  };

  const handleDateClick = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    const sessions = getSessionsForDate(date);
    setSelectedDaySchedules(sessions);
  };

  const handleOpenModal = (schedule?: CourseSchedule, date?: Date) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        courseId: schedule.courseId.toString(),
        title: schedule.title || '',
        coachName: schedule.coachName || (schedule.course as any)?.instructor || '',
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isRecurring: schedule.isRecurring,
        dayOfWeek: schedule.dayOfWeek?.toString() || '',
      });
    } else {
      setEditingSchedule(null);
      const dayOfWeek = date ? date.getDay() : 0;
      setFormData({
        courseId: '',
        title: '',
        coachName: '',
        startTime: '09:00',
        endTime: '10:00',
        isRecurring: true,
        dayOfWeek: dayOfWeek.toString(),
      });
      if (date) setSelectedDate(date);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.courseId) {
      alert('Please select a course');
      return;
    }

    const courseId = formData.courseId;

    const data: any = {
      title: formData.title || undefined,
      coachName: formData.coachName || undefined,
      startTime: formData.startTime,
      endTime: formData.endTime,
      isRecurring: formData.isRecurring,
    };

    if (formData.isRecurring && formData.dayOfWeek) {
      data.dayOfWeek = parseInt(formData.dayOfWeek);
    } else if (selectedDate && !formData.isRecurring) {
      // Create a date at noon UTC to avoid timezone shifting
      const utcDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0));
      data.specificDate = utcDate.toISOString();
    }

    try {
      if (editingSchedule) {
        await coursesAPI.updateSchedule(courseId, editingSchedule.id, data);
      } else {
        await coursesAPI.createSchedule(courseId, data);
      }
      await fetchData();
      setShowModal(false);
      setEditingSchedule(null);
    } catch (error: any) {
      console.error('Failed to save schedule:', error);
      alert(error.message || 'Failed to save schedule');
    }
  };

  const handleDeleteSchedule = async (schedule: CourseSchedule) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await coursesAPI.deleteSchedule(schedule.courseId, schedule.id);
      await fetchData();
      setSelectedDaySchedules(prev => prev.filter(s => s.id !== schedule.id));
    } catch (error: any) {
      console.error('Failed to delete schedule:', error);
      alert(error.message || 'Failed to delete schedule');
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <AdminNav />
        <main className="flex-1 p-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 font-medium">Loading schedules...</p>
          </div>
        </main>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdminNav />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white tracking-tight">Schedules</h1>
              <p className="text-xl text-gray-300">Manage class 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-bold"> sessions</span> and timetable
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
            >
              📅 Add Session
            </button>
          </div>

          {/* Calendar */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={prevMonth}
                className="p-3 hover:bg-gray-700/50 rounded-xl text-white transition-all transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h2 className="text-3xl font-bold text-white">{monthName}</h2>
              
              <button
                onClick={nextMonth}
                className="p-3 hover:bg-gray-700/50 rounded-xl text-white transition-all transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-center font-semibold text-gray-300 py-3 text-sm uppercase tracking-wider">
                  {day.substring(0, 3)}
                </div>
              ))}

              {/* Calendar days */}
              {daysInMonth.map((date, index) => {
                const sessions = date ? getSessionsForDate(date) : [];
                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`min-h-[100px] p-3 border rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                      !date
                        ? 'bg-gray-800/30 border-gray-700'
                        : isSelected(date)
                        ? 'bg-gradient-to-br from-primary-500/20 to-primary-600/20 border-primary-400 border-2 shadow-lg shadow-primary-500/25'
                        : isToday(date)
                        ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400 border-2 shadow-lg shadow-blue-500/25'
                        : 'bg-gradient-to-br from-gray-700/50 to-gray-800/50 border-gray-600 hover:from-gray-600/50 hover:to-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-bold mb-2 ${
                          isToday(date) 
                            ? 'text-blue-400' 
                            : isSelected(date)
                            ? 'text-primary-400'
                            : 'text-white'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {sessions.slice(0, 2).map((session, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-gradient-to-r from-primary-500/30 to-primary-600/30 text-primary-200 px-2 py-1 rounded-lg truncate border border-primary-400/30"
                              title={`${session.startTime} - ${session.title || (session.course as any)?.title || 'Session'}`}
                            >
                              <div className="font-bold text-primary-300">{session.startTime}</div>
                              <div className="truncate text-primary-200">{session.title || (session.course as any)?.title}</div>
                            </div>
                          ))}
                          {sessions.length > 2 && (
                            <div className="text-xs text-gray-400 font-medium">
                              +{sessions.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Sessions */}
          {selectedDate && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  📅 Sessions for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => handleOpenModal(undefined, selectedDate)}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
                >
                  ➕ Add Session
                </button>
              </div>

              {selectedDaySchedules.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-lg">⏰ No sessions scheduled for this day</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDaySchedules
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(schedule => (
                      <div
                        key={schedule.id}
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowDetailModal(true);
                        }}
                        className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600 rounded-xl p-6 hover:from-gray-600/50 hover:to-gray-700/50 hover:border-primary-500/50 transition-all transform hover:scale-105 cursor-pointer shadow-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-xl font-bold text-white bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                              {schedule.isRecurring && (
                                <span className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-400/30 font-medium">
                                  🔄 Recurring
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-white text-lg mb-2">
                              {schedule.title || (schedule.course as any)?.title || 'Session'}
                            </h4>
                            {schedule.coachName && (
                              <p className="text-sm text-gray-300 mb-2">
                                <span className="font-semibold text-primary-400">Coach:</span> {schedule.coachName}
                              </p>
                            )}
                            {(schedule.course as any)?.description && (
                              <p className="text-sm text-gray-400">
                                {(schedule.course as any).description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-3 ml-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(schedule);
                              }}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 text-sm font-medium"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSchedule(schedule);
                              }}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-500/25 text-sm font-medium"
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
          )}
        </div>
      </main>

      {/* Add/Edit Session Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              {editingSchedule ? '✏️ Edit Session' : '➕ Add New Session'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {courses.length === 0 && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-400/30 rounded-xl p-4 mb-6">
                  <p className="text-yellow-200 text-sm">
                    ⚠️ No courses available. Please create a course first in the <a href="/courses" className="underline font-bold text-yellow-100">Courses page</a>.
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  Course *
                </label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={courses.length === 0}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  Session Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Advanced Yoga Flow"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  Coach Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.coachName}
                  onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
                  placeholder="e.g., John Smith"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-500 bg-gray-600 text-primary-500 focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-sm font-bold text-gray-300">
                    🔄 Recurring Session (repeats every week)
                  </span>
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Day of Week *
                  </label>
                  <select
                    required={formData.isRecurring}
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a day</option>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
                >
                  {editingSchedule ? '✅ Update Session' : '🚀 Create Session'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 rounded-xl font-bold hover:from-gray-500 hover:to-gray-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Session Detail Modal with Course Content */}
      {showDetailModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-5xl w-full p-8 border border-gray-700 shadow-2xl my-8 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-4">
                  📋 {selectedSchedule.title || (selectedSchedule.course as any)?.title || 'Session Details'}
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                    ⏰ {selectedSchedule.startTime} - {selectedSchedule.endTime}
                  </span>
                  {selectedSchedule.isRecurring && (
                    <span className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 text-sm px-3 py-1 rounded-full border border-blue-400/30 font-bold">
                      🔄 Recurring - Every {DAYS_OF_WEEK[selectedSchedule.dayOfWeek || 0]}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-xl ml-4"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Session Info */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 p-6 rounded-xl border border-primary-400/30">
                  <h3 className="text-lg font-bold text-primary-300 mb-4">📅 Session Information</h3>
                  
                  {selectedSchedule.coachName && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-primary-400 mb-2">👨‍🏫 Coach/Instructor</h4>
                      <p className="text-white text-lg font-semibold">{selectedSchedule.coachName}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {(selectedSchedule.course as any)?.duration && (
                      <div>
                        <h4 className="text-sm font-bold text-primary-400 mb-2">⏱️ Duration</h4>
                        <p className="text-white font-semibold">{(selectedSchedule.course as any).duration} minutes</p>
                      </div>
                    )}

                    {(selectedSchedule.course as any)?.capacity && (
                      <div>
                        <h4 className="text-sm font-bold text-primary-400 mb-2">� Capacity</h4>
                        <p className="text-white font-semibold">{(selectedSchedule.course as any).capacity} people</p>
                      </div>
                    )}
                  </div>

                  {selectedSchedule.specificDate && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-primary-400 mb-2">📆 Specific Date</h4>
                      <p className="text-white font-semibold">
                        {new Date(selectedSchedule.specificDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {(selectedSchedule.course as any)?.description && (
                  <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600">
                    <h3 className="text-lg font-bold text-primary-400 mb-4">📝 Course Description</h3>
                    <p className="text-gray-300 leading-relaxed">{(selectedSchedule.course as any).description}</p>
                  </div>
                )}

                {(selectedSchedule.course as any)?.instructor && (
                  <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600">
                    <h3 className="text-lg font-bold text-primary-400 mb-4">👨‍🏫 Course Instructor</h3>
                    <p className="text-white font-semibold">{(selectedSchedule.course as any).instructor}</p>
                  </div>
                )}
              </div>

              {/* Right Column - Course Media & Content */}
              <div className="space-y-6">
                {/* Course Thumbnail */}
                {(selectedSchedule.course as any)?.thumbnail && (selectedSchedule.course as any).thumbnail.trim() !== '' && (
                  <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600">
                    <h3 className="text-lg font-bold text-primary-400 mb-4">🖼️ Course Thumbnail</h3>
                    <div className="relative rounded-xl overflow-hidden bg-gray-800 border border-gray-600">
                      <img 
                        src={
                          (selectedSchedule.course as any).thumbnail.startsWith('http') 
                            ? (selectedSchedule.course as any).thumbnail 
                            : `http://localhost:3001${(selectedSchedule.course as any).thumbnail}`
                        }
                        alt="Course thumbnail" 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="flex items-center justify-center h-48 text-gray-400"><span class="text-4xl">🖼️</span><span class="ml-2">No thumbnail available</span></div>';
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Course Video */}
                {(selectedSchedule.course as any)?.videoUrl && (selectedSchedule.course as any).videoUrl.trim() !== '' && (
                  <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600">
                    <h3 className="text-lg font-bold text-primary-400 mb-4">🎥 Course Video</h3>
                    <div className="relative rounded-xl overflow-hidden bg-gray-800 border border-gray-600">
                      {(selectedSchedule.course as any).videoUrl.includes('youtube.com') || (selectedSchedule.course as any).videoUrl.includes('youtu.be') ? (
                        <div className="w-full h-64">
                          <iframe
                            src={(selectedSchedule.course as any).videoUrl.replace('watch?v=', 'embed/')}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                            title="Course Video"
                          />
                        </div>
                      ) : (
                        <video 
                          controls 
                          className="w-full h-64 object-cover"
                          src={
                            (selectedSchedule.course as any).videoUrl.startsWith('http') 
                              ? (selectedSchedule.course as any).videoUrl 
                              : `http://localhost:3001${(selectedSchedule.course as any).videoUrl}`
                          }
                          onError={(e) => {
                            const target = e.target as HTMLVideoElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-400"><span class="text-4xl">🎥</span><span class="ml-2">Video not available</span></div>';
                            }
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  </div>
                )}

                {/* Course Category Info */}
                {(selectedSchedule.course as any)?.category && (
                  <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600">
                    <h3 className="text-lg font-bold text-primary-400 mb-4">🏷️ Course Category</h3>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                        style={{ 
                          backgroundColor: (selectedSchedule.course as any).category.color + '20', 
                          color: (selectedSchedule.course as any).category.color 
                        }}
                      >
                        {(selectedSchedule.course as any).category.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">{(selectedSchedule.course as any).category.name}</h4>
                        {(selectedSchedule.course as any).category.description && (
                          <p className="text-gray-400 text-sm">{(selectedSchedule.course as any).category.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-400/30">
                  <h3 className="text-lg font-bold text-blue-300 mb-4">📊 Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-500/20 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-300">{(selectedSchedule.course as any)?.duration || 0}</div>
                      <div className="text-sm text-blue-400">Minutes</div>
                    </div>
                    <div className="bg-blue-500/20 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-300">{(selectedSchedule.course as any)?.capacity || 0}</div>
                      <div className="text-sm text-blue-400">Max Students</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleOpenModal(selectedSchedule);
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
              >
                ✏️ Edit Session
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleDeleteSchedule(selectedSchedule);
                }}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-500/25"
              >
                🗑️ Delete Session
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 rounded-xl font-bold hover:from-gray-500 hover:to-gray-600 transition-all transform hover:scale-105 shadow-lg"
              >
                ✅ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
