import { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { renderToString } from 'react-dom/server';
import * as Sentry from '@sentry/react';

import { showMedia } from '../redux/action-creators';
import { lazyComponent } from './lazy-component';
import { getVideoType, getVideoInfo } from './link-preview/video';
import {
  canShowURL as isInstagram,
  getEmbedInfo as getInstagramEmbedInfo,
} from './link-preview/instagram';
import { canShowURL as isTwitter } from './link-preview/twitter';
import { canShowURL as isSoundCloud } from './link-preview/soundcloud';
import { canShowURL as isSpotify } from './link-preview/spotify';
import { canShowUrl as isAppleMusic } from './link-preview/apple-music';
import { canShowURL as isTiktok } from './link-preview/tiktok';
import { canShowURL as isWikipedia } from './link-preview/wikipedia';
import { canShowURL as isTelegram } from './link-preview/telegram';
import { canShowURL as isGoogleDocs } from './link-preview/google-docs';

const ImageAttachmentsLightbox = lazyComponent(
  () => import('./post/post-attachment-image-lightbox'),
  {
    fallback: (
      <div className="lightbox-loading">
        <span>Loading lightbox...</span>
      </div>
    ),
    errorMessage: "Couldn't load lightbox component",
  },
);

export const getMediaType = (url) => {
  try {
    if (new URL(url).pathname.match(/\.(jpg|png|jpeg|webp|gif)$/i)) {
      return 'image';
    } else if (isInstagram(url)) {
      return 'instagram';
    } else if (isTwitter(url)) {
      return 'twitter';
    } else if (isSoundCloud(url)) {
      return 'soundcloud';
    } else if (isSpotify(url)) {
      return 'spotify';
    } else if (isAppleMusic(url)) {
      return 'appleMusic';
    } else if (isTiktok(url)) {
      return 'tiktok';
    } else if (isWikipedia(url)) {
      return 'wikipedia';
    } else if (isTelegram(url)) {
      return 'telegram';
    } else if (isGoogleDocs(url)) {
      return 'googleDocs';
    }
    return getVideoType(url);
  } catch {
    // For some URLs in user input. the 'new URL' may throw error. Just return
    // null (unknown type) in this case.
    return null;
  }
};

export const isMediaAttachment = (attachments) => {
  return attachments.reduce((acc, item) => acc || item.mediaType === 'image', false);
};

const getEmbeddableItem = async (url, withoutAutoplay) => {
  let info = null;
  if (isInstagram(url)) {
    info = getInstagramEmbedInfo(url);
  } else {
    info = await getVideoInfo(url, withoutAutoplay);
  }

  if (info) {
    if (info.mediaURL) {
      return {
        src: info.mediaURL,
        w: info.width || 0,
        h: info.height || 0,
        pid: 'media',
      };
    }

    let playerHTML = null;
    let w = 800;
    let h = 450;
    if (info.aspectRatio) {
      if (info.aspectRatio <= 1) {
        h = Math.round(w * info.aspectRatio);
      } else {
        h = 800;
        w = Math.round(h / info.aspectRatio);
      }
    }

    if (info.html) {
      playerHTML = `<div class="media-wrapper">${info.html}</div>`;
    } else {
      let player = null;
      if (info.playerURL) {
        player = (
          <iframe
            className="pswp__video media-content"
            src={info.playerURL}
            frameBorder="0"
            allowFullScreen={true}
            width={w}
            height={h}
            allow="autoplay"
          />
        );
      } else if (info.videoURL) {
        player = (
          <video
            src={info.videoURL}
            poster={info.previewURL}
            autoPlay={!withoutAutoplay}
            controls={true}
            loop={true}
          />
        );
      }

      if (player) {
        playerHTML = renderToString(<div className="media-wrapper">{player}</div>);
      }
    }

    if (playerHTML) {
      let text = info.byline;
      if (text.length > 300) {
        text = `${text.slice(0, 200)}\u2026`;
      }
      return {
        html: playerHTML,
        w,
        h,
        pid: 'video',
        title: renderToString(
          <a href={url} target="_blank">
            {text || url}
          </a>,
        ),
      };
    }
  }
};

function MediaViewer(props) {
  const { mediaViewer, showMedia } = props;
  const { attachments, postId, thumbnail, index } = mediaViewer;
  const [lightboxItems, setLightboxItems] = useState(null);

  const onDestroy = useCallback(() => showMedia({}), [showMedia]);

  const onNavigate = useCallback(
    (where) => {
      const nextPost =
        typeof mediaViewer.navigate === 'function'
          ? mediaViewer.navigate(mediaViewer.postId, where)
          : null;
      if (nextPost) {
        showMedia({
          ...mediaViewer,
          postId: nextPost.id,
          attachments: nextPost.attachments,
          index: null,
          thumbnail: null,
        });
      }
    },
    [mediaViewer, showMedia],
  );

  const getThumbnail = useCallback((index) => (thumbnail ? thumbnail(index) : null), [thumbnail]);

  useEffect(() => {
    if (attachments) {
      Promise.all(
        attachments.map(async (a, i) => {
          if (a.mediaType !== 'image') {
            const embeddableItem = await getEmbeddableItem(a.url, i !== index);
            if (embeddableItem) {
              return embeddableItem;
            }
          }
          return {
            src: a.url,
            w: (a.imageSizes && a.imageSizes.o && a.imageSizes.o.w) || 0,
            h: (a.imageSizes && a.imageSizes.o && a.imageSizes.o.h) || 0,
            pid: a.id.slice(0, 8),
          };
        }),
      )
        .then((items) => {
          setLightboxItems(items);
          return true;
        })
        .catch((error) => {
          setLightboxItems(null);

          // Replace this with user-visible error?
          Sentry.captureException(error, {
            level: 'error',
            tags: { area: 'lightbox' },
          });
        });
    } else {
      setLightboxItems(null);
    }
  }, [attachments, index]);

  if (!lightboxItems) {
    return null;
  }

  return (
    <ImageAttachmentsLightbox
      items={lightboxItems}
      index={mediaViewer.index || 0}
      postId={postId}
      getThumbnail={getThumbnail}
      onDestroy={onDestroy}
      onNavigate={onNavigate}
    />
  );
}

function mapStateToProps(state) {
  return {
    mediaViewer: state.mediaViewer,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showMedia: (params) => dispatch(showMedia(params)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MediaViewer);
