/**
 * Inject MathJax into the document head
 */
export function injectMathJax(): void {
  if (!(window as any).MathJax) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.0/es5/tex-svg-full.js';
    script.async = true;
    document.head.appendChild(script);
  }
}

/**
 * Initialize the global MathJax object
 * @param callback Callback to be used after Mathjax loads
 */
export function initMathJax(callback: () => any): void {
  injectMathJax();
  (window as any).MathJax = {
    tex: {
      // In line formula flag
      inlineMath: [['$', '$']],
      // Block level formula flag
      displayMath: [['$$', '$$']],
      // The following two mainly support rendering some formulas , You can understand for yourself
      processEnvironments: true,
      processRefs: true,
    },
    options: {
      // Skip rendered tags
      skipHtmlTags: ['noscript', 'style', 'textarea', 'pre', 'code'],
      /*
       * skip mathjax, the class name of the element being processed. Any element specifies
       * a class  tex2jax_ignore  Will be skipped , Many tired = Class name 'class1|class2'
       */
      ignoreHtmlClass: 'tex2jax_ignore',
    },
    startup: {
      //  When mathjax Load and initialize the completed callback
      pageReady: () => {
        // eslint-disable-next-line no-unused-expressions
        callback && callback();
      },
    },
    svg: {
      fontCache: 'global',
    },
  };
}
