'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { locationsAPI } from '@/lib/api';
import { Location } from '@/types';

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coordinates: '', // Format: 36°54'26.4"N 10°10'49.0"E
    address: '',
    phone: '',
    email: '',
    hours: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const locations = await locationsAPI.getAll();
      setLocations(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseCoordinates = (coordString: string): { latitude: number; longitude: number } | null => {
    try {
      // Parse format like: 36°54'26.4"N 10°10'49.0"E
      const regex = /(\d+)°(\d+)'([\d.]+)"([NS])\s+(\d+)°(\d+)'([\d.]+)"([EW])/;
      const match = coordString.match(regex);
      
      if (!match) {
        // Try simple decimal format: 36.907333, 10.180278
        const simpleMatch = coordString.match(/([-\d.]+),\s*([-\d.]+)/);
        if (simpleMatch) {
          return {
            latitude: parseFloat(simpleMatch[1]),
            longitude: parseFloat(simpleMatch[2]),
          };
        }
        return null;
      }

      // Convert DMS to decimal
      const latDeg = parseInt(match[1]);
      const latMin = parseInt(match[2]);
      const latSec = parseFloat(match[3]);
      const latDir = match[4];

      const lonDeg = parseInt(match[5]);
      const lonMin = parseInt(match[6]);
      const lonSec = parseFloat(match[7]);
      const lonDir = match[8];

      let latitude = latDeg + latMin / 60 + latSec / 3600;
      if (latDir === 'S') latitude = -latitude;

      let longitude = lonDeg + lonMin / 60 + lonSec / 3600;
      if (lonDir === 'W') longitude = -longitude;

      return { latitude, longitude };
    } catch (error) {
      console.error('Error parsing coordinates:', error);
      return null;
    }
  };

  const formatCoordinates = (lat: number, lon: number): string => {
    const formatDMS = (decimal: number, isLat: boolean) => {
      const absolute = Math.abs(decimal);
      const degrees = Math.floor(absolute);
      const minutesDecimal = (absolute - degrees) * 60;
      const minutes = Math.floor(minutesDecimal);
      const seconds = ((minutesDecimal - minutes) * 60).toFixed(1);
      
      let direction = '';
      if (isLat) {
        direction = decimal >= 0 ? 'N' : 'S';
      } else {
        direction = decimal >= 0 ? 'E' : 'W';
      }
      
      return `${degrees}°${minutes}'${seconds}"${direction}`;
    };

    return `${formatDMS(lat, true)} ${formatDMS(lon, false)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const coords = parseCoordinates(formData.coordinates);
    if (!coords) {
      alert('Invalid coordinates format. Use format: 36°54\'26.4"N 10°10\'49.0"E or 36.907333, 10.180278');
      return;
    }

    try {
      const locationData = {
        name: formData.name,
        description: formData.description || undefined,
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        hours: formData.hours || undefined,
        isActive: formData.isActive,
        order: formData.order,
      };

      if (editingLocation) {
        await locationsAPI.update(editingLocation.id, locationData);
      } else {
        await locationsAPI.create(locationData);
      }

      setShowModal(false);
      setEditingLocation(null);
      resetForm();
      fetchLocations();
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Error saving location');
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      description: location.description || '',
      coordinates: formatCoordinates(location.latitude, location.longitude),
      address: location.address || '',
      phone: location.phone || '',
      email: location.email || '',
      hours: location.hours || '',
      isActive: location.isActive,
      order: location.order,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      await locationsAPI.delete(id);
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Error deleting location');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      coordinates: '',
      address: '',
      phone: '',
      email: '',
      hours: '',
      isActive: true,
      order: 0,
    });
  };

  const handleAddNew = () => {
    setEditingLocation(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <AdminNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 font-medium">Loading locations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdminNav />
      
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white tracking-tight">Locations</h1>
            <p className="text-xl text-gray-300">Manage 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-bold"> gym locations</span> and facilities
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
          >
            📍 Add Location
          </button>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Address
              </th>
              <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Coordinates
              </th>
              <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700">
            {locations.map((location) => (
              <tr key={location.id} className="hover:bg-gray-700/50 transition-all">
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{location.name}</div>
                  {location.description && (
                    <div className="text-sm text-gray-400">{location.description}</div>
                  )}
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm text-gray-300">{location.address || 'N/A'}</div>
                  {location.hours && (
                    <div className="text-sm text-gray-400">{location.hours}</div>
                  )}
                </td>
                <td className="px-8 py-6">
                  <div className="text-xs text-gray-400 font-mono">
                    {formatCoordinates(location.latitude, location.longitude)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </div>
                </td>
                <td className="px-8 py-6">
                  {location.phone && (
                    <div className="text-sm text-gray-300">{location.phone}</div>
                  )}
                  {location.email && (
                    <div className="text-sm text-gray-400">{location.email}</div>
                  )}
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span
                    className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      location.isActive
                        ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-400 border border-primary-500/30'
                        : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {location.isActive ? '✅ Active' : '❌ Inactive'}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm font-medium space-x-3">
                  <button
                    onClick={() => handleEdit(location)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 font-medium"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-500/25 font-medium"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {locations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">📍 No locations found. Add your first gym location!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              {editingLocation ? '✏️ Edit Location' : '📍 Add New Location'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  🏢 Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Main Gym Location"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  📝 Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                  placeholder="Our flagship location with state-of-the-art equipment"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  🗺️ Coordinates *
                </label>
                <input
                  type="text"
                  required
                  value={formData.coordinates}
                  onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-mono text-sm"
                  placeholder="36°54'26.4&quot;N 10°10'49.0&quot;E or 36.907333, 10.180278"
                />
                <div className="mt-2 bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                  <p className="text-xs text-gray-400 font-medium">
                    💡 Supported formats: DMS (36°54'26.4"N 10°10'49.0"E) or Decimal (36.907333, 10.180278)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  🏠 Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="123 Fitness Street, City, Country"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    📞 Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    📧 Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="location@gym.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  🕒 Opening Hours
                </label>
                <input
                  type="text"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Mon-Fri: 6am-10pm, Sat-Sun: 8am-8pm"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    🔢 Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    ✅ Status
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
                >
                  {editingLocation ? '✅ Update Location' : '🚀 Add Location'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLocation(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 rounded-xl font-bold hover:from-gray-500 hover:to-gray-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
