async function deleteTwitterRepliesAndPosts() {
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  console.log("Starte Twitter/X Lösch-Skript (Optimiert für Antworten)...");

  let scrollAttempts = 0;

  while (true) {
    const tweets = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
    
    if (tweets.length === 0) {
      console.log("Keine Tweets sichtbar. Scrolle nach unten...");
      window.scrollBy(0, window.innerHeight);
      await sleep(2500);
      
      scrollAttempts++;
      if (scrollAttempts > 8) {
        console.log("Keine weiteren Tweets mehr gefunden. Skript beendet.");
        break;
      }
      continue;
    }

    scrollAttempts = 0;
    let processed = false;

    // Gehe die sichtbaren Tweets der Reihe nach durch
    for (const tweet of tweets) {
      // Prüfen, ob das Element noch im DOM existiert
      if (!document.body.contains(tweet)) continue;

      const moreBtn = tweet.querySelector('[data-testid="caret"], [aria-label="More"], [aria-label="Mehr"]');
      if (!moreBtn) {
        // Kein Menü-Button gefunden, entferne diesen Container, um Blockaden zu vermeiden
        tweet.remove();
        continue;
      }

      moreBtn.click();
      await sleep(500);

      const menuItems = Array.from(document.querySelectorAll('[role="menuitem"]'));
      const deleteBtn = menuItems.find(item => {
        const text = item.textContent.toLowerCase();
        return text.includes('delete') || text.includes('löschen');
      });

      // Wenn kein "Löschen"-Button da ist (z.B. fremder Parent-Tweet im Thread)
      if (!deleteBtn) {
        document.body.click(); // Menü schließen
        await sleep(300);
        tweet.remove(); // Komplett aus dem DOM löschen, damit es nicht stört
        continue; // Weiter zum nächsten Tweet
      }

      // Löschen-Button gefunden!
      deleteBtn.click();
      await sleep(500);

      const confirmBtn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
      if (confirmBtn) {
        confirmBtn.click();
        console.log("Antwort/Post erfolgreich gelöscht.");
      } else {
        document.body.click();
      }

      processed = true;
      await sleep(1500); // Kurz warten, damit X die Timeline anpasst
      break; // Nach einer erfolgreichen Löschung Schleife kurz neu ansetzen
    }

    // Wenn im aktuellen Durchlauf kein eigener Tweet verarbeitet werden konnte, weiter scrollen
    if (!processed) {
      window.scrollBy(0, 600);
      await sleep(2000);
    }
  }
}

deleteTwitterRepliesAndPosts();
