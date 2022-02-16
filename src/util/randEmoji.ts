
const schoolEmojis = ["✏️", "🔢", "📖", "📕", "📗", "📘", "📙", "📓", "📔", "📒", "📚"];
export function randScholarlyEmoji(){
    return schoolEmojis[Math.floor(Math.random() * schoolEmojis.length)];
}
