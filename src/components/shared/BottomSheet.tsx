'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  snapPoints: number[];
  initialSnap: number;
  title?: string;
  onClose: () => void;
  onSnapChange?: (index: number) => void;
  children: React.ReactNode;
}

export function BottomSheet({
  isOpen,
  snapPoints,
  initialSnap,
  title,
  onClose,
  onSnapChange,
  children,
}: BottomSheetProps) {
  const [activeSnap, setActiveSnap] = useState(initialSnap);
  const [dragging, setDragging] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const sortedSnapPoints = useMemo(() => [...snapPoints].sort((a, b) => a - b), [snapPoints]);
  const maxHeight = sortedSnapPoints[sortedSnapPoints.length - 1] ?? 95;

  useEffect(() => {
    if (isOpen) {
      setActiveSnap(initialSnap);
      setDragHeight(null);
    }
  }, [isOpen, initialSnap]);

  const currentHeight = dragHeight ?? sortedSnapPoints[activeSnap] ?? maxHeight;

  const startDrag = (clientY: number) => {
    setDragging(true);
    startYRef.current = clientY;
    startHeightRef.current = currentHeight;
  };

  const moveDrag = (clientY: number) => {
    if (!dragging) {
      return;
    }

    const delta = startYRef.current - clientY;
    const deltaPercent = (delta / window.innerHeight) * 100;
    const next = Math.max(22, Math.min(96, startHeightRef.current + deltaPercent));
    setDragHeight(next);
  };

  const endDrag = () => {
    if (!dragging) {
      return;
    }

    setDragging(false);
    const height = dragHeight ?? currentHeight;
    if (height < (sortedSnapPoints[0] ?? 30) - 8) {
      onClose();
      return;
    }

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    sortedSnapPoints.forEach((point, index) => {
      const distance = Math.abs(point - height);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveSnap(nearestIndex);
    setDragHeight(null);
    onSnapChange?.(nearestIndex);
  };

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => moveDrag(event.clientY);
    const onPointerUp = () => endDrag();

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragging, dragHeight, currentHeight]);

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar panel"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/35 transition ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <section
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl rounded-t-3xl border border-white/10 bg-[rgba(15,15,15,0.95)] text-[var(--spot-color-text)] shadow-2xl backdrop-blur-xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          height: `${currentHeight}dvh`,
          transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <header
          className="sticky top-0 z-10 rounded-t-3xl border-b border-white/10 bg-[rgba(15,15,15,0.92)] px-4 pb-3 pt-2"
          onPointerDown={(event) => startDrag(event.clientY)}
        >
          <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-gray-500" />
          {title ? <h3 className="text-sm font-semibold text-[var(--spot-color-text)]">{title}</h3> : null}
        </header>
        <div className="h-[calc(100%-56px)] overflow-y-auto p-4">{children}</div>
      </section>
    </>
  );
}
