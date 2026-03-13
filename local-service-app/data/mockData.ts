export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type Provider = {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  isCertified: boolean;
};

export type Service = {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  imageUrl: string;
  provider: Provider;
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Plumbing', icon: 'plumbing' },
  { id: 'c2', name: 'Cleaning', icon: 'cleaning-services' },
  { id: 'c3', name: 'Tutoring', icon: 'school' },
  { id: 'c4', name: 'Training', icon: 'fitness-center' },
  { id: 'c5', name: 'Electric', icon: 'electrical-services' },
  { id: 'c6', name: 'Moving', icon: 'local-shipping' },
  { id: 'c7', name: 'Landscaping', icon: 'grass' },
  { id: 'c8', name: 'Tech Support', icon: 'computer' },
  { id: 'c9', name: 'Pet Care', icon: 'pets' },
  { id: 'c10', name: 'Handyman', icon: 'build' },
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 's1',
    categoryId: 'c2',
    title: 'Deep Home Cleaning',
    subtitle: 'by Sparkle & Shine Co.',
    description: 'Full-service interior restoration and deep cleaning. We use medical-grade sanitization and eco-friendly products to ensure your space is spotless and safe for everyone.',
    price: 35,
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2670&auto=format&fit=crop',
    provider: {
      id: 'p1',
      name: 'Eleanor Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
      rating: 4.9,
      reviewCount: 158,
      isCertified: true,
    }
  },
  {
    id: 's2',
    categoryId: 'c3',
    title: 'Mathematics & Physics Tutor',
    subtitle: 'by Dr. Sarah Mitchell',
    description: 'Expert tutoring in high school and college-level Mathematics and Physics. Personalized lesson plans to help you ace your exams and understand complex concepts.',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2670&auto=format&fit=crop',
    provider: {
      id: 'p2',
      name: 'Dr. Sarah Mitchell',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
      rating: 4.8,
      reviewCount: 94,
      isCertified: true,
    }
  },
  {
    id: 's3',
    categoryId: 'c4',
    title: 'Elite Fitness Coaching',
    subtitle: 'by James Rodriguez',
    description: 'Achieve your dream physique with customized 1-on-1 personal training. Includes nutritional guidance, workout programming, and weekly check-ins.',
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop',
    provider: {
      id: 'p3',
      name: 'James Rodriguez',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
      rating: 5.0,
      reviewCount: 204,
      isCertified: true,
    }
  },
  {
    id: 's4',
    categoryId: 'c1',
    title: 'Emergency Plumbing Repair',
    subtitle: 'by AquaTech Services',
    description: '24/7 service for leaks, clogs, and pipe bursts. Fast, reliable, and professional repairs with a 1-year guarantee on all parts and labor.',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57cb8be94?q=80&w=2574&auto=format&fit=crop',
    provider: {
      id: 'p4',
      name: 'Mike Johnson',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
      rating: 4.7,
      reviewCount: 112,
      isCertified: true,
    }
  },
  {
    id: 's5',
    categoryId: 'c5',
    title: 'Electrical Installation & Maintenance',
    subtitle: 'by Volt Masters',
    description: 'Licensed and insured electricians for residential and commercial wiring, panel upgrades, and lighting installations.',
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2669&auto=format&fit=crop',
    provider: {
      id: 'p5',
      name: 'David Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
      rating: 4.9,
      reviewCount: 88,
      isCertified: true,
    }
  },
  {
    id: 's6',
    categoryId: 'c7',
    title: 'Professional Lawn Care',
    subtitle: 'by Green Thumb Landscaping',
    description: 'Complete lawn maintenance including mowing, edging, weed control, and seasonal fertilizing for a perfectly green yard.',
    price: 45,
    imageUrl: 'https://images.unsplash.com/photo-1558904541-efa843a96f0f?q=80&w=2670&auto=format&fit=crop',
    provider: {
      id: 'p6',
      name: 'Robert Davis',
      avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=256&auto=format&fit=crop',
      rating: 4.6,
      reviewCount: 82,
      isCertified: false,
    }
  },
  {
    id: 's7',
    categoryId: 'c8',
    title: 'Home Network Setup',
    subtitle: 'by Tech Wizards',
    description: 'Professional installation of home mesh Wi-Fi systems, router configuration, and securing your smart home devices from external threats.',
    price: 75,
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2670&auto=format&fit=crop',
    provider: {
      id: 'p7',
      name: 'Alex Turner',
      avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=256&auto=format&fit=crop',
      rating: 4.9,
      reviewCount: 315,
      isCertified: true,
    }
  },
  {
    id: 's8',
    categoryId: 'c9',
    title: 'Premium Dog Walking',
    subtitle: 'by Happy Paws',
    description: 'Energetic 60-minute neighborhood walks or park visits. Includes GPS tracking, photo updates, and basic command reinforcement.',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?q=80&w=2670&auto=format&fit=crop',
    provider: {
      id: 'p8',
      name: 'Jessica Wong',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop',
      rating: 5.0,
      reviewCount: 412,
      isCertified: true,
    }
  },
  {
    id: 's9',
    categoryId: 'c10',
    title: 'TV Mounting & Setup',
    subtitle: 'by FixIt Pro',
    description: 'Secure wall mounting for TVs up to 85 inches. Concealed wire management and connection to soundbars and streaming devices included.',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2642&auto=format&fit=crop',
    provider: {
      id: 'p9',
      name: 'Marcus Bell',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
      rating: 4.8,
      reviewCount: 198,
      isCertified: true,
    }
  },
  {
    id: 's10',
    categoryId: 'c6',
    title: 'Local Apartment Moving',
    subtitle: 'by Swift Movers',
    description: 'Two professional movers and a 16ft box truck. We handle disassembly, wrapping, careful transport, and reassembly at your new home.',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop',
    provider: {
      id: 'p10',
      name: 'Swift Delivery Logistics',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
      rating: 4.7,
      reviewCount: 521,
      isCertified: true,
    }
  }
];

export const getServiceById = (id: string) => {
  return MOCK_SERVICES.find(service => service.id === id);
};
