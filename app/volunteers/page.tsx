'use client'

import React, { useState, useEffect } from 'react';
import HeaderPage from '@/components/common/HeaderPage';
import FooterPage from '@/components/common/FooterPage';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Phone, Mail, Loader2 } from 'lucide-react';

interface Volunteer {
  id: string;
  name: string;
  gaam: string;
  image: string;
  phone: string | null;
  email: string | null;
  objectPosition: string;
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await fetch('/api/public/volunteers');
        if (response.ok) {
          const data = await response.json();
          setVolunteers(data);
        } else {
          console.error('Failed to fetch volunteers');
        }
      } catch (error) {
        console.error('Error fetching volunteers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderPage />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-secondary/20 rounded-full mb-4">
            <Heart className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Our Dedicated Volunteers
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Meet the amazing individuals who dedicate their time and effort to support and connect our 12Gaam community.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-secondary animate-spin" />
            <span className="ml-3 text-lg text-gray-600 font-medium">Loading volunteers...</span>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No volunteers found</h3>
            <p className="text-gray-500">Check back soon for updates to our volunteer team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {volunteers.map((volunteer) => (
              <Card key={volunteer.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group bg-white rounded-2xl">
                <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={volunteer.image}
                    alt={volunteer.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: volunteer.objectPosition || 'top' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                          </div>
                        `;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-6 text-center relative bg-white">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{volunteer.name}</h3>
                   <div className="flex flex-col space-y-2 text-sm text-gray-600 mt-2 border-t pt-4">
                    {volunteer.email && (
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${volunteer.email}`} className="hover:text-blue-600 transition-colors">
                          {volunteer.email}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="inline-flex items-center justify-center px-3 py-1 mt-2 mb-4 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold tracking-wide">
                    {volunteer.gaam}
                  </div>
                 
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <FooterPage />
    </div>
  );
}
