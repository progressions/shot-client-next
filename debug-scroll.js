// Paste this in browser console to find what's blocking scrolling
console.log('Checking for scroll blockers...');

// Check body and html
console.log('Body overflow:', window.getComputedStyle(document.body).overflow);
console.log('HTML overflow:', window.getComputedStyle(document.documentElement).overflow);

// Find all elements with overflow hidden
const hiddenElements = Array.from(document.querySelectorAll('*')).filter(el => {
  const style = window.getComputedStyle(el);
  return style.overflow === 'hidden' || style.overflowY === 'hidden';
});

console.log('Elements with overflow:hidden:', hiddenElements);

// Find fixed position elements that might be blocking
const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
  const style = window.getComputedStyle(el);
  return style.position === 'fixed' && el.offsetHeight > window.innerHeight * 0.5;
});

console.log('Large fixed elements:', fixedElements);

// Try to force enable scrolling
document.body.style.overflow = 'auto';
document.documentElement.style.overflow = 'auto';
document.body.style.height = 'auto';
document.documentElement.style.height = 'auto';

// Remove overflow hidden from all elements temporarily
hiddenElements.forEach(el => {
  el.style.overflow = 'visible';
});

console.log('Attempted to force enable scrolling. Try scrolling now.');