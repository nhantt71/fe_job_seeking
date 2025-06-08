import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Add a script to clean up browser extension attributes that cause hydration errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Function to remove BitDefender attributes
                  function removeBitDefenderAttributes() {
                    // Get all elements with BitDefender attributes
                    const elements = document.querySelectorAll('[bis_skin_checked]');
                    
                    // Remove the attributes
                    elements.forEach(el => {
                      el.removeAttribute('bis_skin_checked');
                    });
                  }
                  
                  // Run immediately
                  removeBitDefenderAttributes();
                  
                  // Also run on DOMContentLoaded
                  document.addEventListener('DOMContentLoaded', removeBitDefenderAttributes);
                  
                  // Run periodically to catch any new elements
                  setInterval(removeBitDefenderAttributes, 1000);
                  
                  // Set up a mutation observer to catch any new elements
                  const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                      if (mutation.type === 'attributes' && mutation.attributeName.includes('bis_skin_checked')) {
                        mutation.target.removeAttribute(mutation.attributeName);
                      }
                      
                      // Check for added nodes
                      if (mutation.addedNodes.length) {
                        removeBitDefenderAttributes();
                      }
                    });
                  });
                  
                  // Start observing the document with the configured parameters
                  observer.observe(document.documentElement, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked']
                  });
                } catch (e) {
                  console.error('Error in hydration fix script:', e);
                }
              })();
            `
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 