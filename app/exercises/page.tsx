'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { exercisesAPI } from '@/lib/api';
import { Exercise, Difficulty } from '@/types';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCube } from 'react-icons/hi';

export default function ExercisesPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        muscleGroup: '',
        equipment: '',
        difficulty: 'BEGINNER' as Difficulty,
        videoUrl: '',
        imageUrl: '',
        isActive: true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const [saving, setSaving] = useState(false);

    const fetchExercises = async () => {
        try {
            const data = await exercisesAPI.getAll();
            setExercises(data);
        } catch (error) {
            console.error('Failed to fetch exercises:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExercises();
    }, []);

    const handleOpenModal = (exercise?: Exercise) => {
        if (exercise) {
            setEditingExercise(exercise);
            setFormData({
                name: exercise.name,
                description: exercise.description || '',
                muscleGroup: exercise.muscleGroup || '',
                equipment: exercise.equipment || '',
                difficulty: exercise.difficulty,
                videoUrl: exercise.videoUrl || '',
                imageUrl: exercise.imageUrl || '',
                isActive: exercise.isActive,
            });
        } else {
            setEditingExercise(null);
            setFormData({
                name: '',
                description: '',
                muscleGroup: '',
                equipment: '', 
                difficulty: 'BEGINNER',
                videoUrl: '',
                imageUrl: '',
                isActive: true,
            });
        }
        setImageFile(null);
        setVideoFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingExercise(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('muscleGroup', formData.muscleGroup);
            data.append('equipment', formData.equipment);
            data.append('difficulty', formData.difficulty);
            data.append('isActive', String(formData.isActive));

            if (formData.imageUrl) data.append('imageUrl', formData.imageUrl);
            if (formData.videoUrl) data.append('videoUrl', formData.videoUrl);

            if (imageFile) data.append('image', imageFile);
            if (videoFile) data.append('video', videoFile);

            if (editingExercise) {
                await exercisesAPI.updateWithFiles(editingExercise.id, data);
            } else {
                await exercisesAPI.createWithFiles(data);
            }
            await fetchExercises();
            handleCloseModal();
        } catch (error: any) {
            console.error('Failed to save exercise:', error);
            alert(error.message || 'Failed to save exercise');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this exercise?')) return;

        try {
            await exercisesAPI.delete(id);
            await fetchExercises();
        } catch (error: any) {
            console.error('Failed to delete exercise:', error);
            alert(error.message || 'Failed to delete exercise');
        }
    };

    return (
        <div className="flex min-h-screen">
            <AdminNav />

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Library</h1>
                            <p className="text-surface-400 mt-2 font-medium">Coordinate the biometric movement database.</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="premium-button-primary"
                        >
                            <HiOutlinePlus className="w-5 h-5" />
                            Register Movement
                        </button>
                    </div>


                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                            <div className="w-12 h-12 border-4 border-surface-800 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-surface-500 font-bold uppercase tracking-widest text-xs">Syncing Biometrics...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto pb-10 animate-slide-up">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Movement Architecture</th>
                                        <th>Biological Matrix</th>
                                        <th>Skill Level</th>
                                        <th>Deployment Status</th>
                                        <th className="text-right pr-10">System Ops</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exercises.map((exercise) => (
                                        <tr key={exercise.id} className="group">
                                            <td>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-surface-950 border border-surface-800 overflow-hidden relative p-1">
                                                        <div className="w-full h-full rounded-xl overflow-hidden bg-surface-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                            {exercise.imageUrl ? (
                                                                <img src={exercise.imageUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                            ) : (
                                                                <HiOutlineCube className="w-6 h-6 text-surface-800" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{exercise.name}</div>
                                                        <div className="text-[10px] font-bold text-surface-600 uppercase tracking-widest">{exercise.equipment || 'Bodyweight'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-xs font-black text-surface-400 uppercase tracking-tighter">
                                                {exercise.muscleGroup || 'Universal'}
                                            </td>
                                            <td>
                                                <span className={`status-badge !rounded-lg text-[10px] ${exercise.difficulty === 'BEGINNER' ? 'bg-primary-500/10 text-primary-500' :
                                                    exercise.difficulty === 'INTERMEDIATE' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-accent-500/10 text-accent-500'
                                                    }`}>
                                                    {exercise.difficulty}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${exercise.isActive ? 'bg-primary-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-surface-800'}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${exercise.isActive ? 'text-primary-500' : 'text-surface-600'}`}>
                                                        {exercise.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-right pr-4">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => handleOpenModal(exercise)} className="p-2.5 bg-surface-900 text-white rounded-xl hover:bg-primary-500/20 hover:text-primary-500 transition-all border border-surface-800">
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(exercise.id)} className="p-2.5 bg-surface-900 text-white rounded-xl hover:bg-accent-500/20 hover:text-accent-500 transition-all border border-surface-800">
                                                        <HiOutlineTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {exercises.length === 0 && (
                                <div className="text-center py-20 bg-surface-900/10 rounded-3xl border border-dashed border-surface-800">
                                    <p className="text-surface-600 font-bold uppercase tracking-widest text-xs">No movements registered</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 border border-gray-700 shadow-2xl my-8">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">
                            {editingExercise ? '✏️ Edit Exercise' : '➕ Add New Exercise'}
                        </h2>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="E.g., Bench Press"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3">Description</label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                        placeholder="Describe the exercise technique..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-3">Muscle Group</label>
                                        <input
                                            type="text"
                                            value={formData.muscleGroup}
                                            onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                            placeholder="E.g., Chest"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-3">Equipment</label>
                                        <input
                                            type="text"
                                            value={formData.equipment}
                                            onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                            placeholder="E.g., Barbell"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    >
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="ADVANCED">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3">Image</label>
                                    <div className="space-y-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary-500/10 file:text-primary-500 hover:file:bg-primary-500/20 transition-all cursor-pointer"
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 uppercase font-bold text-[10px] tracking-widest bg-gray-700/50 px-2 py-0.5 rounded">OR URL</span>
                                            <input
                                                type="url"
                                                value={formData.imageUrl}
                                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                                className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                                                placeholder="External Image URL"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3">Video</label>
                                    <div className="space-y-3">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary-500/10 file:text-primary-500 hover:file:bg-primary-500/20 transition-all cursor-pointer"
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 uppercase font-bold text-[10px] tracking-widest bg-gray-700/50 px-2 py-0.5 rounded">OR URL</span>
                                            <input
                                                type="url"
                                                value={formData.videoUrl}
                                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                                className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                                                placeholder="External Video URL"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 pt-4">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-6 h-6 rounded text-primary-500 focus:ring-primary-500 bg-gray-700 border-gray-600"
                                    />
                                    <label htmlFor="isActive" className="text-gray-300 font-bold">Active and Visible</label>
                                </div>
                            </div>

                            <div className="md:col-span-2 flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : editingExercise ? '✅ Update Exercise' : '🚀 Create Exercise'}
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
