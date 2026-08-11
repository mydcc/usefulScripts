async function radicalClearSessions() {
  const closeMenus = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.body.click();
  };

  const waitForElement = (selector, timeout = 3000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        let elements = Array.from(document.querySelectorAll(selector));
        if (elements.length > 0) {
          clearInterval(interval);
          resolve(elements[elements.length - 1]);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(new Error(`Timeout`));
        }
      }, 200);
    });
  };

  console.log("Starte Modus (mit korrigierter Archiv- und Lösch-Logik)...");
  let fehlerZaehler = 0;

  while (true) {
    let buttons = document.querySelectorAll("swebot-task-options button.task-options-button");
    
    if (buttons.length === 0) {
      console.log("🎉 Keine Sessions mehr gefunden! Alles erledigt.");
      break;
    }

    let targetButton = buttons[buttons.length - 1];
    
    try {
      targetButton.click();
      await new Promise(r => setTimeout(r, 800));

      let panes = document.querySelectorAll('.cdk-overlay-pane');
      if (panes.length === 0) throw new Error("Menü hat sich nicht geöffnet.");
      
      let activePane = panes[panes.length - 1];
      let menuBtns = Array.from(activePane.querySelectorAll('button'));
      
      // 1. Suche nach LÖSCHEN (Höchste Priorität!)
      let deleteBtn = menuBtns.find(b => b.textContent.toLowerCase().includes('delete') || b.textContent.toLowerCase().includes('löschen'));
      
      // 2. Suche nach ARCHIVIEREN (schließt "aufheben" / "unarchive" / "wiederherstellen" explizit aus)
      let archiveBtn = menuBtns.find(b => {
        let t = b.textContent.toLowerCase();
        if (t.includes('unarchive') || t.includes('aufheben') || t.includes('wiederherstellen')) return false;
        return t.includes('archive') || t.includes('archiv');
      });

      // WICHTIG: Wenn LÖSCHEN verfügbar ist, IMMER zuerst löschen!
      if (deleteBtn) {
        console.log(`[${buttons.length} übrig] Aktion: Lösche Session...`);
        deleteBtn.click();
        let confirmBtn = await waitForElement('swebot-delete-dialog .delete-button, swebot-delete-dialog button:last-of-type', 3000);
        confirmBtn.click();
        await new Promise(r => setTimeout(r, 1500));
        fehlerZaehler = 0;
        continue; 
      }

      // Wenn Löschen NICHT da ist, aber Archivieren verfügbar ist
      if (archiveBtn) {
        console.log(`[${buttons.length} übrig] Aktion: Archiviere Session...`);
        archiveBtn.click();
        await new Promise(r => setTimeout(r, 2000)); 
        fehlerZaehler = 0;
        continue; 
      }

      throw new Error("Weder gültiges Archive noch Delete in diesem Menü gefunden.");

    } catch (err) {
      console.warn(`Fehler bei diesem Element: ${err.message}`);
      closeMenus();
      fehlerZaehler++;
      
      if (fehlerZaehler > 1) {
          console.log("Element scheint blockiert zu sein. Überspringe es visuell...");
          let container = targetButton.closest('swebot-task-tile') || targetButton.closest('swebot-task-options');
          if (container) container.remove();
          fehlerZaehler = 0;
      }
      
      await new Promise(r => setTimeout(r, 1500));
    }
  }
}

radicalClearSessions();
