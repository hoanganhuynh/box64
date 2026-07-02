// Second-pass moderation via DeepSeek — only called for content that already
// passed the free word-list filter, to catch subtler abuse (harassment
// without slurs, spam/scam links, off-topic ads) that substring matching
// can't see.
import { createClient } from '@supabase/supabase-js'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

const FALLBACK_SYSTEM_PROMPT = `Bạn là bộ lọc kiểm duyệt bình luận cho một trang thương mại điện tử bán hộp đựng mô hình xe diecast 1:64 tại Việt Nam.
Nhiệm vụ: đánh giá một bình luận của khách hàng trên trang sản phẩm và xác định nó có vi phạm quy định cộng đồng hay không.

Vi phạm bao gồm:
- Quấy rối/công kích cá nhân.
- Spam/quảng cáo không liên quan, link lừa đảo.
- Chê bai cộc lốc, tiêu cực mà không có tính đóng góp (ví dụ: "xấu quá", "tệ vãi", "vứt đi", v.v.).
- Rác không có nghĩa.

KHÔNG vi phạm:
- Phàn nàn HỢP LÝ hoặc chê bai nhưng CÓ GÓP Ý TÍCH CỰC (ví dụ: "Màu sơn hơi xỉn, shop nên cải thiện", "Hộp hơi mỏng so với giá").
- Câu hỏi hoặc ý kiến trung tính.

Chỉ trả về JSON với format chính xác: {"flagged": boolean, "reason": string}
"reason" là mô tả ngắn gọn bằng tiếng Việt (dưới 10 từ) nếu flagged=true, hoặc chuỗi rỗng nếu flagged=false.`

export interface AiModerationResult {
  flagged: boolean
  reason?: string
}

// Fails open: if the API is unreachable/misconfigured, the comment is
// allowed through rather than blocking everyone during an outage. The
// word-list filter (step 1) still applies regardless.
export async function moderateWithAI(content: string): Promise<AiModerationResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return { flagged: false }

  try {
    const db = adminDb()
    const { data: config } = await db.from('ai_moderation_config').select('system_prompt').eq('id', true).maybeSingle()
    const systemPrompt = config?.system_prompt || FALLBACK_SYSTEM_PROMPT

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
        max_tokens: 100,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      console.error('DeepSeek moderation API error:', res.status, await res.text())
      return { flagged: false }
    }

    const json = await res.json()
    const raw = json.choices?.[0]?.message?.content

    const totalTokens = json.usage?.total_tokens || 0
    if (totalTokens > 0) {
      // Read-modify-write for tokens (simple enough for low traffic admin usage)
      const { data: current } = await db.from('ai_moderation_config').select('total_tokens_used').eq('id', true).maybeSingle()
      if (current) {
        await db.from('ai_moderation_config').update({ total_tokens_used: Number(current.total_tokens_used) + totalTokens }).eq('id', true)
      }
    }

    if (!raw) return { flagged: false }

    // Strip markdown code blocks if present
    const cleanRaw = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()

    const parsed = JSON.parse(cleanRaw) as { flagged?: boolean; reason?: string; Flagged?: boolean }
    const isFlagged = parsed.flagged === true || String(parsed.flagged).toLowerCase() === 'true' || parsed.Flagged === true
    return { flagged: isFlagged, reason: parsed.reason }
  } catch (e) {
    console.error('DeepSeek moderation call failed:', e)
    return { flagged: false }
  }
}
