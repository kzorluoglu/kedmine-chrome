import redmineApiService from "./services/redmineApiService";
import timerService from "./services/timerService";

function getCurrentTab() {
  // Return a new Promise
  return new Promise((resolve, reject) => {
    chrome.windows.getCurrent(w => {
      if (chrome.runtime.lastError) {
        // Reject the Promise with an error if there's a problem
        reject(new Error(chrome.runtime.lastError));
        return;
      }
      chrome.tabs.query({active: true, windowId: w.id}, tabs => {
        if (chrome.runtime.lastError) {
          // Reject the Promise with an error if there's a problem
          reject(new Error(chrome.runtime.lastError));
          return;
        }
        // Resolve the Promise with the tab information
        resolve(tabs[0]);
      });
    });
  });
}

chrome.commands.onCommand.addListener(async function (command) {
  if (command === "create_new_timer_command") {
    try {
      // Await the result of getCurrentTab
      let tab = await getCurrentTab();
      // chrome.runtime.sendMessage({action: "create-new-timer", tab: tab});
      const issueIdMatch = tab.url.match(/\/issues\/(\d+)/);
      if (issueIdMatch) {
        const issueId = issueIdMatch[1];
        // const title = tab.title;
        const issue = await fetchIssueDetailsInBackground(issueId);

        await timerService.createTimer(issue)
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
});


async function fetchIssueDetailsInBackground(issueId) {
  const settings = await redmineApiService.getSettings();

  try {
    const response = await fetch(`${settings.redmineURL}/issues/${issueId}.json`, {
      method: 'GET',
      headers: await redmineApiService.getHeaders(), // Assume you have a method to get headers for fetch
    });

    if (!response.ok) {
      console.error(`Error fetching the details for issue ${issueId}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.issue;

  } catch (error) {
    console.error(`There was an error fetching the details for issue ${issueId}:`, error);
    return null;
  }
}

// CSV to Redmine Table Convert
let contextMenuInfo = null;

chrome.contextMenus.removeAll(() => {
  // Now create the new menu item
  chrome.contextMenus.create({
    id: "convertCSVToRedmineTable",
    title: "CSV to Redmine Table",
    contexts: ["all"],
    // other properties as needed
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  contextMenuInfo = info;  // Store the click info
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getContextMenuInfo') {
    sendResponse({info: contextMenuInfo});
    contextMenuInfo = null;  // Clear the stored info
  }
});
