import navigationData from '../data/navigation.json';
import documentsData from '../data/documents.json';
import getCareContent from '../data/getCareContent.json';
import dashboardWidgets from '../data/dashboard-widgets.json';
import supportConfig from '../data/supportConfig.json';

/**
 * searchUtils.js - Portal content search utility
 * Implements global search across navigation items, document titles,
 * and other non-sensitive portal content.
 * User Stories: SCRUM-7169
 *
 * Per FR-002, this utility filters out any member-sensitive data (PHI/PII)
 * and only searches non-sensitive content such as navigation labels,
 * document names/categories, support channels, and care content.
 */

/**
 * Fields that are considered sensitive and must be excluded from search results.
 * These fields contain PHI/PII and should never appear in search snippets.
 */
const SENSITIVE_FIELDS = [
  'memberId',
  'groupNumber',
  'subscriberName',
  'subscriberDob',
  'dateOfBirth',
  'claimNumber',
  'diagnosisCodes',
  'procedureCode',
  'npi',
  'rxBin',
  'rxPcn',
  'rxGroup',
  'rxId',
  'ssn',
  'email',
  'phone',
  'address',
  'password',
  'sessionToken',
  'billedAmount',
  'allowedAmount',
  'planPaid',
  'whatYouOwe',
  'memberResponsibility',
  'patient',
];

/**
 * Result types for categorizing search results.
 */
const RESULT_TYPES = {
  NAVIGATION: 'navigation',
  DOCUMENT: 'document',
  SUPPORT: 'support',
  CARE: 'care',
  WIDGET: 'widget',
};

/**
 * Normalize a search query string for matching.
 *
 * @param {string} query - The raw search query
 * @returns {string} The normalized lowercase trimmed query
 */
const normalizeQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return '';
  }
  return query.toLowerCase().trim();
};

/**
 * Check if a text string matches the search query.
 *
 * @param {string} text - The text to search within
 * @param {string} normalizedQuery - The normalized search query
 * @returns {boolean} True if the text contains the query
 */
const matchesQuery = (text, normalizedQuery) => {
  if (!text || typeof text !== 'string' || !normalizedQuery) {
    return false;
  }
  return text.toLowerCase().includes(normalizedQuery);
};

/**
 * Generate a snippet from text that highlights the matched portion.
 * Returns a substring around the match location for context.
 *
 * @param {string} text - The full text to extract a snippet from
 * @param {string} normalizedQuery - The normalized search query
 * @param {number} [maxLength=120] - Maximum snippet length
 * @returns {string} A snippet of text around the match, or the truncated text
 */
const generateSnippet = (text, normalizedQuery, maxLength = 120) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const cleaned = text.trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  if (!normalizedQuery) {
    return cleaned.substring(0, maxLength).trimEnd() + '...';
  }

  const lowerText = cleaned.toLowerCase();
  const matchIndex = lowerText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return cleaned.substring(0, maxLength).trimEnd() + '...';
  }

  const contextPadding = Math.floor((maxLength - normalizedQuery.length) / 2);
  let start = Math.max(0, matchIndex - contextPadding);
  let end = Math.min(cleaned.length, start + maxLength);

  if (end - start < maxLength && start > 0) {
    start = Math.max(0, end - maxLength);
  }

  let snippet = cleaned.substring(start, end).trim();

  if (start > 0) {
    snippet = '...' + snippet;
  }

  if (end < cleaned.length) {
    snippet = snippet + '...';
  }

  return snippet;
};

/**
 * Search navigation items for matching labels and paths.
 *
 * @param {string} normalizedQuery - The normalized search query
 * @returns {Array<object>} Array of matching navigation results
 */
const searchNavigation = (normalizedQuery) => {
  const results = [];

  if (!normalizedQuery) {
    return results;
  }

  const processNavItem = (item) => {
    if (!item) {
      return;
    }

    const labelMatch = matchesQuery(item.label, normalizedQuery);

    if (labelMatch) {
      results.push({
        title: item.label,
        path: item.path,
        type: RESULT_TYPES.NAVIGATION,
        snippet: `Navigate to ${item.label}`,
      });
    }

    if (Array.isArray(item.children)) {
      item.children.forEach((child) => {
        const childLabelMatch = matchesQuery(child.label, normalizedQuery);

        if (childLabelMatch) {
          results.push({
            title: child.label,
            path: child.path,
            type: RESULT_TYPES.NAVIGATION,
            snippet: `${item.label} > ${child.label}`,
          });
        }
      });
    }
  };

  navigationData.forEach(processNavItem);

  return results;
};

