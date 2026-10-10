/**
 * Scrolls smoothly to a target element or ID with sticky header offset,
 * and sets focus on the element for keyboard and accessibility.
 */
export function focusAndScrollTo(elementOrId: HTMLElement | string | null, offset = 110) {
  if (typeof window === 'undefined' || !elementOrId) return;

  const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const absoluteTop = rect.top + window.pageYOffset;
  const targetTop = Math.max(0, absoluteTop - offset);

  window.scrollTo({
    top: targetTop,
    behavior: 'smooth',
  });

  if ('focus' in el && typeof el.focus === 'function') {
    setTimeout(() => {
      try {
        el.focus({ preventScroll: true });
      } catch {
        // ignore
      }
    }, 200);
  }
}
