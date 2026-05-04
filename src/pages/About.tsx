import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

export default function About() {
  const { language } = useLanguage();

  return (
    <div className="w-full bg-white pb-20">
      {/* Hero Section */}
      <div className="relative bg-brand-blue py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1596422846543-74c6fc0e24ec?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-center mt-20">
          <span className="text-brand-gold uppercase tracking-[0.3em] text-sm font-semibold mb-4 block">
            {language === 'pt' ? 'A sua Consultora' : 'Your Consultant'}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-6 font-light tracking-wide">
            Carla Duarte Almeida
          </h1>
          <div className="w-16 h-px bg-brand-gold mx-auto mb-6"></div>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-light tracking-wide">
            {language === 'pt' 
              ? 'Consultora Imobiliária e Gestora de Propriedades em São Miguel, Açores' 
              : 'Real Estate Consultant and Property Manager tracking in São Miguel, Azores'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden shadow-2xl relative z-10 w-full max-w-md mx-auto">
              <img 
                src="/carla-1.jpg" 
                alt="Carla Duarte Almeida" 
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Decorative background element */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-brand-blue/5 -z-10"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-brand-gold/10 -z-10"></div>
          </div>

          {/* Text Side */}
          <div className="space-y-6">
            <span className="text-brand-gold uppercase tracking-[0.2em] text-sm font-semibold">Remax 4You</span>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-blue font-light">
              {language === 'pt' ? 'Boas-vindas aos Açores' : 'Welcome to the Azores'}
            </h2>
            
            <div className="prose prose-lg text-gray-600 font-light leading-relaxed">
              {language === 'pt' ? (
                <>
                  <p>
                    Olá, sou a <strong>Carla Duarte Almeida</strong>, a sua consultora imobiliária de confiança na vibrante <strong>Remax 4You</strong>, localizada na deslumbrante Ilha de São Miguel, nos Açores.
                  </p>
                  <p>
                    Com vasta experiência em <strong>Mediação Imobiliária e Gestão de Propriedades</strong>, o meu principal objetivo é facilitar a compra e venda de imóveis na nossa bela ilha, oferecendo um serviço personalizado, transparente e totalmente focado nos seus interesses.
                  </p>
                  <p>
                    Quer procure uma moradia em frente ao mar, uma herdade com vistas panorâmicas para as montanhas e florestas de São Miguel, ou um apartamento acolhedor no centro de Ponta Delgada, comprometo-me a utilizar todo o meu conhecimento de mercado e profissionalismo para encontrar a propriedade ideal para si.
                  </p>
                  <p>
                    Por que escolher a ilha de São Miguel? A qualidade de vida inigualável, a natureza pura e as excelentes oportunidades de investimento atraem cada vez mais pessoas de todo o mundo. E eu estou aqui para guiar todo o seu processo, de forma simples e segura, quer seja do continente, ou além-fronteiras.
                  </p>
                  <div className="mt-10 border-l px-6 py-4 border-brand-gold/50 bg-gray-50/50">
                    <p className="text-brand-blue font-serif italic text-xl m-0">
                      "O meu compromisso é com o seu sonho. Juntos, faremos negócio com confiança e segurança."
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Hello, I'm <strong>Carla Duarte Almeida</strong>, your trusted real estate consultant at the dynamic <strong>Remax 4You</strong>, located on the stunning island of São Miguel, in the Azores.
                  </p>
                  <p>
                    With extensive experience in <strong>Real Estate Mediation and Property Management</strong>, my main goal is to facilitate the buying and selling of properties on our beautiful island, offering a personalized, transparent service that is entirely focused on your interests.
                  </p>
                  <p>
                    Whether you're looking for an oceanfront villa, an estate with panoramic views of the mountains and forests of São Miguel, or a cozy apartment in the center of Ponta Delgada, I am committed to using all my market knowledge and professionalism to find the ideal property for you.
                  </p>
                  <p>
                    Why choose São Miguel? The unparalleled quality of life, pristine nature, and excellent investment opportunities are attracting more and more people from all over the world. And I am here to guide your entire process, simply and safely, whether you're from mainland Portugal or abroad.
                  </p>
                  <div className="mt-10 border-l px-6 py-4 border-brand-gold/50 bg-gray-50/50">
                    <p className="text-brand-blue font-serif italic text-xl m-0">
                      "My commitment is to your dream. Together, we will do business with confidence and security."
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="pt-8 block">
              <Link
                to="/contact" 
                className="inline-block bg-brand-blue text-white uppercase tracking-widest text-sm font-medium px-10 py-4 hover:bg-brand-blue/90 transition-colors"
              >
                {language === 'pt' ? 'Falar com a Carla' : 'Speak with Carla'}
              </Link>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="mt-32">
          <div className="flex flex-col items-center mb-16 text-center">
            <span className="text-brand-gold uppercase tracking-[0.2em] text-sm mb-4 font-semibold">Portfolio</span>
            <h3 className="text-3xl md:text-4xl font-serif text-brand-blue mb-6 font-light">
              {language === 'pt' ? 'Galeria' : 'Gallery'}
            </h3>
            <div className="w-16 h-px bg-brand-gold"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="aspect-[3/4] overflow-hidden group">
              <img src="/carla-1.jpg" alt="Carla Duarte Almeida 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="aspect-[3/4] overflow-hidden mt-0 md:mt-12 group">
              <img src="/carla-2.jpg" alt="Carla Duarte Almeida 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="aspect-[3/4] overflow-hidden mt-0 md:mt-24 group">
              <img src="/carla-3.jpg" alt="Carla Duarte Almeida 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
