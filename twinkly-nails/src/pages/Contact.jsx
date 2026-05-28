import { useState } from 'react';
import { whatsappNumber } from '../config/contact';

const Contact = () => {
  const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success
  
  // State to hold what the user types
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    inquiryType: 'General Question',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // 1. Construct the WhatsApp message format
    const whatsappMessage = `*New Website Inquiry* ✨
    
*Name:* ${formData.fullName}
*Phone:* ${formData.phone}
*Type:* ${formData.inquiryType}

*Message:*
${formData.message}`;

    // 2. Encode it so it works in a web URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // 3. Create the official link
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // 4. Simulate a tiny loading delay for a premium feel, then open WhatsApp
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setFormStatus('success');
      
      // Clear the form
      setFormData({
        fullName: '',
        phone: '',
        inquiryType: 'General Question',
        message: ''
      });

      // Reset button after 3 seconds
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-rose-100 relative overflow-hidden py-20 px-6 md:px-10">
      
      {/* Glossy Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-pink/60 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-rose-200/80 rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white text-brand-burgundy font-sans text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
            Get in Touch
          </span>
          <h1 className="font-serif text-5xl md:text-6xl text-brand-burgundy font-bold mb-6 drop-shadow-sm">
            Book Your Service
          </h1>
          <p className="font-sans text-brand-burgundy/70 text-lg max-w-xl mx-auto">
            Have a question about our services or ready to schedule your next pampering session? We would love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          
          {/* Left Column: Contact Info */}
          <div className="lg:col-span-2 flex flex-col space-y-8">
            
            <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-8 shadow-lg shadow-brand-pink/20 hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-serif text-2xl font-bold text-brand-burgundy mb-6">Visit Us</h3>
              
              <div className="space-y-6">
                
                {/* INTERACTIVE ADDRESS BLOCK */}
                <div className="flex items-start">
                  <div className="bg-brand-pink/50 p-3 rounded-full mr-4 text-brand-burgundy flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <p className="font-sans font-bold text-brand-burgundy text-sm uppercase tracking-wider mb-1">Address</p>
                    <a 
                      href="https://maps.app.goo.gl/yKBx4PKSVevm4YzA7" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-brand-burgundy/70 text-sm leading-relaxed hover:text-brand-burgundy hover:underline transition-all duration-300 block font-medium"
                    >
                      No 64, Elabodawatta,<br/>Hendala, Wattala <span className="text-xs text-brand-burgundy/50 block mt-0.5">➔ Open in Maps</span>
                    </a>
                  </div>
                </div>

                {/* OPERATING HOURS */}
                <div className="flex items-start">
                  <div className="bg-brand-pink/50 p-3 rounded-full mr-4 text-brand-burgundy flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="font-sans font-bold text-brand-burgundy text-sm uppercase tracking-wider mb-1">Hours</p>
                    <p className="text-brand-burgundy/70 text-sm leading-relaxed">Tuesday-Sunday: 9.00am - 9.00pm<br/>Poya day: 9.00am - 6.00pm</p>
                  </div>
                </div>

                {/* INTERACTIVE WHATSAPP CONTACT */}
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-full mr-4 text-green-600 flex items-center justify-center shadow-sm border border-green-200">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.332 5.348 0 11.979 0a11.91 11.91 0 018.47 3.506 11.79 11.79 0 013.504 8.464c-.003 6.611-5.347 11.943-11.976 11.943-2.001-.001-3.967-.5-5.753-1.45L0 24zm6.59-4.846c1.674.994 3.322 1.52 5.328 1.522 5.404 0 9.794-4.36 9.797-9.719a9.63 9.63 0 00-2.855-6.88A9.71 9.71 0 0011.979 1.22c-5.41 0-9.803 4.369-9.806 9.73-.001 2.074.549 4.1 1.593 5.899l-1.044 3.816 3.925-1.011zM17.13 14.3c-.28-.14-1.65-.814-1.906-.907-.256-.094-.44-.14-.626.14-.186.28-.718.907-.88 1.092-.162.186-.324.21-.605.07-2.8-.14-4.522-1.282-5.59-2.357-.885-.892-1.307-2.074-1.423-2.73-.045-.255.197-.45.41-.646.126-.115.28-.323.42-.483.14-.16.186-.272.28-.454.093-.181.046-.342-.023-.482-.07-.14-.626-1.507-.856-2.064-.225-.544-.453-.47-.626-.478-.163-.008-.349-.01-.535-.01a1.03 1.03 0 00-.745.348c-.256.28-.978.956-.978 2.33 0 1.373 1.002 2.694 1.141 2.88.14.187 1.974 3.014 4.783 4.225.668.288 1.19.46 1.597.59.672.214 1.285.184 1.768.111.539-.08 1.65-.674 1.882-1.326.233-.652.233-1.21.163-1.325-.07-.115-.256-.185-.536-.325z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans font-bold text-brand-burgundy text-sm uppercase tracking-wider mb-1">WhatsApp Mobile</p>
                    <a 
                      href={`https://wa.me/${whatsappNumber}?text=Hi%20Roshi!%20%E2%9C%A8%20I%20have%20a%20question%20regarding%20an%20appointment.`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-brand-burgundy text-sm font-bold leading-relaxed hover:opacity-80 transition-opacity underline decoration-green-400 underline-offset-4"
                    >
                      0703122757
                    </a>
                  </div>
                </div>

              </div>
            </div> 
          </div>

          {/* Right Column: Glossy Form */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-10 shadow-2xl shadow-brand-pink/30 relative overflow-hidden">
              
              <h3 className="font-serif text-3xl font-bold text-brand-burgundy mb-2">Send a Message</h3>
              <p className="font-sans text-brand-burgundy/70 text-sm mb-8">We will get back to you within 24 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-sans text-xs font-bold text-brand-burgundy uppercase tracking-wider pl-4">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/50 border border-brand-pink/50 rounded-full px-6 py-3 text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:bg-white transition-all duration-300" 
                      placeholder="Jane Doe" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-xs font-bold text-brand-burgundy uppercase tracking-wider pl-4">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/50 border border-brand-pink/50 rounded-full px-6 py-3 text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:bg-white transition-all duration-300" 
                      placeholder="+94 7X XXX XXXX" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-xs font-bold text-brand-burgundy uppercase tracking-wider pl-4">Inquiry Type</label>
                  <select 
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full bg-white/50 border border-brand-pink/50 rounded-full px-6 py-3 text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:bg-white transition-all duration-300 appearance-none"
                  >
                    <option>General Question</option>
                    <option>Bridal Package</option>
                    <option>Group Booking</option>
                    <option>Feedback</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-xs font-bold text-brand-burgundy uppercase tracking-wider pl-4">Message</label>
                  <textarea 
                    rows="4" 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/50 border border-brand-pink/50 rounded-[2rem] px-6 py-4 text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:bg-white transition-all duration-300 resize-none" 
                    placeholder="How can we help you?" 
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={formStatus !== 'idle'}
                  className="w-full bg-gradient-to-r from-brand-burgundy to-rose-900 text-white py-4 rounded-full font-sans text-sm font-bold uppercase tracking-widest hover:opacity-90 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {formStatus === 'idle' && 'Send Message via WhatsApp'}
                  {formStatus === 'submitting' && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  )}
                  {formStatus === 'success' && 'Opening WhatsApp...'}
                </button>
              </form>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;