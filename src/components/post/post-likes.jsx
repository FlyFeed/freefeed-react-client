import { faHeart } from '@fortawesome/free-solid-svg-icons';

import { preventDefault, pluralForm } from '../../utils';
import UserName from '../user-name';
import ErrorBoundary from '../error-boundary';
import { Icon } from '../fontawesome-icons';
import { ButtonLink } from '../button-link';

const renderLike = (item, i, items) => (
  <li key={item.id} className="post-like">
    {item.id !== 'more-likes' ? (
      <UserName user={item} />
    ) : (
      <ButtonLink className="more-post-likes-link" onClick={preventDefault(item.showMoreLikes)}>
        {item.omittedLikes} other people
      </ButtonLink>
    )}

    {i < items.length - 2 ? ', ' : i === items.length - 2 ? ' and ' : ' liked this '}
  </li>
);

export default ({ likes, showMoreLikes, post }) => {
  if (likes.length === 0) {
    return <div />;
  }

  // Make a copy to prevent props modification
  const likeList = [...likes];

  if (post.omittedLikes) {
    likeList.push({
      id: 'more-likes',
      omittedLikes: post.omittedLikes,
      showMoreLikes: () => showMoreLikes(post.id),
    });
  }

  const renderedLikes = likeList.map(renderLike);

  return (
    <div className="post-likes" aria-label={pluralForm(likes.length, 'like')}>
      <ErrorBoundary>
        <Icon icon={faHeart} className="icon" />
        <ul className="post-likes-list">{renderedLikes}</ul>
      </ErrorBoundary>
    </div>
  );
};
