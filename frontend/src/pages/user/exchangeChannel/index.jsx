import React from 'react';
import GroupCard from '@/components/exchange/GroupCard';

// Mock data for groups
const GROUPS = [
  {
    id: 'CS101',
    name: 'Introduction to Computer Science',
    description: 'Basic concepts of programming and algorithms.',
  },
  {
    id: 'MATH202',
    name: 'Advanced Calculus',
    description: 'Multivariable calculus and differential equations.',
  },
  {
    id: 'ENG301',
    name: 'Creative Writing Workshop',
    description: 'Explore various forms of creative writing.',
  },
  {
    id: 'PHY101',
    name: 'General Physics I',
    description: 'Mechanics, heat, and sound.',
  },
  {
    id: 'CHEM101',
    name: 'General Chemistry I',
    description: 'Atomic structure, bonding, and reactions.',
  },
  {
    id: 'ART101',
    name: 'Art History',
    description: 'Survey of art from prehistoric to modern times.',
  },
];

export default function ExchangeChannel() {
  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kênh trao đổi</h1>
        <p className="text-gray-600">Tham gia vào nhóm để bắt đầu trao đổi và thảo luận.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GROUPS.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}