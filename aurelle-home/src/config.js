// Aurelle Home - Site, contact, and WhatsApp configuration
export const config = {
  brand: {
    name: 'Aurelle Home',
    tagline: 'Refined Furniture for Modern Living',
    currency: 'KES',
  },
  contact: {
    phone: '+254 ',
    email: 'unclaimedtechnologies@gmail.com',
    locations: 'Kisii & Kisumu Showrooms',
  },
  whatsapp: {
    // Placeholder Kenyan phone number (+254...)
    phoneNumber: '+254757611486',
    generalInquiry: 'Hello Aurelle Home, I would like to inquire about your furniture collection.',
    productInquiry: (productName, price) =>
      `Hello Aurelle Home, I am interested in the ${productName} (KES ${typeof price === 'number' ? price.toLocaleString() : price}). Could you share details on availability and ordering?`,
  },
}

export default config
