import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const waNumber = "351966341845"; 
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent("Olá! Gostaria de mais informações sobre as propriedades nos Açores.")}`;

  return (
    <a 
      href={waUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform z-40 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
      <span className="absolute right-full mr-4 bg-white text-gray-900 px-3 py-1 rounded shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat connosco
      </span>
    </a>
  );
}
