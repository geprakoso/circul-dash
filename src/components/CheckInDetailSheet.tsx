"use client";

import { Drawer } from "vaul";
import { X, Heart, MessageCircle, MapPin, Clock, Share2 } from "lucide-react";

interface CheckInDetailSheetProps {
  post: {
    id: string;
    author: string;
    city: string;
    timeAgo: string;
    title: string;
    body: string;
    topic: string;
    locationLabel?: string;
    coordinateLabel?: string;
    likes: number;
    comments: number;
    imagePaths: string[];
  };
  open: boolean;
  onClose: () => void;
}

export default function CheckInDetailSheet({
  post,
  open,
  onClose,
}: CheckInDetailSheetProps) {
  return (
    <Drawer.Root open={open} onClose={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 bg-black/40 z-[2000]"
          onClick={onClose}
        />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[2001] bg-white rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {post.author}
                </p>
                <p className="text-xs text-gray-500">
                  {post.city} &middot; {post.timeAgo}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-4 py-3">
            {/* Topic badge */}
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-3">
              {post.topic}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {post.title}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {post.body}
            </p>

            {/* Location info */}
            {post.locationLabel && (
              <div className="flex items-start gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">{post.locationLabel}</p>
                  {post.coordinateLabel && (
                    <p className="text-xs text-gray-400">
                      {post.coordinateLabel}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-6 py-3 border-t border-gray-100">
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors">
                <Heart className="w-5 h-5" />
                <span className="text-sm">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.comments}</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors ml-auto">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
