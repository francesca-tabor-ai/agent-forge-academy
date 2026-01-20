'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Loader2 } from 'lucide-react';

interface Course {
  id: string;
  startup_id: string;
  title: string;
  level: string;
  price: number;
  access_tier: string;
  description?: string;
  startups?: {
    name: string;
  };
}

interface CoursesManagementTabProps {
  onEdit: (course: Course) => void;
  onDelete: (id: string) => Promise<void>;
}

export function CoursesManagementTab({ onEdit, onDelete }: CoursesManagementTabProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      } else {
        console.error('Failed to load courses:', response.statusText);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      // Reload after successful delete
      loadCourses();
    } catch (err) {
      // Error already handled by onDelete
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-ca-neutral-400 mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
          <thead style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">Course</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider hidden sm:table-cell">Startup</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">Level</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider hidden md:table-cell">Price</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider hidden lg:table-cell">Access</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {course.title}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-ca-neutral-500 hidden sm:table-cell">
                  {course.startups?.name || 'N/A'}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-ca-neutral-500 capitalize">
                  {course.level}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-ca-neutral-500 hidden md:table-cell">
                  ${course.price}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-ca-neutral-500 capitalize hidden lg:table-cell">
                  {course.access_tier}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(course)}
                      className="text-ca-gold hover:text-ca-navy transition-colors"
                      title="Edit course"
                      aria-label="Edit course"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete course"
                      aria-label="Delete course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ca-neutral-500 font-sans">No courses found</p>
        </div>
      )}
    </div>
  );
}
