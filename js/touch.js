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

    const dragHandle = drawerElement.querySelector('.drawer-handle-bar') || drawerElement.querySelector('.player-sheet-header');
    const target = dragHandle || drawerElement;

    target.addEventListener('touchstart', (e) => {
      this.startY = e.touches[0].clientY;
      this.isDragging = true;
      drawerElement.style.transition = 'none';
    }, { passive: true });

    target.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      this.currentY = e.touches[0].clientY;
      const deltaY = this.currentY - this.startY;
      if (deltaY > 0) {
        // Dragging down
        drawerElement.style.transform = `translateY(${deltaY}px)`;
      }
    }, { passive: true });

    target.addEventListener('touchend', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      drawerElement.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      const deltaY = this.currentY - this.startY;
      if (deltaY > 120) {
        this.vibrate(18);
        if (onDismiss) onDismiss();
      } else {
        drawerElement.style.transform = 'translateY(0)';
      }
      this.startY = 0;
      this.currentY = 0;
    });
  }

  initMiniPlayerSwipe(miniPlayerElement, onNext, onPrev) {
    if (!miniPlayerElement) return;

    let sX = 0, sY = 0;
    miniPlayerElement.addEventListener('touchstart', (e) => {
      sX = e.touches[0].clientX;
      sY = e.touches[0].clientY;
    }, { passive: true });

    miniPlayerElement.addEventListener('touchend', (e) => {
      const eX = e.changedTouches[0].clientX;
      const eY = e.changedTouches[0].clientY;
      const diffX = eX - sX;
      const diffY = eY - sY;

      // Only horizontal swipe if not vertical drag
      if (Math.abs(diffX) > 60 && Math.abs(diffY) < 40) {
        this.vibrate(15);
        if (diffX < 0 && onNext) onNext();
        else if (diffX > 0 && onPrev) onPrev();
      }
    });
  }
}

window.touch = new TouchController();
