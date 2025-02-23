/* global CONFIG */
import { Fragment } from 'react';

import { ARROWS, EMAIL, FOREIGN_MENTION, HASHTAG, LINK, MENTION } from 'social-text-tokenizer';
import { emailHref, linkHref, prettyEmail, prettyLink } from 'social-text-tokenizer/prettifiers';
import { FRIENDFEED_POST } from '../utils/link-types';
import {
  arrowsLevel,
  trimOrigin,
  isLocalLink,
  LINE_BREAK,
  PARAGRAPH_BREAK,
  shortCodeToService,
  REDDIT_LINK,
  redditLinkHref,
  SHORT_LINK,
  isShortLink,
} from '../utils/parse-text';
import { INITIAL_CHECKBOX, isChecked } from '../utils/initial-checkbox';
import UserName from './user-name';
import { MediaOpener, getMediaType } from './media-opener';
import { InitialCheckbox } from './initial-checkbox';
import { Anchor, Link } from './linkify-links';

const { searchEngine } = CONFIG.search;
const MAX_URL_LENGTH = 50;

/**
 * @param {import('social-text-tokenizer').Token} token
 * @param {string} key
 * @param {any} params
 * @returns {React.JSX.Element}
 */
export function tokenToElement(token, key, params) {
  switch (token.type) {
    case MENTION:
      return (
        <UserName
          key={key}
          user={{ username: token.text.slice(1).toLowerCase() }}
          userHover={params.userHover}
        >
          {token.text}
        </UserName>
      );

    case EMAIL:
      return (
        <Anchor key={key} href={emailHref(token.text)}>
          {prettyEmail(token.text)}
        </Anchor>
      );

    case HASHTAG: {
      if (searchEngine) {
        return (
          <Anchor key={key} href={searchEngine + encodeURIComponent(token.text)}>
            {token.text}
          </Anchor>
        );
      }

      return (
        <Link key={key} to={{ pathname: '/search', query: { q: token.text } }}>
          <bdi>{token.text}</bdi>
        </Link>
      );
    }

    case ARROWS: {
      if (!params.arrowHover && !params.arrowClick) {
        break;
      }
      return (
        <span
          key={key}
          className="arrow-span"
          data-arrows={arrowsLevel(token.text)}
          onMouseEnter={params.arrowHover.hover}
          onMouseLeave={params.arrowHover.leave}
          onClick={params.arrowClick}
        >
          {token.text}
        </span>
      );
    }

    case LINK:
      return renderLink(token, key, params);

    case SHORT_LINK:
      return (
        <Link key={key} to={token.text}>
          {token.text}
        </Link>
      );

    case REDDIT_LINK:
      return (
        <Anchor key={key} href={redditLinkHref(token.text)}>
          {token.text}
        </Anchor>
      );

    case FOREIGN_MENTION: {
      const [username, service] = token.text.split('@', 2);
      const srv = shortCodeToService[service];
      if (!srv) {
        break;
      }

      const url = srv.linkTpl.replace(/{}/g, username);
      return (
        <Anchor key={key} href={url} title={`${srv.title} link`}>
          {token.text}
        </Anchor>
      );
    }

    case LINE_BREAK:
      return (
        // ' ' is here for proper render in READMORE_STYLE_COMPACT mode
        <Fragment key={key}>
          {' '}
          <br />
        </Fragment>
      );

    case PARAGRAPH_BREAK:
      return (
        // ' ' is here for proper render in READMORE_STYLE_COMPACT mode
        <span key={key} className="p-break">
          <br /> <br />
        </span>
      );

    case INITIAL_CHECKBOX:
      return <InitialCheckbox key={key} checked={isChecked(token.text)} />;
  }
  return token.text;
}

function renderLink(token, key, params) {
  let href = linkHref(token.text);

  if (isLocalLink(token.text)) {
    const localPart = trimOrigin(token.text);
    let m, text;
    // Special shortening of post links
    if ((m = /^[^/]+\/[\w-]+\/[\da-f]{8}-/.exec(localPart))) {
      text = `${m[0]}\u2026`;
    } else if (isShortLink(localPart)) {
      text = localPart;
    } else {
      text = prettyLink(token.text, MAX_URL_LENGTH);
    }
    return (
      <Link key={key} to={localPart}>
        {text}
      </Link>
    );
  }

  if (FRIENDFEED_POST.test(href)) {
    return (
      <Link key={key} to={{ pathname: '/archivePost', query: { url: href } }}>
        {prettyLink(token.text, MAX_URL_LENGTH)}
      </Link>
    );
  }

  const mediaType = getMediaType(href);
  if (mediaType) {
    if (
      mediaType === 'instagram' ||
      mediaType === 'twitter' ||
      mediaType === 'soundcloud' ||
      mediaType === 'spotify' ||
      mediaType === 'appleMusic' ||
      mediaType === 'tiktok' ||
      mediaType === 'wikipedia' ||
      mediaType === 'telegram' ||
      mediaType === 'googleDocs'
    ) {
      const url = new URL(token.text);
      url.search = '';
      token.text = url.toString();
      href = url.toString();
    }
    return (
      <MediaOpener
        key={key}
        url={href}
        mediaType={mediaType}
        attachmentsRef={params.attachmentsRef}
      >
        {prettyLink(token.text, MAX_URL_LENGTH)}
      </MediaOpener>
    );
  }

  return (
    <Anchor key={key} href={href}>
      {prettyLink(token.text, MAX_URL_LENGTH)}
    </Anchor>
  );
}
