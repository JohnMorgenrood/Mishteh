import Link from 'next/link';
import { RequestCategory, UrgencyLevel } from '@prisma/client';
import { Clock, MapPin, TrendingUp } from 'lucide-react';
import { CurrencyDisplay } from './CurrencyDisplay';

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

const categoryLabels: Record<RequestCategory, string> = {
  FOOD: 'Food',
  RENT: 'Rent',
  BILLS: 'Bills',
  FAMILY_SUPPORT: 'Family Support',
  JOB_ASSISTANCE: 'Job Assistance',
  MEDICAL: 'Medical',
  EDUCATION: 'Education',
  OTHER: 'Other',
};

export default function RequestCard({ request }: RequestCardProps) {
  const progressPercentage = request.targetAmount
    ? Math.min((request.currentAmount / request.targetAmount) * 100, 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
          {categoryLabels[request.category]}
        </span>
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${urgencyColors[request.urgency]}`}>
          {request.urgency}
        </span>
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
        <span className="text-sm text-gray-600">
          By {request.user.fullName}
        </span>
        <Link
          href={`/requests/${request.id}`}
          className="inline-block px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-md hover:bg-primary-700 transition-colors"
        >
          Read More
        </Link>
      </div>
    </div>
  );
}
