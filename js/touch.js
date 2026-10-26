// Etsuko Mobile Touch & Gesture Engine
class TouchController {
  constructor() {
    this.startY = 0;
    this.startX = 0;
    this.currentY = 0;
    this.currentX = 0;
    this.isDragging = false;
  }

  vibrate(ms = 12) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  }

  initPlayerDrawerGestures(drawerElement, onDismiss) {
    if (!drawerElement) return;

    // Attach drag gestures only to the top drag handle, header, and album cover
    const handles = drawerElement.querySelectorAll('#sheet-drag-pill, .sheet-drag-handle, .sheet-header, .sheet-cover-container');
    const targets = handles.length > 0 ? Array.from(handles) : [drawerElement];

    targets.forEach(target => {
      target.addEventListener('touchstart', (e) => {
        // Ignore if user tapped a button or scrubber inside the header
        if (e.target.closest('button') || e.target.closest('input')) return;
        this.startY = e.touches[0].clientY;
        this.startX = e.touches[0].clientX;
        this.currentY = this.startY;
        this.currentX = this.startX;
        this.isDragging = true;
        drawerElement.style.transition = 'none';
      }, { passive: true });

      target.addEventListener('touchmove', (e) => {
        if (!this.isDragging) return;
        this.currentY = e.touches[0].clientY;
        this.currentX = e.touches[0].clientX;
        const deltaY = this.currentY - this.startY;
        const deltaX = Math.abs(this.currentX - this.startX);

        // Drag down only when vertical gesture is dominant
        if (deltaY > 0 && deltaY > deltaX) {
          drawerElement.style.transform = `translateY(${deltaY}px)`;
        }
      }, { passive: true });

      const endHandler = () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        drawerElement.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        const deltaY = this.currentY - this.startY;
        if (deltaY > 110) {
          this.vibrate(18);
          if (onDismiss) onDismiss();
        } else {
          drawerElement.style.transform = 'translateY(0)';
        }
        this.startY = 0;
        this.currentY = 0;
        this.startX = 0;
        this.currentX = 0;
      };

      target.addEventListener('touchend', endHandler, { passive: true });
      target.addEventListener('touchcancel', endHandler, { passive: true });
    });
  }

  initMiniPlayerSwipe(miniPlayerElement, onNext, onPrev) {
    if (!miniPlayerElement) return;

    let sX = 0, sY = 0, moved = false;
    miniPlayerElement.addEventListener('touchstart', (e) => {
      // Don't trigger swipe on mini player play/pause button
      if (e.target.closest('button')) return;
      sX = e.touches[0].clientX;
      sY = e.touches[0].clientY;
      moved = true;
    }, { passive: true });

    const endSwipe = (e) => {
      if (!moved) return;
      moved = false;
      const touch = e.changedTouches ? e.changedTouches[0] : null;
      if (!touch) return;
      const diffX = touch.clientX - sX;
      const diffY = touch.clientY - sY;

      // Only horizontal swipe if not vertical drag
      if (Math.abs(diffX) > 50 && Math.abs(diffY) < 45) {
        this.vibrate(15);
        if (diffX < 0 && onNext) onNext();
        else if (diffX > 0 && onPrev) onPrev();
      }
    };

    miniPlayerElement.addEventListener('touchend', endSwipe, { passive: true });
    miniPlayerElement.addEventListener('touchcancel', () => { moved = false; }, { passive: true });
  }
}

window.touch = new TouchController();
