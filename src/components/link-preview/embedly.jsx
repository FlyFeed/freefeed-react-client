import { memo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { darkTheme } from '../select-utils';
import FoldableContent from './helpers/foldable-content';
import * as heightCache from './helpers/size-cache';

export default memo(function EmbedlyPreview({ url }) {
  const box = useRef();
  const feedIsLoading = useSelector((state) => state.routeLoadingState);
  const isDarkTheme = useSelector(darkTheme);

  useEffect(() => {
    initEmbedly();
    box.current.innerHTML = `<a
      href="${url.replace(/"/g, '&quot;')}"
      data-card-controls="0"
      data-card-width="400px"
      data-card-recommend="0"
      data-card-align="left"
      data-card-theme="${isDarkTheme ? 'dark' : 'light'}"
    ></a>`;
    window.embedly('card', box.current.firstChild);
  }, [feedIsLoading, isDarkTheme, url]);

  return (
    <FoldableContent>
      <div
        ref={box}
        className="embedly-preview link-preview-content"
        data-url={url}
        style={{ height: `${heightCache.get(url, 0)}px` }}
      />
    </FoldableContent>
  );
});

function initEmbedly() {
  const id = 'embedly-platform';
  if (document.querySelector(`#${id}`)) {
    return;
  }
  window.embedly =
    window.embedly ||
    // We have to use the classic 'function()' here (rather than an arrow
    // function) because of the way Embedly detects the type of this variable.
    function (...args) {
      (window.embedly.q = window.embedly.q || []).push(args);
    };

  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = `//cdn.embedly.com/widgets/platform.js`;
  const [lastScript] = document.querySelectorAll('script');
  lastScript.parentNode.insertBefore(script, lastScript);

  // Listen for resize events
  window.embedly('on', 'card.resize', (iframe) => {
    const cont = iframe.closest('.embedly-preview');
    if (!cont) {
      return;
    }
    const height = iframe.offsetHeight;
    cont.style.height = `${height}px`;
    heightCache.set(cont.dataset.url, height);
  });
}
