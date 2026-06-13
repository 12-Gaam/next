'use client'

import React from 'react';
import HeaderPage from '@/components/common/HeaderPage';
import FooterPage from '@/components/common/FooterPage';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users } from 'lucide-react';
import Image from 'next/image';

const volunteers = [
  { id: 1, name: "Kevin", gaam: "Manjrol", image: "/images/volunteers/image1.png" },
  { id: 2, name: "Ulkesh", gaam: "Kukas", image: "/images/volunteers/image2.png" },
  { id: 3, name: "Akshay", gaam: "Kukas", image: "/images/volunteers/image3.png" },
  { id: 4, name: "Rajesh", gaam: "Jafarpura", image: "/images/volunteers/image4.png", objectPosition: "center 20%" },
  { id: 5, name: "Prakash", gaam: "Pisai", image: "/images/volunteers/image5.png" },
  { id: 6, name: "Pratik", gaam: "Kukas", image: "/images/volunteers/image6.png", objectPosition: "center 30%" },
  { id: 7, name: "Amrish", gaam: "Sandha", image: "/images/volunteers/image7.png" },
  { id: 8, name: "Swetketu", gaam: "Sandha", image: "/images/volunteers/image8.png" },
  { id: 9, name: "Jatin", gaam: "Vemar", image: "/images/volunteers/image9.png" },
  { id: 10, name: "Chirag", gaam: "Jithardi", image: "/images/volunteers/image10.png" },
  { id: 11, name: "Jignesh", gaam: "Vemar", image: "/images/volunteers/image11.png" },
  { id: 12, name: "Ankit", gaam: "Malpur", image: "/images/volunteers/image12.png" },
  { id: 13, name: "Chandresh", gaam: "Puniyad", image: "/images/volunteers/image13.png", objectPosition: "center 20%" },
  { id: 14, name: "Dipak", gaam: "Pisai", image: "/images/volunteers/image14.png" },
  { id: 15, name: "Prakash (Badal)", gaam: "Awakhal", image: "/images/volunteers/image15.png", objectPosition: "center" },
  { id: 16, name: "Ronak", gaam: "Pisai", image: "/images/volunteers/image16.png" },
  { id: 17, name: "Mayank", gaam: "Kukas", image: "/images/volunteers/image17.png" },
  { id: 18, name: "Kiran", gaam: "Puniyad", image: "/images/volunteers/image18.png" },
  { id: 19, name: "Aakash", gaam: "Bhekhda", image: "/images/volunteers/image19.png" },
  { id: 20, name: "Jeet", gaam: "Someshwarpura", image: "/images/volunteers/image20.png" },
  { id: 21, name: "Chandresh", gaam: "Awakhal", image: "/images/volunteers/image21.png", objectPosition: "center 20%" },
  { id: 22, name: "Piyush", gaam: "Puniyad", image: "/images/volunteers/image22.png" },
  { id: 23, name: "Chintesh", gaam: "Vemar", image: "/images/volunteers/image23.png" },
  { id: 24, name: "Kiran", gaam: "Pisai", image: "/images/volunteers/image24.jpeg" }
];

export default function VolunteersPage() {
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
                <div className="inline-flex items-center justify-center px-3 py-1 mt-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold tracking-wide">
                  {volunteer.gaam}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <FooterPage />
    </div>
  );
}
