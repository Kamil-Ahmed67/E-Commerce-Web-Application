'use client';

import { useState } from 'react';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';
import config from '../../../config';
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all required fields (Name, Email, Message).');
      return;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TenantId': config.tenantId
        },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomCustomer',
          parameters: {
            QueryChecker: 2,
            Name: formData.name,
            Email: formData.email,
            Subject: formData.subject,
            Phone: formData.phone,
            Message: formData.message
          }
        })
      });

      const result = await response.json();

      if (!response.ok || result.Status === 'error') {
        throw new Error(result.Message || 'Failed to save message');
      }

      toast.success('Your Message Has Been Received!');

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      console.error('Error saving message:', error);
      alert('Error sending message: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className='pt-16 manrope lg:pt-25'>
      {/* Hero Banner */}
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full">
          <Image
            src="/images/about/banner.jpg"
            alt="Get In Touch Background"
            width={1920}
            height={800}
            className="w-full h-auto object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-transparent"></div>
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center text-center px-4">
          <div className="text-white max-w-xl lg:max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Get In Touch
            </h1>
            <p className="text-md sm:text-xl">
              We&apos;d love to hear from you. Let us know how we can help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="overflow-hidden py-16 manrope bg-gray-50">
        <div className="px-2 sm:px-8 xl:px-9">
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Contact Form */}
            <div className="lg:w-2/3 w-full bg-white shadow-lg p-6 sm:p-8 xl:p-10 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-700 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col lg:flex-row gap-5 text-gray-700 sm:gap-8 mb-5">
                  <div className="w-full">
                    <label htmlFor="name" className="block mb-2.5 font-medium">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your name"
                      className="border border-gray-300 bg-gray-50 placeholder:text-gray-500 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-1 focus:ring-black rounded-md"
                    />
                  </div>
                  <div className="w-full">
                    <label htmlFor="subject" className="block mb-2.5 font-medium">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Type your subject"
                      className="border border-gray-300 bg-gray-50 placeholder:text-gray-500 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-1 focus:ring-black rounded-md"
                    />
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row text-gray-700 gap-5 sm:gap-8 mb-5">
                  <div className="w-full">
                    <label htmlFor="email" className="block mb-2.5 font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      className="border border-gray-300 bg-gray-50 placeholder:text-gray-500 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-1 focus:ring-black rounded-md"
                    />
                  </div>
                  <div className="w-full">
                    <label htmlFor="phone" className="block mb-2.5 font-medium">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone"
                      className="border border-gray-300 bg-gray-50 placeholder:text-gray-500 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-1 focus:ring-black rounded-md"
                    />
                  </div>
                </div>
                <div className="mb-7.5">
                  <label htmlFor="message" className="block mb-2.5 text-gray-700 font-medium">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Type your message"
                    className="border border-gray-300 bg-gray-50 placeholder:text-gray-500 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-1 focus:ring-black rounded-md"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="inline-flex font-medium text-white bg-teal-500 text-sm lg:text-lg py-2 lg:py-3 px-3 lg:px-8 hover:bg-teal-700 transition ease-in-out duration-500 rounded-sm"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info & Fashion Cards */}
            <div className="lg:w-1/3 flex flex-col gap-8">
              {/* Contact Info */}
              <div className="bg-white shadow-lg p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-700  mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FiMapPin className="w-6 h-6 text-black mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-700 ">Address</h4>
                      <p className="text-gray-600">ROAD-33,SECTOR-3, BALY COMPLEX, AJAMPUR, UTTARA, DHAKA-1230</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiPhone className="w-6 h-6 text-black mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-700 ">Phone</h4>
                      <p className="text-gray-600">+880 1302-815322</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiMail className="w-6 h-6 text-black mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-700 ">Email</h4>
                      <p className="text-gray-600">info@minglefashionbd.com</p>
                    </div>
                  </div>
                </div>

                {/* Social Icons */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-4">
                  <a href="#" className="text-gray-600 hover:text-black">
                    <FaFacebookF className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-black">
                    <FaInstagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-black">
                    <FaTwitter className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Fashion Cards */}
              <div className="relative h-64 w-full overflow-hidden shadow-lg rounded-sm">
                <Image
                  src="/images/about/consultant.jpg"
                  alt="Style Consultation"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-transparent"></div>
                <div className="relative z-10 h-full flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-2">Style Consultation</h3>
                    <p className="mb-4">Need fashion advice? Book a free consultation with our stylists.</p>
                    <button className="bg-white text-black py-2 px-4 text-sm font-medium hover:bg-gray-100 rounded">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative h-64 w-full overflow-hidden shadow-lg rounded-sm">
                <Image
                  src="/images/about/store.jpg"
                  alt="Store Locations"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-transparent"></div>
                <div className="relative z-10 h-full flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-2">Store Locations</h3>
                    <p className="mb-4">Visit our physical stores for a personalized shopping experience.</p>
                    <button className="bg-white text-black py-2 px-4 text-sm font-medium hover:bg-gray-100 rounded">
                      Find Stores
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
