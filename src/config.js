// Aurelle Home - Site and WhatsApp configuration
export const config = {
  brand: {
    name: 'Aurelle Home',
    tagline: 'Refined Furniture for Modern Living',
    currency: 'KES',
  },
  whatsapp: {
    // Placeholder Kenyan phone number (+254...)
    phoneNumber: '+254700000000',
    generalInquiry: 'Hello Aurelle Home, I would like to inquire about your furniture collection.',
    productInquiry: (productName, price) =>
      `Hello Aurelle Home, I am interested in the ${productName} (KES ${typeof price === 'number' ? price.toLocaleString() : price}). Could you share details on availability and ordering?`,
  },
}

export default config

