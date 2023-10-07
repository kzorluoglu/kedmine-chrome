chrome.commands.onCommand.addListener(async function (command) {
  if (command === "create_new_timer_command") {
    chrome.runtime.sendMessage({action: "create-new-timer"});

    let tab = await getCurrentTab();
    console.log(tab);
  }
});


async function getCurrentTab() {
  let queryOptions = {active: true, lastFocusedWindow: true};
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
