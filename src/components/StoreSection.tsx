import { useState } from 'react';
import { ShoppingBag, CheckCircle2, X, MessageCircle } from 'lucide-react';
import type { Product } from '../types';

interface StoreSectionProps {
  products: Product[];
  studioPhoneDisplay: string;
  onProductPurchased: (updatedProduct: Product) => void;
}

export default function StoreSection({
  products,
  studioPhoneDisplay,
  onProductPurchased,
}: StoreSectionProps) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderCode: string;
    productName: string;
    total: number;
    whatsappFallbackUrl: string;
  } | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const openOrderModal = (product: Product) => {
    setActiveProduct(product);
    setQuantity(1);
    setErrorMsg(null);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    setErrorMsg(null);

    if (!clientName.trim() || !clientPhone.trim()) {
      setErrorMsg('Ingresa tu nombre y WhatsApp para apartar el producto.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/store/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: activeProduct.id,
          quantity,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'No se pudo procesar tu pedido.');
        return;
      }

      onProductPurchased(data.product as Product);
      setOrderSuccess({
        orderCode: data.orderCode,
        productName: activeProduct.name,
        total: data.total,
        whatsappFallbackUrl: data.whatsappFallbackUrl,
      });
      setActiveProduct(null);
      setClientName('');
      setClientPhone('');
    } catch {
      setErrorMsg('Error de conexión al registrar el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-[#D4AF37] uppercase">
            Cuidado Masculino
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-[#F5F2EC] sm:text-4xl">
            Tienda Oficial YUMBA
          </h2>
        </div>
        <p className="text-sm text-[#9E9589]">
          Productos profesionales de salón con recojo inmediato en estudio.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const outOfStock = product.stock <= 0;
          const imgFailed = Boolean(failedImages[product.id]);

          return (
            <article
              key={product.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151311]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0B0A09]">
                {!imgFailed ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [product.id]: true }))
                    }
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#5E574E]">
                    <ShoppingBag className="h-10 w-10" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs text-[#9E9589]">
                  <span>{product.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {outOfStock ? 'Agotado' : `${product.stock} en stock`}
                  </span>
                </div>

                <h3 className="mt-2 font-display text-base font-bold text-[#F5F2EC]">
                  {product.name}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-[#9E9589]">
                  {product.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="font-mono tabular-nums text-lg font-bold text-[#D4AF37]">
                    S/ {product.price.toFixed(2)}
                  </span>

                  <button
                    type="button"
                    disabled={outOfStock}
                    onClick={() => openOrderModal(product)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#E5C14B] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#777066] whitespace-nowrap shrink-0"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{outOfStock ? 'Agotado' : 'Apartar'}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Product Reservation Modal */}
      {activeProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <form
            onSubmit={handleOrderSubmit}
            className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#151311] p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setActiveProduct(null)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-[#9E9589] hover:text-[#F5F2EC]"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-xl font-bold text-[#F5F2EC]">
              Apartar Producto
            </h3>
            <p className="mt-1 text-sm text-[#D4AF37]">{activeProduct.name}</p>

            {errorMsg && (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs text-red-200">
                {errorMsg}
              </p>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#D6CFC5] mb-1.5">
                  Tu Nombre
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Carlos Mendoza"
                  className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-3.5 py-2.5 text-sm text-[#F5F2EC] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#D6CFC5] mb-1.5">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="987 654 321"
                    className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-3.5 py-2.5 text-sm font-mono tabular-nums text-[#F5F2EC] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#D6CFC5] mb-1.5">
                    Cantidad (Máx {activeProduct.stock})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={activeProduct.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.min(activeProduct.stock, Math.max(1, Number(e.target.value) || 1))
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-3.5 py-2.5 text-sm font-mono tabular-nums text-[#F5F2EC] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                <span className="text-[#9E9589]">Total a pagar en estudio</span>
                <span className="font-mono tabular-nums text-lg font-bold text-[#D4AF37]">
                  S/ {(activeProduct.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#0B0A09] hover:bg-[#E5C14B] disabled:opacity-60"
            >
              {submitting ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </form>
        </div>
      )}

      {/* Order Confirmed Modal */}
      {orderSuccess && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#D4AF37]/40 bg-[#151311] p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              <div>
                <h3 className="font-display text-lg font-bold text-[#F5F2EC]">
                  Producto Apartado
                </h3>
                <p className="font-mono text-xs text-[#D4AF37]">{orderSuccess.orderCode}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-[#D6CFC5]">
              Separamos <strong>{orderSuccess.productName}</strong> por un total de{' '}
              <span className="font-mono font-semibold text-[#D4AF37]">
                S/ {orderSuccess.total.toFixed(2)}
              </span>
              . Notificamos al WhatsApp {studioPhoneDisplay}.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={orderSuccess.whatsappFallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Coordinar por WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setOrderSuccess(null)}
                className="rounded-lg border border-white/15 px-4 py-2.5 text-xs font-medium text-[#F5F2EC] hover:bg-white/5"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
