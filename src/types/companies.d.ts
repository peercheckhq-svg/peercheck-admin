interface Root {
  status: string;
  code: number;
  data: Company[];
  links: Links;
  meta: Meta;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  email: any;
  phone: any;
  website?: string;
  address: any;
  city?: string;
  description: any;
  size?: string;
  founded?: string;
  status: string;
  isPopular: boolean;
  socials?: string;
  metadata: any;
  totalReviewsCount: number;
  companyReviewsCount: number;
  salaryReviewsCount: number;
  interviewReviewsCount: number;
  averageOverallRating: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: any;
  createdBy: any;
  updatedBy: any;
  deletedBy: any;
  submittedBy?: string;
}

interface Links {
  first: string;
  last: string;
  prev: any;
  next: string;
}

interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  links: Link[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

interface Link {
  url?: string;
  label: string;
  page?: number;
  active: boolean;
}
