/**
 * Portal Homepage Interactions
 * Handles smooth transitions and hover effects for the split portal design
 */

document.addEventListener('DOMContentLoaded', () => {
  const portal = document.getElementById('portal');
  const pageTransition = document.getElementById('pageTransition');
  const portalLinks = document.querySelectorAll('.portal-enter');

  // Handle page transitions
  portalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');

      // Activate transition overlay
      pageTransition.classList.add('active');

      // Navigate after animation
      setTimeout(() => {
        window.location.href = href;
      }, 800);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      document.querySelector('.portal-tech').focus();
    } else if (e.key === 'ArrowRight') {
      document.querySelector('.portal-art').focus();
    }
  });

  // Add subtle parallax effect on mouse move
  const portalSides = document.querySelectorAll('.portal-side');

  portalSides.forEach(side => {
    side.addEventListener('mousemove', (e) => {
      const rect = side.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const content = side.querySelector('.portal-content');
      if (content) {
        content.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
      }

      // Move decorations in opposite direction
      const decorations = side.querySelectorAll('.portal-decoration');
      decorations.forEach((dec, i) => {
        const multiplier = (i + 1) * 5;
        dec.style.transform = `translate(${-x * multiplier}px, ${-y * multiplier}px) ${
          dec.classList.contains('top-left') ? 'rotate(45deg)' :
          dec.classList.contains('bottom-left') ? 'rotate(-15deg)' : ''
        }`;
      });
    });

    side.addEventListener('mouseleave', () => {
      const content = side.querySelector('.portal-content');
      if (content) {
        content.style.transform = 'translate(0, 0)';
      }

      const decorations = side.querySelectorAll('.portal-decoration');
      decorations.forEach(dec => {
        dec.style.transform = dec.classList.contains('top-left') ? 'rotate(45deg)' :
                              dec.classList.contains('bottom-left') ? 'rotate(-15deg)' : '';
      });
    });
  });

  // Preload linked pages for faster transitions
  const preloadLinks = () => {
    portalLinks.forEach(link => {
      const href = link.getAttribute('href');
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'prefetch';
      preloadLink.href = href;
      document.head.appendChild(preloadLink);
    });
  };

  // Preload after initial animations complete
  setTimeout(preloadLinks, 2000);

  // Console greeting for fellow developers
  console.log(
    '%c Hello! %c Welcome to my portfolio.',
    'background: #6366f1; color: white; padding: 4px 8px; border-radius: 2px;',
    'color: #d97706;'
  );
  console.log('Built with care. No frameworks, just HTML, CSS, and vanilla JS.');
});
