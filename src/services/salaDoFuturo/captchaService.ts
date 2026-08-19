export class CaptchaService {
  /**
   * Generates a challenge from the verified captcha endpoint
   * POST /captcha/challenge
   */
  public async getChallenge(): Promise<any> {
    try {
      const res = await fetch('/api/captcha/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e: any) {
      console.warn('[CaptchaService] getChallenge fallback:', e.message);
    }
    return null;
  }

  /**
   * Verifies the user solve token
   * POST /captcha/verify
   */
  public async verifyChallenge(challengeId: string, answer: string): Promise<string | null> {
    try {
      const res = await fetch('/api/captcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, answer })
      });
      if (res.ok) {
        const data = await res.json();
        return data?.token || data?.captcha_token || null;
      }
    } catch (e: any) {
      console.warn('[CaptchaService] verifyChallenge fallback:', e.message);
    }
    return null;
  }
}

export const captchaService = new CaptchaService();
