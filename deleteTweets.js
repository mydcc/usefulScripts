async function deleteTwitterPosts() {
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  console.log("Starte Twitter/X Lösch-Skript...");

  let safetyCounter = 0;

  while (true) {
    // Finde alle sichtbaren Tweets auf der Profilseite
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    
    if (tweets.length === 0) {
      console.log("Keine Tweets sichtbar. Scrolle nach unten, um mehr zu laden...");
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(2500);
      
      safetyCounter++;
      if (safetyCounter > 5) {
        console.log("Keine weiteren Tweets mehr gefunden. Skript beendet.");
        break;
      }
      continue;
    }

    safetyCounter = 0;

    // Nimm den ersten Tweet in der Liste
    const tweet = tweets[0];
    
    // Finde den "Mehr"-Button (drei Punkte) im Tweet
    const moreBtn = tweet.querySelector('[data-testid="caret"], [aria-label="More"], [aria-label="Mehr"]');
    if (!moreBtn) {
      console.log("Konnte Menü-Button nicht finden. Entferne Tweet temporär aus der Ansicht...");
      tweet.style.display = 'none';
      continue;
    }

    moreBtn.click();
    await sleep(600);

    // Finde den "Löschen"-Eintrag im erscheinenden Menü
    const menuItems = Array.from(document.querySelectorAll('[role="menuitem"]'));
    const deleteBtn = menuItems.find(item => {
      const text = item.textContent.toLowerCase();
      return text.includes('delete') || text.includes('löschen');
    });

    if (!deleteBtn) {
      console.log("Keine Löschen-Option (möglicherweise ein Retweet oder angepinnt). Schließe Menü...");
      document.body.click();
      await sleep(500);
      tweet.style.display = 'none'; // Ausblenden, damit das Skript nicht hängenbleibt
      continue;
    }

    deleteBtn.click();
    await sleep(600);

    // Bestätigungs-Dialog im Modal anklicken
    const confirmBtn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
    if (confirmBtn) {
      confirmBtn.click();
      console.log("Tweet erfolgreich gelöscht.");
    } else {
      console.log("Bestätigungs-Button nicht gefunden, breche ab.");
      document.body.click();
    }

    // Kurze Pause, damit X die Timeline aktualisieren kann
    await sleep(1500);
  }
}

deleteTwitterPosts();
