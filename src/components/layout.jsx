/* global CONFIG */
import { Component, Suspense, createRef } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import classnames from 'classnames';
import { faBug, faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router';

import { signOut, home, setCurrentRoute } from '../redux/action-creators';
import { getCurrentRouteName } from '../utils';
import Footer from './footer';
import Sidebar from './sidebar';
import LoaderContainer from './loader-container';
import ErrorBoundary from './error-boundary';
import { ColorSchemeSetter } from './color-theme-setter';
import { Icon, SVGSymbolDeclarations } from './fontawesome-icons';
import { faMessage, faHouse, faPenToSquare } from './fontawesome-custom-icons';
import MediaViewer from './media-viewer';
import { Throbber } from './throbber';
import { Delayed } from './lazy-component';
import { AppUpdated } from './app-updated';
import { LayoutHeader } from './layout-header';
import { UIScaleSetter } from './ui-scale-setter';
import CreatePost from './create-post';

const loadingPageMessage = (
  <Delayed>
    <div className="content">
      <div className="content">
        <div className="box">
          <div className="box-body">
            <p>
              Loading page... <Throbber />
            </p>
          </div>
        </div>
      </div>
    </div>
  </Delayed>
);

const InternalLayout = ({ authenticated, children }) => (
  <div className={authenticated ? 'col-md-9' : 'col-md-12'} role="main">
    <div className="content">
      <Suspense fallback={loadingPageMessage}>{children}</Suspense>
    </div>
  </div>
);

class Layout extends Component {
  // Here we have some handling of drag-n-drop, because standard dragenter
  // and dragleave events suck. Current implementation is using ideas from
  // Ben Smithett, see http://bensmithett.github.io/dragster/ for details

  constructor(props) {
    super(props);

    this.state = { isDragOver: false };

    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);

    this.dragFirstLevel = false;
    this.dragSecondLevel = false;

    this.prevScrollpos = 0;
    this.mobileNavbarRef = createRef();
    this.state = {
      newPost: false,
      pstDialog: false,
    };
  }

  containsFiles(e) {
    if (e.dataTransfer && e.dataTransfer.types) {
      // Event.dataTransfer.types is DOMStringList (not Array) in Firefox,
      // so we can't just use indexOf().
      for (let i = 0; i < e.dataTransfer.types.length; i++) {
        if (e.dataTransfer.types[i] === 'Files') {
          return true;
        }
      }
    }
    return false;
  }

  handleDragEnter(e) {
    if (this.containsFiles(e)) {
      if (this.dragFirstLevel) {
        this.dragSecondLevel = true;
        return;
      }
      this.dragFirstLevel = true;

      this.setState({ isDragOver: true });

      e.preventDefault();
    }
  }

  handleDragLeave(e) {
    if (this.containsFiles(e)) {
      if (this.dragSecondLevel) {
        this.dragSecondLevel = false;
      } else if (this.dragFirstLevel) {
        this.dragFirstLevel = false;
      }

      if (!this.dragFirstLevel && !this.dragSecondLevel) {
        this.setState({ isDragOver: false });
      }

      e.preventDefault();
    }
  }

  // Prevent browser from loading the file if user drops it outside of a drop zone
  // (both `handleDragOver` and `handleDrop` are necessary)
  handleDragOver(e) {
    if (this.containsFiles(e)) {
      e.preventDefault();
    }
  }
  handleDrop(e) {
    if (this.containsFiles(e)) {
      this.setState({ isDragOver: false });
      this.dragFirstLevel = false;
      this.dragSecondLevel = false;
      e.preventDefault();
    }
  }

  _prevRoute = null;
  updateCurrentRoute() {
    const { router } = this.props;
    const route = router.routes[router.routes.length - 1];
    if (route === this._prevRoute) {
      return;
    }
    this._prevRoute = route;
    this.props.setCurrentRoute({
      name: route.name,
      path: route.path,
      params: router.params,
    });
  }

  componentDidMount() {
    window.addEventListener('dragenter', this.handleDragEnter);
    window.addEventListener('dragleave', this.handleDragLeave);
    window.addEventListener('dragover', this.handleDragOver);
    window.addEventListener('drop', this.handleDrop);
    window.addEventListener('scroll', this.handleScroll);
    document.addEventListener('mousedown', this.handleClick);

    this.updateCurrentRoute();
  }

  componentDidUpdate() {
    this.updateCurrentRoute();
  }

  componentWillUnmount() {
    window.removeEventListener('dragenter', this.handleDragEnter);
    window.removeEventListener('dragleave', this.handleDragLeave);
    window.removeEventListener('dragover', this.handleDragOver);
    window.removeEventListener('drop', this.handleDrop);
    window.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('mousedown', this.handleClick);
  }

  handleScroll = () => {
    if (this.props.authenticated) {
      const currentScrollPos = window.scrollY;
      const mobileNavbar = this.mobileNavbarRef.current;

      if (this.prevScrollpos > currentScrollPos) {
        mobileNavbar.style.transform = 'translateY(0)';
      } else {
        mobileNavbar.style.transform = 'translateY(100%)';
      }
      this.prevScrollpos = currentScrollPos;
    }
  };

  handleHideNewPostDialog = (bool) => {
    this.setState({ newPost: bool });
  };

  handleClick = () => {
    if (this.state.pstDialog) {
      this.setState({ newPost: true });
      this.setState({ pstDialog: false });
    } else {
      this.setState({ newPost: false });
    }
  };

  render() {
    const { props } = this;

    const layoutClassNames = classnames('container', { dragover: this.state.isDragOver });

    const shortFooter = !props.isAuthenticated && props.routeName === 'home';

    return (
      <ErrorBoundary>
        <AppUpdated />
        <div className={layoutClassNames}>
          <Helmet title={props.title} defer={false} />
          <ColorSchemeSetter />
          <UIScaleSetter />
          <SVGSymbolDeclarations />

          <LayoutHeader />

          {props.authenticated && (
            <div className="row">
              <div
                className="mobile-navbar hidden-md hidden-lg"
                role="navigation"
                ref={this.mobileNavbarRef}
              >
                <div
                  className="new-post-button"
                  /* eslint-disable-next-line react/jsx-no-bind */
                  onMouseDown={() => {
                    this.setState({ pstDialog: true });
                  }}
                >
                  <Icon icon={faPenToSquare} />
                </div>
                {this.state.newPost && (
                  <div
                    className={'new-post'}
                    /* eslint-disable-next-line react/jsx-no-bind */
                    onMouseDown={() => this.setState({ pstDialog: true })}
                  >
                    <CreatePost
                      hideNewPostDialog={this.handleHideNewPostDialog}
                      sendTo={props.sendTo}
                      user={props.user}
                      createPost={props.createPost}
                      resetPostCreateForm={props.resetPostCreateForm}
                      addAttachmentResponse={props.addAttachmentResponse}
                      showMedia={props.showMedia}
                    />
                  </div>
                )}
                <div className="mobile-navbar-row">
                  <Link to={`/`}>
                    <Icon icon={faHouse} />
                  </Link>
                </div>
                <div className="mobile-navbar-row">
                  <Link to="/filter/notifications">
                    <Icon icon={faBell} />
                    <sup>
                      {props.user.unreadNotificationsNumber > 0 &&
                        !props.user.frontendPreferences.hideUnreadNotifications &&
                        ` (${props.user.unreadNotificationsNumber})`}
                    </sup>
                  </Link>
                </div>
                <div className="mobile-navbar-row">
                  <Link to="/filter/direct">
                    <Icon icon={faMessage} />
                    <sup>
                      {props.user.unreadDirectsNumber > 0 && ` (${props.user.unreadDirectsNumber})`}
                    </sup>
                  </Link>
                </div>
                <div className="mobile-navbar-row">
                  <Link to={`/${props.user.username}`}>
                    <Icon icon={faUser} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <LoaderContainer loading={props.loadingView} fullPage>
            <div className="row">
              <InternalLayout {...props} />
              {props.authenticated ? <Sidebar {...props} /> : false}
            </div>
          </LoaderContainer>

          <MediaViewer />

          <div className="row">
            <div className="col-md-12">
              <Footer short={shortFooter} />
            </div>
          </div>

          {CONFIG.betaChannel.enabled && CONFIG.betaChannel.isBeta && (
            <a href="/beta" target="_blank" className="bug-report-link" title="Report a bug">
              <Icon icon={faBug} />
            </a>
          )}
        </div>
      </ErrorBoundary>
    );
  }
}

function select(state, ownProps) {
  const sendTo = { ...state.sendTo, defaultFeed: state.user.username };
  return {
    user: state.user,
    authenticated: state.authenticated,
    loadingView: state.routeLoadingState,
    routeName: getCurrentRouteName(ownProps),
    title: state.title,
    sendTo,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    signOut: () => dispatch(signOut()),
    home: () => dispatch(home()),
    setCurrentRoute: (payload) => dispatch(setCurrentRoute(payload)),
  };
}

export default connect(select, mapDispatchToProps)(Layout);
