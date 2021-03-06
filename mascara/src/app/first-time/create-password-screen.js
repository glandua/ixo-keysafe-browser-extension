import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { createNewVaultAndKeychain } from '../../../../ui/app/actions'
import Breadcrumbs from './breadcrumbs'
import EventEmitter from 'events'
import Mascot from '../../../../ui/app/components/mascot'
import classnames from 'classnames'
import {
  INITIALIZE_UNIQUE_IMAGE_ROUTE,
  INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE,
  INITIALIZE_NOTICE_ROUTE,
} from '../../../../ui/app/routes'
import TextField from '../../../../ui/app/components/text-field'

class CreatePasswordScreen extends Component {
  static contextTypes = {
    t: PropTypes.func,
  }

  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    createAccount: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    isInitialized: PropTypes.bool,
    isUnlocked: PropTypes.bool,
    isMascara: PropTypes.bool.isRequired,
  }

  state = {
    username: '',
    password: '',
    confirmPassword: '',
    passwordError: null,
    confirmPasswordError: null,
  }

  constructor (props) {
    super(props)
    this.animationEventEmitter = new EventEmitter()
  }

  componentWillMount () {
    const { isInitialized, history } = this.props

    if (isInitialized) {
      history.push(INITIALIZE_NOTICE_ROUTE)
    }
  }

  isValid () {
    const { password, confirmPassword } = this.state

    if (!password || !confirmPassword) {
      return false
    }

    if (password.length < 8) {
      return false
    }

    return password === confirmPassword
  }

  createAccount = () => {
    if (!this.isValid()) {
      return
    }

    const { username, password } = this.state
    const { createAccount, history } = this.props

    this.setState({ isLoading: true })
    createAccount(username, password)
      .then(() => history.push(INITIALIZE_UNIQUE_IMAGE_ROUTE))
  }

  handleUsernameChange (username) {
    this.setState({ username })
  }

  handlePasswordChange (password) {
    const { confirmPassword } = this.state
    let confirmPasswordError = null
    let passwordError = null

    if (password && password.length < 8) {
      passwordError = this.context.t('passwordNotLongEnough')
    }

    if (confirmPassword && password !== confirmPassword) {
      confirmPasswordError = this.context.t('passwordsDontMatch')
    }

    this.setState({ password, passwordError, confirmPasswordError })
  }

  handleConfirmPasswordChange (confirmPassword) {
    const { password } = this.state
    let confirmPasswordError = null

    if (password !== confirmPassword) {
      confirmPasswordError = this.context.t('passwordsDontMatch')
    }

    this.setState({ confirmPassword, confirmPasswordError })
  }

  render () {
    const { history, isMascara } = this.props
    const { usernameError, passwordError, confirmPasswordError } = this.state
    const { t } = this.context

    return (
      <div className={classnames({ 'first-view-main-wrapper': !isMascara })}>
        <div className={classnames({
          'first-view-main': !isMascara,
          'first-view-main__mascara': isMascara,
        })}>
          {isMascara && <div className="mascara-info first-view-phone-invisible">
            <Mascot
              animationEventEmitter={this.animationEventEmitter}
              width="225"
              height="225"
            />
            <div className="info">
              The Key safe is a secure identity vault for ixo.
            </div>
            <div className="info">
              It allows you to hold ether & tokens, and interact with decentralized applications.
            </div>
          </div>}
          <div className="create-password">
            <div className="first-time__title create-password__title">
              Let's set up your account
            </div>
            <TextField
              id="create-username"
              label={t('createUsername')}
              type="text"
              className="first-time-flow__input"
              value={this.state.username}
              onChange={event => this.handleUsernameChange(event.target.value)}
              error={usernameError}
              autoFocus
              margin="normal"
              fullWidth
            />
            <TextField
              id="create-password"
              label={t('newPassword')}
              type="password"
              className="first-time-flow__input"
              value={this.state.password}
              onChange={event => this.handlePasswordChange(event.target.value)}
              error={passwordError}
              autoComplete="new-password"
              margin="normal"
              fullWidth
            />
            <TextField
              id="confirm-password"
              label={t('confirmPassword')}
              type="password"
              className="first-time-flow__input"
              value={this.state.confirmPassword}
              onChange={event => this.handleConfirmPasswordChange(event.target.value)}
              error={confirmPasswordError}
              autoComplete="confirm-password"
              margin="normal"
              fullWidth
            />
            <button
              className="first-time-flow__button"
              disabled={!this.isValid()}
              onClick={this.createAccount}
            >
              Create
            </button>

          </div>

          <a
            className="first-time-flow__link create-password__import-link"
            onClick={e => {
              e.preventDefault()
              history.push(INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE)
            }}
          >
            <div className="first-time-flow__link-text">Import your existing key</div>
          </a>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ metamask, appState }) => {
  const { isInitialized, isUnlocked, isMascara, noActiveNotices } = metamask
  const { isLoading } = appState

  return {
    isLoading,
    isInitialized,
    isUnlocked,
    isMascara,
    noActiveNotices,
  }
}

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    dispatch => ({
      createAccount: (username, password) => dispatch(createNewVaultAndKeychain(username, password)),
    })
  )
)(CreatePasswordScreen)
