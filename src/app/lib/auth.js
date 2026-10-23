export function getAuthHeaders() {
  if (typeof window === 'undefined') {
    return {};
  }

  const token = localStorage.getItem('accessToken');
  const tokenType = localStorage.getItem('tokenType') || 'Bearer';

  return token ? { Authorization: `${tokenType} ${token}` } : {};
}

export function getAuthenticatedUserId() {
  if (typeof window === 'undefined') {
    return null;
  }

  const toUserId = (value) => {
    if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+$/.test(value))) {
      return null;
    }

    const userId = Number(value);
    return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
  };

  try {
    const token = localStorage.getItem('accessToken');
    const [, payload] = token?.split('.') || [];
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decodedPayload = JSON.parse(
      decodeURIComponent(
        Array.from(atob(normalizedPayload))
          .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join(''),
      ),
    );

    return toUserId(
      decodedPayload.userId ??
      decodedPayload.user_id ??
      decodedPayload.id ??
      decodedPayload.uid ??
      decodedPayload.user?.id ??
      decodedPayload.sub,
    );
  } catch {
    return null;
  }
}

export function saveAuthSession({ accessToken, tokenType = 'Bearer', user }) {
  if (!accessToken || typeof window === 'undefined') {
    throw new Error('The login response did not include an access token.');
  }

  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('tokenType', tokenType);
  localStorage.setItem('userInfo', JSON.stringify(user || {}));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('accessToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('userInfo');
}

export function hasValidAuthSession() {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    return false;
  }

  try {
    const [, payload] = token.split('.');
    if (!payload) return false;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decodedPayload = JSON.parse(
      decodeURIComponent(
        Array.from(atob(normalizedPayload))
          .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join(''),
      ),
    );

    return typeof decodedPayload.exp !== 'number' || decodedPayload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
