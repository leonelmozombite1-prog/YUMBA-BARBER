import { useState } from 'react';
import { Star } from 'lucide-react';
import type { Review } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
  onReviewAdded: (review: Review) => void;
}

export default function ReviewsSection({ reviews, onReviewAdded }: ReviewsSectionProps) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!author.trim() || !comment.trim()) {
      setFeedback('Por favor escribe tu nombre y tu opinión.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: author.trim(),
          rating,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || 'No se pudo publicar tu reseña.');
        return;
      }
      onReviewAdded(data.review as Review);
      setAuthor('');
      setComment('');
      setRating(5);
      setFeedback('¡Gracias por compartir tu experiencia en YUMBA!');
    } catch {
      setFeedback('Error de red al publicar tu reseña.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-[#F5F2EC] sm:text-4xl text-balance">
          Reseñas de la Experiencia YUMBA
        </h2>
        <p className="mt-2.5 text-sm text-[#9E9589]">
          Lo que nuestros clientes opinan sobre nuestros cortes, puntualidad y atención VIP.
        </p>
      </div>

      {/* Review Submission Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-white/10 bg-[#151311] p-6 sm:p-8"
      >
        <h3 className="font-display text-lg font-bold text-[#D4AF37]">
          Déjanos tu opinión
        </h3>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Tu Nombre"
            required
            className="flex-1 rounded-lg border border-white/10 bg-[#0B0A09] px-4 py-3 text-sm text-[#F5F2EC] placeholder-[#6B645B] focus:border-[#D4AF37] focus:outline-none"
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9E9589]">Calificación:</span>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Calificación">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} estrellas`}
                  className="p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded"
                >
                  <Star
                    className={`h-5 w-5 transition-colors ${
                      star <= rating
                        ? 'fill-[#D4AF37] text-[#D4AF37]'
                        : 'text-[#4B453E]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Qué tal te pareció el corte, el trato y el ambiente?"
          required
          className="mt-4 w-full rounded-lg border border-white/10 bg-[#0B0A09] px-4 py-3 text-sm text-[#F5F2EC] placeholder-[#6B645B] focus:border-[#D4AF37] focus:outline-none"
        />

        {feedback && (
          <p className="mt-3 text-xs text-[#D4AF37]">{feedback}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-lg bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0B0A09] transition-colors hover:bg-[#E5C14B] disabled:opacity-60"
        >
          {submitting ? 'Publicando...' : 'Publicar Reseña'}
        </button>
      </form>

      {/* Reviews Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        {reviews.map((rev) => (
          <article
            key={rev.id}
            className="rounded-2xl border border-white/10 bg-[#151311] p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-[#F5F2EC]">{rev.author}</h4>
              <div className="flex items-center gap-0.5" aria-label={`${rev.rating} de 5 estrellas`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= rev.rating
                        ? 'fill-[#D4AF37] text-[#D4AF37]'
                        : 'text-[#3A3530]'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm italic leading-relaxed text-[#B5AEA4]">
              "{rev.comment}"
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
