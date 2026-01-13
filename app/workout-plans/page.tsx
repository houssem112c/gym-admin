'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { workoutPlansAPI, exercisesAPI } from '@/lib/api';
import { WorkoutPlan, Exercise, Difficulty } from '@/types';

export default function WorkoutPlansPage() {
    const [plans, setPlans] = useState<WorkoutPlan[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goal: '',
        durationWeeks: 4,
        difficulty: 'BEGINNER' as Difficulty,
        imageUrl: '',
        isActive: true,
        exercises: [] as any[],
    });

    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const fetchData = async () => {
        try {
            const [plansData, exercisesData] = await Promise.all([
                workoutPlansAPI.getAll(),
                exercisesAPI.getAll(),
            ]);
            setPlans(plansData);
            setExercises(exercisesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (plan?: WorkoutPlan) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                title: plan.title,
                description: plan.description || '',
                goal: plan.goal || '',
                durationWeeks: plan.durationWeeks || 4,
                difficulty: plan.difficulty,
                imageUrl: plan.imageUrl || '',
                isActive: plan.isActive,
                exercises: plan.exercises.map((ex: any) => ({
                    exerciseId: ex.exerciseId,
                    sets: ex.sets || 3,
                    reps: ex.reps || '10-12',
                    notes: ex.notes || '',
                    order: ex.order,
                })),
            });
        } else {
            setEditingPlan(null);
            setFormData({
                title: '',
                description: '',
                goal: '',
                durationWeeks: 4,
                difficulty: 'BEGINNER',
                imageUrl: '',
                isActive: true,
                exercises: [],
            });
        }
        setImageFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPlan(null);
    };

    const addExerciseToPlan = () => {
        setFormData({
            ...formData,
            exercises: [
                ...formData.exercises,
                { exerciseId: '', sets: 3, reps: '10-12', notes: '', order: formData.exercises.length },
            ],
        });
    };

    const removeExerciseFromPlan = (index: number) => {
        const newExercises = [...formData.exercises];
        newExercises.splice(index, 1);
        // Re-order
        const reordered = newExercises.map((ex, i) => ({ ...ex, order: i }));
        setFormData({ ...formData, exercises: reordered });
    };

    const updatePlanExercise = (index: number, field: string, value: any) => {
        const newExercises = [...formData.exercises];
        newExercises[index] = { ...newExercises[index], [field]: value };
        setFormData({ ...formData, exercises: newExercises });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.exercises.length === 0) {
            alert('Please add at least one exercise to the plan');
            return;
        }

        if (formData.exercises.some((ex: any) => !ex.exerciseId)) {
            alert('Please select an exercise for all rows');
            return;
        }

        setSaving(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('goal', formData.goal);
            data.append('durationWeeks', formData.durationWeeks.toString());
            data.append('difficulty', formData.difficulty);
            data.append('isActive', formData.isActive.toString());
            data.append('imageUrl', formData.imageUrl);
            data.append('exercises', JSON.stringify(formData.exercises));

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (editingPlan) {
                await workoutPlansAPI.updateWithFiles(editingPlan.id, data);
            } else {
                await workoutPlansAPI.createWithFiles(data);
            }
            await fetchData();
            handleCloseModal();
        } catch (error: any) {
            console.error('Failed to save workout plan:', error);
            alert(error.message || 'Failed to save workout plan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this workout plan?')) return;

        try {
            await workoutPlansAPI.delete(id);
            await fetchData();
        } catch (error: any) {
            console.error('Failed to delete workout plan:', error);
            alert(error.message || 'Failed to delete workout plan');
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <AdminNav />

            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white tracking-tight">Workout Plans</h1>
                            <p className="text-xl text-gray-300">Create structured
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-bold"> training routines</span>
                            </p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
                        >
                            ➕ Create Plan
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
                            <p className="text-xl text-gray-300 font-medium">Loading plans...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {plans.map((plan) => (
                                <div key={plan.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700 overflow-hidden flex flex-col">
                                    {plan.imageUrl && (
                                        <img src={plan.imageUrl} alt={plan.title} className="w-full h-48 object-cover border-b border-gray-700" />
                                    )}
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${plan.difficulty === 'BEGINNER' ? 'bg-green-500/20 text-green-400' :
                                                plan.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {plan.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{plan.description}</p>
                                        <div className="flex items-center text-sm text-gray-300 mb-6 space-x-4">
                                            <span>⏱️ {plan.durationWeeks} Weeks</span>
                                            <span>💪 {plan.exercises.length} Exercises</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleOpenModal(plan)}
                                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-bold hover:from-blue-600 transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(plan.id)}
                                                className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-all border border-red-500/50"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {plans.length === 0 && (
                                <div className="col-span-full text-center py-20 bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-700">
                                    <p className="text-gray-400 text-lg">📋 No workout plans yet. Create your first one!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 border border-gray-700 shadow-2xl my-8">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">
                            {editingPlan ? '✏️ Edit Workout Plan' : '🚀 Create New Plan'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-3">Title *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                            placeholder="E.g., 4-Week Hypertrophy Guide"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-3">Goal</label>
                                        <input
                                            type="text"
                                            value={formData.goal}
                                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                            placeholder="E.g., Muscle Gain"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-3">Description</label>
                                        <textarea
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-300 mb-3">Duration (Weeks)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.durationWeeks}
                                                onChange={(e) => setFormData({ ...formData, durationWeeks: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                            />
                                        </div>
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
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-3">Plan Cover Image</label>
                                        <div className="space-y-3">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary-500 file:text-white hover:file:bg-primary-600 transition-all"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">OR URL</span>
                                                <input
                                                    type="url"
                                                    value={formData.imageUrl}
                                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                                                    placeholder="External Image URL"
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
                            </div>

                            {/* Exercises Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <h3 className="text-xl font-bold text-white">Exercises in Plan</h3>
                                    <button
                                        type="button"
                                        onClick={addExerciseToPlan}
                                        className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-700 transition-all flex items-center space-x-2"
                                    >
                                        <span>➕ Add Exercise</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.exercises.map((planEx, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 bg-gray-800/30 p-4 rounded-xl border border-gray-700 relative group animate-fadeIn">
                                            <div className="lg:col-span-2">
                                                <label className="text-xs text-gray-500 font-bold mb-1 block">Exercise</label>
                                                <select
                                                    required
                                                    value={planEx.exerciseId}
                                                    onChange={(e) => updatePlanExercise(index, 'exerciseId', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none"
                                                >
                                                    <option value="">Select Exercise...</option>
                                                    {exercises.map(ex => (
                                                        <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscleGroup})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 font-bold mb-1 block">Sets</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={planEx.sets}
                                                    onChange={(e) => updatePlanExercise(index, 'sets', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 font-bold mb-1 block">Reps</label>
                                                <input
                                                    type="text"
                                                    value={planEx.reps}
                                                    onChange={(e) => updatePlanExercise(index, 'reps', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none"
                                                    placeholder="E.g., 10-12"
                                                />
                                            </div>
                                            <div className="flex space-x-2">
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 font-bold mb-1 block">Notes</label>
                                                    <input
                                                        type="text"
                                                        value={planEx.notes}
                                                        onChange={(e) => updatePlanExercise(index, 'notes', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none"
                                                        placeholder="Optional tip"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeExerciseFromPlan(index)}
                                                    className="mt-5 text-red-500 hover:text-red-400 p-2"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {formData.exercises.length === 0 && (
                                        <p className="text-center text-gray-500 py-4">No exercises added to this plan yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : editingPlan ? '✅ Update Plan' : '🚀 Create Plan'}
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
