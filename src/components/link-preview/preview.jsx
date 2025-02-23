import PropTypes from 'prop-types';

import VideoPreview, { canShowURL as videoCanShowURL } from './video';
import TwitterPreview, { canShowURL as twitterCanShowURL } from './twitter';
import InstagramPreview, { canShowURL as instagramCanShowURL } from './instagram';
import GoogleDocsPreview, { canShowURL as googleDocsCanShowURL } from './google-docs';
import YandexMusicPreview, { canShowURL as yandexMusicCanShowURL } from './yandex-music';
import WikipediaPreview, { canShowURL as wikipediaCanShowURL } from './wikipedia';
import TelegramPreview, { canShowURL as telegramCanShowURL } from './telegram';
import TikTokPreview, { canShowURL as tikTokCanShowURL } from './tiktok';
import SoundCloudPreview, { canShowURL as soundCloudCanShowURL } from './soundcloud';
import SpotifyPreview, { canShowURL as spotifyCanShowURL } from './spotify';
import AppleMusicPreview, { canShowUrl as appleMusicCanShowURL } from './apple-music';
import OpenGraphPreview from './open-graph';
import EmbedlyPreview from './embedly';

export default function LinkPreview({ allowOpenGraph, allowEmbedly, url }) {
  if (noPreviewForURL(url)) {
    return false;
  }
  if (videoCanShowURL(url)) {
    return <VideoPreview url={url} />;
  } else if (twitterCanShowURL(url)) {
    return <TwitterPreview url={url} />;
  } else if (instagramCanShowURL(url)) {
    return <InstagramPreview url={url} />;
  } else if (googleDocsCanShowURL(url)) {
    return <GoogleDocsPreview url={url} />;
  } else if (yandexMusicCanShowURL(url)) {
    return <YandexMusicPreview url={url} />;
  } else if (wikipediaCanShowURL(url)) {
    return <WikipediaPreview url={url} />;
  } else if (telegramCanShowURL(url)) {
    return <TelegramPreview url={url} />;
  } else if (tikTokCanShowURL(url)) {
    return <TikTokPreview url={url} />;
  } else if (soundCloudCanShowURL(url)) {
    return <SoundCloudPreview url={url} />;
  } else if (spotifyCanShowURL(url)) {
    return <SpotifyPreview url={url} />;
  } else if (appleMusicCanShowURL(url)) {
    return <AppleMusicPreview url={url} />;
  } else if (allowOpenGraph && OpenGraphPreview({ url })) {
    return <OpenGraphPreview url={url} />;
  }
  if (allowEmbedly) {
    return <EmbedlyPreview url={url} />;
  }
  return false;
}

LinkPreview.propTypes = {
  allowOpenGraph: PropTypes.bool.isRequired,
  allowEmbedly: PropTypes.bool.isRequired,
  url: PropTypes.string.isRequired,
};

function noPreviewForURL(url) {
  return (
    /^https:\/\/([^/]+\.)?freefeed\.net([:/]|$)/i.test(url) ||
    /^https:\/\/([^/]+\.)?reddit\.com([:/]|$)/i.test(url) ||
    /^https:\/\/([^/]+\.)?redd\.it([:/]|$)/i.test(url)
  );
}
