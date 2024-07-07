import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';

interface InstagramPostProps {
  username: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
}

const InstagramPost: React.FC<InstagramPostProps> = ({ username, imageUrl, caption, likes, comments }) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-md my-4">
      {/* Header */}
      <div className="flex items-center p-4">
        <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
          <Image src="/placeholder-avatar.jpg" alt={username} width={32} height={32} className="object-cover" />
        </div>
        <span className="font-semibold text-sm">{username}</span>
        <div className="ml-auto">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      </div>

      {/* Image */}
      <div className="relative h-96">
        <Image src={imageUrl} alt="Post" layout="fill" objectFit="cover" />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex space-x-4">
          <Heart className="w-6 h-6" />
          <MessageCircle className="w-6 h-6" />
          <Send className="w-6 h-6" />
        </div>
        <Bookmark className="w-6 h-6" />
      </div>

      {/* Likes */}
      <div className="px-4 py-2">
        <span className="font-semibold text-sm">{likes} likes</span>
      </div>

      {/* Caption */}
      <div className="px-4 py-2">
        <span className="font-semibold text-sm mr-2">{username}</span>
        <span className="text-sm">{caption}</span>
      </div>

      {/* Comments */}
      <div className="px-4 py-2">
        <span className="text-sm text-gray-500">View all {comments} comments</span>
      </div>

      {/* Add Comment */}
      <div className="border-t border-gray-200 px-4 py-2">
        <input 
          type="text" 
          placeholder="Add a comment..." 
          className="w-full text-sm outline-none"
        />
      </div>
    </div>
  );
};

export default InstagramPost;