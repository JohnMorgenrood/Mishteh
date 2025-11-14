import Link from 'next/link';
import { RequestCategory, UrgencyLevel } from '@prisma/client';
import { Clock, MapPin, TrendingUp, User } from 'lucide-react';
import { CurrencyDisplay } from './CurrencyDisplay';
import { REQUEST_CATEGORIES } from '@/lib/constants';
import Image from 'next/image';

interface Request {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  urgency: UrgencyLevel;
  location: string;
  targetAmount?: number | null;
  currentAmount: number;
  createdAt: Date;
  user: {
    fullName: string;
    location: string | null;
    image?: string | null;
  };
}

interface RequestCardProps {
  request: Request;
}

const urgencyColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

// Create category labels map from constants
const categoryLabelsMap = REQUEST_CATEGORIES.reduce((acc, cat) => {
  acc[cat.value as RequestCategory] = cat.label;
  return acc;
}, {} as Record<RequestCategory, string>);

export default function RequestCard({ request }: RequestCardProps) {
  const progressPercentage = request.targetAmount
    ? Math.min((request.currentAmount / request.targetAmount) * 100, 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
          {categoryLabelsMap[request.category] || request.category}
        </span>
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${urgencyColors[request.urgency]}`}>
          {request.urgency}
        </span>
      </div>

      {/* User Profile Section */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {request.user.image ? (
            <Image
              src={request.user.image}
              alt={request.user.fullName}
              fill
              className="object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{request.user.fullName}</p>
          {request.user.location && (
            <p className="text-xs text-gray-500">{request.user.location}</p>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
        {request.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {request.description}
      </p>

      {/* Meta Information */}
      <div className="flex flex-col gap-2 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{request.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Posted {new Date(request.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Progress Bar (if target amount is set) */}
      {request.targetAmount && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700">
              <CurrencyDisplay amount={request.currentAmount} /> raised
            </span>
            <span className="text-gray-500">
              of <CurrencyDisplay amount={request.targetAmount} />
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <TrendingUp className="w-3 h-3" />
            <span>{progressPercentage.toFixed(1)}% funded</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <Link
          href={`/requests/${request.id}`}
          className="inline-block px-6 py-2 bg-primary-600 text-white text-sm font-semibold rounded-md hover:bg-primary-700 transition-colors"
        >
          View Details & Donate
        </Link>
      </div>
    </div>
  );
}
