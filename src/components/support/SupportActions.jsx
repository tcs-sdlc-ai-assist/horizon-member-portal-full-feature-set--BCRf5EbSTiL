import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useGlassbox from '../../hooks/useGlassbox.js';
import useAuditLog from '../../hooks/useAuditLog.js';
import Button from '../common/Button.jsx';
import LeavingSiteModal from '../common/LeavingSiteModal.jsx';
import supportConfig from '../../data/supportConfig.json';
import { ROUTES } from '../../utils/constants.js';

/**
 * SupportActions - Header support action buttons component
 * Implements the support entry points from the Member Experience & Self-Service LLD.
 * User Stories: SCRUM-7169
 *
 * Renders Email, Chat, and Call action buttons/links in the header area.
 * Loads configuration from supportConfig.json. Email opens mailto link,
 * Chat opens external URL (with LeavingSiteModal if external), Call shows
 * phone number. Uses HB button styling. Logs support interactions via
 * useAuditLog and useGlassbox hooks for compliance and analytics.
 *
 * @param {object} props
 * @param {'horizontal'|'vertical'} [props.layout='horizontal'] - Button layout direction
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Button size
 * @param {boolean} [props.showLabels=true] - Whether to show text labels on buttons
 * @param {boolean} [props.showIcons=true] - Whether to show icons on buttons
 * @param {string} [props.className=''] - Additional CSS classes for the wrapper
 * @returns {JSX.Element}
 */
