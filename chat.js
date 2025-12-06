function kcGetApplications() {
  const data = localStorage.getItem('kc_applications');
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
}

function kcChatKey(appId) {
  return 'kc_chat_' + appId;
}
function kcGetChatMessages(appId) {
  const data = localStorage.getItem(kcChatKey(appId));
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
}
function kcSaveChatMessages(appId, msgs) {
  localStorage.setItem(kcChatKey(appId), JSON.stringify(msgs));
}

function kcGetQueryParams() {
  const params = {};
  const q = window.location.search.substring(1);
  if (!q) return params;
  q.split('&').forEach(part => {
    const [k, v] = part.split('=');
    params[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return params;
}

document.addEventListener('DOMContentLoaded', () => {
  const chatTitle = document.getElementById('chatTitle');
  const chatSubtitle = document.getElementById('chatSubtitle');
  const chatMessagesEl = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');

  const params = kcGetQueryParams();
  const appId = parseInt(params.applicationId, 10);
  const role = params.role === 'farmer' ? 'farmer' : 'labour';

  if (!appId) {
    chatTitle.textContent = 'Chat';
    chatSubtitle.textContent = 'Invalid application selected.';
    chatForm.style.display = 'none';
    return;
  }

  const apps = kcGetApplications();
  const app = apps.find(a => a.id === appId);
  if (!app) {
    chatTitle.textContent = 'Chat';
    chatSubtitle.textContent = 'Application not found.';
    chatForm.style.display = 'none';
    return;
  }

  const farmer = app.farmerProfile || {};
  const labour = app.labourProfile || {};

  chatTitle.textContent = role === 'farmer'
 `   ? Chat with ${labour.name || 'Labour'}
    : Chat with ${farmer.name || 'Farmer'}`;

  chatSubtitle.textContent = `${app.vacancySummary.workType} • ${app.vacancySummary.location}`;

  function formatTime(d) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function renderMessages() {
    const msgs = kcGetChatMessages(appId);
    chatMessagesEl.innerHTML = '';

    msgs.forEach(m => {
      const row = document.createElement('div');
      row.className = 'chat-bubble-row ' + (m.sender === role ? 'me' : 'them');

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble ' + (m.sender === role ? 'me' : 'them');
      bubble.textContent = m.text;

      const time = document.createElement('div');
      time.className = 'chat-time';
      time.textContent = m.time || '';

      bubble.appendChild(time);
      row.appendChild(bubble);
      chatMessagesEl.appendChild(row);
    });

    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  renderMessages();

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    const msgs = kcGetChatMessages(appId);
    msgs.push({
      sender: role,
      text,
      time: formatTime(new Date())
    });
    kcSaveChatMessages(appId, msgs);
    chatInput.value = '';
    renderMessages();
  });
});