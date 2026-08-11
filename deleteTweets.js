async function deleteTwitterPostsSmart() {
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  window.stopDeleting = false;
  let deletedCount = 0;
  let scrollAttempts = 0;
  
  // Ermittle deinen Benutzernamen automatisch aus der URL (z. B. von deiner Profilseite)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const profileUser = pathParts[0] && !['home', 'explore', 'notifications', 'messages', 'bookmarks', 'lists', 'settings'].includes(pathParts[0].toLowerCase()) ? pathParts[0] : null;

  console.log("🚀 Starte Twitter/X Lösch-Skript mit Vorab-Check...");
  if (profileUser) {
    console.log(`👤 Erkanntes Profil: @${profileUser} (Fremde Tweets im Thread werden direkt übersprungen).`);
  }
  console.log("💡 Tipp: Zum Abbrechen tippe `window.stopDeleting = true` in die Konsole.");

  while (!window.stopDeleting) {
    const tweets = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
    
    if (tweets.length === 0) {
      console.log("📜 Keine Tweets im sichtbaren Bereich. Lade ältere Beiträge nach...");
      window.scrollBy(0, 1200);
      await sleep(2500);
      
      scrollAttempts++;
      if (scrollAttempts > 10) {
        console.log("🏁 Ende der Timeline erreicht. Skript beendet.");
        break;
      }
      continue;
    }

    scrollAttempts = 0;
    let processed = false;

    for (const tweet of tweets) {
      if (window.stopDeleting) {
        console.log("🛑 Skript durch Benutzer gestoppt.");
        return;
      }
      
      if (!document.body.contains(tweet)) continue;

      // VORAB-CHECK: Gehört dieser Tweet wirklich dir? 
      // (Verhindert das Öffnen von Menüs bei fremden Parent-Tweets im Antworten-Reiter)
      if (profileUser) {
        const userLink = tweet.querySelector('[data-testid="User-Name"] a[role="link"]');
        if (userLink) {
          const href = userLink.getAttribute('href') || '';
          if (!href.toLowerCase().includes(profileUser.toLowerCase())) {
            // Das ist ein fremder Tweet (z.B. der Post, auf den du geantwortet hast) -> direkt weg damit!
            tweet.remove();
            continue;
          }
        }
      }

      // Finde den Menü-Button
      const moreBtn = tweet.querySelector('[data-testid="caret"], [aria-label="More"], [aria-label="Mehr"]');
      if (!moreBtn) {
        tweet.remove();
        continue;
      }

      moreBtn.click();
      await sleep(350);

      const menuItems = Array.from(document.querySelectorAll('[role="menuitem"]'));
      const deleteBtn = menuItems.find(item => {
        const text = item.textContent.toLowerCase();
        return text.includes('delete') || text.includes('löschen');
      });

      if (!deleteBtn) {
        document.body.click(); // Menü schließen
        await sleep(200);
        tweet.remove();
        continue;
      }

      // Löschen-Button ausführen
      deleteBtn.click();
      await sleep(350);

      // Bestätigen
      const confirmBtn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
      if (confirmBtn) {
        confirmBtn.click();
        deletedCount++;
        console.log(`🗑️ Fortschritt: ${deletedCount} Beiträge erfolgreich gelöscht.`);
      } else {
        document.body.click();
      }

      processed = true;
      await sleep(1000); 
      break; // Schleife abbrechen und DOM neu einlesen lassen
    }

    if (!processed && !window.stopDeleting) {
      window.scrollBy(0, 800);
      await sleep(1500);
    }
  }
}

deleteTwitterPostsSmart();
