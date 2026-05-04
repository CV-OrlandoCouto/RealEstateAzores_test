import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [touched, setTouched] = useState({ name: false, email: false, phone: false });

  const validateName = (name: string) => name.trim().length >= 3;
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(phone) && phone.trim().length >= 9;

  const errors = {
    name: !validateName(formData.name) && touched.name ? 'Nome curto.' : '',
    email: !validateEmail(formData.email) && touched.email ? 'Email inválido.' : '',
    phone: !validatePhone(formData.phone) && touched.phone ? 'Telefone inválido.' : ''
  };

  const isFormValid = validateName(formData.name) && validateEmail(formData.email) && validatePhone(formData.phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true });
    
    if (!isFormValid || !formData.message) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'leads'), {
        propertyId: '', // General contact has no propertyId
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        createdAt: Date.now(),
        read: false
      });
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTouched({ name: false, email: false, phone: false });
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar mensagem. Por favor, tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white pb-20">
      {/* Header */}
      <div className="bg-brand-blue py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1596422846543-74c6fc0e24ec?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
        <div className="relative max-w-7xl mx-auto px-4 text-center mt-8">
          <span className="text-brand-gold uppercase tracking-[0.3em] text-sm font-semibold mb-4 block">
            {language === 'pt' ? 'Fale Connosco' : 'Get in Touch'}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 font-light tracking-wide">
            {language === 'pt' ? 'Contacto' : 'Contact'}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-serif text-brand-blue mb-8">
              {language === 'pt' ? 'Estamos aqui para ajudar' : 'We are here to help'}
            </h2>
            <p className="text-gray-600 mb-12 leading-relaxed">
              {language === 'pt' 
                ? 'Quer esteja à procura de comprar, vender ou arrendar, eu estou à sua disposição para esclarecer todas as dúvidas e guiar todo o processo de forma transparente e profissional.' 
                : 'Whether you are looking to buy, sell or rent, I am at your disposal to answer any questions and guide the entire process in a transparent and professional manner.'}
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-full text-brand-blue shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{language === 'pt' ? 'Telefone / WhatsApp' : 'Phone / WhatsApp'}</h3>
                  <a href="tel:+351966341845" className="text-gray-600 hover:text-brand-blue transition-colors">+351 966 341 845</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-full text-brand-blue shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Email</h3>
                  <a href="mailto:carladuartealmeida@remax.pt" className="text-gray-600 hover:text-brand-blue transition-colors">carladuartealmeida@remax.pt</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-full text-brand-blue shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{language === 'pt' ? 'Escritório' : 'Office'}</h3>
                  <p className="text-gray-600">Ponta Delgada, Ilha de São Miguel<br />Açores, Portugal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl shadow-brand-blue/5">
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-6">
              {language === 'pt' ? 'Envie uma mensagem' : 'Send a message'}
            </h3>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'pt' ? 'Nome' : 'Name'} *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (touched.name) setTouched(prev => ({ ...prev, name: validateName(e.target.value) }));
                    }}
                    onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'pt' ? 'Telefone' : 'Phone'} *
                  </label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, phone: e.target.value }));
                      if (touched.phone) setTouched(prev => ({ ...prev, phone: validatePhone(e.target.value) }));
                    }}
                    onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    if (touched.email) setTouched(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                  }}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'pt' ? 'Mensagem' : 'Message'} *
                </label>
                <textarea 
                  rows={4}
                  required
                  value={formData.message}
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all resize-none"
                ></textarea>
              </div>

              {submitSuccess ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium text-center border border-green-100">
                  {language === 'pt' ? 'A sua mensagem foi enviada. Entrarei em contacto consigo brevemente!' : 'Your message has been sent. I will contact you shortly!'}
                </div>
              ) : (
                <button 
                  type="submit" 
                  disabled={!isFormValid || isSubmitting || !formData.message}
                  className="w-full bg-brand-blue text-white py-4 rounded-xl font-medium hover:bg-brand-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  {isSubmitting ? (language === 'pt' ? 'A enviar...' : 'Sending...') : (language === 'pt' ? 'Enviar pedido' : 'Send request')}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
