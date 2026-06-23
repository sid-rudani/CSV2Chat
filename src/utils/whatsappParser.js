export const parseWhatsAppChat = (text) => {
  const lines = text.split('\n');
  const messages = [];
  let currentMsg = null;
  const uniqueUsers = new Set();

  // Matches: "20/08/24, 20:40", "[20/08/24, 20:40:12]", "8/20/24, 8:40 PM" etc.
  const dateStartRegex = /^\[?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})[, ]+(\d{1,2}:\d{2}(?::\d{2})?(?:[ \u202F]?(?:[aA][mM]|[pP][mM]))?)\]?\s*(?:-\s*)?(.*)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(dateStartRegex);

    if (match) {
      // It's a new message or system message
      const date = match[1];
      const time = match[2];
      const rest = match[3];

      // Check if it's a user message (has "Name: ") or system message
      const colonIndex = rest.indexOf(':');
      if (colonIndex !== -1 && colonIndex < 40) { // arbitrary limit to avoid catching colons in long system messages
        const author = rest.substring(0, colonIndex).trim();
        const content = rest.substring(colonIndex + 1).trim();

        if (currentMsg) messages.push(currentMsg);

        uniqueUsers.add(author);
        currentMsg = {
          id: i.toString(),
          date,
          time,
          author,
          content,
          isSystem: false,
        };
      } else {
        // System message
        if (currentMsg) messages.push(currentMsg);
        currentMsg = {
          id: i.toString(),
          date,
          time,
          author: 'System',
          content: rest,
          isSystem: true,
        };
      }
    } else {
      // It's a continuation of the previous message
      if (currentMsg) {
        currentMsg.content += '\n' + line;
      }
    }
  }

  if (currentMsg) messages.push(currentMsg);

  return {
    messages,
    users: Array.from(uniqueUsers),
  };
};
