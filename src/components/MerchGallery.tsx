/* eslint-disable */
import React from 'react';
interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  link: string;
}

interface MerchGalleryProps {
  showName: string;
  products: Product[];
}

const MerchGallery = ({ showName, products }: MerchGalleryProps) => {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-cinzel text-white mb-8 border-l-4 border-orange-600 pl-4 tracking-widest uppercase">
        {showName} Collection
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((item) => (
          <div key={item.id} className="group bg-black/40 border border-orange-500/20 rounded-xl overflow-hidden backdrop-blur-sm hover:border-orange-500/50 transition-all duration-500">
            <div className="relative aspect-square bg-zinc-900 overflow-hidden flex items-center justify-center">
              <img
                src={item.image} 
                alt={item.name}
                className="object-contain w-full h-full p-4 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs font-bold text-orange-400 border border-orange-500/30">
                Official Merch
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-medium text-white mb-1 truncate">{item.name}</h3>
              <p className="text-orange-500 font-bold text-xl mb-4">{item.price}</p>
              
              <a 
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg hover:from-orange-500 hover:to-red-500 transition-all shadow-lg shadow-orange-900/20"
              >
                VIEW PRODUCT
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MerchGallery;