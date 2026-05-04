import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, MapPin } from 'lucide-react';

export default function Blog() {
  const { language } = useLanguage();

  const posts = [
    {
      id: 1,
      title: {
        pt: '5 Razões para Investir em Imóveis na Ilha de São Miguel',
        en: '5 Reasons to Invest in Real Estate in São Miguel Island'
      },
      excerpt: {
        pt: 'Descubra por que a maior ilha dos Açores está a atrair investidores de todo o mundo. Desde o turismo em ascensão até à qualidade de vida.',
        en: 'Discover why the largest island in the Azores is attracting investors from all over the world. From booming tourism to quality of life.'
      },
      date: '28 Abril, 2026',
      image: 'https://images.unsplash.com/photo-1596422846543-74c6fc0e24ec?auto=format&fit=crop&w=800&q=80',
      category: {
        pt: 'Investimento',
        en: 'Investment'
      }
    },
    {
      id: 2,
      title: {
        pt: 'Guia Completo: Como Comprar Casa nos Açores sendo Estrangeiro',
        en: 'Complete Guide: How to Buy a House in the Azores as a Foreigner'
      },
      excerpt: {
        pt: 'Um guia passo a passo sobre os impostos, burocracias e tudo o que precisa de saber para comprar a sua casa de sonho no arquipélago.',
        en: 'A step-by-step guide on taxes, bureaucracy, and everything you need to know to buy your dream home in the archipelago.'
      },
      date: '15 Abril, 2026',
      image: 'https://images.unsplash.com/photo-1582883015509-0d19fbed2ccc?auto=format&fit=crop&w=800&q=80',
      category: {
        pt: 'Guias e Dicas',
        en: 'Guides & Tips'
      }
    },
    {
      id: 3,
      title: {
        pt: 'Ponta Delgada: O Coração dos Açores e as suas Melhores Freguesias',
        en: 'Ponta Delgada: The Heart of the Azores and its Best Parishes'
      },
      excerpt: {
        pt: 'Conheça as zonas mais procuradas em Ponta Delgada para morar ou investir, desde o centro histórico até ao cenário costeiro.',
        en: 'Discover the most sought-after areas in Ponta Delgada to live or invest, from the historic center to the coastal scenery.'
      },
      date: '2 Abril, 2026',
      image: 'https://images.unsplash.com/photo-1627993077797-2a5cb8114f2e?auto=format&fit=crop&w=800&q=80',
      category: {
        pt: 'Viver nos Açores',
        en: 'Living in the Azores'
      }
    }
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-brand-blue py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {language === 'pt' ? 'Blog Açores' : 'Azores Blog'}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {language === 'pt' 
              ? 'Tudo o que precisa de saber sobre Viver, Comprar e Investir no paraíso natural da Ilha de São Miguel.' 
              : 'Everything you need to know about Living, Buying, and Investing in the natural paradise of São Miguel Island.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
              <Link to={`/blog/${post.id}`} className="block relative aspect-[16/10] overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title[language]} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-blue uppercase tracking-wider">
                  {post.category[language]}
                </div>
              </Link>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Carla Almeida</span>
                  </div>
                </div>
                <h2 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-brand-blue transition-colors line-clamp-2">
                  <Link to={`/blog/${post.id}`}>
                    {post.title[language]}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-6 flex-grow line-clamp-3">
                  {post.excerpt[language]}
                </p>
                <Link 
                  to={`/blog/${post.id}`}
                  className="inline-flex items-center text-brand-blue font-semibold hover:text-brand-red transition-colors mt-auto"
                >
                  {language === 'pt' ? 'Ler artigo completo' : 'Read full article'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </article>
          ))}
        </div>
        
        {/* Placeholder for "Load More" */}
        <div className="text-center mt-12">
          <button className="bg-white border-2 border-brand-blue text-brand-blue font-semibold px-8 py-3 rounded-xl hover:bg-brand-blue hover:text-white transition-colors">
            {language === 'pt' ? 'Carregar Mais Artigos' : 'Load More Articles'}
          </button>
        </div>
      </div>
    </div>
  );
}
