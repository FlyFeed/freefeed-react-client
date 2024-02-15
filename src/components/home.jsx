import { useCallback } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router';

import { createPost, resetPostCreateForm, home } from '../redux/action-creators';
import { postActions } from './select-utils';
import CreatePost from './create-post';
import Feed from './feed';
import PaginatedView from './paginated-view';
import FeedOptionsSwitch from './feed-options-switch';
import { SubscriptionRequestsAlert } from './susbscription-requests-alert';
import ErrorBoundary from './error-boundary';
import { useBool } from './hooks/bool';
import { lazyComponent } from './lazy-component';
import { InvisibleSelect } from './invisible-select';
import { homeFeedURI } from './home-feed-link';
import { useMediaQuery } from './hooks/media-query';

const ListEditor = lazyComponent(
  () => import('./friends-page/list-editor').then((m) => ({ default: m.ListEditor })),
  { fallback: <p>Loading list editor...</p>, errorMessage: "Couldn't load list editor" },
);

const Welcome = lazyComponent(() => import('./welcome'), {
  fallback: <p>Loading page...</p>,
  errorMessage: "Couldn't load page",
});

const FeedHandler = (props) => {
  const dispatch = useDispatch();
  const feedId = useSelector((state) => state.feedViewState.timeline?.id);
  const [isEditing, , showEditor, hideEditor] = useBool(false);
  const closeEditor = useCallback(
    (listId) => (hideEditor(), listId && dispatch(home())),
    [hideEditor, dispatch],
  );

  if (!props.authenticated) {
    return (
      <div className="box">
        <ErrorBoundary>
          <Welcome />
        </ErrorBoundary>
      </div>
    );
  }

  const createPostComponent = (
    <CreatePost
      key={'home'}
      sendTo={props.sendTo}
      user={props.user}
      createPost={props.createPost}
      resetPostCreateForm={props.resetPostCreateForm}
      addAttachmentResponse={props.addAttachmentResponse}
    />
  );

  return (
    <div className="box">
      <ErrorBoundary>
        <div className="box-header-timeline" role="heading" aria-labelledby="feed-name">
          <TopHomeSelector id={feedId} feedLabelId="feed-name" />{' '}
          <div className="pull-right">
            <FeedOptionsSwitch editHomeList={feedId ? showEditor : null} />
          </div>
        </div>
        {isEditing && <ListEditor listId={feedId} close={closeEditor} />}

        <SubscriptionRequestsAlert className="box-message" />

        <PaginatedView firstPageHead={createPostComponent} {...props}>
          <Feed {...props} isInHomeFeed={!props.feedIsLoading} />
        </PaginatedView>

        <div className="box-footer" />
      </ErrorBoundary>
    </div>
  );
};

function selectState(state) {
  const { authenticated, boxHeader, timelines, user } = state;

  const sendTo = { ...state.sendTo, defaultFeed: user.username };
  const feedIsLoading = state.routeLoadingState;

  return {
    user,
    authenticated,
    timelines,
    boxHeader,
    sendTo,
    feedIsLoading,
  };
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (feeds, postText, attachmentIds, more) =>
      dispatch(createPost(feeds, postText, attachmentIds, more)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
  };
}

export default connect(selectState, selectActions)(FeedHandler);

export const TopHomeSelector = withRouter(function TopHomeSelector({ router, id, feedLabelId }) {
  const homeFeeds = useSelector((state) => state.homeFeeds);
  const narrowScreen = useMediaQuery('(max-width: 991px)');

  const onChange = useCallback(
    (e) => router.push(homeFeedURI(homeFeeds.find((h) => h.id === e.target.value))),
    [homeFeeds, router],
  );

  if (homeFeeds.length === 1) {
    return <span id={feedLabelId}>{homeFeeds[0].title}</span>;
  }

  if (!narrowScreen) {
    return <span id={feedLabelId}>{homeFeeds.find((h) => h.id === id)?.title || 'Home'}</span>;
  }

  return (
    <InvisibleSelect value={id} onChange={onChange} withCaret labelValueId={feedLabelId}>
      {homeFeeds.map((h) => (
        <option key={h.id} value={h.id}>
          {h.title}
        </option>
      ))}
    </InvisibleSelect>
  );
});
