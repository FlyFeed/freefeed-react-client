import { DISPLAYNAMES_DISPLAYNAME } from '../src/utils/frontend-preferences-options';
import { ACTIVITY, HOMEFEED_MODE_CLASSIC } from '../src/utils/feed-options';
import { TLDs } from './lib/tlds';

const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

export default {
  api: {
    root: 'https://freefeed.net',
  },

  siteTitle: 'FlyFeed',

  siteOrigin: 'https://freefeed.eu.org',

  auth: {
    tokenPrefix: 'freefeed_',
    userStorageKey: 'whoamiCache',
  },

  captcha: {
    siteKey: '6LdChhITAAAAAGzgvUPPCbg0cxJzcxFc5vlBs9u5',
  },

  search: {
    searchEngine: null,
  },

  siteDomains: [
    // for transform links in the posts, comments, etc.
    'freefeed.net',
    'gamma.freefeed.net',
    'freefeed.me',
    'freefeed.eu.org',
  ],

  textFormatter: {
    tldList: TLDs,
    foreignMentionServices: [
      { title: 'Facebook', linkTpl: 'https://www.facebook.com/{}', shortCodes: ['fb', 'facebook'] },
      { title: 'FreeFeed', linkTpl: 'https://freefeed.net/{}', shortCodes: ['freefeed'] },
      { title: 'GitHub', linkTpl: 'https://github.com/{}', shortCodes: ['github'] },
      {
        title: 'Instagram',
        linkTpl: 'https://www.instagram.com/{}/',
        shortCodes: ['ig', 'instagram'],
      },
      {
        title: 'LiveJournal',
        linkTpl: 'https://users.livejournal.com/{}/',
        shortCodes: ['lj', 'livejournal'],
      },
      { title: 'Mokum', linkTpl: 'https://mokum.place/{}', shortCodes: ['mokum'] },
      { title: 'Telegram', linkTpl: 'https://t.me/{}', shortCodes: ['tg', 'telegram'] },
      { title: 'Twitter', linkTpl: 'https://twitter.com/{}', shortCodes: ['twitter'] },
    ],
  },

  sentry: {
    publicDSN: 'https://abdac1f2db2d45efaa9142062fe14bd8@sentry.io/75960',
  },

  frontendPreferences: {
    clientId: 'org.eu.freefeed',
    confettiNowruz: 'confettiNowruz',
    // Use only plain JSON types here. Do not use null values (for type checking).
    defaultValues: {
      displayNames: {
        displayOption: DISPLAYNAMES_DISPLAYNAME,
        useYou: true,
      },
      realtimeActive: true,
      comments: {
        omitRepeatedBubbles: true,
        highlightComments: true,
        showTimestamps: false,
        hideRepliesToBanned: false,
      },
      allowLinksPreview: false,
      allowLinksPreviewUsingOG: true,
      readMoreStyle: 'modern',
      homeFeedSort: ACTIVITY,
      homeFeedMode: HOMEFEED_MODE_CLASSIC,
      homefeed: { hideUsers: [], hideTags: [] },
      hidesInNonHomeFeeds: false,
      pinnedGroups: [],
      hideUnreadNotifications: false,
      timeDisplay: {
        absolute: false,
        amPm: false,
      },
      timeDifferenceForSpacer: DAY_IN_MILLISECONDS * 6,
      translateToLang: '', // Empty string means browser default language
      saveDrafts: true,
    },
    defaultOverrides: {
      /**
       *  Here you can override the default values depending on the 'createdAt'
       *  time of user. The object key is a Lodash 'path' in the defaultValues
       *  object.
       *
       * The 'createdBefore' and 'createdSince' are the only supported opeators
       * for now.
       *
       * The example below means that for all accounts created since
       *  2021-08-01, the 'submitByEnter' has a 'false' default value.
       */
      // submitByEnter: { createdSince: '2021-08-01', value: false },
    },
  },

  appearance: {
    colorSchemeStorageKey: 'color-scheme',
    nsfwVisibilityStorageKey: 'show-nsfw',
    uiScaleStorageKey: 'ui-scale',
    submitModeStorageKey: 'submit-mode',
  },

  commentsFolding: {
    // Show a maximum of two comments after the fold
    afterFold: 2,
    // Show 'collapse' button when there are 12 or more comments
    minToCollapse: 12,
    // A minimum number of omitted comments (server-side constant)
    minFolded: 3,
  },

  // if false, new users are public by default
  newUsersProtected: true,

  registrationsLimit: {
    emailFormIframeSrc: null,
  },

  registrationsByInvite: {
    formIframeSrc:
      'https://docs.google.com/forms/d/e/1FAIpQLSdBzsUIHzR57Ylt2AfUfbIf9Bc03I8Oq2SdQmYqp0s-OsWmnw/viewform',
  },

  analytics: {
    google: '',
    ga4: 'G-7SVCPRV62H',
  },

  betaChannel: {
    // Set to true to enable 'Use the beta version' switcher in settings
    enabled: false,
    // Is the current instance is a beta instance?
    isBeta: false,
    subHeading: 'Beta',
    cookieName: 'beta_channel',
    cookieValue: '1',
  },

  maxLength: {
    post: 3000,
    comment: 3000,
    description: 1500,
  },

  minPasswordLength: 9,

  appVersionCheck: {
    url: '/version.txt',
    header: 'Last-Modified',
    intervalSec: 300,
  },

  donations: {
    // Username of the account which screenname reflects the current donation
    // status. The available statuses are 'Very good', 'Good', 'OK', 'Very low',
    // 'Low', 'Critical'. The donation widget performs case-independent search
    // for these substrings in the screenname.
    statusAccount: null,
    // User name of the account in which reports are published
    reportsAccount: null,
    paymentMethods: {
      // PayPal hosted_button_id parameter
      payPalRegularButtonId: null,
      // PayPal hosted_button_id parameter
      payPalOneTimeButtonId: null,
      // LiberaPay project name
      liberaPayProject: null,
      // yasobe.ru project name
      yasobeRuProject: null,
      // boosty project name
      boostyProject: null,
    },
  },

  privacyControlGroups: {
    hidePosts: true, // Hide posts on these groups pages
    disableSubscriptions: true, // Disable subscriptions on these groups
    groups: {
      // Define groups like this:
      // 'public-groupname': { label: 'Makes post public', privacy: 'public' }
    },
  },

  drafts: {
    storagePrefix: 'draft:',
    maxDraftAge: 7 * DAY_IN_MILLISECONDS,
  },
};
