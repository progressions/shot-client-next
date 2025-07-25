export const preprocessContent = (html) => {
  let processed = html.replace(/<li><p>(.*?)<\/p><\/li>/g, '<li>$1</li>')
  processed = processed.replace(
    /<a href="([^"]+)" class="mention"[^>]*data-mention-id="([^"]+)"[^>]*>(@[^<]+)<\/a>/g,
    (match, href, id, label) => {
      const cleanLabel = label.replace(/^@/, '')
      return `<span data-type="mention" data-id="${id}" data-label="${cleanLabel}" data-href="${href}">@${cleanLabel}</span>`
    }
  )
  return processed
}
