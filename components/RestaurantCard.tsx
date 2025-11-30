import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { Restaurant } from '../types';
import { useApp } from '../contexts/AppContext';

const { Link } = ReactRouterDOM as any;

interface Props {
  data: Restaurant;
}

const RestaurantCard: React.FC<Props> = ({ data }) => {
  const { t } = useApp();
  
  return (
    <Link to={`/restaurant/${data.id}`} className="group block h-full">
      <div className="bg-white dark:bg-stone-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 dark:border-stone-800 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={data.image} 
            alt={data.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Offer Badge */}
          {data.offers && data.offers.length > 0 && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wide z-10">
              {data.offers[0]}
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white dark:bg-stone-900 px-2 py-1 rounded-lg text-xs font-bold shadow-md text-stone-900 dark:text-stone-100">
            {data.cuisine}
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">
              {data.name}
            </h3>
            <div className="flex items-center gap-1 bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded text-sm font-semibold text-primary-700 dark:text-primary-400">
              <Star size={14} className="fill-current" />
              {data.rating}
            </div>
          </div>
          
          <div className="flex items-center text-stone-500 dark:text-stone-400 text-sm mb-3">
            <MapPin size={14} className="mr-1" />
            <span className="truncate">{data.address}</span>
          </div>

          <p className="text-stone-600 dark:text-stone-400 text-sm line-clamp-2 mb-4 flex-grow">
            {data.description}
          </p>
          
          <div className="flex items-center justify-end pt-4 border-t border-stone-100 dark:border-stone-800 mt-auto">
             <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold group-hover:underline">
               {t.bookTable}
             </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;