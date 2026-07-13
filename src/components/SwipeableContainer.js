'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { format, addDays } from 'date-fns';

export function SwipeableContainer({ children, currentDate, className }) {
  const router = useRouter();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50; 

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;

    // Check if horizontal swipe is more prominent than vertical swipe
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe) {
        // Swipe left -> go to next day
        navigateDate(1);
      } else if (isRightSwipe) {
        // Swipe right -> go to previous day
        navigateDate(-1);
      }
    }
  };

  const navigateDate = (daysToAdd) => {
    let current = new Date();
    if (currentDate) {
      const [year, month, day] = currentDate.split('-');
      current = new Date(year, month - 1, day);
    }
    
    const nextDate = addDays(current, daysToAdd);
    const dateStr = format(nextDate, 'yyyy-MM-dd');
    
    // Check if it's today to clean up URL
    const today = new Date();
    if (format(nextDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      router.push('/');
    } else {
      router.push(`/?date=${dateStr}`);
    }
  };

  return (
    <div 
      onTouchStart={onTouchStart} 
      onTouchMove={onTouchMove} 
      onTouchEnd={onTouchEnd}
      className={className || "min-h-screen w-full flex flex-col"}
    >
      {children}
    </div>
  );
}