/**
 * Search document titles and categories for matches.
 * Excludes sensitive fields such as memberId, claimNumber, etc.
 *
 * @param {string} normalizedQuery - The normalized search query
 * @returns {Array<object>} Array of matching document results
 */
const searchDocuments = (normalizedQuery) => {
  const results = [];

  if (!normalizedQuery) {
    return results;
  }

  documentsData.forEach((doc) => {
    if (!doc) {
      return;
    }

    const nameMatch = matchesQuery(doc.name, normalizedQuery);
    const categoryMatch = matchesQuery(doc.category, normalizedQuery);
    const descriptionMatch = matchesQuery(doc.description, normalizedQuery);

    if (nameMatch || categoryMatch || descriptionMatch) {
      let snippet = '';

      if (nameMatch) {
        snippet = generateSnippet(doc.name, normalizedQuery);
      } else if (descriptionMatch && doc.description) {
        snippet = generateSnippet(doc.description, normalizedQuery);
      } else {
        snippet = doc.name || '';
      }

      results.push({
        title: doc.name,
        path: `/documents?id=${doc.id}`,
        type: RESULT_TYPES.DOCUMENT,
        snippet,
      });
    }
  });

  return results;
};

/**
 * Search support channels and contact information.
 *
 * @param {string} normalizedQuery - The normalized search query
 * @returns {Array<object>} Array of matching support results
 */
const searchSupport = (normalizedQuery) => {
  const results = [];

  if (!normalizedQuery || !supportConfig || !Array.isArray(supportConfig.supportChannels)) {
    return results;
  }

  supportConfig.supportChannels.forEach((channel) => {
    if (!channel) {
      return;
    }

    const labelMatch = matchesQuery(channel.label, normalizedQuery);
    const descriptionMatch = matchesQuery(channel.description, normalizedQuery);

    if (labelMatch || descriptionMatch) {
      let snippet = '';

      if (descriptionMatch && channel.description) {
        snippet = generateSnippet(channel.description, normalizedQuery);
      } else {
        snippet = channel.description || channel.label;
      }

      results.push({
        title: channel.label,
        path: '/support',
        type: RESULT_TYPES.SUPPORT,
        snippet,
      });
    }
  });

  return results;
};

/**
 * Search Get Care content sections, features, and FAQs.
 *
 * @param {string} normalizedQuery - The normalized search query
 * @returns {Array<object>} Array of matching care content results
 */
const searchCareContent = (normalizedQuery) => {
  const results = [];

  if (!normalizedQuery || !getCareContent || !Array.isArray(getCareContent.sections)) {
    return results;
  }

  getCareContent.sections.forEach((section) => {
    if (!section) {
      return;
    }

    const titleMatch = matchesQuery(section.title, normalizedQuery);
    const descriptionMatch = matchesQuery(section.description, normalizedQuery);

    if (titleMatch || descriptionMatch) {
      let snippet = '';

      if (descriptionMatch && section.description) {
        snippet = generateSnippet(section.description, normalizedQuery);
      } else {
        snippet = section.description || section.title;
      }

      results.push({
        title: section.title,
        path: `/find-care#${section.id}`,
        type: RESULT_TYPES.CARE,
        snippet,
      });
    }

    // Search features within sections
    if (Array.isArray(section.features)) {
      section.features.forEach((feature) => {
        if (!feature) {
          return;
        }

        const featureTitleMatch = matchesQuery(feature.title, normalizedQuery);
        const featureDescMatch = matchesQuery(feature.description, normalizedQuery);

        if (featureTitleMatch || featureDescMatch) {
          let snippet = '';

          if (featureDescMatch && feature.description) {
            snippet = generateSnippet(feature.description, normalizedQuery);
          } else {
            snippet = feature.description || feature.title;
          }

          results.push({
            title: `${section.title} - ${feature.title}`,
            path: `/find-care#${section.id}`,
            type: RESULT_TYPES.CARE,
            snippet,
          });
        }
      });
    }

    // Search FAQs within sections
    if (Array.isArray(section.faqs)) {
      section.faqs.forEach((faq) => {
        if (!faq) {
          return;
        }

        const questionMatch = matchesQuery(faq.question, normalizedQuery);
        const answerMatch = matchesQuery(faq.answer, normalizedQuery);

        if (questionMatch || answerMatch) {
          let snippet = '';

          if (answerMatch && faq.answer) {
            snippet = generateSnippet(faq.answer, normalizedQuery);
          } else {
            snippet = faq.question || '';
          }

          results.push({
            title: faq.question,
            path: `/find-care#${section.id}`,
            type: RESULT_TYPES.CARE,
            snippet,
          });
        }
      });
    }
  });

  return results;
};

