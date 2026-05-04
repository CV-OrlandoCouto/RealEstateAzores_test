import React from 'react';
import { useTestimonials } from '../lib/useTestimonials';
import { Loader2, Quote } from 'lucide-react';

export default function Testimonials() {
  const { testimonials, loading } = useTestimonials();

  if (loading) {
    return (
      <section className="py-24 bg-white flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-brand-blue mb-4 leading-tight">
            O que dizem os nossos clientes
          </h2>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto opacity-50 mb-6"></div>
          <p className="text-gray-500 font-light">
            A confiança e satisfação de quem nos escolhe são o nosso maior sucesso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <Quote className="w-8 h-8 text-brand-gold/30 mb-6" />
                <p className="text-gray-600 mb-8 italic">
                  "{testimonial.text}"
                </p>
              </div>
              <div className="flex items-center gap-4">
                {testimonial.imageUrl ? (
                  <img 
                    src={testimonial.imageUrl} 
                    alt={testimonial.name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-brand-gold/20"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xl font-serif">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-brand-blue">{testimonial.name}</h4>
                  {testimonial.title && (
                    <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                      {testimonial.title}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
