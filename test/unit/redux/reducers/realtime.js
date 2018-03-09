import { describe, it } from 'mocha';
import expect from 'unexpected';

import { postsViewState, users, posts } from '../../../../src/redux/reducers';
import { REALTIME_COMMENT_NEW, REALTIME_COMMENT_DESTROY, REALTIME_LIKE_NEW, REALTIME_POST_NEW } from '../../../../src/redux/action-types';


describe('realtime events', () => {
  describe('users()', () => {
    const testUser = { id: 1, name: 'Ururu' };
    const usersBefore = { [testUser.id]: testUser };
    const anotherTestUser = { id: 2, name: 'Arara' };

    it(`shouldn't replace user on REALTIME_POST_NEW if pre-existed`, () => {
      const result = users(usersBefore, {
        type: REALTIME_POST_NEW,
        users: [{ id: 1 }],
      });

      expect(result[testUser.id], 'to equal', testUser);
    });

    it(`shouldn't replace user on REALTIME_COMMENT_NEW if pre-existed`, () => {
      const result = users(usersBefore, {
        type: REALTIME_COMMENT_NEW,
        users: [{ id: 1 }],
      });

      expect(result[testUser.id], 'to equal', testUser);
    });

    it(`shouldn't replace user on REALTIME_LIKE_NEW if pre-existed`, () => {
      const result = users(usersBefore, {
        type: REALTIME_LIKE_NEW,
        users: [{ id: 1 }],
      });

      expect(result[testUser.id], 'to equal', testUser);
    });


    it('should add new user on REALTIME_POST_NEW if not present', () => {
      const result = users(usersBefore, {
        type: REALTIME_POST_NEW,
        users: [anotherTestUser],
      });

      // user data is processed with some parsing, so link wouldn't be the same
      expect(result[anotherTestUser.id].name, 'to equal', anotherTestUser.name);
    });

    it('should add new user on REALTIME_COMMENT_NEW if not present', () => {
      const result = users(usersBefore, {
        type: REALTIME_COMMENT_NEW,
        users: [anotherTestUser],
      });

      expect(result[anotherTestUser.id].name, 'to equal', anotherTestUser.name);
    });

    it('should add new user on REALTIME_LIKE_NEW if not present', () => {
      const result = users(usersBefore, {
        type: REALTIME_LIKE_NEW,
        users: [anotherTestUser],
      });

      expect(result[anotherTestUser.id].name, 'to equal', anotherTestUser.name);
    });
  });

  describe('posts()', () => {
    const testLikeUser = { id: '4' };
    const testLikePost = { id: '1', likes: ['1', '2'] };
    const testLikePosts = { [testLikePost.id]: testLikePost };

    it('should put new "like" to the second position if current user liked the post', () => {
      const newLikeAfterMe = {
        type: REALTIME_LIKE_NEW,
        postId: testLikePost.id,
        iLiked: true,
        users: [testLikeUser]
      };

      const result = posts(testLikePosts, newLikeAfterMe);
      const newPostLikes = result[testLikePost.id].likes;

      expect(newPostLikes, 'to equal', ['1', '4', '2']);
    });

    it(`should put "like" to the first position if current user didn't like the post`, () => {
      const newLikeWithoutMe = {
        type: REALTIME_LIKE_NEW,
        postId: testLikePost.id,
        iLiked: false,
        users: [testLikeUser]
      };

      const result = posts(testLikePosts, newLikeWithoutMe);
      const newPostLikes = result[testLikePost.id].likes;

      expect(newPostLikes, 'to equal', ['4', '1', '2']);
    });

    it('should add post on REALTIME_COMMENT_NEW', () => {
      const newPost = { id: '1' };
      const newTestComment = { postId: newPost.id, id: '2' };
      const newCommentWithPost = {
        type: REALTIME_COMMENT_NEW,
        comment: newTestComment,
        post: { posts: newPost }
      };

      const postsBefore = {};
      const result = posts(postsBefore, newCommentWithPost);

      expect(result, 'to have key', newPost.id);
    });

    it('should add post on REALTIME_LIKE_NEW', () => {
      const newPost = { id: '1' };
      const newLikeWithPost = {
        type: REALTIME_LIKE_NEW,
        users: [{ id:'1' }],
        postId: newPost.id,
        post: { posts: newPost }
      };

      const postsBefore = {};
      const result = posts(postsBefore, newLikeWithPost);

      expect(result, 'to have key', newPost.id);
    });
  });

  describe('postsViewState()', () => {
    const testPost = { id: 1, omittedComments: 1 };
    const postsViewStateBefore = { [testPost.id]: testPost };

    const newRealtimeCommentAction = {
      type: REALTIME_COMMENT_NEW,
      comment: { postId: testPost.id, id: 2 },
    };

    const removeRealtimeCommentAction = {
      type: REALTIME_COMMENT_DESTROY,
      postId: testPost.id,
      commentId: 2,
    };

    it('should raise number of omitted comments on realtime comment', () => {
      const result = postsViewState(postsViewStateBefore, newRealtimeCommentAction);

      expect(result[testPost.id].omittedComments, 'to equal', testPost.omittedComments + 1);
    });

    it('should decreate number of omitted comments on realtime comment deletion', () => {
      const result = postsViewState(postsViewStateBefore, removeRealtimeCommentAction);

      expect(result[testPost.id].omittedComments, 'to equal', testPost.omittedComments - 1);
    });

    it('should add post to postsViewState when realtime comment arrives', () => {
      const newPost = { id: '1' };
      const newTestComment = { postId: newPost.id, id: '2' };
      const newCommentWithPost = {
        type: REALTIME_COMMENT_NEW,
        comment: newTestComment,
        post: { posts: newPost }
      };

      const postsViewStateBefore = {};
      const result = postsViewState(postsViewStateBefore, newCommentWithPost);

      expect(result, 'to have key', newPost.id);
    });

    it('should add post to postsViewState when realtime like arrives', () => {
      const newPost = { id: '1' };

      const newLikeWithPost = {
        type: REALTIME_LIKE_NEW,
        users: [{ id:'1' }],
        postId: newPost.id,
        post: { posts: newPost }
      };

      const postsViewStateBefore = {};
      const result = postsViewState(postsViewStateBefore, newLikeWithPost);

      expect(result, 'to have key', newPost.id);
    });
  });
});