/**
 * Search dashboard widget titles and descriptions.
 *
 * @param {string} normalizedQuery - The normalized search query
 * @returns {Array<object>} Array of matching widget results
 */
const searchWidgets = (normalizedQuery) => {
  const results = [];

  if (!normalizedQuery || !Array.isArray(dashboardWidgets)) {
    return results;
  }

  dashboardWidgets.forEach((widget) => {
    if (!widget) {
      return;
    }

    const titleMatch = matchesQuery(widget.title, normalizedQuery);
    const descriptionMatch = matchesQuery(widget.description, normalizedQuery);

    if (titleMatch || descriptionMatch) {
      let snippet = '';

      if (descriptionMatch && widget.description) {
        snippet = generateSnippet(widget.description, normalizedQuery);
      } else {
        snippet = widget.description || widget.title;
      }

      results.push({
        title: widget.title,
        path: '/dashboard',
        type: RESULT_TYPES.WIDGET,
        snippet,
      });
    }
  });

  return results;
};

/**
 * Remove duplicate results based on title and path combination.
 *
 * @param {Array<object>} results - The array of search results
 * @returns {Array<object>} Deduplicated results array
 */
const deduplicateResults = (results) => {
  const seen = new Set();

  return results.filter((result) => {
    const key = `${result.title}::${result.path}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

/**
 * Verify that a search result does not contain sensitive data in its fields.
 * Filters out any result that may have leaked PHI/PII.
 *
 * @param {object} result - The search result to verify
 * @returns {boolean} True if the result is safe to display
 */
const isSafeResult = (result) => {
  if (!result) {
    return false;
  }

  const fieldsToCheck = [result.title, result.snippet];

  for (const field of fieldsToCheck) {
    if (!field || typeof field !== 'string') {
      continue;
    }

    // Check for patterns that look like member IDs (HBM-XXXXXXXXX)
    if (/HBM-\d{9}/i.test(field)) {
      return false;
    }

    // Check for patterns that look like group numbers (GRP-XXXXX)
    if (/GRP-\d{5}/i.test(field)) {
      return false;
    }

    // Check for patterns that look like SSNs (XXX-XX-XXXX)
    if (/\d{3}-\d{2}-\d{4}/.test(field)) {
      return false;
    }

    // Check for patterns that look like claim numbers (HZN-XXXX-XXXXXXXX)
    if (/HZN-\d{4}-\d{8}/i.test(field)) {
      return false;
    }
  }

  return true;
};

/**
 * Search all portal content for matches against the given query.
 * Searches navigation items, document titles, support channels,
 * care content, and widget descriptions. Excludes all member-sensitive
 * data (PHI/PII) per FR-002 compliance requirements.
 *
 * @param {string} query - The search query string
 * @returns {Array<{title: string, path: string, type: string, snippet: string}>} Array of search results
 */
export const searchPortalContent = (query) => {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return [];
  }

  const navigationResults = searchNavigation(normalizedQuery);
  const documentResults = searchDocuments(normalizedQuery);
  const supportResults = searchSupport(normalizedQuery);
  const careResults = searchCareContent(normalizedQuery);
  const widgetResults = searchWidgets(normalizedQuery);

  const allResults = [
    ...navigationResults,
    ...careResults,
    ...widgetResults,
    ...documentResults,
    ...supportResults,
  ];

  const deduplicated = deduplicateResults(allResults);

  // Filter out any results that may contain sensitive data
  const safeResults = deduplicated.filter(isSafeResult);

  return safeResults;
};

/**
 * Get the display label for a result type.
 *
 * @param {string} type - The result type identifier
 * @returns {string} The human-readable label for the result type
 */
export const getResultTypeLabel = (type) => {
  const labels = {
    [RESULT_TYPES.NAVIGATION]: 'Page',
    [RESULT_TYPES.DOCUMENT]: 'Document',
    [RESULT_TYPES.SUPPORT]: 'Support',
    [RESULT_TYPES.CARE]: 'Get Care',
    [RESULT_TYPES.WIDGET]: 'Dashboard',
  };

  return labels[type] || 'Result';
};

/**
 * Exported result type constants for external use.
 */
export const SEARCH_RESULT_TYPES = { ...RESULT_TYPES };