const SupportActions = ({
  layout = 'horizontal',
  size = 'md',
  showLabels = true,
  showIcons = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const { tagSupport, tagAction, isEnabled: isGlassboxEnabled } = useGlassbox();
  const { logAction } = useAuditLog();

  const [isLeavingSiteOpen, setIsLeavingSiteOpen] = useState(false);
  const [leavingSiteUrl, setLeavingSiteUrl] = useState('');
  const [leavingSiteLinkLabel, setLeavingSiteLinkLabel] = useState('');

  /**
   * Get the primary support channels from supportConfig.json.
   * Filters to only available channels matching email, chat, and phone.
   */
  const supportChannels = (supportConfig.supportChannels || []).filter(
    (ch) => ch.available && ['phone', 'chat', 'email'].includes(ch.id)
  );

  /**
   * Get a specific support channel by ID.
   *
   * @param {string} channelId - The channel ID to look up
   * @returns {object|null} The channel object, or null if not found
   */
  const getChannel = useCallback((channelId) => {
    return supportChannels.find((ch) => ch.id === channelId) || null;
  }, [supportChannels]);

  /**
   * Handle email support action.
   * Opens the default email client with the support email address.
   */
  const handleEmailClick = useCallback(() => {
    const emailChannel = getChannel('email');

    if (!emailChannel) {
      return;
    }

    // Log audit event
    logAction('support_contacted', {
      route: window.location.pathname,
      action: 'email_click',
      channel: 'email',
      contact: emailChannel.contact,
    });

    // Tag Glassbox event if enabled
    if (isGlassboxEnabled) {
      tagSupport('email', {
        route: window.location.pathname,
        action: 'email_click',
      });
    }

    window.location.href = `mailto:${emailChannel.contact}`;
  }, [getChannel, logAction, isGlassboxEnabled, tagSupport]);

  /**
   * Handle chat support action.
   * Opens the chat URL. If external, shows the LeavingSiteModal first.
   */
  const handleChatClick = useCallback(() => {
    const chatChannel = getChannel('chat');

    if (!chatChannel) {
      return;
    }

    const chatUrl = chatChannel.contact;

    // Log audit event
    logAction('support_contacted', {
      route: window.location.pathname,
      action: 'chat_click',
      channel: 'chat',
      contact: chatUrl,
    });

    // Tag Glassbox event if enabled
    if (isGlassboxEnabled) {
      tagSupport('chat', {
        route: window.location.pathname,
        action: 'chat_click',
      });
    }

    // Check if the URL is external
    if (chatChannel.type === 'url' && chatUrl && chatUrl.startsWith('http')) {
      setLeavingSiteUrl(chatUrl);
      setLeavingSiteLinkLabel(chatChannel.label || 'Live Chat');
      setIsLeavingSiteOpen(true);
    } else {
      window.open(chatUrl, '_blank', 'noopener,noreferrer');
    }
  }, [getChannel, logAction, isGlassboxEnabled, tagSupport]);

  /**
   * Handle phone support action.
   * Opens the phone dialer with the support phone number.
   */
  const handlePhoneClick = useCallback(() => {
    const phoneChannel = getChannel('phone');

    if (!phoneChannel) {
      return;
    }

    // Log audit event
    logAction('support_contacted', {
      route: window.location.pathname,
      action: 'phone_click',
      channel: 'phone',
      contact: phoneChannel.contact,
    });

    // Tag Glassbox event if enabled
    if (isGlassboxEnabled) {
      tagSupport('phone', {
        route: window.location.pathname,
        action: 'phone_click',
      });
    }

    window.location.href = `tel:${phoneChannel.contact.replace(/\D/g, '')}`;
  }, [getChannel, logAction, isGlassboxEnabled, tagSupport]);

  /**
   * Handle closing the LeavingSiteModal.
   */
  const handleLeavingSiteClose = useCallback(() => {
    setIsLeavingSiteOpen(false);
    setLeavingSiteUrl('');
    setLeavingSiteLinkLabel('');
  }, []);

  /**
   * Get the icon SVG for a support channel.
   *
   * @param {string} channelId - The channel identifier
   * @returns {JSX.Element} The icon SVG element
   */
  const getChannelIcon = useCallback((channelId) => {
    const icons = {
      email: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      chat: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      phone: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    };

    return icons[channelId] || icons.phone;
  }, []);

  /**
   * Get the click handler for a support channel.
   *
   * @param {string} channelId - The channel identifier
   * @returns {function} The click handler function
   */
  const getChannelHandler = useCallback((channelId) => {
    const handlers = {
      email: handleEmailClick,
      chat: handleChatClick,
      phone: handlePhoneClick,
    };

    return handlers[channelId] || (() => {});
  }, [handleEmailClick, handleChatClick, handlePhoneClick]);

  /**
   * Get the button variant for a support channel.
   *
   * @param {string} channelId - The channel identifier
   * @returns {string} The button variant
   */
  const getChannelVariant = useCallback((channelId) => {
    const variants = {
      email: 'ghost',
      chat: 'ghost',
      phone: 'ghost',
    };

    return variants[channelId] || 'ghost';
  }, []);

  /**
   * Get the accessible label for a support channel button.
   *
   * @param {object} channel - The channel object
   * @returns {string} The accessible label
   */
  const getChannelAriaLabel = useCallback((channel) => {
    if (!channel) {
      return 'Contact support';
    }

    if (channel.id === 'email') {
      return `Email support at ${channel.contact}`;
    }

    if (channel.id === 'chat') {
      return 'Open live chat support';
    }

    if (channel.id === 'phone') {
      return `Call support at ${channel.contact}`;
    }

    return `Contact support via ${channel.label}`;
  }, []);

  const layoutClass = layout === 'vertical'
    ? 'flex flex-col gap-2'
    : 'flex flex-wrap items-center gap-1';

  // Don't render if no support channels are available
  if (supportChannels.length === 0) {
    return null;
  }

  return (
    <div className={`${layoutClass} ${className}`}>
      {supportChannels.map((channel) => {
        const handler = getChannelHandler(channel.id);
        const variant = getChannelVariant(channel.id);
        const ariaLabel = getChannelAriaLabel(channel);
        const icon = getChannelIcon(channel.id);

        return (
          <Button
            key={channel.id}
            variant={variant}
            size={size}
            onClick={handler}
            ariaLabel={ariaLabel}
            leftIcon={showIcons ? icon : undefined}
            iconOnly={!showLabels}
          >
            {showLabels ? channel.label : icon}
          </Button>
        );
      })}

      {/* Leaving Site Modal for external chat links */}
      <LeavingSiteModal
        isOpen={isLeavingSiteOpen}
        onClose={handleLeavingSiteClose}
        url={leavingSiteUrl}
        linkLabel={leavingSiteLinkLabel}
      />
    </div>
  );
};

export default SupportActions;