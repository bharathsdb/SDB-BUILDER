"use client";

import * as React from "react";
import { Star, Edit3, Trash2, MessageSquare, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, Modal } from "@/components/ui";
import { useUIStore } from "@/lib/stores/ui-store";

interface Review {
  id: number;
  projectName: string;
  rating: number;
  text: string;
  date: string;
  professional: string;
}

const initialReviews: Review[] = [
  { id: 1, projectName: "Modern Duplex 30x40", rating: 5, text: "Excellent design! The AI-generated layout was perfect for our needs. Highly recommend for anyone looking for modern architectural plans.", date: "2 weeks ago", professional: "Ar. Priya Sharma" },
  { id: 2, projectName: "Luxury Villa Design", rating: 4, text: "Great work on the Vastu optimization. The team was very responsive to feedback and made all the adjustments we requested.", date: "1 month ago", professional: "David Chen Interiors" },
  { id: 3, projectName: "Scandinavian Apartment", rating: 5, text: "Outstanding interior design suggestions. The Scandinavian aesthetic was captured perfectly.", date: "2 months ago", professional: "Nordic Designs Co." },
];

export default function ReviewsPage() {
  const { addToast } = useUIStore();
  const [reviews, setReviews] = React.useState(initialReviews);
  const [showWriteModal, setShowWriteModal] = React.useState(false);
  const [editingReview, setEditingReview] = React.useState<Review | null>(null);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [newRating, setNewRating] = React.useState(0);
  const [newText, setNewText] = React.useState("");
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleSave = () => {
    if (newRating === 0) {
      addToast("Please select a rating", "error");
      return;
    }
    if (!newText.trim()) {
      addToast("Please write a review", "error");
      return;
    }
    if (editingReview) {
      setReviews(reviews.map((r) => r.id === editingReview.id ? { ...r, rating: newRating, text: newText } : r));
      addToast("Review updated successfully", "success");
    } else {
      const newReview: Review = {
        id: Date.now(),
        projectName: "Modern Duplex 30x40",
        rating: newRating,
        text: newText,
        date: "Just now",
        professional: "Ar. Priya Sharma",
      };
      setReviews([newReview, ...reviews]);
      addToast("Review submitted successfully", "success");
    }
    setShowWriteModal(false);
    setEditingReview(null);
    setNewRating(0);
    setNewText("");
  };

  const openEdit = (review: Review) => {
    setEditingReview(review);
    setNewRating(review.rating);
    setNewText(review.text);
    setShowWriteModal(true);
  };

  const openWrite = () => {
    setEditingReview(null);
    setNewRating(0);
    setNewText("");
    setShowWriteModal(true);
  };

  const handleDelete = (id: number) => {
    setReviews(reviews.filter((r) => r.id !== id));
    addToast("Review deleted", "info");
    setDeleteId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Reviews</h1>
          <p className="text-slate-500">Manage reviews you&apos;ve written for professionals.</p>
        </div>
        <Button onClick={openWrite}>
          <Edit3 className="w-4 h-4" /> Write a Review
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">No Reviews Yet</h3>
            <p className="text-sm text-slate-500 mb-4">You haven&apos;t written any reviews yet.</p>
            <Button onClick={openWrite}>Write Your First Review</Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm">{review.projectName}</h3>
                  <p className="text-xs text-slate-500">{review.professional}</p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{review.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {review.date}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(review)}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(review.id)}>
                    <Trash2 className="w-4 h-4 text-danger" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Write / Edit Review Modal */}
      <Modal isOpen={showWriteModal} onClose={() => { setShowWriteModal(false); setEditingReview(null); }} title={editingReview ? "Edit Review" : "Write a Review"} size="md">
        <div className="space-y-6">
          {!editingReview && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Professional</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                <option>Ar. Priya Sharma</option>
                <option>David Chen Interiors</option>
                <option>BuildRight Engineering</option>
                <option>GreenBuild Contractors</option>
                <option>Nordic Designs Co.</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNewRating(i + 1)}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`w-8 h-8 transition-all ${
                      i < (hoverRating || newRating)
                        ? "text-amber-400 fill-amber-400 scale-110"
                        : "text-slate-200 dark:text-slate-700"
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm text-slate-500 ml-2">
                {newRating === 0 ? "Select rating" : `${newRating} / 5`}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Review</label>
            <textarea
              rows={5}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Share your experience working with this professional..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleSave}>
              {editingReview ? "Update Review" : "Submit Review"}
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => { setShowWriteModal(false); setEditingReview(null); }}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Review" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Are you sure you want to delete this review? This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
