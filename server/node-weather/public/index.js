main().catch(console.error);

const DIRECT_LINE = 'https://directline.botframework.com/v3/directline';

async function main() {
  const resp = await fetch('/api/tokens/generate', { method: 'POST' });
  const { token, expires_in } = await resp.json();
  const { username, userID } = getUser();
  const directLine = window.WebChat.createDirectLine({token, webSocket: true });
  const host = document.getElementById('webchat');
  const from = { id: userID, name: username };
  window.WebChat.renderWebChat({ directLine, userID, username }, host);

  console.log(directLine);

  directLine.activity$
    .filter((activity) => activity.from.id !== userID && activity.type === 'event')
    .subscribe(async (activity) => {
      switch (activity.valueType) {
        case 'location':
          const { coords: { latitude, longitude }} = await getLocation();
          console.log('sending', [latitude, longitude ]);
          directLine.postActivity({ type: 'event', from, valueType: 'location', value: [latitude, longitude ]})
            .subscribe();
          break;
        case 'location.saved':
          const { text } = activity.value;
          directLine.postActivity({ type: 'message', from, text })
            .subscribe();
          break;
        case 'location.notFound':
          alert('Could not find any matching location from your device');
          break;
      }
    });

  const refreshRate = (expires_in - 60) * 1000;
  setInterval(async () => {
    const authorization = `Bearer ${token}`;
    const resp = await fetch(`${DIRECT_LINE}/tokens/refresh`, {
        method: 'POST',
        headers: { authorization }
    });
    const conversation = await resp.json();
    directLine.reconnect(conversation);
  }, refreshRate);
}

function getLocation() {
  return new Promise((resolve, reject) => {
    window.navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

function getUser() {
  let storage = window.localStorage;
  let username = storage.getItem('username');
  let userID = storage.getItem('userID');
  if (!userID) {
    username = prompt('Hi, what is your name?');
    userID = Math.random().toString();
    storage.setItem('username', username);
    storage.setItem('userID', userID);
  }
  return { username, userID };
}
