/**
 * Where the "buy me a beer" link points. Empty string hides the link entirely,
 * so nothing ships pointing at a URL that does not exist yet.
 *
 * Set this to your Ko-fi / Buy Me a Coffee page, e.g.
 *   export const SUPPORT_URL = 'https://ko-fi.com/your-handle';
 */
export const SUPPORT_URL = '';

export const SUPPORT_LABEL = '🍺 Buy me a beer';

/**
 * The link is web-only on purpose. Apple does not allow apps to collect
 * donations in-app unless you are an approved nonprofit — fundraising apps must
 * be free and collect funds outside the app. Developer tips are permitted only
 * through in-app purchase, which takes a commission. Keeping the link on the
 * web build avoids both the review risk and the cut.
 *
 * See https://developer.apple.com/app-store/review/guidelines/ (§3.2.1) before
 * changing this.
 */
export const SUPPORT_PLATFORMS = ['web'] as const;
