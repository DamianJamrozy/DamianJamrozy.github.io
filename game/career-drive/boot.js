// @ts-check
import('./app.js').catch(() => {
  const message = document.getElementById('loading-state');
  if (message) {
    message.replaceChildren();
    const text = document.createElement('p');
    text.textContent = 'Nie udało się rozpocząć podróży. Odśwież okno lub wybierz wyjście. / The journey could not start. Refresh this window or choose the exit.';
    const link = document.createElement('a');
    link.href = '../../index.html';
    link.textContent = '↖ Wyjście / Exit';
    message.append(text, link);
  }
});
